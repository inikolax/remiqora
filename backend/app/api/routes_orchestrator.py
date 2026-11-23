from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from .. import features
from ..config import ALLOW_CONCURRENT_MODELS, yue2_specs
from ..gen_queue import queue as gen_queue
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


def _message(exc: BaseException) -> str:
    return str(exc) or exc.__class__.__name__


BUSY = "a take is being generated: cancel the take first"


@router.post("/switch")
async def switch(req: SwitchRequest):
    # A queue job is running (or starting its engine): switching would stop its engine. Asking for the job's own
    # engine changes nothing (while the queue is still starting it, switch_to waits for that start under the
    # manager's lock and returns), and with every engine on its own device nothing is stopped either.
    busy = gen_queue.running_engine()
    if busy is not None and not ALLOW_CONCURRENT_MODELS and req.model != busy:
        raise HTTPException(status_code=409, detail=BUSY)
    # A part the user left out at install: say so instead of a failed start.
    if req.model == "yue2" and not features.has_yue2():
        raise HTTPException(status_code=409, detail="YuE2 is not installed")
    if req.model == "ace_step" and not features.has_ace_step():
        raise HTTPException(status_code=409, detail="ACE-Step is not installed")
    if req.model == "stable_audio" and not features.has_stable_audio():
        detail = "Stable Audio 3 weights are not downloaded" if features.has_stable_audio_env() else "Stable Audio 3 is not installed"
        raise HTTPException(status_code=409, detail=detail)
    if req.model == "cover" and not features.has_cover():
        raise HTTPException(status_code=409, detail="the cover engine (sd-server + Z-Image-Turbo) is not installed")
    try:
        await manager.switch_to(req.model)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except StartCancelled as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except (RuntimeError, TimeoutError, OSError) as exc:
        # Startup failed (or the previous model could not be stopped: StopFailed); manager.status_snapshot()
        # already reflects the per-model error state/message for the UI to display. OSError: e.g. the engine's
        # executable is missing.
        raise HTTPException(status_code=502, detail=_message(exc)) from exc
    except Exception as exc:  # noqa: BLE001 - any other failure: a message, not a bare 500
        raise HTTPException(status_code=502, detail=_message(exc)) from exc
    return manager.status_snapshot()


@router.post("/stop")
async def stop():
    if gen_queue.running_engine() is not None:
        raise HTTPException(status_code=409, detail=BUSY)
    try:
        await manager.stop_active()
    except Exception as exc:  # noqa: BLE001 - e.g. taskkill could not be run: a message, not a bare 500
        raise HTTPException(status_code=502, detail=_message(exc)) from exc
    return manager.status_snapshot()
