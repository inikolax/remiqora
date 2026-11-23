"""Text captions on album covers: the browser bakes the caption into a JPEG, the backend keeps the settings
(tracks.cover_caption) and the file ({id}_captioned.jpg), PUT/GET /api/tracks/{id}/cover/caption[ed]. Same fixtures as
test_track_covers.py (imported, so the data dir is set up the same way)."""
from __future__ import annotations

import base64
import os
import struct

import pytest

from test_track_covers import client, fresh_db, make_track, png_bytes  # noqa: F401
from app import covers, db
from app.api import routes_tracks


def jpeg(w: int = 1024, h: int = 1024, pad: int = 100) -> bytes:
    """A JPEG header with the given size (the backend only reads the header), no Pillow needed."""
    sof = b"\xff\xc0" + struct.pack(">HBHHB", 11, 8, h, w, 1) + b"\x01\x11\x00"
    return b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00" + sof + b"\xff\xda" + b"\0" * pad


def b64(data: bytes, prefix: bool = False) -> str:
    return ("data:image/jpeg;base64," if prefix else "") + base64.b64encode(data).decode()


CAP = {"artist": "Me", "title": "Night Drive", "year": "2026"}


@pytest.fixture()
def tid(client):
    covers.set_enabled(True)
    t = make_track("a")
    covers.save_cover(t, png_bytes())
    return t


def put(client, tid, caption, image=None):
    return client.put(f"/api/tracks/{tid}/cover/caption", json={"caption": caption, "image": image})


def track(client, tid):
    return next(t for t in client.get("/api/tracks").json()["data"] if t["id"] == tid)


def test_set_and_clear(client, tid):
    t = track(client, tid)
    assert t["cover_caption"] is None and t["cover_captioned_url"] is None
    r = put(client, tid, CAP, b64(jpeg(), prefix=True))
    assert r.status_code == 200
    body = r.json()
    assert body["cover_caption"] == CAP and body["id"] == tid
    assert body["cover_captioned_url"].startswith(f"/api/tracks/{tid}/cover/captioned?v=")
    baked = covers.captioned_file(tid)
    assert baked.is_file() and baked.parent == covers.cover_file(tid).parent
    g = client.get(body["cover_captioned_url"])
    assert g.status_code == 200 and g.content == baked.read_bytes() and g.headers["content-type"] == "image/jpeg"
    assert track(client, tid)["cover_caption"] == CAP

    # plain base64 works too; a caption without an image keeps the caption and drops the baked file
    assert put(client, tid, CAP, b64(jpeg())).status_code == 200 and baked.is_file()
    r = put(client, tid, {**CAP, "year": ""}, None)
    assert r.status_code == 200 and r.json()["cover_caption"]["year"] == "" and r.json()["cover_captioned_url"] is None
    assert not baked.exists()
    assert client.get(f"/api/tracks/{tid}/cover/captioned").status_code == 404

    put(client, tid, CAP, b64(jpeg()))
    r = put(client, tid, None, b64(jpeg()))  # image ignored on clear
    assert r.status_code == 200 and r.json()["cover_caption"] is None and r.json()["cover_captioned_url"] is None
    assert not baked.exists() and db.get_track(tid)["cover_caption"] is None


def test_covers_off_hides_url(client, tid):
    put(client, tid, CAP, b64(jpeg()))
    covers.set_enabled(False)
    assert track(client, tid)["cover_captioned_url"] is None and track(client, tid)["cover_caption"] == CAP


def test_validation(client, tid):
    baked = covers.captioned_file(tid)
    assert put(client, tid, {"t": "x" * 5000}).status_code == 422
    assert put(client, tid, ["a"]).status_code == 422
    assert put(client, tid, CAP, b64(b"not a jpeg at all")).status_code == 422
    assert put(client, tid, CAP, b64(png_bytes(600, 600))).status_code == 422
    assert put(client, tid, CAP, b64(jpeg(511, 1024))).status_code == 422
    assert put(client, tid, CAP, b64(jpeg(1024, 2049))).status_code == 422
    assert put(client, tid, CAP, b64(jpeg(512, 2048))).status_code == 200
    assert put(client, tid, CAP, "!!!not base64!!!").status_code == 422
    assert put(client, tid, CAP, b64(jpeg(pad=4 * 1024 * 1024 + 10))).status_code == 422
    assert db.get_track(tid)["cover_caption"] is not None and baked.is_file(), "rejected requests change nothing"
    assert not baked.with_name(baked.name + ".tmp").exists()


def test_not_found_and_no_cover(client, tid):
    assert put(client, 99999, CAP).status_code == 404
    bare = make_track("b")
    assert put(client, bare, CAP).status_code == 409
    client.delete(f"/api/tracks/{tid}")  # trash
    assert put(client, tid, CAP).status_code == 404


def test_stale_after_new_cover(client, tid):
    put(client, tid, CAP, b64(jpeg()))
    baked, clean = covers.captioned_file(tid), covers.cover_file(tid)
    # a clean cover newer than the baked file: stale, caption kept
    os.utime(baked, ns=(1_000_000_000_000, 1_000_000_000_000))
    t = track(client, tid)
    assert t["cover_captioned_url"] is None and t["cover_caption"] == CAP
    assert client.get(f"/api/tracks/{tid}/cover/captioned").status_code == 404
    # fresh again
    os.utime(baked, ns=(clean.stat().st_mtime_ns + 10**9,) * 2)
    assert track(client, tid)["cover_captioned_url"]
    # regenerating the cover deletes the baked file and keeps the caption
    covers.save_cover(tid, png_bytes(4, 4))
    assert not baked.exists()
    t = track(client, tid)
    assert t["cover_captioned_url"] is None and t["cover_caption"] == CAP


def test_download_picks_baked(client, tid, monkeypatch):
    seen = []

    async def fake(src, tags, cover=None):
        seen.append(cover)
        return None

    monkeypatch.setattr(routes_tracks.tagging, "write_tagged_copy", fake)
    client.get(f"/api/tracks/{tid}/download")
    assert seen[-1] == covers.cover_file(tid)
    put(client, tid, CAP, b64(jpeg()))
    client.get(f"/api/tracks/{tid}/download")
    assert seen[-1] == covers.captioned_file(tid)
    os.utime(covers.captioned_file(tid), ns=(1_000_000_000_000, 1_000_000_000_000))  # stale
    client.get(f"/api/tracks/{tid}/download")
    assert seen[-1] == covers.cover_file(tid)


def test_cleanup(client, tid):
    put(client, tid, CAP, b64(jpeg()))
    baked = covers.captioned_file(tid)
    r = client.delete(f"/api/tracks/{tid}/cover")
    assert r.status_code == 200 and not baked.exists()

    covers.save_cover(tid, png_bytes())
    put(client, tid, CAP, b64(jpeg()))
    client.delete(f"/api/tracks/{tid}")  # trash keeps it
    assert baked.exists()
    assert client.delete(f"/api/tracks/{tid}?permanent=true").status_code == 200
    assert not baked.exists()

    other = make_track("c")
    covers.save_cover(other, png_bytes())
    put(client, other, CAP, b64(jpeg()))
    client.delete(f"/api/tracks/{other}")
    client.post("/api/tracks/trash/empty")
    assert not covers.captioned_file(other).exists()
