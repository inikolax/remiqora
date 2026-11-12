#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXTERNAL_DIR="$ROOT/external"
PATCHES_DIR="$EXTERNAL_DIR/patches"
PYTHON_BIN="${PYTHON_BIN:-python3}"
UV_BIN="${UV_BIN:-uv}"
NODE_BIN="${NODE_BIN:-node}"
NPM_BIN="${NPM_BIN:-npm}"
CMAKE_BIN="${CMAKE_BIN:-cmake}"
NVCC_BIN="${NVCC_BIN:-nvcc}"
STABLE_AUDIO_MODELS="${STABLE_AUDIO_MODELS:-}"
AUDIOCPP_REF="${AUDIOCPP_REF:-39f9013}"
ACE_STEP_REF="${ACE_STEP_REF:-ca1e85f}"
YUE2_PORT="${YUE2_SERVER_PORT:-8080}"

step() { printf "\n== %s ==\n" "$1"; }
need() { command -v "$1" >/dev/null 2>&1 || { echo "[MISSING] $1" >&2; return 1; }; }

if [[ "$(uname -s)" != "Linux" ]]; then
  echo "setup_linux.sh is for Linux hosts." >&2
  exit 1
fi

step "Prerequisite check"
missing=0
for cmd in git "$PYTHON_BIN" "$UV_BIN" "$NODE_BIN" "$NPM_BIN" "$CMAKE_BIN" ffmpeg; do
  if need "$cmd"; then printf "[OK] %s -> %s\n" "$cmd" "$(command -v "$cmd")"; else missing=1; fi
done
if ! command -v "$NVCC_BIN" >/dev/null 2>&1; then
  echo "[MISSING] $NVCC_BIN (CUDA toolkit compiler)" >&2
  missing=1
else
  echo "[OK] $NVCC_BIN -> $(command -v "$NVCC_BIN")"
fi
if [[ "$missing" == "1" ]]; then
  echo "Install the missing prerequisites, then re-run. No model setup was performed." >&2
  exit 2
fi

mkdir -p "$EXTERNAL_DIR"

# Clones (once) and checks out a pinned commit, applies our patch, prints the folder on stdout (everything else goes
# to stderr: the caller captures stdout as the path). The marker holds the hash of the applied patch, so a newer patch
# is applied again on the next run: the files the old one added are removed, tracked files go back to the pinned
# commit, untracked folders (checkpoints, .venv, LoRAs) stay.
init_repo() {
  local name="$1" url="$2" ref="$3" patch="${4:-}"
  local dir="$EXTERNAL_DIR/$name"
  local marker="$dir/.remiqora-setup-done"
  local wanted="nopatch" applied=""
  [[ -n "$patch" ]] && wanted="$(sha1sum "$patch" | cut -c1-12)"
  if [[ ! -d "$dir/.git" ]]; then
    git clone -q "$url" "$dir" >&2
  fi
  [[ -f "$marker" ]] && applied="$(tr -d '
 ' < "$marker")"
  if [[ "$applied" == "$wanted" ]]; then
    echo "Already checked out and patched: $name" >&2
    printf "%s
" "$dir"
    return
  fi
  if [[ -n "$patch" ]]; then
    awk '/^diff --git /{f=substr($4,3); n=NR; next} NR==n+1 && /^new file mode/{print f}' "$patch" |
      while IFS= read -r rel; do rm -f "$dir/$rel"; done
  fi
  if ! git -C "$dir" -c advice.detachedHead=false checkout -q --force --detach "$ref" >&2 2>/dev/null; then
    git -C "$dir" fetch -q origin >&2
    git -C "$dir" -c advice.detachedHead=false checkout -q --force --detach "$ref" >&2
  fi
  if [[ -n "$patch" ]]; then
    if ! git -C "$dir" apply --whitespace=nowarn "$patch" >&2; then
      echo "Patch cannot be applied cleanly: $patch" >&2
      exit 3
    fi
    echo "Applied $(basename "$patch")" >&2
  fi
  printf "%s" "$wanted" > "$marker"
  printf "%s
" "$dir"
}

step "ACE-Step 1.5"
ACE_DIR="$(init_repo ACE-Step-1.5 https://github.com/ace-step/ACE-Step-1.5.git "$ACE_STEP_REF" "$PATCHES_DIR/ace-step.patch")"
(
  cd "$ACE_DIR"
  "$UV_BIN" sync
)

step "audio.cpp / YuE2"
AUDIOCPP_DIR="$(init_repo audio.cpp https://github.com/0xShug0/audio.cpp.git "$AUDIOCPP_REF")"
CUDA_TOOLKIT_PREFIX="${CUDA_TOOLKIT_PREFIX:-$(cd "$(dirname "$(command -v "$NVCC_BIN")")/.." && pwd)}"
for header in cublas_v2.h cufft.h; do
  if [[ ! -f "$CUDA_TOOLKIT_PREFIX/include/$header" ]]; then
    echo "[MISSING] $CUDA_TOOLKIT_PREFIX/include/$header" >&2
    echo "Install the matching CUDA development package (cuBLAS/cuFFT dev headers) for this toolkit." >&2
    exit 4
  fi
done
(
  cd "$AUDIOCPP_DIR"
  chmod +x scripts/build_linux.sh
  export CUDACXX="$(command -v "$NVCC_BIN")"
  export CMAKE_PREFIX_PATH="$CUDA_TOOLKIT_PREFIX${CMAKE_PREFIX_PATH:+:$CMAKE_PREFIX_PATH}"
  export CMAKE_LIBRARY_PATH="$CUDA_TOOLKIT_PREFIX/lib${CMAKE_LIBRARY_PATH:+:$CMAKE_LIBRARY_PATH}"
  export CPLUS_INCLUDE_PATH="$CUDA_TOOLKIT_PREFIX/include${CPLUS_INCLUDE_PATH:+:$CPLUS_INCLUDE_PATH}"
  export C_INCLUDE_PATH="$CUDA_TOOLKIT_PREFIX/include${C_INCLUDE_PATH:+:$C_INCLUDE_PATH}"
  ./scripts/build_linux.sh \
    --backend cuda \
    --build-dir build/linux-cuda-release \
    --model-set custom \
    --models "yue2,sheetsage2,muscriptor" \
    --native-model-manager \
    --target audiocpp_server
)

step "YuE2 / SheetSage2 / MuScriptor weights"
# SKIP_WEIGHTS=1 leaves them out (the Docker image fetches them on its first start, into its volume)
if [[ "${SKIP_WEIGHTS:-0}" == "1" ]]; then
  echo "Skipped (SKIP_WEIGHTS=1)."
else
  (
    cd "$AUDIOCPP_DIR"
    for pkg in yue2_main_q8_0 yue2_main_q4_0 yue2_vae_f16 sheetsage2_orig muscriptor_small_f32; do
      "$PYTHON_BIN" tools/model_manager_v2.py install "$pkg"
    done
  )
fi

step "Demucs"
DEMUCS_DIR="$EXTERNAL_DIR/Demucs"
mkdir -p "$DEMUCS_DIR"
cat > "$DEMUCS_DIR/pyproject.toml" <<"PYPROJECT"
[project]
name = "demucs-runner"
version = "0.1.0"
requires-python = ">=3.11,<3.13"
dependencies = [
  "demucs>=4.0.1",
  "numpy>=1.26.4",
  "torch>=2.10.0",
]

[tool.uv]
package = false

[[tool.uv.index]]
name = "pytorch-cu128"
url = "https://download.pytorch.org/whl/cu128"
explicit = true

[tool.uv.sources]
torch = { index = "pytorch-cu128" }
PYPROJECT
(
  cd "$DEMUCS_DIR"
  "$UV_BIN" sync
)

step "Stable Audio 3 (sa3-server)"
# Our HTTP server around Stability's stable-audio-3 package (tracked in external/sa3-server).
# The weights go to the Hugging Face cache: download them from the app (the Stable Audio 3 page,
# which also takes a Hugging Face token), or set STABLE_AUDIO_MODELS="medium small-sfx" to fetch
# them here. medium, small-music and small-sfx are gated: accept the licence on their
# huggingface.co pages and save a token first ("external/sa3-server/.venv/bin/hf auth login").
STABLE_AUDIO_DIR="$EXTERNAL_DIR/sa3-server"
if [[ -f "$STABLE_AUDIO_DIR/pyproject.toml" ]]; then
  (
    cd "$STABLE_AUDIO_DIR"
    "$UV_BIN" sync
    for model in ${STABLE_AUDIO_MODELS//,/ }; do
      echo "Downloading the Stable Audio 3 checkpoint '$model' ..."
      .venv/bin/python -m sa3_server.download "$model"         || echo "Could not download '$model' (see the error above). Download it later from the app's Stable Audio 3 page."
    done
  )
else
  echo "external/sa3-server is missing from this checkout - skipping Stable Audio 3."
fi

step "Prompt assistant"
# A local language model that writes each engine's prompt from an idea (external/prompt-assistant, run in
# place). Its model comes from the app's Models page, or PROMPT_ASSISTANT_MODEL=Qwen/Qwen3.5-2B here.
ASSISTANT_DIR="$EXTERNAL_DIR/prompt-assistant"
if [[ -f "$ASSISTANT_DIR/pyproject.toml" ]]; then
  (
    cd "$ASSISTANT_DIR"
    "$UV_BIN" sync
    if [[ -n "${PROMPT_ASSISTANT_MODEL:-}" ]]; then
      .venv/bin/python -m prompt_assistant.download "$PROMPT_ASSISTANT_MODEL"
    fi
  )
else
  echo "external/prompt-assistant is missing from this checkout - skipping the prompt assistant."
fi

step "Backend environment"
FFMPEG_BIN_DIR="$(dirname "$(command -v ffmpeg)")"
CUDA_BIN_DIR="$(dirname "$(command -v "$NVCC_BIN")")"
# NVIDIA's packages put the libraries in lib64 (lib is missing or a stub there)
CUDA_PREFIX="$(cd "$CUDA_BIN_DIR/.." && pwd)"
if [[ -z "${CUDA_LIB_DIR:-}" ]]; then
  if [[ -d "$CUDA_PREFIX/lib64" ]]; then CUDA_LIB_DIR="$CUDA_PREFIX/lib64"; else CUDA_LIB_DIR="$CUDA_PREFIX/lib"; fi
fi
YUE2_DEVICE="${YUE2_DEVICE:-}"
ACE_STEP_DEVICE="${ACE_STEP_DEVICE:-}"
STABLE_AUDIO_DEVICE="${STABLE_AUDIO_DEVICE:-}"
cat > "$ROOT/backend/.env" <<ENV
ACE_STEP_DIR=$ACE_DIR
YUE2_DIR=$AUDIOCPP_DIR
DEMUCS_DIR=$DEMUCS_DIR
STABLE_AUDIO_DIR=$STABLE_AUDIO_DIR
FFMPEG_BIN_DIR=$FFMPEG_BIN_DIR
CUDA_BIN_DIR=$CUDA_BIN_DIR
CUDA_LIB_DIR=$CUDA_LIB_DIR
UV_BIN=$UV_BIN
ACE_STEP_DEVICE=$ACE_STEP_DEVICE
YUE2_SERVER_HOST=127.0.0.1
YUE2_SERVER_PORT=$YUE2_PORT
YUE2_DEVICE=$YUE2_DEVICE
STABLE_AUDIO_DEVICE=$STABLE_AUDIO_DEVICE
ENV

echo "Wrote $ROOT/backend/.env"
echo "Linux model setup complete."
