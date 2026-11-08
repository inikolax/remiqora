"""The Models page: per engine its downloadable parts and its settings (app/engine_parts.py,
app/engine_settings.py), plus the CPU sample server's settings and life cycle (app/sfx_cpu.py).
Stable Audio 3's weights have their own routes (routes_sa3_weights.py)."""
from __future__ import annotations

import asyncio
import os

import httpx
from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from .. import engine_parts, engine_settings, features, sa3_weights
from ..orchestrator.manager import manager
from ..orchestrator.state import ModelStatus
from ..sfx_cpu import BASE_URL as CPU_BASE_URL
from ..sfx_cpu import CPU_MODELS, Settings, sampler, save_settings
from .routes_proxy import _proxy_to

router = APIRouter(prefix="/api", tags=["engines"])

ENGINES = ("ace_step", "yue2", "stable_audio", "demucs")


def _engine(engine: str) -> dict:
    out: dict = {}
    if engine in engine_settings.DEFAULTS:
        choices = dict(engine_settings.CHOICES[engine])
        if engine == "ace_step":
            # only what is on disk can be picked
            choices = {k: tuple(v for v in vals if engine_settings.ace_checkpoint_ready(v)) for k, vals in choices.items()}
        elif engine == "stable_audio":
            installed = set(features.stable_audio_models())
            choices = {"preload": tuple(v for v in choices["preload"] if v == "" or v in installed)}
        out["settings"] = engine_settings.get(engine)
        out["choices"] = choices
        out["started"] = manager.started_settings.get(engine)
    if engine in manager.state.models:
        out["status"] = manager.state.models[engine].status.value
    if engine in ("ace_step", "yue2"):
        out["ready"] = engine_parts.engine_ready(engine)
        out["parts"] = engine_parts.snapshot(engine)
        out["on_disk"] = engine_parts.engine_bytes(engine)
    elif engine == "demucs":
        out["ready"] = features.has_demucs()
        out["on_disk"] = _demucs_bytes()
    elif engine == "stable_audio":
        out["ready"] = features.has_stable_audio_env()
        out["on_disk"] = sa3_weights.total_bytes()
    return out


def _demucs_bytes() -> int:
    """Demucs fetches its models from Hugging Face (adefossez/HTDemucs) into the same cache Stable Audio uses."""
    total = 0
    for folder in features._hf_hub_dir().glob("models--adefossez--*"):
        for root, _dirs, files in os.walk(folder):
            for f in files:
                try:
                    total += os.lstat(os.path.join(root, f)).st_size
                except OSError:
                    pass
    return total


def _snapshot() -> dict:
    return {"engines": {e: _engine(e) for e in ENGINES}, "downloading": engine_parts.active()}


@router.get("/engines")
async def engines() -> dict:
    return await asyncio.to_thread(_snapshot)


@router.put("/engines/{engine}/settings")
async def put_settings(engine: str, body: dict) -> dict:
    try:
        engine_settings.save(engine, body)
    except KeyError as exc:
        raise HTTPException(404, f"no settings for {engine}") from exc
    except ValueError as exc:
        raise HTTPException(400, str(exc)) from exc
    return await asyncio.to_thread(_snapshot)


@router.post("/engines/parts/{part}/download")
async def download_part(part: str) -> dict:
    try:
        await engine_parts.start(part)
    except KeyError as exc:
        raise HTTPException(404, f"unknown part {part}") from exc
    except (RuntimeError, FileNotFoundError) as exc:
        raise HTTPException(409, str(exc)) from exc
    return await asyncio.to_thread(_snapshot)


@router.post("/engines/parts/{part}/verify")
async def verify_part(part: str) -> dict:
    """Reads the part's files and says whether they are whole (it can take a minute for the large ones)."""
    try:
        return await asyncio.to_thread(engine_parts.verify, part)
    except KeyError as exc:
        raise HTTPException(404, f"unknown part {part}") from exc
    except OSError as exc:
        raise HTTPException(500, f"could not read the files: {exc}") from exc


@router.post("/engines/parts/{part}/reinstall")
async def reinstall_part(part: str) -> dict:
    p = engine_parts.PARTS.get(part)
    if p is None:
        raise HTTPException(404, f"unknown part {part}")
    running = manager.state.models[p.engine].status != ModelStatus.STOPPED
    try:
        await engine_parts.reinstall(part, running)
    except (RuntimeError, FileNotFoundError) as exc:
        raise HTTPException(409, str(exc)) from exc
    except OSError as exc:
        raise HTTPException(500, f"could not remove the old files: {exc}") from exc
    return await asyncio.to_thread(_snapshot)


@router.delete("/engines/parts/{part}")
async def delete_part(part: str) -> dict:
    p = engine_parts.PARTS.get(part)
    if p is None:
        raise HTTPException(404, f"unknown part {part}")
    running = manager.state.models[p.engine].status != ModelStatus.STOPPED
    try:
        await engine_parts.delete(part, running)
    except PermissionError as exc:
        raise HTTPException(409, str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(409, str(exc)) from exc
    except OSError as exc:
        raise HTTPException(500, f"could not delete: {exc}") from exc
    return await asyncio.to_thread(_snapshot)


@router.post("/engines/parts/{part}/cancel")
async def cancel_part(part: str) -> dict:
    await engine_parts.cancel(part)
    return await asyncio.to_thread(_snapshot)


# ---- samples on the CPU ----
class CpuSettingsBody(BaseModel):
    enabled: bool = False
    route: str = Field("auto", pattern="^(auto|cpu)$")
    threads: int = Field(0, ge=0, le=512)
    model: str = "small-sfx"
    idle_minutes: int = Field(15, ge=0, le=24 * 60)


@router.get("/sfx-cpu")
async def sfx_cpu() -> dict:
    return await asyncio.to_thread(sampler.snapshot)


@router.put("/sfx-cpu")
async def put_sfx_cpu(body: CpuSettingsBody) -> dict:
    if body.model not in CPU_MODELS:
        raise HTTPException(400, f"model must be one of {CPU_MODELS}")
    save_settings(Settings(enabled=body.enabled, route=body.route, threads=body.threads,  # type: ignore[arg-type]
                           model=body.model, idle_minutes=body.idle_minutes))
    if not body.enabled:
        await sampler.stop()
    return await asyncio.to_thread(sampler.snapshot)


@router.post("/sfx-cpu/start")
async def start_sfx_cpu() -> dict:
    try:
        await sampler.ensure_running()
    except (PermissionError, FileNotFoundError) as exc:
        raise HTTPException(409, str(exc)) from exc
    except Exception as exc:  # noqa: BLE001 - the panel shows why it did not start
        raise HTTPException(500, str(exc)) from exc
    return await asyncio.to_thread(sampler.snapshot)


@router.post("/sfx-cpu/stop")
async def stop_sfx_cpu() -> dict:
    await sampler.stop()
    return await asyncio.to_thread(sampler.snapshot)


@router.api_route("/sa3cpu/{path:path}", methods=["GET", "POST"])
async def proxy_sfx_cpu(request: Request, path: str = "") -> Response:
    if sampler.status != "running":
        return JSONResponse({"error": "the CPU sample server is not running"}, status_code=503)
    sampler.touch()
    try:
        return await _proxy_to(CPU_BASE_URL, request, path)
    except httpx.HTTPError as exc:
        return JSONResponse({"error": f"upstream request failed: {exc}"}, status_code=502)
