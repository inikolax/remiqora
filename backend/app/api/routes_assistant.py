"""The prompt assistant (app/assistant.py): its state, settings and models for the Models page, and a proxy to its
own API that starts it on demand (/api/assistant/v1/* -> external/prompt-assistant)."""
from __future__ import annotations

import asyncio

import httpx
from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from .. import assistant
from ..assistant import Settings, server
from .routes_proxy import _proxy_to

router = APIRouter(prefix="/api/assistant", tags=["assistant"])


class SettingsBody(BaseModel):
    model: str = assistant.DEFAULT_MODEL
    device: str = Field("auto", pattern="^(auto|cpu|cuda)$")
    threads: int = Field(0, ge=0, le=512)
    idle_minutes: int = Field(10, ge=0, le=24 * 60)


def _state() -> dict:
    return server.snapshot()


@router.get("/state")
async def state() -> dict:
    return await asyncio.to_thread(_state)


@router.put("/settings")
async def put_settings(body: SettingsBody) -> dict:
    if body.model not in assistant.MODELS:
        raise HTTPException(400, f"model must be one of {list(assistant.MODELS)}")
    assistant.save_settings(Settings(model=body.model, device=body.device, threads=body.threads, idle_minutes=body.idle_minutes))
    return await asyncio.to_thread(_state)


@router.post("/start")
async def start() -> dict:
    try:
        await server.ensure_running()
    except (FileNotFoundError, assistant.GpuBusy) as exc:
        raise HTTPException(409, str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 - the page shows why it did not start
        raise HTTPException(500, str(exc)) from exc
    return await asyncio.to_thread(_state)


@router.post("/stop")
async def stop() -> dict:
    await server.stop()
    return await asyncio.to_thread(_state)


@router.post("/models/{owner}/{name}/download")
async def download(owner: str, name: str) -> dict:
    try:
        await assistant.start_download(f"{owner}/{name}")
    except KeyError as exc:
        raise HTTPException(404, f"unknown model {owner}/{name}") from exc
    except (RuntimeError, FileNotFoundError) as exc:
        raise HTTPException(409, str(exc)) from exc
    return await asyncio.to_thread(_state)


@router.post("/models/{owner}/{name}/cancel")
async def cancel(owner: str, name: str) -> dict:
    await assistant.cancel_download(f"{owner}/{name}")
    return await asyncio.to_thread(_state)


@router.delete("/models/{owner}/{name}")
async def delete(owner: str, name: str) -> dict:
    try:
        await assistant.delete_model(f"{owner}/{name}")
    except KeyError as exc:
        raise HTTPException(404, f"unknown model {owner}/{name}") from exc
    except RuntimeError as exc:
        raise HTTPException(409, str(exc)) from exc
    return await asyncio.to_thread(_state)


@router.api_route("/v1/{path:path}", methods=["GET", "POST"])
async def proxy(request: Request, path: str = "") -> Response:
    """The assistant's own API; it is started first when it is not running (that takes a few seconds)."""
    try:
        await server.ensure_running()
    except (FileNotFoundError, assistant.GpuBusy) as exc:
        return JSONResponse({"error": str(exc)}, status_code=409)
    except Exception as exc:  # noqa: BLE001
        return JSONResponse({"error": f"the prompt assistant did not start: {exc}"}, status_code=503)
    server.touch()
    try:
        response = await _proxy_to(assistant.BASE_URL, request, f"v1/{path}")
    except httpx.HTTPError as exc:
        return JSONResponse({"error": f"upstream request failed: {exc}"}, status_code=502)
    server.touch()
    return response
