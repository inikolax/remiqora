"""App-wide settings that are entered once and reused everywhere: the artist name that goes into the tags of
downloaded tracks, and whether album covers are on (app/covers.py; off by default)."""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter
from pydantic import BaseModel, Field

from .. import covers, db

router = APIRouter(prefix="/api/settings", tags=["settings"])

ARTIST_KEY = "artist"


class SettingsBody(BaseModel):
    # a field left out stays as it is
    artist: Optional[str] = Field(None, max_length=120)
    covers_enabled: Optional[bool] = None


def _settings() -> dict:
    # auto_covers_available (read-only): covers on + cover engine installed, i.e. a Create form can offer make_cover
    return {"artist": db.get_setting(ARTIST_KEY, ""), "covers_enabled": covers.enabled(),
            "auto_covers_available": covers.auto_available()}


@router.get("")
async def get_settings():
    return _settings()


@router.put("")
async def put_settings(body: SettingsBody):
    if body.artist is not None:
        db.set_setting(ARTIST_KEY, " ".join(body.artist.split()))
    if body.covers_enabled is not None:
        covers.set_enabled(body.covers_enabled)
    return _settings()
