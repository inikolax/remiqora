"""Per-engine settings the Models page changes without editing backend/.env.

Each value starts from the .env default (config.py) and is overridden by what the user saved (database, key
"engine.<id>"). Engine settings take effect on the engine's next start: processes_for() builds its command line
from them, and the manager remembers what each running engine was started with, so the page can say a restart
is pending.

- ace_step: the DiT the generation page uses (`ACESTEP_CONFIG_PATH`) and the language model (`--lm-model-path`);
  only checkpoints that are downloaded can be picked.
- stable_audio: the checkpoint warmed up right after the start (`--preload`), or none.
- demucs: the separation model (`demucs -n`): htdemucs, or htdemucs_ft (fine-tuned, better, about 4x slower).
"""
from __future__ import annotations

import dataclasses
import json
from . import db
from .config import ACE_STEP_DIR, ACE_STEP_DIT_MODEL, ACE_STEP_LM_MODEL, MODELS, STABLE_AUDIO_PRELOAD, ProcessSpec

ACE_DITS = ("acestep-v15-turbo", "acestep-v15-sft", "acestep-v15-base", "acestep-v15-xl-turbo", "acestep-v15-xl-sft", "acestep-v15-xl-base")
ACE_LMS = ("acestep-5Hz-lm-0.6B", "acestep-5Hz-lm-1.7B", "acestep-5Hz-lm-4B")
SA3_PRELOADS = ("", "medium", "small-music", "small-sfx", "medium-base", "small-music-base", "small-sfx-base")
DEMUCS_MODELS = ("htdemucs", "htdemucs_ft")

DEFAULTS: dict[str, dict[str, str]] = {
    "ace_step": {"dit_model": ACE_STEP_DIT_MODEL, "lm_model": ACE_STEP_LM_MODEL},
    "stable_audio": {"preload": STABLE_AUDIO_PRELOAD},
    "demucs": {"model": "htdemucs"},
}
CHOICES: dict[str, dict[str, tuple[str, ...]]] = {
    "ace_step": {"dit_model": ACE_DITS, "lm_model": ACE_LMS},
    "stable_audio": {"preload": SA3_PRELOADS},
    "demucs": {"model": DEMUCS_MODELS},
}


def ace_checkpoint_ready(name: str) -> bool:
    """A downloaded ACE-Step checkpoint: its folder holds a config and weights, and no partial download."""
    folder = ACE_STEP_DIR / "checkpoints" / name
    if not (folder / "config.json").is_file() or not any(folder.glob("*.safetensors")):
        return False
    return not any(folder.rglob("*.incomplete"))


def _stored(engine: str) -> dict[str, str]:
    """The defaults overridden by what the user saved (only known choices)."""
    values = dict(DEFAULTS[engine])
    try:
        saved = json.loads(db.get_setting(f"engine.{engine}", "") or "{}")
    except ValueError:
        saved = {}
    if isinstance(saved, dict):
        for key, allowed in CHOICES[engine].items():
            if saved.get(key) in allowed:
                values[key] = saved[key]
    return values


def get(engine: str) -> dict[str, str]:
    """The settings in effect. A saved ACE-Step checkpoint whose folder is gone (deleted by hand) gives way to the
    default: started with it, ACE-Step would download it again (up to ~20 GB) or fail. The saved choice is kept, so
    it is back in effect once the checkpoint is downloaded again."""
    values = _stored(engine)
    if engine == "ace_step":
        for key, value in values.items():
            if value != DEFAULTS[engine][key] and not ace_checkpoint_ready(value):
                values[key] = DEFAULTS[engine][key]
    return values


def save(engine: str, values: dict) -> dict[str, str]:
    if engine not in DEFAULTS:
        raise KeyError(engine)
    # from what is stored, not get(): saving one key must not rewrite another that only falls back for now
    current = _stored(engine)
    for key, value in values.items():
        allowed = CHOICES[engine].get(key)
        if allowed is None:
            raise ValueError(f"unknown setting '{key}'")
        if value not in allowed:
            raise ValueError(f"'{value}' is not a valid {key}")
        if engine == "ace_step" and not ace_checkpoint_ready(value):
            raise ValueError(f"'{value}' is not downloaded")
        current[key] = value
    db.set_setting(f"engine.{engine}", json.dumps(current))
    return get(engine)


def _replace_arg(cmd: list[str], flag: str, value: str) -> list[str]:
    out = list(cmd)
    if flag in out:
        i = out.index(flag)
        if i + 1 < len(out):
            out[i + 1] = value
    return out


def processes_for(model_id: str) -> list[ProcessSpec]:
    """The engine's processes with the saved settings applied."""
    specs = list(MODELS[model_id].processes)
    if model_id == "ace_step":
        s = get("ace_step")
        specs = [dataclasses.replace(p, cmd=_replace_arg(p.cmd, "--lm-model-path", s["lm_model"]),
                                     env={**p.env, "ACESTEP_CONFIG_PATH": s["dit_model"]}) for p in specs]
    elif model_id == "stable_audio":
        s = get("stable_audio")
        specs = [dataclasses.replace(p, cmd=_replace_arg(p.cmd, "--preload", s["preload"])) for p in specs]
    return specs


def applies_to_running(engine: str) -> bool:
    """Whether the setting is read when the engine starts (Demucs reads it on every separation)."""
    return engine in ("ace_step", "stable_audio")

