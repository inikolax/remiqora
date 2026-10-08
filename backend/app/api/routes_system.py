"""The header's memory meters: system RAM, video memory and who holds them (app/sysinfo.py)."""
from __future__ import annotations

import asyncio

from fastapi import APIRouter

from .. import stems, sysinfo
from ..orchestrator.manager import manager

router = APIRouter(prefix="/api/system")


@router.get("/resources")
async def resources() -> dict:
    groups = manager.process_pids()
    demucs = stems.running_pids()
    if demucs:
        groups["demucs"] = demucs
    # The per-process counters take ~1.5 s on Windows: off the event loop.
    return await asyncio.to_thread(sysinfo.snapshot, groups)
