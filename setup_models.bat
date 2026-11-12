@echo off
setlocal
cd /d "%~dp0"
rem Started by a double click (cmd /c "this.bat", no arguments): the script waits for Enter at the end, so the window stays readable
set "REMIQORA_WAIT="
if "%~1"=="" if not defined REMIQORA_NO_PAUSE echo %cmdcmdline% | find /i "%~nx0" >nul && set "REMIQORA_WAIT=1"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0setup_models.ps1" %*
exit /b %errorlevel%
