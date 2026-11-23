"""Collections: named sets of tracks in the library ("For shorts", an album in the making).

A track may be in several collections; the tracks themselves stay where they are. Each track in a
listing carries the ids of its collections (routes_tracks), and a collection here carries its track ids.
"""
from __future__ import annotations

from fastapi import APIRouter, Body, HTTPException

from .. import db

router = APIRouter(prefix="/api/collections", tags=["collections"])

MAX_NAME = 80


def _clean_name(name: str) -> str:
    name = " ".join((name or "").split())[:MAX_NAME]
    if not name:
        raise HTTPException(status_code=400, detail="a collection needs a name")
    return name


@router.get("")
async def list_collections():
    return {"data": db.list_collections()}


@router.post("")
async def create_collection(name: str = Body(..., embed=True)):
    return db.get_collection(db.insert_collection(_clean_name(name)))


@router.put("/{collection_id}")
async def rename_collection(collection_id: int, name: str = Body(..., embed=True)):
    if not db.rename_collection(collection_id, _clean_name(name)):
        raise HTTPException(status_code=404, detail="collection not found")
    return db.get_collection(collection_id)


@router.delete("/{collection_id}")
async def delete_collection(collection_id: int):
    """Removes the collection; its tracks stay in the library."""
    if not db.delete_collection(collection_id):
        raise HTTPException(status_code=404, detail="collection not found")
    return {"deleted": True}


@router.put("/{collection_id}/tracks/{track_id}")
async def add_track(collection_id: int, track_id: int):
    if not db.set_collection_track(collection_id, track_id, True):
        raise HTTPException(status_code=404, detail="collection or track not found")
    return db.get_collection(collection_id)


@router.delete("/{collection_id}/tracks/{track_id}")
async def remove_track(collection_id: int, track_id: int):
    if not db.set_collection_track(collection_id, track_id, False):
        raise HTTPException(status_code=404, detail="collection or track not found")
    return db.get_collection(collection_id)
