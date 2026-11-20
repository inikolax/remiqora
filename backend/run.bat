@echo off
setlocal
cd /d "%~dp0"
set "SSLKEYLOGFILE="

if not exist ".venv\Scripts\python.exe" (
    echo [Setup] Creating virtual environment...
    python -m venv .venv
    call ".venv\Scripts\python.exe" -m pip install --upgrade pip
    call ".venv\Scripts\pip.exe" install -r requirements.txt
)

echo Starting Remiqora backend on http://127.0.0.1:9000
".venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 9000
endlocal
