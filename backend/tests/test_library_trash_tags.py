"""Library trash, bulk actions and tags (app/db.py, routes_tracks.py, routes_tags.py, routes_jobs.py).

Runs under pytest. Every test gets its own empty database and files folder (db.DB_PATH / FILES_DIR are pointed at
a temp dir and the shared connection is reset), so nothing real is touched.
"""
from __future__ import annotations

import os
import sys
import tempfile
import time
from pathlib import Path

_TMP = Path(tempfile.mkdtemp(prefix="remiqora-library-test-"))
os.environ.setdefault("REMIQORA_DATA_DIR", str(_TMP / "data"))
os.environ.setdefault("REMIQORA_LOG_DIR", str(_TMP / "logs"))
os.environ["ACE_STEP_OFFLOAD_DIT"] = "false"  # no nvidia-smi probe at import
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import pytest  # noqa: E402
from fastapi import FastAPI  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app import db  # noqa: E402
from app.api.routes_collections import router as collections_router  # noqa: E402
from app.api.routes_jobs import router as jobs_router  # noqa: E402
from app.api.routes_tags import router as tags_router  # noqa: E402
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
    for r in (tracks_router, jobs_router, collections_router, tags_router):
        app.include_router(r)
    with TestClient(app) as c:
        yield c
    if db._db is not None:
        db._db.close()


def make_track(title: str = "t", model: str = "ace_step") -> int:
    return store_track(model=model, title=title, lyrics="", seed=None, duration_ms=1000.0, wall_ms=None,
                       params={}, audio=b"RIFF fake wav", ext="wav", abc=None)["id"]


def library_ids(client) -> list[int]:
    return [t["id"] for t in client.get("/api/tracks").json()["data"]]


def trash_ids(client) -> list[int]:
    return [t["id"] for t in client.get("/api/tracks/trash").json()["data"]]


def bulk(client, ids, action, **extra):
    return client.post("/api/tracks/bulk", json={"ids": ids, "action": action, **extra})


# ---------------------------------------------------------------- trash

def test_trash_restore_purge_empty(client):
    a, b, c = make_track("a"), make_track("b"), make_track("c", model="yue2")
    audio_a = Path(db.get_track(a)["audio_path"])

    assert client.delete("/api/tracks/99999").status_code == 404
    r = client.delete(f"/api/tracks/{a}")
    assert r.status_code == 200 and r.json() == {"trashed": True}
    assert audio_a.exists(), "trashing keeps the files"
    assert library_ids(client) == [c, b]
    assert [t["id"] for t in client.get("/api/tracks?model=ace_step").json()["data"]] == [b]
    trashed = client.get("/api/tracks/trash").json()["data"]
    assert [t["id"] for t in trashed] == [a] and trashed[0]["deleted_at"].endswith("Z")
    assert all(t["deleted_at"] is None for t in client.get("/api/tracks").json()["data"])
    assert client.get(f"/api/tracks/{a}/audio").status_code == 200, "a trashed track can still be listened to"

    # trashing twice keeps the first date; the most recently trashed comes first
    first_date = trashed[0]["deleted_at"]
    five_days_ago = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() - 5 * 86400))
    db.get_db().execute("UPDATE tracks SET deleted_at = ? WHERE id = ?", (five_days_ago, a))
    db.get_db().commit()
    client.delete(f"/api/tracks/{a}")
    assert db.get_track(a)["deleted_at"] == five_days_ago
    client.delete(f"/api/tracks/{b}")
    assert trash_ids(client) == [b, a]
    assert first_date.endswith("Z")

    # restore through bulk
    r = bulk(client, [a], "restore")
    assert [t["id"] for t in r.json()["data"]] == [a] and r.json()["data"][0]["deleted_at"] is None
    assert a in library_ids(client) and trash_ids(client) == [b]

    # permanent delete of a library track: files and row go
    r = client.delete(f"/api/tracks/{a}?permanent=true")
    assert r.json() == {"deleted": True} and db.get_track(a) is None and not audio_a.exists()
    assert client.delete(f"/api/tracks/{a}?permanent=true").status_code == 404

    # empty the trash
    audio_b = Path(db.get_track(b)["audio_path"])
    client.delete(f"/api/tracks/{c}")
    r = client.post("/api/tracks/trash/empty")
    assert r.json() == {"purged": 2}
    assert db.get_track(b) is None and db.get_track(c) is None and not audio_b.exists()
    assert trash_ids(client) == [] and client.post("/api/tracks/trash/empty").json() == {"purged": 0}


def test_trash_routes_do_not_clash_with_track_id(client):
    t = make_track()
    assert client.get("/api/tracks/trash").status_code == 200
    assert client.post("/api/tracks/trash/empty").status_code == 200
    assert client.post("/api/tracks/bulk", json={}).status_code == 400
    assert client.put(f"/api/tracks/{t}", json={"title": "x"}).json()["title"] == "x"


def test_trash_leaves_jobs_and_collections(client):
    a, b = make_track("a"), make_track("b")
    job_id = db.insert_jobs("ace_step", "batch", [{"takes": 2, "title": "j", "request": {}, "save": {}}])[0]
    db.append_job_track(job_id, a)
    db.append_job_track(job_id, b)
    col = client.post("/api/collections", json={"name": "c"}).json()["id"]
    bulk(client, [a, b], "collect", collection_id=col)
    assert [t["id"] for t in client.get(f"/api/jobs/{job_id}").json()["tracks"]] == [a, b]

    client.delete(f"/api/tracks/{a}")
    assert [t["id"] for t in client.get(f"/api/jobs/{job_id}").json()["tracks"]] == [b]
    assert [t["id"] for t in client.get("/api/jobs").json()["jobs"][0]["tracks"]] == [b]
    assert client.get("/api/collections").json()["data"][0]["track_ids"] == [b]

    bulk(client, [a], "restore")
    assert [t["id"] for t in client.get(f"/api/jobs/{job_id}").json()["tracks"]] == [a, b]
    assert client.get("/api/collections").json()["data"][0]["track_ids"] == [a, b]


def test_auto_purge_after_30_days(client):
    old, fresh, kept = make_track("old"), make_track("fresh"), make_track("kept")
    audio_old = Path(db.get_track(old)["audio_path"])
    client.delete(f"/api/tracks/{old}")
    client.delete(f"/api/tracks/{fresh}")
    d = db.get_db()
    d.execute("UPDATE tracks SET deleted_at = '2000-01-01T00:00:00Z' WHERE id = ?", (old,))
    d.commit()
    # a track just inside the window stays
    from datetime import datetime, timedelta, timezone
    inside = (datetime.now(timezone.utc) - timedelta(days=db.TRASH_DAYS - 1)).strftime("%Y-%m-%dT%H:%M:%SZ")
    d.execute("UPDATE tracks SET deleted_at = ? WHERE id = ?", (inside, fresh))
    d.commit()

    # the trash listing purges on the way
    assert trash_ids(client) == [fresh]
    assert db.get_track(old) is None and not audio_old.exists()
    assert db.get_track(kept) is not None and db.TRASH_DAYS == 30

    # and so does the startup hook
    d.execute("UPDATE tracks SET deleted_at = '2000-01-01T00:00:00Z' WHERE id = ?", (fresh,))
    d.commit()
    assert db.purge_expired_trash() == 1 and db.get_track(fresh) is None


def test_tracks_have_new_fields_and_stems_are_removed_on_purge(client):
    t = make_track()
    row = client.get("/api/tracks").json()["data"][0]
    assert row["tags"] == [] and row["deleted_at"] is None
    stems = db.stems_dir("ace_step", t)
    stems.mkdir(parents=True)
    (stems / "vocals.wav").write_bytes(b"x")
    db.update_track_stems(t, {"vocals": str(stems / "vocals.wav")})
    client.delete(f"/api/tracks/{t}")
    assert stems.exists()
    client.post("/api/tracks/trash/empty")
    assert not stems.exists()


# ---------------------------------------------------------------- bulk

def test_bulk_favorite_tag_collect(client):
    a, b = make_track("a"), make_track("b")
    col = client.post("/api/collections", json={"name": "shorts"}).json()["id"]

    r = bulk(client, [b, a, 777], "favorite")
    body = r.json()
    assert r.status_code == 200 and [t["id"] for t in body["data"]] == [b, a] and body["missing"] == [777]
    assert all(t["favorite"] for t in body["data"])
    r = bulk(client, [a], "unfavorite")
    assert r.json()["data"][0]["favorite"] is False

    r = bulk(client, [a, b], "tag", tag="  #For   Shorts ")
    assert [t["tags"] for t in r.json()["data"]] == [["For Shorts"], ["For Shorts"]]
    r = bulk(client, [a], "tag", tag="for shorts")  # same tag, other case: nothing doubled, first spelling stays
    assert r.json()["data"][0]["tags"] == ["For Shorts"]
    r = bulk(client, [a], "untag", tag="FOR SHORTS")
    assert r.json()["data"][0]["tags"] == []
    assert client.get("/api/tracks").json()["data"][0]["tags"] == ["For Shorts"]  # b is newest

    r = bulk(client, [a, b], "collect", collection_id=col)
    assert [t["collections"] for t in r.json()["data"]] == [[col], [col]]
    r = bulk(client, [a], "uncollect", collection_id=col)
    assert r.json()["data"][0]["collections"] == []
    assert client.get("/api/collections").json()["data"][0]["track_ids"] == [b]


def test_bulk_trash_and_purge(client):
    a, b, c = make_track("a"), make_track("b"), make_track("c")
    audio_b = Path(db.get_track(b)["audio_path"])
    r = bulk(client, [a, b, 555], "trash")
    assert r.json()["missing"] == [555] and all(t["deleted_at"] for t in r.json()["data"])
    assert library_ids(client) == [c]

    # purge only takes what is in the trash; c is in the library, so it is left alone and reported missing
    r = bulk(client, [b, c], "purge")
    assert r.json() == {"data": [], "missing": [c]}
    assert db.get_track(b) is None and not audio_b.exists() and db.get_track(c) is not None
    assert trash_ids(client) == [a]


def test_bulk_validation(client):
    t = make_track()
    col = client.post("/api/collections", json={"name": "c"}).json()["id"]
    assert bulk(client, [], "trash").status_code == 400
    assert bulk(client, list(range(1, 1002)), "trash").status_code == 400
    assert bulk(client, [t, t], "trash").status_code == 400
    assert bulk(client, [t, "2"], "trash").status_code == 400
    assert bulk(client, [True], "trash").status_code == 400
    assert client.post("/api/tracks/bulk", json={"ids": t, "action": "trash"}).status_code == 400
    assert client.post("/api/tracks/bulk", json={"action": "trash"}).status_code == 400
    assert bulk(client, [t], "explode").status_code == 400
    assert client.post("/api/tracks/bulk", json={"ids": [t]}).status_code == 400
    assert bulk(client, [t], "tag").status_code == 400
    assert bulk(client, [t], "tag", tag="  # ").status_code == 400
    assert bulk(client, [t], "untag", tag="").status_code == 400
    assert bulk(client, [t], "collect").status_code == 400
    assert bulk(client, [t], "uncollect", collection_id="x").status_code == 400
    assert bulk(client, [t], "collect", collection_id=col + 100).status_code == 404
    assert bulk(client, list(range(1, 1001)), "favorite").status_code == 200  # exactly 1000 is fine
    # nothing above changed the track
    assert db.get_track(t)["deleted_at"] is None and db.tags_by_track() == {}


def test_bulk_is_one_transaction(client, monkeypatch):
    a, b = make_track("a"), make_track("b")
    real = db.get_db()

    class Boom:
        """Wraps the connection and fails on the second statement of the loop."""
        def __init__(self):
            self.n = 0

        def __getattr__(self, name):
            return getattr(real, name)

        def execute(self, sql, *args):
            if sql.startswith("UPDATE tracks SET favorite"):
                self.n += 1
                if self.n == 2:
                    raise RuntimeError("boom")
            return real.execute(sql, *args)

    monkeypatch.setattr(db, "get_db", lambda: Boom())
    with pytest.raises(RuntimeError):
        db.bulk_apply([a, b], "favorite")
    monkeypatch.setattr(db, "get_db", lambda: real)
    assert not any(db.get_track(i)["favorite"] for i in (a, b)), "the first change was rolled back"


# ---------------------------------------------------------------- tags

def test_put_track_tags_replaces_and_cleans(client):
    t = make_track()
    r = client.put(f"/api/tracks/{t}", json={"tags": ["#Rock", "rock", "  lo  fi ", "x" * 60, "Ambient"]})
    assert r.status_code == 200
    # first spelling wins, case-insensitive duplicates dropped, whitespace collapsed, cut to 40, sorted ignoring case
    assert r.json()["tags"] == ["Ambient", "lo fi", "Rock", "x" * 40]
    r = client.put(f"/api/tracks/{t}", json={"tags": ["b", "A"]})
    assert r.json()["tags"] == ["A", "b"]
    assert client.put(f"/api/tracks/{t}", json={"title": "new"}).json()["tags"] == ["A", "b"], "a field left out stays"
    assert client.put(f"/api/tracks/{t}", json={"tags": ["ok", "  "]}).status_code == 400
    assert client.get("/api/tracks").json()["data"][0]["tags"] == ["A", "b"], "a failed update changes nothing"
    assert client.put("/api/tracks/4040", json={"tags": ["a"]}).status_code == 404
    assert client.put(f"/api/tracks/{t}", json={"tags": []}).json()["tags"] == []


def test_tag_list_counts_and_trash(client):
    a, b, c = make_track("a"), make_track("b"), make_track("c")
    client.put(f"/api/tracks/{a}", json={"tags": ["Rock", "lofi"]})
    client.put(f"/api/tracks/{b}", json={"tags": ["rock"]})
    client.put(f"/api/tracks/{c}", json={"tags": ["only trashed"]})
    assert client.get("/api/tags").json()["data"] == [{"name": "lofi", "count": 1}, {"name": "only trashed", "count": 1}, {"name": "Rock", "count": 2}]
    client.delete(f"/api/tracks/{c}")
    client.delete(f"/api/tracks/{b}")
    assert client.get("/api/tags").json()["data"] == [{"name": "lofi", "count": 1}, {"name": "Rock", "count": 1}]
    # the trashed track keeps its tags
    assert {t["id"]: t["tags"] for t in client.get("/api/tracks/trash").json()["data"]} == {b: ["rock"], c: ["only trashed"]}
    # permanent delete drops the tag rows with the track
    client.delete(f"/api/tracks/{c}?permanent=true")
    assert db.get_db().execute("SELECT COUNT(*) FROM track_tags WHERE track_id = ?", (c,)).fetchone()[0] == 0


def test_tag_rename_merge_delete(client):
    a, b, c = make_track("a"), make_track("b"), make_track("c")
    client.put(f"/api/tracks/{a}", json={"tags": ["demo", "keep"]})
    client.put(f"/api/tracks/{b}", json={"tags": ["demo", "final"]})
    client.put(f"/api/tracks/{c}", json={"tags": ["Final"]})

    # plain rename, found case-insensitively
    r = client.put("/api/tags/DEMO", json={"name": "  #draft "})
    assert r.status_code == 200 and r.json() == {"name": "draft", "count": 2}
    assert client.get("/api/tracks").json()["data"][1]["tags"] == ["draft", "final"]

    # merge: b has draft and final, a has draft only; c already has Final
    r = client.put("/api/tags/draft", json={"name": "FINAL"})
    assert r.json() == {"name": "FINAL", "count": 3}
    tags = db.tags_by_track()
    assert len(tags[a]) == 2 and "FINAL" in tags[a] and tags[b] == ["final"] and tags[c] == ["Final"]
    assert not any(t.lower() == "draft" for ts in tags.values() for t in ts)

    # a case-only rename changes the spelling everywhere
    r = client.put("/api/tags/final", json={"name": "FiNaL"})
    assert r.json() == {"name": "FiNaL", "count": 3}
    assert all("FiNaL" in db.tags_by_track()[i] for i in (a, b, c))

    assert client.put("/api/tags/nothing-here", json={"name": "x"}).status_code == 404
    assert client.put("/api/tags/keep", json={"name": "  "}).status_code == 400
    assert client.put("/api/tags/keep", json={}).status_code == 422

    r = client.delete("/api/tags/FINAL")
    assert r.json() == {"removed": 3}
    assert client.delete("/api/tags/final").json() == {"removed": 0}
    assert client.get("/api/tags").json()["data"] == [{"name": "keep", "count": 1}]


def test_tag_names_with_slashes(client):
    a = make_track()
    client.put(f"/api/tracks/{a}", json={"tags": ["a/b"]})
    assert client.put("/api/tags/a/b", json={"name": "c/d"}).json() == {"name": "c/d", "count": 1}
    assert client.delete("/api/tags/c/d").json() == {"removed": 1}


def test_existing_database_is_migrated(tmp_path, monkeypatch):
    """A database from before the trash and tags existed gets the new column and table."""
    import sqlite3
    path = tmp_path / "old.db"
    con = sqlite3.connect(path)
    con.execute(
        "CREATE TABLE tracks (id INTEGER PRIMARY KEY AUTOINCREMENT, model TEXT NOT NULL, created_at TEXT NOT NULL,"
        " title TEXT NOT NULL DEFAULT '', lyrics TEXT NOT NULL DEFAULT '', seed INTEGER, duration_ms REAL, wall_ms REAL,"
        " params_json TEXT NOT NULL DEFAULT '{}', audio_path TEXT NOT NULL, abc_path TEXT)"
    )
    con.execute("INSERT INTO tracks (model, created_at, audio_path) VALUES ('ace_step', '2026-01-01T00:00:00Z', 'x.wav')")
    con.commit()
    con.close()
    if db._db is not None:
        db._db.close()
    monkeypatch.setattr(db, "_db", None)
    monkeypatch.setattr(db, "DB_PATH", path)
    try:
        assert [r["deleted_at"] for r in db.list_tracks()] == [None]
        assert db.tags_by_track() == {}
    finally:
        db._db.close()
        db._db = None
