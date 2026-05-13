#!/usr/bin/env bash
set -euo pipefail

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[deploy] Required command not found: $1" >&2
    exit 1
  fi
}

require_var() {
  if [ -z "${!1:-}" ]; then
    echo "[deploy] Missing required variable: $1" >&2
    exit 1
  fi
}

ensure_linked_dir() {
  local shared_dir="$1"
  local app_path="$2"

  mkdir -p "$shared_dir"
  mkdir -p "$(dirname "$app_path")"

  if [ -d "$app_path" ] && [ ! -L "$app_path" ] && [ -z "$(ls -A "$shared_dir" 2>/dev/null)" ]; then
    cp -a "$app_path/." "$shared_dir/"
  fi

  rm -rf "$app_path"
  ln -s "$shared_dir" "$app_path"
}

write_env_file() {
  if [ -z "${PROD_ENV_FILE_B64:-}" ]; then
    return
  fi

  install -m 600 /dev/null "$APP_ROOT/.env"
  printf '%s' "$PROD_ENV_FILE_B64" | base64 -d > "$APP_ROOT/.env"
}

APP_NAME="${APP_NAME:-creditremovers-app}"
APP_ROOT="${APP_ROOT:-/var/www/creditremovers}"
SHARED_ROOT="${SHARED_ROOT:-/var/www/creditremovers-shared}"
APP_PORT="${APP_PORT:-4174}"
BRANCH="${BRANCH:-main}"

require_var APP_ROOT

for cmd in base64 curl git node npm pm2; do
  require_cmd "$cmd"
done

if [ ! -d "$APP_ROOT/.git" ]; then
  echo "[deploy] $APP_ROOT is not a git working tree. Run bootstrap first." >&2
  exit 1
fi

git -C "$APP_ROOT" fetch origin "$BRANCH"
git -C "$APP_ROOT" checkout "$BRANCH"
git -C "$APP_ROOT" reset --hard "origin/$BRANCH"

write_env_file
ensure_linked_dir "$SHARED_ROOT/public/uploads" "$APP_ROOT/public/uploads"
ensure_linked_dir "$SHARED_ROOT/private-uploads" "$APP_ROOT/private-uploads"

cd "$APP_ROOT"

npm ci
npx prisma generate
npx prisma migrate deploy
npm run build
pm2 startOrReload ecosystem.config.cjs --only "$APP_NAME" --env production --update-env
pm2 save --force
curl --fail --silent --show-error "http://127.0.0.1:$APP_PORT/api/health" >/dev/null

echo "[deploy] Completed successfully."
