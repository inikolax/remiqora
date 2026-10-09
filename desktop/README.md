# Remiqora desktop app (experimental)

An Electron shell around the Remiqora backend and web UI. It opens a real window instead of a browser tab and
replaces `setup_prereqs` / `setup_models` for people who do not want a terminal:

- a first-run screen checks the NVIDIA GPU, driver, free disk space and connection, then downloads and installs
  everything into one folder the user picks (progress, pause/resume, retry, a clear message when the GPU or driver is
  too old);
- it starts the FastAPI backend on a free local port and shows the UI in the window;
- on quit it stops the model servers through `POST /api/orchestrator/stop` before ending the backend, so no GPU
  process is left behind.

The frontend is unchanged: it uses relative `/api/...` URLs and the backend serves the built bundle, exactly like
`prod_run.bat`.

## Support

| System | State |
| --- | --- |
| Windows x64, NVIDIA RTX 20-series or newer, driver 580 or newer | supported, tested end to end |
| macOS, Apple Silicon | packaged and set up by the same code, first tested by hand on a Mac (see the notes in the branch history); nothing needs to be installed beforehand |
| Linux | packaging config exists, the first-run screen reports "not supported" until there are setup scripts (PR #2) |

The download depends on what is picked on the first-run screen: about 18 GB for ACE-Step alone, about 36 GB with YuE2 (q8_0), stems and the ACE-Step base model, about 60 GB with everything including the XL base model. The screen asks for the picked parts' size plus a third for unpacking and caches.

The Windows requirement comes from the prebuilt engine: the upstream `audio.cpp` CUDA 13.3 build (compute capability
7.5 or newer, driver 580 or newer). No CUDA Toolkit, Visual Studio Build Tools or compiler is needed.

## Run from source

```bash
cd desktop
npm install
node node_modules/electron/install.js   # Electron 44 downloads its binary on demand
npm start
```

From a source checkout the app uses `backend/` and `frontend/dist` of the repository (run `npm run build` in
`frontend/` first) and installs the engines under `%LOCALAPPDATA%\Remiqora` (macOS: `~/Library/Application Support/Remiqora`).
The install folder is chosen on the first-run screen and remembered in Electron's user-data folder.

## Build an installer

```bash
cd frontend && npm ci && cd ../desktop && npm ci
npm run dist        # Windows: dist/Remiqora-Setup-<version>.exe (NSIS, per user, no administrator prompt)
npm run dist:dir    # unpacked app in dist/win-unpacked, handy for testing
```

`npm run dist` builds the frontend, copies the backend sources, the built frontend and the ACE-Step patch into
`resources/` (never `.env`, the database or a virtualenv; the build fails if one is found) and runs electron-builder.
A macOS installer must be built on macOS. The `Desktop app` workflow builds both on GitHub Actions and uploads them
as artifacts; nothing is published from it. The installers have **no certificate**: Windows shows a SmartScreen warning,
and the macOS app is only ad-hoc signed, so a downloaded copy has to be allowed once via System Settings → Privacy &
Security → "Open Anyway" (macOS 15 and later have no right-click bypass). Without that ad-hoc seal macOS reports the
downloaded app as "damaged" (#33).

## What the first run installs

The first-run screen asks what to install. Always: the tools, the backend environment, ACE-Step and its turbo, LM and VAE models.
Optional (ids from [`src/bootstrap/features.js`](src/bootstrap/features.js)):

| Feature | Components | Default |
| --- | --- | --- |
| `yue2` | `engine`, `weights` (the common weights plus `q8_0` and/or `q4_0`) | on; `q4_0` instead of `q8_0` when the card has less than 10 GB |
| `demucs` | `demucs` | on |
| `aceBase` | `ace-base-model` (`acestep-v15-base`, ~4.8 GB) | off |
| `aceXl` | `ace-xl-model` (`acestep-v15-xl-base`, ~20 GB, warned below 16 GB of video memory) | off |

The choice is saved as `features` in the user-data `config.json` and is always widened by what is already on disk, so a
later run only adds. An install from before the choice existed (it has a `state.json`) keeps everything it had. The app
asks the backend what is installed (`GET /api/system/features`, checked on disk) and shows a missing part as "not
installed" with an Install button; that calls `window.remiqora.addFeatures([...])` (preload), which opens this screen in
"add" mode while the backend keeps running, and "Back to Remiqora" returns to it without a restart.

Everything lives under the chosen folder, so removing it removes the app's data:

| Path | Content | Source |
| --- | --- | --- |
| `tools/uv` | uv (Python and environment manager) | astral-sh/uv release |
| `tools/python` | managed Python 3.12 (uv never uses a system Python) | downloaded by uv |
| `tools/ffmpeg` | FFmpeg: a zip build on Windows, one static binary on macOS (GPL builds, downloaded, never redistributed) | Gyan builds / shaka-project static-ffmpeg-binaries, pinned |
| `engines/YuE2` | `audiocpp_server`, CUDA/Metal libraries, model downloader | audio.cpp release, pinned |
| `engines/ACE-Step-1.5` | ACE-Step at the pinned commit with `external/patches/ace-step.patch` applied, plus its `uv sync` environment | GitHub source archive |
| `engines/ACE-Step-1.5/checkpoints` | ACE-Step generation models (~9.4 GB), fetched with `acestep-download` so the first generation does not stall, plus, if picked, the base DiT (`acestep-v15-base`, ~4.8 GB) and the XL base (`acestep-v15-xl-base`, ~20 GB) the editor's AI arranger adds parts with | Hugging Face (ModelScope as ACE-Step's fallback) |
| `engines/Demucs` | a uv project with Demucs and CUDA torch | PyPI / PyTorch index |
| `backend-venv` | the environment the Remiqora backend runs in | PyPI |
| `data`, `logs` | database, generated audio, logs | created at run time |
| `engines/YuE2/models` | YuE2 (`q8_0` 4.3 GB and/or `q4_0` 2.7 GB), its VAE, SheetSage2 and MuScriptor weights (3.4 GB) | audio.cpp model manager |

Model caches (`HF_HOME`, `TORCH_HOME`) are redirected into `cache/` under the same folder, so nothing large lands in the user profile.

The pinned versions and their SHA-256 hashes are in [`manifest.json`](manifest.json). To bump one, read the hash from
the release (`gh api repos/OWNER/REPO/releases/tags/TAG --jq '.assets[] | "\(.name) \(.digest)"'`), update the URL,
`sha256` and `bytes`, and run the tests. ACE-Step comes as a commit-addressed source archive whose hash GitHub does
not guarantee, so it is verified by the commit id and by the patch applying cleanly.

Progress is kept in `state.json`: a component is skipped on the next start only if its recorded version matches and
its files are still on disk, so a new app version with new pins downloads just what changed. Downloads resume with
`Range` requests and are verified before use.

## Test switches

| Variable | Effect |
| --- | --- |
| `REMIQORA_HOME` | default install folder (also skips the per-OS default) |
| `REMIQORA_USER_DATA` | Electron user-data folder, to isolate the saved settings |
| `REMIQORA_SKIP_COMPONENTS` | comma-separated ids to skip, e.g. `ace-step,demucs,weights` for a quick run |
| `REMIQORA_LANG` | force the first-run screen language, `en` or `ru` (otherwise the system language) |
| `REMIQORA_DEVTOOLS` | open DevTools when running from source |

### Full end-to-end test

`test/e2e/full.js` drives an installed build through everything a user does: a first run with every component, then
a YuE2 track, MIDI, an ACE-Step track, Demucs stems, a clean quit and a restart with the tracks still there. It needs
Windows, an NVIDIA GPU, about 46 GB and 25 minutes, and runs against a folder you choose, never real data. The header
of the file has the commands; it uses Playwright's Electron support (`npm i --no-save playwright`).

Last run (2026-09-20, RTX 4080): first run 12 min, YuE2 20 s of audio in 5 s, ACE-Step 12 s clip in 50 s, Demucs 10 s,
closing the window with ACE-Step running ended all 10 processes in 1.8 s, and both torch environments reported CUDA.

`npm test` runs the unit tests (downloader with resume, retry and hash checks, the JS patcher, system checks, the
setup runner and the choice of parts) with Node's built-in runner.

## Known gaps

- The install folder can only be chosen on the first-run screen. Moving it later is not supported: the database stores
  absolute file paths.
- No automatic updates yet (electron-updater from GitHub Releases is the plan) and no code signing.
- macOS has had a first manual run only (FFmpeg was the first thing it tripped on); Linux has not been run; the CI workflow has never been run.
- Model progress is estimated from the size of the models folder; the downloader prints little.
- The setup needs Windows 10 1803 or newer (it uses the built-in `tar.exe`).
