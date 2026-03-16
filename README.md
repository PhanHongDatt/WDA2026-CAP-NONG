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

## Yêu cầu hệ thống

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — tải và cài đặt phiên bản phù hợp với hệ điều hành của bạn
- (Tùy chọn) Java 21, Node.js 20 — chỉ cần nếu muốn chạy ngoài Docker

> 💡 **Chưa có Docker?** Truy cập https://www.docker.com/products/docker-desktop/, nhấn **Download**, cài đặt như phần mềm bình thường, và khởi động lại máy nếu được yêu cầu.

---

## Hướng dẫn cài đặt chi tiết (từng bước)

### Bước 1: Tải mã nguồn

```bash
git clone <repo-url>
cd WD2026
```

### Bước 2: Tạo file cấu hình `.env`

File `.env` là nơi chứa các **thông tin bí mật** (mật khẩu, API key, ...) mà ứng dụng cần để hoạt động. File này **không được chia sẻ công khai** và đã được thêm vào `.gitignore`.

#### 2.1. Tạo bản sao từ template

**Trên Windows (PowerShell hoặc CMD):**

```powershell
copy .env.example .env
```

**Trên macOS / Linux:**

```bash
cp .env.example .env
```

#### 2.2. Mở file `.env` và điền giá trị

Mở file `.env` bằng bất kỳ trình soạn thảo nào (Notepad, VS Code, ...) rồi điền theo hướng dẫn bên dưới:

```env
# ============================================
# Cạp Nông - Environment Variables
# ============================================

# ─── PostgreSQL (Cơ sở dữ liệu) ───────────────
# Giữ nguyên tên DB và user, chỉ cần đặt mật khẩu
POSTGRES_DB=capnong_dev
POSTGRES_USER=capnong
POSTGRES_PASSWORD=MatKhau123                  # ← Đặt mật khẩu bất kỳ (ví dụ: MatKhau123)
POSTGRES_PORT=5432                            # ← Giữ nguyên, không cần thay đổi

# ─── Redis (Bộ nhớ đệm) ───────────────────────
REDIS_PASSWORD=RedisPass456                   # ← Đặt mật khẩu bất kỳ (ví dụ: RedisPass456)
REDIS_PORT=6379                               # ← Giữ nguyên, không cần thay đổi

# ─── JWT (Xác thực người dùng) ─────────────────
# Đây là chuỗi bí mật để mã hóa token đăng nhập.
# Bạn có thể dùng mẫu bên dưới hoặc tạo chuỗi ngẫu nhiên dài ≥ 32 ký tự.
JWT_SECRET=Y2Fwbm9uZy1zZWNyZXQta2V5LWZvci1qd3QtdG9rZW4tMjAyNg==
JWT_EXPIRATION_MS=86400000                    # ← Giữ nguyên (= 24 giờ)

# ─── Google Gemini AI (Tùy chọn) ───────────────
# Nếu CHƯA CẦN tính năng AI, để trống hoặc giữ nguyên dòng này.
# Nếu CẦN: truy cập https://aistudio.google.com/apikey → tạo API key → dán vào đây.
GEMINI_API_KEY=

# ─── Telegram Bot (Tùy chọn) ───────────────────
# Nếu CHƯA CẦN tính năng Telegram, để trống.
# Nếu CẦN: mở Telegram, tìm @BotFather, tạo bot, copy token → dán vào đây.
TELEGRAM_BOT_TOKEN=
TELEGRAM_BOT_USERNAME=

# ─── Cổng truy cập (Port) ──────────────────────
# Giữ nguyên nếu không bị trùng cổng với ứng dụng khác trên máy.
BACKEND_PORT=8080
FRONTEND_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=Cạp Nông
```

> ⚠️ **Quan trọng:**
> - Mật khẩu `POSTGRES_PASSWORD` và `REDIS_PASSWORD` bạn **tự đặt** — chúng chỉ dùng nội bộ trong Docker, không cần nhớ.
> - `JWT_SECRET` có thể dùng mẫu sẵn ở trên cho môi trường phát triển (dev).
> - `GEMINI_API_KEY` và `TELEGRAM_BOT_TOKEN` **có thể để trống** nếu chưa cần dùng tính năng AI và Telegram.
> - **Không commit file `.env`** lên git — file này chứa thông tin bí mật.

### Bước 3: Mở Docker Desktop

Đảm bảo **Docker Desktop** đã được khởi động và hiện biểu tượng 🐳 ở thanh taskbar (Windows) hoặc menu bar (macOS).

### Bước 4: Khởi chạy hệ thống

**Trên Windows (PowerShell hoặc CMD):**

```powershell
docker compose up -d --build
```

**Trên macOS / Linux:**

```bash
chmod +x dev.sh
./dev.sh up
```

> ⏱️ **Lần đầu** sẽ mất khoảng **5–15 phút** để tải và cài đặt. Các lần sau sẽ nhanh hơn nhiều.

### Bước 5: Kiểm tra trạng thái

```bash
docker compose ps
```

Nếu tất cả services hiện trạng thái **"running"** hoặc **"Up"** thì đã thành công ✅

### Bước 6: Xem logs (nếu cần debug)

```bash
docker compose logs -f
```

Chờ đến khi thấy:
- **Backend:** `Started CapnongApplication in X seconds`
- **Frontend:** `✓ Ready` hoặc `Ready in Xs`

Nhấn `Ctrl + C` để thoát xem logs (services vẫn tiếp tục chạy).

### Bước 7: Truy cập ứng dụng

Mở trình duyệt web và truy cập:

| Service | Địa chỉ | Mô tả |
|---------|---------|-------|
| 🌐 Giao diện chính | http://localhost:3000 | Trang web Cạp Nông |
| ⚙️ Backend API | http://localhost:8080 | Server xử lý dữ liệu |
| 📖 Tài liệu API | http://localhost:8080/swagger-ui.html | Danh sách tất cả API |
| 💚 Kiểm tra sức khỏe | http://localhost:8080/actuator/health | Kiểm tra server hoạt động |

---

## Xử lý sự cố thường gặp

| Vấn đề | Cách xử lý |
|--------|------------|
| `docker compose` báo lỗi | Đảm bảo Docker Desktop đang chạy |
| Port 3000 hoặc 8080 đã bị chiếm | Đổi `FRONTEND_PORT` hoặc `BACKEND_PORT` trong `.env` |
| Backend không khởi động | Chạy `docker compose logs backend` để xem lỗi chi tiết |
| Lỗi kết nối database | Kiểm tra `POSTGRES_PASSWORD` trong `.env` đã được đặt |
| Thay đổi `.env` không có hiệu lực | Chạy `docker compose down` rồi `docker compose up -d --build` lại |

---

## API Endpoints

| Method | Endpoint | Mô tả | Auth |
|--------|----------|-------|------|
| POST | `/api/auth/register` | Đăng ký tài khoản | ❌ |
| POST | `/api/auth/login` | Đăng nhập, nhận JWT | ❌ |
| GET | `/actuator/health` | Health check | ❌ |
| GET | `/swagger-ui.html` | API Documentation | ❌ |
| * | `/api/**` | Các endpoint khác | ✅ Bearer JWT |

## Các lệnh Docker hữu ích

### Trên Windows (PowerShell / CMD)

```powershell
docker compose up -d --build           # Build và khởi chạy tất cả
docker compose down                    # Dừng tất cả services
docker compose ps                      # Xem trạng thái services
docker compose logs -f                 # Xem logs tất cả services
docker compose logs -f backend         # Xem logs riêng backend
docker compose logs -f frontend        # Xem logs riêng frontend
docker compose up -d --build --no-deps backend    # Rebuild riêng backend
docker compose down -v                 # Xóa sạch data (database, cache) ⚠️
```

### Trên macOS / Linux (dùng script tiện ích)

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

## License

Private — All rights reserved.
