"""Shared track storage for both models: one SQLite DB (distinguished by a
`model` column) plus generated files split into a subfolder per model under
DATA_DIR/files. Centralizing this here (instead of relying on each model's
own, separate storage - YuE2's built-in history.db, ACE-Step's ephemeral temp
dir) is what makes "one project, one place for everything it generated" true.
"""
from __future__ import annotations

import functools
import json
import re
import shutil
import sqlite3
import threading
import time
from pathlib import Path
from typing import Any, Optional

from .config import DATA_DIR

DB_PATH = DATA_DIR / "aicollector.db"
FILES_DIR = DATA_DIR / "files"

_db: Optional[sqlite3.Connection] = None
# One connection serves every thread (FastAPI runs sync routes and asyncio.to_thread work in a pool), and a
# sqlite3 connection must not be used by two threads at once: parallel requests at startup failed with
# "bad parameter or other API misuse". Every function here holds this lock while it uses the connection;
# it is reentrant because they call each other (update_project reads the project first, ...).
_lock = threading.RLock()


def _locked(fn):
    @functools.wraps(fn)
    def wrapper(*args, **kwargs):
        with _lock:
            return fn(*args, **kwargs)
    return wrapper


@_locked
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
        if "favorite" not in cols:
            _db.execute("ALTER TABLE tracks ADD COLUMN favorite INTEGER NOT NULL DEFAULT 0")
            _db.commit()
        if "deleted_at" not in cols:
            # NULL = in the library, a timestamp = in the trash since then.
            _db.execute("ALTER TABLE tracks ADD COLUMN deleted_at TEXT")
            _db.commit()
        if "cover_path" not in cols:
            # The album cover's PNG (app/covers.py), NULL when the track has none.
            _db.execute("ALTER TABLE tracks ADD COLUMN cover_path TEXT")
            _db.commit()
        if "cover_prompt" not in cols:
            # The description the track's cover was last drawn from (or was asked to be): Another cover and the
            # description editor start from it. NULL until a cover is made or a description is given.
            _db.execute("ALTER TABLE tracks ADD COLUMN cover_prompt TEXT")
            _db.commit()
        if "cover_caption" not in cols:
            # JSON of the text caption (artist, title, year) drawn over the cover by the browser; NULL: none.
            _db.execute("ALTER TABLE tracks ADD COLUMN cover_caption TEXT")
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
        # Collections: named sets of tracks. A track may sit in several; deleting a track or a collection
        # drops its memberships (foreign_keys is on).
        _db.execute("CREATE TABLE IF NOT EXISTS collections (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, name TEXT NOT NULL)")
        _db.execute(
            "CREATE TABLE IF NOT EXISTS collection_tracks ("
            " collection_id INTEGER NOT NULL REFERENCES collections(id) ON DELETE CASCADE,"
            " track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,"
            " added_at TEXT NOT NULL,"
            " PRIMARY KEY (collection_id, track_id))"
        )
        _db.execute("CREATE INDEX IF NOT EXISTS idx_collection_tracks_track ON collection_tracks(track_id);")
        # Tags: free-form labels per track. The column is NOCASE, so "Rock" and "rock" are one tag; the
        # spelling stored first stays.
        _db.execute(
            "CREATE TABLE IF NOT EXISTS track_tags ("
            " track_id INTEGER NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,"
            " tag TEXT NOT NULL COLLATE NOCASE,"
            " added_at TEXT NOT NULL,"
            " PRIMARY KEY (track_id, tag))"
        )
        _db.execute("CREATE INDEX IF NOT EXISTS idx_track_tags_tag ON track_tags(tag);")
        _db.execute("CREATE INDEX IF NOT EXISTS idx_tracks_model_id ON tracks(model, id DESC);")
        _db.execute("CREATE INDEX IF NOT EXISTS idx_tracks_created ON tracks(created_at DESC);")
        _db.execute("CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC);")
        _db.commit()
        # The server-side generation queue (app/gen_queue.py): one row per engine call. request_json is the engine
        # body as the Create form built it, save_json what the finished takes are saved with.
        _db.execute(
            """
            CREATE TABLE IF NOT EXISTS jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                engine TEXT NOT NULL,
                status TEXT NOT NULL,
                batch_id TEXT NOT NULL DEFAULT '',
                batch_index INTEGER NOT NULL DEFAULT 0,
                takes INTEGER NOT NULL DEFAULT 1,
                title TEXT NOT NULL DEFAULT '',
                request_json TEXT NOT NULL DEFAULT '{}',
                save_json TEXT NOT NULL DEFAULT '{}',
                ref_path TEXT,
                engine_task_id TEXT,
                stage TEXT,
                progress REAL,
                error TEXT,
                track_ids_json TEXT NOT NULL DEFAULT '[]',
                attempts INTEGER NOT NULL DEFAULT 0,
                cancel_requested INTEGER NOT NULL DEFAULT 0,
                dismissed INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                started_at TEXT,
                finished_at TEXT
            )
            """
        )
        _db.execute("CREATE INDEX IF NOT EXISTS idx_jobs_status_id ON jobs(status, id);")
        # files of deleted tracks that could not be removed (locked on Windows, ...): retried at startup
        _db.execute(
            "CREATE TABLE IF NOT EXISTS pending_deletions (path TEXT PRIMARY KEY, is_dir INTEGER NOT NULL DEFAULT 0,"
            " added_at TEXT NOT NULL)"
        )
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


@_locked
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


@_locked
def list_tracks(model: Optional[str] = None) -> list[sqlite3.Row]:
    db = get_db()
    """The library: tracks that are not in the trash."""
    if model:
        return db.execute("SELECT * FROM tracks WHERE deleted_at IS NULL AND model = ? ORDER BY id DESC", (model,)).fetchall()
    return db.execute("SELECT * FROM tracks WHERE deleted_at IS NULL ORDER BY id DESC").fetchall()


@_locked
def list_trashed_tracks() -> list[sqlite3.Row]:
    """The trash, most recently trashed first."""
    return get_db().execute("SELECT * FROM tracks WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC, id DESC").fetchall()


@_locked
def get_track(track_id: int) -> Optional[sqlite3.Row]:
    db = get_db()
    return db.execute("SELECT * FROM tracks WHERE id = ?", (track_id,)).fetchone()


@_locked
def update_track_title(track_id: int, title: str) -> bool:
    db = get_db()
    if not get_track(track_id):
        return False
    db.execute("UPDATE tracks SET title = ? WHERE id = ?", (title, track_id))
    db.commit()
    return True


@_locked
def set_track_favorite(track_id: int, favorite: bool) -> bool:
    db = get_db()
    if not get_track(track_id):
        return False
    db.execute("UPDATE tracks SET favorite = ? WHERE id = ?", (1 if favorite else 0, track_id))
    db.commit()
    return True


@_locked
def set_track_cover(track_id: int, path: Optional[Path]) -> bool:
    """Points the track at its cover PNG (None: no cover). False when the track does not exist."""
    db = get_db()
    cur = db.execute("UPDATE tracks SET cover_path = ? WHERE id = ?", (str(path) if path else None, track_id))
    db.commit()
    return cur.rowcount > 0


@_locked
def set_track_cover_caption(track_id: int, caption_json: Optional[str]) -> bool:
    """Keeps the caption settings as JSON text (None: no caption). False when the track does not exist."""
    db = get_db()
    cur = db.execute("UPDATE tracks SET cover_caption = ? WHERE id = ?", (caption_json, track_id))
    db.commit()
    return cur.rowcount > 0


@_locked
def set_track_cover_prompt(track_id: int, prompt: Optional[str]) -> bool:
    """Keeps the description the track's cover is drawn from (None or empty: forget it). False when the track does
    not exist."""
    db = get_db()
    text = (prompt or "").strip() or None
    cur = db.execute("UPDATE tracks SET cover_prompt = ? WHERE id = ?", (text, track_id))
    db.commit()
    return cur.rowcount > 0


def _now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


@_locked
def collection_ids_by_track() -> dict[int, list[int]]:
    """track id -> the collections it is in; one query for a whole listing."""
    out: dict[int, list[int]] = {}
    for r in get_db().execute("SELECT collection_id, track_id FROM collection_tracks ORDER BY collection_id").fetchall():
        out.setdefault(r["track_id"], []).append(r["collection_id"])
    return out


@_locked
def list_collections() -> list[dict]:
    db = get_db()
    members: dict[int, list[int]] = {}
    # A track in the trash is not counted as a member (it is back in the collection when restored).
    for r in db.execute(
        "SELECT ct.collection_id, ct.track_id FROM collection_tracks ct JOIN tracks t ON t.id = ct.track_id"
        " WHERE t.deleted_at IS NULL ORDER BY ct.added_at, ct.track_id"
    ).fetchall():
        members.setdefault(r["collection_id"], []).append(r["track_id"])
    return [
        {"id": r["id"], "name": r["name"], "created_at": r["created_at"], "track_ids": members.get(r["id"], [])}
        for r in db.execute("SELECT * FROM collections ORDER BY id").fetchall()
    ]


@_locked
def get_collection(collection_id: int) -> Optional[dict]:
    return next((c for c in list_collections() if c["id"] == collection_id), None)


@_locked
def insert_collection(name: str) -> int:
    db = get_db()
    cur = db.execute("INSERT INTO collections (created_at, name) VALUES (?, ?)", (_now(), name))
    db.commit()
    return cur.lastrowid


@_locked
def rename_collection(collection_id: int, name: str) -> bool:
    db = get_db()
    cur = db.execute("UPDATE collections SET name = ? WHERE id = ?", (name, collection_id))
    db.commit()
    return cur.rowcount > 0


@_locked
def delete_collection(collection_id: int) -> bool:
    db = get_db()
    cur = db.execute("DELETE FROM collections WHERE id = ?", (collection_id,))
    db.commit()
    return cur.rowcount > 0


@_locked
def set_collection_track(collection_id: int, track_id: int, present: bool) -> bool:
    """Puts the track into the collection or takes it out. False when either does not exist."""
    db = get_db()
    if not get_track(track_id) or not db.execute("SELECT 1 FROM collections WHERE id = ?", (collection_id,)).fetchone():
        return False
    if present:
        db.execute("INSERT OR IGNORE INTO collection_tracks (collection_id, track_id, added_at) VALUES (?, ?, ?)", (collection_id, track_id, _now()))
    else:
        db.execute("DELETE FROM collection_tracks WHERE collection_id = ? AND track_id = ?", (collection_id, track_id))
    db.commit()
    return True


@_locked
def update_track_stems(track_id: int, stems: Optional[dict[str, str]]) -> None:
    db = get_db()
    db.execute(
        "UPDATE tracks SET stems_json = ? WHERE id = ?",
        (json.dumps(stems, ensure_ascii=False) if stems else None, track_id),
    )
    db.commit()


@_locked
def get_mix_settings(track_id: int) -> Optional[dict]:
    row = get_track(track_id)
    return json.loads(row["mix_settings_json"]) if row and row["mix_settings_json"] else None


@_locked
def update_track_mix_settings(track_id: int, settings: Optional[dict]) -> None:
    db = get_db()
    db.execute(
        "UPDATE tracks SET mix_settings_json = ? WHERE id = ?",
        (json.dumps(settings, ensure_ascii=False) if settings else None, track_id),
    )
    db.commit()


@_locked
def delete_track_stems(track_id: int) -> bool:
    row = get_track(track_id)
    if not row or not row["stems_json"]:
        return False
    shutil.rmtree(stems_dir(row["model"], track_id), ignore_errors=True)
    update_track_stems(track_id, None)
    return True


@_locked
def get_track_midi(track_id: int) -> dict[str, str]:
    row = get_track(track_id)
    return json.loads(row["midi_json"]) if row and row["midi_json"] else {}


@_locked
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


@_locked
def delete_track_midi(track_id: int) -> bool:
    row = get_track(track_id)
    if not row or not row["midi_json"]:
        return False
    shutil.rmtree(midi_dir(row["model"], track_id), ignore_errors=True)
    db = get_db()
    db.execute("UPDATE tracks SET midi_json = NULL WHERE id = ?", (track_id,))
    db.commit()
    return True


@_locked
def insert_project(*, name: str, data: dict) -> int:
    db = get_db()
    now = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    cur = db.execute(
        "INSERT INTO projects (created_at, updated_at, name, data_json) VALUES (?, ?, ?, ?)",
        (now, now, name, json.dumps(data, ensure_ascii=False)),
    )
    db.commit()
    return cur.lastrowid


@_locked
def list_projects() -> list[sqlite3.Row]:
    db = get_db()
    return db.execute("SELECT id, created_at, updated_at, name FROM projects ORDER BY updated_at DESC").fetchall()


@_locked
def get_project(project_id: int) -> Optional[sqlite3.Row]:
    db = get_db()
    return db.execute("SELECT * FROM projects WHERE id = ?", (project_id,)).fetchone()


@_locked
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


@_locked
def delete_project(project_id: int) -> bool:
    db = get_db()
    if not get_project(project_id):
        return False
    db.execute("DELETE FROM projects WHERE id = ?", (project_id,))
    db.commit()
    return True


# A clip's audio in a project's JSON: a track's own file or one of its stems ("/api/tracks/12/audio",
# "/api/tracks/12/stems/drums"), also as a full URL. The id must be followed by a slash, so 12 never matches 120.
_PROJECT_TRACK_URL = re.compile(r"/api/tracks/(\d+)/(?:audio|stems/)")


@_locked
def projects_using_tracks(track_ids: list[int]) -> dict[int, list[dict[str, Any]]]:
    """The editor projects whose clips play audio of each of these tracks (the track or its stems), newest first.

    The projects are opaque JSON the frontend owns, so the URLs are looked for in the text rather than in a shape.
    Asked before a track goes to the trash or for good: its clips there would lose their sound."""
    wanted = set(track_ids)
    usage: dict[int, list[dict[str, Any]]] = {i: [] for i in track_ids}
    rows = get_db().execute("SELECT id, name, data_json FROM projects ORDER BY updated_at DESC, id DESC").fetchall()
    for row in rows:
        used = {int(x) for x in _PROJECT_TRACK_URL.findall(row["data_json"] or "")} & wanted
        for tid in used:
            usage[tid].append({"id": row["id"], "name": row["name"]})
    return usage


def _remove_path(path: Path, is_dir: bool) -> bool:
    """Removes one file or folder; True when it is gone (or was never there)."""
    try:
        if is_dir:
            if path.exists():
                shutil.rmtree(path)
        else:
            path.unlink(missing_ok=True)
    except OSError:
        pass
    return not path.exists()


def _remove_track_files(row: sqlite3.Row) -> list[tuple[Path, bool]]:
    """Deletes a track's audio, ABC plan, stems, midi and cover from disk (not the row). Blocking; called without
    the DB lock. Returns what could not be removed, as (path, is_dir)."""
    track_id = row["id"]
    covers = FILES_DIR / "covers"
    targets: list[tuple[Path, bool]] = []
    for p in (row["cover_path"], covers / f"{track_id}.png", covers / f"{track_id}.thumb.jpg", covers / f"{track_id}_captioned.jpg",
              row["audio_path"], row["abc_path"]):
        if p:
            targets.append((Path(p), False))
    if row["stems_json"]:
        targets.append((stems_dir(row["model"], track_id), True))
    if row["midi_json"]:
        targets.append((midi_dir(row["model"], track_id), True))
    return [(p, is_dir) for p, is_dir in dict.fromkeys(targets) if not _remove_path(p, is_dir)]


def _remove_files_of(rows: list[sqlite3.Row]) -> None:
    """After the rows are committed away: their files go; what cannot be removed now is kept in pending_deletions
    and retried at the next start (retry_pending_deletions)."""
    failed = [f for row in rows for f in _remove_track_files(row)]
    if failed:
        _add_pending_deletions(failed)


@_locked
def _add_pending_deletions(items: list[tuple[Path, bool]]) -> None:
    db = get_db()
    now = _now()
    db.executemany(
        "INSERT OR REPLACE INTO pending_deletions (path, is_dir, added_at) VALUES (?, ?, ?)",
        [(str(p), 1 if is_dir else 0, now) for p, is_dir in items],
    )
    db.commit()


@_locked
def list_pending_deletions() -> list[sqlite3.Row]:
    return get_db().execute("SELECT * FROM pending_deletions ORDER BY added_at").fetchall()


@_locked
def _drop_pending_deletions(paths: list[str]) -> None:
    db = get_db()
    db.executemany("DELETE FROM pending_deletions WHERE path = ?", [(p,) for p in paths])
    db.commit()


def retry_pending_deletions() -> tuple[int, int]:
    """Startup: tries again to remove the files earlier deletions could not. Returns (removed, still left)."""
    done: list[str] = []
    left = 0
    for row in list_pending_deletions():
        if _remove_path(Path(row["path"]), bool(row["is_dir"])):
            done.append(row["path"])
        else:
            left += 1
    if done:
        _drop_pending_deletions(done)
    return len(done), left


@_locked
def _delete_track_row(track_id: int) -> Optional[sqlite3.Row]:
    db = get_db()
    row = get_track(track_id)
    if not row:
        return None
    db.execute("DELETE FROM tracks WHERE id = ?", (track_id,))
    db.commit()
    return row


def delete_track(track_id: int) -> bool:
    """Deletes for good: the row (committed first), then files, stems, midi (the trash's "delete forever").
    Blocking: the routes run it in a thread. Files that cannot be removed now are retried at the next start."""
    row = _delete_track_row(track_id)
    if row is None:
        return False
    _remove_files_of([row])
    return True


# ---------------------------------------------------------------- trash

TRASH_DAYS = 30


@_locked
def trash_track(track_id: int) -> bool:
    """Moves the track to the trash (already there: stays, keeping the first date). False when it does not exist."""
    db = get_db()
    if not get_track(track_id):
        return False
    db.execute("UPDATE tracks SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL", (_now(), track_id))
    db.commit()
    return True


@_locked
def _purge_trash_rows(older_than_days: Optional[int]) -> list[sqlite3.Row]:
    db = get_db()
    if older_than_days is None:
        rows = db.execute("SELECT * FROM tracks WHERE deleted_at IS NOT NULL").fetchall()
    else:
        cutoff = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() - older_than_days * 86400))
        rows = db.execute("SELECT * FROM tracks WHERE deleted_at IS NOT NULL AND deleted_at < ?", (cutoff,)).fetchall()
    try:
        for row in rows:
            db.execute("DELETE FROM tracks WHERE id = ?", (row["id"],))
        db.commit()
    except Exception:
        db.rollback()
        raise
    return rows


def purge_trash(older_than_days: Optional[int] = None) -> int:
    """Deletes for good what is in the trash - all of it, or only what has been there longer than
    `older_than_days`. The rows go first (one commit), then the files, without holding the DB lock; a file that
    cannot be removed now is retried at the next start. Blocking. Returns how many tracks went."""
    rows = _purge_trash_rows(older_than_days)
    _remove_files_of(rows)
    return len(rows)


def purge_expired_trash() -> int:
    """Startup / trash-listing housekeeping: what has been in the trash longer than TRASH_DAYS goes for good."""
    return purge_trash(TRASH_DAYS)


# ---------------------------------------------------------------- tags

MAX_TAG = 40


def clean_tag(tag: Any) -> str:
    """Leading '#' dropped, whitespace collapsed, at most MAX_TAG characters. ValueError when nothing is left."""
    text = " ".join(str(tag if tag is not None else "").split()).lstrip("#").strip()
    text = " ".join(text.split())[:MAX_TAG].strip()
    if not text:
        raise ValueError("a tag cannot be empty")
    return text


@_locked
def tags_by_track() -> dict[int, list[str]]:
    """track id -> its tags sorted case-insensitively; one query for a whole listing."""
    out: dict[int, list[str]] = {}
    for r in get_db().execute("SELECT track_id, tag FROM track_tags ORDER BY tag COLLATE NOCASE, tag").fetchall():
        out.setdefault(r["track_id"], []).append(r["tag"])
    return out


@_locked
def set_track_tags(track_id: int, tags: list[str]) -> bool:
    """Replaces the track's whole tag list. ValueError on an empty tag; False when the track does not exist."""
    cleaned: list[str] = []
    for t in tags:
        c = clean_tag(t)
        if c.lower() not in {x.lower() for x in cleaned}:
            cleaned.append(c)
    db = get_db()
    if not get_track(track_id):
        return False
    try:
        db.execute("DELETE FROM track_tags WHERE track_id = ?", (track_id,))
        now = _now()
        for c in cleaned:
            db.execute("INSERT OR IGNORE INTO track_tags (track_id, tag, added_at) VALUES (?, ?, ?)", (track_id, c, now))
        db.commit()
    except Exception:
        db.rollback()
        raise
    return True


@_locked
def list_tags() -> list[dict]:
    """Every tag of the tracks in the library (not the trash) with how many tracks carry it."""
    rows = get_db().execute(
        "SELECT MIN(tt.tag) AS name, COUNT(*) AS count FROM track_tags tt JOIN tracks t ON t.id = tt.track_id"
        " WHERE t.deleted_at IS NULL GROUP BY tt.tag COLLATE NOCASE ORDER BY tt.tag COLLATE NOCASE"
    ).fetchall()
    return [{"name": r["name"], "count": r["count"]} for r in rows]


def _tag_count(name: str) -> int:
    return get_db().execute(
        "SELECT COUNT(*) FROM track_tags tt JOIN tracks t ON t.id = tt.track_id WHERE t.deleted_at IS NULL AND tt.tag = ?", (name,)
    ).fetchone()[0]


@_locked
def rename_tag(old: str, new: str) -> Optional[int]:
    """Renames the tag on every track; a track that already has `new` just loses `old` (merge). Returns how many
    library tracks carry the new tag, None when no track has `old`."""
    db = get_db()
    if not db.execute("SELECT 1 FROM track_tags WHERE tag = ?", (old,)).fetchone():
        return None
    try:
        if old.lower() == new.lower():
            db.execute("UPDATE track_tags SET tag = ? WHERE tag = ?", (new, old))
        else:
            ids = [r["track_id"] for r in db.execute("SELECT track_id FROM track_tags WHERE tag = ?", (old,)).fetchall()]
            for tid in ids:
                if db.execute("SELECT 1 FROM track_tags WHERE track_id = ? AND tag = ?", (tid, new)).fetchone():
                    db.execute("DELETE FROM track_tags WHERE track_id = ? AND tag = ?", (tid, old))
                else:
                    db.execute("UPDATE track_tags SET tag = ? WHERE track_id = ? AND tag = ?", (new, tid, old))
        db.commit()
    except Exception:
        db.rollback()
        raise
    return _tag_count(new)


@_locked
def delete_tag(name: str) -> int:
    """Takes the tag off every track; returns how many tracks had it."""
    db = get_db()
    cur = db.execute("DELETE FROM track_tags WHERE tag = ?", (name,))
    db.commit()
    return cur.rowcount


# ---------------------------------------------------------------- bulk

BULK_ACTIONS = ("trash", "restore", "purge", "favorite", "unfavorite", "tag", "untag", "collect", "uncollect")


def bulk_apply(ids: list[int], action: str, *, tag: Optional[str] = None, collection_id: Optional[int] = None) -> tuple[list[sqlite3.Row], list[int]]:
    """See _bulk_apply_locked; a purge's files are removed afterwards, outside the DB lock. Blocking."""
    rows, missing, purged = _bulk_apply_locked(ids, action, tag=tag, collection_id=collection_id)
    if purged:
        _remove_files_of(purged)
    return rows, missing


@_locked
def _bulk_apply_locked(ids: list[int], action: str, *, tag: Optional[str] = None, collection_id: Optional[int] = None) -> tuple[list[sqlite3.Row], list[int], list[sqlite3.Row]]:
    """One action on many tracks in one transaction (all or nothing; a purge removes its files after the commit).
    `tag` must already be cleaned and the collection must exist. Returns (the tracks as they are afterwards, in the
    order of `ids`; the ids that were not found - for a purge also the ones not in the trash)."""
    db = get_db()
    marks = ",".join("?" * len(ids))
    found = {r["id"]: r for r in db.execute(f"SELECT * FROM tracks WHERE id IN ({marks})", ids).fetchall()}
    targets = [i for i in ids if i in found]
    if action == "purge":
        targets = [i for i in targets if found[i]["deleted_at"] is not None]
    missing = [i for i in ids if i not in targets]
    now = _now()
    try:
        for tid in targets:
            if action == "trash":
                db.execute("UPDATE tracks SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL", (now, tid))
            elif action == "restore":
                db.execute("UPDATE tracks SET deleted_at = NULL WHERE id = ?", (tid,))
            elif action in ("favorite", "unfavorite"):
                db.execute("UPDATE tracks SET favorite = ? WHERE id = ?", (1 if action == "favorite" else 0, tid))
            elif action == "tag":
                db.execute("INSERT OR IGNORE INTO track_tags (track_id, tag, added_at) VALUES (?, ?, ?)", (tid, tag, now))
            elif action == "untag":
                db.execute("DELETE FROM track_tags WHERE track_id = ? AND tag = ?", (tid, tag))
            elif action == "collect":
                db.execute("INSERT OR IGNORE INTO collection_tracks (collection_id, track_id, added_at) VALUES (?, ?, ?)", (collection_id, tid, now))
            elif action == "uncollect":
                db.execute("DELETE FROM collection_tracks WHERE collection_id = ? AND track_id = ?", (collection_id, tid))
            elif action == "purge":
                db.execute("DELETE FROM tracks WHERE id = ?", (tid,))
            else:
                raise ValueError(action)
        db.commit()
    except Exception:
        db.rollback()
        raise
    if action == "purge":
        return [], missing, [found[tid] for tid in targets]
    after = {r["id"]: r for r in db.execute(f"SELECT * FROM tracks WHERE id IN ({marks})", ids).fetchall()}
    return [after[i] for i in targets], missing, []


@_locked
def get_setting(key: str, default: str = "") -> str:
    row = get_db().execute("SELECT value FROM settings WHERE key = ?", (key,)).fetchone()
    return row["value"] if row else default


@_locked
def set_setting(key: str, value: str) -> None:
    db = get_db()
    db.execute(
        "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (key, value),
    )
    db.commit()


# ---------------------------------------------------------------- generation queue (app/gen_queue.py)

JOB_ACTIVE = ("queued", "running")
JOB_FINISHED = ("done", "failed", "cancelled")
_JOB_FIELDS = {"status", "ref_path", "engine_task_id", "stage", "progress", "error", "cancel_requested", "dismissed", "started_at", "finished_at"}


@_locked
def insert_jobs(engine: str, batch_id: str, entries: list[dict[str, Any]]) -> list[int]:
    """One queued row per entry ({request, save, takes, title}), in one transaction; returns the ids in order."""
    db = get_db()
    now = _now()
    ids: list[int] = []
    try:
        for i, e in enumerate(entries):
            cur = db.execute(
                "INSERT INTO jobs (engine, status, batch_id, batch_index, takes, title, request_json, save_json, created_at)"
                " VALUES (?, 'queued', ?, ?, ?, ?, ?, ?, ?)",
                (engine, batch_id, i, int(e["takes"]), e["title"], json.dumps(e["request"], ensure_ascii=False), json.dumps(e["save"], ensure_ascii=False), now),
            )
            ids.append(cur.lastrowid)
        db.commit()
    except Exception:
        db.rollback()
        raise
    return ids


@_locked
def get_job(job_id: int) -> Optional[sqlite3.Row]:
    return get_db().execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()


@_locked
def next_queued_job() -> Optional[sqlite3.Row]:
    return get_db().execute("SELECT * FROM jobs WHERE status = 'queued' ORDER BY id LIMIT 1").fetchone()


@_locked
def list_jobs_for_view(since: str) -> list[sqlite3.Row]:
    """Queued and running jobs, plus the not dismissed ones that finished at or after `since` (ISO Z). Newest first."""
    return get_db().execute(
        "SELECT * FROM jobs WHERE status IN ('queued', 'running')"
        " OR (dismissed = 0 AND finished_at IS NOT NULL AND finished_at >= ?) ORDER BY id DESC",
        (since,),
    ).fetchall()


@_locked
def list_active_jobs(engine: str) -> list[sqlite3.Row]:
    """The engine's queued and running jobs, oldest first."""
    return get_db().execute("SELECT * FROM jobs WHERE engine = ? AND status IN ('queued', 'running') ORDER BY id", (engine,)).fetchall()


@_locked
def list_batch_jobs(batch_id: str) -> list[sqlite3.Row]:
    """The jobs submitted together (one YuE2 seed each, or the single ACE-Step / Stable Audio job), in order."""
    return get_db().execute("SELECT * FROM jobs WHERE batch_id = ? ORDER BY batch_index, id", (batch_id,)).fetchall()


@_locked
def cover_job_for_batch(batch_id: str) -> Optional[sqlite3.Row]:
    """The automatic cover job made for a song's batch (request.source_batch_id), None when there is none."""
    return get_db().execute(
        "SELECT * FROM jobs WHERE engine = 'cover' AND json_extract(request_json, '$.source_batch_id') = ? ORDER BY id LIMIT 1",
        (batch_id,),
    ).fetchone()


@_locked
def list_jobs() -> list[sqlite3.Row]:
    return get_db().execute("SELECT * FROM jobs ORDER BY id").fetchall()


@_locked
def update_job(job_id: int, **fields: Any) -> None:
    bad = set(fields) - _JOB_FIELDS
    if bad:
        raise ValueError(f"unknown job fields {sorted(bad)}")
    if not fields:
        return
    db = get_db()
    db.execute(f"UPDATE jobs SET {', '.join(f'{k} = ?' for k in fields)} WHERE id = ?", (*fields.values(), job_id))
    db.commit()


@_locked
def mark_job_running(job_id: int) -> bool:
    """queued -> running; False when it is no longer queued (cancelled in the meantime)."""
    db = get_db()
    cur = db.execute(
        "UPDATE jobs SET status = 'running', started_at = ?, stage = NULL, progress = NULL, error = NULL, engine_task_id = NULL"
        " WHERE id = ? AND status = 'queued'",
        (_now(), job_id),
    )
    db.commit()
    return cur.rowcount > 0


@_locked
def cancel_queued_job(job_id: int) -> bool:
    db = get_db()
    cur = db.execute("UPDATE jobs SET status = 'cancelled', finished_at = ? WHERE id = ? AND status = 'queued'", (_now(), job_id))
    db.commit()
    return cur.rowcount > 0


@_locked
def finish_job(job_id: int, status: str, error: Optional[str] = None) -> None:
    if status not in JOB_FINISHED:
        raise ValueError(status)
    db = get_db()
    db.execute(
        "UPDATE jobs SET status = ?, error = ?, finished_at = ?, progress = CASE WHEN ? = 'done' THEN 1.0 ELSE progress END WHERE id = ?",
        (status, error, _now(), status, job_id),
    )
    db.commit()


@_locked
def append_job_track(job_id: int, track_id: int) -> None:
    row = get_job(job_id)
    if not row:
        return
    ids = json.loads(row["track_ids_json"] or "[]")
    ids.append(track_id)
    db = get_db()
    db.execute("UPDATE jobs SET track_ids_json = ? WHERE id = ?", (json.dumps(ids), job_id))
    db.commit()


@_locked
def recover_jobs() -> tuple[int, list[int]]:
    """After a backend restart: a job left running goes back to the queue once (attempts + 1); the second time, or
    when it was being cancelled, it ends instead. A job that had already saved takes is never run again (the rerun
    would save them a second time): with all its takes saved it is done, else it fails with a note and keeps the
    takes it saved. Returns (how many were requeued, the ids of the jobs it ended)."""
    db = get_db()
    requeued = 0
    ended: list[int] = []
    now = _now()
    for row in db.execute("SELECT id, attempts, cancel_requested, takes, track_ids_json FROM jobs WHERE status = 'running'").fetchall():
        attempts = row["attempts"] + 1
        try:
            saved = len(json.loads(row["track_ids_json"] or "[]"))
        except ValueError:
            saved = 0
        takes = max(1, row["takes"] or 1)
        if saved and not row["cancel_requested"]:
            status, error = ("done", None) if saved >= takes else (
                "failed", f"interrupted by a backend restart: {saved} of {takes} takes were saved")
            db.execute(
                "UPDATE jobs SET status = ?, error = ?, attempts = ?, finished_at = ?,"
                " progress = CASE WHEN ? = 'done' THEN 1.0 ELSE progress END WHERE id = ?",
                (status, error, attempts, now, status, row["id"]),
            )
            ended.append(row["id"])
        elif row["cancel_requested"]:
            db.execute("UPDATE jobs SET status = 'cancelled', attempts = ?, finished_at = ? WHERE id = ?", (attempts, now, row["id"]))
            ended.append(row["id"])
        elif attempts >= 2:
            db.execute(
                "UPDATE jobs SET status = 'failed', error = 'interrupted', attempts = ?, finished_at = ? WHERE id = ?",
                (attempts, now, row["id"]),
            )
            ended.append(row["id"])
        else:
            db.execute(
                "UPDATE jobs SET status = 'queued', attempts = ?, started_at = NULL, stage = NULL, progress = NULL,"
                " engine_task_id = NULL WHERE id = ?",
                (attempts, row["id"]),
            )
            requeued += 1
    db.commit()
    return requeued, ended
