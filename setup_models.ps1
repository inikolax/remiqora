#Requires -Version 5.1
<#
Clones the original ACE-Step-1.5 and audio.cpp (YuE2) repositories into external/, applies Remiqora's small patches
on top (see external/patches/README.md), builds/prepares each engine, sets up a Demucs (stem separation) uv project in
external/Demucs, the Stable Audio 3 server environment (external/sa3-server), the prompt assistant, and writes
backend/.env with all of the above plus an auto-detected FFMPEG_BIN_DIR.

Stable Audio 3 weights are downloaded from the app (the Stable Audio 3 page), or here with -StableAudioModels,
e.g. -StableAudioModels small-sfx,medium. The ACE-Step base model the AI arranger needs: -AceBase (asked when the
script runs in a window).

Re-run any time: every step skips work that is already done. A newer ACE-Step patch is applied again on the next run,
keeping the environment and the downloaded models.
#>
param(
    [switch]$SkipStableAudio,
    # Stable Audio 3 checkpoints to download after the environment: medium, small-music, small-sfx and their -base
    # twins. The first three are gated (licence + Hugging Face token, see below).
    [string[]]$StableAudioModels = @(),
    [switch]$SkipPromptAssistant,
    # The prompt assistant's language model to download right away (default: none, the Models page does it),
    # e.g. -PromptAssistantModel Qwen/Qwen3.5-2B
    [string]$PromptAssistantModel = '',
    # The ACE-Step base model (~4.8 GB) for the editor's AI arranger: download it now without asking
    [switch]$AceBase,
    [switch]$SkipBuild,
    [switch]$SkipWeights
)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$externalDir = Join-Path $root 'external'
$patchesDir = Join-Path $externalDir 'patches'
. (Join-Path $root 'scripts\install_console.ps1')
Select-Language
try { $Host.UI.RawUI.WindowTitle = T 'Remiqora — установка' 'Remiqora — install' } catch { }
Show-Banner (T 'Установка движков и моделей' 'Installing the engines and models')
Update-SessionPath

# A failure ends in one clear red line; the window stays up when the .bat was double-clicked
trap {
    Write-Host ''
    Fail ((T 'Установка остановилась: ' 'The install stopped: ') + $_.Exception.Message)
    Note (T 'Запустите её ещё раз: готовое не делается заново, загрузки продолжатся с того же места.' 'Run it again: what is done stays done, downloads continue where they stopped.')
    Wait-Close
    exit 1
}

$warnings = New-Object System.Collections.Generic.List[string]
function Need([string]$Name, [string]$Hint) {
    if (Get-Command $Name -ErrorAction SilentlyContinue) { return $true }
    Warn ((T "Не найдено: $Name. " "Not found: $Name. ") + $Hint)
    $script:warnings.Add($Name)
    return $false
}
$prereqHint = T 'Запустите setup_prereqs.bat, затем откройте новое окно.' 'Run setup_prereqs.bat, then open a new window.'

function Find-FfmpegBinDir {
    $cmd = Get-Command 'ffmpeg.exe' -ErrorAction SilentlyContinue
    if ($cmd) { return Split-Path -Parent $cmd.Source }
    # Not on PATH yet: setup_prereqs.bat may have just installed it with winget. Look in winget's package folders.
    $searchRoots = @((Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Packages'), (Join-Path $env:ProgramFiles 'WinGet\Packages')) | Where-Object { Test-Path $_ }
    foreach ($searchRoot in $searchRoots) {
        $found = Get-ChildItem -Path $searchRoot -Filter 'ffmpeg.exe' -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -match 'Gyan\.FFmpeg' } | Select-Object -First 1
        if ($found) { return $found.DirectoryName }
    }
    return $null
}

function Get-PatchHash([string]$PatchFile) {
    if (-not $PatchFile) { return 'nopatch' }
    (Get-FileHash -Algorithm SHA1 -LiteralPath $PatchFile).Hash.Substring(0, 12).ToLowerInvariant()
}

# Files a patch adds ("new file mode"): they are removed before the patch is applied again
function Get-PatchNewFiles([string]$PatchFile) {
    $lines = [IO.File]::ReadAllLines($PatchFile)
    $files = @()
    for ($i = 0; $i -lt $lines.Count - 1; $i++) {
        if ($lines[$i] -match '^diff --git a/(.+) b/(.+)$' -and $lines[$i + 1] -like 'new file mode*') { $files += $Matches[2] }
    }
    return $files
}

function Initialize-Repo([string]$DirName, [string]$RepoUrl, [string]$RefName, [string]$PatchFile) {
    $dir = Join-Path $externalDir $DirName
    if (-not (Test-Path $dir)) {
        Note ((T 'Клонирую ' 'Cloning ') + $RepoUrl)
        Invoke-Native git @('clone', '-q', $RepoUrl, $dir)
    }
    # The marker holds the hash of the patch that was applied: a newer patch is applied again on the next run
    $marker = Join-Path $dir '.remiqora-setup-done'
    $wanted = Get-PatchHash $PatchFile
    $applied = if (Test-Path $marker) { ([IO.File]::ReadAllText($marker)).Trim() } else { $null }
    if ($applied -eq $wanted) {
        if ($PatchFile) { Ok (T 'Исходники на месте, патч применён' 'The source is in place, the patch applied') } else { Ok (T 'Исходники на месте' 'The source is in place') }
        return $dir
    }

    Push-Location $dir
    try {
        if ($null -ne $applied -and $PatchFile) {
            Note (T 'Вышла новая версия патча: накладываю заново (окружение и модели остаются).' 'A newer patch: applying it again (the environment and the models stay).')
            # Undo the old patch: files it added go away, tracked files return to the pinned commit. Untracked folders
            # (checkpoints, .venv, LoRAs) are not touched.
            foreach ($rel in Get-PatchNewFiles $PatchFile) {
                $path = Join-Path $dir $rel
                if (Test-Path -LiteralPath $path) { Remove-Item -LiteralPath $path -Force }
            }
        }
        # A plain clone already has every branch's history, so the pinned commit is normally there. No
        # "git fetch origin <sha>": GitHub rejects a raw SHA as a ref name.
        $prev = $ErrorActionPreference
        $ErrorActionPreference = 'Continue'
        git -c advice.detachedHead=false checkout -q --force $RefName 2>$null
        $ok = ($LASTEXITCODE -eq 0)
        if (-not $ok) {
            git fetch -q origin 2>$null
            git -c advice.detachedHead=false checkout -q --force $RefName 2>$null
            $ok = ($LASTEXITCODE -eq 0)
        }
        $ErrorActionPreference = $prev
        if (-not $ok) { throw (T "Не удалось переключиться на $RefName в $dir. Как обновить закреплённую версию: external/patches/README.md." "Could not check out $RefName in $dir. How to bump the pinned commit: external/patches/README.md.") }
        if ($PatchFile) {
            Note ((T 'Накладываю ' 'Applying ') + (Split-Path -Leaf $PatchFile))
            git apply --whitespace=nowarn $PatchFile
            # a native git failure does not stop the script by itself: without this the marker would say "done"
            if ($LASTEXITCODE -ne 0) { throw (T "Патч $PatchFile не наложился на $dir (вывод git выше)." "The patch $PatchFile did not apply to $dir (git output above).") }
        }
        [IO.File]::WriteAllText($marker, $wanted)
        Ok (T "Версия $RefName готова" "Version $RefName is ready")
    } finally {
        Pop-Location
    }
    return $dir
}

function Sync-Project([string]$Dir, [string]$What) {
    Note ((T 'Окружение Python для ' 'The Python environment for ') + $What + (T ': uv sync (вместе с PyTorch для CUDA, может занять время)' ': uv sync (with PyTorch for CUDA, this can take a while)'))
    Push-Location $Dir
    try { Invoke-Native uv @('sync') } finally { Pop-Location }
    Ok (T 'Окружение готово' 'The environment is ready')
}

# ---------------------------------------------------------------- ACE-Step
Step 'ACE-Step 1.5'
Need 'git' $prereqHint | Out-Null
$aceDir = Initialize-Repo 'ACE-Step-1.5' 'https://github.com/ace-step/ACE-Step-1.5.git' 'ca1e85f' (Join-Path $patchesDir 'ace-step.patch')
$haveUv = Need 'uv' $prereqHint
if ($haveUv) { Sync-Project $aceDir 'ACE-Step' }

# ---------------------------------------------------------------- YuE2
Step 'YuE2 (audio.cpp)'
# No patch: upstream's dev branch exposes the ABC plan itself. dev is a moving, sometimes force-pushed branch; if this
# commit disappears, bump it (external/patches/README.md).
$audioCppDir = Initialize-Repo 'audio.cpp' 'https://github.com/0xShug0/audio.cpp.git' '39f9013' $null
if ($SkipBuild) {
    Note (T 'Сборка пропущена (-SkipBuild).' 'Build skipped (-SkipBuild).')
} else {
    $haveCmake = Need 'cmake' $prereqHint
    $haveNvcc = Need 'nvcc' (T 'Установите CUDA Toolkit: https://developer.nvidia.com/cuda-downloads' 'Install the CUDA Toolkit: https://developer.nvidia.com/cuda-downloads')
    $server = Join-Path $audioCppDir 'build\windows-cuda-release\bin\audiocpp_server.exe'
    if (Test-Path $server) {
        Ok (T 'audiocpp_server уже собран' 'audiocpp_server is already built')
    } elseif ($haveCmake -and $haveNvcc) {
        Note (T 'Собираю audiocpp_server (CUDA, yue2 + sheetsage2 + muscriptor). Нужны Visual Studio Build Tools (C++);' 'Building audiocpp_server (CUDA, yue2 + sheetsage2 + muscriptor). This needs Visual Studio Build Tools (C++);')
        Note (T 'если сборка не пойдёт, откройте «Developer PowerShell for VS» и запустите скрипт оттуда.' 'if the build fails, open "Developer PowerShell for VS" and run this script from there.')
        Push-Location $audioCppDir
        try {
            powershell.exe -NoProfile -ExecutionPolicy Bypass -File '.\scripts\build_windows.ps1' -Preset windows-cuda-release -ModelSet custom -Models 'yue2,sheetsage2,muscriptor' -NativeModelManager -Target audiocpp_server
            if ($LASTEXITCODE -ne 0) { throw (T 'Сборка audiocpp_server не удалась (вывод выше).' 'The audiocpp_server build failed (output above).') }
        } finally { Pop-Location }
        Ok (T 'audiocpp_server собран' 'audiocpp_server is built')
    } else {
        Warn (T 'Сборка пропущена: не хватает инструментов выше. Поставьте их и запустите скрипт ещё раз.' 'Build skipped: tools above are missing. Install them and run this script again.')
    }
}

Step (T 'Модели YuE2, SheetSage2, MuScriptor (~10 ГБ)' 'YuE2, SheetSage2, MuScriptor models (~10 GB)')
if ($SkipWeights) {
    Note (T 'Пропущено (-SkipWeights).' 'Skipped (-SkipWeights).')
} elseif (Need 'python' $prereqHint) {
    Push-Location $audioCppDir
    try {
        foreach ($pkg in 'yue2_main_q8_0', 'yue2_main_q4_0', 'yue2_vae_f16', 'sheetsage2_orig', 'muscriptor_small_f32') {
            Note $pkg
            Invoke-Native python @('tools/model_manager_v2.py', 'install', $pkg)
        }
    } finally { Pop-Location }
    Ok (T 'Модели на месте' 'The models are in place')
}

# ---------------------------------------------------------------- Demucs
Step (T 'Demucs — разделение на стемы' 'Demucs — stem separation')
# A small uv project with the demucs package. torch is routed at PyTorch's cu128 index (plain PyPI has a CPU-only
# wheel on Windows) and requires-python is pinned to ACE-Step's range (newer Pythons fall back to the CPU wheel).
# numpy is listed because demucs imports it without declaring it.
$demucsDir = Join-Path $externalDir 'Demucs'
New-Item -ItemType Directory -Path $demucsDir -Force | Out-Null
$demucsProjectFile = Join-Path $demucsDir 'pyproject.toml'
if (-not (Test-Path $demucsProjectFile)) {
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
if ($haveUv) { Sync-Project $demucsDir 'Demucs' }

# ---------------------------------------------------------------- Stable Audio 3
Step 'Stable Audio 3'
# Our own server around Stability's stable-audio-3 package, tracked in the repository. medium, small-music and
# small-sfx are gated: accept the licence on huggingface.co and save a token (in the app, or with
# "external\sa3-server\.venv\Scripts\hf.exe auth login"). The -base checkpoints are open.
$stableAudioDir = Join-Path $externalDir 'sa3-server'
if (-not (Test-Path (Join-Path $stableAudioDir 'pyproject.toml'))) {
    Warn (T 'В этой копии нет external/sa3-server: Stable Audio 3 пропущен.' 'external/sa3-server is missing from this checkout: Stable Audio 3 skipped.')
} elseif ($SkipStableAudio) {
    Note (T 'Пропущено (-SkipStableAudio).' 'Skipped (-SkipStableAudio).')
} elseif ($haveUv) {
    Sync-Project $stableAudioDir 'Stable Audio 3'
    $sa3Python = Join-Path $stableAudioDir '.venv\Scripts\python.exe'
    foreach ($model in ($StableAudioModels | ForEach-Object { $_ -split ',' } | Where-Object { $_ })) {
        Note ((T 'Скачиваю ' 'Downloading ') + $model.Trim())
        & $sa3Python -m sa3_server.download $model.Trim()
        if ($LASTEXITCODE -ne 0) { Warn (T "Не скачалось: $model. Его можно скачать позже на странице Stable Audio 3." "Not downloaded: $model. Download it later on the Stable Audio 3 page.") }
    }
    if (-not $StableAudioModels) { Note (T 'Веса скачиваются в приложении, на странице Stable Audio 3.' 'The weights are downloaded in the app, on the Stable Audio 3 page.') }
}

# ---------------------------------------------------------------- the prompt assistant
Step (T 'Помощник промтов' 'The prompt assistant')
$assistantDir = Join-Path $externalDir 'prompt-assistant'
if (-not (Test-Path (Join-Path $assistantDir 'pyproject.toml'))) {
    Warn (T 'В этой копии нет external/prompt-assistant: помощник пропущен.' 'external/prompt-assistant is missing from this checkout: the assistant skipped.')
} elseif ($SkipPromptAssistant) {
    Note (T 'Пропущено (-SkipPromptAssistant).' 'Skipped (-SkipPromptAssistant).')
} elseif ($haveUv) {
    Sync-Project $assistantDir (T 'помощника' 'the assistant')
    if ($PromptAssistantModel) {
        Invoke-Native (Join-Path $assistantDir '.venv\Scripts\python.exe') @('-m', 'prompt_assistant.download', $PromptAssistantModel)
    } else {
        Note (T 'Его модель скачивается в приложении, на странице «Модели».' 'Its model is downloaded in the app, on the Models page.')
    }
}

# ---------------------------------------------------------------- the ACE-Step base model
Step (T 'Base-модель ACE-Step для ИИ-аранжировщика (~4,8 ГБ)' 'The ACE-Step base model for the AI arranger (~4.8 GB)')
$baseFolder = Join-Path $aceDir 'checkpoints\acestep-v15-base'
$basePartial = @(Get-ChildItem -LiteralPath (Join-Path $baseFolder '.cache\huggingface\download') -Filter '*.incomplete' -ErrorAction SilentlyContinue)
$baseReady = (Test-Path (Join-Path $baseFolder 'model.safetensors')) -and $basePartial.Count -eq 0
if ($baseReady) {
    Ok (T 'Уже скачана' 'Already downloaded')
} elseif (-not $haveUv -or $SkipWeights) {
    Note (T 'Пропущено.' 'Skipped.')
} else {
    $want = $AceBase
    if (-not $want) {
        $answer = Ask (T 'Скачать сейчас? Без неё не работает «Добавить партию» (y/N)' 'Download it now? "Add a part" needs it (y/N)') 'N'
        $want = ($null -ne $answer) -and ($answer -match '^[yYдД]')
    }
    if ($want) {
        # --with hf_xet: the models are on Xet storage, plain HTTP was ~80 times slower; --force resumes a half download
        Push-Location $aceDir
        try { Invoke-Native uv @('run', '--with', 'hf_xet', 'acestep-download', '--force', '--model', 'acestep-v15-base') } finally { Pop-Location }
        Ok (T 'Скачана' 'Downloaded')
    } else {
        Note (T 'Позже: запустите setup_models.bat -AceBase, или скачайте её из приложения.' 'Later: run setup_models.bat -AceBase, or download it from the app.')
    }
}

# ---------------------------------------------------------------- backend/.env
Step (T 'Настройки сервера (backend\.env)' 'Server settings (backend\.env)')
$envExample = Join-Path $root 'backend\.env.example'
$envFile = Join-Path $root 'backend\.env'
$ffmpegBinDir = Find-FfmpegBinDir
if ($ffmpegBinDir) { Info 'FFmpeg:' $ffmpegBinDir } else { Warn (T 'FFmpeg не найден: поставьте его через setup_prereqs.bat.' 'FFmpeg was not found: install it with setup_prereqs.bat.'); $warnings.Add('ffmpeg') }
if (-not (Test-Path $envFile)) {
    $envLines = (Get-Content $envExample) `
        -replace [regex]::Escape('E:\AI\ACE\ACE-Step-1.5'), $aceDir `
        -replace [regex]::Escape('E:\AI\YuE2-3B'), $audioCppDir `
        -replace [regex]::Escape('E:\AI\Demucs'), $demucsDir `
        -replace [regex]::Escape('E:\AI\StableAudio'), $stableAudioDir
    if ($ffmpegBinDir) { $envLines = $envLines -replace [regex]::Escape('E:\AI\ACE\tools\ffmpeg-shared\ffmpeg-master-latest-win64-gpl-shared\bin'), $ffmpegBinDir }
    $envLines | Set-Content $envFile
    Ok (T 'Записан backend\.env с путями к движкам' 'Wrote backend\.env with the engine paths')
    Note (T 'Проверьте в нём CUDA_BIN_DIR для этого компьютера.' 'Check CUDA_BIN_DIR in it for this computer.')
} else {
    Ok (T 'backend\.env уже есть, не трогаю' 'backend\.env already exists, left as it is')
    Info 'ACE_STEP_DIR' $aceDir
    Info 'YUE2_DIR' $audioCppDir
    Info 'DEMUCS_DIR' $demucsDir
    Info 'STABLE_AUDIO_DIR' $stableAudioDir
}

# ---------------------------------------------------------------- done
Write-Host ''
Write-Host ('  ' + (Dim ('─' * 64)))
if ($warnings.Count) {
    Write-Host ('  ' + (C $cAmber '!' -Bold) + ' ' + (C $cAmber ((T 'Установка завершена не полностью, не хватает: ' 'The install is not complete, missing: ') + (($warnings | Select-Object -Unique) -join ', ')) -Bold))
    Note (T 'Поставьте недостающее (setup_prereqs.bat) и запустите install.bat ещё раз.' 'Install what is missing (setup_prereqs.bat) and run install.bat again.')
} else {
    Write-Host ('  ' + (C $cGreen '✓' -Bold) + ' ' + (C $cGreen (T 'Установка завершена.' 'Install finished.') -Bold))
}
Write-Host ('  ' + (T 'Запуск: ' 'Start: ') + (C $cCyan 'prod_run.bat' -Bold) + (T '  ·  для разработки: ' '  ·  for development: ') + (C $cCyan 'dev.bat' -Bold))
Note (T 'Модели ACE-Step скачаются сами при первой генерации.' "ACE-Step's models download by themselves on the first generation.")
Wait-Close
