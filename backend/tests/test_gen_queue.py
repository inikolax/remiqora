"""Self-contained test of the server-side generation queue (app/gen_queue.py, app/api/routes_jobs.py).

Runs with plain Python (`python tests/test_gen_queue.py` from backend/) or under pytest. Nothing real is touched:
REMIQORA_DATA_DIR points at a fresh temp folder before any app module is imported, the engines are an
httpx.MockTransport, and the orchestrator's switch_to / stop_active are fakes, so no engine process is ever started
or stopped.
"""
from __future__ import annotations

import asyncio
import base64
import json
import os
import shutil
import sys
import tempfile
from pathlib import Path

_TMP = Path(tempfile.mkdtemp(prefix="remiqora-queue-test-"))
os.environ["REMIQORA_DATA_DIR"] = str(_TMP / "data")
os.environ["REMIQORA_LOG_DIR"] = str(_TMP / "logs")
os.environ["ACE_STEP_OFFLOAD_DIT"] = "false"  # no nvidia-smi probe at import
for _k in ("ACE_STEP_DEVICE", "YUE2_DEVICE", "STABLE_AUDIO_DEVICE"):
    os.environ.pop(_k, None)
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import httpx  # noqa: E402
from fastapi import FastAPI  # noqa: E402

from app import assistant, db, gen_queue  # noqa: E402
from app.api.routes_jobs import router as jobs_router  # noqa: E402
from app.api.routes_orchestrator import router as orchestrator_router  # noqa: E402
from app.api.routes_tracks import router as tracks_router  # noqa: E402
from app.config import ALLOW_CONCURRENT_MODELS, DATA_DIR, MODELS  # noqa: E402
from app.orchestrator.manager import manager  # noqa: E402
from app.orchestrator.state import ModelStatus  # noqa: E402

assert Path(DATA_DIR).resolve() == (_TMP / "data").resolve(), DATA_DIR
assert str(db.DB_PATH).startswith(str(_TMP)), db.DB_PATH
assert not ALLOW_CONCURRENT_MODELS

YUE = MODELS["yue2"].proxy_target
ACE = MODELS["ace_step"].proxy_target
SA3 = MODELS["stable_audio"].proxy_target
WAV = b"RIFF fake wav bytes"


# ---------------------------------------------------------------- fakes

class FakeEngines:
    """Answers the three engines' HTTP APIs and records every request."""

    def __init__(self) -> None:
        self.calls: list[tuple[str, str, httpx.Request, bytes]] = []
        self.yue_block: asyncio.Event | None = None  # set -> /v1/tasks/run waits on it
        self.ace_polls_until_done = 2
        self.ace_hold = False  # keep reporting "running" until cancel_task
        self.ace_cancelled = False
        self.ace_poll_count = 0
        self.lora_fail_first = True
        self.lora_loaded: dict[str, str] = {}  # adapter name -> path, as ACE-Step keeps them
        self.sa3_polls_until_done = 1
        self.sa3_poll_count = 0
        self.sa3_hold = False
        self.sa3_cancelled = False
        self.sa3_jobs: dict[str, dict] = {}  # job id -> its form fields

    def find(self, method: str, url_part: str) -> list[tuple[httpx.Request, bytes]]:
        return [(r, b) for m, u, r, b in self.calls if m == method and url_part in u]

    async def handler(self, request: httpx.Request) -> httpx.Response:
        body = await request.aread()
        url = str(request.url)
        self.calls.append((request.method, url, request, body))
        path = request.url.path
        if url.startswith(YUE):
            if path == "/v1/models/load":
                return httpx.Response(200, json={"ok": True})
            if path == "/v1/tasks/run":
                if self.yue_block is not None:
                    await self.yue_block.wait()
                payload = json.loads(body)
                return httpx.Response(200, json={
                    "audio": base64.b64encode(WAV + str(payload["request"]["seed"]).encode()).decode(),
                    "artifacts": [{"id": "plan", "meta": {"format": "abc"}, "payload": base64.b64encode("X:1\nT:тест".encode()).decode()}],
                    "timing": {"wall_ms": 1234.0, "audio_duration_ms": 30000.0},
                })
        if url.startswith(ACE):
            if path == "/v1/lora/load":
                lb = json.loads(body)
                lp = lb["lora_path"]
                if self.lora_fail_first and not lp.endswith("/adapter"):
                    return httpx.Response(500, json={"detail": "no adapter_config.json"})
                name = lb.get("adapter_name") or lp.rstrip("/").rsplit("/", 1)[-1]
                if name in self.lora_loaded:  # what ACE-Step's add_lora answers
                    return httpx.Response(400, json={"detail": f"❌ Adapter name already in use: {name}."})
                self.lora_loaded[name] = lp
                return httpx.Response(200, json={"data": {"message": "ok"}, "code": 200})
            if path == "/v1/lora/unload":
                self.lora_loaded.clear()
                return httpx.Response(200, json={"data": {}, "code": 200})
            if path == "/v1/lora/status":
                return httpx.Response(200, json={"data": {"lora_loaded": bool(self.lora_loaded), "scales": {n: 1.0 for n in self.lora_loaded},
                                                          "adapters": list(self.lora_loaded)}, "code": 200})
            if path == "/v1/lora/scale":
                if not 0.0 <= json.loads(body)["scale"] <= 1.0:
                    return httpx.Response(422, json={"detail": "scale must be within 0..1"})
                return httpx.Response(200, json={"data": {}, "code": 200})
            if path == "/release_task":
                return httpx.Response(200, json={"data": {"task_id": "ace-1", "status": "queued", "queue_position": 1}, "code": 200})
            if path == "/cancel_task":
                self.ace_cancelled = True
                return httpx.Response(200, json={"data": {}, "code": 200})
            if path == "/query_result":
                self.ace_poll_count += 1
                if self.ace_cancelled:
                    entry = {"task_id": "ace-1", "status": 2, "result": json.dumps([{"error": "Cancelled by user"}])}
                elif self.ace_hold or self.ace_poll_count < self.ace_polls_until_done:
                    entry = {"task_id": "ace-1", "status": 0, "result": json.dumps([{"stage": "diffusion", "progress": 0.4}])}
                else:
                    entry = {"task_id": "ace-1", "status": 1, "result": json.dumps([
                        {"file": "/v1/audio?path=a.mp3", "metas": {"duration": 12.5}, "seed_value": "11,22"},
                        {"file": "/v1/audio?path=b.mp3", "metas": {"duration": 12.5}, "seed_value": "11,22"},
                    ])}
                return httpx.Response(200, json={"data": [entry], "code": 200})
            if path == "/v1/audio":
                return httpx.Response(200, content=b"ID3 fake mp3 " + request.url.params["path"].encode())
        if url.startswith(SA3):
            if path == "/v1/jobs":
                jid = f"sa-{len(self.sa3_jobs) + 1}"
                self.sa3_jobs[jid] = {n: v for n, v, _ in form_fields(request, body)}
                self.sa3_poll_count = 0
                return httpx.Response(200, json={"job_id": jid, "queue_position": 0, "status": "queued"})
            if path == "/v1/jobs/query":
                self.sa3_poll_count += 1
                jid = json.loads(body)["ids"][0]
                if self.sa3_cancelled:
                    st = {"job_id": jid, "status": "cancelled", "stage": "cancelled", "progress": 10, "files": [], "durations": [], "error": None, "seed": None}
                elif self.sa3_hold or self.sa3_poll_count < self.sa3_polls_until_done:
                    st = {"job_id": jid, "status": "running", "stage": "sampling", "progress": 50, "files": [], "durations": [], "error": None, "seed": None}
                else:
                    batch = int(self.sa3_jobs[jid].get("batch_size", "1"))
                    seed = int(self.sa3_jobs[jid].get("seed", "-1"))
                    st = {"job_id": jid, "status": "done", "stage": "done", "progress": 100,
                          "files": [f"/v1/files/{jid}_{k}.wav" for k in range(batch)], "durations": [5.5 + k for k in range(batch)],
                          "error": None, "seed": seed if seed >= 0 else 777}
                return httpx.Response(200, json=[st])
            if path.startswith("/v1/jobs/") and path.endswith("/cancel"):
                self.sa3_cancelled = True
                return httpx.Response(200, json={"ok": True})
            if path.startswith("/v1/files/"):
                return httpx.Response(200, content=WAV + path.encode())
        return httpx.Response(404, json={"error": f"fake engine: no route {request.method} {url}"})


switch_calls: list[str] = []
stop_calls: list[str] = []


async def fake_switch_to(model_id: str) -> None:
    switch_calls.append(model_id)
    await asyncio.sleep(0)
    for mid, rs in manager.state.models.items():
        if mid != model_id and rs.status == ModelStatus.RUNNING:
            rs.status = ModelStatus.STOPPED
    manager.state.models[model_id].status = ModelStatus.RUNNING
    manager.state.models[model_id].error_message = None
    manager.state.active_model = model_id


async def fake_stop_active() -> None:
    stop_calls.append(manager.state.active_model or "")
    raise AssertionError("stop_active must not be reached in this test")


def install_fakes() -> FakeEngines:
    engines = FakeEngines()
    gen_queue._client = httpx.AsyncClient(transport=httpx.MockTransport(engines.handler), timeout=None)
    manager.switch_to = fake_switch_to  # type: ignore[method-assign]
    manager.stop_active = fake_stop_active  # type: ignore[method-assign]
    gen_queue.features.has_yue2 = lambda: True
    gen_queue.features.has_ace_step = lambda: True
    gen_queue.features.has_stable_audio = lambda: True
    gen_queue.ACE_POLL_S = 0.01
    gen_queue.SA3_POLL_S = 0.01
    return engines


def make_app() -> FastAPI:
    app = FastAPI()
    app.include_router(orchestrator_router)
    app.include_router(tracks_router)
    app.include_router(jobs_router)
    return app


async def wait_for(pred, timeout: float = 5.0, what: str = "condition") -> None:
    loop = asyncio.get_running_loop()
    end = loop.time() + timeout
    while not pred():
        if loop.time() > end:
            raise AssertionError(f"timed out waiting for {what}")
        await asyncio.sleep(0.01)


def status_of(job_id: int) -> str:
    return db.get_job(job_id)["status"]


def form_fields(req: httpx.Request, body: bytes) -> list[tuple[str, str | bytes, str | None]]:
    """(name, value, filename) of a multipart body, in order."""
    ctype = req.headers["content-type"]
    assert ctype.startswith("multipart/form-data"), ctype
    boundary = ctype.split("boundary=")[1].encode()
    out = []
    for part in body.split(b"--" + boundary)[1:-1]:
        head, _, value = part.strip(b"\r\n").partition(b"\r\n\r\n")
        disp = [h for h in head.split(b"\r\n") if h.lower().startswith(b"content-disposition")][0].decode()
        name = disp.split('name="')[1].split('"')[0]
        filename = disp.split('filename="')[1].split('"')[0] if 'filename="' in disp else None
        out.append((name, value if filename else value.decode(), filename))
    return out


# ---------------------------------------------------------------- the test

async def run_all() -> None:
    engines = install_fakes()
    app = make_app()
    q = gen_queue.queue
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # -- POST /api/tracks still behaves as before (through track_store.store_track)
        r = await client.post("/api/tracks", data={"model": "yue2", "title": "Hello world", "lyrics": "la", "seed": "5", "params": '{"a": 1}', "abc": "X:1"},
                              files={"audio": ("track.wav", b"RIFFdata", "audio/wav")})
        assert r.status_code == 200, r.text
        t = r.json()
        assert t["model"] == "yue2" and t["seed"] == 5 and t["params"] == {"a": 1} and t["abc_url"] and t["filename"].endswith("_Hello_world.wav")
        assert Path(db.get_track(t["id"])["audio_path"]).read_bytes() == b"RIFFdata"
        r = await client.post("/api/tracks", data={"model": "nope"}, files={"audio": ("x.wav", b"x", "audio/wav")})
        assert r.status_code == 400

        # -- bad specs -> 400, unknown id -> 404
        for bad in [None, "not json", json.dumps({"engine": "x", "batch": [{}]}), json.dumps({"engine": "yue2", "batch": []}),
                    json.dumps({"engine": "ace_step", "batch": [{"request": {}, "save": {}}, {"request": {}, "save": {}}]}),
                    json.dumps({"engine": "yue2", "batch": [{"request": {"precision": "fp8"}, "save": {}}]}),
                    json.dumps({"engine": "stable_audio", "batch": [{"request": {}, "save": {}, "takes": 0}]})]:
            r = await client.post("/api/jobs", data={} if bad is None else {"spec": bad})
            assert r.status_code == 400 and "detail" in r.json(), (bad, r.status_code, r.text)
        assert (await client.get("/api/jobs/9999")).status_code == 404
        assert (await client.post("/api/jobs/9999/cancel")).status_code == 404
        assert (await client.delete("/api/jobs/9999")).status_code == 404

        # -- submit a YuE2 batch with the worker stopped -> queued rows sharing a batch id
        yue_params = {"cot": "off", "precision": "q4_0", "style": "pop", "lyrics": "[verse] hi"}
        spec = {"engine": "yue2", "batch": [
            {"request": {"lyrics": "[verse] hi", "seed": 10 + i, "options": {"style": "pop", "cot": "off"}, "precision": "q4_0"},
             "takes": 1, "save": {"title": "Pop song", "lyrics": "[verse] hi", "style": "pop", "params": yue_params}}
            for i in range(2)
        ]}
        r = await client.post("/api/jobs", data={"spec": json.dumps(spec)})
        assert r.status_code == 200, r.text
        yjobs = r.json()["jobs"]
        assert [j["status"] for j in yjobs] == ["queued", "queued"]
        assert yjobs[0]["batch_id"] == yjobs[1]["batch_id"] and [j["batch_index"] for j in yjobs] == [0, 1]
        assert yjobs[0]["title"] == "Pop song" and yjobs[0]["tracks"] == [] and yjobs[0]["request"]["precision"] == "q4_0"
        assert yjobs[0]["created_at"].endswith("Z") and yjobs[0]["started_at"] is None

        # -- the worker runs them, starting YuE2 itself
        q.start()
        await wait_for(lambda: all(status_of(j["id"]) == "done" for j in yjobs), what="yue2 jobs")
        assert switch_calls == ["yue2"], switch_calls
        loads = engines.find("POST", "/v1/models/load")
        assert len(loads) == 2
        load_body = json.loads(loads[0][1])
        assert load_body["session_options"] == {"yue2.model_gguf": "yue2-3b-q4_0.gguf"} and load_body["load_options"] == {}
        assert load_body["id"] == "yue2" and load_body["family"] == "yue2" and load_body["task"] == "gen"
        runs = engines.find("POST", "/v1/tasks/run")
        assert json.loads(runs[0][1]) == {"model": "yue2", "request": {"lyrics": "[verse] hi", "seed": 10, "options": {"style": "pop", "cot": "off"}}}
        j0 = (await client.get(f"/api/jobs/{yjobs[0]['id']}")).json()
        assert j0["status"] == "done" and j0["progress"] == 1.0 and j0["finished_at"] and len(j0["tracks"]) == 1
        tr = j0["tracks"][0]
        assert tr["model"] == "yue2" and tr["seed"] == 10 and tr["wall_ms"] == 1234.0 and tr["duration_ms"] == 30000.0
        assert tr["params"] == yue_params and tr["title"] == "Pop song" and tr["lyrics"] == "[verse] hi"
        assert tr["audio_url"] == f"/api/tracks/{tr['id']}/audio" and tr["abc_url"]
        assert Path(db.get_track(tr["id"])["abc_path"]).read_text(encoding="utf-8") == "X:1\nT:тест"
        assert Path(db.get_track(tr["id"])["audio_path"]).read_bytes() == WAV + b"10"

        # -- ACE-Step with reference audio and a LoRA: multipart release_task, poll, two takes saved
        ace_req = {"prompt": "rock", "lyrics": "[chorus] yeah", "batch_size": 2, "audio_format": "mp3", "task_type": "cover",
                   "audio_cover_strength": 0.5, "use_random_seed": True, "track_classes": ["drums", "bass"], "thinking": False, "inference_steps": 8}
        ace_save = {"title": "Rock", "lyrics": "[chorus] yeah", "style": "rock", "params": dict(ace_req), "lora": {"path": "E:/loras/gigi", "name": "gigi", "scale": 0.8}}
        r = await client.post("/api/jobs", data={"spec": json.dumps({"engine": "ace_step", "batch": [{"request": ace_req, "takes": 2, "save": ace_save}]})},
                              files={"audio": ("my song.flac", b"fLaC ref", "audio/flac")})
        assert r.status_code == 200, r.text
        ace_job = r.json()["jobs"][0]
        ref = db.get_job(ace_job["id"])["ref_path"]
        assert ref and Path(ref).name == "ref.flac" and str(Path(ref)).startswith(str(_TMP))
        await wait_for(lambda: status_of(ace_job["id"]) in db.JOB_FINISHED, what="ace job")
        aj = (await client.get(f"/api/jobs/{ace_job['id']}")).json()
        assert aj["status"] == "done", aj
        assert switch_calls == ["yue2", "ace_step"]
        lora_paths = [json.loads(b)["lora_path"] for _, b in engines.find("POST", "/v1/lora/load")]
        assert lora_paths == ["E:/loras/gigi", "E:/loras/gigi/adapter"], lora_paths
        assert json.loads(engines.find("POST", "/v1/lora/load")[1][1])["adapter_name"] == "gigi"
        assert json.loads(engines.find("POST", "/v1/lora/scale")[0][1]) == {"scale": 0.8}
        (rel_req, rel_body), = engines.find("POST", "/release_task")
        fields = form_fields(rel_req, rel_body)
        fd = {n: v for n, v, _ in fields}
        assert fd["prompt"] == "rock" and fd["batch_size"] == "2" and fd["use_random_seed"] == "true" and fd["thinking"] == "false"
        # one field per class: ACE-Step collects repeated fields into a list (one JSON string would be one class)
        assert [v for n, v, _ in fields if n == "track_classes"] == ["drums", "bass"] and fd["audio_cover_strength"] == "0.5"
        assert [(n, f) for n, _, f in fields if f] == [("ctx_audio", "ref.flac")] and fd["ctx_audio"] == b"fLaC ref"
        assert json.loads(engines.find("POST", "/query_result")[0][1]) == {"task_id_list": ["ace-1"]}
        assert len(aj["tracks"]) == 2 and all(t["model"] == "ace_step" and t["duration_ms"] == 12500.0 for t in aj["tracks"])
        assert [t["seed"] for t in aj["tracks"]] == [11, 22], "each take keeps its own seed from seed_value"
        assert aj["tracks"][0]["filename"].endswith(".mp3") and aj["tracks"][0]["params"] == ace_req and aj["tracks"][0]["title"] == "Rock"
        assert not Path(ref).exists() and not gen_queue.job_dir(ace_job["id"]).exists(), "reference audio left behind"
        assert engines.lora_loaded == {"gigi": "E:/loras/gigi/adapter"}

        async def ace_job_with(lora_key: dict, request: dict | None = None) -> dict:
            engines.ace_poll_count = 0
            body = {"request": request or {"prompt": "jazz", "batch_size": 1}, "takes": 1, "save": {"title": "Jazz", "params": {}, **lora_key}}
            r = await client.post("/api/jobs", data={"spec": json.dumps({"engine": "ace_step", "batch": [body]})})
            j = r.json()["jobs"][0]
            await wait_for(lambda: status_of(j["id"]) in db.JOB_FINISHED, what="ace job")
            return dict(db.get_job(j["id"]))

        # -- the same LoRA again: not loaded a second time ("Adapter name already in use"), only its scale is set (clamped to 0..1)
        loads, unloads = len(engines.find("POST", "/v1/lora/load")), len(engines.find("POST", "/v1/lora/unload"))
        row = await ace_job_with({"lora": {"path": "E:/loras/gigi", "name": "gigi", "scale": 1.5}})
        assert row["status"] == "done", row
        assert len(engines.find("POST", "/v1/lora/load")) == loads and len(engines.find("POST", "/v1/lora/unload")) == unloads
        assert json.loads(engines.find("POST", "/v1/lora/scale")[-1][1]) == {"scale": 1.0}
        # -- another LoRA: the first is unloaded, not stacked under it
        engines.lora_fail_first = False
        row = await ace_job_with({"lora": {"path": "E:/loras/kino", "name": "kino", "scale": 0.5}})
        assert row["status"] == "done", row
        assert len(engines.find("POST", "/v1/lora/unload")) == unloads + 1 and engines.lora_loaded == {"kino": "E:/loras/kino"}

        # -- ACE-Step without audio: JSON release_task (lists stay JSON arrays); no 'lora' key unloads what is on
        row = await ace_job_with({}, {"prompt": "jazz", "batch_size": 1, "track_classes": ["drums"]})
        assert row["status"] == "done", row
        rel = engines.find("POST", "/release_task")[-1]
        assert rel[0].headers["content-type"] == "application/json" and json.loads(rel[1]) == {"prompt": "jazz", "batch_size": 1, "track_classes": ["drums"]}
        assert engines.lora_loaded == {} and len(engines.find("POST", "/v1/lora/unload")) == unloads + 2
        # nothing on: no unload call either
        row = await ace_job_with({"lora": None})
        assert row["status"] == "done" and len(engines.find("POST", "/v1/lora/unload")) == unloads + 2

        # -- Stable Audio: repeated fields, context.wav, two takes with per-take prompt/title/seed/index
        sa_req = {"task": "inpaint", "model": "medium", "prompt": ["drum loop", "bass loop"], "duration": 10, "steps": 8, "cfg_scale": 1, "seed": -1,
                  "batch_size": 2, "mask_start": [2.5], "mask_end": [4], "chunked_decode": True}
        sa_save = {"title": "", "lyrics": "", "style": "", "titles": ["Drums", ""], "prompts": ["drum loop", "bass loop"],
                   "params": {"task": "inpaint", "kind": "music", "model": "medium", "prompt": "loops", "batch_size": 2}}
        r = await client.post("/api/jobs", data={"spec": json.dumps({"engine": "stable_audio", "batch": [{"request": sa_req, "takes": 2, "save": sa_save}]})},
                              files={"audio": ("ref.wav", b"RIFF ref", "audio/wav")})
        sa_job = r.json()["jobs"][0]
        await wait_for(lambda: status_of(sa_job["id"]) in db.JOB_FINISHED, what="sa3 job")
        sj = (await client.get(f"/api/jobs/{sa_job['id']}")).json()
        assert sj["status"] == "done" and sj["error"] is None, sj
        # the batch of two runs as two jobs of one variant each, seeds base and base+1, each with its own prompt
        subs = engines.find("POST", "/v1/jobs")
        assert len([s for s in subs if s[0].url.path == "/v1/jobs"]) == 2
        f0, f1 = (form_fields(rq, b) for rq, b in subs if rq.url.path == "/v1/jobs")
        assert [v for n, v, _ in f0 if n == "prompt"] == ["drum loop"] and [v for n, v, _ in f1 if n == "prompt"] == ["bass loop"]
        d0, d1 = dict((n, v) for n, v, _ in f0), dict((n, v) for n, v, _ in f1)
        assert d0["batch_size"] == d1["batch_size"] == "1"
        s0 = int(d0["seed"])
        assert 0 <= s0 and int(d1["seed"]) == s0 + 1, "seed -1: one base seed drawn by the backend, +1 per variant"
        for fields in (f0, f1):
            assert [v for n, v, _ in fields if n in ("mask_start", "mask_end")] == ["2.5", "4"]
            assert dict((n, v) for n, v, _ in fields)["chunked_decode"] == "true"
            assert [(n, f) for n, _, f in fields if f] == [("audio", "context.wav")]
        t0, t1 = sj["tracks"]
        assert (t0["title"], t1["title"]) == ("Drums", "bass loop")
        assert t0["params"] == {**sa_save["params"], "prompt": "drum loop", "seed": s0, "index": 0}
        assert t1["params"]["prompt"] == "bass loop" and t1["params"]["index"] == 1 and (t0["seed"], t1["seed"]) == (s0, s0 + 1)
        assert t0["duration_ms"] == 5500 and t1["duration_ms"] == 5500 and t0["wall_ms"] is not None and t0["lyrics"] == ""
        assert switch_calls[-1] == "stable_audio"

        # -- a given seed and one prompt for the batch: seeds 40, 41, 42; a single take keeps its request as it is
        r = await client.post("/api/jobs", data={"spec": json.dumps({"engine": "stable_audio", "batch": [
            {"request": {"prompt": "pad", "seed": 40, "batch_size": 3}, "takes": 3, "save": {"title": "Pad", "params": {}}}]})})
        sj3 = r.json()["jobs"][0]
        await wait_for(lambda: status_of(sj3["id"]) in db.JOB_FINISHED, what="sa3 seeded batch")
        got = (await client.get(f"/api/jobs/{sj3['id']}")).json()
        assert got["status"] == "done" and [t["seed"] for t in got["tracks"]] == [40, 41, 42], got
        assert all(engines.sa3_jobs[k]["prompt"] == "pad" for k in list(engines.sa3_jobs)[-3:])
        r = await client.post("/api/jobs", data={"spec": json.dumps({"engine": "stable_audio", "batch": [
            {"request": {"prompt": "hit", "seed": -1, "batch_size": 1}, "takes": 1, "save": {"title": "Hit", "params": {}}}]})})
        sj1 = r.json()["jobs"][0]
        await wait_for(lambda: status_of(sj1["id"]) in db.JOB_FINISHED, what="sa3 single")
        last = engines.sa3_jobs[list(engines.sa3_jobs)[-1]]
        assert last["seed"] == "-1" and (await client.get(f"/api/jobs/{sj1['id']}")).json()["tracks"][0]["seed"] == 777

        # -- cancel a queued job (worker stopped so it stays queued); its reference audio goes
        await q.stop()
        r = await client.post("/api/jobs", data={"spec": json.dumps({"engine": "stable_audio", "batch": [{"request": {"prompt": "x"}, "takes": 1, "save": {"title": "x"}}]})},
                              files={"audio": ("a.wav", b"RIFF", "audio/wav")})
        qj = r.json()["jobs"][0]
        assert gen_queue.job_dir(qj["id"]).exists()
        r = await client.post(f"/api/jobs/{qj['id']}/cancel")
        assert r.status_code == 200 and r.json()["status"] == "cancelled" and r.json()["finished_at"]
        assert not gen_queue.job_dir(qj["id"]).exists()

        # -- cancel a running ACE job: cancel_task, the poll reports "Cancelled by user"
        q.start()
        engines.ace_hold, engines.ace_cancelled, engines.ace_poll_count = True, False, 0
        r = await client.post("/api/jobs", data={"spec": json.dumps({"engine": "ace_step", "batch": [{"request": {"prompt": "slow"}, "takes": 1, "save": {"title": "slow"}}]})})
        cj = r.json()["jobs"][0]
        await wait_for(lambda: engines.ace_poll_count >= 2, what="ace polling")
        assert status_of(cj["id"]) == "running" and db.get_job(cj["id"])["stage"] == "diffusion" and db.get_job(cj["id"])["progress"] == 0.4

        # -- the guards while a job runs
        r = await client.post("/api/orchestrator/switch", json={"model": "yue2"})
        assert r.status_code == 409 and "cancel the take" in r.json()["detail"], r.text
        r = await client.post("/api/orchestrator/stop")
        assert r.status_code == 409, r.text
        r = await client.post("/api/orchestrator/switch", json={"model": "ace_step"})
        assert r.status_code == 200, "switching to the engine that already runs the job changes nothing"
        try:
            await assistant.server._free_gpu_for_assistant()
        except assistant.GpuBusy:
            pass
        else:
            raise AssertionError("the assistant took the GPU from a running job")
        assert stop_calls == []

        r = await client.post(f"/api/jobs/{cj['id']}/cancel")
        assert r.status_code == 200
        await wait_for(lambda: status_of(cj["id"]) in db.JOB_FINISHED, what="ace cancel")
        assert status_of(cj["id"]) == "cancelled" and engines.ace_cancelled
        engines.ace_hold = engines.ace_cancelled = False

        # -- cancel a running YuE2 job: the HTTP call is dropped
        engines.yue_block = asyncio.Event()
        r = await client.post("/api/jobs", data={"spec": json.dumps({"engine": "yue2", "batch": [{"request": {"lyrics": "x", "seed": 1, "options": {}, "precision": "q8_0"}, "takes": 1, "save": {"title": "y", "params": {}}}]})})
        yj = r.json()["jobs"][0]
        await wait_for(lambda: db.get_job(yj["id"])["stage"] == "generating", what="yue2 generating")
        assert json.loads(engines.find("POST", "/v1/models/load")[-1][1])["session_options"] == {}
        r = await client.post(f"/api/jobs/{yj['id']}/cancel")
        await wait_for(lambda: status_of(yj["id"]) == "cancelled", what="yue2 cancel")
        assert q.running_engine() is None and db.get_job(yj["id"])["track_ids_json"] == "[]"

        # -- the engine dies mid-job -> failed "engine stopped"
        engines.yue_block = None
        engines.ace_hold, engines.ace_poll_count = True, 0
        r = await client.post("/api/jobs", data={"spec": json.dumps({"engine": "ace_step", "batch": [{"request": {"prompt": "z"}, "takes": 1, "save": {"title": "z"}}]})})
        dj = r.json()["jobs"][0]
        await wait_for(lambda: engines.ace_poll_count >= 1, what="ace polling 2")
        manager.state.models["ace_step"].status = ModelStatus.ERROR
        manager.state.models["ace_step"].error_message = "CUDA out of memory"
        manager.state.active_model = None
        await wait_for(lambda: status_of(dj["id"]) in db.JOB_FINISHED, what="engine stopped")
        assert db.get_job(dj["id"])["status"] == "failed" and db.get_job(dj["id"])["error"].startswith("engine stopped"), dict(db.get_job(dj["id"]))
        engines.ace_hold = False

        # -- a backend shutdown mid-job leaves it running; the next start requeues it once, then it fails "interrupted"
        engines.yue_block = asyncio.Event()
        r = await client.post("/api/jobs", data={"spec": json.dumps({"engine": "yue2", "batch": [{"request": {"lyrics": "x", "seed": 2, "options": {}}, "takes": 1, "save": {"title": "r", "params": {}}}]})},
                              files={"audio": ("k.wav", b"RIFF", "audio/wav")})
        rj = r.json()["jobs"][0]
        await wait_for(lambda: db.get_job(rj["id"])["stage"] == "generating", what="yue2 generating 2")
        await q.stop()
        assert status_of(rj["id"]) == "running" and gen_queue.job_dir(rj["id"]).exists(), "shutdown must keep the job and its reference"
        gen_queue.recover()
        row = db.get_job(rj["id"])
        assert row["status"] == "queued" and row["attempts"] == 1 and row["started_at"] is None
        db.mark_job_running(rj["id"])  # pretend it ran again and was interrupted again
        gen_queue.recover()
        row = db.get_job(rj["id"])
        assert row["status"] == "failed" and row["error"] == "interrupted" and row["attempts"] == 2
        assert not gen_queue.job_dir(rj["id"]).exists(), "recover removes the reference of an ended job"
        # a job being cancelled when the backend went down ends as cancelled; an orphan folder goes
        r = await client.post("/api/jobs", data={"spec": json.dumps({"engine": "yue2", "batch": [{"request": {"seed": 3}, "takes": 1, "save": {"title": "c"}}]})})
        kj = r.json()["jobs"][0]
        db.mark_job_running(kj["id"])
        db.update_job(kj["id"], cancel_requested=1)
        (gen_queue.JOBS_DIR / "424242").mkdir(parents=True)
        gen_queue.recover()
        assert status_of(kj["id"]) == "cancelled" and not (gen_queue.JOBS_DIR / "424242").exists()
        engines.yue_block = None

        # -- a job that had saved some takes before the restart is not run again (no duplicates): part saved -> failed
        #    with a note, the saved takes kept; all saved -> done
        r = await client.post("/api/jobs", data={"spec": json.dumps({"engine": "ace_step", "batch": [{"request": {"prompt": "p"}, "takes": 3, "save": {"title": "p"}}]})})
        pj = r.json()["jobs"][0]
        db.mark_job_running(pj["id"])
        db.append_job_track(pj["id"], t["id"])
        r = await client.post("/api/jobs", data={"spec": json.dumps({"engine": "yue2", "batch": [{"request": {"seed": 6}, "takes": 1, "save": {"title": "s"}}]})})
        fj = r.json()["jobs"][0]
        db.mark_job_running(fj["id"])
        db.append_job_track(fj["id"], t["id"])
        assert db.recover_jobs() == (0, [pj["id"], fj["id"]])
        row = db.get_job(pj["id"])
        assert row["status"] == "failed" and "1 of 3" in row["error"] and json.loads(row["track_ids_json"]) == [t["id"]] and row["finished_at"]
        row = db.get_job(fj["id"])
        assert row["status"] == "done" and row["error"] is None and row["progress"] == 1.0
        pjd = (await client.get(f"/api/jobs/{pj['id']}")).json()
        assert [x["id"] for x in pjd["tracks"]] == [t["id"]]

        # -- a requeued job runs to the end after the restart
        r = await client.post("/api/jobs", data={"spec": json.dumps({"engine": "yue2", "batch": [{"request": {"lyrics": "x", "seed": 4, "options": {}}, "takes": 1, "save": {"title": "again", "params": {}}}]})})
        aj2 = r.json()["jobs"][0]
        db.mark_job_running(aj2["id"])
        gen_queue.recover()
        q.start()
        await wait_for(lambda: status_of(aj2["id"]) == "done", what="requeued job")

        # -- GET /api/jobs: active + recent finished, not dismissed, newest first; old ones drop out
        await q.stop()
        r = await client.post("/api/jobs", data={"spec": json.dumps({"engine": "yue2", "batch": [{"request": {"seed": 5}, "takes": 1, "save": {"title": "waiting"}}]})})
        wj = r.json()["jobs"][0]
        db.update_job(yjobs[1]["id"], finished_at="2000-01-01T00:00:00Z")
        listed = (await client.get("/api/jobs")).json()["jobs"]
        ids = [j["id"] for j in listed]
        assert ids == sorted(ids, reverse=True) and ids[0] == wj["id"]
        assert yjobs[1]["id"] not in ids and yjobs[0]["id"] in ids and sa_job["id"] in ids and dj["id"] in ids
        track_ids = [t["id"] for t in next(j for j in listed if j["id"] == sa_job["id"])["tracks"]]
        r = await client.delete(f"/api/jobs/{sa_job['id']}")
        assert r.json() == {"ok": True}
        ids = [j["id"] for j in (await client.get("/api/jobs")).json()["jobs"]]
        assert sa_job["id"] not in ids and all(db.get_track(t) is not None for t in track_ids), "dismiss must keep the tracks"
        # dismissing a queued job cancels it
        r = await client.delete(f"/api/jobs/{wj['id']}")
        assert status_of(wj["id"]) == "cancelled" and wj["id"] not in [j["id"] for j in (await client.get("/api/jobs")).json()["jobs"]]
        # a deleted track drops out of its job
        db.delete_track(track_ids[0])
        assert len((await client.get(f"/api/jobs/{sa_job['id']}")).json()["tracks"]) == 1

    await q.stop()
    await gen_queue._client.aclose()


def test_gen_queue() -> None:
    try:
        asyncio.run(run_all())
    finally:
        if db._db is not None:
            db._db.close()
            db._db = None
        shutil.rmtree(_TMP, ignore_errors=True)


if __name__ == "__main__":
    test_gen_queue()
    print("test_gen_queue: all checks passed")
