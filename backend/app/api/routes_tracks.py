"""Unified track storage endpoints used by both models' frontends.

Generation itself still goes straight to the active model's own API via
routes_proxy.py; once a track is finished, the frontend uploads it here so
it lands in one shared place (DATA_DIR/files/<model>/ + one SQLite DB) instead
of each model's own, separate storage.
"""
from __future__ import annotations

import json
import re
import shutil
import time
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Body, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse
from starlette.background import BackgroundTask

from .. import db, tagging
from ..config import MODELS

router = APIRouter(prefix="/api/tracks", tags=["tracks"])

ALLOWED_AUDIO_EXT = {"wav", "mp3", "flac"}
ALLOWED_TRACK_MODELS = set(MODELS.keys()) | {"editor", "upload"}


def _sanitize(text: str) -> str:
    text = re.sub(r"\W+", "_", (text or "")[:40], flags=re.UNICODE)
    return text.strip("_") or "track"


def _create_unique(target_dir: Path, base: str, ext: str, with_abc: bool):
    """Create the audio file (and reserve the .abc name) under a name no
    other track uses. Filenames only carry second resolution, so two saves in
    the same second with the same title used to land on one file, and
    deleting either track then removed the other's audio."""
    n = 0
    while True:
        stem = base if n == 0 else f"{base}_{n}"
        n += 1
        abc_path = target_dir / f"{stem}.abc" if with_abc else None
        if abc_path is not None and abc_path.exists():
            continue
        audio_path = target_dir / f"{stem}.{ext}"
        try:
            f = open(audio_path, "xb")
        except FileExistsError:
            continue
        return audio_path, abc_path, f


def _row_to_dict(row) -> dict:
    audio_path = Path(row["audio_path"])
    return {
        "id": row["id"],
        "model": row["model"],
        "created_at": row["created_at"],
        "title": row["title"],
        "lyrics": row["lyrics"],
        "seed": row["seed"],
        "duration_ms": row["duration_ms"],
        "wall_ms": row["wall_ms"],
        "params": json.loads(row["params_json"] or "{}"),
        "filename": audio_path.name,
        "audio_url": f"/api/tracks/{row['id']}/audio",
        "abc_url": f"/api/tracks/{row['id']}/abc" if row["abc_path"] else None,
        "stems": (
            {n: f"/api/tracks/{row['id']}/stems/{n}" for n in json.loads(row["stems_json"]).keys()}
            if row["stems_json"]
            else None
        ),
        "midi": (
            {s: f"/api/tracks/{row['id']}/midi/{s}" for s in json.loads(row["midi_json"]).keys()}
            if row["midi_json"]
            else None
        ),
    }


@router.post("")
async def save_track(
    model: str = Form(...),
    title: str = Form(""),
    lyrics: str = Form(""),
    seed: Optional[int] = Form(None),
    duration_ms: Optional[float] = Form(None),
    wall_ms: Optional[float] = Form(None),
    params: str = Form("{}"),
    abc: Optional[str] = Form(None),
    audio: UploadFile = File(...),
):
    if model not in ALLOWED_TRACK_MODELS:
        raise HTTPException(status_code=400, detail=f"unknown track model/origin '{model}'")
    try:
        params_dict = json.loads(params) if params else {}
    except json.JSONDecodeError:
        params_dict = {}

    ext = (audio.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_AUDIO_EXT:
        ext = "wav"
    ts = time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())
    base = f"{ts}_{_sanitize(title)}"
    target_dir = db.model_dir(model)
    audio_path, abc_path, f = _create_unique(target_dir, base, ext, bool(abc and abc.strip()))
    abc_written = False

    try:
        with f:
            shutil.copyfileobj(audio.file, f)

        if abc_path is not None:
            with open(abc_path, "x", encoding="utf-8") as af:
                abc_written = True
                af.write(abc)

        track_id = db.insert_track(
            model=model,
            title=title,
            lyrics=lyrics,
            seed=seed,
            duration_ms=duration_ms,
            wall_ms=wall_ms,
            params=params_dict,
            audio_path=audio_path,
            abc_path=abc_path,
        )
    except Exception:
        audio_path.unlink(missing_ok=True)
        if abc_written:
            abc_path.unlink(missing_ok=True)
        raise

    row = db.get_track(track_id)
    return _row_to_dict(row)


@router.post("/upload")
async def upload_track(
    audio: UploadFile = File(...),
    title: Optional[str] = Form(None),
):
    ext = (audio.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_AUDIO_EXT:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(ALLOWED_AUDIO_EXT)}",
        )

    track_title = title.strip() if title and title.strip() else (audio.filename or "uploaded_track").rsplit(".", 1)[0]
    ts = time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())
    base = f"{ts}_{_sanitize(track_title)}"
    target_dir = db.model_dir("upload")
    audio_path, _, f = _create_unique(target_dir, base, ext, False)

    try:
        with f:
            shutil.copyfileobj(audio.file, f)

        track_id = db.insert_track(
            model="upload",
            title=track_title,
            lyrics="",
            seed=None,
            duration_ms=None,
            wall_ms=None,
            params={"source": "user_upload"},
            audio_path=audio_path,
            abc_path=None,
        )
    except Exception:
        audio_path.unlink(missing_ok=True)
        raise

    row = db.get_track(track_id)
    return _row_to_dict(row)


@router.get("")
async def list_tracks(model: Optional[str] = None):
    if model is not None and model not in ALLOWED_TRACK_MODELS:
        raise HTTPException(status_code=400, detail=f"unknown track model/origin '{model}'")
    return {"data": [_row_to_dict(r) for r in db.list_tracks(model)]}


@router.get("/{track_id}/audio")
async def track_audio(track_id: int):
    row = db.get_track(track_id)
    if not row or not Path(row["audio_path"]).exists():
        return JSONResponse({"error": "audio not found"}, status_code=404)
    return FileResponse(row["audio_path"])


@router.get("/{track_id}/download")
async def track_download(track_id: int, album: Optional[str] = Query(None, max_length=120), track_no: Optional[int] = Query(None, ge=1, le=999)):
    """The track as a download: a copy with title, artist, lyrics, cover-ready tags and the AI-generated
    marks written in. The artist is the app-wide setting. The stored file is not changed; if tagging
    is not possible (no ffmpeg) the original is served."""
    row = db.get_track(track_id)
    src = Path(row["audio_path"]) if row else None
    if not row or not src or not src.exists():
        return JSONResponse({"error": "audio not found"}, status_code=404)
    ext = src.suffix.lower().lstrip(".")
    params = json.loads(row["params_json"] or "{}")
    tags = tagging.build_tags(row, params, db.get_setting("artist", ""), album=album, track_no=track_no)
    name = tagging.download_name(tags, ext)
    tagged = await tagging.write_tagged_copy(src, tags)
    if tagged is None:
        return FileResponse(src, filename=name, headers={"X-Tags": "skipped"})
    return FileResponse(tagged, filename=name, background=BackgroundTask(lambda: tagged.unlink(missing_ok=True)))


@router.get("/{track_id}/abc")
async def track_abc(track_id: int):
    row = db.get_track(track_id)
    if not row or not row["abc_path"] or not Path(row["abc_path"]).exists():
        return JSONResponse({"error": "track has no ABC plan"}, status_code=404)
    return PlainTextResponse(Path(row["abc_path"]).read_text(encoding="utf-8"))


@router.put("/{track_id}")
async def rename_track(track_id: int, title: str = Body(..., embed=True)):
    if not db.update_track_title(track_id, title):
        raise HTTPException(status_code=404, detail="track not found")
    return _row_to_dict(db.get_track(track_id))


@router.get("/{track_id}/mix")
async def get_mix_settings(track_id: int):
    row = db.get_track(track_id)
    if not row:
        raise HTTPException(status_code=404, detail="track not found")
    return {"settings": db.get_mix_settings(track_id)}


@router.put("/{track_id}/mix")
async def put_mix_settings(track_id: int, settings: dict = Body(...)):
    row = db.get_track(track_id)
    if not row:
        raise HTTPException(status_code=404, detail="track not found")
    db.update_track_mix_settings(track_id, settings)
    return {"settings": settings}


@router.delete("/{track_id}")
async def delete_track(track_id: int):
    if not db.delete_track(track_id):
        return JSONResponse({"error": "not found"}, status_code=404)
    return {"deleted": True}
