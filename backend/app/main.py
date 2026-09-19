from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.responses import FileResponse

from .api.routes_lora_dataset import router as lora_dataset_router
from .api.routes_midi import router as midi_router
from .api.routes_orchestrator import router as orchestrator_router
from .api.routes_projects import router as projects_router
from .api.routes_proxy import router as proxy_router
from .api.routes_stems import router as stems_router
from .api.routes_tracks import router as tracks_router
from .api.routes_yue2_upload import router as yue2_upload_router
from .config import FRONTEND_DIST_DIR
from .orchestrator.manager import manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    # Don't leave a GPU process running after the dev server is killed.
    await manager.stop_all()


app = FastAPI(title="Remiqora", lifespan=lifespan)

app.include_router(orchestrator_router)
app.include_router(tracks_router)
app.include_router(stems_router)
app.include_router(midi_router)
app.include_router(projects_router)
app.include_router(lora_dataset_router)
# Registered before proxy_router's catch-all so this exact path wins.
app.include_router(yue2_upload_router)
app.include_router(proxy_router)

if FRONTEND_DIST_DIR.exists():
    # Registered last so the API routes above always win. Serves a real file
    # from dist/ when one exists at that path (hashed JS/CSS under /assets,
    # favicon, etc.), otherwise falls back to index.html for the Vue router
    # to handle client-side (so a hard refresh on /ace-step still works).
    @app.get("/{full_path:path}")
    async def spa_fallback(full_path: str):
        candidate = FRONTEND_DIST_DIR / full_path
        if full_path and candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(FRONTEND_DIST_DIR / "index.html")
