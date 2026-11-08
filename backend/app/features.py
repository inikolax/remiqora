"""What is installed: the parts of Remiqora a user may leave out (the desktop installer lets them pick).

Checked on disk on every call - cheap, and right after an install from the app or a manual one, without a restart:
- ace_step: ACE-Step's environment (always installed by the desktop app; its models may still be fetched on first use);
- yue2: the audio.cpp server and at least one YuE2 weight file, plus which precisions are there;
- demucs: the stem separation environment;
- ace_base: ACE-Step's base model, which the editor's AI arranger needs to add parts (turbo cannot);
- ace_xl: its XL base model (about 20 GB), an optional bigger alternative for those parts;
- stable_audio: the sa3-server environment plus at least one Stable Audio 3 checkpoint in the Hugging Face cache
  (the weights are gated, so they are fetched by the user, not by the installer).
"""
from __future__ import annotations

from pathlib import Path

import os

from .config import ACE_STEP_DIR, DEMUCS_DIR, MODELS, STABLE_AUDIO_DIR, YUE2_MODEL_PATH

ACE_BASE_MODEL = "acestep-v15-base"
ACE_XL_MODEL = "acestep-v15-xl-base"
YUE2_PRECISIONS = ("q8_0", "q4_0", "bf16")


def _yue2_server() -> Path:
    return Path(MODELS["yue2"].processes[0].cmd[0])


def yue2_precisions() -> list[str]:
    return [p for p in YUE2_PRECISIONS if (YUE2_MODEL_PATH / f"yue2-3b-{p}.gguf").is_file()]


def has_yue2() -> bool:
    return _yue2_server().is_file() and bool(yue2_precisions()) and (YUE2_MODEL_PATH / "yue2-vae-f16.gguf").is_file()


def has_demucs() -> bool:
    return (DEMUCS_DIR / ".venv").is_dir()


def has_ace_base() -> bool:
    return (ACE_STEP_DIR / "checkpoints" / ACE_BASE_MODEL / "model.safetensors").is_file()


def has_ace_xl() -> bool:
    # four weight shards: the last one is there only once the download finished
    return (ACE_STEP_DIR / "checkpoints" / ACE_XL_MODEL / "model-00004-of-00004.safetensors").is_file()


def has_ace_step() -> bool:
    # Only the environment: a source install (setup_models) leaves the checkpoints to ACE-Step, which downloads them
    # on its first request, so requiring them here would refuse to start a perfectly good install.
    return (ACE_STEP_DIR / ".venv").is_dir()


STABLE_AUDIO_MODELS = ("medium", "small-music", "small-sfx", "medium-base", "small-music-base", "small-sfx-base")


def _hf_hub_dir() -> Path:
    # Same resolution order as huggingface_hub: HF_HUB_CACHE > HF_HOME/hub > ~/.cache/huggingface/hub.
    if os.getenv("HF_HUB_CACHE"):
        return Path(os.environ["HF_HUB_CACHE"])
    if os.getenv("HF_HOME"):
        return Path(os.environ["HF_HOME"]) / "hub"
    return Path.home() / ".cache" / "huggingface" / "hub"


# Each checkpoint repo carries its own text encoder next to the DiT weights; both are needed to generate
# (sa3_server/specs.py REQUIRED_FILES).
STABLE_AUDIO_REQUIRED = ("model.safetensors", "t5gemma-b-b-ul2/model.safetensors")


def stable_audio_models() -> list[str]:
    """Checkpoints whose download finished: a snapshot folder holding the weights and the text encoder,
    and no download from the app still running for it."""
    from . import sa3_weights  # imports this module

    hub = _hf_hub_dir()
    downloading = sa3_weights.active()
    found = []
    for name in STABLE_AUDIO_MODELS:
        snaps = hub / f"models--stabilityai--stable-audio-3-{name}" / "snapshots"
        if name == downloading or not snaps.is_dir():
            continue
        if any(all((d / f).is_file() for f in STABLE_AUDIO_REQUIRED) for d in snaps.iterdir()):
            found.append(name)
    return found


def has_stable_audio_env() -> bool:
    return (STABLE_AUDIO_DIR / ".venv").is_dir()


def has_stable_audio() -> bool:
    return has_stable_audio_env() and bool(stable_audio_models())


def snapshot() -> dict:
    return {
        "ace_step": has_ace_step(),
        "yue2": has_yue2(),
        "yue2_precisions": yue2_precisions(),
        "demucs": has_demucs(),
        "ace_base": has_ace_base(),
        "ace_xl": has_ace_xl(),
        "stable_audio": has_stable_audio(),
        "stable_audio_env": has_stable_audio_env(),
        "stable_audio_models": stable_audio_models(),
    }
