#!/usr/bin/env bash
# Starts Remiqora on Linux: builds the page and runs the server, which serves it, on http://127.0.0.1:9000.
#   REMIQORA_HOST / REMIQORA_PORT   where it listens (127.0.0.1:9000). Remiqora has no login: 0.0.0.0 only on a
#                                   trusted network or behind an authenticating reverse proxy.
#   REMIQORA_LANG=ru|en             the language of the messages
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

HOST="${REMIQORA_HOST:-127.0.0.1}"
PORT="${REMIQORA_PORT:-9000}"
PYTHON_BIN="${PYTHON_BIN:-python3}"
NODE_BIN="${NODE_BIN:-node}"
NPM_BIN="${NPM_BIN:-npm}"
NODE_BIN_DIR="$(dirname "$NODE_BIN")"
export PATH="$NODE_BIN_DIR:$PATH"
LOGS="$ROOT/backend/logs"
mkdir -p "$LOGS"

# shellcheck source=scripts/console.sh
source "$ROOT/scripts/console.sh"
banner "$(t 'Запуск' 'Launcher')"

on_error() {
  local code=$?
  printf '\n'
  fail "$(t "Запуск не удался (код $code)." "Could not start (code $code).")"
  exit "$code"
}
trap on_error ERR

step "$(t 'Проверка' 'Checks')"
if curl -s -m 2 -o /dev/null "http://127.0.0.1:$PORT/api/orchestrator/status" 2>/dev/null; then
  warn "$(t "Порт $PORT уже занят: похоже, Remiqora уже запущена — http://127.0.0.1:$PORT" "Port $PORT is already taken: Remiqora seems to be running already — http://127.0.0.1:$PORT")"
  exit 0
fi
[[ -f backend/.env ]] || warn "$(t 'Нет backend/.env: движки не настроены. Сначала запустите ./setup_linux.sh.' 'No backend/.env: the engines are not set up. Run ./setup_linux.sh first.')"
ok "$(t 'Всё на месте' 'Everything is in place')"

if [[ ! -x backend/.venv/bin/python3 ]]; then
  step "$(t 'Окружение сервера (первый запуск)' 'The server environment (first run)')"
  run_quiet "venv" "$LOGS/backend-venv.log" bash -c '"$1" -m venv backend/.venv && backend/.venv/bin/python3 -m pip install -q --upgrade pip && backend/.venv/bin/pip install -q -r backend/requirements.txt' _ "$PYTHON_BIN" \
    || { tail -n 30 "$LOGS/backend-venv.log" | sed 's/^/    /' >&2; false; }
  ok "$(t 'Готово' 'Done')"
fi
if [[ ! -d frontend/node_modules ]]; then
  step "$(t 'Пакеты страницы (первый запуск)' "The page's packages (first run)")"
  run_quiet "npm ci" "$LOGS/frontend-install.log" bash -c 'cd frontend && "$1" ci --no-audit --no-fund' _ "$NPM_BIN" \
    || { tail -n 30 "$LOGS/frontend-install.log" | sed 's/^/    /' >&2; false; }
  ok "$(t 'Готово' 'Done')"
fi

step "$(t 'Сборка страницы' 'Building the page')"
run_quiet "npm run build" "$LOGS/frontend-build.log" bash -c 'cd frontend && "$1" run build' _ "$NPM_BIN" \
  || { tail -n 30 "$LOGS/frontend-build.log" | sed 's/^/    /' >&2; false; }
ok "$(t 'Собрана' 'Built')"

step "$(t 'Запуск' 'Starting')"
cd backend
# the server in the background for as long as it takes to answer, then in the foreground: Ctrl+C reaches it
.venv/bin/python3 -m uvicorn app.main:app --host "$HOST" --port "$PORT" --no-access-log --log-level warning &
server=$!
trap 'kill -TERM "$server" 2>/dev/null; wait "$server" 2>/dev/null; exit 0' INT TERM
for _ in $(seq 1 180); do
  curl -s -m 2 -o /dev/null "http://127.0.0.1:$PORT/api/orchestrator/status" 2>/dev/null && break
  kill -0 "$server" 2>/dev/null || { fail "$(t 'Сервер завершился при старте (сообщения выше).' 'The server exited while starting (messages above).')"; exit 1; }
  sleep 0.5
done
url="http://$HOST:$PORT"; [[ "$HOST" == 0.0.0.0 ]] && url="http://127.0.0.1:$PORT"
printf '\n  %s %s%s\n' "$(c "$C_GREEN" '✓' b)" "$(c "$C_GREEN" "$(t 'Remiqora работает: ' 'Remiqora is running: ')" b)" "$(c "$C_CYAN" "$url" b)"
[[ "$HOST" != 127.0.0.1 ]] && warn "$(t "Слушает $HOST: входа по паролю нет, открывайте только в доверенной сети." "Listening on $HOST: there is no login, open it on a trusted network only.")"
note "$(t 'Остановить: Ctrl+C. Ниже — сообщения сервера.' 'To stop: Ctrl+C. Server messages follow.')"
rule
trap - ERR
wait "$server"
