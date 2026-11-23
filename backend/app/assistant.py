"""The prompt assistant: a local language model that turns an idea into an engine's prompt.

It runs as its own process (external/prompt-assistant, a uv project), next to whatever engine holds the GPU, and is
not part of the orchestrator's exclusive switching: it starts on the first request, stops after the chosen time
without use and with the backend. Its device is "auto" by default: the GPU when about 6 GB are free there, else the
CPU in bfloat16 (on a 16-core Ryzen 9 9950X: Stable Audio tags in about 12-16 s, a song's lyrics in 35-80 s).

Its models live in the Hugging Face cache and are downloaded and deleted from the Models page, by the assistant's
own downloader (`python -m prompt_assistant.download <repo> --json`). Settings are saved in the database (key
"assistant"): the model, the device, CPU threads, minutes without use before it stops (0 = never).
"""
from __future__ import annotations

import asyncio
import json
import urllib.request
import logging
import os
import shutil
import time
from dataclasses import asdict, dataclass, field
from typing import Literal, Optional

from . import aproc, bg
from . import db, features
from .config import IS_WINDOWS, LOG_DIR, PROMPT_ASSISTANT_DIR, PROMPT_ASSISTANT_PORT, ProcessSpec
from .orchestrator.process import ManagedProcess, StartCancelled

log = logging.getLogger("assistant")

SETTINGS_KEY = "assistant"
BASE_URL = f"http://127.0.0.1:{PROMPT_ASSISTANT_PORT}"
IDLE_CHECK_SECONDS = 30.0
# Download sizes of the bfloat16 weights (external/prompt-assistant/prompt_assistant/models.py); all Apache-2.0.
MODELS: dict[str, int] = {
    "Qwen/Qwen3.5-0.8B": 1_750_000_000,
    "Qwen/Qwen3.5-2B": 4_550_000_000,
    "Qwen/Qwen3.5-4B": 9_320_000_000,
}
DEFAULT_MODEL = "Qwen/Qwen3.5-2B"
DEVICES = ("auto", "cpu", "cuda")

Status = Literal["stopped", "starting", "running", "error"]


class GpuBusy(RuntimeError):
    """The assistant would have to unload the engine a queued take is being generated with."""


def _python() -> str:
    return str(PROMPT_ASSISTANT_DIR / ".venv" / ("Scripts" if IS_WINDOWS else "bin") / ("python.exe" if IS_WINDOWS else "python"))


def has_env() -> bool:
    return (PROMPT_ASSISTANT_DIR / ".venv").is_dir()


# ---------------------------------------------------------------- settings

@dataclass
class Settings:
    model: str = DEFAULT_MODEL
    device: str = "auto"
    threads: int = 0
    idle_minutes: int = 10


def load_settings() -> Settings:
    try:
        raw = json.loads(db.get_setting(SETTINGS_KEY, "") or "{}")
    except ValueError:
        raw = {}
    s = Settings()
    if isinstance(raw, dict):
        s.model = raw.get("model") if raw.get("model") in MODELS else s.model
        s.device = raw.get("device") if raw.get("device") in DEVICES else s.device
        s.threads = max(0, min(int(raw.get("threads") or 0), os.cpu_count() or 64))
        s.idle_minutes = max(0, min(int(raw.get("idle_minutes", s.idle_minutes) or 0), 24 * 60))
    return s


def save_settings(s: Settings) -> Settings:
    db.set_setting(SETTINGS_KEY, json.dumps(asdict(s)))
    return load_settings()


# ---------------------------------------------------------------- the models in the Hugging Face cache

def repo_dir(model: str):
    return features._hf_hub_dir() / f"models--{model.replace('/', '--')}"


def installed(model: str) -> bool:
    """A snapshot with its config and every weight shard its index names (or the single weights file)."""
    snaps = repo_dir(model) / "snapshots"
    if not snaps.is_dir():
        return False
    for snap in snaps.iterdir():
        if not (snap / "config.json").is_file():
            continue
        index = snap / "model.safetensors.index.json"
        if index.is_file():
            try:
                shards = set(json.loads(index.read_text(encoding="utf-8"))["weight_map"].values())
            except (OSError, ValueError, KeyError):
                continue
            if shards and all((snap / f).is_file() for f in shards):
                return True
        elif (snap / "model.safetensors").is_file():
            return True
    return False


def _dir_size(path) -> int:
    total = 0
    for root, _dirs, files in os.walk(path):
        for f in files:
            try:
                total += os.lstat(os.path.join(root, f)).st_size
            except OSError:
                pass
    return total


@dataclass
class Download:
    model: str
    status: Literal["running", "done", "failed", "cancelled"] = "running"
    done: int = 0
    total: int = 0
    error: Optional[str] = None
    proc: Optional[asyncio.subprocess.Process] = field(default=None, repr=False)
    cancel_requested: bool = False


_downloads: dict[str, Download] = {}


def downloading() -> Optional[str]:
    return next((d.model for d in _downloads.values() if d.status == "running"), None)


async def start_download(model: str) -> None:
    if model not in MODELS:
        raise KeyError(model)
    current = downloading()
    if current == model:
        return
    if current is not None:
        raise RuntimeError(f"'{current}' is downloading; one at a time")
    if not has_env():
        raise FileNotFoundError("the prompt assistant is not installed")
    d = Download(model=model, total=MODELS[model])
    _downloads[model] = d
    bg.spawn(_run_download(d), name=f"assistant-download-{model}")


async def cancel_download(model: str) -> None:
    d = _downloads.get(model)
    if d is None or d.status != "running":
        return
    d.cancel_requested = True
    if d.proc is not None:
        await _kill_tree(d.proc)


async def delete_model(model: str) -> None:
    if model not in MODELS:
        raise KeyError(model)
    if downloading() == model:
        raise RuntimeError("it is downloading; stop the download first")
    if server.status in ("running", "starting") and server.started_model == model:
        raise RuntimeError("the assistant is running with this model; stop it first")
    await asyncio.to_thread(shutil.rmtree, repo_dir(model), True)
    _downloads.pop(model, None)


async def _kill_tree(proc: asyncio.subprocess.Process) -> None:
    if IS_WINDOWS:
        killer = await aproc.create_subprocess_exec("taskkill", "/PID", str(proc.pid), "/T", "/F",
                                                      stdout=asyncio.subprocess.DEVNULL, stderr=asyncio.subprocess.DEVNULL)
        await killer.wait()
    else:
        try:
            proc.kill()
        except ProcessLookupError:
            pass


async def _run_download(d: Download) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_path = LOG_DIR / "assistant_download.log"
    env = {**os.environ, "PYTHONUTF8": "1", "PYTHONIOENCODING": "utf-8", "HF_HUB_DISABLE_SYMLINKS_WARNING": "1"}
    try:
        proc = await aproc.create_subprocess_exec(
            _python(), "-m", "prompt_assistant.download", d.model, "--json", cwd=str(PROMPT_ASSISTANT_DIR), env=env,
            stdin=asyncio.subprocess.DEVNULL, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT)
    except OSError as exc:
        d.status, d.error = "failed", str(exc)
        return
    d.proc = proc
    assert proc.stdout is not None
    with open(log_path, "a", encoding="utf-8") as logf:
        logf.write(f"\n--- download {d.model}\n")
        async for raw in proc.stdout:
            line = raw.decode("utf-8", "replace").strip()
            if not line:
                continue
            logf.write(line + "\n")
            try:
                ev = json.loads(line)
            except ValueError:
                continue
            if ev.get("event") in ("start", "progress"):
                d.total = int(ev.get("total") or d.total)
                d.done = int(ev.get("done") or d.done)
            elif ev.get("event") == "error":
                d.error = ev.get("message") or ev.get("code")
    code = await proc.wait()
    d.proc = None
    if d.cancel_requested:
        d.status = "cancelled"
        for path in (repo_dir(d.model) / "blobs").glob("*.incomplete"):
            try:
                path.unlink()
            except OSError:
                pass
    elif code == 0:
        d.status, d.done = "done", d.total
    else:
        d.status = "failed"
        d.error = d.error or f"the downloader exited with code {code} (see {log_path})"


# ---------------------------------------------------------------- the process

class Assistant:
    def __init__(self) -> None:
        self.status: Status = "stopped"
        self.error: Optional[str] = None
        self._proc: Optional[ManagedProcess] = None
        self._lock = asyncio.Lock()
        self._cancel: Optional[asyncio.Event] = None
        self._last_used = time.monotonic()
        self._watcher: Optional[asyncio.Task] = None
        self._started_with: Optional[tuple[str, str, int]] = None
        # the engine unloaded to make room on the GPU (device "GPU"), so the page can say which one to start again
        self.unloaded_engine: Optional[str] = None

    @property
    def started_model(self) -> Optional[str]:
        return self._started_with[0] if self._started_with else None

    def touch(self) -> None:
        self._last_used = time.monotonic()

    def pids(self) -> list[int]:
        return [self._proc.pid] if self._proc and self._proc.pid else []

    def live(self) -> dict:
        """The running server's own view: which device it chose ("auto" resolves there) and whether the model is in."""
        if self.status != "running":
            return {}
        try:
            with urllib.request.urlopen(f"{BASE_URL}/health", timeout=1.0) as r:
                return json.load(r)
        except (OSError, ValueError):
            return {}

    async def release_gpu(self) -> None:
        """A GPU engine is about to start: an assistant holding the GPU steps aside. With "auto" its next request
        starts it again, on the CPU if the engine took the room; with "GPU" it unloads the engine again."""
        self.unloaded_engine = None
        if self.status == "running" and (await asyncio.to_thread(self.live)).get("device") == "cuda":
            log.info("a GPU engine is starting: stopping the prompt assistant, which held the GPU")
            await self.stop()

    def snapshot(self) -> dict:
        s = load_settings()
        if self.status == "running" and self._proc is not None and not self._proc.is_running:
            self.status, self.error = "error", self._proc.exit_summary()
        live = self.live()
        models = []
        for model, size in MODELS.items():
            d = _downloads.get(model)
            running = d is not None and d.status == "running"
            models.append({
                "id": model, "bytes": size, "installed": not running and installed(model), "on_disk": _dir_size(repo_dir(model)),
                "download": None if d is None else {"status": d.status, "done": d.done, "total": d.total or size, "error": d.error},
            })
        return {
            "settings": asdict(s),
            "status": self.status,
            "error": self.error,
            "ready": has_env(),
            "models": models,
            "downloading": downloading(),
            "on_disk": sum(m["on_disk"] for m in models),
            "cpu_count": os.cpu_count() or 0,
            "started": None if not self._started_with else {"model": self._started_with[0], "device": self._started_with[1], "threads": self._started_with[2]},
            # where it actually runs ("auto" resolved) and whether the model is loaded yet
            "device": live.get("device"),
            "loaded": bool(live.get("loaded")),
            "restart_pending": self.status == "running" and self._started_with != (s.model, s.device, s.threads),
            "unloaded_engine": self.unloaded_engine,
        }

    @staticmethod
    def _device(s: Settings) -> str:
        """"auto" means the GPU only while no GPU engine runs: an engine that has just started may load its models
        later, so free memory at this moment says little. With an engine up, the CPU."""
        if s.device != "auto":
            return s.device
        from .orchestrator.manager import manager

        return "auto" if manager.state.active_model is None else "cpu"

    def _spec(self, s: Settings) -> ProcessSpec:
        device = self._device(s)
        return ProcessSpec(
            name="prompt_assistant",
            cwd=PROMPT_ASSISTANT_DIR,
            cmd=[_python(), "-m", "prompt_assistant", "--host", "127.0.0.1", "--port", str(PROMPT_ASSISTANT_PORT),
                 "--model", s.model, "--device", device, "--threads", str(s.threads), "--preload"],
            env={"PYTHONUTF8": "1", "HF_HUB_OFFLINE": "1", **({"CUDA_VISIBLE_DEVICES": ""} if device == "cpu" else {})},
            health_url=f"{BASE_URL}/health",
            startup_timeout=120.0,
        )

    async def ensure_running(self) -> None:
        s = load_settings()
        if not has_env():
            raise FileNotFoundError("the prompt assistant is not installed")
        if not installed(s.model):
            raise FileNotFoundError(f"the model '{s.model}' is not downloaded")
        self.touch()
        up = self._proc is not None and self._proc.is_running and self._started_with == (s.model, s.device, s.threads)
        # Device "GPU": the assistant takes the GPU the way an engine does. A running engine is unloaded first;
        # when an engine starts again (Generate), the assistant leaves the GPU (release_gpu). Done outside our lock:
        # the orchestrator's switch holds its own lock while it asks us to leave the GPU.
        if s.device == "cuda" and not up:
            await self._free_gpu_for_assistant()
        async with self._lock:
            if self._proc is not None and self._proc.is_running and self._started_with == (s.model, s.device, s.threads):
                self.status = "running"
                return
            await self._stop_locked()
            self.status, self.error = "starting", None
            self._cancel = asyncio.Event()
            proc = ManagedProcess(self._spec(s))
            try:
                proc.start()
                self._proc = proc
                await proc.wait_healthy(self._cancel)
            except StartCancelled:
                await proc.stop()
                self._proc, self.status = None, "stopped"
                raise
            except Exception as exc:  # noqa: BLE001 - the page shows why it did not start
                log.exception("the prompt assistant did not start")
                await proc.stop()
                self._proc, self.status, self.error = None, "error", str(exc)
                raise
            finally:
                self._cancel = None
            self._started_with = (s.model, s.device, s.threads)
            self.status = "running"
            self.touch()
        if self._watcher is None or self._watcher.done():
            self._watcher = asyncio.create_task(self._watch_idle())

    async def _free_gpu_for_assistant(self) -> None:
        from .config import ALLOW_CONCURRENT_MODELS
        from .orchestrator.manager import manager

        if ALLOW_CONCURRENT_MODELS:
            return
        from .gen_queue import queue as gen_queue

        if gen_queue.running_engine() is not None:
            raise GpuBusy("a take is being generated on the GPU: wait for it or cancel it, or run the assistant on the CPU")
        if manager.state.active_model is None:
            return
        log.info("the prompt assistant runs on the GPU: unloading %s first", manager.state.active_model)
        self.unloaded_engine = manager.state.active_model
        await manager.stop_active()

    async def stop(self) -> None:
        if self._cancel is not None:
            self._cancel.set()
        async with self._lock:
            await self._stop_locked()

    async def _stop_locked(self) -> None:
        proc, self._proc = self._proc, None
        self._started_with = None
        if proc is not None:
            await proc.stop()
        if self.status != "error":
            self.status = "stopped"

    async def shutdown(self) -> None:
        if self._watcher is not None:
            self._watcher.cancel()
            self._watcher = None
        await self.stop()

    async def _watch_idle(self) -> None:
        while self._proc is not None:
            await asyncio.sleep(IDLE_CHECK_SECONDS)
            minutes = load_settings().idle_minutes
            if minutes and self.status == "running" and time.monotonic() - self._last_used > minutes * 60:
                log.info("the prompt assistant was idle for %d min: stopping it", minutes)
                await self.stop()


server = Assistant()
