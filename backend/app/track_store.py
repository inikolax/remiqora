"""Saving a finished take into the library: the audio (and the ABC plan, if any) under DATA_DIR/files/<model>/ plus
one row in the tracks table. Shared by POST /api/tracks (the browser uploads a take) and the server-side generation
queue (app/gen_queue.py), which saves its takes itself instead of making an HTTP call to its own backend.
"""
from __future__ import annotations

import re
import shutil
import sqlite3
import time
from pathlib import Path
from typing import Any, BinaryIO, Optional, Union

from . import db

ALLOWED_AUDIO_EXT = {"wav", "mp3", "flac"}


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


def store_track(
    *,
    model: str,
    title: str,
    lyrics: str,
    seed: Optional[int],
    duration_ms: Optional[float],
    wall_ms: Optional[float],
    params: dict[str, Any],
    audio: Union[bytes, BinaryIO],
    ext: str,
    abc: Optional[str] = None,
) -> sqlite3.Row:
    """Writes the files and inserts the row; returns the new track row. `audio` is the bytes or a readable file.
    An unknown extension is stored as .wav (what POST /api/tracks always did). Nothing is left behind on failure."""
    ext = (ext or "").lower()
    if ext not in ALLOWED_AUDIO_EXT:
        ext = "wav"
    ts = time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())
    base = f"{ts}_{_sanitize(title)}"
    target_dir = db.model_dir(model)
    audio_path, abc_path, f = _create_unique(target_dir, base, ext, bool(abc and abc.strip()))
    abc_written = False

    try:
        with f:
            if isinstance(audio, (bytes, bytearray, memoryview)):
                f.write(audio)
            else:
                shutil.copyfileobj(audio, f)

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
            params=params,
            audio_path=audio_path,
            abc_path=abc_path,
        )
    except Exception:
        audio_path.unlink(missing_ok=True)
        if abc_written:
            abc_path.unlink(missing_ok=True)
        raise

    return db.get_track(track_id)
