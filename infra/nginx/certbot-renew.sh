#!/bin/bash
# ============================================
# Cạp Nông — SSL Certificate Auto-Renewal
# Add to cron: 0 3 * * * /opt/capnong/infra/nginx/certbot-renew.sh
# ============================================

set -euo pipefail

LOG="/var/log/certbot-renew.log"

echo "$(date) — Starting certificate renewal check..." >> "$LOG"

certbot renew --quiet --deploy-hook "docker exec capnong-nginx nginx -s reload" 2>> "$LOG"

echo "$(date) — Renewal check completed." >> "$LOG"
