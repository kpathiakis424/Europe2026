#!/usr/bin/env bash
# Run this ON THE HOST (192.168.150.50) as a user with sudo.
# Clones/updates the repo into /var/www/Europe2026, installs the systemd
# service, starts it, and verifies it's listening on 0.0.0.0:2026.
set -euo pipefail

REPO_URL="https://github.com/kpathiakis424/Europe2026.git"
INSTALL_DIR="/var/www/Europe2026"
SERVICE_NAME="europe2026"

if [ -d "$INSTALL_DIR/.git" ]; then
  echo "==> Updating existing checkout in $INSTALL_DIR"
  sudo git -C "$INSTALL_DIR" pull
else
  echo "==> Cloning into $INSTALL_DIR"
  sudo mkdir -p "$(dirname "$INSTALL_DIR")"
  sudo git clone "$REPO_URL" "$INSTALL_DIR"
fi

echo "==> Installing systemd unit"
sudo cp "$INSTALL_DIR/$SERVICE_NAME.service" /etc/systemd/system/
sudo sed -i "s#/var/www/Europe2026#$INSTALL_DIR#" "/etc/systemd/system/$SERVICE_NAME.service"
sudo systemctl daemon-reload
sudo systemctl enable --now "$SERVICE_NAME"

echo "==> Service status"
sudo systemctl --no-pager status "$SERVICE_NAME"

echo "==> Verifying it's listening on 0.0.0.0:2026"
curl -I --max-time 5 http://localhost:2026
ss -tlnp | grep ':2026' || echo "WARNING: nothing listening on :2026"

echo "==> Opening firewall port 2026/tcp"
if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow 2026/tcp
else
  echo "ufw not found, skipping firewall step (open 2026/tcp manually if needed)"
fi

echo "==> Done. If this all looks good, the NPM proxy host should now return 200."
