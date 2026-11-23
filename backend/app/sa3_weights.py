"""Stable Audio 3 weights, fetched from the app.

The checkpoints live in the Hugging Face cache and the post-trained ones are gated, so the installer leaves them
out. This module runs sa3-server's own downloader (`python -m sa3_server.download <model> --json`, in that
project's venv) as a background job: the GPU engine does not have to run and nothing has to be switched.
Stopping it keeps the files that finished; the file it was on starts over next time (huggingface_hub cannot
continue a cut-off file), and its partial copy is deleted right away. One download at a time.

It also saves a Hugging Face token the user pastes (`--login`), so the gated checkpoints can be fetched without a
console; the token goes to the Hugging Face cache (HF_HOME/token), never to Remiqora's database or logs.
"""
from __future__ import annotations

import asyncio
import json
import os
import shutil
import sys
from dataclasses import dataclass, field
from typing import Literal, Optional

from . import aproc, bg
from . import features
from .config import LOG_DIR, STABLE_AUDIO_DIR

IS_WINDOWS = sys.platform == "win32"

# Approximate download sizes (the files the downloader takes: weights, config, text encoder) and whether the
# licence has to be accepted first. The -base repos are open.
MODELS: dict[str, dict] = {
    "medium": {"bytes": 10_443_853_326, "gated": True},
    "small-music": {"bytes": 3_492_098_062, "gated": True},
    "small-sfx": {"bytes": 3_492_098_062, "gated": True},
    "medium-base": {"bytes": 10_443_850_808, "gated": False},
    "small-music-base": {"bytes": 3_492_096_173, "gated": False},
    "small-sfx-base": {"bytes": 3_492_096_173, "gated": False},
}
assert tuple(MODELS) == features.STABLE_AUDIO_MODELS

Status = Literal["idle", "running", "done", "failed", "cancelled"]
ErrorCode = Literal["login", "access", "network", "unknown"]


@dataclass
class Download:
    model: str
    status: Status = "running"
    done: int = 0
    total: int = 0
    error: Optional[str] = None
    code: Optional[ErrorCode] = None
    proc: Optional[asyncio.subprocess.Process] = field(default=None, repr=False)
    cancel_requested: bool = False


_downloads: dict[str, Download] = {}


def _python() -> str:
    return str(STABLE_AUDIO_DIR / ".venv" / ("Scripts" if IS_WINDOWS else "bin") / ("python.exe" if IS_WINDOWS else "python"))


def _env() -> dict[str, str]:
    # The same Hugging Face cache the engine reads (HF_HOME is set by the desktop app; a source install uses
    # the default). PYTHONUTF8 keeps the JSON lines readable whatever the console code page is.
    return {**os.environ, "PYTHONUTF8": "1", "PYTHONIOENCODING": "utf-8", "HF_HUB_DISABLE_SYMLINKS_WARNING": "1"}


def active() -> Optional[str]:
    for d in _downloads.values():
        if d.status == "running":
            return d.model
    return None


def has_token() -> bool:
    if os.getenv("HF_TOKEN"):
        return True
    hf_home = os.getenv("HF_HOME") or os.path.join(os.path.expanduser("~"), ".cache", "huggingface")
    path = os.getenv("HF_TOKEN_PATH") or os.path.join(hf_home, "token")
    try:
        with open(path, encoding="utf-8") as f:
            return bool(f.read().strip())
    except OSError:
        return False


def repo_dir(name: str):
    return features._hf_hub_dir() / f"models--stabilityai--stable-audio-3-{name}"


def _dir_size(path) -> int:
    total = 0
    for root, _dirs, files in os.walk(path):
        for f in files:
            try:
                total += os.lstat(os.path.join(root, f)).st_size
            except OSError:
                pass
    return total


def total_bytes() -> int:
    return sum(_dir_size(repo_dir(n)) for n in MODELS)


async def delete(model: str, engine_running: bool) -> None:
    """Removes the checkpoint from the Hugging Face cache (its whole repo folder)."""
    if model not in MODELS:
        raise ValueError(f"unknown model '{model}'")
    if engine_running:
        raise RuntimeError("stop Stable Audio 3 first: it holds the files open")
    if active() == model:
        raise RuntimeError("it is downloading; stop the download first")
    await asyncio.to_thread(shutil.rmtree, repo_dir(model), True)
    _downloads.pop(model, None)


def snapshot() -> dict:
    installed = set(features.stable_audio_models())
    models = []
    for name, meta in MODELS.items():
        d = _downloads.get(name)
        running = d is not None and d.status == "running"
        models.append({
            "id": name,
            "bytes": meta["bytes"],
            "gated": meta["gated"],
            "base": name.endswith("-base"),
            "repo": f"stabilityai/stable-audio-3-{name}",
            "installed": name in installed and not running,
            "on_disk": _dir_size(repo_dir(name)),
            "download": None if d is None else {
                "status": d.status, "done": d.done, "total": d.total or meta["bytes"], "error": d.error, "code": d.code,
            },
        })
    return {"env": features.has_stable_audio_env(), "token": has_token(), "models": models}


async def start(model: str) -> Download:
    if model not in MODELS:
        raise ValueError(f"unknown model '{model}'")
    current = active()
    if current == model:
        return _downloads[model]
    if current is not None:
        raise RuntimeError(f"'{current}' is downloading; one at a time")
    if not features.has_stable_audio_env():
        raise FileNotFoundError("Stable Audio 3 is not installed")
    d = Download(model=model, total=MODELS[model]["bytes"])
    _downloads[model] = d
    bg.spawn(_run(d), name=f"sa3-download-{model}")
    return d


async def cancel(model: str) -> None:
    d = _downloads.get(model)
    if d is None or d.status != "running":
        return
    d.cancel_requested = True
    if d.proc is not None:
        await _kill_tree(d.proc)


def _remove_partials(model: str) -> None:
    """The temporary files of a killed download (blobs/*.incomplete): no later run can continue them."""
    blobs = features._hf_hub_dir() / f"models--stabilityai--stable-audio-3-{model}" / "blobs"
    for path in blobs.glob("*.incomplete"):
        try:
            path.unlink()
        except OSError:
            pass


async def _kill_tree(proc: asyncio.subprocess.Process) -> None:
    if IS_WINDOWS:
        killer = await aproc.create_subprocess_exec(
            "taskkill", "/PID", str(proc.pid), "/T", "/F",
            stdout=asyncio.subprocess.DEVNULL, stderr=asyncio.subprocess.DEVNULL,
        )
        await killer.wait()
    else:
        try:
            proc.kill()
        except ProcessLookupError:
            pass


async def _run(d: Download) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_path = LOG_DIR / "sa3_download.log"
    try:
        proc = await aproc.create_subprocess_exec(
            _python(), "-m", "sa3_server.download", d.model, "--json",
            cwd=str(STABLE_AUDIO_DIR), env=_env(),
            stdin=asyncio.subprocess.DEVNULL, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT,
        )
    except OSError as exc:
        d.status, d.code, d.error = "failed", "unknown", str(exc)
        return
    d.proc = proc
    assert proc.stdout is not None
    with open(log_path, "a", encoding="utf-8") as log:
        log.write(f"\n--- download {d.model}\n")
        async for raw in proc.stdout:
            line = raw.decode("utf-8", "replace").strip()
            if not line:
                continue
            log.write(line + "\n")
            log.flush()
            try:
                ev = json.loads(line)
            except ValueError:
                continue  # a library's own message; the log has it
            kind = ev.get("event")
            if kind in ("start", "progress"):
                d.total = int(ev.get("total") or d.total)
                d.done = int(ev.get("done") or d.done)
            elif kind == "error":
                d.code = ev.get("code") or "unknown"
                d.error = ev.get("message") or None
    code = await proc.wait()
    d.proc = None
    if d.cancel_requested:
        d.status = "cancelled"
        await asyncio.to_thread(_remove_partials, d.model)
    elif code == 0:
        d.status, d.done = "done", d.total
    else:
        d.status = "failed"
        d.code = d.code or "unknown"
        d.error = d.error or f"the downloader exited with code {code} (see {log_path})"


async def save_token(token: str) -> dict:
    """Checks a Hugging Face token and saves it where the downloader and the engine look for it."""
    if not features.has_stable_audio_env():
        raise FileNotFoundError("Stable Audio 3 is not installed")
    proc = await aproc.create_subprocess_exec(
        _python(), "-m", "sa3_server.download", "--login", "--json",
        cwd=str(STABLE_AUDIO_DIR), env=_env(),
        stdin=asyncio.subprocess.PIPE, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.DEVNULL,
        stream_stdout=False,
    )
    out, _ = await proc.communicate((token.strip() + "\n").encode("utf-8"))
    result: dict = {"ok": False, "user": None, "code": "unknown", "error": None}
    for raw in out.decode("utf-8", "replace").splitlines():
        try:
            ev = json.loads(raw)
        except ValueError:
            continue
        if ev.get("event") == "login":
            result = {"ok": True, "user": ev.get("user") or None, "code": None, "error": None}
        elif ev.get("event") == "error":
            result = {"ok": False, "user": None, "code": ev.get("code") or "unknown", "error": ev.get("message")}
    return result
