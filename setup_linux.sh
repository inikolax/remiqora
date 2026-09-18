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
AUDIOCPP_REF="${AUDIOCPP_REF:-542bb4ea2a18273e96b3237e5f1f6941df148d9f}"
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

init_repo() {
  local name="$1" url="$2" ref="$3" patch="${4:-}"
  local dir="$EXTERNAL_DIR/$name"
  if [[ ! -d "$dir/.git" ]]; then
    git clone "$url" "$dir"
  fi
  git -C "$dir" fetch origin
  git -C "$dir" checkout --detach "$ref"
  if [[ -n "$patch" ]]; then
    if git -C "$dir" apply --check "$patch" >/dev/null 2>&1; then
      git -C "$dir" apply --whitespace=nowarn "$patch"
    elif git -C "$dir" apply --reverse --check "$patch" >/dev/null 2>&1; then
      echo "Patch already applied: $(basename "$patch")"
    else
      echo "Patch cannot be applied cleanly: $patch" >&2
      exit 3
    fi
  fi
  printf "%s\n" "$dir"
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
(
  cd "$AUDIOCPP_DIR"
  for pkg in yue2_main_q8_0 yue2_main_q4_0 yue2_vae_f16 sheetsage2_orig muscriptor_small_f32; do
    "$PYTHON_BIN" tools/model_manager_v2.py install "$pkg"
  done
)

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

step "Backend environment"
FFMPEG_BIN_DIR="$(dirname "$(command -v ffmpeg)")"
CUDA_BIN_DIR="$(dirname "$(command -v "$NVCC_BIN")")"
CUDA_LIB_DIR="${CUDA_LIB_DIR:-$(cd "$CUDA_BIN_DIR/.." && pwd)/lib}"
YUE2_DEVICE="${YUE2_DEVICE:-}"
ACE_STEP_DEVICE="${ACE_STEP_DEVICE:-}"
cat > "$ROOT/backend/.env" <<ENV
ACE_STEP_DIR=$ACE_DIR
YUE2_DIR=$AUDIOCPP_DIR
DEMUCS_DIR=$DEMUCS_DIR
FFMPEG_BIN_DIR=$FFMPEG_BIN_DIR
CUDA_BIN_DIR=$CUDA_BIN_DIR
CUDA_LIB_DIR=$CUDA_LIB_DIR
UV_BIN=$UV_BIN
ACE_STEP_DEVICE=$ACE_STEP_DEVICE
YUE2_SERVER_HOST=127.0.0.1
YUE2_SERVER_PORT=$YUE2_PORT
YUE2_DEVICE=$YUE2_DEVICE
ENV

echo "Wrote $ROOT/backend/.env"
echo "Linux model setup complete."
