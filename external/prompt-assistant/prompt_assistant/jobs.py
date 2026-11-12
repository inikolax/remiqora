"""Prompt-writing jobs with progress: one worker writes them in turn; the page polls a job for its stage, the tokens
written so far and the text as it grows, and can stop it.

The percent is an estimate: a reply's length is not known in advance, so the tokens written are measured against the
usual length of that task's reply (EXPECTED_TOKENS) and capped below 100 until the job is done.
"""
from __future__ import annotations

import json
import logging
import queue
import re
import threading
import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Literal, Optional

from . import tasks
from .engine import Model

log = logging.getLogger("assistant.jobs")

Status = Literal["queued", "loading", "running", "done", "failed", "cancelled"]
# loading: the model is being read into memory; classifying: Stable Audio's classifier picks the kind of prompt;
# writing: the reply itself; retrying: the reply was rejected (artifacts, bad JSON) and is written again.
Stage = Literal["queued", "loading", "classifying", "writing", "retrying", "done"]

# The usual length of a reply, in tokens (measured).
EXPECTED_TOKENS = {"sa3": 75, "yue2-song": 460, "ace-song": 430, "ace-instrumental": 55, "ace-part": 25}
KEEP_JOBS = 50
_JSON_VALUE = re.compile(r'"(\w+)"\s*:\s*"((?:[^"\\]|\\.)*)')


def readable(text: str) -> str:
    """What a person can follow while a reply grows: a JSON reply (YuE2, ACE-Step) shows its string values with real
    line breaks, the last one possibly cut mid-word; plain text (Stable Audio's tags) as it is."""
    if not text.lstrip().startswith("{"):
        return text
    values = []
    for _key, raw in _JSON_VALUE.findall(text):
        if raw.endswith("\\") and not raw.endswith("\\\\"):
            raw = raw[:-1]  # cut right after a backslash
        try:
            value = json.loads(f'"{raw}"')
        except ValueError:
            value = raw.replace("\\n", "\n")
        values.append(value.replace("\\n", "\n").strip())
    return "\n\n".join(v for v in values if v)


class JobCancelled(Exception):
    pass


@dataclass
class Job:
    task: str
    idea: str
    language: Optional[str] = None
    kind: Optional[str] = None
    seed: Optional[int] = None
    id: str = field(default_factory=lambda: uuid.uuid4().hex[:12])
    status: Status = "queued"
    stage: Stage = "queued"
    tokens: int = 0
    text: str = ""
    fields: Optional[dict[str, Any]] = None
    error: Optional[str] = None
    total_tokens: int = 0
    created: float = field(default_factory=time.time)
    finished: Optional[float] = None
    cancel_requested: bool = False

    @property
    def expected(self) -> int:
        return EXPECTED_TOKENS.get(self.task, 300)

    def to_dict(self) -> dict[str, Any]:
        if self.status == "done":
            percent = 100
        elif self.stage in ("writing", "retrying"):
            percent = min(99, round(self.tokens / max(1, self.expected) * 100))
        else:
            percent = 0
        return {
            "job_id": self.id, "task": self.task, "status": self.status, "stage": self.stage,
            "tokens": self.tokens, "expected": self.expected, "percent": percent,
            "text": self.text, "preview": readable(self.text), "fields": self.fields, "error": self.error,
            "took_ms": int(((self.finished or time.time()) - self.created) * 1000),
        }


class Jobs:
    def __init__(self, model: Model) -> None:
        self._model = model
        self._jobs: dict[str, Job] = {}
        self._queue: "queue.Queue[Job]" = queue.Queue()
        self._lock = threading.Lock()
        threading.Thread(target=self._work, name="assistant-jobs", daemon=True).start()

    def submit(self, job: Job) -> Job:
        with self._lock:
            self._jobs[job.id] = job
            for old in sorted(self._jobs.values(), key=lambda j: j.created)[:-KEEP_JOBS]:
                if old.status in ("done", "failed", "cancelled"):
                    self._jobs.pop(old.id, None)
        self._queue.put(job)
        return job

    def get(self, job_id: str) -> Optional[Job]:
        return self._jobs.get(job_id)

    def cancel(self, job_id: str) -> Optional[Job]:
        job = self._jobs.get(job_id)
        if job is not None and job.status in ("queued", "loading", "running"):
            job.cancel_requested = True
            if job.status == "queued":
                job.status, job.stage, job.finished = "cancelled", "done", time.time()
        return job

    def run_now(self, job: Job) -> Job:
        """Runs a job in the calling thread (the plain /v1/write)."""
        self._run(job)
        return job

    def _work(self) -> None:
        while True:
            job = self._queue.get()
            if job.status != "queued":
                continue  # cancelled while it waited
            try:
                self._run(job)
            except Exception:  # noqa: BLE001 - one job's failure must not stop the worker
                log.exception("job %s failed", job.id)

    def _run(self, job: Job) -> None:
        try:
            if not self._model.loaded:
                job.status, job.stage = "loading", "loading"
                self._model.load()
            if job.cancel_requested:
                raise JobCancelled()
            job.status = "running"
            calls = {"writes": 0}

            def generate(system: str, user: str, max_new: int, temperature: float, seed: int | None) -> tuple[str, int]:
                # a classifier answers a word; a reply written a second time is a retry
                if max_new <= 16:
                    job.stage = "classifying"
                else:
                    job.stage = "retrying" if calls["writes"] else "writing"
                    calls["writes"] += 1
                job.tokens, job.text = 0, ""

                def on_token(text: str, n: int) -> None:
                    if job.stage != "classifying":
                        job.text, job.tokens = text, n

                reply, n = self._model.generate(system, user, max_new, temperature, seed,
                                                on_token=on_token, should_stop=lambda: job.cancel_requested)
                job.total_tokens += n
                if job.cancel_requested:
                    raise JobCancelled()
                return reply, n

            job.fields = tasks.run(job.task, generate, job.idea, language=job.language, kind=job.kind, seed=job.seed)
            job.status, job.stage = "done", "done"
        except JobCancelled:
            job.status, job.stage = "cancelled", "done"
        except tasks.TaskError as exc:
            job.status, job.stage, job.error = "failed", "done", str(exc)
        except Exception as exc:  # noqa: BLE001
            job.status, job.stage, job.error = "failed", "done", f"{type(exc).__name__}: {exc}"
            raise
        finally:
            job.finished = time.time()
