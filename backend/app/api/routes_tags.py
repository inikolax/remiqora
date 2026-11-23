"""Tags: free-form labels on tracks ("for shorts", "rock"), managed across the whole library.

A track's own tags travel with the track (routes_tracks: `tags` in every track, `PUT /api/tracks/{id}` replaces
them, the bulk endpoint adds/removes one). Here are the library-wide views: the list with counts, rename (which
merges into an existing tag of that name) and delete.
"""
from __future__ import annotations

from fastapi import APIRouter, Body, HTTPException

from .. import db

router = APIRouter(prefix="/api/tags", tags=["tags"])


def _clean(name: str) -> str:
    try:
        return db.clean_tag(name)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def _lookup(name: str) -> str:
    """The tag named in the URL; an empty one cannot exist, so it is a plain "not found"."""
    try:
        return db.clean_tag(name)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="tag not found") from exc


@router.get("")
async def list_tags():
    return {"data": db.list_tags()}


@router.put("/{name:path}")
async def rename_tag(name: str, new_name: str = Body(..., embed=True, alias="name")):
    new = _clean(new_name)
    count = db.rename_tag(_lookup(name), new)
    if count is None:
        raise HTTPException(status_code=404, detail="tag not found")
    return {"name": new, "count": count}


@router.delete("/{name:path}")
async def delete_tag(name: str):
    return {"removed": db.delete_tag(_lookup(name))}
