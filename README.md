# 🌾 Cạp Nông

Nền tảng nông nghiệp thông minh tích hợp AI, hỗ trợ nông dân Việt Nam.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Axios |
| Backend | Java 21 + Spring Boot 3.4 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| AI | Google Gemini API |
| Messaging | Telegram Bot API |
| Docs | Swagger UI (springdoc-openapi) |

## Yêu cầu

- [Docker](https://www.docker.com/) & Docker Compose v2+
- (Tùy chọn) Java 21, Node.js 20 — nếu muốn chạy ngoài Docker

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
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8080 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Health Check | http://localhost:8080/actuator/health |
| Remote Debug (Java) | `localhost:5005` |

## API Endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/register` | Đăng ký tài khoản | ❌ |
| POST | `/api/auth/login` | Đăng nhập, nhận JWT | ❌ |
| GET | `/actuator/health` | Health check | ❌ |
| GET | `/swagger-ui.html` | API Documentation | ❌ |
| * | `/api/**` | Các endpoint khác | ✅ Bearer JWT |

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
├── capnong-be/                              # ── BACKEND (Spring Boot) ──────
│   ├── src/main/java/com/capnong/
│   │   ├── CapnongApplication.java          # Main class
│   │   ├── config/
│   │   │   ├── SecurityConfig.java          # JWT filter chain, CORS, BCrypt
│   │   │   └── RedisConfig.java             # @EnableCaching, RedisTemplate
│   │   ├── security/
│   │   │   ├── JwtUtils.java                # Generate/validate/parse JWT
│   │   │   ├── JwtAuthenticationFilter.java # Extract Bearer → SecurityContext
│   │   │   ├── UserDetailsImpl.java         # UserDetails wrapper
│   │   │   └── UserDetailsServiceImpl.java  # Load user from DB
│   │   ├── controller/
│   │   │   └── AuthController.java          # POST /api/auth/login, /register
│   │   ├── service/
│   │   │   ├── AuthService.java             # Login + register logic
│   │   │   ├── GeminiService.java           # Google Gemini AI integration
│   │   │   └── TelegramBotService.java      # Telegram Bot sendMessage
│   │   ├── model/
│   │   │   ├── User.java                    # JPA entity (users table)
│   │   │   └── enums/Role.java              # USER, FARMER, EXPERT, ADMIN
│   │   ├── repository/
│   │   │   └── UserRepository.java          # JPA queries
│   │   ├── dto/
│   │   │   ├── request/                     # LoginRequest, RegisterRequest
│   │   │   └── response/                    # AuthResponse, ApiResponse<T>
│   │   └── exception/
│   │       ├── GlobalExceptionHandler.java  # @RestControllerAdvice
│   │       ├── AppException.java            # Custom exception + HTTP status
│   │       └── ResourceNotFoundException.java
│   ├── src/main/resources/
│   │   ├── application.yml                  # Config chính (dev)
│   │   ├── application-prod.yml             # Config production
│   │   └── logback-spring.xml               # Logging (console + file rotation)
│   ├── Dockerfile.dev
│   └── pom.xml
│
├── capnong-fe/                              # ── FRONTEND (Next.js 14) ──────
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                   # Root layout + AuthProvider
│   │   │   ├── page.tsx                     # Landing page "/"
│   │   │   ├── globals.css                  # Design system + styles
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx           # Trang đăng nhập
│   │   │   │   └── register/page.tsx        # Trang đăng ký
│   │   │   └── dashboard/page.tsx           # Dashboard (auth protected)
│   │   ├── contexts/AuthContext.tsx          # Auth state + useAuth() hook
│   │   ├── services/
│   │   │   ├── api.ts                       # Axios + JWT interceptor
│   │   │   └── authService.ts               # Login/register/logout
│   │   ├── types/index.ts                   # TypeScript interfaces
│   │   ├── middleware.ts                     # Route protection
│   │   ├── components/                      # (React components tái sử dụng)
│   │   ├── hooks/                           # (Custom React hooks)
│   │   └── lib/                             # (Utilities, constants)
│   ├── package.json
│   ├── next.config.js                       # API proxy rewrite
│   ├── tsconfig.json                        # @/ → src/ alias
│   └── Dockerfile.dev
│
├── docker-compose.yml                       # PostgreSQL, Redis, Backend, Frontend
├── dev.sh                                   # Script tiện ích (up/down/logs/db/...)
├── .env.example                             # Template biến môi trường
├── .gitignore
└── README.md
```

### Tóm tắt: bỏ code ở đâu?

| Loại code | Thư mục | Ví dụ |
|-----------|---------|-------|
| REST API endpoint | `capnong-be/.../controller/` | `AuthController.java` |
| Xử lý logic | `capnong-be/.../service/` | `AuthService.java` |
| Truy vấn database | `capnong-be/.../repository/` | `UserRepository.java` |
| Entity / bảng DB | `capnong-be/.../model/` | `User.java` |
| Request/Response DTO | `capnong-be/.../dto/` | `LoginRequest.java` |
| Bảo mật, JWT | `capnong-be/.../security/` | `JwtAuthenticationFilter.java` |
| Config (Redis, CORS, ...) | `capnong-be/.../config/` | `SecurityConfig.java` |
| Xử lý lỗi chung | `capnong-be/.../exception/` | `GlobalExceptionHandler.java` |
| Trang / route FE | `capnong-fe/src/app/` | `dashboard/page.tsx` |
| Component UI | `capnong-fe/src/components/` | `Button.tsx` |
| Gọi API backend | `capnong-fe/src/services/` | `authService.ts` |
| Auth state | `capnong-fe/src/contexts/` | `AuthContext.tsx` |
| TypeScript types | `capnong-fe/src/types/` | `index.ts` |

## Biến môi trường

Xem chi tiết trong [`.env.example`](.env.example). Các biến quan trọng:

| Biến | Mô tả |
|------|-------|
| `POSTGRES_PASSWORD` | Mật khẩu PostgreSQL |
| `REDIS_PASSWORD` | Mật khẩu Redis |
| `JWT_SECRET` | Secret key cho JWT (Base64, ≥256 bits) |
| `GEMINI_API_KEY` | API key Google Gemini |
| `TELEGRAM_BOT_TOKEN` | Token Telegram Bot |

> ⚠️ **Không commit file `.env`** — file này đã được thêm vào `.gitignore`.

## License

Private — All rights reserved.
