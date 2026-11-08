"""Static configuration: paths to the model repos, ports, launch commands.

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

# Privacy: the libraries under the model servers (huggingface_hub and friends) may send anonymous usage pings.
# Every child process inherits this environment, so setting it here covers ACE-Step, audio.cpp's tools and Demucs.
# setdefault keeps an explicit choice in the user's own environment or .env.
os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")
os.environ.setdefault("DO_NOT_TRACK", "1")

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
# Stable Audio 3: our own small HTTP server (external/sa3-server, a uv project) around
# Stability's package. Weights live in the Hugging Face cache, see features.has_stable_audio.
STABLE_AUDIO_DIR = _env_path("STABLE_AUDIO_DIR", r"E:\AI\StableAudio")
# The prompt assistant: a uv project tracked in the repository, run in place on a source install;
# the desktop app points this at its own copy.
PROMPT_ASSISTANT_DIR = _env_path("PROMPT_ASSISTANT_DIR", str(Path(__file__).resolve().parents[2] / "external" / "prompt-assistant"))

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
# Checkpoint folder names under ACE_STEP_DIR/checkpoints. acestep-api has no
# DiT CLI flag; it reads ACESTEP_CONFIG_PATH and otherwise loads turbo.
# Turbo + the 1.7B LM is the fast default. A machine with enough memory can
# point these at acestep-v15-xl-sft and acestep-5Hz-lm-4B.
ACE_STEP_DIT_MODEL = os.getenv("ACE_STEP_DIT_MODEL", "acestep-v15-turbo").strip() or "acestep-v15-turbo"
ACE_STEP_LM_MODEL = os.getenv("ACE_STEP_LM_MODEL", "acestep-5Hz-lm-1.7B").strip() or "acestep-5Hz-lm-1.7B"
# Lets a request name another downloaded DiT (the editor's AI parts use a base
# model for lego while the generation page stays on turbo); acestep-api swaps
# the primary model in place, so only one DiT is in VRAM at a time.
ACE_STEP_ON_DEMAND_MODEL_LOAD = os.getenv("ACE_STEP_ON_DEMAND_MODEL_LOAD", "true").strip().lower() in {"1", "true", "yes"}


def _ace_offload_dit() -> bool:
    """acestep-api reads ACESTEP_OFFLOAD_DIT_TO_CPU (default off) and ignores its own small-card profile, so on a 6-8 GB
    card the DiT stays in VRAM, the VAE finds ~0.2 GB free and decodes on the CPU for many minutes. "auto" turns the
    offload on up to 8 GB; ACE_STEP_OFFLOAD_DIT=true/false overrides."""
    mode = os.getenv("ACE_STEP_OFFLOAD_DIT", "auto").strip().lower()
    if mode in {"1", "true", "yes"}:
        return True
    if mode in {"0", "false", "no"}:
        return False
    from .sysinfo import gpu
    card = gpu()
    return bool(card) and card["total"] <= 8 * 1024 ** 3 + 512 * 1024 ** 2


ACE_STEP_OFFLOAD_DIT = _ace_offload_dit()
YUE2_SERVER_PORT = int(os.getenv("YUE2_SERVER_PORT", "8080"))
YUE2_SERVER_HOST = os.getenv("YUE2_SERVER_HOST", "127.0.0.1")
YUE2_DEVICE = os.getenv("YUE2_DEVICE", "").strip()
STABLE_AUDIO_API_PORT = int(os.getenv("STABLE_AUDIO_API_PORT", "8002"))
STABLE_AUDIO_DEVICE = os.getenv("STABLE_AUDIO_DEVICE", "").strip()
# A second sa3-server on the CPU for the editor's Samples panel (app/sfx_cpu.py): it runs next to whatever
# engine holds the GPU. Off until switched on in the panel's settings.
STABLE_AUDIO_CPU_PORT = int(os.getenv("STABLE_AUDIO_CPU_PORT", "8003"))
PROMPT_ASSISTANT_PORT = int(os.getenv("PROMPT_ASSISTANT_PORT", "8004"))
# Which Stable Audio 3 checkpoint the server warms up right after it starts (medium needs a
# CUDA GPU with Flash Attention; small-music / small-sfx run anywhere).
STABLE_AUDIO_PRELOAD = os.getenv("STABLE_AUDIO_PRELOAD", "medium").strip()
# Concurrent residency: every engine pinned to its own device, all devices distinct.
# Otherwise switching stays exclusive (one engine on the GPU at a time).
_ENGINE_DEVICES = [ACE_STEP_DEVICE, YUE2_DEVICE, STABLE_AUDIO_DEVICE]
ALLOW_CONCURRENT_MODELS = all(_ENGINE_DEVICES) and len(set(_ENGINE_DEVICES)) == len(_ENGINE_DEVICES)
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
                    "--lm-model-path", ACE_STEP_LM_MODEL,
                ],
                extra_path_dirs=[FFMPEG_BIN_DIR],
                env={
                    "PYTHONUTF8": "1",
                    "ACESTEP_CONFIG_PATH": ACE_STEP_DIT_MODEL,
                    **({"ACESTEP_ON_DEMAND_MODEL_LOAD": "true"} if ACE_STEP_ON_DEMAND_MODEL_LOAD else {}),
                    **({"CUDA_VISIBLE_DEVICES": ACE_STEP_DEVICE} if ACE_STEP_DEVICE else {}),
                    **({"ACESTEP_OFFLOAD_DIT_TO_CPU": "true"} if ACE_STEP_OFFLOAD_DIT else {}),
                },
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
                    {"LD_LIBRARY_PATH": f"{CUDA_LIB_DIR}{os.pathsep}{os.environ.get('LD_LIBRARY_PATH', '')}"}
                    if IS_LINUX else {}
                ),
                health_url=f"http://127.0.0.1:{YUE2_SERVER_PORT}/health",
                startup_timeout=300.0,
            ),
        ],
    ),
    "stable_audio": ModelDefinition(
        id="stable_audio",
        label="Stable Audio 3",
        proxy_prefix="sa3",
        proxy_target=f"http://127.0.0.1:{STABLE_AUDIO_API_PORT}",
        health_url=f"http://127.0.0.1:{STABLE_AUDIO_API_PORT}/health",
        processes=[
            ProcessSpec(
                name="stable_audio_api",
                cwd=STABLE_AUDIO_DIR,
                # The server's own venv, not "uv run": uv would try to re-resolve the git
                # dependency on every start, and the venv is all that is needed at run time.
                cmd=[
                    str(STABLE_AUDIO_DIR / ".venv" / ("Scripts" if IS_WINDOWS else "bin") / ("python.exe" if IS_WINDOWS else "python")),
                    "-m", "sa3_server",
                    "--host", "127.0.0.1",
                    "--port", str(STABLE_AUDIO_API_PORT),
                    "--preload", STABLE_AUDIO_PRELOAD,
                ],
                extra_path_dirs=[FFMPEG_BIN_DIR],
                env={
                    "PYTHONUTF8": "1",
                    # Weights are read from the Hugging Face cache; never go online at start.
                    "HF_HUB_OFFLINE": "1",
                    **({"CUDA_VISIBLE_DEVICES": STABLE_AUDIO_DEVICE} if STABLE_AUDIO_DEVICE else {}),
                },
                health_url=f"http://127.0.0.1:{STABLE_AUDIO_API_PORT}/health",
                # The server answers /health before the weights are loaded (they warm up in the
                # background), so this only covers Python start-up and imports.
                startup_timeout=180.0,
            ),
        ],
    ),
}

# The desktop app (desktop/) points these two at the user's profile because its
# install directory is read-only; a source checkout keeps the defaults next to
# the backend.
LOG_DIR = _env_path("REMIQORA_LOG_DIR", str(Path(__file__).resolve().parent.parent / "logs"))
LOG_TAIL_LINES = 40

# Shared track storage: one SQLite DB + files split into a subfolder per model.
DATA_DIR = _env_path("REMIQORA_DATA_DIR", str(Path(__file__).resolve().parent.parent / "data"))

# Directory containing the built frontend (frontend/dist). Only used when it
# exists; in dev the Vite dev server is used instead and this is ignored.
FRONTEND_DIST_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
