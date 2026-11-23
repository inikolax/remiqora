"""Serving the built frontend (frontend/dist) with the Vue router's fallback to index.html."""
from __future__ import annotations

from pathlib import Path
from typing import Optional

from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse

# index.html must be revalidated on every load: without Cache-Control Chromium caches it heuristically, and since
# the desktop app keeps the same port (= origin) across upgrades, the window could keep showing the old UI.
# Everything under /assets has a content hash in its name and stays cacheable.
INDEX_HEADERS = {"Cache-Control": "no-cache"}


def dist_file(root: Path, full_path: str) -> Optional[Path]:
    """The file under `root` (already resolved) that `full_path` names, or None. Only real files inside the folder:
    `..` segments (also %2F-encoded ones, which arrive decoded), an absolute path (on Windows "C:/..." replaces the
    base of a join) or a link leading out of it all give None, and so does index.html (served by the fallback)."""
    if not full_path or "\x00" in full_path:
        return None
    try:
        candidate = (root / full_path).resolve()
    except (OSError, ValueError, RuntimeError):
        return None
    if candidate == root or not candidate.is_relative_to(root):
        return None
    if candidate == root / "index.html" or not candidate.is_file():
        return None
    return candidate


def is_api_path(full_path: str) -> bool:
    return full_path == "api" or full_path.startswith("api/")


def mount_spa(app: FastAPI, dist_dir: Path) -> None:
    """Registers the catch-all GET route; call it after every API router so they always win. A real file from
    dist/ is served when one exists at that path (hashed JS/CSS under /assets, favicon, ...), otherwise index.html
    for the Vue router to handle client-side (so a hard refresh on /ace-step still works). An unknown /api/... path
    is a JSON 404, not the page."""
    root = dist_dir.resolve()

    @app.get("/{full_path:path}", include_in_schema=False)
    async def spa_fallback(full_path: str):
        if is_api_path(full_path):
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        found = dist_file(root, full_path)
        if found is not None:
            return FileResponse(found)
        return FileResponse(root / "index.html", headers=INDEX_HEADERS)
