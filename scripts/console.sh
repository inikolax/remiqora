# shellcheck shell=bash
# The console look of Remiqora's Linux scripts (setup_linux.sh, prod_run_linux.sh), the twin of
# scripts/install_console.ps1: source it after setting ROOT. Brings the language switch t, colours, the banner and the
# step / ok / warn / fail / note / ask / run_quiet helpers.
# True colour where the terminal is a tty; NO_COLOR or output into a file or pipe gets plain text (FORCE_COLOR forces it).

# Message language, Russian or English: REMIQORA_LANG if set, else the one picked at install (.remiqora-lang next to
# the scripts, see select_language), else the system locale
REMIQORA_LANG_FILE="$ROOT/.remiqora-lang"
if [[ -n "${REMIQORA_LANG:-}" ]]; then RQ_LANG="$REMIQORA_LANG"
elif [[ -f "$REMIQORA_LANG_FILE" ]]; then RQ_LANG="$(tr -d '\r\n ' < "$REMIQORA_LANG_FILE")"
else RQ_LANG="${LC_ALL:-${LC_MESSAGES:-${LANG:-en}}}"
fi
[[ "${RQ_LANG,,}" == ru* ]] && RQ_RU=1 || RQ_RU=0
# t "по-русски" "in English"
t() { if [[ "$RQ_RU" == 1 ]]; then printf '%s' "$1"; else printf '%s' "$2"; fi; }

RQ_TTY=0; [[ -t 1 ]] && RQ_TTY=1
RQ_COLOR=0
if [[ -n "${FORCE_COLOR:-}" ]] || { [[ "$RQ_TTY" == 1 ]] && [[ -z "${NO_COLOR:-}" ]] && [[ "${TERM:-}" != dumb ]]; }; then RQ_COLOR=1; fi

# The app's palette (frontend/src/style.css): accent1 violet, accent2 pink, and the status colours
C_VIOLET="168;85;247"; C_PINK="236;72;153"; C_GREEN="74;222;128"; C_RED="248;113;113"
C_AMBER="251;191;36"; C_CYAN="103;232;249"
# c RGB text [bold]
c() { if [[ "$RQ_COLOR" == 1 ]]; then printf '\033[%s38;2;%sm%s\033[0m' "${3:+1;}" "$1" "$2"; else printf '%s' "$2"; fi; }
dim() { if [[ "$RQ_COLOR" == 1 ]]; then printf '\033[2m%s\033[0m' "$1"; else printf '%s' "$1"; fi; }

step() { printf '\n  %s %s\n' "$(c "$C_VIOLET" '▍' b)" "$(c "$C_VIOLET" "$1" b)"; }
ok()   { printf '  %s %s\n' "$(c "$C_GREEN" '✓')" "$1"; }
warn() { printf '  %s %s\n' "$(c "$C_AMBER" '!' b)" "$(c "$C_AMBER" "$1")"; }
fail() { printf '  %s %s\n' "$(c "$C_RED" '✗' b)" "$(c "$C_RED" "$1")" >&2; }
note() { printf '    %s\n' "$(dim "$1")"; }
info() { printf '    %s %s\n' "$(dim "$1")" "$(c "$C_CYAN" "$2")"; }
rule() { printf '  %s\n' "$(dim '────────────────────────────────────────────────────────────────')"; }

# ask "Question" default -> the answer on stdout (the default on Enter or without a terminal to answer in)
ask() {
  local answer=""
  if [[ -t 0 ]]; then
    printf '  %s %s %s : ' "$(c "$C_VIOLET" '?' b)" "$1" "$(dim "[$2]")" >&2
    # no input at all: end the line the question started
    read -r answer || { answer=""; echo >&2; }
  fi
  printf '%s' "${answer:-$2}"
}

RQ_LOGO=(
'██████╗ ███████╗███╗   ███╗██╗ ██████╗  ██████╗ ██████╗  █████╗ '
'██╔══██╗██╔════╝████╗ ████║██║██╔═══██╗██╔═══██╗██╔══██╗██╔══██╗'
'██████╔╝█████╗  ██╔████╔██║██║██║   ██║██║   ██║██████╔╝███████║'
'██╔══██╗██╔══╝  ██║╚██╔╝██║██║██║▄▄ ██║██║   ██║██╔══██╗██╔══██║'
'██║  ██║███████╗██║ ╚═╝ ██║██║╚██████╔╝╚██████╔╝██║  ██║██║  ██║'
'╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚═╝ ╚══▀▀═╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝'
)
# The app's version (desktop/package.json). Never a failure: under set -e -o pipefail a missing file would end the
# calling script silently, and the Docker build context leaves desktop/ out (the image passes IMAGE_VERSION).
app_version() {
  if [[ -n "${IMAGE_VERSION:-}" && "$IMAGE_VERSION" != dev ]]; then printf '%s' "$IMAGE_VERSION"; return 0; fi
  sed -n 's/^ *"version": *"\([^"]*\)".*/\1/p' "$ROOT/desktop/package.json" 2>/dev/null | head -1 || true
}

# banner "Subtitle"
banner() {
  local line="$1" version tagline
  version="$(app_version)"
  [[ -n "$version" ]] && line+="  ·  $(t 'версия' 'version') $version"
  tagline="$(t 'Создано с AI. Сделано тобой.' 'Made with AI. Made by you.')"
  printf '\n'
  if [[ "$RQ_COLOR" == 1 ]]; then
    # violet to pink across the letters, the shadow's lines in the same hue, darker; a UTF-8 locale so that
    # ${row:x:1} is one letter, not one byte
    local LC_ALL=C.UTF-8 row out x n ch r g b k
    for row in "${RQ_LOGO[@]}"; do
      out='  '
      n=$(( ${#row} - 1 ))
      for (( x = 0; x < ${#row}; x++ )); do
        ch="${row:x:1}"
        if [[ "$ch" == ' ' ]]; then out+=' '; continue; fi
        if [[ "$ch" == '█' || "$ch" == '▄' || "$ch" == '▀' ]]; then k=100; else k=55; fi
        r=$(( (168 + (236 - 168) * x / n) * k / 100 ))
        g=$(( (85 + (72 - 85) * x / n) * k / 100 ))
        b=$(( (247 + (153 - 247) * x / n) * k / 100 ))
        out+=$'\033'"[38;2;${r};${g};${b}m${ch}"
      done
      printf '%s\033[0m\n' "$out"
    done
    printf '  %s%s%s\n' "$(c "$C_PINK" "$tagline" b)" "$(dim '  ·  ')" "$line"
    rule
  else
    printf '  REMIQORA  ·  %s\n  %s\n' "$line" '----------------------------------------'
  fi
}

# The install asks once which language to speak (the default is the system one) and remembers it for the launcher.
# Not asked when REMIQORA_LANG is set, a choice is saved, or there is no terminal to answer in.
select_language() {
  [[ -n "${REMIQORA_LANG:-}" || -f "$REMIQORA_LANG_FILE" || ! -t 0 || "$RQ_TTY" != 1 ]] && return 0
  local default=1 answer
  [[ "$RQ_RU" == 1 ]] || default=2
  printf '\n  %s Язык / Language:  %s Русский   %s English  %s : ' "$(c "$C_VIOLET" '?' b)" "$(c "$C_PINK" 1 b)" "$(c "$C_PINK" 2 b)" "$(dim "[$default]")"
  read -r answer || answer=""
  [[ "${answer:-$default}" == 2 ]] && RQ_RU=0 || RQ_RU=1
  if [[ "$RQ_RU" == 1 ]]; then printf 'ru' > "$REMIQORA_LANG_FILE"; else printf 'en' > "$REMIQORA_LANG_FILE"; fi
  clear 2>/dev/null || true
}

# run_quiet "what" log command... : the command's own output goes to the log; the terminal shows one live line
# (a spinner and the log's last line) and, if it fails, the log's last 30 lines. Without a tty the output goes through.
run_quiet() {
  local what="$1" log="$2"; shift 2
  mkdir -p "$(dirname "$log")"
  if [[ "$RQ_TTY" != 1 ]]; then
    note "$what"
    "$@" 2>&1 | tee "$log"
    return "${PIPESTATUS[0]}"
  fi
  "$@" > "$log" 2>&1 &
  local pid=$! i=0 frames='⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏' last cols start=$SECONDS
  cols=$(( $(tput cols 2>/dev/null || echo 100) - 18 ))
  (( cols < 30 )) && cols=30
  while kill -0 "$pid" 2>/dev/null; do
    last="$(tail -c 2000 "$log" 2>/dev/null | tr '\r' '\n' | grep -v '^\s*$' | tail -1)"
    printf '\r\033[K  %s %s %s' "$(c "$C_VIOLET" "${frames:i++%10:1}")" "$(dim "$(( SECONDS - start ))s")" "$(dim "${last:0:cols}")"
    sleep 0.2
  done
  printf '\r\033[K'
  wait "$pid"
}

# The window of a script started from a file manager stays up until Enter when REMIQORA_WAIT is set
wait_close() {
  [[ -n "${REMIQORA_WAIT:-}" && -t 0 ]] || return 0
  printf '\n  %s' "$(dim "$(t 'Нажмите Enter, чтобы закрыть окно' 'Press Enter to close this window')")"
  read -r _ || true
}
