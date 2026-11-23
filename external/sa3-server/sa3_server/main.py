"""FastAPI app and CLI entry point."""
from __future__ import annotations

import argparse
import logging
import os
import signal
import threading
from pathlib import Path
from typing import Annotated, Any

import uvicorn
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel

from . import __version__
from .audio import decode_upload
from .engine import MODEL_SPECS, TASKS, Engine, installed_models
from .jobs import JobRegistry

log = logging.getLogger("sa3")

MAX_BATCH = 4
MAX_STEPS = 200
# The samplers of Stable Audio 3's rectified-flow checkpoints; pingpong is the package's default for them.
SAMPLERS = ("pingpong", "euler", "rk4", "dpmpp")


# Module level on purpose: with postponed annotations FastAPI resolves a handler's type hints
# against the module globals, and a class local to build_app() would be taken for a query parameter.
class LoadRequest(BaseModel):
    model: str


class QueryRequest(BaseModel):
    ids: list[str]


def build_app(engine: Engine, preload: str | None) -> FastAPI:
    app = FastAPI(title="sa3-server", version=__version__)
    jobs = JobRegistry(engine.run)
    app.state.engine = engine
    app.state.jobs = jobs

    @app.on_event("startup")
    def _startup() -> None:
        jobs.start()
        # medium needs CUDA: on a Mac or a CPU it is not warmed up (and not offered, see /v1/models)
        runnable = preload in MODEL_SPECS and (engine.device_name() == "cuda" or not MODEL_SPECS[preload]["gpu_only"])
        if preload and runnable and installed_models().get(preload):
            threading.Thread(target=_safe_load, args=(engine, preload), name="sa3-preload", daemon=True).start()

    @app.on_event("shutdown")
    def _shutdown() -> None:
        jobs.stop()
        engine.unload_all()

    @app.get("/health")
    def health() -> dict[str, Any]:
        return {"ok": True, "loaded": engine.loaded(), "loading": engine.loading(), "version": __version__}

    @app.get("/v1/models")
    def models() -> list[dict[str, Any]]:
        found = installed_models()
        loaded = set(engine.loaded())
        device = engine.device_name()
        out = []
        for name, spec in MODEL_SPECS.items():
            out.append({
                "id": name,
                "label": spec["label"],
                "repo": spec["repo"],
                "params": spec["params"],
                "max_seconds": spec["max_seconds"],
                "kinds": spec["kinds"],
                "tasks": list(TASKS),
                "base": bool(spec.get("base")),
                "installed": found[name] is not None,
                "loaded": name in loaded,
                "loading": engine.loading() == name,
                # medium wants CUDA with Flash Attention; on a Mac (mps) or a CPU only the small ones are offered
                "available": found[name] is not None and (device == "cuda" or not spec["gpu_only"]),
                "device": device,
            })
        return out

    @app.post("/v1/models/load")
    def load_model(req: LoadRequest) -> dict[str, Any]:
        try:
            engine.load(req.model)
        except ValueError as exc:
            raise HTTPException(400, str(exc)) from exc
        except FileNotFoundError as exc:
            raise HTTPException(409, str(exc)) from exc
        return {"loaded": engine.loaded()}

    @app.post("/v1/jobs")
    async def create_job(
        task: Annotated[str, Form()] = "text",
        model: Annotated[str, Form()] = "medium",
        prompt: Annotated[list[str], Form()] = [],
        negative_prompt: Annotated[list[str], Form()] = [],
        duration: Annotated[float | None, Form()] = None,
        steps: Annotated[int, Form()] = 8,
        cfg_scale: Annotated[float, Form()] = 1.0,
        seed: Annotated[int, Form()] = -1,
        batch_size: Annotated[int, Form()] = 1,
        init_noise_level: Annotated[float, Form()] = 0.7,
        mask_start: Annotated[list[float], Form()] = [],
        mask_end: Annotated[list[float], Form()] = [],
        chunked_decode: Annotated[str | None, Form()] = None,
        trim_silence: Annotated[str | None, Form()] = None,
        # The sampler and the guidance: left out, each is the package's own default.
        sampler_type: Annotated[str | None, Form()] = None,
        apg_scale: Annotated[float | None, Form()] = None,
        cfg_interval_min: Annotated[float | None, Form()] = None,
        cfg_interval_max: Annotated[float | None, Form()] = None,
        scale_phi: Annotated[float | None, Form()] = None,
        cfg_norm_threshold: Annotated[float | None, Form()] = None,
        duration_padding: Annotated[float | None, Form()] = None,
        audio: Annotated[UploadFile | None, File()] = None,
    ) -> dict[str, Any]:
        # One prompt for the batch, or one per variant.
        if len(prompt) not in (0, 1, batch_size):
            raise HTTPException(400, f"prompt must be one text or {batch_size} (one per variant)")
        if len(negative_prompt) not in (0, 1, batch_size):
            raise HTTPException(400, f"negative_prompt must be one text or {batch_size}")
        prompt_value: str | list[str] = prompt[0] if len(prompt) == 1 else (prompt or "")
        negative_value: str | list[str] = negative_prompt[0] if len(negative_prompt) == 1 else (negative_prompt or "")
        if task not in TASKS:
            raise HTTPException(400, f"task must be one of {TASKS}")
        if model not in MODEL_SPECS:
            raise HTTPException(400, f"model must be one of {list(MODEL_SPECS)}")
        if installed_models().get(model) is None:
            raise HTTPException(409, f"model '{model}' is not downloaded")
        if not (1 <= batch_size <= MAX_BATCH):
            raise HTTPException(400, f"batch_size must be 1..{MAX_BATCH}")
        if not (1 <= steps <= MAX_STEPS):
            raise HTTPException(400, f"steps must be 1..{MAX_STEPS}")
        if task != "text" and audio is None:
            raise HTTPException(400, f"task '{task}' needs an audio file")
        if task == "inpaint" and (not mask_start or len(mask_start) != len(mask_end)):
            raise HTTPException(400, "inpaint needs matching mask_start/mask_end lists")
        if not (0.0 <= init_noise_level <= 1.0):
            raise HTTPException(400, "init_noise_level must be within 0..1")
        if sampler_type is not None and sampler_type not in SAMPLERS:
            raise HTTPException(400, f"sampler_type must be one of {SAMPLERS}")
        for name, value, low, high in (
            ("apg_scale", apg_scale, 0.0, 1.0), ("cfg_interval_min", cfg_interval_min, 0.0, 1.0), ("cfg_interval_max", cfg_interval_max, 0.0, 1.0),
            ("scale_phi", scale_phi, 0.0, 1.0), ("cfg_norm_threshold", cfg_norm_threshold, 0.0, 100.0), ("duration_padding", duration_padding, 0.0, 30.0),
        ):
            if value is not None and not (low <= value <= high):
                raise HTTPException(400, f"{name} must be within {low:g}..{high:g}")
        if (cfg_interval_min or 0.0) > (1.0 if cfg_interval_max is None else cfg_interval_max):
            raise HTTPException(400, "cfg_interval_min must not be above cfg_interval_max")

        decoded = None
        if audio is not None:
            try:
                decoded = decode_upload(await audio.read())
            except Exception as exc:  # noqa: BLE001
                raise HTTPException(400, f"cannot decode audio: {exc}") from exc
            src_seconds = decoded[1].shape[-1] / decoded[0]
            if task == "a2a":
                # Without a duration the cover is as long as the source. A shorter one covers the
                # start only; a longer one carries on past the source from noise.
                duration = float(duration) if duration else src_seconds
            elif task == "inpaint":
                duration = max(float(duration or 0), src_seconds)
        if duration is None:
            duration = 30.0
        max_seconds = MODEL_SPECS[model]["max_seconds"]
        if not (0.5 <= duration <= max_seconds):
            raise HTTPException(400, f"duration must be within 0.5..{max_seconds} s for '{model}'")

        flag = (chunked_decode or "").strip().lower()
        request = {
            "task": task,
            "model": model,
            "prompt": prompt_value,
            "negative_prompt": negative_value,
            "trim_silence": (trim_silence or "").strip().lower() in ("1", "true", "yes"),
            "duration": float(duration),
            "steps": steps,
            "cfg_scale": cfg_scale,
            "seed": seed,
            "batch_size": batch_size,
            "init_noise_level": init_noise_level,
            "mask_start": mask_start,
            "mask_end": mask_end,
            "chunked_decode": None if not flag else flag in ("1", "true", "yes"),
            "sampler_type": sampler_type,
            "apg_scale": apg_scale,
            "cfg_interval": None if cfg_interval_min is None and cfg_interval_max is None else (cfg_interval_min or 0.0, 1.0 if cfg_interval_max is None else cfg_interval_max),
            "scale_phi": scale_phi,
            "cfg_norm_threshold": cfg_norm_threshold,
            "duration_padding": duration_padding,
        }
        job, position = jobs.submit(request, decoded)
        return {"job_id": job.id, "queue_position": position, "status": job.status}

    @app.post("/v1/jobs/query")
    def query_jobs(req: QueryRequest) -> list[dict[str, Any]]:
        return jobs.query(req.ids)

    @app.get("/v1/jobs/{job_id}")
    def get_job(job_id: str) -> dict[str, Any]:
        job = jobs.get(job_id)
        if job is None:
            raise HTTPException(404, "no such job")
        return job.to_dict()

    @app.post("/v1/jobs/{job_id}/cancel")
    def cancel_job(job_id: str) -> dict[str, Any]:
        job = jobs.cancel(job_id)
        if job is None:
            raise HTTPException(404, "no such job")
        return {"job_id": job.id, "status": job.status}

    @app.get("/v1/files/{name}")
    def get_file(name: str) -> FileResponse:
        if "/" in name or "\\" in name or not name.endswith(".wav"):
            raise HTTPException(404, "no such file")
        path = engine.out_dir / name
        if not path.is_file():
            raise HTTPException(404, "no such file")
        return FileResponse(path, media_type="audio/wav", filename=name)

    return app


def _safe_load(engine: Engine, name: str) -> None:
    try:
        engine.load(name)
    except Exception:  # noqa: BLE001
        log.exception("preload of %s failed", name)


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(prog="sa3-server", description="HTTP server around Stable Audio 3")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8002)
    parser.add_argument("--device", default=os.getenv("SA3_DEVICE") or None, help="cuda / cpu / mps (auto when omitted)")
    parser.add_argument("--preload", default="medium", help="model to warm up at start (empty to skip)")
    parser.add_argument("--max-resident", type=int, default=1, help="how many checkpoints may stay in memory")
    parser.add_argument("--out-dir", default=os.getenv("SA3_OUT_DIR") or "output", help="where generated WAVs go")
    parser.add_argument("--threads", type=int, default=int(os.getenv("SA3_THREADS") or 0),
                        help="CPU threads for PyTorch (0 = its default, one per physical core)")
    parser.add_argument("--log-level", default="info")
    args = parser.parse_args(argv)
    if args.threads > 0:
        import torch

        torch.set_num_threads(args.threads)

    logging.basicConfig(level=args.log_level.upper(), format="%(asctime)s %(name)s %(levelname)s %(message)s")
    engine = Engine(Path(args.out_dir), device=args.device, max_resident=args.max_resident)
    app = build_app(engine, args.preload or None)

    config = uvicorn.Config(app, host=args.host, port=args.port, log_level=args.log_level, access_log=False)
    server = uvicorn.Server(config)
    # The orchestrator stops us with CTRL_BREAK_EVENT on Windows (SIGBREAK) and SIGTERM elsewhere.
    if hasattr(signal, "SIGBREAK"):
        signal.signal(signal.SIGBREAK, lambda *_: setattr(server, "should_exit", True))
    server.run()


if __name__ == "__main__":
    main()
