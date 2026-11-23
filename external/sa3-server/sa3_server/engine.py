"""Model registry and generation: which Stable Audio 3 checkpoints exist in the Hugging Face
cache, which are resident, and one `run()` that turns a job into WAV files."""
from __future__ import annotations

import logging
import random
import threading
import time
from collections import OrderedDict
from pathlib import Path
from typing import Any

import torch

from .audio import trim_leading_silence, trim_to_seconds, write_wav
from .jobs import Job, JobCancelled
from .specs import MODEL_SPECS, installed_models

log = logging.getLogger("sa3.engine")

TASKS = ("text", "a2a", "inpaint")


class Engine:
    def __init__(self, out_dir: Path, device: str | None = None, max_resident: int = 1) -> None:
        self.out_dir = out_dir
        self.out_dir.mkdir(parents=True, exist_ok=True)
        self.device = device
        self.max_resident = max(1, max_resident)
        self._models: "OrderedDict[str, Any]" = OrderedDict()
        self._lock = threading.RLock()
        self._loading: str | None = None

    # ---- residency ----
    def loaded(self) -> list[str]:
        with self._lock:
            return list(self._models.keys())

    def loading(self) -> str | None:
        return self._loading

    def _disable_flash_attention_if_unusable(self) -> None:
        """Stable Audio picks Flash Attention whenever the package imports, whatever the device; its kernels
        exist only for CUDA, so on a CPU (or MPS) every attention call would fail. A prebuilt wheel also
        carries kernels only for the GPU generations it was compiled for (the Windows one: sm_89 only), so
        on another card the first call fails with "no kernel image". Clearing the module's handles makes it
        fall back to PyTorch's own attention (SDPA)."""
        from stable_audio_3.models import transformer

        if transformer.__dict__.get("flash_attn_func") is None:
            return
        if self.device_name() == "cuda":
            reason = self._flash_attention_probe()
            if reason is None:
                return
        else:
            reason = "no CUDA"
        for attr in ("flash_attn_func", "flash_attn_kvpacked_func", "flash_attn_varlen_func"):
            if getattr(transformer, attr, None) is not None:
                setattr(transformer, attr, None)
        log.warning("Flash Attention off (%s), using PyTorch attention", reason)

    @staticmethod
    def _flash_attention_probe() -> str | None:
        """Run one tiny Flash Attention call on the GPU; None if it works, else why it does not."""
        from stable_audio_3.models import transformer

        try:
            q = torch.zeros(1, 16, 1, 64, device="cuda", dtype=torch.float16)
            transformer.flash_attn_func(q, q, q)
            torch.cuda.synchronize()
            return None
        except Exception as exc:  # noqa: BLE001 - any failure means the kernels cannot be used here
            major, minor = torch.cuda.get_device_capability()
            return f"sm_{major}{minor}: {str(exc).splitlines()[0]}"

    def load(self, name: str) -> Any:
        if name not in MODEL_SPECS:
            raise ValueError(f"unknown model '{name}'")
        with self._lock:
            if name in self._models:
                self._models.move_to_end(name)
                return self._models[name]
            if installed_models().get(name) is None:
                raise FileNotFoundError(
                    f"model '{name}' is not downloaded: accept the licence on "
                    f"https://huggingface.co/{MODEL_SPECS[name]['repo']} and download it from Remiqora's "
                    f"Stable Audio page or with `python -m sa3_server.download {name}`"
                )
            while len(self._models) >= self.max_resident:
                evicted, model = self._models.popitem(last=False)
                log.info("unloading %s", evicted)
                del model
                self._free()
            from stable_audio_3 import StableAudioModel

            self._disable_flash_attention_if_unusable()

            self._loading = name
            t0 = time.time()
            try:
                model = StableAudioModel.from_pretrained(name, device=self.device)
            finally:
                self._loading = None
            self._models[name] = model
            log.info("loaded %s in %.1fs", name, time.time() - t0)
            return model

    def unload_all(self) -> None:
        with self._lock:
            self._models.clear()
            self._free()

    @staticmethod
    def _free() -> None:
        import gc

        gc.collect()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()

    def device_name(self) -> str:
        if self.device:
            return self.device
        if torch.cuda.is_available():
            return "cuda"
        if getattr(torch.backends, "mps", None) and torch.backends.mps.is_available():
            return "mps"
        return "cpu"

    # ---- generation ----
    def run(self, job: Job) -> None:
        req = job.request
        name = req["model"]
        job.stage = "loading_model"
        model = self.load(name)
        sr = int(model.model_config["sample_rate"])
        steps = int(req["steps"])
        seed = int(req["seed"])
        if seed < 0:
            seed = random.randint(0, 2**31 - 1)
        job.seed = seed

        def on_step(info: dict[str, Any]) -> None:
            if job.cancel_event.is_set():
                raise JobCancelled()
            job.stage = "sampling"
            job.progress = min(99, int(round((info.get("i", 0) + 1) / steps * 95)))

        batch = int(req["batch_size"])
        prompt = req["prompt"]
        negative = req.get("negative_prompt") or None
        # One text for the batch, or one per variant (a list the length of the batch).
        if isinstance(prompt, list) and len(prompt) == 1:
            prompt = prompt[0]
        if isinstance(negative, list):
            negative = negative[0] if len(negative) == 1 else negative
            if isinstance(negative, list) and not any(negative):
                negative = None
        kwargs: dict[str, Any] = {
            "prompt": prompt,
            "negative_prompt": negative,
            "duration": float(req["duration"]),
            # generate() clamps the audio length to sample_size, whose default is 120 s; the checkpoint's
            # own limit (380 s for medium) lives in its config, the same value the upstream CLI passes.
            "sample_size": int(model.model_config["sample_size"]),
            "steps": steps,
            "cfg_scale": float(req["cfg_scale"]),
            "seed": seed,
            "batch_size": batch,
            "callback": on_step,
            "disable_tqdm": True,
        }
        if req.get("chunked_decode") is not None:
            kwargs["chunked_decode"] = bool(req["chunked_decode"])
        # The sampler and the guidance, when set; generate() hands the last three to the model's forward().
        if req.get("sampler_type"):
            kwargs["sampler_type"] = req["sampler_type"]
        if req.get("apg_scale") is not None:
            kwargs["apg_scale"] = float(req["apg_scale"])
        if req.get("duration_padding") is not None:
            kwargs["duration_padding_sec"] = float(req["duration_padding"])
        if req.get("cfg_interval") is not None:
            kwargs["cfg_interval"] = tuple(float(x) for x in req["cfg_interval"])
        if req.get("scale_phi") is not None:
            kwargs["scale_phi"] = float(req["scale_phi"])
        if req.get("cfg_norm_threshold") is not None:
            kwargs["cfg_norm_threshold"] = float(req["cfg_norm_threshold"])

        task = req["task"]
        if task == "a2a":
            kwargs["init_audio"] = job.audio
            kwargs["init_noise_level"] = float(req["init_noise_level"])
        elif task == "inpaint":
            kwargs["inpaint_audio"] = job.audio
            kwargs["inpaint_mask_start_seconds"] = [float(x) for x in req["mask_start"]]
            kwargs["inpaint_mask_end_seconds"] = [float(x) for x in req["mask_end"]]

        job.stage = "encoding"
        if job.cancel_event.is_set():
            raise JobCancelled()
        with torch.inference_mode():
            audio = model.generate(**kwargs)  # [B, C, N] float32 in [-1, 1]
        job.stage = "decoding"
        job.progress = 97
        if job.cancel_event.is_set():
            raise JobCancelled()

        if task == "a2a":
            audio = trim_to_seconds(audio, float(req["duration"]), sr)

        files: list[str] = []
        durations: list[float] = []
        for i in range(audio.shape[0]):
            fname = f"{job.id}_{i}.wav"
            clip = audio[i]
            if task == "text" and req.get("trim_silence"):
                clip = trim_leading_silence(clip, sr)
            durations.append(write_wav(self.out_dir / fname, clip, sr))
            files.append(f"/v1/files/{fname}")
        job.files = files
        job.durations = durations
        del audio
        self._free()
