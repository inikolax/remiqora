#Requires -Version 5.1
<#
Installs the developer toolchain Remiqora's other scripts need, via winget (built into Windows 10/11; if missing,
install "App Installer" from the Microsoft Store first).

NOT covered here, on purpose:
  - The NVIDIA GPU driver. Get it from https://www.nvidia.com/drivers for your exact card: an unattended driver
    swap can break your display, and winget's driver packages are less reliable than NVIDIA's own installer.
  - CUDA Toolkit and Visual Studio Build Tools ARE installed below, but they are multi-GB downloads and need
    Administrator rights. Run with -SkipHeavy to install only the small, fast tools (git/python/uv/node/cmake/
    ffmpeg) and do those two by hand instead.

Re-run any time: winget skips packages that are already installed.
#>
param([switch]$SkipHeavy)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
. (Join-Path $root 'scripts\install_console.ps1')
Select-Language
try { $Host.UI.RawUI.WindowTitle = T 'Remiqora — подготовка компьютера' 'Remiqora — preparing the computer' } catch { }
Show-Banner (T 'Подготовка компьютера' 'Preparing the computer')

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Fail (T 'winget не найден. Установите «Установщик приложений» (App Installer) из Microsoft Store и запустите ещё раз.' 'winget was not found. Install App Installer from the Microsoft Store and run this again.')
    Note 'https://apps.microsoft.com/detail/9nblggh4nns1'
    Wait-Close
    exit 1
}

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin -and -not $SkipHeavy) {
    Write-Host ''
    Warn (T 'Окно запущено без прав администратора: Build Tools и CUDA могут не установиться.' 'Not running as Administrator: Build Tools and CUDA may fail to install.')
    Note (T 'Если так и выйдет, запустите setup_prereqs.bat от имени администратора.' 'If that happens, run setup_prereqs.bat as Administrator.')
}

$failed = @()
function Install-Package([string]$Id, [string]$Title, [string]$Override = '') {
    Step $Title
    $installed = winget list --id $Id --accept-source-agreements 2>$null | Select-String -SimpleMatch $Id
    if ($installed) { Ok (T 'Уже установлено' 'Already installed'); return }
    $wingetArgs = @('install', '--id', $Id, '--silent', '--accept-package-agreements', '--accept-source-agreements')
    if ($Override) { $wingetArgs += @('--override', $Override) }
    winget @wingetArgs
    if ($LASTEXITCODE -ne 0) {
        Warn (T "Не удалось установить автоматически ($Id). Поставьте вручную с официального сайта." "Could not install it automatically ($Id). Install it by hand from its official site.")
        $script:failed += $Title
    } else { Ok (T 'Установлено' 'Installed') }
}

Install-Package 'Git.Git' 'Git'
Install-Package 'Python.Python.3.12' 'Python 3.12'
Install-Package 'astral-sh.uv' (T 'uv — менеджер окружений Python' 'uv — the Python environment manager')
Install-Package 'OpenJS.NodeJS.LTS' 'Node.js LTS'
Install-Package 'Kitware.CMake' 'CMake'
Install-Package 'Gyan.FFmpeg' (T 'FFmpeg — обработка звука' 'FFmpeg — audio processing')

if ($SkipHeavy) {
    Write-Host ''
    Warn (T 'Build Tools и CUDA пропущены (-SkipHeavy). Установите их вручную:' 'Build Tools and CUDA skipped (-SkipHeavy). Install them by hand:')
    Note 'https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022  (C++)'
    Note 'https://developer.nvidia.com/cuda-downloads'
} else {
    Install-Package 'Microsoft.VisualStudio.2022.BuildTools' (T 'Visual Studio Build Tools (C++), несколько ГБ' 'Visual Studio Build Tools (C++), several GB') '--wait --quiet --add Microsoft.VisualStudio.Workload.VCTools --includeRecommended'
    Install-Package 'Nvidia.CUDA' (T 'CUDA Toolkit, несколько ГБ' 'CUDA Toolkit, several GB')
}

Step (T 'Драйвер видеокарты' 'The graphics driver')
Note (T 'Драйвер NVIDIA ставится вручную, с официального сайта под вашу карту:' 'Install the NVIDIA driver by hand, from the official site for your card:')
Note 'https://www.nvidia.com/drivers'

Write-Host ''
if ($failed.Count) {
    Write-Host ('  ' + (C $cAmber '!' -Bold) + ' ' + (C $cAmber ((T 'Не установилось: ' 'Not installed: ') + ($failed -join ', ')) -Bold))
} else {
    Write-Host ('  ' + (C $cGreen '✓' -Bold) + ' ' + (C $cGreen (T 'Инструменты готовы.' 'The tools are ready.') -Bold))
}
Write-Host ('  ' + (T 'Закройте это окно, откройте новое и запустите ' 'Close this window, open a new one and run ') + (C $cCyan 'install.bat' -Bold) + (T ' ещё раз.' ' again.'))
Wait-Close
