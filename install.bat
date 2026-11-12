@echo off
setlocal
cd /d "%~dp0"
rem Remiqora from source in one go: the toolchain if something is missing, then the engines and the models.
rem Started by a double click (cmd /c "this.bat", no arguments): the script waits for Enter at the end, so the window stays readable
set "REMIQORA_WAIT="
if "%~1"=="" if not defined REMIQORA_NO_PAUSE echo %cmdcmdline% | find /i "%~nx0" >nul && set "REMIQORA_WAIT=1"

where git >nul 2>nul
if errorlevel 1 goto prereqs
where uv >nul 2>nul
if errorlevel 1 goto prereqs
where python >nul 2>nul
if errorlevel 1 goto prereqs
where npm >nul 2>nul
if errorlevel 1 goto prereqs

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup_models.ps1" %*
exit /b %errorlevel%

:prereqs
rem setup_prereqs.ps1 ends by asking for a new window and install.bat again
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup_prereqs.ps1" %*
exit /b %errorlevel%
