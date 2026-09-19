from __future__ import annotations

import asyncio
import logging

from ..config import MODELS
from .process import ManagedProcess
from .state import ModelRuntimeState, ModelStatus, OrchestratorState

logger = logging.getLogger("orchestrator")


class OrchestratorManager:
    """Owns the on/off state of both models and enforces mutual exclusion.

    A single asyncio.Lock serializes switch_to()/stop_active() calls so that
    rapid clicks in the UI can't start two model process trees concurrently
    or interleave a stop with a start.
    """

    def __init__(self) -> None:
        self.state = OrchestratorState(models={mid: ModelRuntimeState(mid) for mid in MODELS})
        self._processes: dict[str, list[ManagedProcess]] = {}
        self._lock = asyncio.Lock()

    def status_snapshot(self) -> dict:
        return {
            "active_model": self.state.active_model,
            "models": {
                mid: {
                    "id": mid,
                    "label": MODELS[mid].label,
                    "status": rs.status.value,
                    "error": rs.error_message,
                }
                for mid, rs in self.state.models.items()
            },
        }

    async def switch_to(self, model_id: str) -> None:
        if model_id not in MODELS:
            raise ValueError(f"unknown model '{model_id}'")
        async with self._lock:
            if self.state.models[model_id].status == ModelStatus.RUNNING:
                self.state.active_model = model_id
                return
            await self._start_model(model_id)

    async def stop_active(self) -> None:
        async with self._lock:
            if self.state.active_model is not None:
                await self._stop_model(self.state.active_model)

    async def stop_all(self) -> None:
        async with self._lock:
            for model_id in list(MODELS):
                if self.state.models[model_id].status == ModelStatus.RUNNING:
                    await self._stop_model(model_id)

    async def _start_model(self, model_id: str) -> None:
        definition = MODELS[model_id]
        rs = self.state.models[model_id]
        rs.status = ModelStatus.STARTING
        rs.error_message = None
        started: list[ManagedProcess] = []
        try:
            for spec in definition.processes:
                proc = ManagedProcess(spec)
                proc.start()
                started.append(proc)
                await proc.wait_healthy()
            self._processes[model_id] = started
            rs.status = ModelStatus.RUNNING
            self.state.active_model = model_id
        except Exception as exc:  # noqa: BLE001 - any startup failure must surface to the UI
            logger.exception("failed to start model %s", model_id)
            for proc in reversed(started):
                await proc.stop()
            rs.status = ModelStatus.ERROR
            rs.error_message = str(exc)
            raise

    async def _stop_model(self, model_id: str) -> None:
        rs = self.state.models[model_id]
        rs.status = ModelStatus.STOPPING
        procs = self._processes.pop(model_id, [])
        # Reverse start order: the dependent process (e.g. YuE2's web UI)
        # stops before the process it depends on (the inference server).
        for proc in reversed(procs):
            await proc.stop()
        rs.status = ModelStatus.STOPPED
        rs.error_message = None
        if self.state.active_model == model_id:
            self.state.active_model = None


manager = OrchestratorManager()
