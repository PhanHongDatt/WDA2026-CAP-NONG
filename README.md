# 🌾 Cạp Nông

Nền tảng thương mại điện tử nông sản thông minh tích hợp AI, hỗ trợ nông dân Việt Nam tiếp cận thị trường số.

> 🏆 Dự án dự thi Vòng Chung kết WDA 2026 — Chủ đề TMĐT Nông sản & Truy xuất nguồn gốc.

**Live Demo:** <https://capnong.shop>

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router, React 19, Turbopack, React Compiler) |
| Backend | Java 21 + Spring Boot 3.4 |
| AI Service | Python 3.10 + FastAPI ≥0.115 |
| Database | PostgreSQL 16 (Supabase) |
| Cache | Redis 7 |
| Message Queue | Apache Kafka 3.7 (KRaft) |
| AI / LLM | Google Gemini (Flash / Pro), Imagen 4, Grok |
| Speech | Google Cloud STT + FPT.AI TTS |
| Notifications | Telegram Bot API, Twilio (SMS/Voice Call) |
| Image Storage | Cloudinary |
| Testing | Vitest (FE), JUnit 5 (BE) |

## Tính năng AI nổi bật

| # | Tính năng | Mô tả |
|---|-----------|-------|
| 1 | 🗣️ **Conversational Voice Chat** | Nông dân mô tả sản phẩm bằng giọng nói vùng miền → AI hội thoại từng bước → tự động tạo listing |
| 2 | 📢 **Proactive AI Assistant** | AI chủ động phân tích thời tiết/giá cả → gửi cảnh báo qua Telegram/SMS/Voice Call (Twilio) |
| 3 | 💰 **AI Price Advisor** | Gợi ý giá dựa trên phân tích thị trường, mùa vụ, khu vực |
| 4 | 🎨 **Multi-model AI Poster** | Tạo ấn phẩm quảng cáo bằng Gemini, Imagen 4, Grok (8 model lựa chọn) |
| 5 | ✍️ **AI Caption Generator** | Viết caption marketing 3 phong cách (Hài hước / Chân chất / Chuyên nghiệp) |
| 6 | 🔍 **AI Input Refiner** | Trau chuốt mô tả sản phẩm thô thành nội dung chuyên nghiệp |

## Yêu cầu chạy Local

- [Docker](https://www.docker.com/) & Docker Compose (khuyến nghị)
- **Ngôn ngữ & Runtime**:
  - **Java 21** (Backend — Spring Boot)
  - **Node.js ≥ 18** (Frontend — Next.js)
  - **Python 3.10+** (AI Service — FastAPI)
- **Database**: PostgreSQL 16 (local / Docker / Supabase)

## Bắt đầu nhanh (Môi trường Phát triển)

### Cách 1: Docker Compose (Khuyên dùng)

```bash
# Clone repo
git clone https://github.com/PhanHongDatt/WDA2026-CAP-NONG.git
cd WDA2026-CAP-NONG

# Cấu hình biến môi trường
cp .env.example .env
# Chỉnh sửa .env với các API key thực tế

# Khởi chạy toàn bộ hệ thống
docker compose up --build
```

### Cách 2: Chạy từng service

#### 1. Nền tảng (Database, Redis, Kafka)

```bash
# Khởi chạy các dịch vụ nền
docker compose up -d postgres redis kafka
```

#### 2. AI Service (Python FastAPI) — Port 8000

```bash
cd capnong-ai-service

# Tạo môi trường ảo và cài dependencies
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# Cấu hình .env
# Điền GEMINI_API_KEY, GOOGLE_STT_API_KEY, FPT_AI_API_KEY, OPENWEATHERMAP_API_KEY

# Khởi chạy server
uvicorn app.main:app --reload --port 8000
```

#### 3. Backend API (Spring Boot) — Port 8080

```bash
cd capnong-be

# Cấu hình .env (DB, JWT, Cloudinary, AI_SERVICE_URL, ...)

# Biên dịch và chạy
.\mvnw.cmd spring-boot:run   # Windows
# ./mvnw spring-boot:run     # Linux/Mac
```

#### 4. Frontend (Next.js) — Port 3000

### 4. Tài khoản Demo cho Giám khảo (Vòng Chung Kết)

Dự án đã chuẩn bị sẵn bộ tài khoản riêng biệt để phục vụ việc trải nghiệm và chấm thi, tránh xung đột dữ liệu khi nhiều giám khảo cùng test. Hệ thống hỗ trợ tính năng **Đăng nhập nhanh** (Nút "🏆 Demo Chung kết — Đăng nhập nhanh" tại trang Login) để tự động điền thông tin.

Mật khẩu chung cho tất cả: `Password123!`

| Role | Username (Giám khảo 1-6) | Mô tả |
|------|------------------------|-------|
| Nông dân | `farmer_gk1` -> `farmer_gk6` | Tài khoản Nông dân (Có sẵn Shop "Vườn Giám Khảo X") |
| Người mua | `buyer_gk1` -> `buyer_gk6` | Tài khoản Người mua hàng |
| Quản lý HTX | `htxmgr_gk1` -> `htxmgr_gk6` | Quản lý Hợp tác xã (Có sẵn HTX và HtxShop) |
| Admin | `admin_gk1` -> `admin_gk6` | Quản trị viên hệ thống |

> **Lưu ý Rate Limiter**: Hệ thống có tích hợp giới hạn đăng nhập (khóa 15 phút nếu sai pass 5 lần). Vui lòng sử dụng tính năng "Đăng nhập nhanh" để tránh bị khóa. Nếu bị khóa khi test local, dùng lệnh: `docker exec capnong-redis redis-cli FLUSHALL`.

```bash
cd capnong-fe

# Cài đặt thư viện
npm install

# Khởi chạy chế độ dev
npm run dev
```

### Truy cập sau khi chạy

| Service | URL |
|---------|-----|
| Frontend | <http://localhost:3000> |
| Backend API (Swagger) | <http://localhost:8080/swagger-ui/index.html> |
| AI Service Docs | <http://localhost:8000/docs> |

## Cấu trúc dự án

```
WDA2026-CAP-NONG/
│
├── capnong-be/                          # ── BACKEND (Spring Boot 3.4 + Java 21) ──
│   ├── src/
│   │   ├── main/java/com/capnong/
│   │   │   ├── config/                  # Cấu hình hệ thống
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── RedisConfig.java
│   │   │   │   ├── KafkaTopicConfig.java
│   │   │   │   ├── CloudinaryConfig.java
│   │   │   │   ├── CorsConfig.java
│   │   │   │   ├── SwaggerConfig.java
│   │   │   │   ├── AiServiceConfig.java
│   │   │   │   └── DataInitializer.java    # Seed data
│   │   │   ├── controller/              # 21 REST Controllers
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── ProductController.java
│   │   │   │   ├── ShopController.java
│   │   │   │   ├── CartController.java
│   │   │   │   ├── OrderController.java
│   │   │   │   ├── HtxController.java
│   │   │   │   ├── CooperativeController.java
│   │   │   │   ├── ReviewController.java
│   │   │   │   ├── NotificationController.java
│   │   │   │   ├── AiController.java           # AI Marketing + Voice
│   │   │   │   ├── VoiceController.java        # 🆕 Voice Chat proxy
│   │   │   │   ├── DashboardController.java    # 🆕 Dashboard stats
│   │   │   │   ├── AdminController.java
│   │   │   │   ├── UserController.java
│   │   │   │   ├── UserAddressController.java  # 🆕
│   │   │   │   ├── OtpController.java          # 🆕
│   │   │   │   ├── SeasonalConfigController.java # 🆕 Mùa vụ
│   │   │   │   ├── HtxAdminController.java     # 🆕
│   │   │   │   ├── UnitController.java
│   │   │   │   ├── AddressController.java
│   │   │   │   └── TelegramWebhookController.java
│   │   │   ├── service/                 # 29 Business Logic services
│   │   │   │   ├── AiListingService.java       # Voice-to-Product
│   │   │   │   ├── AiMarketingService.java     # Caption + Poster
│   │   │   │   ├── SmartNotificationService.java # 🆕 Twilio
│   │   │   │   ├── CloudinaryService.java      # 🆕
│   │   │   │   ├── DashboardService.java       # 🆕
│   │   │   │   ├── OtpService.java             # 🆕
│   │   │   │   ├── SeasonalConfigService.java  # 🆕
│   │   │   │   └── ... (Auth, Cart, Order, Shop, Product, Review, ...)
│   │   │   ├── scheduler/               # 🆕 Background Jobs
│   │   │   │   ├── SmartNotificationScheduler.java  # AI proactive alerts
│   │   │   │   ├── BundleScheduler.java             # HTX bundle expiry
│   │   │   │   └── SeasonalStatusJob.java           # Seasonal config
│   │   │   ├── repository/              # 27 JPA Repositories
│   │   │   ├── model/                   # Entity classes
│   │   │   │   └── enums/               # 24 Enum types
│   │   │   ├── dto/
│   │   │   │   ├── request/
│   │   │   │   └── response/
│   │   │   ├── security/                # JWT filter, UserDetailsImpl
│   │   │   ├── exception/               # AppException, GlobalExceptionHandler
│   │   │   └── CapnongApplication.java  # @EnableAsync, @EnableScheduling
│   │   └── resources/
│   │       └── application.yml          # Config (DB, Redis, Kafka, JWT, AI)
│   └── pom.xml
│
├── capnong-ai-service/                  # ── AI SERVICE (FastAPI + Gemini) ──
│   ├── app/
│   │   ├── main.py                      # FastAPI entrypoint
│   │   ├── routers/                     # 8 AI Routers
│   │   │   ├── voice_chat.py            # 🆕 Conversational Voice Chat
│   │   │   ├── stt.py                   # 🆕 Google Cloud STT
│   │   │   ├── tts.py                   # 🆕 FPT.AI Text-to-Speech
│   │   │   ├── poster.py               # AI Poster (HTML + AI Image)
│   │   │   ├── caption.py              # AI Caption Generator
│   │   │   ├── refiner.py              # AI Input Refiner
│   │   │   ├── voice.py                # Voice-to-Product extraction
│   │   │   └── proactive.py            # 🆕 Proactive AI (thời tiết/giá)
│   │   ├── services/
│   │   │   ├── gemini_service.py        # Multi-model AI (Gemini/Imagen/Grok)
│   │   │   └── market_intel_service.py  # 🆕 Phân tích thị trường
│   │   ├── schemas/                     # Pydantic models
│   │   └── prompts/                     # System prompts
│   ├── requirements.txt
│   └── Dockerfile
│
├── capnong-fe/                          # ── FRONTEND (Next.js 16) ──
│   ├── public/                          # File tĩnh (favicon, images, manifest)
│   ├── src/
│   │   ├── app/                         # App Router — mỗi folder = 1 route
│   │   │   ├── layout.tsx               # Layout gốc + ClientProviders
│   │   │   ├── page.tsx                 # Redirect → /home
│   │   │   ├── globals.css              # Design System + Dark Mode + Font Size
│   │   │   ├── home/page.tsx            # Trang chủ + JSON-LD
│   │   │   ├── catalog/                 # Danh mục sản phẩm
│   │   │   ├── product/                 # Chi tiết sản phẩm
│   │   │   ├── shop/ & shops/           # Gian hàng nông dân
│   │   │   ├── cart/                    # Giỏ hàng
│   │   │   ├── checkout/               # Thanh toán
│   │   │   ├── orders/                  # 🆕 Lịch sử đơn hàng (buyer)
│   │   │   ├── cooperative/             # Dashboard gom đơn HTX
│   │   │   ├── profile/                 # 🆕 Trang cá nhân
│   │   │   ├── wishlist/                # 🆕 Danh sách yêu thích
│   │   │   ├── admin/                   # 🆕 Admin Dashboard
│   │   │   ├── (auth)/                  # Route group: login, register
│   │   │   ├── dashboard/               # Dashboard nông dân
│   │   │   │   ├── page.tsx             # Tổng quan
│   │   │   │   ├── orders/              # Quản lý đơn hàng
│   │   │   │   ├── products/            # Quản lý sản phẩm
│   │   │   │   ├── reviews/             # 🆕 Quản lý đánh giá
│   │   │   │   ├── shop/               # 🆕 Quản lý gian hàng
│   │   │   │   └── marketing/           # AI Marketing Lab
│   │   │   ├── 403/                     # Trang cấm truy cập
│   │   │   ├── offline/                 # 🆕 PWA offline page
│   │   │   ├── sitemap.ts & robots.ts   # SEO
│   │   │   └── api/                     # Next.js API routes (proxy)
│   │   ├── components/
│   │   │   ├── ui/                      # 26 UI components
│   │   │   │   ├── ConversationalVoiceRecorder.tsx  # 🆕 Voice Chat UI
│   │   │   │   ├── VoiceRecorder.tsx    # Voice-to-Product UI
│   │   │   │   ├── PriceAdvisor.tsx     # 🆕 AI Price Advisor
│   │   │   │   ├── AIDigestCard.tsx     # 🆕 AI Digest Card
│   │   │   │   ├── AIRefiner.tsx        # AI Input Refiner
│   │   │   │   ├── NotificationBell.tsx # 🆕 Real-time notifications
│   │   │   │   ├── ThemeToggle.tsx      # Dark/Light mode
│   │   │   │   ├── FontSizeToggle.tsx   # A⁻ A A⁺ accessibility
│   │   │   │   └── ...                  # ProductCard, FarmCard, etc.
│   │   │   ├── layout/                  # Header, Footer, ClientProviders
│   │   │   ├── auth/                    # ProtectedRoute, Auth guards
│   │   │   ├── marketing/              # Poster templates
│   │   │   └── shop/                   # Shop components
│   │   ├── contexts/                    # React Context providers
│   │   ├── hooks/                       # Custom React hooks
│   │   ├── services/                    # API service layer (axios)
│   │   ├── lib/                         # Utilities, constants
│   │   └── types/                       # TypeScript type definitions
│   ├── next.config.ts                   # React Compiler, Security Headers, Rewrites
│   ├── package.json
│   └── Dockerfile.dev
│
├── docker-compose.yml                   # Dev: 6 services (PG, Redis, Kafka, BE, FE, AI)
├── docker-compose.prod.yml              # Production config
├── docker-compose.vps.yml               # VPS deployment
├── docker-compose.aws.yml               # AWS deployment
├── deploy.sh                            # Script deploy production
├── dev.sh                               # Script tiện ích dev
├── .env.example                         # Template biến môi trường
├── doc.md                               # Báo cáo vòng Chung kết
└── README.md
```

### Tóm tắt: bỏ code ở đâu?

| Loại code | Thư mục | Ví dụ |
|-----------|---------|-------|
| REST API endpoint | `capnong-be/.../controller/` | `ProductController.java` |
| Xử lý logic | `capnong-be/.../service/` | `AiMarketingService.java` |
| Background Job | `capnong-be/.../scheduler/` | `SmartNotificationScheduler.java` |
| Truy vấn database | `capnong-be/.../repository/` | `ProductRepository.java` |
| Entity / bảng DB | `capnong-be/.../model/` | `Product.java` |
| Request/Response DTO | `capnong-be/.../dto/` | `PosterGenerateRequest.java` |
| Bảo mật, JWT | `capnong-be/.../security/` | `JwtFilter.java` |
| Config (Redis, Kafka, ...) | `capnong-be/.../config/` | `KafkaTopicConfig.java` |
| Xử lý lỗi chung | `capnong-be/.../exception/` | `GlobalExceptionHandler.java` |
| AI Router (FastAPI) | `capnong-ai-service/.../routers/` | `voice_chat.py` |
| AI Service logic | `capnong-ai-service/.../services/` | `gemini_service.py` |
| Trang / route FE | `capnong-fe/src/app/` | `dashboard/marketing/page.tsx` |
| Component UI | `capnong-fe/src/components/` | `ConversationalVoiceRecorder.tsx` |
| Gọi API backend | `capnong-fe/src/services/` | `ai.ts` |
| Custom hooks | `capnong-fe/src/hooks/` | `useAuth.ts` |
| TypeScript types | `capnong-fe/src/types/` | `product.ts` |

## Biến môi trường

Xem chi tiết trong [`.env.example`](.env.example). Các biến quan trọng:

| Biến | Mô tả | Service |
|------|-------|---------|
| `POSTGRES_PASSWORD` | Mật khẩu PostgreSQL | Docker |
| `REDIS_PASSWORD` | Mật khẩu Redis | Docker |
| `JWT_SECRET` | Secret key cho JWT (≥256 bits) | Backend |
| `GEMINI_API_KEY` | Google Gemini API key | Backend + AI |
| `GOOGLE_STT_API_KEY` | Google Cloud Speech-to-Text | AI Service |
| `FPT_AI_API_KEY` | FPT.AI Text-to-Speech | AI Service |
| `OPENWEATHERMAP_API_KEY` | OpenWeatherMap cho Proactive AI | AI Service |
| `CLOUDINARY_*` | Cloud name, API key, secret | Backend |
| `TELEGRAM_BOT_TOKEN` | Token Telegram Bot | Backend |
| `AI_SERVICE_URL` | URL của AI Service FastAPI | Backend |
| `XAI_API_KEY` | xAI Grok API key (tùy chọn) | AI Service |

> ⚠️ **Không commit file `.env`** — file này đã được thêm vào `.gitignore`.

## License

Private — All rights reserved.
Nếu gặp khó khăn, liên hệ phanduyminh1262@gmail.com.
