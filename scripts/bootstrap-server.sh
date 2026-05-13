#!/usr/bin/env bash
set -euo pipefail

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "[bootstrap] Required command not found: $1" >&2
    exit 1
  fi
}

require_var() {
  if [ -z "${!1:-}" ]; then
    echo "[bootstrap] Missing required variable: $1" >&2
    exit 1
  fi
}

wait_for_http() {
  local url="$1"
  local label="$2"

  for attempt in $(seq 1 30); do
    if curl --fail --silent --show-error "$url" >/dev/null; then
      return 0
    fi
    sleep 2
  done

  echo "[bootstrap] Timed out waiting for $label at $url" >&2
  return 1
}

ensure_repo() {
  if [ -d "$APP_ROOT/.git" ]; then
    git -C "$APP_ROOT" fetch origin "$BRANCH"
    git -C "$APP_ROOT" checkout "$BRANCH"
    git -C "$APP_ROOT" reset --hard "origin/$BRANCH"
    return
  fi

  if [ -d "$APP_ROOT" ] && [ -n "$(ls -A "$APP_ROOT" 2>/dev/null)" ]; then
    echo "[bootstrap] $APP_ROOT exists but is not an empty git working tree." >&2
    exit 1
  fi

  rm -rf "$APP_ROOT"
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_ROOT"
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
  install -m 600 /dev/null "$APP_ROOT/.env"
  printf '%s' "$PROD_ENV_FILE_B64" | base64 -d > "$APP_ROOT/.env"
}

provision_mysql() {
  local escaped_password
  escaped_password="$(printf '%s' "$MYSQL_PASSWORD" | sed "s/'/''/g")"

  mysql <<SQL
CREATE DATABASE IF NOT EXISTS \`$MYSQL_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '$MYSQL_USER'@'localhost' IDENTIFIED BY '$escaped_password';
ALTER USER '$MYSQL_USER'@'localhost' IDENTIFIED BY '$escaped_password';
GRANT ALL PRIVILEGES ON \`$MYSQL_DATABASE\`.* TO '$MYSQL_USER'@'localhost';
FLUSH PRIVILEGES;
SQL
}

seed_if_empty() {
  local admin_count
  admin_count="$(mysql --batch --skip-column-names "$MYSQL_DATABASE" -e "SELECT COUNT(*) FROM admin_users;" 2>/dev/null || echo 0)"

  if [ "$admin_count" = "0" ]; then
    echo "[bootstrap] Empty database detected; running seed."
    npx prisma db seed
  else
    echo "[bootstrap] Existing data detected; skipping seed."
  fi
}

write_http_nginx_config() {
  cat > "$NGINX_CONFIG_PATH" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $APP_DOMAIN $APP_WWW_DOMAIN;

    location / {
        proxy_pass         http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
}

write_https_nginx_config() {
  cat > "$NGINX_CONFIG_PATH" <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $APP_DOMAIN $APP_WWW_DOMAIN;
    return 301 https://$APP_DOMAIN\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $APP_DOMAIN $APP_WWW_DOMAIN;

    ssl_certificate     /etc/letsencrypt/live/$APP_DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$APP_DOMAIN/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass         http://127.0.0.1:$APP_PORT;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade \$http_upgrade;
        proxy_set_header   Connection "upgrade";
        proxy_set_header   Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
}

APP_NAME="${APP_NAME:-creditremovers-app}"
APP_DOMAIN="${APP_DOMAIN:-creditremovers.com}"
APP_WWW_DOMAIN="${APP_WWW_DOMAIN:-www.${APP_DOMAIN}}"
APP_ROOT="${APP_ROOT:-/var/www/creditremovers}"
SHARED_ROOT="${SHARED_ROOT:-/var/www/creditremovers-shared}"
APP_PORT="${APP_PORT:-4174}"
BRANCH="${BRANCH:-main}"
REPO_URL="${REPO_URL:-https://github.com/isoauzef/creditremovers.git}"
MYSQL_DATABASE="${MYSQL_DATABASE:-creditremovers}"
MYSQL_USER="${MYSQL_USER:-creditremovers}"
NGINX_CONFIG_PATH="/etc/nginx/sites-available/$APP_DOMAIN"
NGINX_ENABLED_PATH="/etc/nginx/sites-enabled/$APP_DOMAIN"

require_var MYSQL_PASSWORD
require_var LETSENCRYPT_EMAIL
require_var PROD_ENV_FILE_B64

for cmd in base64 certbot curl git mysql nginx node npm pm2; do
  require_cmd "$cmd"
done

install -d -m 755 /var/www
install -d -m 755 "$SHARED_ROOT"
install -d -m 755 "$SHARED_ROOT/public"
install -d -m 700 "$SHARED_ROOT/private-uploads"

ensure_repo
write_env_file
provision_mysql

ensure_linked_dir "$SHARED_ROOT/public/uploads" "$APP_ROOT/public/uploads"
ensure_linked_dir "$SHARED_ROOT/private-uploads" "$APP_ROOT/private-uploads"

cd "$APP_ROOT"

npm ci
npx prisma generate
npx prisma migrate deploy
seed_if_empty
npm run build
pm2 startOrReload ecosystem.config.cjs --only "$APP_NAME" --env production --update-env
pm2 save --force
wait_for_http "http://127.0.0.1:$APP_PORT/api/health" "local health check"

write_http_nginx_config
ln -sfn "$NGINX_CONFIG_PATH" "$NGINX_ENABLED_PATH"
nginx -t
systemctl reload nginx

if [ ! -f "/etc/letsencrypt/live/$APP_DOMAIN/fullchain.pem" ]; then
  certbot certonly --nginx \
    --non-interactive \
    --agree-tos \
    --email "$LETSENCRYPT_EMAIL" \
    -d "$APP_DOMAIN" \
    -d "$APP_WWW_DOMAIN"
fi

write_https_nginx_config
nginx -t
systemctl reload nginx
wait_for_http "https://$APP_DOMAIN/api/health" "public health check"

echo "[bootstrap] Completed successfully."
