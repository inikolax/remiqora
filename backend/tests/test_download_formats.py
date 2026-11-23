"""GET /api/tracks/{id}/download?format=mp3|flac|wav: transcoding with tags and an embedded cover.
Needs ffmpeg (skipped without); ffprobe is used for the codec/picture checks when it sits next to ffmpeg."""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import pytest

import test_gen_queue  # noqa: F401  (must set REMIQORA_DATA_DIR before anything imports app)
from test_track_covers import client, fresh_db, png_bytes  # noqa: F401
from app import covers, db, tagging
from app.api import routes_tracks
from app.api.routes_yue2_upload import get_ffmpeg_bin
from app.track_store import store_track

FFMPEG = get_ffmpeg_bin()
pytestmark = pytest.mark.skipif(not FFMPEG, reason="ffmpeg not available")


def _ffprobe():
    if not FFMPEG:
        return None
    cand = Path(FFMPEG).with_name("ffprobe.exe" if FFMPEG.lower().endswith(".exe") else "ffprobe")
    return str(cand) if cand.is_file() else shutil.which("ffprobe")


def probe(path: Path) -> dict:
    exe = _ffprobe()
    if not exe:
        pytest.skip("ffprobe not available")
    out = subprocess.run([exe, "-v", "error", "-print_format", "json", "-show_streams", "-show_format", str(path)],
                         capture_output=True, check=True).stdout
    return json.loads(out)


def sine_wav(path: Path, fmt: str = "pcm_s16le", rate: int = 44100) -> None:
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-f", "lavfi", "-i", f"sine=frequency=440:duration=1:sample_rate={rate}",
                    "-c:a", fmt, str(path)], check=True)


def make(tmp_path: Path, fmt: str = "pcm_s16le", rate: int = 44100, cover: bool = True) -> int:
    wav = tmp_path / "src.wav"
    sine_wav(wav, fmt, rate)
    tid = store_track(model="yue2", title="Night Drive", lyrics="la la la", seed=7, duration_ms=1000.0, wall_ms=None,
                      params={"style": "synthwave"}, audio=wav.read_bytes(), ext="wav", abc=None)["id"]
    if cover:
        covers.set_enabled(True)
        covers.save_cover(tid, png_bytes(64, 64))
    return tid


def save(client, tid, fmt, tmp_path) -> tuple:
    r = client.get(f"/api/tracks/{tid}/download", params={"format": fmt} if fmt else {})
    out = tmp_path / f"dl.{fmt or 'src'}"
    out.write_bytes(r.content)
    return r, out


@pytest.mark.parametrize("fmt,ctype,codec", [("mp3", "audio/mpeg", "mp3"), ("flac", "audio/flac", "flac")])
def test_transcode_with_cover_and_tags(client, tmp_path, fmt, ctype, codec):
    tid = make(tmp_path)
    r, out = save(client, tid, fmt, tmp_path)
    assert r.status_code == 200
    assert r.headers["content-type"].startswith(ctype)
    assert f'.{fmt}"' in r.headers["content-disposition"] or f".{fmt}" in r.headers["content-disposition"]
    info = probe(out)
    audio = [s for s in info["streams"] if s["codec_type"] == "audio"]
    assert audio and audio[0]["codec_name"] == codec and audio[0]["sample_rate"] == "44100"
    pics = [s for s in info["streams"] if s["codec_type"] == "video"]
    assert pics and pics[0]["codec_name"] == "mjpeg" and pics[0]["disposition"]["attached_pic"] == 1
    tags = {k.lower(): v for k, v in info["format"].get("tags", {}).items()}
    assert tags.get("title") == "Night Drive" and tags.get("encoded_by") == "Remiqora"
    if codec == "mp3":
        assert audio[0]["bit_rate"] == "320000"
    else:
        assert audio[0]["bits_per_raw_sample"] == "16"
    blob = out.read_bytes()
    assert b"la la la" in blob, "lyrics are written into the tags"


def test_wav_same_format_is_copy(client, tmp_path):
    tid = make(tmp_path)
    r, out = save(client, tid, "wav", tmp_path)
    assert r.status_code == 200 and "wav" in r.headers["content-type"]
    info = probe(out)
    assert [s["codec_type"] for s in info["streams"]] == ["audio"]
    assert info["streams"][0]["codec_name"] == "pcm_s16le"
    assert info["format"]["tags"].get("title") == "Night Drive"


def test_flac_24bit_and_wav_from_flac(client, tmp_path):
    tid = make(tmp_path, fmt="pcm_s24le", rate=48000)
    r, out = save(client, tid, "flac", tmp_path)
    s = probe(out)["streams"][0]
    assert r.status_code == 200 and s["codec_name"] == "flac" and s["bits_per_raw_sample"] == "24" and s["sample_rate"] == "48000"
    # float source goes to s24 flac
    tid2 = make(tmp_path, fmt="pcm_f32le")
    r, out = save(client, tid2, "flac", tmp_path)
    assert probe(out)["streams"][0]["bits_per_raw_sample"] == "24"


def test_mp3_resamples_above_48k(client, tmp_path):
    tid = make(tmp_path, rate=96000)
    r, out = save(client, tid, "mp3", tmp_path)
    assert r.status_code == 200 and probe(out)["streams"][0]["sample_rate"] == "48000"


def test_wav_target_from_other_source(tmp_path):
    import asyncio
    flac = tmp_path / "a.flac"
    subprocess.run([FFMPEG, "-y", "-loglevel", "error", "-f", "lavfi", "-i", "sine=duration=1", "-c:a", "flac", str(flac)], check=True)
    out = asyncio.run(tagging.write_tagged_copy(flac, {"title": "x"}, png_path(tmp_path), fmt="wav"))
    try:
        info = probe(out)
        assert info["streams"][0]["codec_name"] == "pcm_s16le" and len(info["streams"]) == 1
    finally:
        out.unlink(missing_ok=True)


def png_path(tmp_path: Path) -> Path:
    p = tmp_path / "c.png"
    p.write_bytes(png_bytes(32, 32))
    return p


def test_no_cover_and_bad_format_and_absent(client, tmp_path):
    tid = make(tmp_path, cover=False)
    r, out = save(client, tid, "mp3", tmp_path)
    assert r.status_code == 200 and [s["codec_type"] for s in probe(out)["streams"]] == ["audio"]
    assert client.get(f"/api/tracks/{tid}/download", params={"format": "ogg"}).status_code == 422
    r = client.get(f"/api/tracks/{tid}/download")
    assert r.status_code == 200 and ".wav" in r.headers["content-disposition"]
    assert r.content[:4] == b"RIFF"


def test_failure_503_for_other_format_but_original_for_same(client, tmp_path, monkeypatch):
    tid = make(tmp_path)

    async def none(*a, **k):
        return None

    monkeypatch.setattr(routes_tracks.tagging, "write_tagged_copy", none)
    r = client.get(f"/api/tracks/{tid}/download", params={"format": "mp3"})
    assert r.status_code == 503 and "error" in r.json()
    r = client.get(f"/api/tracks/{tid}/download", params={"format": "wav"})
    assert r.status_code == 200 and r.headers.get("x-tags") == "skipped"
