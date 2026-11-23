"""Reimplements the one non-trivial thing YuE2's own web-ui/server.py did
beyond plain proxying: transcoding a non-WAV upload to WAV before forwarding
it to the native server's /v1/ui/upload (its WAV reader only accepts an
actual WAV container - PCM/float/A-law/mu-law - and rejects mp3/m4a/flac/etc).
We no longer run that server.py process at all, so this lives here instead.
"""
from __future__ import annotations

import asyncio
import os
import shutil
import sys
import tempfile
from pathlib import Path

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse, Response

from .. import aproc
from ..config import FFMPEG_BIN_DIR, MODELS
from ..orchestrator.manager import manager
from ..orchestrator.state import ModelStatus
from .routes_proxy import _HOP_BY_HOP, _client

router = APIRouter(prefix="/api/yue2")

IS_WINDOWS = sys.platform == "win32"


def get_ffmpeg_bin() -> str | None:
    candidate = FFMPEG_BIN_DIR / ("ffmpeg.exe" if IS_WINDOWS else "ffmpeg")
    if candidate.is_file():
        return str(candidate)
    env_bin = os.environ.get("FFMPEG_BIN")
    if env_bin:
        found = shutil.which(env_bin)
        if found:
            return found
        if Path(env_bin).is_file():
            return env_bin
    return shutil.which("ffmpeg")


async def _to_wav(data: bytes) -> bytes:
    ffmpeg_bin = get_ffmpeg_bin()
    if not ffmpeg_bin:
        raise HTTPException(status_code=500, detail="ffmpeg not found on PATH or in FFMPEG_BIN_DIR")
    # A regular (seekable) output file, not a pipe: ffmpeg can't know the
    # final byte count up front when muxing WAV, and on a pipe it can't seek
    # back afterwards to patch the RIFF/data chunk sizes.
    fd, out_path = tempfile.mkstemp(suffix=".wav")
    os.close(fd)
    try:
        proc = await aproc.create_subprocess_exec(
            ffmpeg_bin, "-hide_banner", "-loglevel", "error", "-y",
            "-i", "pipe:0", "-ac", "1", "-ar", "44100", "-c:a", "pcm_s16le", out_path,
            stdin=aproc.PIPE, stdout=aproc.PIPE, stderr=aproc.PIPE, stream_stdout=False,
        )
        _, stderr = await proc.communicate(input=data)
        if proc.returncode != 0:
            raise HTTPException(status_code=400, detail=f"Audio conversion to WAV failed: {stderr.decode('utf-8', 'replace').strip()[:500]}")
        return Path(out_path).read_bytes()
    finally:
        try:
            os.unlink(out_path)
        except OSError:
            pass


@router.post("/v1/ui/upload")
async def upload_audio(request: Request):
    rs = manager.state.models["yue2"]
    if rs.status != ModelStatus.RUNNING:
        return JSONResponse({"error": "model 'yue2' is not active"}, status_code=503)

    body = await request.body()
    filename = request.headers.get("x-audiocpp-filename", "upload.bin")
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext != "wav":
        body = await _to_wav(body)
        filename = "upload.wav"

    headers = {
        k: v for k, v in request.headers.items()
        if k.lower() not in _HOP_BY_HOP and k.lower() not in ("content-type", "x-audiocpp-filename")
    }
    headers["Content-Type"] = "audio/wav"
    headers["X-AudioCPP-Filename"] = filename

    try:
        upstream = await _client.post(f"{MODELS['yue2'].proxy_target}/v1/ui/upload", headers=headers, content=body)
    except httpx.HTTPError as exc:
        return JSONResponse({"error": f"upstream request failed: {exc}"}, status_code=502)
    response_headers = {k: v for k, v in upstream.headers.items() if k.lower() not in _HOP_BY_HOP}
    return Response(content=upstream.content, status_code=upstream.status_code, headers=response_headers)
