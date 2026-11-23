"""Generic reverse proxy: /api/{ace,yue2}/* -> the active model's own REST API.

Mirrors the proxy pattern YuE2's own web-ui/server.py already uses for its
/v1/* passthrough (strip hop-by-hop headers, forward method/body/query as-is)
so both frontends can be written against a single same-origin API surface.
"""
from __future__ import annotations

import httpx
from fastapi import APIRouter, Request, Response
from fastapi.responses import JSONResponse, StreamingResponse
from starlette.background import BackgroundTask

from ..config import MODELS
from ..orchestrator.manager import manager
from ..orchestrator.state import ModelStatus

router = APIRouter(prefix="/api")

_HOP_BY_HOP = {
    "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
    "te", "trailers", "transfer-encoding", "upgrade",
    "content-encoding", "content-length", "host",
}

_client = httpx.AsyncClient(timeout=None)


class _UpstreamResponse(StreamingResponse):
    """Streams the engine's answer and closes the upstream response however the stream ends. The generator's own
    finally does not run when the client went away before the first chunk was asked for (the generator was never
    started), and a BackgroundTask does not run on a disconnect half way; this finally always does."""

    def __init__(self, *args, upstream: httpx.Response, **kwargs) -> None:
        super().__init__(*args, background=BackgroundTask(upstream.aclose), **kwargs)
        self._upstream = upstream

    async def __call__(self, scope, receive, send) -> None:
        try:
            await super().__call__(scope, receive, send)
        finally:
            await self._upstream.aclose()  # idempotent: a second close after the generator's is a no-op


async def _proxy_to(base_url: str, request: Request, path: str) -> Response:
    headers = {k: v for k, v in request.headers.items() if k.lower() not in _HOP_BY_HOP}
    body = await request.body()
    url = httpx.URL(f"{base_url}/{path}", params=list(request.query_params.multi_items()))

    req = _client.build_request(
        request.method,
        url,
        headers=headers,
        content=body,
    )
    upstream = await _client.send(req, stream=True)
    response_headers = {k: v for k, v in upstream.headers.items() if k.lower() not in _HOP_BY_HOP}

    async def body_stream():
        try:
            async for chunk in upstream.aiter_bytes():
                yield chunk
        finally:
            await upstream.aclose()

    return _UpstreamResponse(
        body_stream(),
        upstream=upstream,
        status_code=upstream.status_code,
        headers=response_headers,
        media_type=upstream.headers.get("content-type"),
    )


def _make_proxy_route(model_id: str):
    async def _route(request: Request, path: str = ""):
        rs = manager.state.models[model_id]
        if rs.status != ModelStatus.RUNNING:
            return JSONResponse({"error": f"model '{model_id}' is not active"}, status_code=503)
        try:
            return await _proxy_to(MODELS[model_id].proxy_target, request, path)
        except httpx.HTTPError as exc:
            return JSONResponse({"error": f"upstream request failed: {exc}"}, status_code=502)

    return _route


for _model_id, _definition in MODELS.items():
    router.add_api_route(
        f"/{_definition.proxy_prefix}/{{path:path}}",
        _make_proxy_route(_model_id),
        methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    )
