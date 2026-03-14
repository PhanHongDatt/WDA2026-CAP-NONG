#!/usr/bin/env bash
# ============================================
# Cạp Nông - Development Helper Script
# Compatible with macOS and Linux
# ============================================

set -euo pipefail

# ─── Colors ────────────────────────────────────
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ─── Helpers ───────────────────────────────────
info()    { echo -e "${CYAN}ℹ ${NC} $*"; }
success() { echo -e "${GREEN}✔ ${NC} $*"; }
warn()    { echo -e "${YELLOW}⚠ ${NC} $*"; }
error()   { echo -e "${RED}✖ ${NC} $*"; }

# ─── Pre-flight: check .env ────────────────────
check_env() {
  if [ ! -f .env ]; then
    error "File ${BOLD}.env${NC} không tồn tại!"
    warn  "Hãy tạo file .env từ template:"
    echo ""
    echo -e "  ${CYAN}cp .env.example .env${NC}"
    echo ""
    warn  "Sau đó mở .env và điền các giá trị thực."
    exit 1
  fi
}

# ─── Commands ──────────────────────────────────

cmd_up() {
  check_env
  info "Đang build và khởi chạy tất cả services..."
  docker compose up -d --build
  success "Tất cả services đã khởi chạy!"
  echo ""
  info "Đang theo dõi logs (Ctrl+C để thoát)..."
  docker compose logs -f
}

cmd_down() {
  info "Đang dừng tất cả services..."
  docker compose down
  success "Tất cả services đã dừng."
}

cmd_reset() {
  warn "${BOLD}CẢNH BÁO:${NC}${YELLOW} Lệnh này sẽ xóa toàn bộ containers VÀ volumes (database, cache)!${NC}"
  echo ""
  read -rp "$(echo -e "${YELLOW}⚠  Bạn có chắc chắn? (y/N): ${NC}")" confirm
  case "$confirm" in
    [yY][eE][sS]|[yY])
      info "Đang xóa containers và volumes..."
      docker compose down -v
      success "Đã xóa toàn bộ containers và volumes."
      ;;
    *)
      info "Đã hủy lệnh reset."
      ;;
  esac
}

cmd_logs() {
  local service="${1:-}"
  if [ -n "$service" ]; then
    info "Đang theo dõi logs của ${BOLD}${service}${NC}..."
    docker compose logs -f "$service"
  else
    info "Đang theo dõi logs tất cả services..."
    docker compose logs -f
  fi
}

cmd_ps() {
  info "Trạng thái các services:"
  echo ""
  docker compose ps
}

cmd_db() {
  check_env
  info "Đang kết nối vào PostgreSQL..."
  # shellcheck disable=SC1091
  source .env
  docker compose exec postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}"
}

cmd_redis() {
  check_env
  info "Đang kết nối vào Redis..."
  # shellcheck disable=SC1091
  source .env
  docker compose exec redis redis-cli -a "${REDIS_PASSWORD}"
}

cmd_rebuild() {
  local service="${1:-}"
  if [ -z "$service" ]; then
    error "Vui lòng chỉ định service cần rebuild."
    echo -e "  Ví dụ: ${CYAN}./dev.sh rebuild backend${NC}"
    exit 1
  fi
  check_env
  info "Đang rebuild ${BOLD}${service}${NC}..."
  docker compose up -d --build --no-deps "$service"
  success "Đã rebuild ${BOLD}${service}${NC} thành công!"
}

cmd_help() {
  echo ""
  echo -e "${BOLD}🌾 Cạp Nông — Development Helper${NC}"
  echo ""
  echo -e "  ${CYAN}Cách dùng:${NC} ./dev.sh ${GREEN}<command>${NC} [options]"
  echo ""
  echo -e "  ${GREEN}up${NC}                  Build và khởi chạy tất cả services, sau đó tail logs"
  echo -e "  ${GREEN}down${NC}                Dừng tất cả services"
  echo -e "  ${GREEN}reset${NC}               Dừng services và xóa volumes (database, cache) — có confirm"
  echo -e "  ${GREEN}logs${NC} ${YELLOW}[service]${NC}      Theo dõi logs (ví dụ: ./dev.sh logs backend)"
  echo -e "  ${GREEN}ps${NC}                  Hiển thị trạng thái các services"
  echo -e "  ${GREEN}db${NC}                  Mở psql vào container PostgreSQL"
  echo -e "  ${GREEN}redis${NC}               Mở redis-cli vào container Redis"
  echo -e "  ${GREEN}rebuild${NC} ${YELLOW}<service>${NC}   Rebuild một service (ví dụ: ./dev.sh rebuild backend)"
  echo -e "  ${GREEN}help${NC}                Hiển thị trợ giúp này"
  echo ""
}

# ─── Main ──────────────────────────────────────
case "${1:-}" in
  up)       cmd_up ;;
  down)     cmd_down ;;
  reset)    cmd_reset ;;
  logs)     cmd_logs "${2:-}" ;;
  ps)       cmd_ps ;;
  db)       cmd_db ;;
  redis)    cmd_redis ;;
  rebuild)  cmd_rebuild "${2:-}" ;;
  help|"")  cmd_help ;;
  *)
    error "Lệnh không hợp lệ: ${BOLD}$1${NC}"
    cmd_help
    exit 1
    ;;
esac
