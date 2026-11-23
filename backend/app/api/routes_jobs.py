"""The server-side generation queue's API (app/gen_queue.py): submit, list, cancel and dismiss jobs.

POST /api/jobs takes a multipart form: `spec` (JSON) and an optional `audio` file, the reference audio for the whole
batch. spec = {"engine": "yue2" | "ace_step" | "stable_audio", "batch": [{"request", "takes", "save"}, ...]}: YuE2 one
entry per seed (the rows share a batch_id), ACE-Step and Stable Audio exactly one entry.
Optional `make_cover: true` (on the spec, an entry or its request; default false): when the song is done, one cover
job is queued for all its takes (gen_queue.enqueue_song_cover). It is kept as save.make_cover, never sent to the engine.
"""
from __future__ import annotations

import json
import re
import time
import uuid
from typing import Any, Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from .. import db, gen_queue
from ..gen_queue import queue
from .routes_tracks import _row_to_dict, check_upload_size

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

MAX_BATCH = 100
MAX_TAKES = 64
# what ACE-Step may be asked to write (and the library stores: track_store.ALLOWED_AUDIO_EXT)
ACE_AUDIO_FORMATS = ("wav", "mp3", "flac")


def _job_dict(row, marks: Optional[dict[int, list[int]]] = None, tags: Optional[dict[int, list[str]]] = None) -> dict[str, Any]:
    if marks is None:
        marks = db.collection_ids_by_track()
    if tags is None:
        tags = db.tags_by_track()
    tracks = []
    for tid in json.loads(row["track_ids_json"] or "[]"):
        t = db.get_track(tid)
        # A take in the trash is gone from the job too (it disappears from Create like from the library).
        if t is not None and t["deleted_at"] is None:
            tracks.append(_row_to_dict(t, marks, tags))
    return {
        "id": row["id"],
        "engine": row["engine"],
        "status": row["status"],
        "batch_id": row["batch_id"],
        "batch_index": row["batch_index"],
        "takes": row["takes"],
        "title": row["title"],
        "stage": row["stage"],
        "progress": row["progress"],
        "error": row["error"],
        "created_at": row["created_at"],
        "started_at": row["started_at"],
        "finished_at": row["finished_at"],
        "request": json.loads(row["request_json"] or "{}"),
        "save": json.loads(row["save_json"] or "{}"),
        "tracks": tracks,
    }


def _bad(detail: str) -> HTTPException:
    return HTTPException(status_code=400, detail=detail)


def _parse_spec(raw: Optional[str]) -> tuple[str, list[dict[str, Any]]]:
    if not raw:
        raise _bad("the form field 'spec' is missing")
    try:
        spec = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise _bad(f"spec is not valid JSON: {exc}") from exc
    if not isinstance(spec, dict):
        raise _bad("spec must be an object")
    engine = spec.get("engine")
    if engine not in gen_queue.ENGINES:
        raise _bad(f"engine must be one of {list(gen_queue.ENGINES)}")
    batch = spec.get("batch")
    if not isinstance(batch, list) or not batch:
        raise _bad("batch must be a non-empty list")
    if engine != "yue2" and len(batch) != 1:
        raise _bad(f"{engine} takes exactly one batch entry")
    if len(batch) > MAX_BATCH:
        raise _bad(f"at most {MAX_BATCH} batch entries")
    make_cover = spec.get("make_cover", False)
    if not isinstance(make_cover, bool):
        raise _bad("make_cover must be true or false")
    entries = []
    for i, entry in enumerate(batch):
        if not isinstance(entry, dict):
            raise _bad(f"batch[{i}] must be an object")
        request, save = entry.get("request"), entry.get("save")
        if not isinstance(request, dict):
            raise _bad(f"batch[{i}].request must be an object")
        if not isinstance(save, dict):
            raise _bad(f"batch[{i}].save must be an object")
        # make_cover: spec-wide, or on an entry / its request. Kept in `save` (the backend's own part of a job), never
        # in the request: that body goes to the engine as it is.
        request, save = dict(request), dict(save)
        wanted = make_cover
        for where, src in (("", entry), (".request", request), (".save", save)):
            if "make_cover" in src:
                val = src["make_cover"] if src is entry else src.pop("make_cover")
                if not isinstance(val, bool):
                    raise _bad(f"batch[{i}]{where}.make_cover must be true or false")
                wanted = wanted or val
        if wanted:
            save["make_cover"] = True
        takes = entry.get("takes", 1)
        if isinstance(takes, bool) or not isinstance(takes, int) or not 1 <= takes <= MAX_TAKES:
            raise _bad(f"batch[{i}].takes must be a whole number from 1 to {MAX_TAKES}")
        title = save.get("title", "")
        if not isinstance(title, str):
            raise _bad(f"batch[{i}].save.title must be a string")
        if save.get("params") is not None and not isinstance(save["params"], dict):
            raise _bad(f"batch[{i}].save.params must be an object")
        for key in ("titles", "prompts"):
            if save.get(key) is not None and not isinstance(save[key], list):
                raise _bad(f"batch[{i}].save.{key} must be a list")
        lora = save.get("lora")
        if lora is not None and not (isinstance(lora, dict) and isinstance(lora.get("path"), str)):
            raise _bad(f"batch[{i}].save.lora must be null or an object with a path")
        if engine == "ace_step" and request.get("audio_format") not in (None, *ACE_AUDIO_FORMATS):
            raise _bad(f"batch[{i}].request.audio_format must be one of {list(ACE_AUDIO_FORMATS)}")
        if engine == "yue2" and request.get("precision") not in (None, *gen_queue.YUE2_PRECISIONS):
            raise _bad(f"batch[{i}].request.precision must be one of {list(gen_queue.YUE2_PRECISIONS)}")
        entries.append({"request": request, "save": save, "takes": takes, "title": title})
    return engine, entries


@router.post("")
async def submit(spec: Optional[str] = Form(None), audio: Optional[UploadFile] = File(None)):
    engine, entries = _parse_spec(spec)
    ref: Optional[tuple[bytes, str]] = None
    if audio is not None and audio.filename is not None:
        check_upload_size(audio)
        data = await audio.read()
        if data:
            ext = (audio.filename or "").rsplit(".", 1)[-1].lower() if "." in (audio.filename or "") else ""
            ref = (data, ext if re.fullmatch(r"[a-z0-9]{1,8}", ext) else "wav")
    ids = db.insert_jobs(engine, uuid.uuid4().hex, entries)
    if ref is not None:
        try:
            for job_id in ids:
                db.update_job(job_id, ref_path=str(gen_queue.save_ref(job_id, *ref)))
        except OSError as exc:
            for job_id in ids:
                db.cancel_queued_job(job_id)
                gen_queue.remove_ref(job_id)
            raise HTTPException(status_code=500, detail=f"could not store the reference audio: {exc}") from exc
    queue.wake()
    marks = db.collection_ids_by_track()
    tags = db.tags_by_track()
    return {"jobs": [_job_dict(db.get_job(i), marks, tags) for i in ids]}


@router.get("")
async def list_jobs():
    since = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() - 24 * 3600))
    marks = db.collection_ids_by_track()
    tags = db.tags_by_track()
    return {"jobs": [_job_dict(r, marks, tags) for r in db.list_jobs_for_view(since)]}


@router.get("/{job_id}")
async def get_job(job_id: int):
    row = db.get_job(job_id)
    if row is None:
        raise HTTPException(status_code=404, detail="job not found")
    return _job_dict(row)


@router.post("/{job_id}/cancel")
async def cancel_job(job_id: int):
    row = await queue.cancel(job_id)
    if row is None:
        raise HTTPException(status_code=404, detail="job not found")
    return _job_dict(row)


@router.delete("/{job_id}")
async def dismiss_job(job_id: int):
    """Hides the job from the list; an unfinished one is cancelled first. The saved takes stay in the library."""
    row = db.get_job(job_id)
    if row is None:
        raise HTTPException(status_code=404, detail="job not found")
    if row["status"] in db.JOB_ACTIVE:
        row = await queue.cancel(job_id)
    db.update_job(job_id, dismissed=1)
    if row["status"] not in db.JOB_ACTIVE:
        gen_queue.remove_ref(job_id)
    return {"ok": True}
