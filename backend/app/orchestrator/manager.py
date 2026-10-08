from __future__ import annotations

import asyncio
import logging

from ..config import ALLOW_CONCURRENT_MODELS, MODELS
from .process import ManagedProcess, StartCancelled
from .state import ModelRuntimeState, ModelStatus, OrchestratorState

logger = logging.getLogger("orchestrator")

# How often the watchdog checks that a RUNNING model's processes are alive.
WATCH_INTERVAL = 2.0


class OrchestratorManager:
    """Owns the on/off state of both models and enforces mutual exclusion.

    A single asyncio.Lock serializes switch_to()/stop_active() calls so that
    rapid clicks in the UI can't start two model process trees concurrently
    or interleave a stop with a start. Stop and shutdown do not wait behind a
    start that is still loading: they cancel it first, and a switch that was
    queued before the stop is dropped.

    A watchdog task marks a RUNNING model as ERROR as soon as one of its
    processes exits (e.g. CUDA out of memory), so the proxy and the job
    routes see it as inactive instead of forwarding to a dead port.
    """

    def __init__(self) -> None:
        self.state = OrchestratorState(models={mid: ModelRuntimeState(mid) for mid in MODELS})
        self._processes: dict[str, list[ManagedProcess]] = {}
        self._lock = asyncio.Lock()
        self._cancel_start: dict[str, asyncio.Event] = {}
        self._stop_requests = 0
        self._watchdog: asyncio.Task | None = None

    def start_watchdog(self) -> None:
        if self._watchdog is None:
            self._watchdog = asyncio.create_task(self._watch())

    async def _watch(self) -> None:
        while True:
            await asyncio.sleep(WATCH_INTERVAL)
            for model_id in list(MODELS):
                try:
                    if self._mark_if_exited(model_id):
                        await self._stop_processes(model_id)
                except Exception:  # noqa: BLE001 - the watchdog must keep running
                    logger.exception("watchdog check failed for %s", model_id)

    def _mark_if_exited(self, model_id: str) -> bool:
        rs = self.state.models[model_id]
        if rs.status != ModelStatus.RUNNING:
            return False
        dead = next((p for p in self._processes.get(model_id, []) if not p.is_running), None)
        if dead is None:
            return False
        summary = dead.exit_summary()
        logger.error("model %s: %s", model_id, summary)
        rs.status = ModelStatus.ERROR
        rs.error_message = summary
        if self.state.active_model == model_id:
            self.state.active_model = None
        return True

    def _cancel_pending_starts(self) -> None:
        self._stop_requests += 1
        for event in self._cancel_start.values():
            event.set()

    def process_pids(self) -> dict[str, list[int]]:
        """Root PIDs of the running processes, by model id (the header's memory meters walk their trees)."""
        out: dict[str, list[int]] = {}
        for mid, procs in self._processes.items():
            pids = [p.pid for p in procs if p.pid]
            if pids:
                out[mid] = pids
        return out

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
        stop_requests = self._stop_requests
        async with self._lock:
            if self._stop_requests != stop_requests:
                raise StartCancelled(f"start of '{model_id}' was cancelled")
            if self._mark_if_exited(model_id):
                await self._stop_processes(model_id)
            if self.state.models[model_id].status == ModelStatus.RUNNING:
                self.state.active_model = model_id
                return
            current = self.state.active_model
            if not ALLOW_CONCURRENT_MODELS and current is not None and current != model_id:
                await self._stop_model(current)
            await self._start_model(model_id)

    async def stop_active(self) -> None:
        self._cancel_pending_starts()
        async with self._lock:
            if self.state.active_model is not None:
                await self._stop_model(self.state.active_model)

    async def stop_all(self) -> None:
        self._cancel_pending_starts()
        if self._watchdog is not None:
            self._watchdog.cancel()
            self._watchdog = None
        async with self._lock:
            # Everything still holding processes: RUNNING models, and any the
            # watchdog marked ERROR but had not finished cleaning up.
            for model_id in list(self._processes):
                await self._stop_model(model_id)

    async def _start_model(self, model_id: str) -> None:
        definition = MODELS[model_id]
        rs = self.state.models[model_id]
        rs.status = ModelStatus.STARTING
        rs.error_message = None
        started: list[ManagedProcess] = []
        cancel = self._cancel_start[model_id] = asyncio.Event()
        try:
            for spec in definition.processes:
                if cancel.is_set():
                    raise StartCancelled(f"start of '{model_id}' was cancelled")
                proc = ManagedProcess(spec)
                proc.start()
                started.append(proc)
                await proc.wait_healthy(cancel)
            self._processes[model_id] = started
            rs.status = ModelStatus.RUNNING
            self.state.active_model = model_id
        except StartCancelled:
            logger.info("start of model %s cancelled", model_id)
            rs.status = ModelStatus.STOPPING
            for proc in reversed(started):
                await proc.stop()
            rs.status = ModelStatus.STOPPED
            raise
        except Exception as exc:  # noqa: BLE001 - any startup failure must surface to the UI
            logger.exception("failed to start model %s", model_id)
            for proc in reversed(started):
                await proc.stop()
            rs.status = ModelStatus.ERROR
            rs.error_message = str(exc)
            raise
        finally:
            self._cancel_start.pop(model_id, None)

    async def _stop_processes(self, model_id: str) -> None:
        # Reverse start order: the dependent process (e.g. YuE2's web UI)
        # stops before the process it depends on (the inference server).
        # A process leaves the list only once it has stopped, so if this is
        # interrupted, stop_all() still finds the ones that are left.
        procs = self._processes.get(model_id, [])
        while procs:
            proc = procs[-1]
            await proc.stop()
            if procs and procs[-1] is proc:
                procs.pop()
        if self._processes.get(model_id) is procs:
            del self._processes[model_id]

    async def _stop_model(self, model_id: str) -> None:
        rs = self.state.models[model_id]
        rs.status = ModelStatus.STOPPING
        await self._stop_processes(model_id)
        rs.status = ModelStatus.STOPPED
        rs.error_message = None
        if self.state.active_model == model_id:
            self.state.active_model = None


manager = OrchestratorManager()
