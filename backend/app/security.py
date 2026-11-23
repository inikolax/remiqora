"""Request checks for a server that has no login and listens on the loopback address.

* Host: a page on another site can make the browser talk to 127.0.0.1 by pointing its own domain at it (DNS
  rebinding); the browser then sends that domain as the Host header. Only loopback names are served
  (127.0.0.1, localhost, [::1], any port), plus what REMIQORA_ALLOWED_HOSTS adds. When the server is told to
  listen elsewhere (REMIQORA_HOST other than a loopback address, e.g. 0.0.0.0 on a trusted LAN), the host check is
  off unless REMIQORA_ALLOWED_HOSTS names the hosts; "*" in it switches the check off too.
* Origin: a page on another site can still send a form or a fetch to http://127.0.0.1:<port> (CSRF). A state-
  changing request (POST, PUT, PATCH, DELETE) that carries an Origin header is refused (403) unless the origin is
  a loopback one (any port: the Vite dev server is :5174, the desktop app uses its own port), one of the allowed
  hosts, or the same origin as the request. Requests without Origin (curl, the backend's own clients, the engines)
  are not affected.
"""
from __future__ import annotations

import json
import logging
import os
from typing import Iterable, Optional
from urllib.parse import urlsplit

log = logging.getLogger(__name__)

LOOPBACK_HOSTS = frozenset({"127.0.0.1", "localhost", "::1"})
UNSAFE_METHODS = frozenset({"POST", "PUT", "PATCH", "DELETE"})


def _bare(host: str) -> str:
    """The host name of a Host header value or netloc, lower case, without port and IPv6 brackets."""
    host = host.strip().lower()
    if host.startswith("["):
        end = host.find("]")
        return host[1:end] if end != -1 else host
    if host.count(":") == 1:
        host = host.split(":", 1)[0]
    return host.rstrip(".")


def allowed_hosts_from_env() -> Optional[frozenset[str]]:
    """The hosts to serve, or None when the host check is off (see the module docstring)."""
    extra = [h for h in (x.strip() for x in os.getenv("REMIQORA_ALLOWED_HOSTS", "").split(",")) if h]
    if "*" in extra:
        return None
    listen = os.getenv("REMIQORA_HOST", "").strip()
    if listen and _bare(listen) not in LOOPBACK_HOSTS and not extra:
        log.warning("listening on %s: the Host header check is off (set REMIQORA_ALLOWED_HOSTS to enable it)", listen)
        return None
    return LOOPBACK_HOSTS | {_bare(h) for h in extra}


class LocalOnlyMiddleware:
    """Pure ASGI middleware doing the Host and Origin checks above."""

    def __init__(self, app, allowed_hosts: Optional[Iterable[str]] = (), *, use_env: bool = True) -> None:
        self.app = app
        if use_env:
            hosts = allowed_hosts_from_env()
            self.hosts = None if hosts is None else hosts | {_bare(h) for h in (allowed_hosts or ())}
        else:
            self.hosts = None if allowed_hosts is None else LOOPBACK_HOSTS | {_bare(h) for h in allowed_hosts}

    async def __call__(self, scope, receive, send) -> None:
        if scope["type"] not in ("http", "websocket"):
            await self.app(scope, receive, send)
            return
        headers = {k.decode("latin-1").lower(): v.decode("latin-1") for k, v in scope.get("headers") or []}
        host = headers.get("host", "")
        if self.hosts is not None and _bare(host) not in self.hosts:
            await self._reject(scope, send, 400, "Invalid host header")
            return
        method = scope.get("method", "GET").upper() if scope["type"] == "http" else "GET"
        origin = headers.get("origin")
        if origin is not None and (scope["type"] == "websocket" or method in UNSAFE_METHODS) and not self._origin_ok(origin, host):
            await self._reject(scope, send, 403, "cross-origin request refused")
            return
        await self.app(scope, receive, send)

    def _origin_ok(self, origin: str, host: str) -> bool:
        try:
            parts = urlsplit(origin.strip())
        except ValueError:
            return False
        if parts.scheme not in ("http", "https") or not parts.netloc:
            return False  # "null" (sandboxed frames, file:), extension schemes, ...
        name = (parts.hostname or "").lower()
        if name in LOOPBACK_HOSTS or (self.hosts is not None and name in self.hosts):
            return True
        # same origin as the request itself (only reachable here for a host the host check let through)
        return parts.netloc.lower() == host.strip().lower()

    @staticmethod
    async def _reject(scope, send, status: int, detail: str) -> None:
        if scope["type"] == "websocket":
            await send({"type": "websocket.close", "code": 1008})
            return
        body = json.dumps({"detail": detail}).encode("utf-8")
        await send({"type": "http.response.start", "status": status,
                    "headers": [(b"content-type", b"application/json"), (b"content-length", str(len(body)).encode())]})
        await send({"type": "http.response.body", "body": body})
