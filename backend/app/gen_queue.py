"""The server-side generation queue: the takes made from the three Create forms (YuE2, ACE-Step, Stable Audio 3),
and album covers for tracks (engine "cover", made by POST /api/covers: one job per track, see app/covers.py; or one
job per song after a generation submitted with make_cover, for all its takes: enqueue_song_cover).

The page submits a job (POST /api/jobs) and only shows its state; the backend runs the jobs one at a time, oldest
first, calls the engine with exactly the body the form built, and saves every finished take into the library itself
(app/track_store.py). A page reload, a closed window or a second tab loses nothing.

* The worker starts the engine a job needs (manager.switch_to), which also moves the prompt assistant off the GPU.
  While a job runs, the orchestrator's switch/stop routes and the assistant's GPU start refuse (409).
* Cancel: a queued job just ends. A running ACE-Step, Stable Audio or cover job is cancelled on the engine and the poll
  reports the end. A running YuE2 job drops its HTTP call: audio.cpp has no cancel route, so the GPU work runs to its
  end and the next YuE2 job waits behind it.
* A backend restart (dev.bat --reload restarts on every backend edit; shutdown stops the engines) puts a job that was
  running back into the queue once; the second time it fails as "interrupted". A job that had already saved some
  takes is not run again (that would save them twice): it ends with what it saved (db.recover_jobs).
* Reference audio sent with a job lives in DATA_DIR/jobs/<id>/ until the job ends or is dismissed.
"""
from __future__ import annotations

import asyncio
import base64
import contextlib
import json
import logging
import random
import re
import shutil
import time
import uuid
from pathlib import Path
from typing import Any, Optional

import httpx

from . import covers, db, features, song_title, track_store
from .config import DATA_DIR, MODELS, yue2_specs
from .orchestrator.manager import manager
from .orchestrator.process import StartCancelled
from .orchestrator.state import ModelStatus

log = logging.getLogger("gen_queue")

# What POST /api/jobs takes; cover jobs come from POST /api/covers (routes_covers.py).
ENGINES = ("yue2", "ace_step", "stable_audio")
COVER_ENGINE = "cover"
YUE2_PRECISIONS = ("q8_0", "q4_0", "bf16")
JOBS_DIR = DATA_DIR / "jobs"

ACE_POLL_S = 2.0
# No stage at all this long after the submit: ACE-Step no longer knows the task (its job store does not survive a
# restart), not that it is still queued. Same rule the page used.
ACE_STALE_S = 5 * 60
SA3_POLL_S = 1.5
# The Stable Audio server drops ids it does not know from a query answer.
SA3_MISSING_S = 60
COVER_POLL_S = 0.5
# sd-server answers 404/410 for a job it no longer knows (restarted, or past --completed-ttl-seconds).
COVER_MISSING_S = 30
# sd-server preloads nothing heavy before it listens (the weights load on the first request), so "ready" comes
# within seconds; this only bounds a server that hangs in "loading".
COVER_READY_S = 300

# Generation is one long request (YuE2) or a long poll; a read timeout would abandon a job that is fine.
_client = httpx.AsyncClient(timeout=None)


class JobError(Exception):
    """The job failed; the message is shown on the take."""


class JobCancelled(Exception):
    """The engine reported the job as cancelled."""


# ---------------------------------------------------------------- helpers

def job_dir(job_id: int) -> Path:
    return JOBS_DIR / str(job_id)


def remove_ref(job_id: int) -> None:
    shutil.rmtree(job_dir(job_id), ignore_errors=True)


def save_ref(job_id: int, data: bytes, ext: str) -> Path:
    d = job_dir(job_id)
    d.mkdir(parents=True, exist_ok=True)
    path = d / f"ref.{ext}"
    path.write_bytes(data)
    return path


def _installed_error(engine: str) -> Optional[str]:
    if engine == "yue2" and not features.has_yue2():
        return "YuE2 is not installed"
    if engine == "ace_step" and not features.has_ace_step():
        return "ACE-Step is not installed"
    if engine == "stable_audio" and not features.has_stable_audio():
        return "Stable Audio 3 weights are not downloaded" if features.has_stable_audio_env() else "Stable Audio 3 is not installed"
    if engine == "cover" and not features.has_cover():
        return "the cover engine (sd-server + Z-Image-Turbo) is not installed"
    return None


def _engine_stopped(engine: str) -> Optional[str]:
    rs = manager.state.models[engine]
    if rs.status == ModelStatus.RUNNING:
        return None
    return f"engine stopped ({rs.error_message})" if rs.error_message else "engine stopped"


def _check_alive(engine: str) -> None:
    msg = _engine_stopped(engine)
    if msg:
        raise JobError(msg)


def _error_text(resp: httpx.Response) -> str:
    """The same reading of an error body as the page's apiFetch (api/http.ts)."""
    try:
        data = resp.json()
    except ValueError:
        return resp.reason_phrase or f"HTTP {resp.status_code}"
    if isinstance(data, dict):
        if isinstance(data.get("error"), str):
            return data["error"]
        if isinstance(data.get("detail"), str):
            return data["detail"]
        if isinstance(data.get("error"), dict) and isinstance(data["error"].get("message"), str):
            return data["error"]["message"]
    return json.dumps(data, ensure_ascii=False)


async def _call(method: str, url: str, **kwargs: Any) -> httpx.Response:
    resp = await _client.request(method, url, **kwargs)
    if resp.status_code >= 400:
        raise JobError(_error_text(resp))
    return resp


def _ace_unwrap(payload: Any) -> Any:
    """ACE-Step wraps answers in {data, code, error}; failures may come inside a 200."""
    if isinstance(payload, dict) and "data" in payload and "code" in payload:
        code = payload.get("code")
        if isinstance(code, int) and code >= 400:
            raise JobError(payload.get("error") or f"ACE-Step error {code}")
        return payload["data"]
    return payload


def _form_value(value: Any) -> str:
    """What the page's FormData.append(key, String(value)) sent."""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return str(value)


def _form_fields(request: dict) -> list:
    """Multipart fields of a request body. A list goes as one field per item: the engines collect repeated fields
    into a list, while one field holding a JSON string would reach them as a single text; an empty list sends nothing."""
    fields: list = []
    for k, v in request.items():
        if v is None:
            continue
        if isinstance(v, list):
            fields.extend((k, (None, _form_value(x))) for x in v)
        else:
            fields.append((k, (None, _form_value(v))))
    return fields


def _int_or_none(value: Any) -> Optional[int]:
    try:
        return int(str(value).strip())
    except (TypeError, ValueError):
        return None


def abc_from_result(result: dict) -> str:
    """Port of abcFromResult (frontend api/yue2.ts): the plan is the text, or an abc/score artifact in base64."""
    text = result.get("text")
    if isinstance(text, str) and text.strip():
        return text
    for artifact in result.get("artifacts") or []:
        if not isinstance(artifact, dict):
            continue
        meta = artifact.get("meta") or {}
        fmt = str(meta.get("format") or meta.get("extension") or artifact.get("id") or "")
        payload = artifact.get("payload")
        if re.search(r"abc|score", fmt, re.I) and isinstance(payload, str):
            try:
                raw = base64.b64decode("".join(payload.split()), validate=True)
            except ValueError:
                return payload
            try:
                return raw.decode("utf-8")
            except UnicodeDecodeError:
                return raw.decode("latin-1")
    return ""


def _text_error(exc: BaseException) -> str:
    return str(exc) or exc.__class__.__name__


def _store_sync(job_id: int, kwargs: dict[str, Any]) -> int:
    row = track_store.store_track(**kwargs)
    db.append_job_track(job_id, row["id"])
    return row["id"]


async def _store(job_id: int, **kwargs: Any) -> int:
    # The track and its link to the job are written together in the thread: a cancel or a shutdown that interrupts
    # the await cannot stop the thread, so a saved track is never left unlinked (recovery would make it again).
    return await asyncio.to_thread(_store_sync, job_id, kwargs)


# ---------------------------------------------------------------- the worker

class _Current:
    """The job the worker is on."""

    def __init__(self, row) -> None:
        self.id: int = row["id"]
        self.engine: str = row["engine"]
        self.task: Optional[asyncio.Task] = None
        self.cancel_requested = False
        self.engine_task_id: Optional[str] = None
        # engine | run | submitting | polling | saving: a cancel interrupts the task only where that is safe
        self.phase = "engine"


class GenQueue:
    def __init__(self) -> None:
        self._wake: Optional[asyncio.Event] = None
        self._worker: Optional[asyncio.Task] = None
        self._stopping = False
        self.current: Optional[_Current] = None
        # (LoRA path, adapter names) this queue last loaded on ACE-Step; see _apply_ace_lora
        self._ace_lora: Optional[tuple[str, frozenset]] = None

    # ---- lifecycle

    def start(self) -> None:
        if self._worker is not None:
            return
        self._stopping = False
        self._wake = asyncio.Event()
        recover()
        self._worker = asyncio.create_task(self._loop(), name="gen-queue")

    async def stop(self) -> None:
        """Before the engines are stopped: a running job stays 'running' in the database, so the next start puts it
        back into the queue (recover)."""
        self._stopping = True
        worker, self._worker = self._worker, None
        if worker is not None:
            worker.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await worker
        self.current = None

    def wake(self) -> None:
        if self._wake is not None:
            self._wake.set()

    def running_engine(self) -> Optional[str]:
        """The engine of the job being generated now (also while its engine starts), or None."""
        return self.current.engine if self.current is not None else None

    async def _loop(self) -> None:
        while True:
            self._wake.clear()
            row = db.next_queued_job()
            if row is None:
                await self._wake.wait()
                continue
            try:
                await self._run_one(row)
            except asyncio.CancelledError:
                raise
            except Exception as exc:  # noqa: BLE001 - the worker must keep running
                log.exception("generation job %s: internal error", row["id"])
                with contextlib.suppress(Exception):
                    db.finish_job(row["id"], "failed", f"internal error: {_text_error(exc)}")
                    remove_ref(row["id"])
                self.current = None

    async def _run_one(self, row) -> None:
        if not db.mark_job_running(row["id"]):
            return
        cur = self.current = _Current(row)
        cur.task = asyncio.create_task(self._execute(cur, db.get_job(cur.id)), name=f"gen-job-{cur.id}")
        status, error = "done", None
        try:
            # a runner returns a note for a take that is done but not complete (some audio missing)
            error = await cur.task
        except asyncio.CancelledError:
            if self._stopping:
                raise
            status = "cancelled"
        except JobCancelled:
            status = "cancelled"
        except JobError as exc:
            status, error = "failed", _text_error(exc)
        except Exception as exc:  # noqa: BLE001 - any failure is shown on the take
            log.exception("generation job %s failed", cur.id)
            status, error = "failed", _engine_stopped(cur.engine) or _text_error(exc)
        if status == "failed" and cur.cancel_requested:
            status, error = "cancelled", None
        db.finish_job(cur.id, status, error)
        remove_ref(cur.id)
        self.current = None
        log.info("generation job %s (%s): %s%s", cur.id, cur.engine, status, f" - {error}" if error else "")
        _song_cover_safely(cur.id)

    async def _execute(self, cur: _Current, row) -> Optional[str]:
        request = json.loads(row["request_json"] or "{}")
        save = json.loads(row["save_json"] or "{}")
        await self._ensure_engine(cur)
        self._check_cancel(cur)
        cur.phase = "run"
        return await _RUNNERS[cur.engine](self, cur, row, request, save)

    async def _ensure_engine(self, cur: _Current) -> None:
        engine = cur.engine
        rs = manager.state.models[engine]
        if rs.status == ModelStatus.RUNNING:
            return
        missing = _installed_error(engine)
        if missing:
            raise JobError(missing)
        db.update_job(cur.id, stage="starting engine", progress=None)
        try:
            # Shielded: cancelling a start half way would leave a process the manager does not know about.
            # A shutdown cancels the start through manager.stop_all() instead.
            await asyncio.shield(manager.switch_to(engine))
        except StartCancelled as exc:
            raise JobError("the engine start was cancelled") from exc
        except asyncio.CancelledError:
            raise
        except Exception as exc:  # noqa: BLE001 - the start failed; the manager has the reason
            raise JobError(rs.error_message or _text_error(exc)) from exc

    @staticmethod
    def _check_cancel(cur: _Current) -> None:
        if cur.cancel_requested:
            raise JobCancelled()

    # ---- cancel

    async def cancel(self, job_id: int) -> Optional[Any]:
        """Returns the job row after the request, None when there is no such job."""
        row = db.get_job(job_id)
        if row is None:
            return None
        if row["status"] == "queued":
            if db.cancel_queued_job(job_id):
                remove_ref(job_id)
                # the last unfinished seed of a YuE2 song: the takes made so far still get their cover
                _song_cover_safely(job_id)
        elif row["status"] == "running":
            db.update_job(job_id, cancel_requested=1)
            cur = self.current
            if cur is not None and cur.id == job_id:
                cur.cancel_requested = True
                if cur.engine_task_id:
                    await self._engine_cancel(cur)
                elif cur.phase in ("engine", "run") and cur.task is not None:
                    cur.task.cancel()
                # submitting / saving: the runner sees the flag at its next step
            else:
                # Running in the database but not on the worker (cannot normally happen): end it.
                db.finish_job(job_id, "cancelled")
                remove_ref(job_id)
        return db.get_job(job_id)

    async def _engine_cancel(self, cur: _Current) -> None:
        try:
            if cur.engine == "ace_step":
                await _call("POST", f"{MODELS['ace_step'].proxy_target}/cancel_task", json={"task_id": cur.engine_task_id})
            elif cur.engine == "stable_audio":
                await _call("POST", f"{MODELS['stable_audio'].proxy_target}/v1/jobs/{cur.engine_task_id}/cancel", json={})
            elif cur.engine == COVER_ENGINE:
                await _call("POST", f"{MODELS[COVER_ENGINE].proxy_target}/sdcpp/v1/jobs/{cur.engine_task_id}/cancel", json={})
        except Exception as exc:  # noqa: BLE001 - the poll reports the final state either way
            log.warning("cancel of %s task %s failed: %s", cur.engine, cur.engine_task_id, exc)

    # ---- runners

    async def _run_yue2(self, cur: _Current, row, request: dict, save: dict) -> None:
        """api/yue2.ts generateTrack: load with the precision's session options, then one long /v1/tasks/run."""
        base = MODELS["yue2"].proxy_target
        req = dict(request)
        precision = req.pop("precision", None) or "q8_0"
        if precision not in YUE2_PRECISIONS:
            raise JobError(f"unknown YuE2 precision '{precision}'")
        spec = yue2_specs()["yue2"]
        session = {} if precision == "q8_0" else {"yue2.model_gguf": f"yue2-3b-{precision}.gguf"}
        started = time.monotonic()
        db.update_job(cur.id, stage="loading model")
        await _call("POST", f"{base}/v1/models/load", json={
            "id": spec["id"],
            "path": spec["path"],
            "family": spec["family"],
            "task": spec["task"],
            "mode": spec["mode"],
            **({"model_spec_override": spec["model_spec_override"]} if spec.get("model_spec_override") else {}),
            "load_options": {},
            "session_options": session,
        })
        db.update_job(cur.id, stage="generating")
        result = (await _call("POST", f"{base}/v1/tasks/run", json={"model": spec["id"], "request": req})).json()
        if not isinstance(result, dict) or not isinstance(result.get("audio"), str):
            raise JobError("the server returned no audio")
        timing = result.get("timing") or {}
        wall_ms = timing.get("wall_ms")
        if wall_ms is None:
            wall_ms = (time.monotonic() - started) * 1000
        try:
            audio = base64.b64decode(result["audio"])
        except ValueError as exc:
            raise JobError("the server returned unreadable audio") from exc
        cur.phase = "saving"
        await _store(
            cur.id,
            model="yue2",
            title=save.get("title") or "",
            lyrics=save.get("lyrics", req.get("lyrics") or ""),
            seed=req.get("seed"),
            duration_ms=timing.get("audio_duration_ms"),
            wall_ms=wall_ms,
            params=save.get("params") or {"precision": precision},
            audio=audio,
            ext="wav",
            abc=abc_from_result(result) or None,
        )

    @staticmethod
    async def _ace_lora_status(base: str) -> Optional[dict]:
        """GET /v1/lora/status, or None when it cannot be read."""
        try:
            data = _ace_unwrap((await _call("GET", f"{base}/v1/lora/status")).json())
        except Exception:  # noqa: BLE001 - the caller then unloads to be safe
            return None
        return data if isinstance(data, dict) else None

    @staticmethod
    def _ace_lora_names(status: dict) -> frozenset:
        # `scales` holds the adapter names as loaded; `adapters` can be a synthetic "default" (LoKr)
        scales = status.get("scales")
        return frozenset(scales) if isinstance(scales, dict) else frozenset()

    async def _apply_ace_lora(self, base: str, lora: Optional[dict]) -> None:
        """Puts the job's LoRA on the engine, or none. ACE-Step answers "Adapter name already in use" to a second load
        of the same adapter and stacks a different one on top of the first, so the LoRA we loaded last stays (only
        its scale is set) and anything else is unloaded first. The status has no paths: which LoRA is on is
        remembered here, and checked against the adapter names the engine reports (an engine restart drops it)."""
        wanted = str(lora["path"]) if lora and lora.get("path") else None
        status = await self._ace_lora_status(base)
        loaded = status is None or bool(status.get("lora_loaded"))
        same = (wanted is not None and status is not None and loaded and self._ace_lora is not None
                and self._ace_lora == (wanted, self._ace_lora_names(status)))
        if not same:
            if loaded:
                self._ace_lora = None
                try:
                    _ace_unwrap((await _call("POST", f"{base}/v1/lora/unload", json={})).json())
                except Exception as exc:  # noqa: BLE001
                    if status is not None:  # it is on and stays on: the take would carry the wrong style
                        raise JobError(f"the LoRA on ACE-Step could not be unloaded: {_text_error(exc)}") from exc
            if wanted is None:
                return
            body_name = {"adapter_name": lora["name"]} if lora.get("name") else {}
            last: Optional[Exception] = None
            for candidate in (wanted, f"{wanted}/adapter", f"{wanted}/adapter/adapter"):
                try:
                    _ace_unwrap((await _call("POST", f"{base}/v1/lora/load", json={"lora_path": candidate, **body_name})).json())
                    last = None
                    break
                except Exception as exc:  # noqa: BLE001 - try the next nesting
                    last = exc
            if last is not None:
                raise JobError(f"the LoRA could not be loaded: {_text_error(last)}")
            after = await self._ace_lora_status(base)
            names = self._ace_lora_names(after) if after is not None else frozenset()
            self._ace_lora = (wanted, names) if names else None
        if lora.get("scale") is not None:
            try:
                scale = min(1.0, max(0.0, float(lora["scale"])))  # the engine takes 0..1 only
            except (TypeError, ValueError):
                scale = 1.0
            _ace_unwrap((await _call("POST", f"{base}/v1/lora/scale", json={"scale": scale})).json())

    async def _run_ace(self, cur: _Current, row, request: dict, save: dict) -> None:
        """api/aceStep.ts releaseTask + the store's poll (query_result) and _persistJob."""
        base = MODELS["ace_step"].proxy_target
        # A job without a LoRA (no key: the Idea page) gets none either, not what an earlier job left on the engine.
        if (save.get("lora") or {}).get("path"):
            db.update_job(cur.id, stage="loading LoRA")
        await self._apply_ace_lora(base, save.get("lora"))
        self._check_cancel(cur)
        cur.phase = "submitting"
        ref = Path(row["ref_path"]) if row["ref_path"] else None
        if ref is not None and ref.is_file():
            # track_classes is a list: one field per class (see _form_fields)
            fields = _form_fields(request)
            fields.append(("ctx_audio", (ref.name, ref.read_bytes(), "application/octet-stream")))
            resp = await _call("POST", f"{base}/release_task", files=fields)
        else:
            resp = await _call("POST", f"{base}/release_task", json=request)
        data = _ace_unwrap(resp.json())
        task_id = data.get("task_id") if isinstance(data, dict) else None
        if not task_id:
            raise JobError("ACE-Step did not return a task id")
        cur.engine_task_id = str(task_id)
        db.update_job(cur.id, engine_task_id=cur.engine_task_id, stage="queued", progress=0.0)
        cur.phase = "polling"
        if cur.cancel_requested:
            await self._engine_cancel(cur)
        released = time.monotonic()
        while True:
            await asyncio.sleep(ACE_POLL_S)
            _check_alive("ace_step")
            try:
                entries = _ace_unwrap((await _call("POST", f"{base}/query_result", json={"task_id_list": [cur.engine_task_id]})).json())
            except (httpx.HTTPError, JobError, ValueError):
                continue  # the page ignored a failed poll too
            entry = next((e for e in entries or [] if isinstance(e, dict) and str(e.get("task_id")) == cur.engine_task_id), None)
            parsed: list = []
            if entry is not None:
                try:
                    parsed = json.loads(entry.get("result") or "[]")
                except (TypeError, ValueError):
                    parsed = []
            if not isinstance(parsed, list):
                parsed = []
            first = parsed[0] if parsed and isinstance(parsed[0], dict) else {}
            status = entry.get("status") if entry is not None else None
            if status == 1:
                break
            if status == 2:
                if first.get("error") == "Cancelled by user":
                    raise JobCancelled()
                raise JobError(first.get("error") or "unknown error")
            if not first.get("stage") and time.monotonic() - released > ACE_STALE_S:
                raise JobError("ACE-Step no longer knows this task (was it restarted?)")
            progress = first.get("progress")
            db.update_job(cur.id, stage=first.get("stage") or "queued", progress=float(progress) if isinstance(progress, (int, float)) else 0.0)
        # the engine task is over: a cancel from here on (downloading / saving) must not be sent to ACE-Step for it
        cur.engine_task_id = None

        takes = [p for p in parsed if isinstance(p, dict) and p.get("file")]
        files = [p["file"] for p in takes]
        if not files:
            raise JobError("the server returned no audio")
        # Every entry carries the batch's seeds as "s1,s2,...", in the order of the files.
        seeds = [_int_or_none(s) for s in str(takes[0].get("seed_value") or "").split(",")]
        duration = (first.get("metas") or {}).get("duration")
        ext = request.get("audio_format") or "mp3"
        titles = save.get("titles") or []
        cur.phase = "saving"
        db.update_job(cur.id, stage="saving", progress=1.0)
        for i, file in enumerate(files):
            url = f"{base}{file if str(file).startswith('/') else '/' + str(file)}"
            audio = (await _call("GET", url)).content
            title = (titles[i] if i < len(titles) and titles[i] else save.get("title")) or ""
            lyrics = save.get("lyrics", request.get("lyrics") or "")
            params = dict(save.get("params") or {"model": request.get("model"), "audio_format": ext})
            if request.get("sample_mode"):
                # "Describe the music": ACE-Step wrote the style (caption) and the lyrics itself. Keep them, so the
                # take can be reused and its cover is drawn from that English style, and name the take by its
                # hook rather than by the start of the user's description.
                gen_caption = str(takes[i].get("prompt") or "").strip()
                gen_lyrics = str(takes[i].get("lyrics") or "").strip()
                if gen_caption:
                    params["prompt"] = gen_caption
                if gen_lyrics:
                    params["lyrics"] = gen_lyrics
                    lyrics = gen_lyrics
                    title = song_title.hook_title(gen_lyrics) or title
                metas = takes[i].get("metas") or {}
                for key in ("bpm", "keyscale", "timesignature"):
                    if metas.get(key) not in (None, "", "N/A"):
                        params.setdefault(key, metas[key])
            await _store(
                cur.id,
                model="ace_step",
                title=title,
                lyrics=lyrics,
                seed=seeds[i] if i < len(seeds) else None,
                duration_ms=duration * 1000 if isinstance(duration, (int, float)) else None,
                wall_ms=None,
                params=params,
                audio=audio,
                ext=ext,
            )

    async def _run_sa3(self, cur: _Current, row, request: dict, save: dict) -> Optional[str]:
        """api/stableAudio.ts submitJob + the store's poll (/v1/jobs/query) and _persist.

        The server draws a whole batch from one seed (one noise tensor for [batch, ...]), so variant 2 and on could
        not be made again from the seed they would be saved with. A batch therefore runs as one engine job per
        variant with seeds seed, seed+1, ... (a random seed is drawn here first), and each take keeps its own seed.
        Each variant is saved as soon as it is done, so a cancel keeps the finished ones."""
        base = MODELS["stable_audio"].proxy_target
        takes = max(1, int(row["takes"] or 1))
        params = save.get("params") or {}
        titles = save.get("titles") or []
        prompts = save.get("prompts") or []
        if not (isinstance(prompts, list) and len(prompts) == takes):
            prompts = []
        req_prompt = request.get("prompt")
        ref = Path(row["ref_path"]) if row["ref_path"] else None
        ref_bytes = ref.read_bytes() if ref is not None and ref.is_file() else None
        base_seed = _int_or_none(request.get("seed"))
        if takes > 1 and (base_seed is None or base_seed < 0):
            base_seed = random.randint(0, 2**31 - 1 - takes)

        def own(value: Any, i: int) -> Any:
            # one text per variant -> the variant's own; one text for the whole batch stays as it is
            return [value[i]] if isinstance(value, list) and len(value) == takes else value

        missing = 0
        for i in range(takes):
            self._check_cancel(cur)
            if takes > 1:
                variant = {**request, "batch_size": 1, "seed": base_seed + i,
                           "prompt": own(req_prompt, i), "negative_prompt": own(request.get("negative_prompt"), i)}
            else:
                variant = request
            fields = _form_fields(variant)
            if ref_bytes is not None:
                fields.append(("audio", ("context.wav", ref_bytes, "audio/wav")))
            started = time.monotonic()
            st = await self._sa3_job(cur, base, fields, i, takes)
            wall_ms = round((time.monotonic() - started) * 1000)
            files = st.get("files") or []
            durations = st.get("durations") or []
            seed = st.get("seed") if isinstance(st.get("seed"), int) else _int_or_none(variant.get("seed"))
            file = files[0] if files else None
            if not file:
                missing += 1
                continue
            if prompts:
                text = prompts[i]
            elif isinstance(params.get("prompt"), str):
                text = params["prompt"]
            elif isinstance(req_prompt, list):
                text = req_prompt[i] if i < len(req_prompt) else ""
            else:
                text = req_prompt or ""
            duration = durations[0] if durations else None
            cur.phase = "saving"
            db.update_job(cur.id, stage="saving", progress=(i + 1) / takes)
            audio = (await _call("GET", f"{base}{file if str(file).startswith('/') else '/' + str(file)}")).content
            await _store(
                cur.id,
                model="stable_audio",
                title=(titles[i] if i < len(titles) and titles[i] else None) or save.get("title") or text,
                lyrics="",
                seed=seed,
                duration_ms=round(duration * 1000) if isinstance(duration, (int, float)) else None,
                wall_ms=wall_ms,
                params={**params, "prompt": text, "seed": seed, "index": i},
                audio=audio,
                ext="wav",
            )
        if missing == takes:
            raise JobError("the server returned no audio")
        return f"{missing} of {takes} takes came back without audio" if missing else None

    async def _sa3_job(self, cur: _Current, base: str, fields: list, index: int, count: int) -> dict:
        """Submits one Stable Audio job and polls it to its end; returns its final state. Progress is this
        variant's share of the whole batch."""
        cur.phase = "submitting"
        created = (await _call("POST", f"{base}/v1/jobs", files=fields)).json()
        task_id = created.get("job_id") if isinstance(created, dict) else None
        if not task_id:
            raise JobError("Stable Audio did not return a job id")
        cur.engine_task_id = str(task_id)
        db.update_job(cur.id, engine_task_id=cur.engine_task_id, stage="queued", progress=index / count)
        cur.phase = "polling"
        if cur.cancel_requested:
            await self._engine_cancel(cur)
        last_seen = time.monotonic()
        while True:
            await asyncio.sleep(SA3_POLL_S)
            _check_alive("stable_audio")
            try:
                states = (await _call("POST", f"{base}/v1/jobs/query", json={"ids": [cur.engine_task_id]})).json()
            except (httpx.HTTPError, JobError, ValueError):
                continue
            st = next((s for s in states or [] if isinstance(s, dict) and str(s.get("job_id")) == cur.engine_task_id), None)
            if st is None:
                if time.monotonic() - last_seen > SA3_MISSING_S:
                    raise JobError("Stable Audio no longer knows this job (was it restarted?)")
                continue
            last_seen = time.monotonic()
            status = st.get("status")
            if status in ("queued", "running"):
                progress = st.get("progress")
                share = (progress / 100) if isinstance(progress, (int, float)) else 0.0
                db.update_job(cur.id, stage=st.get("stage") or status, progress=(index + share) / count)
                continue
            if status == "cancelled":
                raise JobCancelled()
            if status != "done":
                raise JobError(st.get("error") or "the server returned no audio")
            # finished: a cancel from here on reaches the runner through its flag, not this engine job
            cur.engine_task_id = None
            return st

    async def _cover_ready(self, cur: _Current, base: str) -> None:
        """Waits for sd-server's model state "ready" (the orchestrator's health check takes any answer)."""
        loop = asyncio.get_running_loop()
        end = loop.time() + COVER_READY_S
        while True:
            _check_alive(COVER_ENGINE)
            try:
                st = (await _call("GET", f"{base}/sdcpp/v1/models/status")).json()
            except (httpx.HTTPError, JobError, ValueError):
                st = {}
            state = st.get("state") if isinstance(st, dict) else None
            if state == "ready":
                return
            if state == "error":
                err = st.get("error")
                raise JobError(f"the cover model did not load: {err.get('message') if isinstance(err, dict) else err or 'unknown error'}")
            if loop.time() > end:
                raise JobError("the cover model did not get ready in time")
            self._check_cancel(cur)
            await asyncio.sleep(COVER_POLL_S)

    async def _run_cover(self, cur: _Current, row, request: dict, save: dict) -> Optional[str]:
        """One cover: sd-server's async /sdcpp/v1/img_gen, polled to its end (cancellable on the engine), then the PNG
        is saved as the track's cover (covers.save_cover) and the track is linked to the job."""
        base = MODELS[COVER_ENGINE].proxy_target
        track_id = _int_or_none(request.get("track_id"))
        # a song's automatic cover (enqueue_song_cover) goes to all its takes: the ones still there without a cover
        extra: list[int] = []
        if request.get("source_batch_id"):
            ids = [i for i in (_int_or_none(x) for x in request.get("track_ids") or [track_id]) if i is not None]
            left = [i for i in dict.fromkeys(ids) if (t := db.get_track(i)) is not None and t["deleted_at"] is None
                    and covers.cover_path(t) is None]
            if not left:
                return "every take already has a cover or was deleted"
            track_id, extra = left[0], left[1:]
        if track_id is None or db.get_track(track_id) is None:
            raise JobError("the track no longer exists")
        db.update_job(cur.id, stage="loading model")
        await self._cover_ready(cur, base)
        self._check_cancel(cur)
        cur.phase = "submitting"
        seed = _int_or_none(request.get("seed"))
        body = {
            "prompt": request.get("prompt") or covers.build_prompt(db.get_track(track_id)),
            "negative_prompt": "",
            "width": int(request.get("width") or covers.SIZE),
            "height": int(request.get("height") or covers.SIZE),
            "seed": seed if seed is not None else -1,
            "batch_count": 1,
            "sample_params": {"sample_steps": int(request.get("steps") or covers.STEPS), "guidance": {"txt_cfg": 1.0}},
            "embed_image_metadata": False,
            "output_format": "png",
        }
        created = (await _call("POST", f"{base}/sdcpp/v1/img_gen", json=body)).json()
        task_id = created.get("id") if isinstance(created, dict) else None
        if not task_id:
            raise JobError("the cover engine did not return a job id")
        cur.engine_task_id = str(task_id)
        db.update_job(cur.id, engine_task_id=cur.engine_task_id, stage="queued", progress=0.0)
        cur.phase = "polling"
        if cur.cancel_requested:
            await self._engine_cancel(cur)
        last_seen = time.monotonic()
        while True:
            await asyncio.sleep(COVER_POLL_S)
            _check_alive(COVER_ENGINE)
            try:
                st = (await _call("GET", f"{base}/sdcpp/v1/jobs/{cur.engine_task_id}")).json()
            except (httpx.HTTPError, JobError, ValueError):
                if time.monotonic() - last_seen > COVER_MISSING_S:
                    raise JobError("the cover engine no longer knows this job (was it restarted?)")
                continue
            if not isinstance(st, dict):
                continue
            last_seen = time.monotonic()
            status = st.get("status")
            if status in ("queued", "generating"):
                prog = st.get("progress") if isinstance(st.get("progress"), dict) else {}
                stage = prog.get("stage") or status
                done, total = prog.get("completed"), prog.get("total")
                if stage == "sampling" and isinstance(done, (int, float)) and isinstance(total, (int, float)) and total > 0:
                    share = 0.05 + 0.85 * done / total
                elif stage in ("vae_decode", "encoding"):
                    share = 0.92
                else:
                    share = 0.02 if stage in ("preparing", "conditioning") else 0.0
                db.update_job(cur.id, stage=stage, progress=share)
                continue
            if status == "cancelled":
                raise JobCancelled()
            if status != "completed":
                err = st.get("error")
                raise JobError((err.get("message") if isinstance(err, dict) else err) or "the cover engine returned no image")
            break
        cur.engine_task_id = None
        images = ((st.get("result") or {}).get("images") or []) if isinstance(st.get("result"), dict) else []
        b64 = images[0].get("b64_json") if images and isinstance(images[0], dict) else None
        if not isinstance(b64, str):
            raise JobError("the cover engine returned no image")
        try:
            png = base64.b64decode(b64)
        except ValueError as exc:
            raise JobError("the cover engine returned an unreadable image") from exc
        cur.phase = "saving"
        db.update_job(cur.id, stage="saving", progress=1.0)
        # Every take gets the picture; one that was deleted meanwhile or whose file could not be written is skipped
        # (the others still get it). The job fails only when not one take was saved.
        saved_any = False
        problems: list[str] = []
        for tid in [track_id, *extra]:
            try:
                if not await asyncio.to_thread(covers.save_cover, tid, png):
                    problems.append(f"take {tid} was deleted while its cover was made")
                    continue
            except (ValueError, OSError) as exc:
                log.warning("cover job %s: the cover of take %s was not saved: %s", cur.id, tid, exc)
                problems.append(str(exc))
                continue
            # the description it was drawn from: Another cover and the description editor start from it
            db.set_track_cover_prompt(tid, body["prompt"])
            db.append_job_track(cur.id, tid)
            saved_any = True
        if not saved_any:
            if not extra and problems and problems[0].endswith("was deleted while its cover was made"):
                raise JobError("the track was deleted while its cover was made")
            raise JobError("; ".join(dict.fromkeys(problems)) or "the cover was not saved")


_RUNNERS = {
    "yue2": GenQueue._run_yue2,
    "ace_step": GenQueue._run_ace,
    "stable_audio": GenQueue._run_sa3,
    COVER_ENGINE: GenQueue._run_cover,
}


def recover() -> None:
    """At start: jobs left running go back to the queue (or fail, see db.recover_jobs); reference audio of jobs that
    have ended or no longer exist is removed."""
    requeued, ended = db.recover_jobs()
    if requeued or ended:
        log.info("generation queue after restart: %d job(s) back in the queue, %d ended", requeued, len(ended))
    # A song job the restart ended (with its takes saved) would otherwise never get the cover it asked for: the
    # normal path queues it when the job finishes on the worker (_run_one), which did not happen for these.
    for job_id in ended:
        _song_cover_safely(job_id)
    if JOBS_DIR.is_dir():
        for d in JOBS_DIR.iterdir():
            row = db.get_job(int(d.name)) if d.name.isdigit() else None
            if row is None or row["status"] not in db.JOB_ACTIVE:
                shutil.rmtree(d, ignore_errors=True)


def _wants_cover(row) -> bool:
    if row["engine"] not in ENGINES:
        return False
    try:
        return json.loads(row["save_json"] or "{}").get("make_cover") is True
    except ValueError:
        return False


def _is_music(row) -> bool:
    """Stable Audio sound effects / samples (params.kind other than "music") get no cover; no kind means music."""
    if row["engine"] != "stable_audio":
        return True
    params = json.loads(row["save_json"] or "{}").get("params") or {}
    kind = params.get("kind") if isinstance(params, dict) else None
    return kind in (None, "", "music")


def enqueue_song_cover(job_id: int) -> Optional[int]:
    """After a generation job ends: when it asked for a cover (save.make_cover) and its song is complete (no job of
    its batch still queued or running: the YuE2 seeds of one submit are one song), queues ONE cover job for all the
    takes the batch's ended jobs saved (done, and cancelled / failed ones that stored takes first), at the end of the queue. Takes that already have a cover are left out. The
    cover job's request carries track_id (the take the prompt is built from), track_ids (all takes), source_job_id
    and source_batch_id. Returns the cover job's id, None when none was queued."""
    row = db.get_job(job_id)
    if row is None or not _wants_cover(row):
        return None
    batch = db.list_batch_jobs(row["batch_id"])
    if any(r["status"] in db.JOB_ACTIVE for r in batch):
        return None  # the last job of the song decides
    if db.cover_job_for_batch(row["batch_id"]) is not None:
        return None
    takes: list[int] = []
    source: Optional[int] = None
    for r in batch:
        # done, and also cancelled / failed jobs that saved takes before they ended (a YuE2 seed cancelled after its
        # take was stored, a restart that ended a job half way): their takes are in the library and get the cover
        if r["status"] not in ("done", "cancelled", "failed") or not _wants_cover(r) or not _is_music(r):
            continue
        for tid in json.loads(r["track_ids_json"] or "[]"):
            t = db.get_track(tid)
            if t is None or t["deleted_at"] is not None or covers.cover_path(t) is not None or tid in takes:
                continue
            takes.append(tid)
            source = source if source is not None else r["id"]
    if not takes:
        log.info("song job %s: no cover (no take without one)", job_id)
        return None
    if not covers.enabled():
        log.info("song job %s: no cover (covers are switched off)", job_id)
        return None
    if not features.has_cover():
        log.info("song job %s: no cover (the cover engine is not installed)", job_id)
        return None
    first = db.get_track(takes[0])
    request = {
        "track_id": takes[0],
        "track_ids": takes,
        # automatic, from the first take's style; the kept description of a take does not exist yet
        "prompt": covers.build_prompt(first, json.loads(first["params_json"] or "{}")),
        "width": covers.SIZE,
        "height": covers.SIZE,
        "steps": covers.STEPS,
        "seed": random.randint(0, 2**31 - 1),
        "source_job_id": source,
        "source_batch_id": row["batch_id"],
    }
    (cover_id,) = db.insert_jobs(COVER_ENGINE, uuid.uuid4().hex, [{"request": request, "save": {}, "takes": 1, "title": first["title"] or ""}])
    log.info("song job %s: cover job %s queued for take(s) %s", job_id, cover_id, takes)
    queue.wake()
    return cover_id


def _song_cover_safely(job_id: int) -> None:
    """enqueue_song_cover; a failure there never touches the song job."""
    try:
        enqueue_song_cover(job_id)
    except Exception:  # noqa: BLE001
        log.exception("song job %s: queuing its cover failed", job_id)


queue = GenQueue()
