"""Static configuration: paths to the two model repos, ports, launch commands.

All values here were verified against the real launch scripts / CLI argparse
definitions in each project (see the plan doc) rather than guessed, since a
wrong flag here means a multi-minute GPU model load fails at the very end.

Machine-specific filesystem paths are read from a `.env` file next to this
package (backend/.env, see backend/.env.example) so redeploying on another
machine only means editing that one file, not this source file.
"""
from __future__ import annotations

import os
import sys
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

IS_WINDOWS = sys.platform == "win32"
IS_MACOS = sys.platform == "darwin"
IS_LINUX = sys.platform.startswith("linux")


def _env_path(name: str, default: str) -> Path:
    return Path(os.getenv(name, default))


@dataclass(frozen=True)
class ProcessSpec:
    """One OS process to launch as part of bringing a model online."""

    name: str
    cwd: Path
    cmd: list[str]
    # Extra directories prepended to PATH for this process only.
    extra_path_dirs: list[Path] = field(default_factory=list)
    # Extra environment variables (on top of the inherited environment).
    env: dict[str, str] = field(default_factory=dict)
    # URL polled to decide the process is up and ready to receive traffic.
    health_url: str = ""
    # Seconds to wait for health_url to respond before declaring failure.
    startup_timeout: float = 300.0
    # Seconds to wait for graceful exit before force-killing the process tree.
    shutdown_timeout: float = 20.0


@dataclass(frozen=True)
class ModelDefinition:
    id: str
    label: str
    # Processes started in order; each subsequent one waits for the previous
    # process's health_url before it is launched.
    processes: list[ProcessSpec]
    # URL path segment: requests to "/api/{proxy_prefix}/*" are forwarded to proxy_target.
    proxy_prefix: str
    # Base URL the reverse proxy forwards "/api/{proxy_prefix}/*" requests to.
    proxy_target: str
    # Health URL used by the orchestrator to represent "is this model usable".
    health_url: str


ACE_STEP_DIR = _env_path("ACE_STEP_DIR", r"E:\AI\ACE\ACE-Step-1.5")
YUE2_DIR = _env_path("YUE2_DIR", r"E:\AI\YuE2-3B")
# Separate uv-managed venv for Demucs (stem separation) - not a "model" in
# MODELS below since it's a one-shot CLI job, not a persistent HTTP server.
DEMUCS_DIR = _env_path("DEMUCS_DIR", r"E:\AI\Demucs")

# MuScriptor (audio -> MIDI) is loaded into YuE2's own audiocpp_server rather
# than being launched separately, so it gets no MODELS entry - only the spec
# that server needs to resolve the weights.
MUSCRIPTOR_MODEL_PATH = _env_path(
    "MUSCRIPTOR_MODEL_PATH",
    str(YUE2_DIR / "models" / "MuScriptor-Small-GGUF" / "muscriptor-small-f32.gguf"),
)
MUSCRIPTOR_MODEL_ID = "muscriptor"
MUSCRIPTOR_FAMILY = "muscriptor"
MUSCRIPTOR_TASK = "midi"

YUE2_MODEL_PATH = _env_path(
    "YUE2_MODEL_PATH",
    str(YUE2_DIR / "models" / "Yue2-3B-GGUF"),
)
SHEETSAGE_MODEL_PATH = _env_path(
    "SHEETSAGE_MODEL_PATH",
    str(YUE2_DIR / "models" / "SheetSage2-GGUF" / "sheetsage2-orig.gguf"),
)


def yue2_specs() -> dict[str, dict[str, str]]:
    yue2_spec = {
        "id": "yue2",
        "family": "yue2",
        "path": str(YUE2_MODEL_PATH).replace("\\", "/"),
        "task": "gen",
        "mode": "offline",
    }
    if IS_LINUX:
        yue2_spec["model_spec_override"] = str(YUE2_DIR / "model_specs" / "yue2.json").replace("\\", "/")
    return {
        "yue2": yue2_spec,
        "sheetsage2": {
            "id": "sheetsage2",
            "family": "sheetsage2",
            "path": str(SHEETSAGE_MODEL_PATH).replace("\\", "/"),
            "task": "midi",
            "mode": "offline",
        },
        "muscriptor": {
            "id": MUSCRIPTOR_MODEL_ID,
            "family": MUSCRIPTOR_FAMILY,
            "path": str(MUSCRIPTOR_MODEL_PATH).replace("\\", "/"),
            "task": MUSCRIPTOR_TASK,
            "mode": "offline",
        },
    }

FFMPEG_BIN_DIR = _env_path("FFMPEG_BIN_DIR", r"E:\AI\ACE\tools\ffmpeg-shared\ffmpeg-master-latest-win64-gpl-shared\bin")
CUDA_BIN_DIR = _env_path("CUDA_BIN_DIR", r"C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.4\bin")
CUDA_BIN64_DIR = CUDA_BIN_DIR / "x64"

UV_BIN = os.getenv("UV_BIN", "uv")
ACE_STEP_DEVICE = os.getenv("ACE_STEP_DEVICE", "").strip()
ACE_STEP_API_PORT = int(os.getenv("ACE_STEP_API_PORT", "8001"))
YUE2_SERVER_PORT = int(os.getenv("YUE2_SERVER_PORT", "8080"))
YUE2_SERVER_HOST = os.getenv("YUE2_SERVER_HOST", "127.0.0.1")
YUE2_DEVICE = os.getenv("YUE2_DEVICE", "").strip()
CUDA_LIB_DIR = _env_path("CUDA_LIB_DIR", str(CUDA_BIN_DIR.parent / "lib"))

# audiocpp_server is built from source by setup_models.ps1 on Windows (CUDA
# backend) and placed under this same build/<preset>/bin/ layout by
# setup_models.sh on macOS - by default from audio.cpp's own prebuilt
# Apple-Silicon/Metal release (no compiler needed), or from source (Metal
# backend, via scripts/build_metal.sh) if it was run with --from-source.
if IS_WINDOWS:
    _YUE2_BUILD_PRESET = "windows-cuda-release"
    _YUE2_SERVER_BIN = "audiocpp_server.exe"
    _YUE2_BACKEND = "cuda"
    _YUE2_EXTRA_PATH_DIRS = [CUDA_BIN64_DIR, CUDA_BIN_DIR]
elif IS_MACOS:
    _YUE2_BUILD_PRESET = "macos-metal-release"
    _YUE2_SERVER_BIN = "audiocpp_server"
    _YUE2_BACKEND = "metal"
    _YUE2_EXTRA_PATH_DIRS = []
elif IS_LINUX:
    _YUE2_BUILD_PRESET = "linux-cuda-release"
    _YUE2_SERVER_BIN = "audiocpp_server"
    _YUE2_BACKEND = "cuda"
    _YUE2_EXTRA_PATH_DIRS = [CUDA_BIN_DIR]
else:
    raise RuntimeError(f"Unsupported platform for YuE2: {sys.platform}")

MODELS: dict[str, ModelDefinition] = {
    "ace_step": ModelDefinition(
        id="ace_step",
        label="ACE-Step 1.5",
        proxy_prefix="ace",
        proxy_target=f"http://127.0.0.1:{ACE_STEP_API_PORT}",
        health_url=f"http://127.0.0.1:{ACE_STEP_API_PORT}/health",
        processes=[
            ProcessSpec(
                name="ace_step_api",
                cwd=ACE_STEP_DIR,
                cmd=[
                    UV_BIN, "run", "acestep-api",
                    "--host", "127.0.0.1",
                    "--port", str(ACE_STEP_API_PORT),
                    "--lm-model-path", "acestep-5Hz-lm-1.7B",
                ],
                extra_path_dirs=[FFMPEG_BIN_DIR],
                env={"PYTHONUTF8": "1", **({"CUDA_VISIBLE_DEVICES": ACE_STEP_DEVICE} if ACE_STEP_DEVICE else {})},
                health_url=f"http://127.0.0.1:{ACE_STEP_API_PORT}/health",
                # Model + LM weights loading onto the GPU can genuinely take
                # a few minutes on first load / cold cache.
                startup_timeout=600.0,
            ),
        ],
    ),
    "yue2": ModelDefinition(
        id="yue2",
        label="YuE2-3B",
        proxy_prefix="yue2",
        # Proxied straight to the native inference server - we no longer run
        # YuE2's own web-ui/server.py. The one thing it did beyond plain
        # proxying (transcoding non-WAV uploads to WAV before forwarding to
        # /v1/ui/upload) is reimplemented in api/routes_yue2_upload.py.
        proxy_target=f"http://127.0.0.1:{YUE2_SERVER_PORT}",
        health_url=f"http://127.0.0.1:{YUE2_SERVER_PORT}/health",
        processes=[
            ProcessSpec(
                name="yue2_server",
                cwd=YUE2_DIR,
                cmd=[
                    str(YUE2_DIR / "build" / _YUE2_BUILD_PRESET / "bin" / _YUE2_SERVER_BIN),
                    "--ui", "--ui-management", "--backend", _YUE2_BACKEND,
                    "--host", YUE2_SERVER_HOST,
                    "--port", str(YUE2_SERVER_PORT),
                    *(["--device", YUE2_DEVICE] if YUE2_DEVICE else []),
                ],
                extra_path_dirs=_YUE2_EXTRA_PATH_DIRS,
                env=(
                    {"LD_LIBRARY_PATH": f"{CUDA_LIB_DIR}{os.pathsep}{os.environ.get("LD_LIBRARY_PATH", "")}"}
                    if IS_LINUX else {}
                ),
                health_url=f"http://127.0.0.1:{YUE2_SERVER_PORT}/health",
                startup_timeout=300.0,
            ),
        ],
    ),
}

LOG_DIR = Path(__file__).resolve().parent.parent / "logs"
LOG_TAIL_LINES = 40

# Shared track storage: one SQLite DB + files split into a subfolder per model.
DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# Directory containing the built frontend (frontend/dist). Only used when it
# exists; in dev the Vite dev server is used instead and this is ignored.
FRONTEND_DIST_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
