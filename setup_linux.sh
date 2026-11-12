#!/usr/bin/env bash
# Remiqora from source on Linux with an NVIDIA GPU: clones ACE-Step 1.5 and audio.cpp (YuE2), applies our patch,
# builds YuE2 with CUDA, downloads its weights, sets up Demucs, Stable Audio 3 and the prompt assistant, and writes
# backend/.env. Run it again any time: what is done is skipped, a newer ACE-Step patch is applied again.
#   SKIP_WEIGHTS=1               leave out YuE2's weights (to download them later)
#   STABLE_AUDIO_MODELS="medium small-sfx"   Stable Audio 3 checkpoints to download now (or later in the app)
#   PROMPT_ASSISTANT_MODEL=Qwen/Qwen3.5-2B   the assistant's model to download now (or later on the Models page)
#   ACE_BASE=1                   download the ACE-Step base model for the AI arranger without asking
#   REMIQORA_LANG=ru|en          the language of the messages
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXTERNAL_DIR="$ROOT/external"
PATCHES_DIR="$EXTERNAL_DIR/patches"
LOGS_DIR="$ROOT/backend/logs/setup"
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

# shellcheck source=scripts/console.sh
source "$ROOT/scripts/console.sh"
select_language
banner "$(t 'Установка движков и моделей' 'Installing the engines and models')"

if [[ "$(uname -s)" != "Linux" ]]; then
  fail "$(t 'setup_linux.sh — для Linux. На macOS: setup_models.sh, на Windows: install.bat.' 'setup_linux.sh is for Linux. On macOS: setup_models.sh, on Windows: install.bat.')"
  exit 1
fi

# A failure ends in one clear red line and where to read more
on_error() {
  local code=$?
  printf '\n'
  fail "$(t "Установка остановилась (код $code)." "The install stopped (code $code).")"
  note "$(t "Подробности — в журналах: $LOGS_DIR. Запустите скрипт ещё раз: готовое не делается заново." "Details are in the logs: $LOGS_DIR. Run the script again: what is done stays done.")"
  wait_close
  exit "$code"
}
trap on_error ERR

# run_step "what" log-name command... : one engine step with a live line, its full output in the log
run_step() {
  local what="$1" log="$LOGS_DIR/$2.log"; shift 2
  if ! run_quiet "$what" "$log" "$@"; then
    tail -n 30 "$log" | sed 's/^/    /' >&2
    fail "$(t "Не получилось: $what" "Failed: $what")"
    note "$(t "Весь вывод: $log" "Full output: $log")"
    return 1
  fi
}

# ---------------------------------------------------------------- tools
step "$(t 'Проверка инструментов' 'Checking the tools')"
missing=()
for cmd in git "$PYTHON_BIN" "$UV_BIN" "$NODE_BIN" "$NPM_BIN" "$CMAKE_BIN" ffmpeg "$NVCC_BIN"; do
  if command -v "$cmd" >/dev/null 2>&1; then
    ok "$(printf '%-8s' "$cmd") $(dim "$(command -v "$cmd")")"
  else
    missing+=("$cmd")
  fi
done
if (( ${#missing[@]} )); then
  fail "$(t "Не найдено: ${missing[*]}" "Not found: ${missing[*]}")"
  note "$(t 'Поставьте их (nvcc — из CUDA Toolkit) и запустите скрипт ещё раз. Ничего не установлено.' 'Install them (nvcc comes with the CUDA Toolkit) and run the script again. Nothing was installed.')"
  wait_close
  exit 2
fi
mkdir -p "$EXTERNAL_DIR" "$LOGS_DIR"

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
    note "$(t 'Клонирую' 'Cloning') $url" >&2
    git clone -q "$url" "$dir" >&2
  fi
  [[ -f "$marker" ]] && applied="$(tr -d '\r\n ' < "$marker")"
  if [[ "$applied" == "$wanted" ]]; then
    if [[ -n "$patch" ]]; then ok "$(t 'Исходники на месте, патч применён' 'The source is in place, the patch applied')" >&2
    else ok "$(t 'Исходники на месте' 'The source is in place')" >&2; fi
    printf '%s\n' "$dir"
    return
  fi
  if [[ -n "$applied" && -n "$patch" ]]; then
    note "$(t 'Вышла новая версия патча: накладываю заново (окружение и модели остаются).' 'A newer patch: applying it again (the environment and the models stay).')" >&2
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
      fail "$(t "Патч не наложился: $patch" "The patch did not apply: $patch")"
      exit 3
    fi
  fi
  printf '%s' "$wanted" > "$marker"
  ok "$(t "Версия $ref готова" "Version $ref is ready")" >&2
  printf '%s\n' "$dir"
}

sync_project() {   # sync_project dir "name" log-name
  run_step "$(t "Окружение Python для $2 (с PyTorch для CUDA, может занять время)" "The Python environment for $2 (with PyTorch for CUDA, this can take a while)")" "$3" \
    bash -c 'cd "$1" && "$2" sync' _ "$1" "$UV_BIN"
  ok "$(t "Окружение $2 готово" "The $2 environment is ready")"
}

# ---------------------------------------------------------------- ACE-Step
step 'ACE-Step 1.5'
ACE_DIR="$(init_repo ACE-Step-1.5 https://github.com/ace-step/ACE-Step-1.5.git "$ACE_STEP_REF" "$PATCHES_DIR/ace-step.patch")"
sync_project "$ACE_DIR" ACE-Step ace-step

# ---------------------------------------------------------------- YuE2
step 'YuE2 (audio.cpp)'
AUDIOCPP_DIR="$(init_repo audio.cpp https://github.com/0xShug0/audio.cpp.git "$AUDIOCPP_REF")"
CUDA_TOOLKIT_PREFIX="${CUDA_TOOLKIT_PREFIX:-$(cd "$(dirname "$(command -v "$NVCC_BIN")")/.." && pwd)}"
for header in cublas_v2.h cufft.h; do
  if [[ ! -f "$CUDA_TOOLKIT_PREFIX/include/$header" ]]; then
    fail "$(t "Нет $CUDA_TOOLKIT_PREFIX/include/$header" "Missing $CUDA_TOOLKIT_PREFIX/include/$header")"
    note "$(t 'Поставьте пакеты разработки cuBLAS и cuFFT для этой версии CUDA Toolkit.' 'Install the cuBLAS and cuFFT development packages for this CUDA Toolkit.')"
    exit 4
  fi
done
if [[ -x "$AUDIOCPP_DIR/build/linux-cuda-release/bin/audiocpp_server" && "${REBUILD_YUE2:-0}" != 1 ]]; then
  ok "$(t 'audiocpp_server уже собран' 'audiocpp_server is already built') $(dim '(REBUILD_YUE2=1 — заново / to rebuild)')"
else
  build_yue2() {
    cd "$AUDIOCPP_DIR"
    chmod +x scripts/build_linux.sh
    export CUDACXX
    CUDACXX="$(command -v "$NVCC_BIN")"
    export CMAKE_PREFIX_PATH="$CUDA_TOOLKIT_PREFIX${CMAKE_PREFIX_PATH:+:$CMAKE_PREFIX_PATH}"
    export CMAKE_LIBRARY_PATH="$CUDA_TOOLKIT_PREFIX/lib${CMAKE_LIBRARY_PATH:+:$CMAKE_LIBRARY_PATH}"
    export CPLUS_INCLUDE_PATH="$CUDA_TOOLKIT_PREFIX/include${CPLUS_INCLUDE_PATH:+:$CPLUS_INCLUDE_PATH}"
    export C_INCLUDE_PATH="$CUDA_TOOLKIT_PREFIX/include${C_INCLUDE_PATH:+:$C_INCLUDE_PATH}"
    ./scripts/build_linux.sh --backend cuda --build-dir build/linux-cuda-release --model-set custom \
      --models "yue2,sheetsage2,muscriptor" --native-model-manager --target audiocpp_server
  }
  run_step "$(t 'Сборка audiocpp_server с CUDA (yue2 + sheetsage2 + muscriptor), 5–15 минут' 'Building audiocpp_server with CUDA (yue2 + sheetsage2 + muscriptor), 5-15 minutes')" yue2-build \
    bash -c "$(declare -f build_yue2); AUDIOCPP_DIR='$AUDIOCPP_DIR' NVCC_BIN='$NVCC_BIN' CUDA_TOOLKIT_PREFIX='$CUDA_TOOLKIT_PREFIX' build_yue2"
  ok "$(t 'audiocpp_server собран' 'audiocpp_server is built')"
fi

step "$(t 'Модели YuE2, SheetSage2, MuScriptor (~10 ГБ)' 'YuE2, SheetSage2, MuScriptor models (~10 GB)')"
if [[ "${SKIP_WEIGHTS:-0}" == "1" ]]; then
  note "$(t 'Пропущено (SKIP_WEIGHTS=1).' 'Skipped (SKIP_WEIGHTS=1).')"
else
  for pkg in yue2_main_q8_0 yue2_main_q4_0 yue2_vae_f16 sheetsage2_orig muscriptor_small_f32; do
    run_step "$pkg" "weights-$pkg" bash -c 'cd "$1" && "$2" tools/model_manager_v2.py install "$3"' _ "$AUDIOCPP_DIR" "$PYTHON_BIN" "$pkg"
    ok "$pkg"
  done
fi

# ---------------------------------------------------------------- Demucs
step "$(t 'Demucs — разделение на стемы' 'Demucs — stem separation')"
# torch from PyTorch's cu128 index (plain PyPI has a CPU-only wheel), requires-python in ACE-Step's range (newer
# Pythons fall back to the CPU wheel), numpy because demucs imports it without declaring it
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
sync_project "$DEMUCS_DIR" Demucs demucs

# ---------------------------------------------------------------- Stable Audio 3
step 'Stable Audio 3'
# Our server around Stability's stable-audio-3 package (external/sa3-server). medium, small-music and small-sfx are
# gated: accept the licence on huggingface.co and save a token (in the app, or "external/sa3-server/.venv/bin/hf auth
# login"). The -base checkpoints are open.
STABLE_AUDIO_DIR="$EXTERNAL_DIR/sa3-server"
if [[ -f "$STABLE_AUDIO_DIR/pyproject.toml" ]]; then
  sync_project "$STABLE_AUDIO_DIR" 'Stable Audio 3' stable-audio
  for model in ${STABLE_AUDIO_MODELS//,/ }; do
    if run_step "$(t 'Скачиваю' 'Downloading') $model" "stable-audio-$model" "$STABLE_AUDIO_DIR/.venv/bin/python" -m sa3_server.download "$model"; then
      ok "$model"
    else
      warn "$(t "Не скачалось: $model. Его можно скачать позже на странице Stable Audio 3." "Not downloaded: $model. Download it later on the Stable Audio 3 page.")"
    fi
  done
  [[ -z "$STABLE_AUDIO_MODELS" ]] && note "$(t 'Веса скачиваются в приложении, на странице Stable Audio 3.' 'The weights are downloaded in the app, on the Stable Audio 3 page.')"
else
  warn "$(t 'В этой копии нет external/sa3-server: Stable Audio 3 пропущен.' 'external/sa3-server is missing from this checkout: Stable Audio 3 skipped.')"
fi

# ---------------------------------------------------------------- the prompt assistant
step "$(t 'Помощник промтов' 'The prompt assistant')"
ASSISTANT_DIR="$EXTERNAL_DIR/prompt-assistant"
if [[ -f "$ASSISTANT_DIR/pyproject.toml" ]]; then
  sync_project "$ASSISTANT_DIR" "$(t 'помощника' 'the assistant')" prompt-assistant
  if [[ -n "${PROMPT_ASSISTANT_MODEL:-}" ]]; then
    run_step "$(t 'Скачиваю' 'Downloading') $PROMPT_ASSISTANT_MODEL" prompt-assistant-model "$ASSISTANT_DIR/.venv/bin/python" -m prompt_assistant.download "$PROMPT_ASSISTANT_MODEL"
    ok "$PROMPT_ASSISTANT_MODEL"
  else
    note "$(t 'Его модель скачивается в приложении, на странице «Модели».' 'Its model is downloaded in the app, on the Models page.')"
  fi
else
  warn "$(t 'В этой копии нет external/prompt-assistant: помощник пропущен.' 'external/prompt-assistant is missing from this checkout: the assistant skipped.')"
fi

# ---------------------------------------------------------------- the ACE-Step base model
step "$(t 'Base-модель ACE-Step для ИИ-аранжировщика (~4,8 ГБ)' 'The ACE-Step base model for the AI arranger (~4.8 GB)')"
base_dir="$ACE_DIR/checkpoints/acestep-v15-base"
if [[ -f "$base_dir/model.safetensors" ]] && ! ls "$base_dir"/.cache/huggingface/download/*.incomplete >/dev/null 2>&1; then
  ok "$(t 'Уже скачана' 'Already downloaded')"
elif [[ "${SKIP_WEIGHTS:-0}" == "1" ]]; then
  note "$(t 'Пропущено.' 'Skipped.')"
else
  want="${ACE_BASE:-}"
  if [[ -z "$want" ]]; then
    answer="$(ask "$(t 'Скачать сейчас? Без неё не работает «Добавить партию» (y/N)' 'Download it now? "Add a part" needs it (y/N)')" N)"
    [[ "$answer" =~ ^[yYдД] ]] && want=1 || want=0
  fi
  if [[ "$want" == 1 ]]; then
    # --with hf_xet: the models are on Xet storage, plain HTTP was ~80 times slower; --force resumes a half download
    run_step "$(t 'Скачиваю base-модель' 'Downloading the base model')" ace-base \
      bash -c 'cd "$1" && "$2" run --with hf_xet acestep-download --force --model acestep-v15-base' _ "$ACE_DIR" "$UV_BIN"
    ok "$(t 'Скачана' 'Downloaded')"
  else
    note "$(t 'Позже: ACE_BASE=1 ./setup_linux.sh, или скачайте её из приложения.' 'Later: ACE_BASE=1 ./setup_linux.sh, or download it from the app.')"
  fi
fi

# ---------------------------------------------------------------- backend/.env
step "$(t 'Настройки сервера (backend/.env)' 'Server settings (backend/.env)')"
FFMPEG_BIN_DIR="$(dirname "$(command -v ffmpeg)")"
CUDA_BIN_DIR="$(dirname "$(command -v "$NVCC_BIN")")"
# NVIDIA's packages put the libraries in lib64 (lib is missing or a stub there)
CUDA_PREFIX="$(cd "$CUDA_BIN_DIR/.." && pwd)"
if [[ -z "${CUDA_LIB_DIR:-}" ]]; then
  if [[ -d "$CUDA_PREFIX/lib64" ]]; then CUDA_LIB_DIR="$CUDA_PREFIX/lib64"; else CUDA_LIB_DIR="$CUDA_PREFIX/lib"; fi
fi
cat > "$ROOT/backend/.env" <<ENV
ACE_STEP_DIR=$ACE_DIR
YUE2_DIR=$AUDIOCPP_DIR
DEMUCS_DIR=$DEMUCS_DIR
STABLE_AUDIO_DIR=$STABLE_AUDIO_DIR
FFMPEG_BIN_DIR=$FFMPEG_BIN_DIR
CUDA_BIN_DIR=$CUDA_BIN_DIR
CUDA_LIB_DIR=$CUDA_LIB_DIR
UV_BIN=$UV_BIN
ACE_STEP_DEVICE=${ACE_STEP_DEVICE:-}
YUE2_SERVER_HOST=127.0.0.1
YUE2_SERVER_PORT=$YUE2_PORT
YUE2_DEVICE=${YUE2_DEVICE:-}
STABLE_AUDIO_DEVICE=${STABLE_AUDIO_DEVICE:-}
ENV
ok "$(t 'Записан backend/.env' 'Wrote backend/.env')"
info 'ACE_STEP_DIR' "$ACE_DIR"
info 'YUE2_DIR    ' "$AUDIOCPP_DIR"
info 'CUDA_LIB_DIR' "$CUDA_LIB_DIR"

# ---------------------------------------------------------------- done
printf '\n'; rule
printf '  %s %s\n' "$(c "$C_GREEN" '✓' b)" "$(c "$C_GREEN" "$(t 'Установка завершена.' 'Install finished.')" b)"
printf '  %s%s\n' "$(t 'Запуск: ' 'Start: ')" "$(c "$C_CYAN" './prod_run_linux.sh' b)"
note "$(t 'Модели ACE-Step скачаются сами при первой генерации.' "ACE-Step's models download by themselves on the first generation.")"
wait_close
