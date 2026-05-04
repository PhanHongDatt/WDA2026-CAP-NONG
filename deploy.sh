#!/bin/bash
# ============================================
# Cạp Nông — EC2 Helper / Init Script (FIXED)
# ============================================

set -euo pipefail

# Config
REPO_URL="git@github.com:PhanHongDatt/WDA2026-CAP-NONG.git"
APP_DIR="/opt/capnong/WDA2026-CAP-NONG"
DOMAIN="capnong.shop" # TODO: UPDATE THIS!

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}ℹ ${NC} $*"; }
warn()  { echo -e "${YELLOW}⚠ ${NC} $*"; }
error() { echo -e "${RED}✖ ${NC} $*"; }

# Luôn chạy đúng thư mục script
cd "$(dirname "$0")"

# ─── Commands ───────────────────────────────

cmd_setup() {
  info "1. Configuring SSH for GitHub Deploy Key..."

  if [ ! -f "$HOME/.ssh/github_deploy" ]; then
    warn "GitHub deploy key not found at ~/.ssh/github_deploy"
    warn "Generate it with: ssh-keygen -t ed25519 -C 'capnong-github-deploy' -f ~/.ssh/github_deploy -N ''"
    warn "Then add the public key to GitHub Deploy Keys"
    exit 1
  fi

  mkdir -p "$HOME/.ssh"

  if ! grep -q "github.com" "$HOME/.ssh/config" 2>/dev/null; then
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

  # tránh hỏi fingerprint
  ssh-keyscan github.com >> "$HOME/.ssh/known_hosts" 2>/dev/null || true

  info "2. Setting up repository at $APP_DIR..."

  if [ ! -d "$APP_DIR/.git" ]; then
    sudo mkdir -p "$APP_DIR"
    sudo chown -R $(whoami):$(whoami) "$APP_DIR"

    git clone "$REPO_URL" "$APP_DIR"
  else
    info "Repository already exists → pulling latest code..."
    git -C "$APP_DIR" pull origin main
  fi

  info "3. Checking .env file..."

  if [ ! -f "$APP_DIR/.env" ]; then
    cp "$APP_DIR/.env.example" "$APP_DIR/.env"
    warn ".env created → YOU MUST EDIT IT NOW!"
    nano "$APP_DIR/.env"
  else
    info ".env already exists."
  fi

  info "Setup complete."
}

# --------------------------------------------

cmd_deploy() {
  info "Starting deployment..."

  if [ ! -d "$APP_DIR/.git" ]; then
    error "Not a git repository at $APP_DIR"
    error "Run: ./deploy.sh setup first"
    exit 1
  fi

  info "Pulling latest code..."
  git -C "$APP_DIR" pull origin main

  cd "$APP_DIR"

  info "Tagging images for rollback..."
  docker tag capnong-backend:latest capnong-backend:rollback 2>/dev/null || true
  docker tag capnong-frontend:latest capnong-frontend:rollback 2>/dev/null || true
  docker tag capnong-ai-service:latest capnong-ai-service:rollback 2>/dev/null || true

  info "Building & starting containers..."
  docker compose -f docker-compose.prod.yml build
  docker compose -f docker-compose.prod.yml up -d

  info "Running smoke test..."

  RETRIES=9
  until curl -sf http://localhost:8080/actuator/health | grep -q '"status":"UP"'; do
    RETRIES=$((RETRIES - 1))
    if [ "$RETRIES" -le 0 ]; then
      error "Smoke test failed → rolling back..."

      docker compose -f docker-compose.prod.yml down --remove-orphans

      docker tag capnong-backend:rollback capnong-backend:latest 2>/dev/null || true
      docker tag capnong-frontend:rollback capnong-frontend:latest 2>/dev/null || true
      docker tag capnong-ai-service:rollback capnong-ai-service:latest 2>/dev/null || true

      docker compose -f docker-compose.prod.yml up -d

      error "Rollback complete."
      exit 1
    fi

    warn "Waiting... ($RETRIES retries left)"
    sleep 10
  done

  info "Smoke test passed."

  info "Cleaning unused images..."
  docker image prune -f

  info "Deployment SUCCESS."
}

# --------------------------------------------

cmd_ssl() {
  info "Setting up SSL..."

  cd "$APP_DIR"

  docker compose -f docker-compose.prod.yml start nginx || true

  sudo certbot --nginx -d "$DOMAIN" \
    --non-interactive --agree-tos -m admin@"$DOMAIN"

  docker compose -f docker-compose.prod.yml restart nginx

  info "SSL done."
}

# --------------------------------------------

cmd_status() {
  cd "$APP_DIR"
  docker compose -f docker-compose.prod.yml ps
}

# ─── Main ───────────────────────────────────

case "${1:-}" in
  setup) cmd_setup ;;
  deploy) cmd_deploy ;;
  ssl) cmd_ssl ;;
  status) cmd_status ;;
  *)
    echo "Usage: ./deploy.sh [setup|deploy|ssl|status]"
    ;;
esac