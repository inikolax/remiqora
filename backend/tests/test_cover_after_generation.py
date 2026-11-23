"""A cover made after a song (make_cover on POST /api/jobs, gen_queue.enqueue_song_cover, the cover runner's track_ids).

Runs under pytest. Engines are httpx.MockTransport fakes (test_gen_queue.FakeEngines for the music engines,
test_track_covers.FakeSd for sd-server) and the orchestrator's switch_to is a fake: no engine process is started.
"""
from __future__ import annotations

import asyncio
import json
import uuid

import test_gen_queue  # noqa: F401  (must set REMIQORA_DATA_DIR before anything imports app)
from test_gen_queue import ACE, SA3, YUE, FakeEngines  # noqa: E402
from test_track_covers import COVER, FakeSd, client, fresh_db, make_app, make_track, png_bytes  # noqa: E402,F401

import httpx  # noqa: E402
import pytest  # noqa: E402

from app import covers, db, features, gen_queue  # noqa: E402
from app.orchestrator.manager import manager  # noqa: E402
from app.orchestrator.state import ModelStatus  # noqa: E402


@pytest.fixture()
def env(fresh_db, monkeypatch):
    engines, sd = FakeEngines(), FakeSd()
    switched: list[str] = []

    async def handler(req: httpx.Request) -> httpx.Response:
        if str(req.url).startswith(COVER):
            await req.aread()
            return sd.handler(req)
        return await engines.handler(req)

    async def fake_switch_to(model_id: str) -> None:
        switched.append(model_id)
        for mid, rs in manager.state.models.items():
            if mid != model_id and rs.status == ModelStatus.RUNNING:
                rs.status = ModelStatus.STOPPED
        manager.state.models[model_id].status = ModelStatus.RUNNING
        manager.state.models[model_id].error_message = None
        manager.state.active_model = model_id

    monkeypatch.setattr(manager, "switch_to", fake_switch_to)
    for name in ("has_yue2", "has_ace_step", "has_stable_audio", "has_cover"):
        monkeypatch.setattr(features, name, lambda: True)
    for name in ("ACE_POLL_S", "SA3_POLL_S", "COVER_POLL_S"):
        monkeypatch.setattr(gen_queue, name, 0.01)
    monkeypatch.setattr(gen_queue, "_client", httpx.AsyncClient(transport=httpx.MockTransport(handler), timeout=None))
    for rs in manager.state.models.values():
        rs.status = ModelStatus.STOPPED
    manager.state.active_model = None
    covers.set_enabled(True)
    yield engines, sd, switched
    for rs in manager.state.models.values():
        rs.status = ModelStatus.STOPPED
    manager.state.active_model = None


async def _wait(pred, timeout: float = 5.0, what: str = "condition") -> None:
    end = asyncio.get_running_loop().time() + timeout
    while not pred():
        if asyncio.get_running_loop().time() > end:
            raise AssertionError(f"timed out waiting for {what}")
        await asyncio.sleep(0.01)


def cover_jobs() -> list:
    return [r for r in db.list_jobs() if r["engine"] == "cover"]


def idle() -> bool:
    return not any(r["status"] in db.JOB_ACTIVE for r in db.list_jobs())


async def submit(client: httpx.AsyncClient, spec: dict) -> list[dict]:
    r = await client.post("/api/jobs", data={"spec": json.dumps(spec)})
    assert r.status_code == 200, r.text
    return r.json()["jobs"]


def ace_spec(**extra) -> dict:
    return {"engine": "ace_step", "batch": [{"request": {"prompt": "rock", "batch_size": 2, "audio_format": "mp3"}, "takes": 2,
                                             "save": {"title": "Rock", "params": {"style": "dark synthwave"}}}], **extra}


def run(coro_fn):
    async def main():
        q = gen_queue.queue
        try:
            async with httpx.AsyncClient(transport=httpx.ASGITransport(app=make_app()), base_url="http://test") as client:
                await coro_fn(client, q)
        finally:
            await q.stop()
            await gen_queue._client.aclose()
    asyncio.run(main())


# ---------------------------------------------------------------- end to end

def test_make_cover_one_job_for_all_takes_fifo(env):
    engines, sd, switched = env

    async def body(client, q):
        # worker stopped: the song with make_cover, then a YuE2 song without it, both queued before the cover exists
        song = (await submit(client, ace_spec(make_cover=True)))[0]
        assert song["save"]["make_cover"] is True and "make_cover" not in song["request"]
        other = (await submit(client, {"engine": "yue2", "batch": [{"request": {"lyrics": "x", "seed": 1, "options": {}}, "save": {"title": "y"}}]}))[0]
        q.start()
        await _wait(lambda: idle() and cover_jobs(), what="song + cover")
        assert db.get_job(song["id"])["status"] == "done" and db.get_job(other["id"])["status"] == "done"
        # the engine never saw the flag
        assert "make_cover" not in json.loads(engines.find("POST", "/release_task")[0][1])
        (cj,) = cover_jobs()
        assert cj["id"] > other["id"] and switched == ["ace_step", "yue2", "cover"], "the cover runs after the songs already queued"
        takes = json.loads(db.get_job(song["id"])["track_ids_json"])
        assert len(takes) == 2
        job = (await client.get(f"/api/jobs/{cj['id']}")).json()
        assert job["status"] == "done", job
        req = job["request"]
        assert req["track_ids"] == takes and req["track_id"] == takes[0]
        assert req["source_job_id"] == song["id"] and req["source_batch_id"] == song["batch_id"]
        assert req["prompt"] == f"{covers.PROMPT_HEAD} dark synthwave"
        assert len(sd.bodies) == 1, "one picture for the song"
        assert [t["id"] for t in job["tracks"]] == takes
        for tid in takes:
            assert covers.cover_file(tid).read_bytes() == png_bytes()
            assert db.get_track(tid)["cover_prompt"] == req["prompt"]
        # the YuE2 song without the flag got nothing
        assert db.get_track(json.loads(db.get_job(other["id"])["track_ids_json"])[0])["cover_path"] is None

    run(body)


def test_yue2_batch_gets_one_cover_after_its_last_seed(env):
    engines, sd, switched = env

    async def body(client, q):
        jobs = await submit(client, {"engine": "yue2", "batch": [
            {"request": {"lyrics": "x", "seed": 10 + i, "options": {}, "make_cover": True}, "save": {"title": "Pop", "params": {"style": "pop"}}}
            for i in range(2)]})
        assert all(j["save"]["make_cover"] is True and "make_cover" not in j["request"] for j in jobs)
        q.start()
        await _wait(lambda: idle() and cover_jobs(), what="yue2 batch + cover")
        (cj,) = cover_jobs()
        takes = [json.loads(db.get_job(j["id"])["track_ids_json"])[0] for j in jobs]
        req = json.loads(cj["request_json"])
        assert cj["status"] == "done" and req["track_ids"] == takes and req["source_job_id"] == jobs[0]["id"]
        assert all(db.get_track(t)["cover_path"] for t in takes)
        for _, b in engines.find("POST", "/v1/tasks/run"):
            assert "make_cover" not in json.loads(b)["request"]

    run(body)


@pytest.mark.parametrize("case", ["absent", "false", "disabled", "not_installed", "sfx"])
def test_no_cover(env, monkeypatch, case):
    async def body(client, q):
        if case == "disabled":
            covers.set_enabled(False)
        if case == "not_installed":
            monkeypatch.setattr(features, "has_cover", lambda: False)
        if case == "sfx":
            spec = {"engine": "stable_audio", "make_cover": True, "batch": [
                {"request": {"prompt": "door slam", "seed": 5, "batch_size": 1}, "takes": 1,
                 "save": {"title": "Door", "params": {"kind": "sfx", "prompt": "door slam"}}}]}
        else:
            spec = ace_spec(**({"make_cover": False} if case == "false" else {} if case == "absent" else {"make_cover": True}))
        (song,) = await submit(client, spec)
        q.start()
        await _wait(lambda: db.get_job(song["id"])["status"] not in db.JOB_ACTIVE, what="song")
        await asyncio.sleep(0.05)
        assert db.get_job(song["id"])["status"] == "done"
        assert json.loads(db.get_job(song["id"])["track_ids_json"])
        assert cover_jobs() == []

    run(body)


def test_bad_flag(client):
    r = client.post("/api/jobs", data={"spec": json.dumps(ace_spec(make_cover="yes"))})
    assert r.status_code == 400 and "make_cover" in r.json()["detail"]
    spec = ace_spec()
    spec["batch"][0]["request"]["make_cover"] = 1
    assert client.post("/api/jobs", data={"spec": json.dumps(spec)}).status_code == 400


# ---------------------------------------------------------------- the rules, without the worker

def _finished_song(track_ids: list[int], engine: str = "ace_step", save: dict | None = None, status: str = "done") -> int:
    (jid,) = db.insert_jobs(engine, uuid.uuid4().hex, [{"request": {}, "save": save or {"make_cover": True}, "takes": len(track_ids), "title": "s"}])
    db.mark_job_running(jid)
    for t in track_ids:
        db.append_job_track(jid, t)
    db.finish_job(jid, status)
    return jid


def test_rules_direct(fresh_db, monkeypatch):
    monkeypatch.setattr(features, "has_cover", lambda: True)
    covers.set_enabled(True)
    a, b, c = make_track("A", {"style": "ambient"}), make_track("B"), make_track("C")
    covers.save_cover(b, png_bytes())  # already has one: left out
    jid = _finished_song([a, b, c])
    cid = gen_queue.enqueue_song_cover(jid)
    req = json.loads(db.get_job(cid)["request_json"])
    assert req["track_ids"] == [a, c] and req["track_id"] == a and req["source_job_id"] == jid
    assert db.get_job(cid)["status"] == "queued"
    assert gen_queue.enqueue_song_cover(jid) is None, "one cover job per song"
    # a manual POST /api/covers for any take of it gets that job back
    from app.api.routes_covers import _active_cover_jobs
    assert _active_cover_jobs() == {a: cid, c: cid}
    db.update_job(cid, status="cancelled")

    # a failed or cancelled song that saved takes before it ended: its takes get the cover too
    assert gen_queue.enqueue_song_cover(_finished_song([make_track()], status="failed")) is not None
    assert gen_queue.enqueue_song_cover(_finished_song([make_track()], status="cancelled")) is not None
    # failed / cancelled without takes, no tracks, every take covered: nothing
    assert gen_queue.enqueue_song_cover(_finished_song([], status="failed")) is None
    assert gen_queue.enqueue_song_cover(_finished_song([], status="cancelled")) is None
    assert gen_queue.enqueue_song_cover(_finished_song([])) is None
    assert gen_queue.enqueue_song_cover(_finished_song([b])) is None
    # Stable Audio: music (or no kind) yes, a sound effect no
    sfx = _finished_song([make_track()], "stable_audio", {"make_cover": True, "params": {"kind": "sfx"}})
    assert gen_queue.enqueue_song_cover(sfx) is None
    music = _finished_song([make_track()], "stable_audio", {"make_cover": True, "params": {"kind": "music"}})
    assert gen_queue.enqueue_song_cover(music) is not None


def test_cover_job_skips_takes_covered_meanwhile(env):
    engines, sd, switched = env
    a, b, c = make_track("A"), make_track("B"), make_track("C")
    cid = gen_queue.enqueue_song_cover(_finished_song([a, b, c]))
    covers.save_cover(b, png_bytes(4, 4))  # a manual cover arrived before the automatic one ran
    db.delete_track(c)

    async def body(client, q):
        q.start()
        await _wait(lambda: db.get_job(cid)["status"] not in db.JOB_ACTIVE, what="cover job")
        row = db.get_job(cid)
        assert row["status"] == "done" and json.loads(row["track_ids_json"]) == [a]
        assert covers.cover_file(a).read_bytes() == png_bytes() and covers.cover_file(b).read_bytes() == png_bytes(4, 4)

    run(body)
