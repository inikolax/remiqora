"""Small adapter for an optional remote ACE-Step API."""
from __future__ import annotations

import httpx

from .config import ACE_STEP_API_TOKEN, ACE_STEP_API_URL


def enabled() -> bool:
    return bool(ACE_STEP_API_URL)


def auth_headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {ACE_STEP_API_TOKEN}"} if ACE_STEP_API_TOKEN else {}


async def check_health() -> None:
    """Raise a useful error unless the configured upstream health endpoint is ready."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(f"{ACE_STEP_API_URL}/health", headers=auth_headers())
            response.raise_for_status()
    except httpx.HTTPError as exc:
        raise RuntimeError(f"Remote ACE-Step API is unavailable: {exc}") from exc
