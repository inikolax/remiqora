"""Starting a child process from async code on any event loop.

`asyncio.create_subprocess_exec` needs an event loop that implements subprocesses. On Windows uvicorn runs the
selector loop whenever it serves from a child process, that is with `--reload` (dev.bat), and that loop raises
NotImplementedError, an exception with an empty message: MIDI recognition, model downloads and the rest failed with
no error text in development, while working under prod_run.bat. The proactor loop cannot replace it: uvicorn's
reload hangs on it, the old server never stops.

`create_subprocess_exec` here takes the same arguments and returns an object with the parts of
`asyncio.subprocess.Process` the backend uses (pid, returncode, wait, communicate, kill, an async-iterable stdout).
Where the loop can, it is asyncio's own process; elsewhere a `subprocess.Popen` whose blocking calls run in threads.
"""
from __future__ import annotations

import asyncio
import subprocess
import sys
import threading
from typing import Any, AsyncIterator, Optional

PIPE = subprocess.PIPE
STDOUT = subprocess.STDOUT
DEVNULL = subprocess.DEVNULL


def _loop_has_subprocesses() -> bool:
    if sys.platform != "win32":
        return True
    return isinstance(asyncio.get_running_loop(), asyncio.ProactorEventLoop)


class _LineReader:
    """A pipe read by a thread, served as `async for line in reader` (bytes with their newline, like asyncio's)."""

    def __init__(self, pipe: Any, loop: asyncio.AbstractEventLoop) -> None:
        self._queue: asyncio.Queue[Optional[bytes]] = asyncio.Queue()
        self._pipe = pipe

        def pump() -> None:
            try:
                for line in iter(pipe.readline, b""):
                    loop.call_soon_threadsafe(self._queue.put_nowait, line)
            finally:
                loop.call_soon_threadsafe(self._queue.put_nowait, None)

        threading.Thread(target=pump, daemon=True).start()

    def __aiter__(self) -> AsyncIterator[bytes]:
        return self

    async def __anext__(self) -> bytes:
        line = await self._queue.get()
        if line is None:
            raise StopAsyncIteration
        return line


class ThreadedProcess:
    """`subprocess.Popen` behind the async interface of `asyncio.subprocess.Process`."""

    def __init__(self, popen: subprocess.Popen, loop: asyncio.AbstractEventLoop, stream_stdout: bool) -> None:
        self._popen = popen
        self.pid = popen.pid
        self.stdin = popen.stdin
        # a piped stdout is iterated line by line, unless communicate() reads it whole
        self.stdout: Optional[_LineReader] = _LineReader(popen.stdout, loop) if stream_stdout else None

    @property
    def returncode(self) -> Optional[int]:
        return self._popen.returncode

    async def wait(self) -> int:
        return await asyncio.to_thread(self._popen.wait)

    async def communicate(self, input: Optional[bytes] = None) -> tuple[Optional[bytes], Optional[bytes]]:
        return await asyncio.to_thread(self._popen.communicate, input)

    def kill(self) -> None:
        self._popen.kill()

    def terminate(self) -> None:
        self._popen.terminate()


async def create_subprocess_exec(*cmd: Any, stream_stdout: bool = True, **kwargs: Any) -> Any:
    """Like `asyncio.create_subprocess_exec`. `stream_stdout=False` when the caller reads a piped stdout with
    `communicate()` instead of iterating it (the threaded fallback must not start a line reader on it then)."""
    if _loop_has_subprocesses():
        return await asyncio.create_subprocess_exec(*cmd, **kwargs)
    loop = asyncio.get_running_loop()
    if sys.platform == "win32":
        kwargs.setdefault("creationflags", subprocess.CREATE_NO_WINDOW)
    popen = await asyncio.to_thread(subprocess.Popen, [str(c) for c in cmd], **kwargs)
    piped = kwargs.get("stdout") == PIPE
    return ThreadedProcess(popen, loop, stream_stdout=piped and stream_stdout)
