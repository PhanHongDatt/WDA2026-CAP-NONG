# 🌾 Cạp Nông

Nền tảng nông nghiệp thông minh tích hợp AI, hỗ trợ nông dân Việt Nam.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router, Turbopack) |
| Backend | Java 21 + Spring Boot 3 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| AI | Google Gemini API |
| Messaging | Telegram Bot API |

## Yêu cầu

- [Docker](https://www.docker.com/) & Docker Compose v2+
- (Tùy chọn) Java 21, Node.js 22 — nếu muốn chạy ngoài Docker

## Bắt đầu nhanh

```bash
# 1. Clone project
git clone <repo-url>
cd WD2026

# 2. Tạo file .env từ template
cp .env.example .env
# → Mở .env và điền các giá trị thực (DB password, API keys, ...)

# 3. Cấp quyền chạy script (macOS/Linux)
chmod +x dev.sh

# 4. Khởi chạy toàn bộ hệ thống
./dev.sh up
```

Sau khi chạy xong:

| Service | URL |
|---------|-----|
| Frontend | <http://localhost:3000> |
| Backend API | <http://localhost:8080> |
| Remote Debug (Java) | `localhost:5005` |

## Các lệnh hữu ích

```bash
./dev.sh up              # Build & chạy tất cả services
./dev.sh down            # Dừng tất cả
./dev.sh logs backend    # Xem log 1 service
./dev.sh ps              # Trạng thái services
./dev.sh db              # Mở psql vào PostgreSQL
./dev.sh redis           # Mở redis-cli vào Redis
./dev.sh rebuild backend # Rebuild 1 service
./dev.sh reset           # Xóa sạch data (có confirm)
```

## Cấu trúc dự án

```
WD2026/
│
├── capnong-be/                          # ── BACKEND (Spring Boot) ──────────
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/capnong/
│   │   │   │   ├── config/              # Cấu hình (Redis, Security, CORS, ...)
│   │   │   │   │   └── RedisConfig.java
│   │   │   │   ├── controller/          # REST Controllers (nhận request)
│   │   │   │   ├── service/             # Business logic
│   │   │   │   ├── repository/          # JPA Repositories (truy vấn DB)
│   │   │   │   ├── model/               # Entity classes (mapping bảng DB)
│   │   │   │   ├── dto/                 # Data Transfer Objects (request/response)
│   │   │   │   ├── security/            # JWT filter, AuthProvider, ...
│   │   │   │   ├── exception/           # Global exception handler
│   │   │   │   ├── util/                # Utility / helper classes
│   │   │   │   └── CapnongApplication.java  # Main class (@SpringBootApplication)
│   │   │   └── resources/
│   │   │       ├── application.yml      # Config chính
│   │   │       ├── application-dev.yml  # Config riêng cho môi trường dev (nếu cần)
│   │   │       └── static/              # File tĩnh phục vụ từ backend (nếu có)
│   │   └── test/java/com/capnong/      # Unit test & Integration test
│   ├── Dockerfile.dev
│   └── pom.xml
│
├── capnong-fe/                          # ── FRONTEND (Next.js 16) ──────────
│   ├── public/                          # File tĩnh (favicon, images, manifest)
│   │   ├── manifest.json               # PWA manifest
│   │   └── images/                     # Ảnh sản phẩm, banner, farms
│   ├── src/
│   │   ├── app/                         # App Router — mỗi folder = 1 route
│   │   │   ├── layout.tsx               # Layout gốc + ClientProviders
│   │   │   ├── page.tsx                 # Redirect → /home
│   │   │   ├── globals.css              # Design System + Dark Mode + Font Size
│   │   │   ├── not-found.tsx            # Trang 404 tùy chỉnh
│   │   │   ├── error.tsx                # Client error boundary
│   │   │   ├── global-error.tsx         # Root error boundary
│   │   │   ├── sitemap.ts               # Auto-gen /sitemap.xml
│   │   │   ├── robots.ts                # Auto-gen /robots.txt
│   │   │   ├── home/page.tsx            # Trang chủ + JSON-LD
│   │   │   ├── home/loading.tsx         # Skeleton Loading
│   │   │   ├── catalog/page.tsx         # Danh mục sản phẩm
│   │   │   ├── catalog/layout.tsx       # Metadata SEO
│   │   │   ├── catalog/loading.tsx      # Skeleton Loading
│   │   │   ├── products/[slug]/page.tsx # Chi tiết sản phẩm
│   │   │   ├── shops/[slug]/page.tsx    # Gian hàng nông dân
│   │   │   ├── cart/page.tsx            # Giỏ hàng
│   │   │   ├── checkout/page.tsx        # Thanh toán
│   │   │   ├── cooperative/page.tsx     # Dashboard gom đơn
│   │   │   ├── cooperative/manage/      # 🆕 Quản lý HTX (COOP_MANAGER)
│   │   │   │   └── page.tsx
│   │   │   ├── (auth)/                  # Route group: login, register
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx
│   │   │   └── dashboard/               # Route: /dashboard (nông dân)
│   │   │       ├── page.tsx
│   │   │       ├── orders/page.tsx
│   │   │       ├── products/new/page.tsx
│   │   │       └── marketing/page.tsx   # 🆕 AI Marketing Lab
│   │   ├── components/                  # React components tái sử dụng
│   │   │   ├── ui/                      # ProductCard, FarmCard, HeroBanner, ...
│   │   │   │   ├── ThemeToggle.tsx      # 🆕 Nút Dark/Light mode
│   │   │   │   └── FontSizeToggle.tsx   # 🆕 Nút A⁻ A A⁺
│   │   │   ├── layout/                  # Header, Footer, ClientProviders
│   │   │   │   └── ClientProviders.tsx  # 🆕 AuthProvider + ThemeProvider wrapper
│   │   │   └── auth/                    # 🆕 Auth components
│   │   │       └── ProtectedRoute.tsx   # 🆕 Route guard theo role
│   │   ├── contexts/                    # 🆕 React Context providers
│   │   │   ├── AuthContext.tsx          # 🆕 Auth + 5 roles + mock users
│   │   │   └── ThemeContext.tsx         # 🆕 Dark mode + font size
│   │   ├── hooks/                       # Custom React hooks (kết nối API)
│   │   ├── services/                    # Gọi API backend (axios wrappers)
│   │   ├── lib/                         # Utilities, constants, mock-data
│   │   └── types/                       # TypeScript type definitions
│   ├── next.config.ts                   # Image optimization, Security Headers
│   ├── tsconfig.json
│   ├── package.json
│   ├── Dockerfile.dev
│   └── .dockerignore                    # Exclude node_modules, .next
│
├── docker-compose.yml                   # Orchestrate 4 services
├── dev.sh                               # Script tiện ích
├── .env.example                         # Template biến môi trường
├── .env                                 # ⚠️ Biến thật (không commit)
├── .gitignore
└── README.md
```

### Tóm tắt: bỏ code ở đâu?

| Loại code | Thư mục | Ví dụ |
|-----------|---------|-------|
| REST API endpoint | `capnong-be/.../controller/` | `UserController.java` |
| Xử lý logic | `capnong-be/.../service/` | `UserService.java` |
| Truy vấn database | `capnong-be/.../repository/` | `UserRepository.java` |
| Entity / bảng DB | `capnong-be/.../model/` | `User.java` |
| Request/Response DTO | `capnong-be/.../dto/` | `LoginRequest.java` |
| Bảo mật, JWT | `capnong-be/.../security/` | `JwtFilter.java` |
| Config (Redis, CORS, ...) | `capnong-be/.../config/` | `RedisConfig.java` |
| Xử lý lỗi chung | `capnong-be/.../exception/` | `GlobalExceptionHandler.java` |
| Trang / route FE | `capnong-fe/src/app/` | `dashboard/page.tsx` |
| Component UI | `capnong-fe/src/components/` | `Button.tsx` |
| Gọi API backend | `capnong-fe/src/services/` | `authService.ts` |
| Custom hooks | `capnong-fe/src/hooks/` | `useAuth.ts` |
| TypeScript types | `capnong-fe/src/types/` | `user.ts` |

## Biến môi trường

Xem chi tiết trong [`.env.example`](.env.example). Các biến quan trọng:

| Biến | Mô tả |
|------|-------|
| `POSTGRES_PASSWORD` | Mật khẩu PostgreSQL |
| `REDIS_PASSWORD` | Mật khẩu Redis |
| `JWT_SECRET` | Secret key cho JWT (≥256 bits) |
| `GEMINI_API_KEY` | API key Google Gemini |
| `TELEGRAM_BOT_TOKEN` | Token Telegram Bot |

> ⚠️ **Không commit file `.env`** — file này đã được thêm vào `.gitignore`.

## License

Private — All rights reserved.
