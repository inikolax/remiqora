"""Launch, health-check and tear down a single OS process.

Windows has no SIGTERM, so "graceful" stop means sending CTRL_BREAK_EVENT to
the process group (requires the child to have been started with
CREATE_NEW_PROCESS_GROUP) and waiting; if it doesn't exit in time we fall
back to `taskkill /T /F`, which also reaps children `uv run` / `cmd` spawn
that CTRL_BREAK alone would miss. The top process can also exit on CTRL_BREAK
while a child keeps running (uv exits at once; acestep-api's Python shuts
uvicorn down but can hang with the GPU still allocated), so the whole tree is
snapshotted before the stop and any survivor is killed afterwards.
"""
from __future__ import annotations

import asyncio
import logging
import os
import signal
import subprocess
import sys
from typing import Optional

import httpx

from ..config import LOG_DIR, LOG_TAIL_LINES, ProcessSpec

IS_WINDOWS = sys.platform == "win32"

logger = logging.getLogger("orchestrator")


class StartCancelled(Exception):
    """A model start was abandoned because Stop or shutdown was requested."""


class StopFailed(RuntimeError):
    """Processes of a model survived every attempt to end them (they may still hold the GPU and the port)."""


def _build_env(spec: ProcessSpec) -> dict[str, str]:
    env = os.environ.copy()
    env.update(spec.env)
    if spec.extra_path_dirs:
        prefix = os.pathsep.join(str(p) for p in spec.extra_path_dirs)
        env["PATH"] = f"{prefix}{os.pathsep}{env.get('PATH', '')}"
    return env


def tail_log(name: str, lines: int = LOG_TAIL_LINES) -> str:
    path = LOG_DIR / f"{name}.log"
    if not path.exists():
        return ""
    try:
        content = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return ""
    return "\n".join(content.splitlines()[-lines:])


def _windows_descendants(pid: int) -> list[int]:
    """PIDs of every live process below `pid`, from one ToolHelp32 snapshot of the parent links."""
    import ctypes
    from ctypes import wintypes

    class PROCESSENTRY32W(ctypes.Structure):
        _fields_ = [
            ("dwSize", wintypes.DWORD), ("cntUsage", wintypes.DWORD), ("th32ProcessID", wintypes.DWORD),
            ("th32DefaultHeapID", ctypes.c_size_t), ("th32ModuleID", wintypes.DWORD), ("cntThreads", wintypes.DWORD),
            ("th32ParentProcessID", wintypes.DWORD), ("pcPriClassBase", ctypes.c_long), ("dwFlags", wintypes.DWORD),
            ("szExeFile", ctypes.c_wchar * 260),
        ]

    k32 = ctypes.windll.kernel32
    k32.CreateToolhelp32Snapshot.restype = wintypes.HANDLE
    snap = k32.CreateToolhelp32Snapshot(0x00000002, 0)  # TH32CS_SNAPPROCESS
    if not snap or snap == wintypes.HANDLE(-1).value:
        return []
    children: dict[int, list[int]] = {}
    try:
        entry = PROCESSENTRY32W()
        entry.dwSize = ctypes.sizeof(PROCESSENTRY32W)
        ok = k32.Process32FirstW(snap, ctypes.byref(entry))
        while ok:
            children.setdefault(entry.th32ParentProcessID, []).append(entry.th32ProcessID)
            ok = k32.Process32NextW(snap, ctypes.byref(entry))
    finally:
        k32.CloseHandle(snap)
    found, todo = [], [pid]
    while todo:
        for child in children.get(todo.pop(), []):
            if child not in found and child != pid:
                found.append(child)
                todo.append(child)
    return found


def _windows_started(pid: int) -> int | None:
    """Creation time of a running process (a FILETIME as one integer), or None when it is not running.

    A PID alone does not name a process: Windows hands a freed PID to the next program. The PID
    together with its creation time does, so the tree is remembered and checked as such pairs."""
    import ctypes
    from ctypes import wintypes
    k32 = ctypes.windll.kernel32
    handle = k32.OpenProcess(0x1000, False, pid)  # PROCESS_QUERY_LIMITED_INFORMATION
    if not handle:
        return None
    try:
        code = ctypes.c_ulong()
        if not k32.GetExitCodeProcess(handle, ctypes.byref(code)) or code.value != 259:  # STILL_ACTIVE
            return None
        created, exited, kernel, user = (wintypes.FILETIME() for _ in range(4))
        if not k32.GetProcessTimes(handle, ctypes.byref(created), ctypes.byref(exited), ctypes.byref(kernel), ctypes.byref(user)):
            return None
        return (created.dwHighDateTime << 32) | created.dwLowDateTime
    finally:
        k32.CloseHandle(handle)


def _windows_alive(pid: int, started: int) -> bool:
    """True while the process that had this PID at `started` still runs (not a later owner of the PID)."""
    return _windows_started(pid) == started


def _windows_terminate(pid: int) -> bool:
    """TerminateProcess on one PID: the last resort when taskkill did not end it."""
    import ctypes
    k32 = ctypes.windll.kernel32
    handle = k32.OpenProcess(0x0001, False, pid)  # PROCESS_TERMINATE
    if not handle:
        return False
    try:
        return bool(k32.TerminateProcess(handle, 1))
    finally:
        k32.CloseHandle(handle)


class _WindowsJob:
    """A job object holding a process and everything it starts, whoever their parents are.

    The parent links the tree snapshot follows break as soon as a process in the middle exits
    (uv -> launcher -> Python: with the first two gone the Python is found by nobody); a job keeps
    counting and can end every process in it at once."""

    def __init__(self, process_handle: int):
        import ctypes
        from ctypes import wintypes
        self._k32 = ctypes.windll.kernel32
        self._k32.CreateJobObjectW.restype = wintypes.HANDLE
        self._k32.CreateJobObjectW.argtypes = [ctypes.c_void_p, wintypes.LPCWSTR]
        self._k32.AssignProcessToJobObject.argtypes = [wintypes.HANDLE, wintypes.HANDLE]
        self._k32.TerminateJobObject.argtypes = [wintypes.HANDLE, wintypes.UINT]
        self._k32.QueryInformationJobObject.argtypes = [wintypes.HANDLE, ctypes.c_int, ctypes.c_void_p, wintypes.DWORD, ctypes.c_void_p]
        self._k32.CloseHandle.argtypes = [wintypes.HANDLE]
        self._handle = self._k32.CreateJobObjectW(None, None)
        if self._handle and not self._k32.AssignProcessToJobObject(self._handle, wintypes.HANDLE(process_handle)):
            self.close()

    @property
    def ok(self) -> bool:
        return bool(self._handle)

    def active(self) -> int:
        """Number of processes of the job still running (0 when the job could not be set up)."""
        import ctypes
        from ctypes import wintypes

        class Accounting(ctypes.Structure):  # JOBOBJECT_BASIC_ACCOUNTING_INFORMATION
            _fields_ = [("times", ctypes.c_int64 * 4), ("faults", wintypes.DWORD), ("total", wintypes.DWORD),
                        ("active", wintypes.DWORD), ("terminated", wintypes.DWORD)]

        if not self._handle:
            return 0
        info = Accounting()
        if not self._k32.QueryInformationJobObject(self._handle, 1, ctypes.byref(info), ctypes.sizeof(info), None):
            return 0
        return int(info.active)

    def terminate(self) -> None:
        if self._handle:
            self._k32.TerminateJobObject(self._handle, 1)

    def close(self) -> None:
        if self._handle:
            self._k32.CloseHandle(self._handle)
            self._handle = None


class ManagedProcess:
    def __init__(self, spec: ProcessSpec):
        self.spec = spec
        self._proc: Optional[subprocess.Popen] = None
        self._log_file = None
        self._job: Optional[_WindowsJob] = None

    @property
    def is_running(self) -> bool:
        return self._proc is not None and self._proc.poll() is None

    @property
    def pid(self) -> Optional[int]:
        return self._proc.pid if self.is_running else None

    def exit_summary(self) -> str:
        code = self._proc.returncode if self._proc else None
        return f"process '{self.spec.name}' exited (code {code}).\n{tail_log(self.spec.name)}"

    def start(self) -> None:
        LOG_DIR.mkdir(parents=True, exist_ok=True)
        log_path = LOG_DIR / f"{self.spec.name}.log"
        self._log_file = open(log_path, "w", encoding="utf-8", errors="replace")
        creationflags = subprocess.CREATE_NEW_PROCESS_GROUP if IS_WINDOWS else 0
        self._proc = subprocess.Popen(
            self.spec.cmd,
            cwd=str(self.spec.cwd),
            env=_build_env(self.spec),
            stdout=self._log_file,
            stderr=subprocess.STDOUT,
            creationflags=creationflags,
        )
        if IS_WINDOWS:
            try:
                self._job = _WindowsJob(int(self._proc._handle))
            except Exception:  # noqa: BLE001 - without a job the tree snapshot at stop still applies
                logger.exception("process '%s': no job object", self.spec.name)
                self._job = None

    async def wait_healthy(self, cancel: Optional[asyncio.Event] = None) -> None:
        loop = asyncio.get_event_loop()
        deadline = loop.time() + self.spec.startup_timeout
        async with httpx.AsyncClient(timeout=3.0) as client:
            while True:
                if cancel is not None and cancel.is_set():
                    raise StartCancelled(f"start of '{self.spec.name}' was cancelled")
                if not self.is_running:
                    code = self._proc.returncode if self._proc else None
                    raise RuntimeError(
                        f"process '{self.spec.name}' exited during startup (code {code}).\n"
                        f"{tail_log(self.spec.name)}"
                    )
                if self.spec.health_url:
                    try:
                        resp = await client.get(self.spec.health_url)
                        if resp.status_code < 500:
                            return
                    except httpx.HTTPError:
                        pass
                else:
                    return
                if loop.time() > deadline:
                    raise TimeoutError(
                        f"process '{self.spec.name}' did not become healthy within "
                        f"{self.spec.startup_timeout:.0f}s.\n{tail_log(self.spec.name)}"
                    )
                if cancel is None:
                    await asyncio.sleep(1.0)
                else:
                    try:
                        await asyncio.wait_for(cancel.wait(), 1.0)
                    except asyncio.TimeoutError:
                        pass

    async def wait_stopped(self, timeout: float) -> bool:
        loop = asyncio.get_event_loop()
        deadline = loop.time() + timeout
        while self.is_running:
            if loop.time() > deadline:
                return False
            await asyncio.sleep(0.5)
        return True

    async def stop(self, *, check: bool = False) -> None:
        """Stops the process and everything it started.

        With `check`, a process that survives every attempt raises StopFailed; without it (cleanup
        after a failed or cancelled start, helper servers) the survivor is only logged."""
        if self._proc is None:
            self._close_log()
            return
        # The top process may be gone already while a child still runs (uv exits, the Python it
        # started keeps the GPU): its PID stays ours while the Popen handle is open, so the
        # children are still found by it.
        pid = self._proc.pid
        tree: dict[int, int] = {}
        if IS_WINDOWS:
            for child in _windows_descendants(pid):
                started = _windows_started(child)
                if started is not None:
                    tree[child] = started
        if self.is_running:
            if IS_WINDOWS:
                try:
                    self._proc.send_signal(signal.CTRL_BREAK_EVENT)
                except (OSError, ValueError):
                    pass
            else:
                self._proc.terminate()
            stopped = await self.wait_stopped(self.spec.shutdown_timeout)
            if not stopped:
                await self._force_kill(pid)
                await self.wait_stopped(10.0)
        if tree:
            await self._reap(tree)
        await self._end_job()
        self._close_log()
        if IS_WINDOWS:
            await self._verify_gone(tree, check)
        if self._job is not None:
            self._job.close()
            self._job = None

    async def _end_job(self) -> None:
        """Ends whatever of the job still runs: processes the snapshot could not reach, or taskkill could not end."""
        if self._job is None or not self._job.ok or self._job.active() == 0:
            return
        logger.warning("process '%s': %d process(es) left after the stop, ending the job", self.spec.name, self._job.active())
        self._job.terminate()
        loop = asyncio.get_event_loop()
        deadline = loop.time() + 5.0
        while loop.time() < deadline and self._job.active() > 0:
            await asyncio.sleep(0.2)

    async def _reap(self, tree: dict[int, int]) -> None:
        """Gives the children the same grace period, then kills whatever of the tree still runs."""
        loop = asyncio.get_event_loop()
        deadline = loop.time() + self.spec.shutdown_timeout
        while loop.time() < deadline and any(_windows_alive(p, at) for p, at in tree.items()):
            await asyncio.sleep(0.5)
        for p, at in tree.items():
            if _windows_alive(p, at):
                await self._force_kill(p)

    async def _verify_gone(self, tree: dict[int, int], check: bool) -> None:
        """A stop that leaves a process behind must not pass for a stop: the survivor keeps the GPU
        memory and the port, and the next start of the model fails on it. Whatever taskkill left is
        ended with TerminateProcess; what survives even that is logged, or raised as StopFailed."""
        def survivors() -> list:
            left = [p for p, at in tree.items() if _windows_alive(p, at)]
            if self.is_running:
                left.insert(0, self._proc.pid)
            # processes of the job the snapshot does not know: counted, their PIDs are not at hand
            unknown = (self._job.active() if self._job is not None else 0) - len(left)
            return left + ["?"] * max(0, unknown)

        left = survivors()
        if not left:
            return
        logger.warning("process '%s': still alive after taskkill: %s", self.spec.name, left)
        for p in left:
            if isinstance(p, int):
                _windows_terminate(p)
        await asyncio.sleep(1.0)
        left = survivors()
        if not left:
            return
        message = f"process '{self.spec.name}' could not be stopped, still running: PID {', '.join(map(str, left))}"
        if check:
            raise StopFailed(message)
        logger.error(message)

    async def _force_kill(self, pid: int) -> None:
        if IS_WINDOWS:
            # In a thread, not asyncio's subprocess: that one is not implemented on the selector
            # event loop (uvicorn --reload on Windows), where it raised and nothing was killed.
            def run() -> subprocess.CompletedProcess:
                return subprocess.run(["taskkill", "/PID", str(pid), "/T", "/F"], capture_output=True, text=True, errors="replace")

            try:
                done = await asyncio.to_thread(run)
            except OSError as exc:
                logger.warning("taskkill for PID %s could not be run: %s", pid, exc)
                return
            if done.returncode != 0:
                logger.warning("taskkill /PID %s exited with %s: %s", pid, done.returncode, (done.stderr or done.stdout).strip())
        else:
            try:
                self._proc.kill()
            except OSError:
                pass

    def _close_log(self) -> None:
        if self._log_file:
            try:
                self._log_file.close()
            except OSError:
                pass
            self._log_file = None
