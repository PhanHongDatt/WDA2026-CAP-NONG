#!/bin/bash
# ============================================
# Cạp Nông — EC2 Helper / Init Script
# Use this script on the EC2 host to manage deployment
# ============================================

set -euo pipefail

# Config
REPO_URL="git@github.com:PhanHongDatt/WDA2026-CAP-NONG.git"
APP_DIR="/opt/capnong"
DOMAIN="capnong.vn" # TODO: UPDATE THIS!

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

info()    { echo -e "${GREEN}ℹ ${NC} $*"; }
warn()    { echo -e "${YELLOW}⚠ ${NC} $*"; }
error()   { echo -e "${RED}✖ ${NC} $*"; }

# ─── Commands ───────────────────────────────

cmd_setup() {
  info "1. Configuring SSH for GitHub Deploy Key..."
  if [ ! -f "$HOME/.ssh/github_deploy" ]; then
    warn "GitHub deploy key not found at ~/.ssh/github_deploy"
    warn "Generate it with: ssh-keygen -t ed25519 -C 'capnong-github-deploy' -f ~/.ssh/github_deploy -N ''"
    warn "Then add the public key to: https://github.com/PhanHongDatt/WDA2026-CAP-NONG/settings/keys"
    exit 1
  fi

  # Configure SSH to use deploy key for GitHub
  if ! grep -q "github.com" "$HOME/.ssh/config" 2>/dev/null; then
    mkdir -p "$HOME/.ssh"
    cat >> "$HOME/.ssh/config" <<'EOF'
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/github_deploy
    IdentitiesOnly yes
EOF
    chmod 600 "$HOME/.ssh/config"
    info "SSH config updated."
  fi

  info "2. Setting up initial local Git repository in $APP_DIR..."

  if [ ! -d "$APP_DIR/.git" ]; then
    sudo chown -R ec2-user:ec2-user "$APP_DIR"
    cd "$APP_DIR"
    git clone "$REPO_URL" .
  else
    warn "A project repository has already been cloned."
  fi
  
  info "3. Checking for .env configuration..."
  if [ ! -f "$APP_DIR/.env" ]; then
    cd "$APP_DIR"
    cp .env.example .env
    warn "File .env created from example. YOU MUST EDIT IT NOW TO FILL IN SECRETS."
    nano .env
  else
    info ".env file already exists."
  fi

  info "Initial setup complete."
  echo "Before executing './deploy.sh deploy', make sure you have the correct variables in .env"
}

cmd_deploy() {
  info "Starting manual deployment routines..."
  
  cd "$APP_DIR"
  
  info "Pulling latest code from main branch..."
  git pull origin main

  info "Building and starting Docker production containers..."
  docker compose -f docker-compose.prod.yml build
  docker compose -f docker-compose.prod.yml up -d
  
  info "Cleaning up unused Docker resources..."
  docker system prune -f

  info "Deployment complete."
}

cmd_ssl() {
  info "Configuring Let's Encrypt SSL via Certbot..."
  
  # Ensure the container is up so Nginx can respond to the challenge
  cd "$APP_DIR"
  docker compose -f docker-compose.prod.yml start nginx || warn "Nginx container might not be running"

  # Perform request
  sudo certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m admin@"$DOMAIN"

  info "Restarting Nginx to load the new certificates..."
  docker compose -f docker-compose.prod.yml restart nginx
  
  info "SSL Setup complete. Ensure your cron checks daily via: sudo crontab -e"
  info "Cron format: 0 3 * * * /opt/capnong/infra/nginx/certbot-renew.sh"
}

cmd_status() {
  info "Docker Containers Status:"
  cd "$APP_DIR"
  docker compose -f docker-compose.prod.yml ps
}

# ─── Main Switch ────────────────────────────

case "${1:-}" in
  setup) cmd_setup ;;
  deploy) cmd_deploy ;;
  ssl) cmd_ssl ;;
  status) cmd_status ;;
  *)
    echo "Usage: ./deploy.sh [setup|deploy|ssl|status]"
    echo ""
    echo "  setup   - Initial repository clone and .env generation"
    echo "  deploy  - Manually pull code & start production containers"
    echo "  ssl     - Fetch/Renew SSL cert using Certbot (requires DOMAIN configuration)"
    echo "  status  - Show docker compose process statuses"
    ;;
esac
