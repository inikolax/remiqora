<p align="right"><b>English</b> · <a href="README.ru.md">Русский</a></p>

<p align="center">
  <img src="frontend/public/favicon.svg" width="88" height="88" alt="Remiqora">
</p>

<h1 align="center">Remiqora</h1>
<p align="center"><i>Made with AI. Made by you.</i></p>

<p align="center">
  A local, GPU-powered music generation and production studio — one interface for <b>ACE-Step 1.5</b> and <b>YuE2-3B</b>, with a built-in multitrack DAW.
</p>

<p align="center">🚧 Actively in development — expect breaking changes, bugs, and rough edges. Not a stable release yet.</p>

<p align="center">
  <img alt="Status" src="https://img.shields.io/badge/status-in%20development-eab308?style=flat-square">
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/badge/license-MIT-22c55e?style=flat-square"></a>
  <img alt="Platform" src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-0f0f14?style=flat-square">
  <img alt="GPU" src="https://img.shields.io/badge/GPU-NVIDIA%20CUDA%20%7C%20Apple%20Metal-76B900?style=flat-square">
  <img alt="Stack" src="https://img.shields.io/badge/stack-Vue%203%20%2B%20FastAPI-a855f7?style=flat-square">
  <img alt="UI languages" src="https://img.shields.io/badge/UI-EN%20%2F%20RU-ec4899?style=flat-square">
  <a href="https://ko-fi.com/inikolax"><img alt="Support on Ko-fi" src="https://img.shields.io/badge/Support-Ko--fi-FF5E5B?style=flat-square&logo=ko-fi&logoColor=white"></a>
</p>

<p align="center">
  <img src="docs/hero-poster.png" alt="Remiqora — made with AI, made by you" width="900">
</p>

<p align="center">
  <a href="#why-this-exists">Why</a> ·
  <a href="#whats-inside">What's inside</a> ·
  <a href="#ace-step-generation">ACE-Step</a> ·
  <a href="#yue2-and-sheetsage2-generation">YuE2</a> ·
  <a href="#lora-training-ace-step">LoRA</a> ·
  <a href="#built-in-daw">DAW</a> ·
  <a href="#built-with">Built with</a> ·
  <a href="#license--liability-for-generated-content">License</a> ·
  <a href="#-installation">Installation</a>
</p>

---

## Why this exists

ACE-Step and YuE2 are two independent music generation engines, each with its own web UI, its own result-storage format, and its own process that has to be started and stopped by hand. They typically cannot run simultaneously on a single consumer GPU. Remiqora solves this with a single layer on top:

- **One UI** instead of two different interfaces with different UX.
- **Mutually-exclusive orchestrator**: pick a model in the header — it starts up, and the other one stops on its own. No need to manually kill processes before starting the other engine.
- **Shared storage**: every track (generated, uploaded, or assembled in the editor) is tracked in a centralized SQLite database and shared folder, available from every module — Demucs, MuScriptor and the editor all work off the same library instead of three separate ones.
- **A DAW on top of generation**: a generated track isn't the end point, it's raw material — split it into stems, drag it onto a timeline, process it with effects, blend it with other tracks, and export.
- **Built-in LoRA training**: not just generation — fine-tune ACE-Step on your own voice or style right from the browser, no console needed.

---

## What's inside

| Module | What it does |
|---|---|
| **ACE-Step 1.5** | Fast generation from text/style tags, covers, section repainting, extracting/adding parts on top of a reference track. |
| **YuE2-3B** | Full-length track generation with CoT score planning (a symbolic ABC plan before the audio). |
| **SheetSage2** | Extracts melody and harmony from a reference track into ABC notation — used as YuE2's input. |
| **LoRA training** | Dataset → auto-labeling → preprocessing → training → export — the whole ACE-Step fine-tuning pipeline for your own voice/style, in the browser. |
| **Demucs** | Splits any track into 4 stems: vocals, drums, bass, other. |
| **MuScriptor** | Transcribes audio (the full mix or a single stem) into MIDI notes. |
| **Built-in DAW** | A multitrack timeline editor for assembling tracks/stems into a final mix: an effects rack on every channel, auto-BPM and time-stretch, WAV/MP3 export. |

The interface is fully bilingual (Russian/English, switcher in the header).

---

## ACE-Step: generation

![ACE-Step: generation and track feed](docs/screenshots/en/02-ace-step.png)

Two input modes: **“Simple”** — a single text description the model uses to infer both style and lyrics on its own; and **“Custom”** — style tags with autocomplete plus lyrics with structure markup (`[Verse]/[Chorus]/[Bridge]`) and performance annotations (`(whisper)`, `(falsetto)`), or an “Instrumental” checkbox.

Attaching a reference track unlocks 5 remix scenarios:
- **Cover** — restyle while keeping the melody (tunable original-preservation strength).
- **Repaint a section** — replace only a chosen part of the track.
- **Extract a part** — pull one instrument/voice out of a finished mix (12 options: vocals, drums, bass, guitar, etc.).
- **Add a part** — compose one missing instrument on top of the mix.
- **Finish the composition** — the same, but for a whole list of parts at once.

Plus: 10–300 s duration, batch of 1/2/4 variants, mp3/wav/flac formats, advanced parameters (BPM, key, time signature, vocal language, inference steps, guidance scale, seed), LoRA adapter support with adjustable strength, local presets, and a "Stop all" button for bulk job cancellation.

## YuE2 and SheetSage2: generation

![YuE2: generation and track feed](docs/screenshots/en/03-yue2.png)

Three **CoT (Chain-of-Thought)** modes: `off` — straight to audio; `melody` — the arrangement is built around a given melody (ABC); `full` — the model first builds a symbolic plan (melody + chords), then generates the audio.

**SheetSage2** lets you upload a reference track and pull its melody into ABC notation, right in the form, with one click — editable by hand afterwards. Beyond that: `q8_0`/`q4_0` precision, batch of 1–4, a full set of sampling parameters for audio generation and the ABC planner separately, local presets, and viewing/reusing the ABC score of an already-generated track.

## LoRA training (ACE-Step)

![LoRA training](docs/screenshots/en/04-lora-training.png)

The full ACE-Step fine-tuning pipeline on your own dataset, no console required:

1. **Dataset** — upload audio files straight from the browser (drag & drop) or point at an existing server folder, a trigger word, an "all tracks are instrumental" flag.
2. **Automatic labeling** — LLM-generated description, genre, BPM/key, lyrics transcription/reformatting.
3. **Review and edit** — a table of every sample where you can fix the description/genre/tags before training.
4. **Preprocessing** — converts labeled samples into tensors.
5. **Training** — LoRA rank/alpha/dropout, learning rate, epochs, batch size, FP8, gradient checkpointing, live progress with an ETA and a TensorBoard link.
6. **Export and registry** — the finished adapter is immediately added to the LoRA list on the generation form.

## Stem separation (Demucs)

![Stem separation](docs/screenshots/en/05-stems-panel.png)

One click splits any saved track into 4 isolated stems (Demucs `htdemucs`), with a progress bar, a separate player and download per stem, and the option to redo or delete. Runs alongside the active generation model (without stopping it), sharing a GPU lock. The **"Open in editor"** button allows you to instantly send all 4 stems into a new built-in DAW project for further mixdown.

## MIDI transcription (MuScriptor)

![MIDI transcription](docs/screenshots/en/06-midi-panel.png)

Transcribes the full mix, or any already-separated stem, into MIDI. Technically this isn't a separate process — it's a model loaded into the already-running YuE2 server, so **transcription requires YuE2 to be the active model**. Result: a built-in Web Audio synth player, a mini piano roll, a note count and BPM readout, and `.mid` download.

## Built-in DAW

![Editor: a four-stem project on the timeline](docs/screenshots/en/08-editor-with-clip.png)

Any number of tracks, onto which you can add anything from the shared library (a full mix, a single stem, a file uploaded from disk) — via a picker dialog or by dragging a file straight onto a track. The quickest way in is through stems: the **"Open in editor"** button on the stems panel creates a ready-made four-track project (vocals, drums, bass, other).

### Timeline and clips

- Free clip repositioning and edge trimming (non-destructive — the source file is untouched). Clips always snap to neighboring clips' edges and to timeline zero; the **Magnet** button additionally snaps to a grid derived from the project BPM (the step depends on zoom: 1/16, 1/8, 1/4 note, or a bar).
- **Split a clip** at the cursor (`S`), duplicate (`Ctrl+D`), delete (`Delete`).
- Buttons on the clip itself: **M** (mute), **S** (solo), **W** (warp) and ✕. Draggable **fade-in / fade-out** handles sit on the clip's edges; by default each edge gets an automatic 15 ms micro-fade that removes digital clicks from hard cuts.
- **Loop**: a loop region on the time ruler — drag it whole or pull either edge; clicking the ruler seeks.
- **BPM and Warp**: when a clip is added from the library or dragged in from disk, its tempo is detected automatically (from the first 30 seconds). The **BPM** field sets the project tempo, and the **W** button time-stretches the clip to it (SoundTouch) while preserving pitch. The detector is a simple one and can be off on complex material.
- **Undo/Redo** (`Ctrl+Z` / `Ctrl+Y`) — up to **30 steps** of history. Zoom with `Ctrl+wheel` or the slider and **Fit** button; pan the timeline with `Shift+drag` or the middle mouse button.

### Channels and effects

![Effects rack on the vocals channel](docs/screenshots/en/10-editor-effects.png)

- Every track has volume, pan, mute/solo, and a color (the dots above the track list), plus a shared master bus.
- **An 8-effect rack** on every channel and on the master: EQ (Low/Mid/High, ±12 dB), Dynamics (compressor: threshold and ratio), Filter (LP/HP: frequency and resonance), Chorus, Delay, Reverb, Distortion, and Bitcrush. All effects run in real time, with parameter values shown next to the sliders.
- Stereo master VU meters (L/R) in the toolbar, and a level meter with clipping indication in the selected track's channel.

### Help

![Built-in editor help](docs/screenshots/en/11-editor-help.png)

The **"?"** button in the toolbar opens built-in help: a list of hotkeys, mouse controls, and short tips on Loop and Magnet.

### Project and export

- Projects are stored on the server and opened from a list. There is no autosave — use the **Save** button; if you close the tab or navigate away with unsaved edits, the editor warns you about losing them.
- Export the mixed-down project as **WAV** or **MP3** — rendered offline (the same processing graph as live playback) and saved back into the shared track library.

---

## Architecture

- **`backend/`** — FastAPI (Python). `app/orchestrator/` manages the models' process lifecycle (start/stop/health-poll) and enforces their mutual exclusion on a single GPU. `app/api/routes_proxy.py` reverse-proxies `/api/ace/*` → ACE-Step's REST API (port 8001) and `/api/yue2/*` → YuE2's native server (`audiocpp_server.exe`, port 8080). `app/db.py` + `routes_tracks.py` are the shared SQLite database and files, organized per model, regardless of how a track was created (generation, upload, or assembled in the editor).
- **`frontend/`** — Vue 3 + TypeScript + Tailwind v4 + Pinia + vue-router + vue-i18n. A fully native implementation (not an iframe) on top of the models' original APIs — `src/audio/` contains its own Web Audio engine (mixer, timeline, effects, a MIDI parser and synth, WAV/MP3 encoders).
- Only the models' own inference process (`acestep-api` and `audiocpp_server.exe`) runs from their original code — everything else (UI, proxying, storage, file upload/transcoding) is written in this repository. YuE2's own web UI (`web-ui/server.py`) is no longer used — the one useful part of it (transcoding non-WAV uploads via ffmpeg) has been ported to `backend/app/api/routes_yue2_upload.py`.

---

## Built with

Remiqora is a UI and orchestrator on top of third-party inference engines. Their code isn't vendored into this repository — only small functional patches (`external/patches/`) on top of the originals:

| Project | What's used | License |
|---|---|---|
| [ACE-Step-1.5](https://github.com/ace-step/ACE-Step-1.5) | Text/style-driven music generation engine, LoRA training | MIT |
| [audio.cpp](https://github.com/0xShug0/audio.cpp) (`dev` branch) | YuE2 (generation), SheetSage2 (melody extraction), MuScriptor (MIDI transcription) | Apache-2.0 |
| [Demucs](https://github.com/adefossez/demucs) | Stem separation (`htdemucs`) | MIT |

Patch details and exact base commits are in [`external/patches/README.md`](external/patches/README.md).

---

## License & liability for generated content

Remiqora's own code (this repository) is [MIT-licensed](LICENSE). That covers the UI and orchestrator only — it is a separate thing from the license of a *track* you generate with it. Remiqora is an orchestrator, not a generator with its own model — all audio is produced by third-party engines (ACE-Step 1.5, YuE2-3B, and the SheetSage2/MuScriptor tools built on top of them). Because of that:

- **The author of Remiqora takes no responsibility** for what happens to tracks generated through this app afterward — commercial or otherwise, published or private. Whatever you create, and how you use it next, is entirely your own responsibility.
- **A generated track is covered by the license of whichever model produced it**, not by a license from this repository. The table above lists the *code* license — the *model weights* can be licensed differently:
  - **ACE-Step 1.5** — both the code and the model weights are MIT-licensed, and the model's authors explicitly state the generated music can be used commercially.
  - **YuE2-3B** — the model weights (unlike audio.cpp's own Apache-2.0 *code*) are distributed under **CC BY-NC 4.0**. That means tracks generated through YuE2 **cannot be used commercially** without separate permission from the rights holder, and attribution is required for any use.
- Before publishing, monetizing, or otherwise distributing a generated track, **check the current license terms of that specific model** on its HuggingFace/weights page — those terms belong to the model's own rights holder and can change independently of this repository.
- Remiqora is provided "as is", with no warranty of any kind. By using it, you accept that verifying a generated track's compliance with applicable law and with the license of the model that produced it is solely your responsibility.
- **Attribution**: if you fork, copy, or build on Remiqora's code, keep the credit — a link back to this repository and to Nikolay Cherkashin ([inikolax](https://github.com/inikolax)) as the original author. The MIT license above already requires keeping the copyright notice in any copy; this is just that requirement spelled out plainly.

---

## 📦 Installation

### Step 0: build tools

```cmd
setup_prereqs.bat
```

Via `winget` (built into Windows 10/11), installs Git, Python, `uv`, Node.js,
CMake, ffmpeg, plus Visual Studio Build Tools (C++ workload) and the CUDA
Toolkit — those are large, need admin rights, and can take a while.
`setup_prereqs.bat -SkipHeavy` installs only the small, fast tools, leaving
Build Tools/CUDA for you to install manually from links the script prints.

**The NVIDIA GPU driver is deliberately left out** — install it by hand from
[nvidia.com/drivers](https://www.nvidia.com/drivers) for your card: silently
swapping a video driver on someone else's machine is risky (it can blank the
screen and usually needs a reboot on your schedule, not the script's).

After installing, close the terminal and open a new one so PATH picks up the
freshly installed tools.

**On macOS (Apple Silicon):**
```sh
./setup_prereqs.sh
```
Via [Homebrew](https://brew.sh), installs Git, Python, `uv`, Node.js, CMake,
ffmpeg and Ninja. No separate GPU driver step: Metal is built into macOS.
CMake/Ninja are only actually used by the `--from-source` build path below —
the default YuE2 setup needs no compiler at all.

### Step 1: generation engines

```cmd
setup_models.bat
```

The script:
1. Clones `ace-step/ACE-Step-1.5` (MIT) and `0xShug0/audio.cpp` (Apache-2.0,
   `dev` branch — YuE2 support is dev-only for now) into `external/`.
2. Applies a small patch to ACE-Step (a task-cancellation API; audio.cpp
   needs no patch, see `external/patches/README.md`) — without the upstream
   custom web-uis, which aren't needed.
3. Runs `uv sync` for ACE-Step and builds `audiocpp_server` (CUDA release,
   `yue2,sheetsage2,muscriptor` models) for audio.cpp.
4. Downloads the YuE2/SheetSage2/MuScriptor GGUF weights (~10 GB) via
   audio.cpp's `tools/model_manager_v2.py`.
5. Sets up a `demucs` uv project in `external/Demucs` for stem separation,
   routed at PyTorch's cu128 wheel index so it gets a CUDA build (a plain
   `uv add demucs` would silently resolve a CPU-only torch wheel instead).
6. Creates `backend/.env` with paths to the freshly cloned repositories,
   including `FFMPEG_BIN_DIR` — auto-detected from `ffmpeg`'s winget install
   (`setup_prereqs.bat`), even right after installing it in the same
   terminal, before a new one would pick it up on PATH.

ACE-Step's own weights don't need a separate download — `acestep-api` pulls
them from HuggingFace/ModelScope on first request, the same way its Gradio
UI does.

The script is idempotent — safe to re-run (the `-SkipBuild` / `-SkipWeights`
flags skip the corresponding steps). It expects `git`,
[`uv`](https://docs.astral.sh/uv/getting-started/installation/), Python 3,
CMake, the CUDA Toolkit and Visual Studio Build Tools (C++ workload) to
already be installed — if any is missing, that step is simply skipped with a
hint on what to install.

After that, the only manual step left is checking `CUDA_BIN_DIR` in
`backend/.env` (`FFMPEG_BIN_DIR` is filled in automatically — unless ffmpeg
wasn't found at all, in which case the script says so and it needs setting
by hand).

Hard machine requirements the script can't remove: Windows, a CUDA-capable
NVIDIA GPU (tested on an RTX 4080 16 GB), and an installed video driver.

**On macOS (Apple Silicon):**
```sh
./setup_models.sh
```
Adapted for macOS, with one difference from the Windows steps above: by
default, `audiocpp_server` is installed from audio.cpp's own **prebuilt
macOS/Metal release** (a pinned tag, sha256-verified before extracting) —
no compiler needed at all, unlike the Windows path, which always builds
from source since there's no prebuilt CUDA release. The Demucs uv project
also isn't routed at a CUDA wheel index — a plain `torch` dependency
already resolves an MPS-capable wheel on darwin/arm64, same as
ACE-Step-1.5's own `pyproject.toml` does. The written `backend/.env` has no
`CUDA_BIN_DIR` — there's no CUDA toolkit on this path.

Pass `--from-source` to build audio.cpp from the same pinned `dev` commit
Windows uses instead of downloading the release (useful if the release lags
behind a `dev`-only fix, or on Intel Macs, which the prebuilt asset doesn't
cover) — that path needs full **Xcode.app** (not just the Command Line
Tools) for its Metal shader compiler; `setup_prereqs.sh` prints exact steps
if it's missing. `--skip-build` / `--skip-weights` mirror `-SkipBuild` /
`-SkipWeights`. Otherwise it expects `git`, `uv` and Python 3 to already be
installed (`cmake` too, for `--from-source`).

Hard machine requirements this path can't remove: macOS, Apple Silicon
(M-series) for the default prebuilt path (Intel needs `--from-source`).
Tested on a MacBook Air, Apple M5, 24 GB RAM — including a from-scratch run
against a machine with no prior Homebrew packages or project state, all the
way through generating audio with YuE2 on the Metal backend.
This path is newer and less exercised than the Windows/CUDA one — expect it
to be slower (Metal instead of CUDA). `--from-source` in particular may
need occasional manual fixing up (a bumped commit pin) if audio.cpp's `dev`
branch drifts upstream; the default release-based path is pinned to a fixed
tag instead, so it doesn't drift on its own.

**On Linux (NVIDIA CUDA):**
```sh
./setup_linux.sh
```
Builds audio.cpp with its native Linux CUDA backend, installs ACE-Step and Demucs in isolated environments, downloads the model weights, and writes `backend/.env`. It expects git, Python 3.11/3.12, uv, Node.js 20.19+ (or 22.12+), npm, CMake, ffmpeg, and a CUDA toolkit with nvcc plus cuBLAS/cuFFT development headers. The NVIDIA driver is deliberately not installed or modified.

Tool paths are overrideable (`UV_BIN`, `NODE_BIN`, `NPM_BIN`, `CMAKE_BIN`, `NVCC_BIN`, `CUDA_TOOLKIT_PREFIX`, `CUDA_LIB_DIR`). On multi-GPU hosts, `ACE_STEP_DEVICE=0 YUE2_DEVICE=1 ./setup_linux.sh` pins the engines separately; leave both unset for default device selection. Validated end-to-end on Ubuntu 24.04 x86_64 with NVIDIA CUDA.

### Step 2: run

```cmd
dev.bat
```
Brings up the backend (port 9000) and the frontend with Hot Module Replacement (Vite, port 5173), creates `backend/.venv` and `frontend/node_modules` on first run, and opens a browser at [http://localhost:5173](http://localhost:5173).

For production mode — build the SPA and serve everything from a single port:
```cmd
prod_run.bat
```
Builds the client via `npm run build` and serves the finished SPA bundle together with the API at [http://127.0.0.1:9000](http://127.0.0.1:9000).

Stem separation's `demucs` uv project is set up by `setup_models.bat` above; the `htdemucs` weights themselves download automatically on first use.

**On Linux:** `./prod_run_linux.sh` builds the frontend and serves the SPA and API on `0.0.0.0:9000` by default. Override with `REMIQORA_HOST` / `REMIQORA_PORT`.

**On macOS:** `./dev.sh` and `./prod_run.sh` are the equivalents — same
behavior, except the backend/frontend run as background jobs of the script
itself (stop both with Ctrl+C) rather than in separate terminal windows.

---

## ⚙ Configuration (.env)

Settings live in `backend/.env` (template: `backend/.env.example`;
`setup_models.bat` creates it automatically with paths to the cloned repositories):
```ini
ACE_STEP_DIR=E:\AI\ACE\ACE-Step-1.5
YUE2_DIR=E:\AI\YuE2-3B
DEMUCS_DIR=E:\AI\Demucs
FFMPEG_BIN_DIR=E:\AI\ACE\tools\ffmpeg-shared\ffmpeg-master-latest-win64-gpl-shared\bin
CUDA_BIN_DIR=C:\Program Files\NVIDIA GPU Computing Toolkit\CUDA\v13.4\bin
```

- `ACE_STEP_DIR` — root of the cloned and patched ACE-Step-1.5.
- `YUE2_DIR` — root of the cloned and patched audio.cpp (where `audiocpp_server.exe` is built and the YuE2/SheetSage2/MuScriptor GGUF weights live).
- `DEMUCS_DIR` — root of the `demucs` uv project used for stem separation.
- `FFMPEG_BIN_DIR` — folder containing `ffmpeg.exe`/`ffprobe.exe`.
- `CUDA_BIN_DIR` — the `bin` folder of the installed CUDA Toolkit (needs to be on PATH for `audiocpp_server.exe`). Windows only — on macOS this is left unset, since YuE2 runs on the Metal backend instead.

---

## Known limitations

- ACE-Step and YuE2 may remain running at the same time. On multi-GPU Linux hosts, `ACE_STEP_DEVICE` and `YUE2_DEVICE` can pin them to separate GPUs; on a single constrained GPU, running both simultaneously may exceed available VRAM.
- MIDI transcription requires YuE2 specifically to be active (the MuScriptor model loads into its process).
- Windows (NVIDIA CUDA), macOS/Apple Silicon (Metal/MPS), and Linux x86_64 (NVIDIA CUDA) have setup/run paths. Linux builds audio.cpp from source and therefore requires a CUDA development toolkit in addition to the NVIDIA driver.
- The macOS/Metal path is newer and less battle-tested than the Windows/CUDA one; expect it to be slower. By default it installs a prebuilt YuE2 binary pinned to a fixed release tag (no compiler needed); `--from-source` instead builds the same `dev` commit Windows uses, and may occasionally need that pin bumped if `dev` drifts.
