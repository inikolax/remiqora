"""App-wide settings that are entered once and reused everywhere (today: the artist name that goes
into the tags of downloaded tracks)."""
from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel, Field

from .. import db

router = APIRouter(prefix="/api/settings", tags=["settings"])

ARTIST_KEY = "artist"


class SettingsBody(BaseModel):
    artist: str = Field("", max_length=120)


@router.get("")
async def get_settings():
    return {"artist": db.get_setting(ARTIST_KEY, "")}


@router.put("")
async def put_settings(body: SettingsBody):
    artist = " ".join(body.artist.split())
    db.set_setting(ARTIST_KEY, artist)
    return {"artist": artist}
