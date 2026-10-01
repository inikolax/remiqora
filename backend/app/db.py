"""Shared track storage for both models: one SQLite DB (distinguished by a
`model` column) plus generated files split into a subfolder per model under
DATA_DIR/files. Centralizing this here (instead of relying on each model's
own, separate storage - YuE2's built-in history.db, ACE-Step's ephemeral temp
dir) is what makes "one project, one place for everything it generated" true.
"""
from __future__ import annotations

import json
import shutil
import sqlite3
import time
from pathlib import Path
from typing import Any, Optional

from .config import DATA_DIR

DB_PATH = DATA_DIR / "aicollector.db"
FILES_DIR = DATA_DIR / "files"

_db: Optional[sqlite3.Connection] = None


def get_db() -> sqlite3.Connection:
    global _db
    if _db is None:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        _db = sqlite3.connect(DB_PATH, check_same_thread=False)
        _db.row_factory = sqlite3.Row
        _db.execute("PRAGMA journal_mode = WAL;")
        _db.execute("PRAGMA synchronous = NORMAL;")
        _db.execute("PRAGMA foreign_keys = ON;")
        _db.execute("PRAGMA busy_timeout = 5000;")
        _db.execute(
            """
            CREATE TABLE IF NOT EXISTS tracks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                model TEXT NOT NULL,
                created_at TEXT NOT NULL,
                title TEXT NOT NULL DEFAULT '',
                lyrics TEXT NOT NULL DEFAULT '',
                seed INTEGER,
                duration_ms REAL,
                wall_ms REAL,
                params_json TEXT NOT NULL DEFAULT '{}',
                audio_path TEXT NOT NULL,
                abc_path TEXT
            )
            """
        )
        _db.commit()
        cols = {r["name"] for r in _db.execute("PRAGMA table_info(tracks)").fetchall()}
        if "stems_json" not in cols:
            _db.execute("ALTER TABLE tracks ADD COLUMN stems_json TEXT")
            _db.commit()
        if "mix_settings_json" not in cols:
            _db.execute("ALTER TABLE tracks ADD COLUMN mix_settings_json TEXT")
            _db.commit()
        if "midi_json" not in cols:
            _db.execute("ALTER TABLE tracks ADD COLUMN midi_json TEXT")
            _db.commit()
        _db.execute(
            """
            CREATE TABLE IF NOT EXISTS projects (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                name TEXT NOT NULL DEFAULT 'Untitled project',
                data_json TEXT NOT NULL DEFAULT '{}'
            )
            """
        )
        _db.commit()
        _db.execute("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)")
        _db.execute("CREATE INDEX IF NOT EXISTS idx_tracks_model_id ON tracks(model, id DESC);")
        _db.execute("CREATE INDEX IF NOT EXISTS idx_tracks_created ON tracks(created_at DESC);")
        _db.execute("CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC);")
        _db.commit()
    return _db


def model_dir(model: str) -> Path:
    d = FILES_DIR / model
    d.mkdir(parents=True, exist_ok=True)
    return d


def stems_dir(model: str, track_id: int) -> Path:
    return FILES_DIR / model / "stems" / str(track_id)


def midi_dir(model: str, track_id: int) -> Path:
    return FILES_DIR / model / "midi" / str(track_id)


def insert_track(
    *,
    model: str,
    title: str,
    lyrics: str,
    seed: Optional[int],
    duration_ms: Optional[float],
    wall_ms: Optional[float],
    params: dict[str, Any],
    audio_path: Path,
    abc_path: Optional[Path],
) -> int:
    db = get_db()
    cur = db.execute(
        "INSERT INTO tracks (model, created_at, title, lyrics, seed, duration_ms, wall_ms, params_json, audio_path, abc_path)"
        " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (
            model,
            time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            title,
            lyrics,
            seed,
            duration_ms,
            wall_ms,
            json.dumps(params, ensure_ascii=False),
            str(audio_path),
            str(abc_path) if abc_path else None,
        ),
    )
    db.commit()
    return cur.lastrowid


def list_tracks(model: Optional[str] = None) -> list[sqlite3.Row]:
    db = get_db()
    if model:
        return db.execute("SELECT * FROM tracks WHERE model = ? ORDER BY id DESC", (model,)).fetchall()
    return db.execute("SELECT * FROM tracks ORDER BY id DESC").fetchall()


def get_track(track_id: int) -> Optional[sqlite3.Row]:
    db = get_db()
    return db.execute("SELECT * FROM tracks WHERE id = ?", (track_id,)).fetchone()


def update_track_title(track_id: int, title: str) -> bool:
    db = get_db()
    if not get_track(track_id):
        return False
    db.execute("UPDATE tracks SET title = ? WHERE id = ?", (title, track_id))
    db.commit()
    return True


def update_track_stems(track_id: int, stems: Optional[dict[str, str]]) -> None:
    db = get_db()
    db.execute(
        "UPDATE tracks SET stems_json = ? WHERE id = ?",
        (json.dumps(stems, ensure_ascii=False) if stems else None, track_id),
    )
    db.commit()


def get_mix_settings(track_id: int) -> Optional[dict]:
    row = get_track(track_id)
    return json.loads(row["mix_settings_json"]) if row and row["mix_settings_json"] else None


def update_track_mix_settings(track_id: int, settings: Optional[dict]) -> None:
    db = get_db()
    db.execute(
        "UPDATE tracks SET mix_settings_json = ? WHERE id = ?",
        (json.dumps(settings, ensure_ascii=False) if settings else None, track_id),
    )
    db.commit()


def delete_track_stems(track_id: int) -> bool:
    row = get_track(track_id)
    if not row or not row["stems_json"]:
        return False
    shutil.rmtree(stems_dir(row["model"], track_id), ignore_errors=True)
    update_track_stems(track_id, None)
    return True


def get_track_midi(track_id: int) -> dict[str, str]:
    row = get_track(track_id)
    return json.loads(row["midi_json"]) if row and row["midi_json"] else {}


def set_track_midi_entry(track_id: int, source: str, path: Optional[Path]) -> None:
    """Add or drop one source's .mid without touching the others - each source
    (full mix, and each stem) is transcribed by its own job."""
    current = get_track_midi(track_id)
    if path is None:
        current.pop(source, None)
    else:
        current[source] = str(path)
    db = get_db()
    db.execute(
        "UPDATE tracks SET midi_json = ? WHERE id = ?",
        (json.dumps(current, ensure_ascii=False) if current else None, track_id),
    )
    db.commit()


def delete_track_midi(track_id: int) -> bool:
    row = get_track(track_id)
    if not row or not row["midi_json"]:
        return False
    shutil.rmtree(midi_dir(row["model"], track_id), ignore_errors=True)
    db = get_db()
    db.execute("UPDATE tracks SET midi_json = NULL WHERE id = ?", (track_id,))
    db.commit()
    return True


def insert_project(*, name: str, data: dict) -> int:
    db = get_db()
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    cur = db.execute(
        "INSERT INTO projects (created_at, updated_at, name, data_json) VALUES (?, ?, ?, ?)",
        (now, now, name, json.dumps(data, ensure_ascii=False)),
    )
    db.commit()
    return cur.lastrowid


def list_projects() -> list[sqlite3.Row]:
    db = get_db()
    return db.execute("SELECT id, created_at, updated_at, name FROM projects ORDER BY updated_at DESC").fetchall()


def get_project(project_id: int) -> Optional[sqlite3.Row]:
    db = get_db()
    return db.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()


def update_project(project_id: int, *, name: Optional[str], data: Optional[dict]) -> None:
    db = get_db()
    row = get_project(project_id)
    if not row:
        return
    new_name = name if name is not None else row["name"]
    new_data_json = json.dumps(data, ensure_ascii=False) if data is not None else row["data_json"]
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    db.execute(
        "UPDATE projects SET name = ?, data_json = ?, updated_at = ? WHERE id = ?",
        (new_name, new_data_json, now, project_id),
    )
    db.commit()


def delete_project(project_id: int) -> bool:
    db = get_db()
    if not get_project(project_id):
        return False
    db.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    db.commit()
    return True


def delete_track(track_id: int) -> bool:
    db = get_db()
    row = get_track(track_id)
    if not row:
        return False
    for p in (row["audio_path"], row["abc_path"]):
        if p:
            try:
                Path(p).unlink(missing_ok=True)
            except OSError:
                pass
    if row["stems_json"]:
        shutil.rmtree(stems_dir(row["model"], track_id), ignore_errors=True)
    if row["midi_json"]:
        shutil.rmtree(midi_dir(row["model"], track_id), ignore_errors=True)
    db.execute("DELETE FROM tracks WHERE id = ?", (track_id,))
    db.commit()
    return True


def get_setting(key: str, default: str = "") -> str:
    row = get_db().execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
    return row["value"] if row else default


def set_setting(key: str, value: str) -> None:
    db = get_db()
    db.execute(
        "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (key, value),
    )
    db.commit()
