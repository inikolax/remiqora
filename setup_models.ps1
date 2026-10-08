#Requires -Version 5.1
<#
Clones the original ACE-Step-1.5 and audio.cpp (YuE2) repositories into
external/, applies Remiqora's small patches on top (see
external/patches/README.md), builds/prepares each engine, sets up a
Demucs (stem separation) uv project in external/Demucs, and writes
backend/.env with all of the above plus an auto-detected FFMPEG_BIN_DIR.

Re-run any time - every step is idempotent (skips work that is already done).
#>

param(
    [switch]$SkipBuild,
    [switch]$SkipWeights
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$externalDir = Join-Path $root "external"
$patchesDir = Join-Path $externalDir "patches"

function Write-Step($msg) {
    Write-Host ""
    Write-Host "== $msg ==" -ForegroundColor Cyan
}

function Assert-Command($name, $installHint) {
    if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
        Write-Host "[MISSING] '$name' is not on PATH. $installHint" -ForegroundColor Yellow
        return $false
    }
    return $true
}

function Find-FfmpegBinDir {
    $cmd = Get-Command "ffmpeg.exe" -ErrorAction SilentlyContinue
    if ($cmd) {
        return Split-Path -Parent $cmd.Source
    }
    # Not on PATH yet - most likely setup_prereqs.bat just installed it via
    # winget in *this same terminal*; PATH only picks that up in a new one.
    # Look directly in winget's package cache instead of waiting for that.
    $searchRoots = @(
        (Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages"),
        (Join-Path $env:ProgramFiles "WinGet\Packages")
    ) | Where-Object { Test-Path $_ }
    foreach ($searchRoot in $searchRoots) {
        $found = Get-ChildItem -Path $searchRoot -Filter "ffmpeg.exe" -Recurse -ErrorAction SilentlyContinue |
            Where-Object { $_.FullName -match "Gyan\.FFmpeg" } |
            Select-Object -First 1
        if ($found) {
            return $found.DirectoryName
        }
    }
    return $null
}

function Initialize-Repo($dirName, $repoUrl, $refName, $patchFile) {
    $dir = Join-Path $externalDir $dirName
    if (-not (Test-Path $dir)) {
        Write-Host "Cloning $repoUrl ..."
        git clone $repoUrl $dir
    }

    Push-Location $dir
    try {
        $markerFile = Join-Path $dir ".remiqora-setup-done"
        $alreadyDone = Test-Path $markerFile
        if (-not $alreadyDone) {
            Write-Host "Checking out $refName ..."
            # A plain "git clone" (no --single-branch/--depth) already fetches
            # every branch's full history, so the pinned commit is normally
            # already present - just check it out directly. We deliberately
            # avoid "git fetch origin <sha>": GitHub rejects fetching a raw
            # commit SHA as if it were a ref name ("couldn't find remote ref"),
            # and $ErrorActionPreference = "Stop" turns that expected stderr
            # output into a script-ending exception before the $LASTEXITCODE
            # fallback below ever gets a chance to run.
            $prevPref = $ErrorActionPreference
            $ErrorActionPreference = "Continue"
            git checkout $refName 2>$null
            $checkedOut = ($LASTEXITCODE -eq 0)
            if (-not $checkedOut) {
                # Commit isn't reachable yet (e.g. history was rewritten
                # upstream since this ref was pinned, or this clone happened
                # to be shallow) - fetch everything and retry once.
                git fetch origin 2>$null
                git checkout $refName 2>$null
                $checkedOut = ($LASTEXITCODE -eq 0)
            }
            $ErrorActionPreference = $prevPref
            if (-not $checkedOut) {
                throw "Could not check out '$refName' in $dir - it may no longer exist upstream. See external/patches/README.md for how to bump the pinned commit."
            }

            if ($patchFile) {
                Write-Host "Applying $(Split-Path -Leaf $patchFile) ..."
                git apply --whitespace=nowarn $patchFile
                if ($LASTEXITCODE -ne 0) {
                    # Unlike the git checkout retry above, a failed patch has no
                    # fallback here - without this check, a native git failure
                    # doesn't reliably raise a terminating error even under
                    # $ErrorActionPreference = "Stop" (that only reliably applies
                    # to cmdlets, not exit codes from external processes), so a
                    # broken patch could otherwise fall straight through to the
                    # marker-file write below and get marked "done" while never
                    # having actually been applied.
                    throw "Failed to apply patch '$patchFile' to $dir - see the git apply output above."
                }
            }
            New-Item -ItemType File -Path $markerFile -Force | Out-Null
        } else {
            Write-Host "Already checked out and patched, skipping."
        }
    } finally {
        Pop-Location
    }
    return $dir
}

Write-Step "ACE-Step-1.5"
$aceDir = Initialize-Repo "ACE-Step-1.5" "https://github.com/ace-step/ACE-Step-1.5.git" "ca1e85f" (Join-Path $patchesDir "ace-step.patch")

if (Assert-Command "uv" "Install it from https://docs.astral.sh/uv/getting-started/installation/") {
    Push-Location $aceDir
    try {
        Write-Host "Running 'uv sync' (this also pulls the CUDA build of PyTorch, can take a while) ..."
        uv sync
    } finally {
        Pop-Location
    }
} else {
    Write-Host "Skipped 'uv sync' - install uv and re-run this script." -ForegroundColor Yellow
}

Write-Step "audio.cpp (YuE2)"
# No patch needed here anymore - upstream's dev branch now natively exposes
# the generated/used ABC plan as a response artifact (the one thing our own
# patch used to add), so this is a plain checkout. dev is a moving,
# occasionally force-pushed branch upstream; if this exact commit 404s, bump
# it to a current dev commit (see external/patches/README.md).
$audioCppDir = Initialize-Repo "audio.cpp" "https://github.com/0xShug0/audio.cpp.git" "39f9013" $null

if ($SkipBuild) {
    Write-Host "Skipping build (-SkipBuild passed)."
} else {
    $haveCmake = Assert-Command "cmake" "Install CMake from https://cmake.org/download/"
    $haveNvcc = Assert-Command "nvcc" "Install the CUDA Toolkit from https://developer.nvidia.com/cuda-downloads"
    if ($haveCmake -and $haveNvcc) {
        Push-Location $audioCppDir
        try {
            Write-Host "Building audiocpp_server (CUDA release, yue2+sheetsage2+muscriptor) ..."
            Write-Host "This needs Visual Studio Build Tools (C++ workload) on PATH; if the build" -ForegroundColor DarkGray
            Write-Host "fails here, open a 'Developer PowerShell for VS' and re-run this script." -ForegroundColor DarkGray
            powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\scripts\build_windows.ps1" `
                -Preset windows-cuda-release `
                -ModelSet custom -Models "yue2,sheetsage2,muscriptor" `
                -NativeModelManager `
                -Target audiocpp_server
        } finally {
            Pop-Location
        }
    } else {
        Write-Host "Skipped native build - install the missing tools above, then re-run:" -ForegroundColor Yellow
        Write-Host "  .\setup_models.ps1 " -NoNewline -ForegroundColor Yellow
        Write-Host "(or run the build manually per external/audio.cpp/README.md)" -ForegroundColor Yellow
    }
}

if ($SkipWeights) {
    Write-Step "YuE2/SheetSage2/MuScriptor weights"
    Write-Host "Skipping weight downloads (-SkipWeights passed)."
} elseif (Assert-Command "python" "Install Python 3 and put it on PATH.") {
    Write-Step "YuE2/SheetSage2/MuScriptor weights (~10 GB total)"
    Push-Location $audioCppDir
    try {
        foreach ($pkg in "yue2_main_q8_0", "yue2_main_q4_0", "yue2_vae_f16", "sheetsage2_orig", "muscriptor_small_f32") {
            Write-Host "Installing $pkg ..."
            python tools/model_manager_v2.py install $pkg
        }
    } finally {
        Pop-Location
    }
} else {
    Write-Host "Skipped weight downloads - install Python and re-run this script." -ForegroundColor Yellow
}
# ACE-Step's own checkpoints (acestep-v15-sft, LM, VAE, ...) are not fetched
# here - acestep-api downloads them itself via HuggingFace/ModelScope on its
# first request, the same way its Gradio UI does.

Write-Step "Demucs (stem separation)"
# Not an upstream repo to clone - just a throwaway uv project with the
# `demucs` PyPI package installed into it. Written out explicitly (rather
# than a plain "uv init" + "uv add demucs") to avoid two problems hit in
# practice:
#  1. A bare "uv add demucs" resolves torch from plain PyPI, which on
#     Windows is a CPU-only wheel - stem separation would silently run on
#     CPU instead of alongside the GPU model like the UI expects. Routing
#     "torch" at PyTorch's own cu128 wheel index below (same index
#     ACE-Step-1.5's own pyproject.toml uses) fixes that.
#  2. "uv init"'s default requires-python tracks whatever Python is newest
#     on the machine, which can be newer than what PyTorch's cu128 wheels
#     support yet - uv then falls back to the CPU wheel again, silently.
#     Pinning requires-python to ACE-Step-1.5's own range sidesteps that.
# `numpy` is listed explicitly too: demucs imports it directly (see
# demucs/transformer.py) but its own package metadata doesn't declare it as
# a dependency, so it's otherwise missing and demucs fails to import.
$demucsDir = Join-Path $externalDir "Demucs"
if (-not (Test-Path $demucsDir)) {
    New-Item -ItemType Directory -Path $demucsDir -Force | Out-Null
}
$demucsProjectFile = Join-Path $demucsDir "pyproject.toml"
if (-not (Test-Path $demucsProjectFile)) {
    Write-Host "Writing $demucsProjectFile ..."
    @'
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

[[tool.uv.index]]
name = "pytorch-cu128"
url = "https://download.pytorch.org/whl/cu128"
explicit = true

[tool.uv.sources]
torch = { index = "pytorch-cu128" }
'@ | Set-Content -Encoding utf8 $demucsProjectFile
}

if (Assert-Command "uv" "Install it from https://docs.astral.sh/uv/getting-started/installation/") {
    Push-Location $demucsDir
    try {
        Write-Host "Running 'uv sync' for Demucs (this also pulls the CUDA build of PyTorch, can take a while) ..."
        uv sync
    } finally {
        Pop-Location
    }
} else {
    Write-Host "Skipped Demucs 'uv sync' - install uv and re-run this script." -ForegroundColor Yellow
}

Write-Step "backend/.env"
$envExample = Join-Path $root "backend\.env.example"
$envFile = Join-Path $root "backend\.env"
$ffmpegBinDir = Find-FfmpegBinDir
if ($ffmpegBinDir) {
    Write-Host "Found ffmpeg at $ffmpegBinDir"
} else {
    Write-Host "Could not find ffmpeg (install it via setup_prereqs.bat) - FFMPEG_BIN_DIR will need setting by hand." -ForegroundColor Yellow
}
if (-not (Test-Path $envFile)) {
    $envLines = (Get-Content $envExample) `
        -replace [regex]::Escape("E:\AI\ACE\ACE-Step-1.5"), $aceDir `
        -replace [regex]::Escape("E:\AI\YuE2-3B"), $audioCppDir `
        -replace [regex]::Escape("E:\AI\Demucs"), $demucsDir
    if ($ffmpegBinDir) {
        $envLines = $envLines -replace [regex]::Escape("E:\AI\ACE\tools\ffmpeg-shared\ffmpeg-master-latest-win64-gpl-shared\bin"), $ffmpegBinDir
    }
    $envLines | Set-Content $envFile
    Write-Host "Wrote backend/.env pointing at the cloned repos."
    if ($ffmpegBinDir) {
        Write-Host "Still check CUDA_BIN_DIR in backend/.env for your machine." -ForegroundColor Yellow
    } else {
        Write-Host "Still edit FFMPEG_BIN_DIR and CUDA_BIN_DIR in backend/.env for your machine." -ForegroundColor Yellow
    }
} else {
    Write-Host "backend/.env already exists - not overwriting. Cloned repo paths:"
    Write-Host "  ACE_STEP_DIR=$aceDir"
    Write-Host "  YUE2_DIR=$audioCppDir"
    Write-Host "  DEMUCS_DIR=$demucsDir"
    if ($ffmpegBinDir) {
        Write-Host "  FFMPEG_BIN_DIR=$ffmpegBinDir (detected - edit backend/.env if it doesn't already match)"
    }
}

Write-Step "Done"
Write-Host "Remaining manual steps (see README.md):"
if (-not $ffmpegBinDir) {
    Write-Host "  - Install ffmpeg (setup_prereqs.bat) and point FFMPEG_BIN_DIR at its bin folder."
}
Write-Host "  - ACE-Step's own checkpoints download automatically on its first request."
Write-Host "  - The editor's AI arranger adds parts with the ACE-Step base model (~4.8 GB). Fetch it once:"
Write-Host "      cd $aceDir; uv run acestep-download --model acestep-v15-base"
Write-Host "  - Then run dev.bat or prod_run.bat."
