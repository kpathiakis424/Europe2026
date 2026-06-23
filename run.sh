#!/usr/bin/env bash
# Serve the static site on ALL interfaces, port 2026, so NGINX Proxy Manager
# on your other host can proxy to http://192.168.150.50:2026
set -e
cd "$(dirname "$0")"
PORT="${PORT:-2026}"
echo "Serving $(pwd) on 0.0.0.0:${PORT}  (Ctrl+C to stop)"
exec python3 -m http.server "${PORT}" --bind 0.0.0.