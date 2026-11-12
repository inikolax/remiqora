# Remiqora in a container: the web app and every engine (ACE-Step 1.5, YuE2 built with CUDA, Demucs, Stable Audio 3,
# the prompt assistant) for a Linux host with an NVIDIA GPU and the NVIDIA Container Toolkit. No weights inside:
# they live in the /data volume (docker/entrypoint.sh fetches YuE2's on the first start, ACE-Step downloads its own on
# the first generation, the others come from the app's Models page).
#   docker compose up -d --build        (compose.yaml, from the repository's root)
ARG CUDA_VERSION=13.3.0

# ---------------------------------------------------------------- build: engines, environments, the page
FROM nvidia/cuda:${CUDA_VERSION}-devel-ubuntu24.04 AS build
ENV DEBIAN_FRONTEND=noninteractive PYTHONUNBUFFERED=1
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates curl git python3 python3-venv python3-pip build-essential cmake ninja-build pkg-config ffmpeg \
    && curl -fsSL https://deb.nodesource.com/setup_22.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*
COPY --from=ghcr.io/astral-sh/uv:0.13.7 /uv /usr/local/bin/uv

WORKDIR /opt/remiqora
COPY . .
# every uv environment in one layer, hard-linked from one cache that is removed afterwards: the torch they share is
# stored once in the image
ENV UV_CACHE_DIR=/opt/uv-cache UV_LINK_MODE=hardlink UV_PYTHON_DOWNLOADS=never
RUN SKIP_WEIGHTS=1 bash setup_linux.sh \
    # hf_xet: ACE-Step's models are on Xet storage; without it huggingface_hub downloads them about 80 times slower
    && uv pip install --python external/ACE-Step-1.5/.venv/bin/python hf_xet \
    && rm -rf /opt/uv-cache external/audio.cpp/build/linux-cuda-release/CMakeFiles external/audio.cpp/.git external/ACE-Step-1.5/.git
RUN python3 -m venv backend/.venv \
    && backend/.venv/bin/pip install --no-cache-dir -r backend/requirements.txt \
    && cd frontend && npm ci --no-audit --no-fund && npm run build && rm -rf node_modules

# ---------------------------------------------------------------- the image
FROM nvidia/cuda:${CUDA_VERSION}-runtime-ubuntu24.04
ENV DEBIAN_FRONTEND=noninteractive PYTHONUNBUFFERED=1
# python3: every environment above was made from Ubuntu's Python 3.12 at /usr/bin; ffmpeg for audio; libgomp for YuE2
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates python3 ffmpeg libgomp1 tini \
    && rm -rf /var/lib/apt/lists/*
COPY --from=ghcr.io/astral-sh/uv:0.13.7 /uv /usr/local/bin/uv
COPY --from=build /opt/remiqora /opt/remiqora
WORKDIR /opt/remiqora

ARG IMAGE_VERSION=dev
# Everything that changes lives under /data: the library and settings, logs, the weights of every engine, the caches.
# UV_NO_SYNC: `uv run` uses the environments as they were built, without a network check on every start.
ENV REMIQORA_DATA_DIR=/data/app REMIQORA_LOG_DIR=/data/logs HF_HOME=/data/hf TORCH_HOME=/data/torch \
    UV_CACHE_DIR=/data/cache/uv UV_NO_SYNC=1 UV_PYTHON_DOWNLOADS=never \
    REMIQORA_HOST=0.0.0.0 REMIQORA_PORT=9000 YUE2_PRECISIONS=q8_0 IMAGE_VERSION=${IMAGE_VERSION}
RUN rm -rf external/audio.cpp/models external/ACE-Step-1.5/checkpoints \
    && ln -s /data/models/yue2 external/audio.cpp/models \
    && ln -s /data/models/ace-step external/ACE-Step-1.5/checkpoints \
    && sed -i 's/\r$//' docker/entrypoint.sh
EXPOSE 9000
VOLUME /data
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s CMD python3 -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:9000/api/orchestrator/status', timeout=4)"
ENTRYPOINT ["/usr/bin/tini", "--", "bash", "/opt/remiqora/docker/entrypoint.sh"]
