#!/usr/bin/env bash
# The container's start: the data folders, YuE2's weights on the first start, then the server.
set -euo pipefail
cd /opt/remiqora

mkdir -p /data/app /data/logs /data/hf /data/torch /data/cache/uv /data/models/yue2 /data/models/ace-step

# YuE2, SheetSage2 and MuScriptor weights (about 10 GB with both precisions; the default q8_0 is smaller). The model
# manager skips what is already there and resumes what was interrupted. YUE2_SKIP_WEIGHTS=1 leaves them out.
if [[ "${YUE2_SKIP_WEIGHTS:-0}" != "1" ]]; then
  packages="yue2_vae_f16 sheetsage2_orig muscriptor_small_f32"
  for p in ${YUE2_PRECISIONS//,/ }; do packages="yue2_main_$p $packages"; done
  for pkg in $packages; do
    if ! ls /data/models/yue2/*/".audiocpp-package-$pkg.json" >/dev/null 2>&1; then
      echo "[remiqora] downloading $pkg ..."
      (cd external/audio.cpp && python3 tools/model_manager_v2.py install "$pkg") \
        || echo "[remiqora] $pkg did not download; YuE2 will be missing it. Restart the container to try again."
    fi
  done
fi

# backend/.env from the image's build points at the engines inside it; the paths below override only what moved
export ACE_STEP_DIR=/opt/remiqora/external/ACE-Step-1.5 YUE2_DIR=/opt/remiqora/external/audio.cpp
export DEMUCS_DIR=/opt/remiqora/external/Demucs STABLE_AUDIO_DIR=/opt/remiqora/external/sa3-server
export FFMPEG_BIN_DIR=/usr/bin CUDA_BIN_DIR=/usr/local/cuda/bin CUDA_LIB_DIR=/usr/local/cuda/lib64

echo "[remiqora] starting on http://${REMIQORA_HOST}:${REMIQORA_PORT} (image ${IMAGE_VERSION:-dev})"
cd backend
# exec: the server is the container's main process (tini passes it SIGTERM, the orchestrator stops the engines)
exec .venv/bin/python3 -m uvicorn app.main:app --host "$REMIQORA_HOST" --port "$REMIQORA_PORT" --no-access-log
