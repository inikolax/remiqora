"""Album covers (app/covers.py, routes_covers.py, the cover runner in gen_queue.py, the cover routes in routes_tracks.py).

Runs under pytest. Every test gets its own empty database and files folder; the cover engine is an httpx.MockTransport
and the orchestrator's switch_to is a fake, so no engine process is started. (Named so it imports after
test_gen_queue.py, which needs to set REMIQORA_DATA_DIR first.)
"""
from __future__ import annotations

import asyncio
import base64
import json
import os
import struct
import sys
import tempfile
import zlib
from pathlib import Path

_TMP = Path(tempfile.mkdtemp(prefix="remiqora-covers-test-"))
os.environ.setdefault("REMIQORA_DATA_DIR", str(_TMP / "data"))
os.environ.setdefault("REMIQORA_LOG_DIR", str(_TMP / "logs"))
os.environ["ACE_STEP_OFFLOAD_DIT"] = "false"  # no nvidia-smi probe at import
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import httpx  # noqa: E402
import pytest  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app import covers, db, features, gen_queue  # noqa: E402
from app.api.routes_covers import router as covers_router  # noqa: E402
from app.api.routes_jobs import router as jobs_router  # noqa: E402
from app.api.routes_settings import router as settings_router  # noqa: E402
from app.api.routes_tracks import router as tracks_router  # noqa: E402
from app.config import MODELS  # noqa: E402
from app.orchestrator.manager import manager  # noqa: E402
from app.orchestrator.state import ModelStatus  # noqa: E402
from app.track_store import store_track  # noqa: E402

COVER = MODELS["cover"].proxy_target


def png_bytes(w: int = 8, h: int = 8) -> bytes:
    """A real (tiny, grey) PNG without Pillow."""
    def chunk(kind: bytes, data: bytes) -> bytes:
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
    raw = b"".join(b"\x00" + b"\x80" * (w * 3) for _ in range(h))
    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b""))


def make_app() -> FastAPI:
    app = FastAPI()
    for r in (tracks_router, jobs_router, covers_router, settings_router):
        app.include_router(r)
    return app


@pytest.fixture()
def fresh_db(tmp_path, monkeypatch):
    if db._db is not None:
        db._db.close()
    monkeypatch.setattr(db, "_db", None)
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    monkeypatch.setattr(db, "FILES_DIR", tmp_path / "files")
    monkeypatch.setattr(covers, "_ffmpeg", lambda: None)  # no thumbnails unless a test asks for them
    yield tmp_path
    if db._db is not None:
        db._db.close()
        db._db = None


@pytest.fixture()
def client(fresh_db):
    with TestClient(make_app()) as c:
        yield c


def make_track(title: str = "t", params: dict | None = None, model: str = "yue2") -> int:
    return store_track(model=model, title=title, lyrics="", seed=None, duration_ms=1000.0, wall_ms=None,
                       params=params or {}, audio=b"RIFF fake wav", ext="wav", abc=None)["id"]


# ---------------------------------------------------------------- prompt

def test_prompt_building():
    row = {"id": 1, "title": "Night Drive"}
    head = covers.PROMPT_HEAD
    p = covers.build_prompt(row, {"prompt": "TrackType: Music, VocalType: Instrumental, Atmospheric cinematic piece, Mood: dark, BPM: 120"})
    assert p == f"{head} Atmospheric cinematic piece, dark"
    assert "TrackType" not in p and "120" not in p and "Night Drive" not in p, "service tags out, the title stays out"
    # never asks for a cover or names text: Z-Image letters them onto the picture
    assert "cover" not in p.lower() and "text" not in p.lower()
    # style wins over caption/prompt; a mood param is added; markup and quotes go
    p = covers.build_prompt(row, {"style": 'synthwave, "retro" [verse], synthwave', "caption": "ignored", "mood": "melancholic"})
    assert p == f"{head} synthwave, retro, melancholic"
    # no style at all: a neutral picture, never the title
    assert "Night Drive" not in covers.build_prompt(row, {})
    # a Russian idea in "caption" would be lettered onto the picture: the English prompt is used instead
    sa = covers.build_prompt(row, {"caption": "Музыка в стиле cyberpunk", "prompt": "TrackType: Music, Cyberpunk neon-noir electronic track"})
    assert "Музыка" not in sa and "neon-noir" in sa
    assert "Музыка" not in covers.build_prompt(row, {"caption": "Музыка в стиле cyberpunk"})
    # a given text is used as it is, without "album cover" and "no text" wording
    assert covers.build_prompt(row, {"style": "x"}, "  a red fox\nin snow. ") == "a red fox in snow"
    assert covers.build_prompt(row, {}, "Album cover art of a red fox, no text, no letters.") == "artwork of a red fox"
    long = covers.build_prompt(row, {"style": ", ".join(f"word{i}" for i in range(400))})
    assert len(long) <= covers.PROMPT_MAX


# ---------------------------------------------------------------- storage, urls, delete

def test_cover_url_get_delete(client):
    tid = make_track("a")
    t = client.get("/api/tracks").json()["data"][0]
    assert t["cover_url"] is None
    assert client.get(f"/api/tracks/{tid}/cover").status_code == 404

    assert covers.save_cover(tid, png_bytes()) is True
    path = covers.cover_file(tid)
    assert path.is_file() and db.get_track(tid)["cover_path"] == str(path)
    url = client.get("/api/tracks").json()["data"][0]["cover_url"]
    assert url.startswith(f"/api/tracks/{tid}/cover?v=")
    r = client.get(url)
    assert r.status_code == 200 and r.content == path.read_bytes() and "immutable" in r.headers["cache-control"]
    assert client.get(f"/api/tracks/{tid}/cover").headers["cache-control"] == "no-cache"
    # no thumbnail (no ffmpeg here): size=thumb serves the PNG
    r = client.get(url + "&size=thumb")
    assert r.status_code == 200 and r.content == path.read_bytes()
    assert client.get(f"/api/tracks/{tid}/cover?size=huge").status_code == 422

    # a new cover changes the version
    os.utime(path, ns=(1_000_000_000_000, 1_000_000_000_000))
    old = client.get("/api/tracks").json()["data"][0]["cover_url"]
    covers.save_cover(tid, png_bytes(4, 4))
    assert client.get("/api/tracks").json()["data"][0]["cover_url"] != old

    with pytest.raises(ValueError):
        covers.save_cover(tid, b"not a png")

    r = client.delete(f"/api/tracks/{tid}/cover")
    assert r.status_code == 200 and r.json()["cover_url"] is None
    assert not path.exists() and db.get_track(tid)["cover_path"] is None
    assert client.delete("/api/tracks/99999/cover").status_code == 404
    assert covers.save_cover(99999, png_bytes()) is False and not covers.cover_file(99999).exists(), \
        "a cover for a track deleted meanwhile leaves nothing behind"


def test_thumbnail_with_ffmpeg(client, monkeypatch):
    from app.api.routes_yue2_upload import get_ffmpeg_bin

    if not get_ffmpeg_bin():
        pytest.skip("no ffmpeg")
    monkeypatch.setattr(covers, "_ffmpeg", get_ffmpeg_bin)
    tid = make_track()
    covers.save_cover(tid, png_bytes(64, 64))
    thumb = covers.thumb_file(tid)
    assert thumb.is_file() and thumb.read_bytes()[:2] == b"\xff\xd8"
    r = client.get(f"/api/tracks/{tid}/cover?size=thumb")
    assert r.status_code == 200 and r.content == thumb.read_bytes()
    client.delete(f"/api/tracks/{tid}/cover")
    assert not thumb.exists()


def test_permanent_delete_and_purge_remove_covers(client):
    a, b, c = make_track("a"), make_track("b"), make_track("c")
    for t in (a, b, c):
        covers.save_cover(t, png_bytes())
        covers.thumb_file(t).write_bytes(b"jpg")  # as if ffmpeg had made one
    client.delete(f"/api/tracks/{a}")  # to the trash: the cover stays
    assert covers.cover_file(a).exists()
    assert client.get("/api/tracks/trash").json()["data"][0]["cover_url"]
    assert client.delete(f"/api/tracks/{a}?permanent=true").status_code == 200
    assert not covers.cover_file(a).exists() and not covers.thumb_file(a).exists()
    client.post("/api/tracks/bulk", json={"ids": [b], "action": "trash"})
    client.post("/api/tracks/bulk", json={"ids": [b], "action": "purge"})
    assert not covers.cover_file(b).exists() and not covers.thumb_file(b).exists()
    client.delete(f"/api/tracks/{c}")
    client.post("/api/tracks/trash/empty")
    assert not covers.cover_file(c).exists() and not covers.thumb_file(c).exists()


# ---------------------------------------------------------------- setting gate and job creation

def test_setting_and_create_jobs(client, monkeypatch):
    monkeypatch.setattr(features, "has_cover", lambda: False)
    assert client.get("/api/settings").json() == {"artist": "", "covers_enabled": False, "auto_covers_available": False}, \
        "never switched and no cover engine: off"
    monkeypatch.setattr(features, "has_cover", lambda: True)
    assert client.get("/api/settings").json() == {"artist": "", "covers_enabled": True, "auto_covers_available": True}, \
        "never switched, the cover engine installed: on"
    client.put("/api/settings", json={"covers_enabled": False})
    assert client.get("/api/settings").json()["covers_enabled"] is False, "switched off stays off with the engine installed"
    assert client.put("/api/settings", json={"artist": "  Me   Myself "}).json() == {"artist": "Me Myself", "covers_enabled": False, "auto_covers_available": False}
    assert client.put("/api/settings", json={"covers_enabled": True}).json() == {"artist": "Me Myself", "covers_enabled": True, "auto_covers_available": True}, \
        "a field left out stays"
    monkeypatch.setattr(features, "has_cover", lambda: False)
    assert client.get("/api/settings").json()["auto_covers_available"] is False, "covers on but the engine is missing"
    assert covers.enabled()
    client.put("/api/settings", json={"covers_enabled": False})

    a = make_track("Song A", {"prompt": "TrackType: Music, lo-fi beat"}, model="stable_audio")
    b = make_track("Song B", {"style": "dark techno"})
    r = client.post("/api/covers", json={"track_ids": [a]})
    assert r.status_code == 409 and "switched off" in r.json()["detail"]

    client.put("/api/settings", json={"covers_enabled": True})
    monkeypatch.setattr(features, "has_cover", lambda: False)
    r = client.post("/api/covers", json={"track_ids": [a]})
    assert r.status_code == 409 and "not installed" in r.json()["detail"]
    monkeypatch.setattr(features, "has_cover", lambda: True)

    for bad in ({}, {"track_ids": []}, {"track_ids": [a, a]}, {"track_ids": ["x"]}, {"track_ids": [a], "prompts": []},
                {"track_ids": [a], "prompts": {"x": "y"}}, {"track_ids": [a], "seed": -1}):
        assert client.post("/api/covers", json=bad).status_code == 400, bad
    assert client.post("/api/covers", json={"track_ids": [a, 99999]}).status_code == 404
    assert db.list_active_jobs("cover") == [], "nothing is queued when the request fails"

    r = client.post("/api/covers", json={"track_ids": [a, b], "prompts": {str(b): "a neon owl"}, "seed": 7})
    assert r.status_code == 200, r.text
    jobs = r.json()["jobs"]
    assert [j["engine"] for j in jobs] == ["cover", "cover"] and [j["status"] for j in jobs] == ["queued", "queued"]
    assert [j["request"]["track_id"] for j in jobs] == [a, b] and [j["title"] for j in jobs] == ["Song A", "Song B"]
    assert jobs[0]["request"]["prompt"] == f"{covers.PROMPT_HEAD} lo-fi beat"
    assert jobs[1]["request"]["prompt"] == "a neon owl"
    assert [j["request"]["seed"] for j in jobs] == [7, 8]
    assert all(j["request"]["width"] == 1024 and j["request"]["height"] == 1024 and j["request"]["steps"] == 8 for j in jobs)
    assert {j["id"] for j in client.get("/api/jobs").json()["jobs"]} >= {jobs[0]["id"], jobs[1]["id"]}

    # a track with a cover job already waiting gets that job back, not a second one
    again = client.post("/api/covers", json={"track_ids": [b, a]}).json()["jobs"]
    assert [j["id"] for j in again] == [jobs[1]["id"], jobs[0]["id"]]
    assert len(db.list_active_jobs("cover")) == 2

    # a given description is kept on its track: the prompt route returns it, a track without one gets the automatic
    assert client.get(f"/api/covers/prompt/{b}").json() == {"prompt": "a neon owl", "source": "saved"}
    assert client.get(f"/api/covers/prompt/{a}").json() == {"prompt": f"{covers.PROMPT_HEAD} lo-fi beat", "source": "auto"}
    assert db.get_track(b)["cover_prompt"] == "a neon owl" and db.get_track(a)["cover_prompt"] is None
    assert client.get("/api/covers/prompt/99999").status_code == 404

    # cover jobs are not accepted through the Create forms' route, and "cover" makes no tracks
    spec = json.dumps({"engine": "cover", "batch": [{"request": {}, "save": {}}]})
    assert client.post("/api/jobs", data={"spec": spec}).status_code == 400
    assert client.get("/api/tracks?model=cover").status_code == 400


# ---------------------------------------------------------------- the runner, engine mocked

class FakeSd:
    """sd-server's model status and async image API."""

    def __init__(self) -> None:
        self.bodies: list[dict] = []
        self.polls = 0
        self.status_calls = 0
        self.hold = False  # keep "generating" until a cancel
        self.cancelled: list[str] = []
        self.fail = False

    def handler(self, req: httpx.Request) -> httpx.Response:
        url = str(req.url)
        assert url.startswith(COVER), url
        path = req.url.path
        if path == "/sdcpp/v1/models/status":
            self.status_calls += 1
            return httpx.Response(200, json={"state": "loading" if self.status_calls == 1 else "ready"})
        if path == "/sdcpp/v1/img_gen" and req.method == "POST":
            self.bodies.append(json.loads(req.content))
            return httpx.Response(202, json={"id": f"job_{len(self.bodies)}", "status": "queued"})
        if path.startswith("/sdcpp/v1/jobs/") and path.endswith("/cancel"):
            self.cancelled.append(path.split("/")[4])
            return httpx.Response(200, json={"cancel_requested": True})
        if path.startswith("/sdcpp/v1/jobs/"):
            jid = path.split("/")[4]
            self.polls += 1
            if jid in self.cancelled:
                return httpx.Response(200, json={"id": jid, "status": "cancelled", "error": {"code": "cancelled"}})
            if self.hold or self.polls < 3:
                return httpx.Response(200, json={"id": jid, "status": "generating",
                                                 "progress": {"stage": "sampling", "completed": 4, "total": 8}})
            if self.fail:
                return httpx.Response(200, json={"id": jid, "status": "failed", "error": {"message": "CUDA out of memory"}})
            return httpx.Response(200, json={"id": jid, "status": "completed",
                                             "result": {"images": [{"index": 0, "b64_json": base64.b64encode(png_bytes()).decode()}]}})
        return httpx.Response(404, json={"error": "nope"})


async def _wait(pred, timeout: float = 5.0) -> None:
    end = asyncio.get_running_loop().time() + timeout
    while not pred():
        if asyncio.get_running_loop().time() > end:
            raise AssertionError("timed out")
        await asyncio.sleep(0.01)


def test_cover_jobs_run(fresh_db, monkeypatch):
    sd = FakeSd()
    switched: list[str] = []

    async def fake_switch_to(model_id: str) -> None:
        switched.append(model_id)
        for mid, rs in manager.state.models.items():
            if mid != model_id and rs.status == ModelStatus.RUNNING:
                rs.status = ModelStatus.STOPPED
        manager.state.models[model_id].status = ModelStatus.RUNNING
        manager.state.active_model = model_id

    monkeypatch.setattr(manager, "switch_to", fake_switch_to)
    monkeypatch.setattr(features, "has_cover", lambda: True)
    monkeypatch.setattr(gen_queue, "COVER_POLL_S", 0.01)
    monkeypatch.setattr(gen_queue, "_client", httpx.AsyncClient(transport=httpx.MockTransport(sd.handler), timeout=None))
    covers.set_enabled(True)
    a, b, c = make_track("A", {"style": "ambient"}), make_track("B"), make_track("C")

    async def run() -> None:
        q = gen_queue.queue
        q.start()
        try:
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=make_app()), base_url="http://test") as client:
                # -- a cover is made and saved; the job lists the track with its cover
                job = (await client.post("/api/covers", json={"track_ids": [a], "seed": 42})).json()["jobs"][0]
                await _wait(lambda: db.get_job(job["id"])["status"] not in db.JOB_ACTIVE)
                done = (await client.get(f"/api/jobs/{job['id']}")).json()
                assert done["status"] == "done" and done["error"] is None and done["progress"] == 1.0, done
                assert done["engine"] == "cover" and [t["id"] for t in done["tracks"]] == [a]
                assert done["tracks"][0]["cover_url"].startswith(f"/api/tracks/{a}/cover?v=")
                assert covers.cover_file(a).read_bytes() == png_bytes()
                assert switched == ["cover"] and sd.status_calls >= 2, "waits for the model state 'ready'"
                body = sd.bodies[0]
                assert body["prompt"] == f"{covers.PROMPT_HEAD} ambient"
                assert (body["width"], body["height"], body["seed"]) == (1024, 1024, 42)
                assert body["sample_params"] == {"sample_steps": 8, "guidance": {"txt_cfg": 1.0}}
                assert body["output_format"] == "png"
                # the prompt it was drawn from is kept on the track and listed with it
                assert db.get_track(a)["cover_prompt"] == f"{covers.PROMPT_HEAD} ambient"
                assert done["tracks"][0]["cover_prompt"] == f"{covers.PROMPT_HEAD} ambient"

                # -- an engine failure fails the job and keeps no cover
                sd.fail, sd.polls = True, 0
                job = (await client.post("/api/covers", json={"track_ids": [b]})).json()["jobs"][0]
                await _wait(lambda: db.get_job(job["id"])["status"] not in db.JOB_ACTIVE)
                row = db.get_job(job["id"])
                assert row["status"] == "failed" and row["error"] == "CUDA out of memory"
                assert db.get_track(b)["cover_path"] is None
                sd.fail = False

                # -- cancel while generating: cancelled on the engine
                sd.hold, sd.polls = True, 0
                job = (await client.post("/api/covers", json={"track_ids": [c]})).json()["jobs"][0]
                await _wait(lambda: db.get_job(job["id"])["engine_task_id"] is not None)
                r = await client.post(f"/api/jobs/{job['id']}/cancel")
                assert r.status_code == 200
                await _wait(lambda: db.get_job(job["id"])["status"] not in db.JOB_ACTIVE)
                assert db.get_job(job["id"])["status"] == "cancelled"
                assert sd.cancelled == [db.get_job(job["id"])["engine_task_id"]]
                assert db.get_track(c)["cover_path"] is None
                sd.hold = False

                # -- the track is deleted for good before its job runs: the job fails, nothing is left
                job = (await client.post("/api/covers", json={"track_ids": [c]})).json()["jobs"][0]
                db.delete_track(c)
                await _wait(lambda: db.get_job(job["id"])["status"] not in db.JOB_ACTIVE)
                assert db.get_job(job["id"])["status"] == "failed" and not covers.cover_file(c).exists()
        finally:
            await q.stop()
            await gen_queue._client.aclose()
            for rs in manager.state.models.values():
                rs.status = ModelStatus.STOPPED
            manager.state.active_model = None

    asyncio.run(run())


# ---------------------------------------------------------------- the kept description

def test_cover_prompt_saved(client, monkeypatch):
    monkeypatch.setattr(features, "has_cover", lambda: True)
    client.put("/api/settings", json={"covers_enabled": True})
    a = make_track("A", {"style": "dark techno"})
    t = client.get("/api/tracks").json()["data"][0]
    assert t["cover_prompt"] is None
    assert client.get(f"/api/covers/prompt/{a}").json() == {"prompt": f"{covers.PROMPT_HEAD} dark techno", "source": "auto"}

    # a given text is sanitised as before and kept that way
    job = client.post("/api/covers", json={"track_ids": [a], "prompts": {str(a): "Album cover art of a red fox, no text."}}).json()["jobs"][0]
    assert job["request"]["prompt"] == "artwork of a red fox"
    assert client.get(f"/api/covers/prompt/{a}").json() == {"prompt": "artwork of a red fox", "source": "saved"}
    assert client.get("/api/tracks").json()["data"][0]["cover_prompt"] == "artwork of a red fox"
    queue_cancel = [j for j in db.list_active_jobs("cover")]
    for row in queue_cancel:
        db.update_job(row["id"], status="cancelled")

    # without a text the kept description is used, not the automatic one
    job = client.post("/api/covers", json={"track_ids": [a], "seed": 3}).json()["jobs"][0]
    assert job["request"]["prompt"] == "artwork of a red fox"
    for row in db.list_active_jobs("cover"):
        db.update_job(row["id"], status="cancelled")

    # an empty or null text keeps it; a new text replaces it
    client.post("/api/covers", json={"track_ids": [a], "prompts": {str(a): "  "}})
    assert db.get_track(a)["cover_prompt"] == "artwork of a red fox"
    for row in db.list_active_jobs("cover"):
        db.update_job(row["id"], status="cancelled")
    client.post("/api/covers", json={"track_ids": [a], "prompts": {str(a): "a lighthouse in fog"}})
    assert db.get_track(a)["cover_prompt"] == "a lighthouse in fog"

    # the database helper forgets it on None; an unknown track is no update
    assert db.set_track_cover_prompt(a, None) is True and db.get_track(a)["cover_prompt"] is None
    assert db.set_track_cover_prompt(99999, "x") is False
