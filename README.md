# 🌾 Cạp Nông

Nền tảng nông nghiệp thông minh tích hợp AI, hỗ trợ nông dân Việt Nam.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router, Turbopack) |
| Backend | Java 21 + Spring Boot 3 |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| AI | OpenAI/MegaLLM (hiện tại) → Google Gemini (sau) |
| Messaging | Telegram Bot API |

## Yêu cầu chạy Local

Để chạy dự án local phục vụ việc phát triển, bạn cần chuẩn bị các môi trường sau:
- [Docker](https://www.docker.com/) & Docker Compose (cho các dịch vụ phụ trợ như Redis, Kafka, PostgreSQL nếu không cài local).
- **Ngôn ngữ & Runtime**: 
  - **Java 21** (Backend - Spring Boot)
  - **Node.js 22** (Frontend - Next.js)
  - **Python 3.10+** (AI Service - FastAPI)
- **Cơ sở dữ liệu**: PostgreSQL 16 (local hoặc qua Supabase/Docker).

## Bắt đầu nhanh (Môi trường Phát triển)

Làm theo các bước sau để khởi chạy toàn bộ hệ thống ở môi trường local của bạn:

### 1. Nền tảng (Database, Redis, Kafka)

Hệ thống yêu cầu có Redis (cache) và Kafka (message queue) để hoạt động. Bạn có thể dùng Docker Compose để khởi chạy nhanh các dịch vụ này:

```bash
# Di chuyển tới thư mục gốc của dự án
cd WD2026

# Tạo file .env từ template (và cấu hình lại url database, port tuỳ ý)
cp .env.example .env

# Chạy cụm Docker cho Redis & Kafka (và Postgres nếu bạn thiết lập trong docker-compose.yml)
docker-compose up -d redis kafka zookeeper
```
*(Lưu ý: Nếu sử dụng Supabase cho PostgreSQL, hãy điền `SUPABASE_URL` và thông tin Auth vào `.env` backend).*

### 2. Khởi chạy AI Service (Python FastAPI)

Dịch vụ AI phục vụ xử lý Poster và Caption.

```bash
cd capnong-ai-service

# Tạo môi trường ảo và cài dependencies
python -m venv venv
venv\Scripts\activate   # trên Windows
# source venv/bin/activate # trên Linux/Mac
pip install -r requirements.txt

# Khởi chạy server trên cổng 8000
uvicorn app.main:app --reload --port 8000
```

### 3. Khởi chạy Backend API (Java Spring Boot)

Backend chạy trên cổng 8080. Cần lưu ý cấu hình biến môi trường kết nối Database (Supabase), Kafka, Redis, và Cloudinary.

```bash
cd capnong-be

# Cấu hình file ứng dụng:
# Mở src/main/resources/application.yml (hoặc .env tương ứng)
# và chỉnh sửa các tham số db, redis port, kafka bootstrap-servers, v.v.

# Biên dịch và chạy
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=dev"
# (trên macOS/Linux: ./mvnw spring-boot:run)
```

### 4. Khởi chạy Frontend (Next.js)

Giao diện Web App tương tác với người dùng ở cổng 3000.

```bash
cd capnong-fe

# Copy biến môi trường cho Frontend
cp .env.example .env.local
# (Chỉnh sửa .env.local để trỏ tới http://localhost:8080 cho NEXT_PUBLIC_API_URL)

# Cài đặt thư viện
npm install

# Khởi chạy chế độ dev
npm run dev
```

Sau khi chạy xong, hãy truy cập:
- Frontend: <http://localhost:3000>
- Backend API (Swagger/OpenAPI): <http://localhost:8080/swagger-ui/index.html>
- AI Service Docs: <http://localhost:8000/docs>

## Cấu trúc dự án

```
WD2026/
│
├── capnong-be/                          # ── BACKEND (Spring Boot) ──────────
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/capnong/
│   │   │   │   ├── config/              # Cấu hình
│   │   │   │   │   ├── RedisConfig.java
│   │   │   │   │   ├── SecurityConfig.java
│   │   │   │   │   ├── CorsConfig.java
│   │   │   │   │   ├── SwaggerConfig.java
│   │   │   │   │   └── WebConfig.java       # snake_case + JavaTimeModule
│   │   │   │   ├── controller/          # 13 REST Controllers
│   │   │   │   │   ├── AuthController.java
│   │   │   │   │   ├── ShopController.java
│   │   │   │   │   ├── ProductController.java
│   │   │   │   │   ├── CartController.java
│   │   │   │   │   ├── OrderController.java
│   │   │   │   │   ├── HtxController.java
│   │   │   │   │   ├── CooperativeController.java
│   │   │   │   │   ├── ReviewController.java
│   │   │   │   │   ├── NotificationController.java
│   │   │   │   │   ├── AiController.java        # 6 AI endpoints
│   │   │   │   │   ├── AdminController.java
│   │   │   │   │   ├── UserController.java
│   │   │   │   │   └── UnitController.java
│   │   │   │   ├── service/             # 13 Business Logic services
│   │   │   │   │   ├── AuthService.java
│   │   │   │   │   ├── ShopService.java
│   │   │   │   │   ├── ProductService.java
│   │   │   │   │   ├── CartService.java
│   │   │   │   │   ├── OrderService.java
│   │   │   │   │   ├── HtxService.java
│   │   │   │   │   ├── CooperativeService.java
│   │   │   │   │   ├── ReviewService.java
│   │   │   │   │   ├── NotificationService.java
│   │   │   │   │   ├── AdminService.java
│   │   │   │   │   ├── TelegramBotService.java
│   │   │   │   │   ├── TelegramNotificationService.java
│   │   │   │   │   ├── GeminiService.java       # (dự phòng)
│   │   │   │   │   └── ai/                      # AI Adapter Pattern
│   │   │   │   │       ├── AiProvider.java      # Interface (swap provider)
│   │   │   │   │       ├── OpenAiProvider.java  # @Primary — MegaLLM
│   │   │   │   │       └── AiService.java       # 6 AI features
│   │   │   │   ├── repository/          # 20 JPA Repositories
│   │   │   │   ├── model/               # Entity classes + enums
│   │   │   │   │   └── enums/           # OrderStatus, Role, BundleStatus, ...
│   │   │   │   ├── dto/                 # Data Transfer Objects
│   │   │   │   │   ├── request/         # 10 Request DTOs
│   │   │   │   │   └── response/        # 15 Response DTOs + PageResponse + ApiError
│   │   │   │   ├── security/            # JWT filter, UserDetailsImpl
│   │   │   │   ├── exception/           # AppException, GlobalExceptionHandler
│   │   │   │   └── CapnongApplication.java
│   │   │   └── resources/
│   │   │       ├── application.yml      # Config chính (DB, Redis, JWT, AI, Telegram)
│   │   │       └── data.sql             # Seed data
│   │   └── test/java/com/capnong/      # Unit tests (15 tests)
│   │       └── service/
│   │           ├── CartServiceTest.java         # 4 tests
│   │           ├── CooperativeServiceTest.java  # 6 tests
│   │           └── ReviewServiceTest.java       # 5 tests
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
| `AI_API_KEY` | API key AI provider (hiện dùng MegaLLM) |
| `TELEGRAM_BOT_TOKEN` | Token Telegram Bot |

> ⚠️ **Không commit file `.env`** — file này đã được thêm vào `.gitignore`.

## License

Private — All rights reserved.
Nếu gặp khó khăn, liên hệ phanduyminh1262@gmail.com.
