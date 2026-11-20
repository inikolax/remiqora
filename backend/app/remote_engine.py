"""Shared support for optional model APIs hosted outside Remiqora."""
from __future__ import annotations

import httpx

from .config import REMOTE_MODEL_ENDPOINTS, RemoteModelEndpoint


def endpoint(model_id: str) -> RemoteModelEndpoint | None:
    return REMOTE_MODEL_ENDPOINTS.get(model_id)


def enabled(model_id: str) -> bool:
    configured = endpoint(model_id)
    return bool(configured and configured.url)


def auth_headers(model_id: str) -> dict[str, str]:
    configured = endpoint(model_id)
    if not configured or not configured.token:
        return {}
    return {"Authorization": f"Bearer {configured.token}"}


async def check_health(model_id: str) -> None:
    """Raise a useful error unless the configured remote model is ready."""
    configured = endpoint(model_id)
    if not configured or not configured.url:
        raise ValueError(f"no remote endpoint configured for model '{model_id}'")

    health_path = configured.health_path if configured.health_path.startswith("/") else f"/{configured.health_path}"
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(
                f"{configured.url.rstrip('/')}{health_path}",
                headers=auth_headers(model_id),
            )
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise RuntimeError(f"Remote {configured.label} API is unavailable: {exc}") from exc
