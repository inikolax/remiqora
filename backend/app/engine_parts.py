"""Downloadable parts of ACE-Step and YuE2 for the Models page (Stable Audio 3 has its own, app/sa3_weights.py).

Each part is fetched by the engine's own tool, the way the installers do it: ACE-Step's `acestep-download`
(Hugging Face, ModelScope as its fallback) and audio.cpp's `tools/model_manager_v2.py install <package>`.
Neither reports byte counts, so progress is the growth of the folder the part lands in against its known size.
One download at a time; stopping kills the tool, and the next run picks up what it left.

Optional parts can be deleted again (an ACE-Step checkpoint folder; a YuE2 precision through the model manager's
`uninstall`, which leaves the files other packages share), but not while their engine runs: it has the files open.
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import os
import re
import shutil
import struct
import sys
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Literal, Optional

from . import engine_settings, features
from .config import ACE_STEP_DIR, LOG_DIR, MUSCRIPTOR_MODEL_PATH, SHEETSAGE_MODEL_PATH, UV_BIN, YUE2_DIR, YUE2_MODEL_PATH

IS_WINDOWS = sys.platform == "win32"

Status = Literal["running", "done", "failed", "cancelled"]


@dataclass(frozen=True)
class Part:
    id: str
    engine: str
    # what it is, for grouping on the page: the main bundle, a DiT, a language model, a YuE2 precision, shared weights
    kind: str
    bytes: int
    # where it lands: the download's progress is the growth of the first one; all of them count on disk
    folders: tuple[Path, ...]
    installed: Callable[[], bool]
    # called with overwrite=True for a re-download: files that are there are fetched again
    commands: Callable[..., list[tuple[list[str], Path]]]
    required: bool = False
    # (package id, folder with its .audiocpp-package-<id>.json) for the YuE2 parts: what "check" compares the files with
    packages: tuple[tuple[str, Path], ...] = ()
    # how it is removed: a folder to delete, or a YuE2 package to uninstall
    remove: Optional[Callable[[], list[str]]] = None


def _ace(model: Optional[str]) -> Callable[..., list[tuple[list[str], Path]]]:
    # --force only skips acestep-download's "the folder exists" check (a stopped download leaves the folder),
    # its Hugging Face download still keeps the files that are complete; --skip-main leaves the core bundle alone.
    args = [UV_BIN, "run", "acestep-download", *(["--model", model, "--force", "--skip-main"] if model else [])]
    return lambda overwrite=False: [(args, ACE_STEP_DIR)]


def _yue2(*packages: str) -> Callable[..., list[tuple[list[str], Path]]]:
    # The backend's own Python: the model manager needs only the standard library (the desktop app does the same).
    return lambda overwrite=False: [
        ([sys.executable, str(Path("tools") / "model_manager_v2.py"), "install", p, *(["--overwrite"] if overwrite else [])], YUE2_DIR)
        for p in packages]


def _ace_main_installed() -> bool:
    return all(engine_settings.ace_checkpoint_ready(n) for n in ("acestep-v15-turbo", "acestep-5Hz-lm-1.7B")) \
        and (ACE_STEP_DIR / "checkpoints" / "vae").is_dir()


def _yue2_common_installed() -> bool:
    return all(_is_file(p) for p in (YUE2_MODEL_PATH / "yue2-vae-f16.gguf", SHEETSAGE_MODEL_PATH, MUSCRIPTOR_MODEL_PATH))


def _is_file(path: Path) -> bool:
    try:
        return path.is_file()
    except OSError:
        return False


_CKPT = ACE_STEP_DIR / "checkpoints"
_ACE_SIZES = {
    "acestep-v15-sft": 4_790_000_000, "acestep-v15-base": 4_790_000_000,
    "acestep-v15-xl-turbo": 19_950_000_000, "acestep-v15-xl-sft": 19_950_000_000, "acestep-v15-xl-base": 19_950_000_000,
    "acestep-5Hz-lm-0.6B": 1_370_000_000, "acestep-5Hz-lm-4B": 8_430_000_000,
}

PARTS: dict[str, Part] = {}


def _add(p: Part) -> None:
    PARTS[p.id] = p


# ACE-Step: the main bundle (turbo DiT, the 1.7B language model, the VAE and the text encoder) and the extras.
_ACE_MAIN_FOLDERS = tuple(_CKPT / n for n in ("acestep-v15-turbo", "acestep-5Hz-lm-1.7B", "vae", "Qwen3-Embedding-0.6B"))
_add(Part("ace-main", "ace_step", "main", 9_400_000_000, _ACE_MAIN_FOLDERS, _ace_main_installed, _ace(None), required=True))
for _name, _size in _ACE_SIZES.items():
    _add(Part(_name, "ace_step", "lm" if "-lm-" in _name else "dit", _size, (_CKPT / _name,),
              (lambda n=_name: engine_settings.ace_checkpoint_ready(n)), _ace(_name), remove=(lambda n=_name: _rm_folder(_CKPT / n))))
# YuE2: the shared weights (VAE, SheetSage2, MuScriptor) and one main model per precision.
_add(Part("yue2-common", "yue2", "common", 3_390_000_000,
          (YUE2_MODEL_PATH / "yue2-vae-f16.gguf", SHEETSAGE_MODEL_PATH, MUSCRIPTOR_MODEL_PATH), _yue2_common_installed,
          _yue2("yue2_vae_f16", "sheetsage2_orig", "muscriptor_small_f32"), required=True,
          packages=(("yue2_vae_f16", YUE2_MODEL_PATH), ("sheetsage2_orig", SHEETSAGE_MODEL_PATH.parent),
                    ("muscriptor_small_f32", MUSCRIPTOR_MODEL_PATH.parent))))
for _p, _size in (("q8_0", 4_260_000_000), ("q4_0", 2_670_000_000), ("bf16", 7_260_000_000)):
    _add(Part(f"yue2-{_p}", "yue2", "precision", _size, (YUE2_MODEL_PATH / f"yue2-3b-{_p}.gguf",),
              (lambda p=_p: p in features.yue2_precisions()), _yue2(f"yue2_main_{_p}"),
              remove=(lambda p=_p: [f"yue2_main_{p}"]), packages=((f"yue2_main_{_p}", YUE2_MODEL_PATH),)))


def _rm_folder(path: Path) -> list[str]:
    shutil.rmtree(path, ignore_errors=False)
    return []


def _size(path: Path) -> int:
    """Bytes under a folder, or of one file; 0 where it is missing or unreadable."""
    try:
        if path.is_file():
            return path.stat().st_size
    except OSError:
        return 0
    return _dir_size(path)


def part_bytes(part: Part) -> int:
    return sum(_size(p) for p in part.folders)


def engine_bytes(engine: str) -> int:
    """What the engine's models take: ACE-Step's checkpoints folder, YuE2's models folder."""
    if engine == "ace_step":
        return _size(_CKPT)
    if engine == "yue2":
        return _size(YUE2_MODEL_PATH.parent)
    return 0


async def delete(part_id: str, engine_running: bool) -> None:
    part = PARTS.get(part_id)
    if part is None:
        raise KeyError(part_id)
    if part.required or part.remove is None:
        raise PermissionError("the engine needs this part")
    if engine_running:
        raise RuntimeError("stop the engine first: it holds the files open")
    if active() == part_id:
        raise RuntimeError("it is downloading; stop the download first")
    if part.engine == "ace_step":
        used = set(engine_settings.get("ace_step").values())
        if part_id in used:
            raise PermissionError("it is the model ACE-Step starts with; pick another in the settings first")
    if part.engine == "yue2" and features.yue2_precisions() == [part_id.removeprefix("yue2-")]:
        raise PermissionError("it is the only YuE2 precision; YuE2 needs one")
    packages = await asyncio.to_thread(part.remove)
    for pkg in packages:
        proc = await asyncio.create_subprocess_exec(
            sys.executable, str(Path("tools") / "model_manager_v2.py"), "uninstall", pkg,
            cwd=str(YUE2_DIR), stdin=asyncio.subprocess.DEVNULL, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.STDOUT)
        out, _ = await proc.communicate()
        if proc.returncode != 0:
            raise RuntimeError(out.decode("utf-8", "replace").strip().splitlines()[-1] if out else f"uninstall exited with {proc.returncode}")
    _downloads.pop(part_id, None)


_SHA256 = re.compile(r"^[0-9a-f]{64}$")


def _sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(8 * 1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def _safetensors_problem(path: Path) -> Optional[str]:
    """None when the file's own header agrees with its size (a cut-off download does not), else why not."""
    size = path.stat().st_size
    with open(path, "rb") as f:
        head = f.read(8)
        if len(head) < 8:
            return "the file is shorter than a safetensors header"
        (n,) = struct.unpack("<Q", head)
        if n <= 0 or n > min(size - 8, 100 * 1024 * 1024):
            return "the safetensors header is damaged"
        try:
            meta = json.loads(f.read(n))
        except (ValueError, UnicodeDecodeError):
            return "the safetensors header is damaged"
    end = max((v["data_offsets"][1] for k, v in meta.items() if k != "__metadata__" and isinstance(v, dict)), default=0)
    if 8 + n + end != size:
        return f"the file is {size} bytes, its header expects {8 + n + end}"
    return None


def _remote_files(repo: str, revision: str = "main") -> Optional[dict[str, dict]]:
    """Hugging Face's own list of a repository's files with their SHA-256 (`lfs.oid`) and sizes; None offline."""
    url = f"https://huggingface.co/api/models/{repo}/tree/{revision}?recursive=1"
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "remiqora"}), timeout=15) as r:
            return {e["path"]: e for e in json.load(r) if e.get("type") == "file"}
    except Exception:  # noqa: BLE001 - no network, a rate limit, a changed API: the check then goes by size alone
        return None


def _check_manifest(manifest: Path, folder: Path, problems: list[dict], tally: dict) -> bool:
    """Compares the files a model-manager package recorded with what is on disk: the size, and the SHA-256 against
    Hugging Face's list for the large files. (The manager's own `etag` is not a SHA-256, so it is not used.)
    A file the repository has since replaced is reported as outdated, not damaged. False: no record."""
    try:
        record = json.loads(manifest.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return False
    remote = _remote_files(record["repo"]) if record.get("repo") else None
    tally["online"] = tally.get("online", False) or remote is not None
    for rel, info in (record.get("files") or {}).items():
        path = folder / rel
        if not path.is_file() and (folder.parent / rel).is_file():
            path = folder.parent / rel  # a package of a shared repository records its path from the models root
        tally["files"] += 1
        if not path.is_file():
            problems.append({"file": rel, "reason": "missing"})
            continue
        size = path.stat().st_size
        if info.get("size") is not None and size != info["size"]:
            problems.append({"file": rel, "reason": f"{size} bytes instead of {info['size']}"})
            continue
        tally["bytes"] += size
        lfs = ((remote or {}).get(rel) or {}).get("lfs")
        if not lfs:
            continue
        if lfs.get("size") != size:
            tally["outdated"].append(rel)  # the repository holds another version of it now; ours is whole by the record
            continue
        tally["hashed"] += 1
        if _sha256_file(path) != lfs["oid"]:
            problems.append({"file": rel, "reason": "the SHA-256 differs from Hugging Face's"})
    return True


def verify(part_id: str) -> dict:
    """Checks a part's files on disk (blocking: the route runs it in a thread). YuE2 parts: size and SHA-256 against
    what the model manager recorded and Hugging Face lists. ACE-Step checkpoints: Hugging Face's downloader keeps no checksums, so the
    safetensors files are checked against their own headers, which catches a download that stopped half-way."""
    part = PARTS.get(part_id)
    if part is None:
        raise KeyError(part_id)
    problems: list[dict] = []
    tally: dict = {"files": 0, "bytes": 0, "hashed": 0, "outdated": [], "online": False}
    if part.packages:
        for pkg, folder in part.packages:
            if not _check_manifest(folder / f".audiocpp-package-{pkg}.json", folder, problems, tally):
                for p in part.folders:  # installed by an older version: no record, so only that the files are there
                    tally["files"] += 1
                    if _is_file(p) and p.stat().st_size > 0:
                        tally["bytes"] += p.stat().st_size
                    else:
                        problems.append({"file": p.name, "reason": "missing or empty"})
                break
    else:
        for folder in part.folders:
            if not folder.is_dir():
                problems.append({"file": folder.name, "reason": "missing"})
                continue
            for root, _dirs, files in os.walk(folder):
                for name in files:
                    path = Path(root) / name
                    rel = str(path.relative_to(folder.parent)).replace("\\", "/")
                    if name.endswith((".incomplete", ".part", ".tmp")):
                        problems.append({"file": rel, "reason": "an unfinished download"})
                    elif name.endswith(".safetensors"):
                        tally["files"] += 1
                        try:
                            why = _safetensors_problem(path)
                        except OSError as exc:
                            why = f"cannot be read: {exc.strerror or exc}"
                        if why:
                            problems.append({"file": rel, "reason": why})
                        else:
                            tally["bytes"] += path.stat().st_size
    return {"part": part_id, "ok": not problems and tally["files"] > 0, "problems": problems,
            "files": tally["files"], "bytes": tally["bytes"], "hashed": tally["hashed"], "outdated": tally["outdated"],
            "method": "sha256" if tally["hashed"] else "structure", "offline": bool(part.packages) and not tally["online"]}


async def reinstall(part_id: str, engine_running: bool) -> None:
    """Downloads a part again over what is there, required parts included: the files are replaced, not kept."""
    part = PARTS.get(part_id)
    if part is None:
        raise KeyError(part_id)
    if engine_running:
        raise RuntimeError("stop the engine first: it holds the files open")
    if active() is not None:
        raise RuntimeError(f"'{active()}' is downloading; one at a time")
    if not engine_ready(part.engine):
        raise FileNotFoundError(f"{part.engine} is not installed")
    if part.engine == "ace_step":
        # acestep-download keeps the files it finds complete, so a damaged one would stay: the folders go first
        for folder in part.folders:
            if folder.is_dir():
                await asyncio.to_thread(shutil.rmtree, folder, False)
    await start(part_id, overwrite=True)


def engine_ready(engine: str) -> bool:
    """The engine's own environment is there, so its tool can run."""
    if engine == "ace_step":
        return features.has_ace_step()
    if engine == "yue2":
        return (YUE2_DIR / "tools" / "model_manager_v2.py").is_file()
    return False


@dataclass
class Download:
    part: str
    status: Status = "running"
    done: int = 0
    total: int = 0
    error: Optional[str] = None
    proc: Optional[asyncio.subprocess.Process] = field(default=None, repr=False)
    cancel_requested: bool = False


_downloads: dict[str, Download] = {}


def active() -> Optional[str]:
    return next((d.part for d in _downloads.values() if d.status == "running"), None)


def _dir_size(path: Path) -> int:
    total = 0
    for root, _dirs, files in os.walk(path):
        for name in files:
            try:
                total += os.lstat(os.path.join(root, name)).st_size
            except OSError:
                pass
    return total


def snapshot(engine: str) -> list[dict]:
    out = []
    for p in PARTS.values():
        if p.engine != engine:
            continue
        d = _downloads.get(p.id)
        running = d is not None and d.status == "running"
        out.append({
            "id": p.id, "kind": p.kind, "bytes": p.bytes, "required": p.required, "deletable": p.remove is not None, "verifiable": True,
            "installed": not running and p.installed(),
            "on_disk": part_bytes(p),
            "download": None if d is None else {"status": d.status, "done": d.done, "total": d.total, "error": d.error},
        })
    return out


async def start(part_id: str, overwrite: bool = False) -> None:
    part = PARTS.get(part_id)
    if part is None:
        raise KeyError(part_id)
    current = active()
    if current == part_id:
        return
    if current is not None:
        raise RuntimeError(f"'{current}' is downloading; one at a time")
    if not engine_ready(part.engine):
        raise FileNotFoundError(f"{part.engine} is not installed")
    d = Download(part=part_id, total=part.bytes)
    _downloads[part_id] = d
    asyncio.create_task(_run(part, d, overwrite))


async def cancel(part_id: str) -> None:
    d = _downloads.get(part_id)
    if d is None or d.status != "running":
        return
    d.cancel_requested = True
    if d.proc is not None:
        await _kill_tree(d.proc)


async def _kill_tree(proc: asyncio.subprocess.Process) -> None:
    if IS_WINDOWS:
        killer = await asyncio.create_subprocess_exec("taskkill", "/PID", str(proc.pid), "/T", "/F",
                                                      stdout=asyncio.subprocess.DEVNULL, stderr=asyncio.subprocess.DEVNULL)
        await killer.wait()
    else:
        try:
            proc.kill()
        except ProcessLookupError:
            pass


async def _run(part: Part, d: Download, overwrite: bool = False) -> None:
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    log_path = LOG_DIR / "engine_downloads.log"
    # Not created here: acestep-download takes an existing folder for a finished download and skips it.
    watched = part.folders[0]
    baseline = await asyncio.to_thread(_size, watched)
    stop = asyncio.Event()

    async def watch() -> None:
        while not stop.is_set():
            grown = max(0, await asyncio.to_thread(_size, watched) - baseline)
            d.done = min(grown, int(d.total * 0.99))
            try:
                await asyncio.wait_for(stop.wait(), timeout=1.5)
            except asyncio.TimeoutError:
                pass

    watcher = asyncio.create_task(watch())
    env = {**os.environ, "PYTHONUTF8": "1", "PYTHONIOENCODING": "utf-8", "HF_HUB_DISABLE_SYMLINKS_WARNING": "1"}
    code = 0
    try:
        with open(log_path, "a", encoding="utf-8") as log:
            for cmd, cwd in part.commands(overwrite):
                if d.cancel_requested:
                    break
                log.write(f"\n--- {part.id}: {' '.join(cmd)}\n")
                log.flush()
                try:
                    proc = await asyncio.create_subprocess_exec(*cmd, cwd=str(cwd), env=env, stdin=asyncio.subprocess.DEVNULL,
                                                                stdout=log, stderr=asyncio.subprocess.STDOUT)
                except OSError as exc:
                    d.error, code = str(exc), -1
                    break
                d.proc = proc
                code = await proc.wait()
                d.proc = None
                if code != 0:
                    break
    finally:
        stop.set()
        await watcher
    if d.cancel_requested:
        d.status = "cancelled"
    elif code == 0 and part.installed():
        d.status, d.done = "done", d.total
    else:
        d.status = "failed"
        d.error = d.error or f"the download exited with code {code}; see {log_path}"
