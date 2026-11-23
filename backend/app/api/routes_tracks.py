"""Unified track storage endpoints used by both models' frontends.

Generation itself still goes straight to the active model's own API via
routes_proxy.py; once a track is finished, the frontend uploads it here so
it lands in one shared place (DATA_DIR/files/<model>/ + one SQLite DB) instead
of each model's own, separate storage.
"""
from __future__ import annotations

import asyncio
import json
import os
import shutil
import time
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Body, File, Form, HTTPException, Query, UploadFile
from fastapi.responses import FileResponse, JSONResponse, PlainTextResponse

from .. import covers, db, tagging
from ..config import MODELS
from ..track_store import ALLOWED_AUDIO_EXT, _create_unique, _sanitize, store_track

router = APIRouter(prefix="/api/tracks", tags=["tracks"])

# "cover" is an engine but makes no tracks
ALLOWED_TRACK_MODELS = (set(MODELS.keys()) - {"cover"}) | {"editor", "upload"}


# The largest audio file accepted by an upload (POST /api/tracks, /api/tracks/upload, the reference audio of
# POST /api/jobs): 413 above it.
MAX_UPLOAD_BYTES = 300 * 1024 * 1024


def upload_size(upload: UploadFile) -> int:
    """Size of an uploaded file in bytes (the parser counts it; otherwise measured on the spooled file)."""
    if upload.size is not None:
        return upload.size
    f = upload.file
    pos = f.tell()
    try:
        f.seek(0, os.SEEK_END)
        return f.tell()
    finally:
        f.seek(pos)


def check_upload_size(upload: Optional[UploadFile]) -> None:
    if upload is not None and upload_size(upload) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=413, detail=f"the file is larger than {MAX_UPLOAD_BYTES // (1024 * 1024)} MB")


class _TempFileResponse(FileResponse):
    """A FileResponse for a temp copy that removes the copy when the response ends, however it ends: a
    BackgroundTask does not run when the client goes away half way, this finally does."""

    async def __call__(self, scope, receive, send) -> None:
        try:
            await super().__call__(scope, receive, send)
        finally:
            try:
                Path(self.path).unlink(missing_ok=True)
            except OSError:
                pass  # still open somewhere: swept at the next start (tagging.sweep_download_tmp)


def _row_to_dict(row, collections: Optional[dict[int, list[int]]] = None, tags: Optional[dict[int, list[str]]] = None) -> dict:
    """`collections` and `tags` are the track -> collections / tags maps when the caller already has them (a listing)."""
    audio_path = Path(row["audio_path"])
    if collections is None:
        collections = db.collection_ids_by_track()
    if tags is None:
        tags = db.tags_by_track()
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
        "favorite": bool(row["favorite"]),
        "collections": collections.get(row["id"], []),
        "tags": tags.get(row["id"], []),
        "deleted_at": row["deleted_at"],
        "audio_url": f"/api/tracks/{row['id']}/audio",
        "abc_url": f"/api/tracks/{row['id']}/abc" if row["abc_path"] else None,
        # null without a cover; the ?v= part changes when the cover is made again. Sent whether or not covers are
        # switched on in the settings (the page hides them when they are off).
        "cover_url": covers.cover_url(row),
        # the description the cover was last drawn from; null until one was made or given
        # the caption settings (object) and the browser-baked captioned cover; null when none / not fresh
        "cover_caption": covers.caption_of(row),
        "cover_captioned_url": covers.captioned_url(row),
        "cover_prompt": row["cover_prompt"] if "cover_prompt" in row.keys() else None,
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
    check_upload_size(audio)
    try:
        params_dict = json.loads(params) if params else {}
    except json.JSONDecodeError:
        params_dict = {}

    ext = (audio.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in ALLOWED_AUDIO_EXT:
        ext = "wav"
    row = await asyncio.to_thread(
        store_track,
        model=model,
        title=title,
        lyrics=lyrics,
        seed=seed,
        duration_ms=duration_ms,
        wall_ms=wall_ms,
        params=params_dict,
        audio=audio.file,
        ext=ext,
        abc=abc,
    )
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

    check_upload_size(audio)
    track_title = title.strip() if title and title.strip() else (audio.filename or "uploaded_track").rsplit(".", 1)[0]
    ts = time.strftime("%Y%m%dT%H%M%SZ", time.gmtime())
    base = f"{ts}_{_sanitize(track_title)}"
    target_dir = db.model_dir("upload")

    def store() -> int:
        audio_path, _, f = _create_unique(target_dir, base, ext, False)
        try:
            with f:
                shutil.copyfileobj(audio.file, f)
            return db.insert_track(
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

    track_id = await asyncio.to_thread(store)
    row = db.get_track(track_id)
    return _row_to_dict(row)


@router.get("")
async def list_tracks(model: Optional[str] = None):
    if model is not None and model not in ALLOWED_TRACK_MODELS:
        raise HTTPException(status_code=400, detail=f"unknown track model/origin '{model}'")
    marks = db.collection_ids_by_track()
    tags = db.tags_by_track()
    return {"data": [_row_to_dict(r, marks, tags) for r in db.list_tracks(model)]}


# The fixed paths below must stay above the "/{track_id}" routes.

@router.get("/trash")
async def list_trash():
    """The trash, most recently trashed first. Tracks there for more than TRASH_DAYS go for good first."""
    await asyncio.to_thread(db.purge_expired_trash)
    marks = db.collection_ids_by_track()
    tags = db.tags_by_track()
    return {"data": [_row_to_dict(r, marks, tags) for r in db.list_trashed_tracks()]}


MAX_USAGE_IDS = 1000


@router.get("/usage")
async def tracks_usage(ids: str = Query(..., description="comma-separated track ids")):
    """For many tracks at once (a bulk trash): {"usage": {"<track id>": [{"id", "name"}, ...]}}, the editor projects
    whose clips use each track; an unknown id just has none."""
    try:
        id_list = [int(x) for x in ids.split(",") if x.strip()]
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="ids must be comma-separated integers") from exc
    if not 1 <= len(id_list) <= MAX_USAGE_IDS:
        raise HTTPException(status_code=400, detail=f"ids must hold 1 to {MAX_USAGE_IDS} track ids")
    usage = await asyncio.to_thread(db.projects_using_tracks, id_list)
    return {"usage": {str(k): v for k, v in usage.items()}}


@router.post("/trash/empty")
async def empty_trash():
    return {"purged": await asyncio.to_thread(db.purge_trash)}


MAX_BULK_IDS = 1000


def _bad(detail: str) -> HTTPException:
    return HTTPException(status_code=400, detail=detail)


@router.post("/bulk")
async def bulk_action(body: dict = Body(...)):
    """One action on many tracks at once (see db.BULK_ACTIONS), all in one transaction. Answers with the tracks as
    they are afterwards and the ids that were not found."""
    ids = body.get("ids")
    if not isinstance(ids, list) or not 1 <= len(ids) <= MAX_BULK_IDS:
        raise _bad(f"ids must be a list of 1 to {MAX_BULK_IDS} track ids")
    if any(isinstance(i, bool) or not isinstance(i, int) for i in ids) or len(set(ids)) != len(ids):
        raise _bad("ids must be unique integers")
    action = body.get("action")
    if action not in db.BULK_ACTIONS:
        raise _bad(f"action must be one of {list(db.BULK_ACTIONS)}")
    tag = collection_id = None
    if action in ("tag", "untag"):
        try:
            tag = db.clean_tag(body.get("tag"))
        except ValueError as exc:
            raise _bad(str(exc)) from exc
    if action in ("collect", "uncollect"):
        collection_id = body.get("collection_id")
        if isinstance(collection_id, bool) or not isinstance(collection_id, int):
            raise _bad("collection_id is required")
        if db.get_collection(collection_id) is None:
            raise HTTPException(status_code=404, detail="collection not found")
    rows, missing = await asyncio.to_thread(db.bulk_apply, ids, action, tag=tag, collection_id=collection_id)
    marks = db.collection_ids_by_track()
    tag_map = db.tags_by_track()
    return {"data": [_row_to_dict(r, marks, tag_map) for r in rows], "missing": missing}


@router.get("/{track_id}/usage")
async def track_usage(track_id: int):
    """The editor projects whose clips play this track or its stems: {"projects": [{"id", "name"}]}. A track in the
    trash is still known (its clips keep playing until it goes for good)."""
    if not db.get_track(track_id):
        raise HTTPException(status_code=404, detail="track not found")
    usage = await asyncio.to_thread(db.projects_using_tracks, [track_id])
    return {"projects": usage[track_id]}


@router.get("/{track_id}/audio")
async def track_audio(track_id: int):
    row = db.get_track(track_id)
    if not row or not Path(row["audio_path"]).exists():
        return JSONResponse({"error": "audio not found"}, status_code=404)
    return FileResponse(row["audio_path"])


@router.get("/{track_id}/download")
async def track_download(track_id: int, album: Optional[str] = Query(None, max_length=120), track_no: Optional[int] = Query(None, ge=1, le=999),
                         format: Optional[str] = Query(None, pattern="^(mp3|flac|wav)$")):
    """The track as a download: a copy with title, artist, lyrics, cover-ready tags and the AI-generated
    marks written in. The artist is the app-wide setting. The stored file is not changed; if tagging
    is not possible (no ffmpeg) the original is served. With ?format=mp3|flac|wav the audio is converted
    (see tagging.write_tagged_copy); if that is impossible for a format other than the source's, 503 is returned."""
    row = db.get_track(track_id)
    src = Path(row["audio_path"]) if row else None
    if not row or not src or not src.exists():
        return JSONResponse({"error": "audio not found"}, status_code=404)
    src_ext = src.suffix.lower().lstrip(".")
    convert = bool(format) and format != src_ext
    ext = format if convert else src_ext
    params = json.loads(row["params_json"] or "{}")
    tags = tagging.build_tags(row, params, db.get_setting("artist", ""), album=album, track_no=track_no)
    name = tagging.download_name(tags, ext)
    cover = covers.captioned_path(row) or covers.cover_path(row)
    if convert:
        tagged = await tagging.write_tagged_copy(src, tags, cover, fmt=format)
        if tagged is None:
            return JSONResponse({"error": f"could not convert the track to {format} (ffmpeg is missing or failed)"}, status_code=503)
        return _TempFileResponse(tagged, filename=name, media_type=tagging.MEDIA_TYPES[format])
    tagged = await tagging.write_tagged_copy(src, tags, cover)
    if tagged is None:
        return FileResponse(src, filename=name, headers={"X-Tags": "skipped"})
    return _TempFileResponse(tagged, filename=name)


@router.get("/{track_id}/cover")
async def track_cover(track_id: int, size: Optional[str] = Query(None, pattern="^(full|thumb)$"), v: Optional[str] = Query(None)):
    """The track's cover: the 1024 px PNG, or with ?size=thumb the 256 px JPEG (the PNG when there is no thumbnail).
    The URL in cover_url carries ?v=<mtime>, so the answer may be cached for good."""
    row = db.get_track(track_id)
    path = covers.cover_path(row) if row else None
    if path is None:
        return JSONResponse({"error": "track has no cover"}, status_code=404)
    if size == "thumb":
        thumb = covers.thumb_file(track_id)
        if thumb.is_file():
            path = thumb
    # with the version from cover_url the answer never changes; without it, the browser must ask again
    return FileResponse(path, headers={"Cache-Control": "public, max-age=31536000, immutable" if v else "no-cache"})


@router.get("/{track_id}/cover/captioned")
async def track_cover_captioned(track_id: int, v: Optional[str] = Query(None)):
    """The cover with its caption baked in (JPEG); 404 without a fresh one."""
    row = db.get_track(track_id)
    path = covers.captioned_path(row) if row else None
    if path is None:
        return JSONResponse({"error": "track has no captioned cover"}, status_code=404)
    return FileResponse(path, media_type="image/jpeg",
                        headers={"Cache-Control": "public, max-age=31536000, immutable" if v else "no-cache"})


CAPTION_MAX_BYTES = 4096
CAPTION_IMAGE_MAX_BYTES = 4 * 1024 * 1024


def _unprocessable(detail: str) -> HTTPException:
    return HTTPException(status_code=422, detail=detail)


@router.put("/{track_id}/cover/caption")
async def put_cover_caption(track_id: int, body: dict = Body(...)):
    """{"caption": object | null, "image": base64 JPEG | null, "cover_v": string | number (optional)}. caption null
    clears both caption and baked file; a caption keeps its settings and, with an image, stores the baked JPEG
    (512..2048 px) as <id>_captioned.jpg; a caption without an image drops any earlier baked file. Answers with the
    track.

    cover_v is the `v` value of the cover_url the caption was made on. When it is given and the cover has been made
    again since (another `v` now), nothing is stored and the answer is 409 (the image was baked on the old picture);
    without it the request is taken as before."""
    import base64
    import binascii

    row = db.get_track(track_id)
    if row is None or row["deleted_at"]:
        raise HTTPException(status_code=404, detail="track not found")
    if covers.cover_path(row) is None:
        raise HTTPException(status_code=409, detail="track has no cover")
    sent_v = body.get("cover_v")
    if sent_v is not None:
        if isinstance(sent_v, bool) or not isinstance(sent_v, (str, int)):
            raise _unprocessable("cover_v must be a string or a number")
        current_v = covers.cover_version(row)
        if current_v is None or str(sent_v) != current_v:
            raise HTTPException(status_code=409, detail="the cover has changed since this caption was made")
    caption = body.get("caption")
    image = body.get("image")
    baked = covers.captioned_file(track_id)
    if caption is None:
        db.set_track_cover_caption(track_id, None)
        baked.unlink(missing_ok=True)
        return _row_to_dict(db.get_track(track_id))
    if not isinstance(caption, dict):
        raise _unprocessable("caption must be an object or null")
    text = json.dumps(caption, ensure_ascii=False, separators=(",", ":"))
    if len(text.encode("utf-8")) > CAPTION_MAX_BYTES:
        raise _unprocessable(f"caption is larger than {CAPTION_MAX_BYTES} bytes")
    data = None
    if image is not None:
        if not isinstance(image, str):
            raise _unprocessable("image must be a base64 string or null")
        b64 = image.split(",", 1)[1] if image.startswith("data:") and "," in image else image
        if len(b64) > CAPTION_IMAGE_MAX_BYTES * 4 // 3 + 16:
            raise _unprocessable("image is larger than 4 MB")
        try:
            data = base64.b64decode(b64)
        except (binascii.Error, ValueError) as exc:
            raise _unprocessable("image is not valid base64") from exc
        if len(data) > CAPTION_IMAGE_MAX_BYTES:
            raise _unprocessable("image is larger than 4 MB")
        size = covers.jpeg_size(data)
        if size is None:
            raise _unprocessable("image is not a readable JPEG")
        w, h = size
        if not (512 <= w <= 2048 and 512 <= h <= 2048):
            raise _unprocessable("image sides must be 512 to 2048 px")
    if not db.set_track_cover_caption(track_id, text):
        raise HTTPException(status_code=404, detail="track not found")
    if data is None:
        baked.unlink(missing_ok=True)
    else:
        baked.parent.mkdir(parents=True, exist_ok=True)
        tmp = baked.with_name(baked.name + ".tmp")
        tmp.write_bytes(data)
        try:
            await asyncio.to_thread(covers.replace_file, tmp, baked)
        except OSError as exc:
            raise HTTPException(status_code=503, detail=str(exc)) from exc
    return _row_to_dict(db.get_track(track_id))


@router.delete("/{track_id}/cover")
async def delete_track_cover(track_id: int):
    if not covers.remove_cover(track_id):
        raise HTTPException(status_code=404, detail="track not found")
    return _row_to_dict(db.get_track(track_id))


@router.get("/{track_id}/abc")
async def track_abc(track_id: int):
    row = db.get_track(track_id)
    if not row or not row["abc_path"] or not Path(row["abc_path"]).exists():
        return JSONResponse({"error": "track has no ABC plan"}, status_code=404)
    return PlainTextResponse(Path(row["abc_path"]).read_text(encoding="utf-8"))


@router.put("/{track_id}")
async def update_track(
    track_id: int,
    title: Optional[str] = Body(None, embed=True),
    favorite: Optional[bool] = Body(None, embed=True),
    tags: Optional[list[str]] = Body(None, embed=True),
):
    """Renames the track, marks it as a favourite and/or replaces its tags; a field left out stays as it is."""
    if not db.get_track(track_id):
        raise HTTPException(status_code=404, detail="track not found")
    if tags is not None:
        try:
            db.set_track_tags(track_id, tags)
        except ValueError as exc:
            raise _bad(str(exc)) from exc
    if title is not None:
        db.update_track_title(track_id, title)
    if favorite is not None:
        db.set_track_favorite(track_id, favorite)
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
async def delete_track(track_id: int, permanent: bool = Query(False)):
    """Moves the track to the trash; `?permanent=true` deletes it for good (files, stems, midi, row)."""
    if permanent:
        if not await asyncio.to_thread(db.delete_track, track_id):
            return JSONResponse({"error": "not found"}, status_code=404)
        return {"deleted": True}
    if not db.trash_track(track_id):
        return JSONResponse({"error": "not found"}, status_code=404)
    return {"trashed": True}
