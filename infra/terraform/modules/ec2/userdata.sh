#!/bin/bash
# ============================================
# Cạp Nông — EC2 Bootstrap Script
# Installs Docker, Docker Compose, Git, Nginx
# ============================================

set -euo pipefail

exec > >(tee /var/log/capnong-userdata.log) 2>&1
echo "=== Cạp Nông EC2 Bootstrap — $(date) ==="

# ─── 1. System Update ───────────────────────
echo ">>> Updating system packages..."
dnf update -y

# ─── 2. Install Docker ──────────────────────
echo ">>> Installing Docker..."
dnf install -y docker
systemctl enable docker
systemctl start docker
usermod -aG docker ec2-user

# ─── 3. Install Docker Compose v2 ───────────
echo ">>> Installing Docker Compose..."
COMPOSE_VERSION="v2.29.1"
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL "https://github.com/docker/compose/releases/download/$${COMPOSE_VERSION}/docker-compose-linux-x86_64" \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Verify
docker compose version

# ─── 4. Install Git ─────────────────────────
echo ">>> Installing Git..."
dnf install -y git

# ─── 5. Install Certbot (Let's Encrypt) ─────
echo ">>> Installing Certbot..."
dnf install -y certbot python3-certbot-nginx || true

# ─── 6. Create project directory ────────────
echo ">>> Setting up project directory..."
mkdir -p /opt/${project_name}
chown ec2-user:ec2-user /opt/${project_name}

# ─── 7. Setup log rotation ──────────────────
cat > /etc/logrotate.d/capnong <<'EOF'
/opt/${project_name}/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 0640 ec2-user ec2-user
}
EOF

# ─── 8. Setup Docker log limits ─────────────
mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
EOF
systemctl restart docker

echo "=== Bootstrap complete — $(date) ==="
echo ">>> Next steps:"
echo "    1. SSH in: ssh -i key.pem ec2-user@<elastic-ip>"
echo "    2. cd /opt/${project_name}"
echo "    3. git clone <repo> ."
echo "    4. cp .env.example .env && edit .env"
echo "    5. docker compose -f docker-compose.prod.yml up -d"
