#!/bin/sh
# Runs on container start (nginx image executes /docker-entrypoint.d/*.sh).
# Writes /env-config.js from the container environment, so the same image works with any API URL.
set -eu

escape() { printf '%s' "$1" | sed 's/\\/\\\\/g; s/"/\\"/g'; }

cat > /usr/share/nginx/html/env-config.js <<JS
window.__ENV__ = {
  API_URL: "$(escape "${VITE_API_URL:-}")",
  TURNSTILE_SITE_KEY: "$(escape "${VITE_TURNSTILE_SITE_KEY:-}")"
};
JS

echo "env-config.js written (API_URL=${VITE_API_URL:-<not set>})"
