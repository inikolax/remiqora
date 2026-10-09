from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .. import features
from ..config import yue2_specs
from ..orchestrator.manager import manager
from ..orchestrator.process import StartCancelled

router = APIRouter(prefix="/api/orchestrator", tags=["orchestrator"])


class SwitchRequest(BaseModel):
    model: str


@router.get("/config")
async def get_config():
    return {
        "yue2_specs": yue2_specs(),
    }


@router.get("/status")
async def get_status():
    return manager.status_snapshot()


@router.post("/switch")
async def switch(req: SwitchRequest):
    # A part the user left out at install: say so instead of a failed start.
    if req.model == "yue2" and not features.has_yue2():
        raise HTTPException(status_code=409, detail="YuE2 is not installed")
    if req.model == "ace_step" and not features.has_ace_step():
        raise HTTPException(status_code=409, detail="ACE-Step is not installed")
    try:
        await manager.switch_to(req.model)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except StartCancelled as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except (RuntimeError, TimeoutError) as exc:
        # Startup failed; manager.status_snapshot() already reflects the
        # per-model error state/message for the UI to display.
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return manager.status_snapshot()


@router.post("/stop")
async def stop():
    await manager.stop_active()
    return manager.status_snapshot()
