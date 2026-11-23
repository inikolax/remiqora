"""Album covers (app/covers.py): queue one cover job per track, and preview the prompt a cover would be made from.

POST /api/covers {"track_ids": [..], "prompts"?: {"<id>": "text"}, "seed"?: int}
  -> {"jobs": [job, ...]}: one job per track (engine "cover", the same shape as GET /api/jobs). A track that already
  has a cover job queued or running gets that job back instead of a second one. 409 while covers are switched off in
  the settings (covers_enabled) or the cover engine is not installed; 404 when a track does not exist.
  Given texts are kept on their tracks (tracks.cover_prompt, after build_prompt's sanitising); a finished cover job
  keeps the prompt it was drawn from there too.
GET /api/covers/prompt/{track_id} -> {"prompt": "...", "source": "saved" | "auto"}: the track's kept description
  when it has one ("saved"), else the one POST would make for it without a text ("auto").
The cover itself: GET / DELETE /api/tracks/{id}/cover (routes_tracks.py).
"""
from __future__ import annotations

import json
import random
import uuid
from typing import Any

from fastapi import APIRouter, Body, HTTPException

from .. import covers, db, features
from ..gen_queue import COVER_ENGINE, queue
from .routes_jobs import _job_dict

router = APIRouter(prefix="/api/covers", tags=["covers"])

MAX_TRACKS = 200
PROMPT_MAX = 1000


def _bad(detail: str) -> HTTPException:
    return HTTPException(status_code=400, detail=detail)


def _active_cover_jobs() -> dict[int, int]:
    """track id -> id of its queued or running cover job."""
    out: dict[int, int] = {}
    for row in db.list_active_jobs(COVER_ENGINE):
        req = json.loads(row["request_json"] or "{}")
        # a song's automatic cover covers all its takes (track_ids)
        for tid in [req.get("track_id"), *(req.get("track_ids") or [])]:
            if isinstance(tid, int) and not isinstance(tid, bool):
                out.setdefault(tid, row["id"])
    return out


def _saved(row) -> str | None:
    """The track's kept cover description, None without one."""
    text = row["cover_prompt"] if "cover_prompt" in row.keys() else None
    return text if text and text.strip() else None


@router.post("")
async def create_covers(body: dict = Body(...)):
    if not covers.enabled():
        raise HTTPException(status_code=409, detail="covers are switched off in the settings")
    if not features.has_cover():
        raise HTTPException(status_code=409, detail="the cover engine (sd-server + Z-Image-Turbo) is not installed")
    ids = body.get("track_ids")
    if not isinstance(ids, list) or not 1 <= len(ids) <= MAX_TRACKS:
        raise _bad(f"track_ids must be a list of 1 to {MAX_TRACKS} track ids")
    if any(isinstance(i, bool) or not isinstance(i, int) for i in ids) or len(set(ids)) != len(ids):
        raise _bad("track_ids must be unique integers")
    prompts = body.get("prompts")
    if prompts is None:
        prompts = {}
    if not isinstance(prompts, dict):
        raise _bad("prompts must be an object of track id -> text")
    texts: dict[int, str] = {}
    for k, v in prompts.items():
        try:
            tid = int(k)
        except (TypeError, ValueError) as exc:
            raise _bad(f"prompts: '{k}' is not a track id") from exc
        if v is None:
            continue
        if not isinstance(v, str) or len(v) > PROMPT_MAX:
            raise _bad(f"prompts[{k}] must be a text of at most {PROMPT_MAX} characters")
        if v.strip():
            texts[tid] = v
    seed = body.get("seed")
    if seed is not None and (isinstance(seed, bool) or not isinstance(seed, int) or not 0 <= seed < 2**31):
        raise _bad("seed must be a whole number from 0 to 2^31-1")
    rows = {}
    for tid in ids:
        row = db.get_track(tid)
        if row is None:
            raise HTTPException(status_code=404, detail=f"track {tid} not found")
        rows[tid] = row
    active = _active_cover_jobs()
    entries: list[dict[str, Any]] = []
    for i, tid in enumerate(ids):
        if tid in active:
            continue
        row = rows[tid]
        params = json.loads(row["params_json"] or "{}")
        request = {
            "track_id": tid,
            # the given text, else the track's kept description, else the automatic one
            "prompt": covers.build_prompt(row, params, texts.get(tid) or _saved(row)),
            "width": covers.SIZE,
            "height": covers.SIZE,
            "steps": covers.STEPS,
            # one seed for the request: the tracks get seed, seed+1, ...; none: a random one each
            "seed": (seed + i) % 2**31 if seed is not None else random.randint(0, 2**31 - 1),
        }
        entries.append({"request": request, "save": {}, "takes": 1, "title": row["title"] or ""})
    # a given description is the track's from now on (also when its cover job was already running)
    for tid, text in texts.items():
        if tid in rows:
            db.set_track_cover_prompt(tid, covers.build_prompt(rows[tid], {}, text))
    new_ids = db.insert_jobs(COVER_ENGINE, uuid.uuid4().hex, entries) if entries else []
    queue.wake()
    created = iter(new_ids)
    job_ids = [active[tid] if tid in active else next(created) for tid in ids]
    marks = db.collection_ids_by_track()
    tags = db.tags_by_track()
    return {"jobs": [_job_dict(db.get_job(j), marks, tags) for j in job_ids]}


@router.get("/prompt/{track_id}")
async def cover_prompt(track_id: int):
    row = db.get_track(track_id)
    if row is None:
        raise HTTPException(status_code=404, detail="track not found")
    saved = _saved(row)
    if saved:
        return {"prompt": saved, "source": "saved"}
    return {"prompt": covers.build_prompt(row, json.loads(row["params_json"] or "{}")), "source": "auto"}
