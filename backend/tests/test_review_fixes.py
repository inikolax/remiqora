"""Fixes from the Nov 2026 backend review: SPA containment, Host/Origin checks, job objects, cancelled starts,
background tasks, cover saving, trash deletion, downloads, ffmpeg timeouts, proxy close, upload limits, cover_v.

Same fixtures as test_cover_after_generation.py / test_track_covers.py (imported, so the data dir is set up the
same way). No engine process is started; the Windows job-object test starts a short-lived Python child.
"""
from __future__ import annotations

import asyncio
import json
import os
import subprocess
import sys
import time
from pathlib import Path

import test_gen_queue  # noqa: F401  (must set REMIQORA_DATA_DIR before anything imports app)
from test_cover_after_generation import _finished_song, _wait, ace_spec, cover_jobs, env, run, submit  # noqa: F401
from test_track_covers import client, fresh_db, make_track, png_bytes  # noqa: F401

import httpx  # noqa: E402
import pytest  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app import bg, covers, db, features, gen_queue, stems, tagging  # noqa: E402
from app.api import routes_orchestrator, routes_proxy, routes_tracks  # noqa: E402
from app.config import ProcessSpec  # noqa: E402
from app.orchestrator import manager as manager_mod  # noqa: E402
from app.orchestrator import process as process_mod  # noqa: E402
from app.orchestrator.manager import OrchestratorManager  # noqa: E402
from app.orchestrator.process import StopFailed  # noqa: E402
from app.orchestrator.state import ModelStatus  # noqa: E402
from app.security import LocalOnlyMiddleware  # noqa: E402
from app.spa import mount_spa  # noqa: E402

IS_WINDOWS = sys.platform == "win32"


# ---------------------------------------------------------------- 1, 20: SPA fallback

@pytest.fixture()
def spa(tmp_path):
    dist = tmp_path / "dist"
    (dist / "assets").mkdir(parents=True)
    (dist / "index.html").write_text("<html>index</html>", encoding="utf-8")
    (dist / "assets" / "app.js").write_text("console.log(1)", encoding="utf-8")
    secret = tmp_path / "secret.txt"
    secret.write_text("TOP SECRET", encoding="utf-8")
    app = FastAPI()

    @app.get("/api/known")
    async def known():
        return {"ok": True}

    mount_spa(app, dist)
    with TestClient(app, base_url="http://127.0.0.1") as c:
        yield c, secret


def test_spa_serves_files_and_index(spa):
    c, _ = spa
    assert c.get("/assets/app.js").text == "console.log(1)"
    r = c.get("/ace-step")
    assert r.text == "<html>index</html>" and r.headers["cache-control"] == "no-cache"
    assert c.get("/index.html").headers["cache-control"] == "no-cache"
    assert c.get("/api/known").json() == {"ok": True}


def test_spa_unknown_api_is_json_404(spa):
    c, _ = spa
    for path in ("/api/nope", "/api/ace/whatever", "/api"):
        r = c.get(path)
        assert r.status_code == 404 and r.json() == {"detail": "Not Found"}, path


def test_spa_refuses_encoded_traversal(spa):
    c, secret = spa
    for path in ("/..%2Fsecret.txt", "/assets/..%2F..%2Fsecret.txt", "/%2E%2E%2Fsecret.txt", "/assets%2F..%2F..%2Fsecret.txt"):
        r = c.get(path)
        assert "TOP SECRET" not in r.text, path
        assert r.text == "<html>index</html>", path


@pytest.mark.skipif(not IS_WINDOWS, reason="a drive path replaces the base of a join only on Windows")
def test_spa_refuses_absolute_windows_path(spa):
    c, secret = spa
    r = c.get("/" + secret.as_posix())  # /C:/Users/.../secret.txt
    assert "TOP SECRET" not in r.text and r.text == "<html>index</html>"


# ---------------------------------------------------------------- 2: Host / Origin

@pytest.fixture()
def guarded(monkeypatch):
    monkeypatch.delenv("REMIQORA_ALLOWED_HOSTS", raising=False)
    monkeypatch.delenv("REMIQORA_HOST", raising=False)

    def make(**env):
        for k, v in env.items():
            monkeypatch.setenv(k, v)
        app = FastAPI()

        @app.get("/api/x")
        async def get_x():
            return {"ok": True}

        @app.post("/api/x")
        async def post_x():
            return {"ok": True}

        app.add_middleware(LocalOnlyMiddleware)
        return TestClient(app, base_url="http://127.0.0.1:9000")
    return make


def test_host_check(guarded):
    c = guarded()
    assert c.get("/api/x").status_code == 200
    for host in ("localhost:5174", "127.0.0.1", "[::1]:9000", "LOCALHOST"):
        assert c.get("/api/x", headers={"host": host}).status_code == 200, host
    for host in ("evil.example", "evil.example:9000", "127.0.0.1.evil.example", ""):
        r = c.get("/api/x", headers={"host": host})
        assert r.status_code == 400, host


def test_host_check_extra_and_open(guarded):
    c = guarded(REMIQORA_ALLOWED_HOSTS="studio.lan")
    assert c.get("/api/x", headers={"host": "studio.lan:9000"}).status_code == 200
    assert c.get("/api/x", headers={"host": "evil.example"}).status_code == 400
    c = guarded(REMIQORA_ALLOWED_HOSTS="", REMIQORA_HOST="0.0.0.0")  # LAN mode without a list: no host check
    assert c.get("/api/x", headers={"host": "192.168.1.5:9000"}).status_code == 200


def test_origin_check(guarded):
    c = guarded()
    assert c.post("/api/x").status_code == 200, "no Origin (curl, engines): allowed"
    for origin in ("http://localhost:5174", "http://127.0.0.1:9000", "http://127.0.0.1:51234", "http://[::1]:9000"):
        assert c.post("/api/x", headers={"origin": origin}).status_code == 200, origin
    for origin in ("http://evil.example", "https://localhost.evil.example", "null", "chrome-extension://abc"):
        r = c.post("/api/x", headers={"origin": origin})
        assert r.status_code == 403, origin
    for method in ("put", "patch", "delete"):
        assert c.request(method.upper(), "/api/x", headers={"origin": "http://evil.example"}).status_code == 403
    # a cross-origin GET is not state-changing (and cannot be read without CORS)
    assert c.get("/api/x", headers={"origin": "http://evil.example"}).status_code == 200


def test_origin_same_origin_in_lan_mode(guarded):
    c = guarded(REMIQORA_HOST="0.0.0.0")
    h = {"host": "192.168.1.5:9000"}
    assert c.post("/api/x", headers={**h, "origin": "http://192.168.1.5:9000"}).status_code == 200
    assert c.post("/api/x", headers={**h, "origin": "http://evil.example"}).status_code == 403


# ---------------------------------------------------------------- 3, 21: process / job object

@pytest.mark.skipif(not IS_WINDOWS, reason="job objects are Windows only")
def test_job_kill_on_close_and_independent_jobs():
    sleeper = [sys.executable, "-c", "import time; time.sleep(60)"]
    a = subprocess.Popen(sleeper, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)
    b = subprocess.Popen(sleeper, creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)
    try:
        ja, jb = process_mod._WindowsJob(int(a._handle)), process_mod._WindowsJob(int(b._handle))
        assert ja.ok and jb.ok and ja.kill_on_close and jb.kill_on_close
        assert ja.active() == 1
        ja.close()  # the last handle of a's job: Windows ends a, and only a
        a.wait(10)
        time.sleep(0.3)
        assert b.poll() is None, "closing one job leaves the other's process running"
        jb.close()
        b.wait(10)
    finally:
        for p in (a, b):
            if p.poll() is None:
                p.kill()


def test_popen_failure_closes_log(tmp_path, monkeypatch):
    monkeypatch.setattr(process_mod, "LOG_DIR", tmp_path)
    spec = ProcessSpec(name="missing", cmd=[str(tmp_path / "no-such-program.exe")], cwd=tmp_path)
    proc = process_mod.ManagedProcess(spec)
    with pytest.raises(OSError):
        proc.start()
    assert proc._log_file is None
    (tmp_path / "missing.log").unlink()  # not locked any more (Windows)


# ---------------------------------------------------------------- 4, 11: manager

class _FakeProc:
    instances: list["_FakeProc"] = []

    def __init__(self, spec) -> None:
        self.spec, self.stopped, self.started = spec, False, False
        self.pid = 1234
        _FakeProc.instances.append(self)

    @property
    def is_running(self) -> bool:
        return self.started and not self.stopped

    def start(self) -> None:
        self.started = True

    async def wait_healthy(self, cancel=None) -> None:
        await asyncio.sleep(3600)

    async def stop(self, *, check: bool = False) -> None:
        self.stopped = True


def test_cancelled_start_stops_processes(monkeypatch):
    _FakeProc.instances = []
    monkeypatch.setattr(manager_mod, "ManagedProcess", _FakeProc)
    monkeypatch.setattr(manager_mod.engine_settings, "processes_for", lambda mid: [object()])
    monkeypatch.setattr(manager_mod.engine_settings, "get", lambda mid: {})

    async def main():
        m = OrchestratorManager()
        task = asyncio.create_task(m._start_model("ace_step"))
        await asyncio.sleep(0.05)
        assert m.state.models["ace_step"].status == ModelStatus.STARTING
        task.cancel()
        with pytest.raises(asyncio.CancelledError):
            await task
        return m

    m = asyncio.run(main())
    assert _FakeProc.instances and all(p.stopped for p in _FakeProc.instances)
    assert m.state.models["ace_step"].status == ModelStatus.STOPPED
    assert "ace_step" not in m._cancel_start and "ace_step" not in m._processes


def test_switch_refuses_start_when_stop_failed(monkeypatch):
    monkeypatch.setattr(manager_mod, "ALLOW_CONCURRENT_MODELS", False)
    started: list[str] = []

    async def main():
        m = OrchestratorManager()
        m.state.active_model = "yue2"
        m.state.models["yue2"].status = ModelStatus.RUNNING

        class Survivor:
            is_running = True

            async def stop(self, *, check=False):
                raise StopFailed("process 'yue2' could not be stopped, still running: PID 42")

        m._processes["yue2"] = [Survivor()]

        async def fake_start(mid):
            started.append(mid)

        m._start_model = fake_start  # type: ignore[method-assign]
        with pytest.raises(StopFailed, match="could not stop 'yue2'"):
            await m.switch_to("ace_step")
        return m

    m = asyncio.run(main())
    assert started == [], "the next model is not started while the old one still holds the GPU"
    assert m.state.models["yue2"].status == ModelStatus.ERROR


# ---------------------------------------------------------------- 10: orchestrator routes

def _orch_client(monkeypatch):
    app = FastAPI()
    app.include_router(routes_orchestrator.router)
    monkeypatch.setattr(routes_orchestrator.features, "has_ace_step", lambda: True)
    monkeypatch.setattr(routes_orchestrator.gen_queue, "running_engine", lambda: None)
    return TestClient(app)


def test_switch_and_stop_errors_are_502(monkeypatch):
    c = _orch_client(monkeypatch)

    async def boom_os(model):
        raise FileNotFoundError("uv.exe not found")

    async def boom_other(*a):
        raise KeyError("weird")

    monkeypatch.setattr(routes_orchestrator.manager, "switch_to", boom_os)
    r = c.post("/api/orchestrator/switch", json={"model": "ace_step"})
    assert r.status_code == 502 and "uv.exe not found" in r.json()["detail"]
    monkeypatch.setattr(routes_orchestrator.manager, "switch_to", boom_other)
    r = c.post("/api/orchestrator/switch", json={"model": "ace_step"})
    assert r.status_code == 502 and "weird" in r.json()["detail"]
    monkeypatch.setattr(routes_orchestrator.manager, "stop_active", boom_other)
    r = c.post("/api/orchestrator/stop")
    assert r.status_code == 502 and "weird" in r.json()["detail"]


# ---------------------------------------------------------------- 5: background tasks, stems shutdown

def test_bg_spawn_keeps_reference():
    async def main():
        gate = asyncio.Event()

        async def work():
            await gate.wait()
            return 1

        t = bg.spawn(work(), name="t")
        assert t in bg.running()
        gate.set()
        await t
        await asyncio.sleep(0)
        assert t not in bg.running()

    asyncio.run(main())


def test_stems_shutdown_kills_running(monkeypatch):
    killed: list[int] = []

    class P:
        pid, returncode = 77, None

    async def fake_kill(proc):
        killed.append(proc.pid)

    monkeypatch.setattr(stems, "_kill_tree", fake_kill)
    monkeypatch.setitem(stems._jobs, 99001, stems.StemJob(status="running", proc=P()))
    monkeypatch.setitem(stems._jobs, 99002, stems.StemJob(status="done", proc=P()))
    asyncio.run(stems.shutdown())
    assert killed == [77] and stems._jobs[99001].cancel_requested and not stems._jobs[99002].cancel_requested


# ---------------------------------------------------------------- 6, 7, 14, 15: covers after songs, ACE task id

def test_song_cover_saved_to_other_takes_when_first_fails(env, monkeypatch):
    a, b = make_track("A"), make_track("B")
    cid = gen_queue.enqueue_song_cover(_finished_song([a, b]))
    real = covers.save_cover

    def flaky(tid, png):
        if tid == a:
            raise OSError("could not replace 1.png: the file is in use by another program")
        return real(tid, png)

    monkeypatch.setattr(covers, "save_cover", flaky)

    async def body(client, q):
        q.start()
        await _wait(lambda: db.get_job(cid)["status"] not in db.JOB_ACTIVE, what="cover job")
        row = db.get_job(cid)
        assert row["status"] == "done", row["error"]
        assert json.loads(row["track_ids_json"]) == [b]
        assert covers.cover_path(db.get_track(a)) is None and covers.cover_path(db.get_track(b)) is not None

    run(body)


def test_song_cover_fails_only_when_no_take_saved(env, monkeypatch):
    a, b = make_track("A"), make_track("B")
    cid = gen_queue.enqueue_song_cover(_finished_song([a, b]))

    def broken(tid, png):
        raise OSError("disk full")

    monkeypatch.setattr(covers, "save_cover", broken)

    async def body(client, q):
        q.start()
        await _wait(lambda: db.get_job(cid)["status"] not in db.JOB_ACTIVE, what="cover job")
        row = db.get_job(cid)
        assert row["status"] == "failed" and "disk full" in row["error"]

    run(body)


def test_recover_queues_cover_for_ended_song(fresh_db, monkeypatch):
    monkeypatch.setattr(features, "has_cover", lambda: True)
    covers.set_enabled(True)
    a = make_track("A")
    (jid,) = db.insert_jobs("ace_step", "b-recover", [{"request": {}, "save": {"make_cover": True}, "takes": 2, "title": "s"}])
    db.mark_job_running(jid)
    db.append_job_track(jid, a)  # 1 of 2 takes saved, then the backend went down
    monkeypatch.setattr(gen_queue.queue, "_wake", asyncio.Event())
    gen_queue.recover()
    assert db.get_job(jid)["status"] == "failed"
    (cj,) = cover_jobs()
    assert json.loads(cj["request_json"])["track_ids"] == [a]


def test_ace_cancel_during_saving_is_not_sent_to_engine(env, monkeypatch):
    engines, sd, switched = env
    gate = asyncio.Event()
    real_store = gen_queue._store

    async def slow_store(job_id, **kw):
        gate.set()
        await asyncio.sleep(0.1)
        return await real_store(job_id, **kw)

    monkeypatch.setattr(gen_queue, "_store", slow_store)

    async def body(client, q):
        (job,) = await submit(client, ace_spec())
        q.start()
        await asyncio.wait_for(gate.wait(), 5)
        assert q.current is not None and q.current.engine_task_id is None
        await q.cancel(job["id"])
        await _wait(lambda: db.get_job(job["id"])["status"] not in db.JOB_ACTIVE, what="ace job")
        assert engines.find("POST", "/cancel_task") == []

    run(body)


# ---------------------------------------------------------------- 8: locked cover file

def test_replace_file_retries_then_succeeds(tmp_path, monkeypatch):
    monkeypatch.setattr(covers, "REPLACE_WAIT_S", 0.0)
    src, dst = tmp_path / "a.tmp", tmp_path / "a.png"
    src.write_bytes(b"new")
    dst.write_bytes(b"old")
    calls = {"n": 0}
    real = os.replace

    def flaky(a, b):
        calls["n"] += 1
        if calls["n"] < 3:
            raise PermissionError(13, "Access is denied")
        real(a, b)

    monkeypatch.setattr(covers.os, "replace", flaky)
    covers.replace_file(src, dst)
    assert dst.read_bytes() == b"new" and calls["n"] == 3


def test_replace_file_gives_up_readably_and_cleans_tmp(tmp_path, monkeypatch):
    monkeypatch.setattr(covers, "REPLACE_WAIT_S", 0.0)
    src, dst = tmp_path / "a.tmp", tmp_path / "a.png"
    src.write_bytes(b"new")

    def locked(a, b):
        raise PermissionError(13, "Access is denied")

    monkeypatch.setattr(covers.os, "replace", locked)
    with pytest.raises(OSError, match="in use by another program"):
        covers.replace_file(src, dst)
    assert not src.exists()


# ---------------------------------------------------------------- 9: trash deletion

def test_purge_commits_then_retries_locked_files(fresh_db, monkeypatch):
    t = make_track("gone")
    audio = Path(db.get_track(t)["audio_path"])
    db.trash_track(t)
    real = db._remove_path
    monkeypatch.setattr(db, "_remove_path", lambda p, is_dir: False if p == audio else real(p, is_dir))
    assert db.purge_trash() == 1
    assert db.get_track(t) is None, "the row is gone even though a file is locked"
    assert audio.exists()
    assert [r["path"] for r in db.list_pending_deletions()] == [str(audio)]
    monkeypatch.setattr(db, "_remove_path", real)
    assert db.retry_pending_deletions() == (1, 0)
    assert not audio.exists() and db.list_pending_deletions() == []


def test_empty_trash_route_and_permanent_delete(client):
    a, b = make_track("a"), make_track("b")
    pa = Path(db.get_track(a)["audio_path"])
    db.trash_track(a)
    assert client.post("/api/tracks/trash/empty").json() == {"purged": 1}
    assert not pa.exists()
    pb = Path(db.get_track(b)["audio_path"])
    assert client.delete(f"/api/tracks/{b}?permanent=true").json() == {"deleted": True}
    assert not pb.exists() and db.get_track(b) is None


# ---------------------------------------------------------------- 12, 13: downloads

def test_temp_download_removed_on_disconnect(tmp_path):
    f = tmp_path / "copy.mp3"
    f.write_bytes(b"x" * 300_000)
    resp = routes_tracks._TempFileResponse(f, filename="a.mp3")

    async def receive():
        await asyncio.sleep(3600)
        return {"type": "http.disconnect"}

    async def send(message):
        if message["type"] == "http.response.body":
            raise OSError("client went away")

    scope = {"type": "http", "method": "GET", "headers": [], "http_version": "1.1"}
    with pytest.raises(OSError):
        asyncio.run(resp(scope, receive, send))
    assert not f.exists()


def test_download_copies_go_to_data_tmp_and_are_swept(monkeypatch, tmp_path):
    monkeypatch.setattr(tagging, "DOWNLOAD_TMP_DIR", tmp_path / "tmp" / "downloads")
    tagging.DOWNLOAD_TMP_DIR.mkdir(parents=True)
    (tagging.DOWNLOAD_TMP_DIR / "old.mp3").write_bytes(b"x")
    assert tagging.sweep_download_tmp() == 1
    assert list(tagging.DOWNLOAD_TMP_DIR.iterdir()) == []


def test_ffmpeg_timeout_kills_and_unlinks(tmp_path):
    out = tmp_path / "out.mp3"
    out.write_bytes(b"partial")
    cmd = [sys.executable, "-c", "import time; time.sleep(30)"]
    t0 = time.monotonic()
    assert asyncio.run(tagging._run_ffmpeg(cmd, str(out), timeout=0.5)) is False
    assert time.monotonic() - t0 < 15 and not out.exists()


# ---------------------------------------------------------------- 16: cover_v

def test_cover_caption_cover_v(client):
    from test_track_cover_captions import CAP, b64, jpeg

    covers.set_enabled(True)
    t = make_track("a")
    covers.save_cover(t, png_bytes())
    v = covers.cover_version(db.get_track(t))
    url = next(x for x in client.get("/api/tracks").json()["data"] if x["id"] == t)["cover_url"]
    assert url.endswith(f"?v={v}")
    put = lambda body: client.put(f"/api/tracks/{t}/cover/caption", json=body)  # noqa: E731
    assert put({"caption": CAP, "image": b64(jpeg()), "cover_v": v}).status_code == 200
    assert put({"caption": CAP, "image": b64(jpeg()), "cover_v": int(v)}).status_code == 200
    assert put({"caption": CAP, "image": b64(jpeg())}).status_code == 200, "cover_v stays optional"
    r = put({"caption": {"title": "stale"}, "image": b64(jpeg()), "cover_v": "123"})
    assert r.status_code == 409
    assert db.get_track(t)["cover_caption"] and "stale" not in db.get_track(t)["cover_caption"]
    assert put({"caption": CAP, "cover_v": [1]}).status_code == 422


# ---------------------------------------------------------------- 17, 18: jobs / uploads

def test_ace_audio_format_validated(client):
    for fmt in ("wav", "mp3", "flac"):
        spec = {"engine": "ace_step", "batch": [{"request": {"prompt": "p", "audio_format": fmt}, "takes": 1, "save": {}}]}
        assert client.post("/api/jobs", data={"spec": json.dumps(spec)}).status_code == 200, fmt
    for fmt in ("ogg", "../x", 5, ""):
        spec = {"engine": "ace_step", "batch": [{"request": {"prompt": "p", "audio_format": fmt}, "takes": 1, "save": {}}]}
        r = client.post("/api/jobs", data={"spec": json.dumps(spec)})
        assert r.status_code == 400 and "audio_format" in r.json()["detail"], fmt


def test_upload_size_cap(client, monkeypatch):
    monkeypatch.setattr(routes_tracks, "MAX_UPLOAD_BYTES", 10)
    big = ("x.wav", b"RIFF" + b"\0" * 20, "audio/wav")
    assert client.post("/api/tracks/upload", files={"audio": big}).status_code == 413
    assert client.post("/api/tracks", data={"model": "yue2"}, files={"audio": big}).status_code == 413
    spec = {"engine": "ace_step", "batch": [{"request": {"prompt": "p"}, "takes": 1, "save": {}}]}
    assert client.post("/api/jobs", data={"spec": json.dumps(spec)}, files={"audio": big}).status_code == 413
    small = ("x.wav", b"RIFF", "audio/wav")
    assert client.post("/api/tracks/upload", files={"audio": small}).status_code == 200
    assert client.post("/api/tracks", data={"model": "yue2"}, files={"audio": small}).status_code == 200


# ---------------------------------------------------------------- 19: proxy

def test_proxy_closes_upstream_when_client_leaves_before_body():
    closed = {"n": 0}

    class Upstream:
        async def aclose(self):
            closed["n"] += 1

    async def body():
        yield b"never read"

    resp = routes_proxy._UpstreamResponse(body(), upstream=Upstream(), status_code=200)

    async def receive():
        return {"type": "http.disconnect"}

    async def send(message):
        raise OSError("client went away")

    scope = {"type": "http", "method": "GET", "headers": [], "http_version": "1.1", "asgi": {"spec_version": "2.4"}}
    with pytest.raises(BaseException):
        asyncio.run(resp(scope, receive, send))
    assert closed["n"] >= 1
