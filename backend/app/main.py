from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .api.routes_lora_dataset import router as lora_dataset_router
from .api.routes_assistant import router as assistant_router
from .api.routes_collections import router as collections_router
from .api.routes_covers import router as covers_router
from .api.routes_engines import router as engines_router
from .api.routes_jobs import router as jobs_router
from .api.routes_midi import router as midi_router
from .api.routes_orchestrator import router as orchestrator_router
from .api.routes_projects import router as projects_router
from .api.routes_sa3_weights import router as sa3_weights_router
from .api.routes_settings import router as settings_router
from .api.routes_proxy import router as proxy_router
from .api.routes_stems import router as stems_router
from .api.routes_system import router as system_router
from .api.routes_tags import router as tags_router
from .api.routes_tracks import router as tracks_router
from .api.routes_yue2_upload import router as yue2_upload_router
from . import db, stems, tagging
from .config import FRONTEND_DIST_DIR
from .security import LocalOnlyMiddleware
from .spa import mount_spa
from .gen_queue import queue as gen_queue
from .orchestrator.manager import manager
from .sfx_cpu import sampler
from .assistant import server as assistant_server

log = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        removed, left = await asyncio.to_thread(db.retry_pending_deletions)
        if removed or left:
            log.info("files of deleted tracks: %d removed now, %d still in use", removed, left)
    except Exception:
        log.exception("could not retry the pending file deletions")
    try:
        await asyncio.to_thread(db.purge_expired_trash)
    except Exception:
        log.exception("could not clear the old trash")
    try:
        tagging.sweep_download_tmp()
    except Exception:
        log.exception("could not clear the old download copies")
    manager.start_watchdog()
    gen_queue.start()
    yield
    # The queue first: a job it is running stays "running" in the database and goes back into the queue on the
    # next start; then don't leave a GPU process running after the dev server is killed.
    await gen_queue.stop()
    await manager.stop_all()
    await stems.shutdown()
    await sampler.shutdown()
    await assistant_server.shutdown()


app = FastAPI(title="Remiqora", lifespan=lifespan)
# Host (DNS rebinding) and Origin (CSRF) checks: see app/security.py.
app.add_middleware(LocalOnlyMiddleware)

app.include_router(orchestrator_router)
app.include_router(tracks_router)
app.include_router(jobs_router)
app.include_router(covers_router)
app.include_router(collections_router)
app.include_router(tags_router)
app.include_router(stems_router)
app.include_router(midi_router)
app.include_router(projects_router)
app.include_router(settings_router)
app.include_router(system_router)
app.include_router(lora_dataset_router)
# Registered before proxy_router's catch-all so this exact path wins.
app.include_router(yue2_upload_router)
app.include_router(sa3_weights_router)
app.include_router(engines_router)
app.include_router(assistant_router)
app.include_router(proxy_router)

if FRONTEND_DIST_DIR.exists():
    # Registered last so the API routes above always win (see app/spa.py).
    mount_spa(app, FRONTEND_DIST_DIR)
