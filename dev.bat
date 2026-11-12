@echo off
setlocal
cd /d "%~dp0"
rem The server with auto-reload and Vite with hot reload, each in its own window; the browser on Vite.
rem Started by a double click: the window stays up after a failure, so its message can be read
set "REMIQORA_WAIT="
if "%~1"=="" if not defined REMIQORA_NO_PAUSE echo %cmdcmdline% | find /i "%~nx0" >nul && set "REMIQORA_WAIT=1"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\launch.ps1" -Mode dev %*
exit /b %errorlevel%
