"""How much memory the machine uses right now, for the header's meters: system RAM, the video card's memory, and
who holds them (ACE-Step, YuE2, Demucs, this backend, everything else). Same approach as Remiqora Video's
app/sysinfo.py, without extra packages:

- RAM: GlobalMemoryStatusEx on Windows, /proc/meminfo on Linux, sysctl + vm_stat on macOS.
- The card: nvidia-smi (a driver tool; without it, e.g. on a Mac, the card is just not shown).
- Video memory per process: on Windows the "GPU Process Memory" performance counter (what Task Manager shows;
  nvidia-smi says N/A under WDDM), on Linux nvidia-smi's compute-apps list.

A model is a process tree (`uv run` -> launcher -> Python, which is what holds the GPU), so every holder is summed
over the tree below its root PIDs. Everything is in bytes.
"""
from __future__ import annotations

import ctypes
import os
import subprocess
import sys
import time
from typing import Optional

IS_WINDOWS = sys.platform == "win32"
IS_MACOS = sys.platform == "darwin"
MIB = 1024 * 1024
_NO_WINDOW = getattr(subprocess, "CREATE_NO_WINDOW", 0)
_GPU_QUERY = "name,memory.used,memory.total,utilization.gpu,temperature.gpu"
GPU_TTL_S = 1.5  # the header polls every few seconds; nvidia-smi takes ~0.1 s
VPROC_TTL_S = 4.0  # reading the Windows counters takes ~1.5 s
_gpu_cache: tuple[float, Optional[dict]] = (0.0, None)
_vproc_cache: tuple[float, dict[int, int]] = (0.0, {})


class _MemoryStatus(ctypes.Structure):
    _fields_ = [("dwLength", ctypes.c_ulong), ("dwMemoryLoad", ctypes.c_ulong),
                ("ullTotalPhys", ctypes.c_ulonglong), ("ullAvailPhys", ctypes.c_ulonglong),
                ("ullTotalPageFile", ctypes.c_ulonglong), ("ullAvailPageFile", ctypes.c_ulonglong),
                ("ullTotalVirtual", ctypes.c_ulonglong), ("ullAvailVirtual", ctypes.c_ulonglong),
                ("ullAvailExtendedVirtual", ctypes.c_ulonglong)]


class _ProcessMemory(ctypes.Structure):
    _fields_ = [("cb", ctypes.c_ulong), ("PageFaultCount", ctypes.c_ulong),
                ("PeakWorkingSetSize", ctypes.c_size_t), ("WorkingSetSize", ctypes.c_size_t),
                ("QuotaPeakPagedPoolUsage", ctypes.c_size_t), ("QuotaPagedPoolUsage", ctypes.c_size_t),
                ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t), ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                ("PagefileUsage", ctypes.c_size_t), ("PeakPagefileUsage", ctypes.c_size_t)]


def _run(cmd: list[str], timeout: float = 3) -> Optional[str]:
    try:
        out = subprocess.run(cmd, capture_output=True, timeout=timeout, creationflags=_NO_WINDOW)
    except (OSError, subprocess.SubprocessError):
        return None
    return out.stdout.decode("utf-8", errors="ignore") if out.returncode == 0 else None


def ram() -> Optional[dict]:
    """{used, total} of the system RAM."""
    if IS_WINDOWS:
        st = _MemoryStatus()
        st.dwLength = ctypes.sizeof(st)
        if not ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(st)):
            return None
        return {"used": int(st.ullTotalPhys - st.ullAvailPhys), "total": int(st.ullTotalPhys)}
    if IS_MACOS:
        total, vm = _run(["sysctl", "-n", "hw.memsize"]), _run(["vm_stat"])
        if not total or not vm:
            return None
        return parse_vm_stat(vm, int(total.strip()))
    try:
        info = {k: int(v.split()[0]) * 1024 for k, v in (line.split(":", 1) for line in open("/proc/meminfo"))}
        return {"used": info["MemTotal"] - info["MemAvailable"], "total": info["MemTotal"]}
    except (OSError, KeyError, ValueError):
        return None


def parse_vm_stat(text: str, total: int) -> Optional[dict]:
    """`vm_stat` output -> {used, total}; available = free + inactive + speculative pages (what Activity Monitor
    does not count as used)."""
    page = 4096
    pages: dict[str, int] = {}
    for line in text.splitlines():
        if "page size of" in line:
            try:
                page = int(line.split("page size of")[1].split()[0])
            except (IndexError, ValueError):
                pass
        elif ":" in line:
            key, value = line.split(":", 1)
            try:
                pages[key.strip()] = int(value.strip().rstrip("."))
            except ValueError:
                pass
    free = sum(pages.get(k, 0) for k in ("Pages free", "Pages inactive", "Pages speculative")) * page
    if not total or not pages:
        return None
    return {"used": max(0, total - free), "total": total}


def process_ram(pid: int) -> Optional[int]:
    """The working set (what the process holds in RAM now) of one process; None if it can't be read."""
    if IS_WINDOWS:
        kernel32, psapi = ctypes.windll.kernel32, ctypes.windll.psapi
        kernel32.OpenProcess.restype = ctypes.c_void_p
        handle = kernel32.OpenProcess(0x1000 | 0x0010, False, int(pid))  # query limited information + read memory
        if not handle:
            return None
        try:
            pmc = _ProcessMemory()
            pmc.cb = ctypes.sizeof(pmc)
            psapi.GetProcessMemoryInfo.argtypes = [ctypes.c_void_p, ctypes.POINTER(_ProcessMemory), ctypes.c_ulong]
            if not psapi.GetProcessMemoryInfo(handle, ctypes.byref(pmc), pmc.cb):
                return None
            return int(pmc.WorkingSetSize)
        finally:
            kernel32.CloseHandle(ctypes.c_void_p(handle))
    if IS_MACOS:
        out = _run(["ps", "-o", "rss=", "-p", str(pid)])
        try:
            return int(out.strip()) * 1024 if out and out.strip() else None
        except ValueError:
            return None
    try:
        for line in open(f"/proc/{pid}/status"):
            if line.startswith("VmRSS:"):
                return int(line.split()[1]) * 1024
    except OSError:
        pass
    return None


def descendants(pid: int) -> list[int]:
    """Every live process below `pid`."""
    if IS_WINDOWS:
        from .orchestrator.process import _windows_descendants
        return _windows_descendants(pid)
    children: dict[int, list[int]] = {}
    if IS_MACOS:
        out = _run(["ps", "-A", "-o", "pid=,ppid="]) or ""
        pairs = [line.split() for line in out.splitlines() if len(line.split()) == 2]
    else:
        pairs = []
        for entry in os.listdir("/proc"):
            if entry.isdigit():
                try:
                    stat = open(f"/proc/{entry}/stat").read()
                    pairs.append([entry, stat.rsplit(")", 1)[1].split()[1]])
                except (OSError, IndexError):
                    pass
    for child, parent in pairs:
        try:
            children.setdefault(int(parent), []).append(int(child))
        except ValueError:
            pass
    found, todo = [], [pid]
    while todo:
        for child in children.get(todo.pop(), []):
            if child not in found and child != pid:
                found.append(child)
                todo.append(child)
    return found


def parse_gpu(line: str) -> Optional[dict]:
    """One line of `nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu,temperature.gpu
    --format=csv,noheader,nounits` -> {name, used, total, load, temp}. Fields the driver can't tell ([N/A]) are None."""
    parts = [p.strip() for p in line.strip().split(",")]
    if len(parts) < 3:
        return None

    def num(v: str) -> Optional[int]:
        try:
            return int(float(v))
        except ValueError:
            return None

    used, total = num(parts[1]), num(parts[2])
    if used is None or not total:
        return None
    return {"name": parts[0], "used": used * MIB, "total": total * MIB,
            "load": num(parts[3]) if len(parts) > 3 else None, "temp": num(parts[4]) if len(parts) > 4 else None}


def gpu() -> Optional[dict]:
    """The first video card: {name, used, total, load, temp}; None without nvidia-smi."""
    global _gpu_cache
    now = time.monotonic()
    if now - _gpu_cache[0] < GPU_TTL_S:
        return _gpu_cache[1]
    out = _run(["nvidia-smi", f"--query-gpu={_GPU_QUERY}", "--format=csv,noheader,nounits"])
    result = parse_gpu(out.splitlines()[0]) if out and out.strip() else None
    _gpu_cache = (now, result)
    return result


def parse_gpu_processes(text: str) -> dict[int, int]:
    """The two CSV lines of `typeperf "\\GPU Process Memory(*)\\Dedicated Usage" -sc 1` (the counter names, then the
    values) -> {pid: bytes}; a process has one counter per adapter, they are added."""
    lines = [line for line in text.splitlines() if line.startswith('"')]
    if len(lines) < 2:
        return {}
    names = [c.strip().strip('"') for c in lines[0].split('","')]
    values = [c.strip().strip('"') for c in lines[1].split('","')]
    out: dict[int, int] = {}
    for name, value in zip(names[1:], values[1:]):
        start = name.find("(pid_")
        if start < 0:
            continue
        try:
            pid = int(name[start + 5:].split("_", 1)[0])
            out[pid] = out.get(pid, 0) + int(float(value))
        except ValueError:
            continue
    return out


def gpu_processes() -> dict[int, int]:
    """Dedicated video memory of every process, bytes by pid; {} where it can't be read."""
    global _vproc_cache
    now = time.monotonic()
    if now - _vproc_cache[0] < VPROC_TTL_S:
        return _vproc_cache[1]
    result: dict[int, int] = {}
    if IS_WINDOWS:
        try:
            out = subprocess.run(["typeperf", r"\GPU Process Memory(*)\Dedicated Usage", "-sc", "1"],
                                 capture_output=True, timeout=8, creationflags=_NO_WINDOW)
            result = parse_gpu_processes(out.stdout.decode("latin-1", errors="ignore"))
        except (OSError, subprocess.SubprocessError):
            result = {}
    elif not IS_MACOS:
        out = _run(["nvidia-smi", "--query-compute-apps=pid,used_memory", "--format=csv,noheader,nounits"]) or ""
        for line in out.splitlines():
            try:
                pid, mib = (p.strip() for p in line.split(","))
                result[int(pid)] = result.get(int(pid), 0) + int(float(mib)) * MIB
            except ValueError:
                continue
    _vproc_cache = (now, result)
    return result


def snapshot(groups: dict[str, list[int]]) -> dict:
    """Everything the header's meters show: {ram, vram, vram_by: [{key, bytes}], ram_by: {key: bytes}}.
    `groups` maps a holder (ace_step, yue2, demucs) to the root PIDs of its processes; this backend is added as
    "backend", and video memory nobody of these holds is "other" (the browser, Windows, other programs)."""
    trees = {key: sorted({p for root in roots for p in [root, *descendants(root)]}) for key, roots in groups.items()}
    trees["backend"] = [os.getpid()]
    ram_by: dict[str, int] = {}
    for key, pids in trees.items():
        sizes = [s for s in (process_ram(p) for p in pids) if s is not None]
        if sizes:
            ram_by[key] = sum(sizes)
    card = gpu()
    vram_by: list[dict] = []
    per = gpu_processes() if card else {}
    if per:
        known = 0
        for key, pids in trees.items():
            held = sum(per.get(p, 0) for p in pids)
            if held:
                vram_by.append({"key": key, "bytes": held})
                known += held
        # "Other" is the rest of what nvidia-smi reports as used: the Windows per-process counters add up to more
        # than that (shared allocations), and the segments must not run past the meter's total.
        vram_by.append({"key": "other", "bytes": max(0, card["used"] - known)})
    return {"ram": ram(), "vram": card, "vram_by": vram_by, "ram_by": ram_by}
