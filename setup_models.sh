#!/usr/bin/env bash
# Clones ACE-Step-1.5, applies Remiqora's small patch on top (see
# external/patches/README.md) and runs 'uv sync' for it; installs YuE2
# (audiocpp_server) from audio.cpp's own prebuilt macOS/Metal release - no
# compiler needed, see the --from-source flag below for the alternative;
# sets up a Demucs (stem separation) uv project in external/Demucs and the
# Stable Audio 3 server environment (external/sa3-server); and writes
# backend/.env with all of the above plus an auto-detected FFMPEG_BIN_DIR.
# Stable Audio 3 weights are downloaded from the app (its Stable Audio 3
# page), or here with --stable-audio-models=small-music,small-sfx.
# Album covers (stable-diffusion.cpp's sd-server + the Z-Image Turbo weights,
# ~9.5 GB, into external/sdcpp) are installed too; --skip-covers leaves
# them out (the app's Models page can install them later).
#
# Windows equivalent: setup_models.ps1 (which always builds audio.cpp from
# source, CUDA backend, since there's no prebuilt CUDA release - and routes
# Demucs's torch at PyTorch's cu128 wheel index, not needed here since
# ACE-Step-1.5's own pyproject.toml already resolves a plain, MPS-capable
# torch wheel from PyPI on darwin/arm64, same as the plain "torch"
# dependency in the Demucs project below).
#
# Re-run any time - every step is idempotent (skips work that is already done).
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
    echo "This script is for macOS. Use setup_models.ps1 on Windows." >&2
    exit 1
fi
if [[ "$(uname -m)" != "arm64" ]]; then
    echo "This script's prebuilt YuE2 download is Apple Silicon (arm64) only." >&2
    echo "On Intel Macs, pass --from-source (needs full Xcode - see setup_prereqs.sh)." >&2
fi

SKIP_BUILD=0
SKIP_WEIGHTS=0
FROM_SOURCE=0
SKIP_COVERS=0
STABLE_AUDIO_MODELS=""
for arg in "$@"; do
    case "$arg" in
        --skip-build) SKIP_BUILD=1 ;;
        --skip-weights) SKIP_WEIGHTS=1 ;;
        --from-source) FROM_SOURCE=1 ;;
        --skip-covers) SKIP_COVERS=1 ;;
        --stable-audio-models=*) STABLE_AUDIO_MODELS="${arg#*=}" ;;
        *)
            echo "Unknown option: $arg (expected --skip-build / --skip-weights / --from-source / --skip-covers / --stable-audio-models=a,b)" >&2
            exit 1
            ;;
    esac
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXTERNAL_DIR="$ROOT/external"
PATCHES_DIR="$EXTERNAL_DIR/patches"

# Homebrew's python@3.12 is keg-only - it lands on PATH as "python3.12", not
# as the unversioned "python3" (which stays whatever the system default is,
# e.g. Apple's own 3.9). Prefer the Homebrew one when present.
PYTHON_BIN="python3"
command -v python3.12 >/dev/null 2>&1 && PYTHON_BIN="python3.12"

step() { echo ""; echo "== $1 =="; }

assert_command() {
    if ! command -v "$1" >/dev/null 2>&1; then
        echo "[MISSING] '$1' is not on PATH. $2"
        return 1
    fi
    return 0
}

# xcrun itself ships with the standalone Command Line Tools, but the Metal
# shader compiler it dispatches to does not - that one only exists inside
# full Xcode.app (from the App Store), so a bare `command -v xcrun` check
# passes even on a machine that can't actually build audio.cpp's Metal
# backend. Check for the compiler xcrun would resolve instead.
assert_metal_toolchain() {
    if xcrun -f metal >/dev/null 2>&1; then
        return 0
    fi
    echo "[MISSING] Metal shader compiler not found (only Command Line Tools are installed)."
    echo "  1. Install full Xcode from the App Store: https://apps.apple.com/app/xcode/id497799835"
    echo "  2. sudo xcode-select -s /Applications/Xcode.app/Contents/Developer"
    echo "  3. Re-run ./setup_models.sh"
    return 1
}

find_ffmpeg_bin_dir() {
    if command -v ffmpeg >/dev/null 2>&1; then
        dirname "$(command -v ffmpeg)"
    fi
}

# Clones $2 into external/$1 (if not already there), checks out the pinned
# ref $3, and applies patch file $4 (if any) - once, tracked by a marker
# file so re-running this script doesn't try to re-apply an already-applied
# patch. Prints the resulting checkout dir on stdout.
#
# Every fallible step below is checked explicitly with "|| return 1" rather
# than relying on the script's own "set -e" to abort on failure: this
# function's callers capture its stdout via "$(...)" command substitution,
# and bash only applies "set -e" inside a command substitution if
# "shopt -s inherit_errexit" is active (bash >=4.4) - macOS's own /bin/bash
# is the ancient 3.2 and doesn't have it, so without explicit checks here a
# failed "git apply" would be silently swallowed and the marker file would
# still get written, marking a never-actually-patched checkout as done.
init_repo() {
    local dir_name="$1" repo_url="$2" ref_name="$3" patch_file="$4"
    local dir="$EXTERNAL_DIR/$dir_name"
    if [[ ! -d "$dir" ]]; then
        echo "Cloning $repo_url ..." >&2
        git clone "$repo_url" "$dir" >&2 || return 1
    fi

    local marker_file="$dir/.remiqora-setup-done"
    if [[ ! -f "$marker_file" ]]; then
        (
            cd "$dir" || exit 1
            echo "Checking out $ref_name ..." >&2
            if ! git checkout "$ref_name" >&2 2>/dev/null; then
                # Pinned commit isn't reachable yet (e.g. history was
                # rewritten upstream since this ref was pinned) - fetch
                # everything and retry once.
                git fetch origin >&2 || exit 1
                git checkout "$ref_name" >&2 || exit 1
            fi
            if [[ -n "$patch_file" ]]; then
                echo "Applying $(basename "$patch_file") ..." >&2
                git apply --whitespace=nowarn "$patch_file" || exit 1
            fi
            touch "$marker_file"
        ) || return 1
    else
        echo "Already checked out and patched, skipping." >&2
    fi
    echo "$dir"
}

step "ACE-Step-1.5"
ACE_DIR=$(init_repo "ACE-Step-1.5" "https://github.com/ace-step/ACE-Step-1.5.git" "ca1e85f" "$PATCHES_DIR/ace-step.patch") || {
    echo "[ERROR] ACE-Step-1.5 checkout/patch failed - see output above." >&2
    exit 1
}

if assert_command uv "Install it from https://docs.astral.sh/uv/getting-started/installation/"; then
    (
        cd "$ACE_DIR"
        echo "Running 'uv sync' (pulls the MPS-capable torch build for Apple Silicon, can take a while) ..."
        uv sync
    )
else
    echo "Skipped 'uv sync' - install uv and re-run this script."
fi

step "audio.cpp (YuE2)"

# Pinned like the git commit Windows builds from source, so "it worked on my
# machine" doesn't silently drift - bump both together when updating.
# Verified by hand (downloaded and `shasum -a 256`'d) against the asset
# published at this URL; audiocpp_server from this archive was smoke-tested
# loading real yue2/muscriptor GGUF weights through the exact
# POST /v1/models/load body config.py's yue2_specs()/MUSCRIPTOR_* send.
AUDIOCPP_RELEASE_TAG="v0.8.1"
AUDIOCPP_RELEASE_ASSET="audio-${AUDIOCPP_RELEASE_TAG}-bin-macos-arm64-metal.tar.gz"
AUDIOCPP_RELEASE_URL="https://github.com/0xShug0/audio.cpp/releases/download/${AUDIOCPP_RELEASE_TAG}/${AUDIOCPP_RELEASE_ASSET}"
AUDIOCPP_RELEASE_SHA256="a5995233c4e28297600c474eed24b734a3ff8f00393147915112b2b4d07ab593"

AUDIOCPP_DIR="$EXTERNAL_DIR/audio.cpp"

install_prebuilt_yue2() {
    local marker_file="$AUDIOCPP_DIR/.remiqora-release-${AUDIOCPP_RELEASE_TAG}.done"
    if [[ -f "$marker_file" ]]; then
        echo "Already installed ($AUDIOCPP_RELEASE_TAG), skipping."
        return 0
    fi
    if ! assert_command curl "Install it (should ship with macOS already)."; then
        return 1
    fi
    mkdir -p "$AUDIOCPP_DIR"
    local tmp_dir
    tmp_dir=$(mktemp -d)
    # shellcheck disable=SC2064
    trap "rm -rf '$tmp_dir'" RETURN

    echo "Downloading $AUDIOCPP_RELEASE_ASSET (no compiler needed - see --from-source to build instead) ..."
    curl -fL -o "$tmp_dir/audiocpp.tar.gz" "$AUDIOCPP_RELEASE_URL"

    local actual_sha256
    actual_sha256=$(shasum -a 256 "$tmp_dir/audiocpp.tar.gz" | awk '{print $1}')
    if [[ "$actual_sha256" != "$AUDIOCPP_RELEASE_SHA256" ]]; then
        echo "[ERROR] sha256 mismatch for $AUDIOCPP_RELEASE_ASSET" >&2
        echo "  expected $AUDIOCPP_RELEASE_SHA256" >&2
        echo "  got      $actual_sha256" >&2
        return 1
    fi

    tar xzf "$tmp_dir/audiocpp.tar.gz" -C "$tmp_dir"
    mkdir -p "$AUDIOCPP_DIR/build/macos-metal-release/bin"
    cp "$tmp_dir/audiocpp_server" "$AUDIOCPP_DIR/build/macos-metal-release/bin/"
    chmod +x "$AUDIOCPP_DIR/build/macos-metal-release/bin/audiocpp_server"
    # tools/model_manager_v2.py (weight downloader) and model_specs/ (what
    # it downloads) - same layout the git checkout has, so the weights step
    # below and config.py's YUE2_DIR-relative paths work unmodified.
    rm -rf "$AUDIOCPP_DIR/tools" "$AUDIOCPP_DIR/model_specs"
    cp -R "$tmp_dir/tools" "$AUDIOCPP_DIR/tools"
    cp -R "$tmp_dir/model_specs" "$AUDIOCPP_DIR/model_specs"
    touch "$marker_file"
    echo "Installed audiocpp_server $AUDIOCPP_RELEASE_TAG (prebuilt, Metal)."
}

build_from_source_yue2() {
    # No patch needed here - see external/patches/README.md. dev is a moving
    # branch upstream and gets rebased/force-pushed occasionally; if this
    # exact commit 404s, bump it to a current dev commit (same pin used by
    # setup_models.ps1).
    init_repo "audio.cpp" "https://github.com/0xShug0/audio.cpp.git" "39f9013" "" >/dev/null

    local have_cmake=1
    assert_command cmake "Install it via ./setup_prereqs.sh (brew install cmake)." || have_cmake=0
    local have_metal=1
    assert_metal_toolchain || have_metal=0
    if [[ "$have_cmake" == "1" && "$have_metal" == "1" ]]; then
        (
            cd "$AUDIOCPP_DIR"
            echo "Building audiocpp_server (Metal release, yue2+sheetsage2+muscriptor) ..."
            chmod +x scripts/build_metal.sh
            ./scripts/build_metal.sh \
                --model-set custom --models "yue2,sheetsage2,muscriptor" \
                --native-model-manager \
                --target audiocpp_server
        )
    else
        echo "Skipped native build - install the missing tools above, then re-run:"
        echo "  ./setup_models.sh --from-source (or run the build manually per external/audio.cpp/README.md)"
    fi
}

if [[ "$SKIP_BUILD" == "1" ]]; then
    echo "Skipping YuE2 engine setup (--skip-build passed)."
elif [[ "$FROM_SOURCE" == "1" ]]; then
    build_from_source_yue2
else
    install_prebuilt_yue2
fi

if [[ "$SKIP_WEIGHTS" == "1" ]]; then
    step "YuE2/SheetSage2/MuScriptor weights"
    echo "Skipping weight downloads (--skip-weights passed)."
elif assert_command "$PYTHON_BIN" "Install Python 3 and put it on PATH."; then
    step "YuE2/SheetSage2/MuScriptor weights (~10 GB total)"
    (
        cd "$AUDIOCPP_DIR"
        for pkg in yue2_main_q8_0 yue2_main_q4_0 yue2_vae_f16 sheetsage2_orig muscriptor_small_f32; do
            echo "Installing $pkg ..."
            "$PYTHON_BIN" tools/model_manager_v2.py install "$pkg"
        done
    )
else
    echo "Skipped weight downloads - install Python and re-run this script."
fi
# ACE-Step's own checkpoints (acestep-v15-sft, LM, VAE, ...) are not fetched
# here - acestep-api downloads them itself via HuggingFace/ModelScope on its
# first request, the same way its Gradio UI does.

step "Demucs (stem separation)"
# Not an upstream repo to clone - just a throwaway uv project with the
# `demucs` PyPI package installed into it. Unlike setup_models.ps1's
# version of this project file, "torch" isn't routed at a CUDA wheel index
# here - the plain PyPI wheel already resolved for ACE-Step-1.5 above is
# MPS-capable on darwin/arm64, no special index needed.
# `numpy` is listed explicitly: demucs imports it directly (see
# demucs/transformer.py) but its own package metadata doesn't declare it as
# a dependency, so it's otherwise missing and demucs fails to import.
DEMUCS_DIR="$EXTERNAL_DIR/Demucs"
mkdir -p "$DEMUCS_DIR"
DEMUCS_PROJECT_FILE="$DEMUCS_DIR/pyproject.toml"
if [[ ! -f "$DEMUCS_PROJECT_FILE" ]]; then
    echo "Writing $DEMUCS_PROJECT_FILE ..."
    cat > "$DEMUCS_PROJECT_FILE" <<'EOF'
[project]
name = "demucs-runner"
version = "0.1.0"
requires-python = ">=3.11,<3.13"
dependencies = [
    "demucs>=4.0.1",
    "numpy>=1.26.4",
    "torch>=2.11.0",
]

[tool.uv]
package = false
EOF
fi

if assert_command uv "Install it from https://docs.astral.sh/uv/getting-started/installation/"; then
    (
        cd "$DEMUCS_DIR"
        echo "Running 'uv sync' for Demucs (pulls the MPS-capable torch build, can take a while) ..."
        uv sync
    )
else
    echo "Skipped Demucs 'uv sync' - install uv and re-run this script."
fi

step "Stable Audio 3 (sa3-server)"
# Our own small HTTP server around Stability's stable-audio-3 package; the uv project is
# tracked in the repository (external/sa3-server), so only "uv sync" runs here. On a Mac
# only the small checkpoints run (medium needs CUDA + Flash Attention).
# The weights go to the Hugging Face cache. The easy way is the app: the Stable Audio 3 page
# lists the checkpoints with a Download button and takes a Hugging Face token. Here they are
# fetched only when asked for with --stable-audio-models. small-music and small-sfx are gated:
# accept the licence on their huggingface.co pages first and save a token, either in the app
# or with "external/sa3-server/.venv/bin/hf auth login". The -base ones are open.
STABLE_AUDIO_DIR="$EXTERNAL_DIR/sa3-server"
if [[ ! -f "$STABLE_AUDIO_DIR/pyproject.toml" ]]; then
    echo "external/sa3-server is missing from this checkout - skipping Stable Audio 3."
elif assert_command uv "Install it from https://docs.astral.sh/uv/getting-started/installation/"; then
    (
        cd "$STABLE_AUDIO_DIR"
        echo "Running 'uv sync' for sa3-server (can take a while) ..."
        uv sync
        if [[ -n "$STABLE_AUDIO_MODELS" ]]; then
            for model in ${STABLE_AUDIO_MODELS//,/ }; do
                echo "Downloading the Stable Audio 3 checkpoint '$model' ..."
                .venv/bin/python -m sa3_server.download "$model"                     || echo "Could not download '$model' (see the error above). Download it later from the app's Stable Audio 3 page."
            done
        else
            echo "Weights: download them from the app (Stable Audio 3 page), or re-run with --stable-audio-models=small-music,small-sfx."
        fi
    )
else
    echo "Skipped sa3-server 'uv sync' - install uv and re-run this script."
fi

step "Prompt assistant"
# A local language model that writes each engine's prompt from an idea (external/prompt-assistant, run in
# place). Its model is downloaded from the app's Models page, or here with
# PROMPT_ASSISTANT_MODEL=Qwen/Qwen3.5-2B ./setup_models.sh
ASSISTANT_DIR="$EXTERNAL_DIR/prompt-assistant"
if [[ ! -f "$ASSISTANT_DIR/pyproject.toml" ]]; then
    echo "external/prompt-assistant is missing from this checkout - skipping the prompt assistant."
elif assert_command uv "Install it from https://docs.astral.sh/uv/getting-started/installation/"; then
    (
        cd "$ASSISTANT_DIR"
        uv sync
        if [[ -n "${PROMPT_ASSISTANT_MODEL:-}" ]]; then
            .venv/bin/python -m prompt_assistant.download "$PROMPT_ASSISTANT_MODEL"
        fi
    )
else
    echo "Skipped the prompt assistant's 'uv sync' - install uv and re-run this script."
fi

step "Album covers: stable-diffusion.cpp + Z-Image Turbo (~9.5 GB)"
# stable-diffusion.cpp's prebuilt macOS arm64 sd-server and the Z-Image Turbo
# weights, in the layout the backend reads (SDCPP_DIR/bin, SDCPP_DIR/models;
# SDCPP_DIR defaults to external/sdcpp, so backend/.env needs no line for it).
# The same release and files as backend/app/engine_parts.py (SDCPP_RELEASE,
# _SDCPP_ZIPS, COVER_FILES) and desktop/manifest.json ("cover") - bump them
# together. A failure here only warns: the rest of the install goes on and
# the app's Models page can fetch what is missing.
SDCPP_RELEASE="master-1106-532d2c1"
SDCPP_ZIP="sd-master-532d2c1-bin-Darwin-macOS-26.7.2-arm64.zip"
SDCPP_ZIP_BYTES=38331254
SDCPP_ZIP_SHA256="8146d6ffc75f8ff8f64b62a80fffee8fb714ab65e368e202084135fa07cc6f36"
SDCPP_DIR="$EXTERNAL_DIR/sdcpp"

file_bytes() { if [[ -f "$1" ]]; then wc -c < "$1" | tr -d ' '; else echo 0; fi; }

# fetch_pinned url path bytes sha256: curl with retries, resuming a half
# download (-C -), then the sha256; a file that does not match is removed.
fetch_pinned() {
    local url="$1" path="$2" bytes="$3" sha256="$4" actual
    if [[ "$(file_bytes "$path")" != "$bytes" ]]; then
        echo "Downloading $(basename "$path") ($(( bytes / 1000000 )) MB) ..."
        if ! curl -fL --retry 3 --retry-delay 5 -C - -o "$path" "$url"; then
            echo "[WARN] Could not download $(basename "$path")."
            return 1
        fi
    fi
    actual=$(shasum -a 256 "$path" | awk '{print $1}')
    if [[ "$actual" != "$sha256" ]]; then
        rm -f "$path"
        echo "[WARN] sha256 mismatch for $(basename "$path") (removed): expected $sha256, got $actual"
        return 1
    fi
}

# fetch_weight name bytes sha256 url: skipped when already there with the
# right size (a dev box may point external/sdcpp at a shared folder).
fetch_weight() {
    local path="$SDCPP_DIR/models/$1"
    if [[ "$(file_bytes "$path")" == "$2" ]]; then
        echo "Already in place: $1"
        return 0
    fi
    fetch_pinned "$4" "$path" "$2" "$3"
}

# Unpacks the flat release zip into bin/ (Python's zipfile, like the app's
# Models page) and makes the binaries executable.
install_sd_server() {
    local zip="$SDCPP_DIR/dl/$SDCPP_ZIP"
    fetch_pinned "https://github.com/leejet/stable-diffusion.cpp/releases/download/$SDCPP_RELEASE/$SDCPP_ZIP" \
        "$zip" "$SDCPP_ZIP_BYTES" "$SDCPP_ZIP_SHA256" || return 1
    "$PYTHON_BIN" -I -c 'import sys, zipfile; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])' \
        "$zip" "$SDCPP_DIR/bin" || return 1
    local bin
    for bin in sd-server sd-cli; do
        [[ -f "$SDCPP_DIR/bin/$bin" ]] && chmod 755 "$SDCPP_DIR/bin/$bin"
    done
    [[ -f "$SDCPP_DIR/bin/sd-server" ]] || { echo "[WARN] $SDCPP_ZIP has no sd-server."; return 1; }
    rm -f "$zip"
    echo "Installed sd-server ($SDCPP_RELEASE)."
}

install_covers() {
    local failed=0
    assert_command curl "Install it (should ship with macOS already)." || return 1
    assert_command "$PYTHON_BIN" "Install Python 3 and put it on PATH." || return 1
    mkdir -p "$SDCPP_DIR/bin" "$SDCPP_DIR/dl" "$SDCPP_DIR/models" || return 1
    if [[ -f "$SDCPP_DIR/bin/sd-server" ]]; then
        echo "sd-server is already in place, skipping."
    else
        install_sd_server || failed=1
    fi
    fetch_weight z_image_turbo-Q8_0.gguf 6577440704 df1c5baa86d1398c979495a6072dbcee79444fdb884a2445582ba0769c44e9a1 \
        "https://huggingface.co/leejet/Z-Image-Turbo-GGUF/resolve/main/z_image_turbo-Q8_0.gguf" || failed=1
    fetch_weight Qwen3-4B-Instruct-2507-Q4_K_M.gguf 2497281120 3605803b982cb64aead44f6c1b2ae36e3acdb41d8e46c8a94c6533bc4c67e597 \
        "https://huggingface.co/unsloth/Qwen3-4B-Instruct-2507-GGUF/resolve/main/Qwen3-4B-Instruct-2507-Q4_K_M.gguf" || failed=1
    fetch_weight ae.safetensors 335304388 afc8e28272cd15db3919bacdb6918ce9c1ed22e96cb12c4d5ed0fba823529e38 \
        "https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/vae/ae.safetensors" || failed=1
    return "$failed"
}

COVERS_OK=1
if [[ "$SKIP_COVERS" == "1" ]]; then
    echo "Skipping the album covers (--skip-covers passed). Install them later on the app's Models page."
elif install_covers; then
    echo "Album covers are ready."
else
    COVERS_OK=0
    echo "[WARN] Album covers are not fully installed - re-run this script (downloads continue) or finish them on the app's Models page."
fi

step "backend/.env"
ENV_FILE="$ROOT/backend/.env"
FFMPEG_BIN_DIR=$(find_ffmpeg_bin_dir || true)
if [[ -n "${FFMPEG_BIN_DIR:-}" ]]; then
    echo "Found ffmpeg at $FFMPEG_BIN_DIR"
else
    echo "Could not find ffmpeg (install it via ./setup_prereqs.sh) - FFMPEG_BIN_DIR will need setting by hand."
fi

if [[ ! -f "$ENV_FILE" ]]; then
    cat > "$ENV_FILE" <<EOF
# Paths to the two AI model repos this app orchestrates.
ACE_STEP_DIR=$ACE_DIR
YUE2_DIR=$AUDIOCPP_DIR

# Separate uv-managed venv/project for Demucs (stem separation).
DEMUCS_DIR=$DEMUCS_DIR

# Stable Audio 3: our HTTP server (external/sa3-server). Weights come from the Hugging Face
# cache; download them from the app's Stable Audio 3 page (or --stable-audio-models when running this script).
STABLE_AUDIO_DIR=$STABLE_AUDIO_DIR
STABLE_AUDIO_PRELOAD=small-music

# ffmpeg bin dir (used by ACE-Step's process launch and by our own
# non-WAV-upload transcoding for YuE2).
FFMPEG_BIN_DIR=${FFMPEG_BIN_DIR:-}

# No CUDA_BIN_DIR here on purpose: on macOS, YuE2 (audiocpp_server) is
# built with the Metal backend and ACE-Step/Demucs run on PyTorch's MPS
# backend, both built into macOS - there's no CUDA toolkit to point at.
EOF
    echo "Wrote backend/.env pointing at the cloned repos."
    if [[ -z "${FFMPEG_BIN_DIR:-}" ]]; then
        echo "Still edit FFMPEG_BIN_DIR in backend/.env for your machine."
    fi
else
    echo "backend/.env already exists - not overwriting. Cloned repo paths:"
    echo "  ACE_STEP_DIR=$ACE_DIR"
    echo "  YUE2_DIR=$AUDIOCPP_DIR"
    echo "  DEMUCS_DIR=$DEMUCS_DIR"
    echo "  STABLE_AUDIO_DIR=$STABLE_AUDIO_DIR"
    if [[ -n "${FFMPEG_BIN_DIR:-}" ]]; then
        echo "  FFMPEG_BIN_DIR=$FFMPEG_BIN_DIR (detected - edit backend/.env if it doesn't already match)"
    fi
fi

step "Done"
echo "Remaining manual steps (see README.md):"
if [[ -z "${FFMPEG_BIN_DIR:-}" ]]; then
    echo "  - Install ffmpeg (./setup_prereqs.sh) and point FFMPEG_BIN_DIR at its bin folder."
fi
echo "  - ACE-Step's own checkpoints download automatically on its first request."
echo "  - The editor's AI arranger adds parts with the ACE-Step base model (~4.8 GB). Fetch it once:"
echo "      cd \"$ACE_DIR\" && uv run acestep-download --model acestep-v15-base"
if [[ "$COVERS_OK" == "0" ]]; then
    echo "  - Album covers did not finish: re-run this script or install them on the app's Models page."
fi
if [[ "$COVERS_OK" == "0" ]]; then
    echo "  - Album covers did not finish: re-run this script or install them on the app's Models page."
fi
echo "  - Then run ./dev.sh or ./prod_run.sh."
