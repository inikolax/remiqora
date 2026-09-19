#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"

HOST="${REMIQORA_HOST:-0.0.0.0}"
PORT="${REMIQORA_PORT:-9000}"
PYTHON_BIN="${PYTHON_BIN:-python3}"
NODE_BIN="${NODE_BIN:-node}"
NPM_BIN="${NPM_BIN:-npm}"
NODE_BIN_DIR="$(dirname "$NODE_BIN")"
export PATH="$NODE_BIN_DIR:$PATH"

if [[ ! -x backend/.venv/bin/python3 ]]; then
  "$PYTHON_BIN" -m venv backend/.venv
  backend/.venv/bin/python3 -m pip install --upgrade pip
  backend/.venv/bin/pip install -r backend/requirements.txt
fi

if [[ ! -d frontend/node_modules ]]; then
  (cd frontend && "$NPM_BIN" ci)
fi
(cd frontend && "$NPM_BIN" run build)
cd backend
exec .venv/bin/python3 -m uvicorn app.main:app --host "$HOST" --port "$PORT"
