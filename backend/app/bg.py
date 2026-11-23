"""Fire-and-forget background tasks that are not lost.

The event loop keeps only a weak reference to a task: one started with a bare `asyncio.create_task(...)` and kept
nowhere can be garbage-collected while it runs (a Demucs run or a model download that silently stops). `spawn` keeps
each task in a module-level set until it ends.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Any, Coroutine, Optional

log = logging.getLogger(__name__)

_tasks: set[asyncio.Task] = set()


def _done(task: asyncio.Task) -> None:
    _tasks.discard(task)
    if not task.cancelled() and task.exception() is not None:
        log.error("background task %s failed", task.get_name(), exc_info=task.exception())


def spawn(coro: Coroutine[Any, Any, Any], *, name: Optional[str] = None) -> asyncio.Task:
    task = asyncio.create_task(coro, name=name)
    _tasks.add(task)
    task.add_done_callback(_done)
    return task


def running() -> set[asyncio.Task]:
    return set(_tasks)
