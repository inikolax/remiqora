#Requires -Version 5.1
<#
Starts Remiqora from source (dev.bat, prod_run.bat).
  -Mode prod : builds the page and runs the server in this window on http://127.0.0.1:9000 (the server serves the page)
  -Mode dev  : the server with auto-reload and Vite with hot reload, each in its own window; the browser on Vite
  -NoBrowser : do not open the browser
The first run creates the server's Python environment and installs the page's packages.
#>
param([ValidateSet('dev', 'prod')][string]$Mode = 'prod', [switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
. (Join-Path $root 'scripts\install_console.ps1')
Update-SessionPath
$port = 9000
$vitePort = 5173
$title = if ($Mode -eq 'dev') { T 'Remiqora — разработка' 'Remiqora — development' } else { 'Remiqora' }
try { $Host.UI.RawUI.WindowTitle = $title } catch { }
Show-Banner $(if ($Mode -eq 'dev') { T 'Запуск для разработки' 'Development launcher' } else { T 'Запуск' 'Launcher' })

trap {
    Write-Host ''
    Fail ((T 'Запуск не удался: ' 'Could not start: ') + $_.Exception.Message)
    Wait-Close
    exit 1
}

$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'
$python = Join-Path $backend '.venv\Scripts\python.exe'

function Wait-Url([string]$Url, [int]$Seconds, [string]$What) {
    $frames = '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'
    $start = Get-Date
    $i = 0
    while (((Get-Date) - $start).TotalSeconds -lt $Seconds) {
        try {
            $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
            if ($r.StatusCode -lt 500) {
                if ($script:tty) { Write-Host ("`r" + (' ' * 70) + "`r") -NoNewline }
                return $true
            }
        } catch { }
        if ($script:tty) {
            $s = [int]((Get-Date) - $start).TotalSeconds
            Write-Host ("`r  " + (C $cViolet $frames[$i % $frames.Count]) + " $What " + (Dim "$s s")) -NoNewline
        }
        $i++
        Start-Sleep -Milliseconds 400
    }
    if ($script:tty) { Write-Host '' }
    return $false
}

function Open-Browser([string]$Url) { if (-not $NoBrowser) { Start-Process $Url } }

function Test-PortBusy([int]$Port) {
    # both loopbacks: Vite listens on "localhost", which is often ::1 only
    foreach ($address in '127.0.0.1', '::1') {
        try { $c = New-Object Net.Sockets.TcpClient($address, $Port); $c.Close(); return $true } catch { }
    }
    return $false
}

# ---------------------------------------------------------------- preparation
Step (T 'Проверка' 'Checks')
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw (T 'Не найден Node.js. Запустите install.bat или поставьте его с https://nodejs.org' 'Node.js was not found. Run install.bat or get it from https://nodejs.org') }
if (Test-PortBusy $port) {
    Warn (T "Порт $port уже занят: похоже, Remiqora уже запущена." "Port $port is already taken: Remiqora seems to be running already.")
    Note (T 'Открываю её в браузере.' 'Opening it in the browser.')
    Open-Browser "http://127.0.0.1:$port"
    Wait-Close
    exit 0
}
if (-not (Test-Path (Join-Path $backend '.env'))) { Warn (T 'Нет backend\.env: движки не настроены. Сначала запустите install.bat.' 'No backend\.env: the engines are not set up. Run install.bat first.') }
Ok (T 'Всё на месте' 'Everything is in place')

if (-not (Test-Path $python)) {
    Step (T 'Окружение сервера (первый запуск)' 'The server environment (first run)')
    Invoke-Native python @('-m', 'venv', (Join-Path $backend '.venv'))
    Invoke-Native $python @('-m', 'pip', 'install', '-q', '--upgrade', 'pip')
    Invoke-Native $python @('-m', 'pip', 'install', '-q', '-r', (Join-Path $backend 'requirements.txt'))
    Ok (T 'Готово' 'Done')
}
if (-not (Test-Path (Join-Path $frontend 'node_modules'))) {
    Step (T 'Пакеты страницы (первый запуск)' "The page's packages (first run)")
    Invoke-Native npm @('--prefix', $frontend, 'install', '--no-audit', '--no-fund')
    Ok (T 'Готово' 'Done')
}

# ---------------------------------------------------------------- development: two windows
if ($Mode -eq 'dev') {
    Step (T 'Запуск' 'Starting')
    # Vite would move to the next port by itself when 5173 is taken (Remiqora Video uses it), and this window would
    # then open the other program's page: the port is picked here and held with --strictPort
    while (Test-PortBusy $vitePort) { $vitePort++ }
    # the server with auto-reload of app/ (backend/run.bat runs it without), started by its full path: with
    # NoDefaultCurrentDirectoryInExePath set, cmd does not look for "run.bat" in the current folder
    Start-Process cmd.exe -ArgumentList '/k', "title Remiqora Backend && `"$python`" -m uvicorn app.main:app --host 127.0.0.1 --port $port --reload --reload-dir app" -WorkingDirectory $backend
    Start-Process cmd.exe -ArgumentList '/k', "title Remiqora Frontend && npm run dev -- --port $vitePort --strictPort" -WorkingDirectory $frontend
    $apiUp = Wait-Url "http://127.0.0.1:$port/api/orchestrator/status" 90 (T 'жду сервер' 'waiting for the server')
    if ($apiUp) { Ok ((T 'Сервер   ' 'Server   ') + (C $cCyan "http://127.0.0.1:$port")) } else { Warn (T 'Сервер не ответил за 90 с: смотрите окно «Remiqora Backend».' 'The server did not answer in 90 s: see the "Remiqora Backend" window.') }
    $viteUp = Wait-Url "http://localhost:$vitePort" 60 (T 'жду страницу' 'waiting for the page')
    if ($viteUp) { Ok ((T 'Страница ' 'Page     ') + (C $cCyan "http://localhost:$vitePort")) } else { Warn (T 'Vite не ответил за 60 с: смотрите окно «Remiqora Frontend».' 'Vite did not answer in 60 s: see the "Remiqora Frontend" window.') }
    Open-Browser "http://localhost:$vitePort"
    Write-Host ''
    Note (T 'Правки страницы подхватываются в браузере сразу, правки Python перезапускают сервер.' 'Page edits hot-reload in the browser; Python edits restart the server.')
    Note (T 'Остановка: закройте окна «Remiqora Backend» и «Remiqora Frontend».' 'To stop: close the "Remiqora Backend" and "Remiqora Frontend" windows.')
    if (-not ($apiUp -and $viteUp)) { Wait-Close }   # this window has nothing more to do once both are up
    exit 0
}

# ---------------------------------------------------------------- production: the server in this window
Step (T 'Сборка страницы' 'Building the page')
# The build's own listing goes to a log; the window shows it only when the build fails
$logs = Join-Path $backend 'logs'
New-Item -ItemType Directory -Path $logs -Force | Out-Null
$buildLog = Join-Path $logs 'frontend-build.log'
Push-Location $frontend
try {
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'   # npm writes warnings to stderr
    & cmd.exe /c "npm run build > `"$buildLog`" 2>&1"
    $code = $LASTEXITCODE
    $ErrorActionPreference = $prev
} finally { Pop-Location }
if ($code -ne 0) {
    Get-Content $buildLog -Tail 30 | ForEach-Object { Write-Host "    $_" }
    throw (T "сборка страницы не удалась (весь вывод: $buildLog)" "the page did not build (full output: $buildLog)")
}
Ok (T 'Собрана' 'Built')

Step (T 'Запуск' 'Starting')
$server = Start-Process $python -ArgumentList '-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', "$port", '--no-access-log', '--log-level', 'warning' -WorkingDirectory $backend -NoNewWindow -PassThru
if (Wait-Url "http://127.0.0.1:$port/api/orchestrator/status" 90 (T 'жду сервер' 'waiting for the server')) {
    Write-Host ''
    Write-Host ('  ' + (C $cGreen '✓' -Bold) + ' ' + (C $cGreen (T 'Remiqora работает: ' 'Remiqora is running: ') -Bold) + (C $cCyan "http://127.0.0.1:$port" -Bold))
    Note (T 'Чтобы остановить, закройте это окно (или Ctrl+C). Ниже — сообщения сервера.' 'To stop, close this window (or press Ctrl+C). Server messages follow.')
    Write-Host ('  ' + (Dim ('─' * 64)))
    Open-Browser "http://127.0.0.1:$port"
} else {
    Warn (T 'Сервер не ответил за 90 с; журнал ниже.' 'The server did not answer in 90 s; its log follows.')
}
$server.WaitForExit()
exit $server.ExitCode
