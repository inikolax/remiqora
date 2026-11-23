"""Which editor projects use a track (app/db.py projects_using_tracks, GET /api/tracks/{id}/usage, GET /api/tracks/usage).

Runs under pytest with its own empty database and files folder, so nothing real is touched.
"""
from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path

_TMP = Path(tempfile.mkdtemp(prefix="remiqora-usage-test-"))
os.environ.setdefault("REMIQORA_DATA_DIR", str(_TMP / "data"))
os.environ.setdefault("REMIQORA_LOG_DIR", str(_TMP / "logs"))
os.environ["ACE_STEP_OFFLOAD_DIT"] = "false"  # no nvidia-smi probe at import
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app import db  # noqa: E402
from app.api.routes_projects import router as projects_router  # noqa: E402
from app.api.routes_tracks import router as tracks_router  # noqa: E402
from app.track_store import store_track  # noqa: E402


@pytest.fixture()
def client(tmp_path, monkeypatch):
    if db._db is not None:
        db._db.close()
    monkeypatch.setattr(db, "_db", None)
    monkeypatch.setattr(db, "DB_PATH", tmp_path / "test.db")
    monkeypatch.setattr(db, "FILES_DIR", tmp_path / "files")
    app = FastAPI()
    app.include_router(tracks_router)
    app.include_router(projects_router)
    with TestClient(app) as c:
        yield c
    if db._db is not None:
        db._db.close()


def make_track(title: str = "t") -> int:
    return store_track(model="ace_step", title=title, lyrics="", seed=None, duration_ms=1000.0, wall_ms=None,
                       params={}, audio=b"RIFF fake wav", ext="wav", abc=None)["id"]


def project(client, name: str, urls: list[str]) -> int:
    lanes = [{"id": f"l{i}", "name": "lane", "clips": [{"id": f"c{i}", "sourceUrl": u, "sourceLabel": "x"}]} for i, u in enumerate(urls)]
    return client.post("/api/projects", json={"name": name, "data": {"lanes": lanes}}).json()["id"]


def test_usage_of_one_track(client):
    a, b, c = make_track("a"), make_track("b"), make_track("c")
    p1 = project(client, "Mix one", [f"/api/tracks/{a}/audio", f"/api/tracks/{b}/stems/drums"])
    p2 = project(client, "Mix two", [f"http://127.0.0.1:9000/api/tracks/{a}/stems/vocals"])
    # a track id that only starts the same digits is not the same track
    project(client, "Other", [f"/api/tracks/{a}0/audio"])

    r = client.get(f"/api/tracks/{a}/usage")
    assert r.status_code == 200
    assert sorted(p["id"] for p in r.json()["projects"]) == sorted([p1, p2])
    assert {p["name"] for p in r.json()["projects"]} == {"Mix one", "Mix two"}
    assert client.get(f"/api/tracks/{b}/usage").json() == {"projects": [{"id": p1, "name": "Mix one"}]}
    assert client.get(f"/api/tracks/{c}/usage").json() == {"projects": []}
    assert client.get("/api/tracks/99999/usage").status_code == 404


def test_usage_of_a_trashed_track_and_after_project_delete(client):
    a = make_track("a")
    p = project(client, "Keep", [f"/api/tracks/{a}/audio"])
    client.delete(f"/api/tracks/{a}")
    # still asked about from the trash, before it goes for good
    assert client.get(f"/api/tracks/{a}/usage").json() == {"projects": [{"id": p, "name": "Keep"}]}
    client.delete(f"/api/projects/{p}")
    assert client.get(f"/api/tracks/{a}/usage").json() == {"projects": []}


def test_usage_of_many(client):
    a, b = make_track("a"), make_track("b")
    p = project(client, "Both", [f"/api/tracks/{a}/audio", f"/api/tracks/{b}/audio"])
    r = client.get(f"/api/tracks/usage?ids={a},{b},424242")
    assert r.status_code == 200
    assert r.json() == {"usage": {str(a): [{"id": p, "name": "Both"}], str(b): [{"id": p, "name": "Both"}], "424242": []}}
    assert client.get("/api/tracks/usage?ids=").status_code == 400
    assert client.get("/api/tracks/usage?ids=1,x").status_code == 400
