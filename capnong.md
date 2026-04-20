Proposal

# **CẠP NÔNG - Hệ sinh thái Thương mại Nông sản Thông minh dành cho Hợp tác xã số**

## **1. TỔNG QUAN DỰ ÁN**

**Cạp Nông** là nền tảng Web App thương mại điện tử thế hệ mới, được thiết kế để xóa bỏ rào cản công nghệ cho nông dân và tối ưu hóa chuỗi cung ứng thông qua mô hình **Gom đơn hàng (Digital Cooperative)**. Bằng cách kết hợp Trí tuệ nhân tạo (AI) và hệ thống thông báo đa kênh (Telegram/Zalo), dự án giúp chuyển đổi mô hình kinh doanh truyền thống sang kinh tế số một cách đơn giản nhất.

## **2. THỰC TRẠNG VÀ VẤN ĐỀ**

Dựa trên bối cảnh nông nghiệp Việt Nam 2026, dự án tập trung giải quyết 3 "nỗi đau" lớn:

* **Rào cản thao tác:** Nông dân thạo canh tác nhưng ngại gõ phím, ngại quản lý các giao diện web phức tạp.
* **Khoảng cách Marketing:** Sản phẩm chất lượng cao nhưng hình ảnh và nội dung quảng bá còn sơ sài, dẫn đến giá bán thấp.
* **Sản xuất nhỏ lẻ:** Nông hộ khó tiếp cận đơn hàng lớn do sản lượng đơn lẻ thấp và chi phí vận chuyển cao.

## **3. DANH SÁCH CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS)**

### **3.1. Phân hệ AI Smart Assistant (Dành cho Nông dân)**

* **Voice-to-Product:** Tích hợp Micro thu âm ngay trên trình duyệt.
  + AI (NLP) tự động bóc tách: Tên sản phẩm, Mô tả, Đơn giá, Đơn vị tính, Sản lượng hiện có…
  + Tự động điền vào Form đăng bán mà không cần gõ phím.
  + Hỗ trợ giọng địa phương.
* **AI Input Refiner (Trợ lý biên tập):**
  + Nông dân nhập nội dung thô, sai chính tả hoặc dùng từ địa phương.
  + AI tự động sửa lỗi, định dạng lại thành đoạn mô tả chuyên nghiệp, hấp dẫn người mua nhưng vẫn giữ đúng ý nghĩa gốc.
* **AI Marketing Lab:**
  + Tạo Caption bài đăng Facebook (3 phong cách: hài hước, chân chất, chuyên nghiệp).
  + Tự động tách nền và làm đẹp ảnh sản phẩm bằng AI.
  + Tự động tạo ấn phẩm quảng cáo bằng GenAI.

### **3.2. Phân hệ E-commerce Cốt lõi (Dành cho Người mua & Nông dân)**

* **Quản lý Gian hàng (Shop Management):** Mỗi nông hộ/HTX có một trang cửa hàng riêng với link định danh (Slug). Thông tin: Tên vườn/HTX, tỉnh/xã, ảnh đại diện, câu chuyện người trồng. Giao diện mobile-first, ưu tiên tốc độ tải.
* **Danh mục Sản phẩm (Catalog):** Hiển thị theo loại (Trái cây, Rau củ, Hạt...), vùng miền và trạng thái (Đang mùa, Sắp thu hoạch). Badge trạng thái (Đang mùa, Sắp thu hoạch, hết hàng). Hiển thị thông tin truy xuất nguồn gốc ngay trên card sản phẩm.
* **Giỏ hàng & Thanh toán (Cart & Checkout):**
  + Hỗ trợ mua hàng từ nhiều nhà vườn trong một đơn hàng.
  + Tích hợp thanh toán linh hoạt (Tích hợp COD và Mock chuyển khoản).
* **Quản lý Đơn hàng (Order Tracking):**
  + Nông dân: Nhận thông báo đơn mới, xác nhận, chuẩn bị hàng, đã giao.
  + Người mua: Theo dõi trạng thái đơn hàng (Đang xử lý -> Đang giao -> Đã nhận). (Chỉ cập nhật thủ công bởi người bán, không GPS)
* **Gợi ý sản phẩm dựa trên rule-based đơn giản.**

**3.3. Phân hệ Digital Cooperative (Gom đơn hàng thông minh - MVP)**

* **Dashboard:** Hiển thị danh sách các đơn hàng lẻ có cùng loại sản phẩm và cùng khu vực địa lý. Thanh tiến độ “Đã gom X/Y kg, cần thêm Z kg nữa để thuê chành xe”. Nông dân đăng ký tham gia gom đơn với sản lượng đóng góp.
* **Logic Matching:**
  + Hệ thống gợi ý các đơn có thể gom (cùng loại + cùng khu vực), quản lý HTX xác nhận
    - Không dùng auto-matching algorithm phức tạp (tránh rủi ro kỹ thuật).
    - Lọc đơn theo bán kính: Dùng filter dropdown theo tỉnh/huyện thay vì Maps API distance.
  + Sau khi gom đủ: Thông báo cho tất cả nông dân tham gia qua Telegram Bot.
* **Phân chia lợi nhuận tự động:** Ghi nhận sự đóng góp sản lượng của từng hộ trong một đơn hàng lớn để phân chia lợi nhuận minh bạch.
  + Mỗi nông dân tham gia được ghi nhận: Tên, sản lượng (kg), tỷ lệ % trên tổng đơn
  + Hệ thống tính toán và hiển thị: Số tiền nhận được dựa trên tỷ lệ đóng góp.

### **3.4. Phân hệ Thông báo & Tương tác (Communication)**

* **Telegram Bot Integration:** Ngoài các thông báo inapp, người dùng có thể đăng ký để nhận thông báo qua mail hoặc Telegram:
  + Gửi thông báo tức thời cho nông dân khi có đơn hàng mới, đơn hàng gom đủ số lượng và sẵn sàng giao.

**3.5. Phân hệ truy xuất nguồn gốc và tin cậy**

* Thông tin truy xuất nguồn gốc tối giản:
  + Mỗi sản phẩm bổ sung các trường thông tin bắt buộc: Địa điểm canh tác, Ngày thu hoạch dự kiến, Phương thức canh tác, Không dùng thuốc (hữu cơ).
  + Hiển thị dưới dạng badge/icon dễ nhìn
* Profile Nông dân/HTX: Trang giới thiệu của từng vườn/HTX được xây dựng theo theme tùy chọn với các thông tin.
  + Ảnh vườn, canh tác thực tế
  + Câu chuyện của người trồng
  + Số năm kinh nghiệm canh tác, diện tích vườn
  + Đánh giá từ người mua

**Tóm tắt:**

![](data:image/png;base64...)

## **4. KIẾN TRÚC CÔNG NGHỆ (TECHSTACK)**

Dự án được xây dựng trên tiêu chí: **Hiệu năng cao - Mở rộng dễ dàng - Triển khai nhanh.**

| **Thành phần** | **Công nghệ sử dụng** |
| --- | --- |
| **Frontend** | **React / Next.js** (Tối ưu SEO và tốc độ tải trang). |
| **Backend** | **Java Springboot** |
| **Database** | **PostgreSQL** |
| **AI Engine** | **Google Gemini API** (Xử lý NLP cho giọng nói và GenAI cho nội dung). |
| **Integrations** | **Telegram Bot API** (Hệ thống thông báo và phản hồi nhanh). |

## **5. LỘ TRÌNH PHÁT TRIỂN (1 THÁNG)**

Dự án được chia thành 4 giai đoạn nước rút:

## **TUẦN 1 — Kiến trúc & Hạ tầng (Ngày 1–7)**

**Mục tiêu:** Toàn bộ hạ tầng kỹ thuật sẵn sàng. Schema database và API Contract được phê duyệt trước khi code.

| **Nhiệm vụ** | **Chi tiết** | **Phụ trách** | **Ưu tiên** |
| --- | --- | --- | --- |
| Thiết lập môi trường | Docker Compose: Next.js + Spring Boot + PostgreSQL + Nginx. CI/CD pipeline cơ bản. | 🔵 Đạt | 🔴 Bắt buộc |
| Thiết kế ERD | Schema: Users, Shops, Products, Orders, OrderItems, CoopPools, ContributionLogs, TraceabilityInfo. | 🔴 M.Khôi | 🔴 Bắt buộc |
| Viết API Contract | OpenAPI spec cho tất cả endpoints. Đây là giao kèo FE–BE để hai bên làm song song từ Tuần 2. | 🔴 M.Khôi | 🔴 Bắt buộc |
| Design System & Wireframe | Color palette, typography, component library (button, card, form). Figma wireframe màn hình chính. | 🟣 T.Khôi | 🔴 Bắt buộc |
| Telegram Bot Sandbox | [T.Kh](http://t.kh)ôi tạo bot, kết nối webhook, test gửi tin nhắn cơ bản. | 🟢 Minh | 🟡 Quan trọng |
| Nghiên cứu Gemini API | Test Voice transcription, NLP entity extraction với nội dung nông sản thực tế. Viết prompt draft. | 🟢 Minh | 🟡 Quan trọng |

## **TUẦN 2 — Core E-commerce & Backend (Ngày 8–14)**

**Mục tiêu:** Luồng mua hàng hoàn chỉnh hoạt động end-to-end (dù chưa đẹp). FE và BE chạy song song dựa trên API Contract.

| **Nhiệm vụ** | **Chi tiết** | **Phụ trách** | **Ưu tiên** |
| --- | --- | --- | --- |
| Backend: Auth & User | JWT Authentication, đăng ký/đăng nhập cho 2 role: Nông dân và Người mua. | 🔴 M.Khôi | 🔴 Bắt buộc |
| Backend: Shop & Product | CRUD Gian hàng, CRUD Sản phẩm (gồm trường truy xuất nguồn gốc), upload ảnh. | 🔴 M.Khôi | 🔴 Bắt buộc |
| Backend: Cart & Order | Tạo giỏ hàng, đặt hàng, cập nhật trạng thái đơn. Rule-based product suggestion. | 🟢 Minh | 🔴 Bắt buộc |
| FE: Trang chủ & Catalog | Giao diện sản phẩm, trang danh mục, filter theo loại/vùng/mùa vụ. Mobile-first. | 🔵 Đạt | 🔴 Bắt buộc |
| FE: Gian hàng & Sản phẩm | Trang shop nông dân, trang chi tiết sản phẩm với hiển thị truy xuất nguồn gốc + profile nông dân. | 🟣 T.Khôi | 🔴 Bắt buộc |
| FE: Giỏ hàng & Checkout | Giỏ hàng đa nhà vườn, form đặt hàng, hiển thị QR chuyển khoản tĩnh. | 🔵 Đạt | 🔴 Bắt buộc |
| FE: Form đăng sản phẩm | Form nhập đầy đủ các trường, chuẩn bị placeholder cho Voice Input (Tuần 3). | 🟣 T.Khôi | 🟡 Quan trọng |

## **TUẦN 3 — AI Integration & Telegram (Ngày 15–21)**

**Mục tiêu:** Tích hợp xong 3 tính năng AI cốt lõi + Telegram. Đây là tuần có rủi ro kỹ thuật cao nhất — ưu tiên Voice-to-Product trước, các tính năng còn lại làm song song.

| **Nhiệm vụ** | **Chi tiết** | **Phụ trách** | **Ưu tiên** |
| --- | --- | --- | --- |
| Voice-to-Product (AI) | Ghi âm trên browser → Gửi audio lên Gemini API → Parse JSON (tên, mô tả, giá, đơn vị, sản lượng) → Tự điền form. | 🟢 Minh | 🔴 Bắt buộc |
| AI Input Refiner | Text input thô → Gemini API với prompt chuẩn hóa → Hiển thị đề xuất → Nông dân confirm. | 🟢 Minh | 🔴 Bắt buộc |
| Tích hợp AI lên FE | Kết nối Voice-to-Product và AI Refiner vào Form đăng sản phẩm. UX loading state, error handling. | 🔵 Đạt | 🔴 Bắt buộc |
| Telegram Notification | Kết nối Telegram Bot với hệ thống Order. Bắn thông báo khi có đơn mới và khi pool gom đơn đủ. | 🔴 M.Khôi | 🔴 Bắt buộc |
| Caption Facebook (AI) | Input: Tên + mô tả sản phẩm → Gemini API → Output: 3 caption theo phong cách. UI cho phép copy. | 🟢 Minh | 🟡 Quan trọng |
| Tách nền ảnh (AI) và Thiết kế bằng AI Gen. | Upload ảnh → Remove.bg API / Gemini Vision → Trả ảnh đã tách nền → Nông dân download/dùng ngay. | 🟢 Minh | 🟡 Quan trọng |
| FE: Dashboard Nông dân | Tổng quan đơn hàng, sản phẩm đang bán, thông báo. Bổ sung UI Marketing Lab. | 🟣 T.Khôi | 🟡 Quan trọng |

## **TUẦN 4 — Gom đơn, Hoàn thiện & Demo Prep (Ngày 22–30)**

**Mục tiêu:** Tính năng Gom đơn hoạt động ở mức MVP. Bug fix toàn hệ thống. Chuẩn bị demo scenario thuyết phục.

| **Nhiệm vụ** | **Chi tiết** | **Phụ trách** | **Ưu tiên** |
| --- | --- | --- | --- |
| Backend: Coop Pool Logic | API tạo pool gom đơn, đăng ký tham gia, tính % đóng góp, phân chia doanh thu. Gửi Telegram khi đủ. | 🔴 M.Khôi | 🔴 Bắt buộc |
| FE: Dashboard Gom đơn | Hiển thị pool đang mở, thanh tiến độ, form đăng ký tham gia, bảng phân chia lợi nhuận. | 🟣 T.Khôi | 🔴 Bắt buộc |
| QA & Bug Fix Round 1 | Test toàn bộ happy path theo user story. Tạo bug list ưu tiên P0/P1. | 🟣 T.Khôi + 🟢 Minh | 🔴 Bắt buộc |
| Performance & Polish | Tối ưu tốc độ tải trang (lazy loading, image compression). Responsive mobile hoàn chỉnh. | 🔵 Đạt | 🟡 Quan trọng |
| Bug Fix Round 2 | Fix tất cả bug P0/P1. Kiểm tra cross-browser (Chrome, Safari mobile). | 🔵 Đạt + 🔴 M.Khôi | 🔴 Bắt buộc |
| Demo Scenario & Seeding | Viết kịch bản demo: Nông dân đăng bán bằng giọng nói → Người mua đặt → Gom đơn → Thông báo Telegram. Seed data thực tế. | 🟢 Minh (Leader) | 🔴 Bắt buộc |
| Deploy Production | Deploy lên server/cloud. Config domain, HTTPS, env production. Backup plan nếu demo offline. | 🔵 Đạt | 🔴 Bắt buộc |

## **6. KẾT LUẬN**

**Cạp Nông** không chỉ dừng lại ở việc bán hàng, mà là giải pháp **"liên kết số"** thực chất. Bằng cách lấy nông dân làm trọng tâm và AI làm đòn bẩy, dự án tự tin sẽ tạo ra tác động thay đổi tích cực cho bộ mặt nông sản địa phương, đáp ứng hoàn hảo các tiêu chí kỹ thuật và xã hội mà cuộc thi đề ra.

Nghiệp vụ Baseline

1. **Phân quyền**

| **Role** | **Hiển thị** | **Mô tả & Quyền hạn cốt lõi** |
| --- | --- | --- |
| **BUYER** | Người mua | Duyệt catalog, giỏ hàng, đặt hàng (có/không tài khoản), theo dõi đơn, đánh giá sản phẩm đã mua. |
| **FARMER** | Nông dân | Kế thừa BUYER. Thêm: tạo/quản lý gian hàng, đăng sản phẩm (voice/form), dùng AI tools, quản lý đơn bán, toggle chế độ Bán/Mua. **Không có tính năng Cooperative.** |
| **HTX\_MEMBER** | TV HTX | Kế thừa FARMER. Thêm: xem và tham gia đợt gom đơn (Bundle) do HTX\_MANAGER tạo, xem phân chia doanh thu. |
| **HTX\_MANAGER** | Quản lý HTX | Kế thừa HTX\_MEMBER. Thêm: tạo/quản lý HTX\_SHOP và Bundle gom đơn, duyệt/từ chối thành viên HTX, config mùa vụ cho vùng của mình, xác nhận khi Bundle đủ sản lượng. |
| **ADMIN** | Quản trị viên | *Seed thẳng DB (không có flow đăng ký)*. Duyệt/từ chối HTX mới, quản lý user (ban/unban), config mùa vụ toàn quốc. UI riêng tại /admin. |

| **⚠️ Lưu ý về chế độ Bán/Mua (FARMER/HTX\_MEMBER/HTX\_MANAGER):** |
| --- |
| • Sell Mode: Hiện shop dashboard, quản lý sản phẩm, đơn hàng, bundle. Ẩn giỏ hàng. |
| • Buy Mode: Giỏ hàng, catalog, lịch sử đơn mua hoạt động bình thường. |
| • Toggle lưu trong localStorage (client-side, không ảnh hưởng JWT/role trên server). |
| • Cùng 1 JWT token — **backend không phân biệt mode, chỉ phân biệt role**. |

1. **Luồng nghiệp vụ chi tiết:**
   1. **Xác thực & Quản lý tài khoản**

### **Đăng ký / Đăng nhập**

### Đăng ký: Nhập họ tên, SĐT, mật khẩu, chọn role (FARMER hoặc BUYER). Không thể tự chọn HTX\_MANAGER khi đăng ký.

### Đăng nhập bằng SĐT + mật khẩu → nhận JWT (access token 1h + refresh token 7 ngày).

### Cập nhật thông tin cá nhân: họ tên, email, avatar.

* **Guest Checkout (Không cần tài khoản)**
  + Buyer cung cấp: Họ tên + SĐT + địa chỉ giao hàng → Gửi mã OTP xác nhận SĐT và đơn hàng → đặt hàng bình thường.
  + Đơn hàng lưu với trường guest\_phone.
  + Merge data: Khi SĐT đó đăng ký tài khoản, system tự động link toàn bộ đơn guest vào account mới trong cùng 1 transaction.

## **Gian hàng & HTX**

### **Tạo gian hàng (FARMER)**

### FARMER sau khi đăng ký có thể tạo 1 gian hàng (1 account = 1 shop).

### Thông tin bắt buộc: Tên vườn, slug (URL định danh duy nhất, ví dụ /shop/vuon-xoai-bac-ba), địa chỉ.

### Thông tin tùy chọn: Bio/câu chuyện người trồng, số năm kinh nghiệm, diện tích vườn (m²), ảnh đại diện, ảnh bìa.

### Sau khi tạo, shop\_slug xuất hiện trong JWT payload của user.

### **Tạo & Xét duyệt HTX (Chính thức — L2 Verify)**

* + Bước 1: FARMER tạo HTX: Điền tên HTX, mã HTX (8–12 số), tỉnh/xã, mô tả, upload ảnh quyết định thành lập (optional). Trạng thái: PENDING.
  + Bước 2: ADMIN xét duyệt thủ công: ADMIN xem thông tin HTX trong /admin/htx-requests, tra cứu mã HTX, chọn APPROVE hoặc REJECT kèm ghi chú.
  + Bước 3: Kết quả: Nếu APPROVED → người tạo thành HTX\_MANAGER, status HTX = ACTIVE. Nếu REJECTED → notify user kèm lý do.

### **Gia nhập HTX (FARMER → HTX\_MEMBER)**

* + FARMER gửi yêu cầu gia nhập HTX (status ACTIVE). 1 farmer chỉ thuộc 1 HTX tại 1 thời điểm.
  + HTX\_MANAGER duyệt/từ chối trong dashboard. Khi approve → role FARMER tự động upgrade thành HTX\_MEMBER.
* **Rời/Xóa thành viên khỏi HTX**
  + Cho phép HTX\_MEMBER rời HTX hoặc HTX\_MANAGER xóa HTX\_MEMBER, với điều kiện không có pledge trong Bundle OPEN hoặc CONFIRMED. HTX\_MEMBER sau đó sẽ quay về làm FARMER.
  + Nếu đang có pledge trong Bundle, cần phải rút ra trước khi rời.

## **Quản lý sản phẩm**

### **Đăng sản phẩm (2 phương thức)**

* + Form thủ công: Điền đầy đủ các trường sản phẩm.
  + Voice-to-Product (tính năng AI): Nhấn nút micro → Web Speech API ghi âm real-time → transcript text → gửi lên Python AI Service → LLM (Claude API) extract các trường (tên SP, giá, đơn vị, sản lượng, ngày thu hoạch) → trả về JSON → auto-fill vào form. Nếu confidence < 0.7 thì highlight vàng field đó để nông dân xác nhận lại.
* **Thông tin sản phẩm**
  + Bắt buộc: Tên, danh mục (FRUIT/VEGETABLE/GRAIN/TUBER/HERB/OTHER) (trên giao diện sẽ được Việt hóa, còn ở DB sẽ ghi tiếng Anh để dễ lưu trữ), đơn vị (KG/TON/BOX/BUNCH/PIECE) (Quản lí đơn vị kèm tên tiếng Việt, kí hiệu, quy đổi), giá/đơn vị, sản lượng hiện có.

![](data:image/png;base64...)

* + Truy xuất nguồn gốc **(bắt buộc)**: Địa điểm canh tác cụ thể, phương thức canh tác (TRADITIONAL/ORGANIC/VIETGAP/GLOBALGAP), cờ "Không dùng thuốc".
  + Thông tin mùa vụ: Ngày thu hoạch dự kiến (harvest\_date), ngày bắt đầu bán (available\_from). System tự tính status dựa theo seasonal\_config.
  + Ảnh sản phẩm: Tối đa 10 ảnh, lưu Cloudinary.

### **Trạng thái sản phẩm (auto-cập nhật theo ngày)**

| **Status** | **Badge hiển thị** | **Điều kiện** |
| --- | --- | --- |
| **IN\_SEASON** | 🟢 Đang mùa | Ngày hiện tại nằm trong seasonal\_config của tỉnh + danh mục |
| **UPCOMING** | 🟡 Sắp thu hoạch | available\_from trong tương lai (< 30 ngày), hoặc trước mùa theo config |
| **OFF\_SEASON** | ⚪ Ngoài mùa | Ngoài khoảng seasonal\_config, không có harvest\_date tương lai |
| **OUT\_OF\_STOCK** | 🔴 Hết hàng | available\_quantity = 0 sau khi có đơn |
| **HIDDEN** | (Ẩn) | Nông dân ẩn thủ công hoặc soft-delete |

### **AI Input Refiner**

* + Nông dân nhập mô tả thô (sai chính tả, từ địa phương, viết tắt).
  + Gọi AI Service → trả về mô tả chuẩn + summary "những gì đã sửa".
  + Nông dân xem preview và xác nhận trước khi áp dụng, không tự động replace.

### **Tìm kiếm & Lọc (Public)**

* + Tìm theo tên sản phẩm (full-text search, có hỗ trợ tiếng Việt).
  + Filter: danh mục, tỉnh, huyện, trạng thái mùa vụ, phương thức canh tác, khoảng giá.
  + Sort: giá tăng/giảm, mới nhất, bán chạy nhất (theo số đơn hoàn thành).

## **AI Marketing Lab**

### **AI Caption Generator**

* + Input: Tên SP + mô tả + tỉnh + phong cách (FUNNY / RUSTIC / PROFESSIONAL).
  + Output: 3 phiên bản caption kèm danh sách hashtag gợi ý. Nông dân chọn 1 để copy dùng trên Facebook/Zalo.

### **AI Poster Generator (Gemini Flash)**

* + Bước 1: Nông dân upload ảnh sản phẩm thô (ảnh trái cây, rau củ...).
  + Bước 2: AI remove background (Clipdrop API).
  + Bước 3: Gemini Flash generate nội dung poster (tên SP, giá, tagline ngắn, thông tin vườn).
  + Bước 4: Gemini trả về Content (Text).
  + Bước 5: React.js (Frontend) map text đó vào một component <div> thẻ Poster có giao diện cực đẹp.
  + Bước 6: Dùng thư viện html2canvas hoặc dom-to-image (chạy trực tiếp trên trình duyệt của Nông dân) để chụp cái <div> đó thành file .PNG.
  + Bước 7: Upload file .PNG đó thẳng lên Cloudinary từ Frontend. -> **Lợi ích:** Server nhàn tênh, phản hồi cực nhanh, không lo hết RAM khi deploy lên Render/Vercel
  + Output: Poster bắt mắt có hình sản phẩm, tên, giá, logo vườn — dùng để đăng lên mạng xã hội hoặc làm ảnh sản phẩm.

| ⚠️ Lưu ý kỹ thuật Poster Generator: |
| --- |
| • Cần ít nhất 3 HTML template thiết kế sẵn để nông dân chọn style. |
| • Xử lý async: khi submit → trả về job\_id → FE polling hoặc WebSocket khi done. |

* 1. **Giỏ hàng & Đặt hàng**

### **Giỏ hàng**

* + Buyer (có hoặc không tài khoản) thêm sản phẩm từ nhiều gian hàng vào 1 giỏ chung.
  + Giỏ hàng persisted trong session (guest) hoặc gắn với account (logged-in).
  + Hiển thị tổng tiền và số lượng nhà vườn khác nhau trong giỏ.
* **Checkout & Thanh toán**
  + Điền địa chỉ giao hàng (có tài khoản: có thể lưu địa chỉ mặc định, có thể chọn giữa nhiều địa chỉ đã lưu).
  + Chọn phương thức: COD (thanh toán khi nhận) hoặc VietQR (mock — hiển thị QR, chờ xác nhận thủ công).
  + Hệ thống tự động tách 1 Order thành nhiều Sub-Order theo từng shop.
  + Mỗi Sub-Order có lifecycle độc lập: PENDING → CONFIRMED → PREPARING → SHIPPED → DELIVERED / CANCELLED.
  + Hệ thống áp dụng Phí vận chuyển đồng giá (Flat rate - ví dụ 30k/đơn) để tập trung vào luồng E-commerce cốt lõi.

### **Quản lý đơn hàng**

* + Farmer: Nhận thông báo đơn mới, xác nhận, cập nhật trạng thái từng sub-order.
  + Buyer: Xem toàn bộ order theo trạng thái, không GPS tracking — chỉ update thủ công bởi seller.
  + Guest: Xem đơn qua SĐT + mã đơn hàng (không cần đăng nhập).
  + Cho phép hủy đơn:
    - **BUYER:** Chỉ được phép ấn nút "Hủy đơn" khi status là PENDING.
    - **FARMER/HTX\_MANAGER:** Được phép hủy đơn trước khi status chuyển sang SHIPPED. Bắt buộc chọn/nhập lý do hủy (Hết hàng, Sai giá, Thiên tai...).

## **Đánh giá sản phẩm**

* Chỉ BUYER đã có Sub-Order với status = DELIVERED mới được review sản phẩm tương ứng.
* Nội dung review: Rating 1–5 sao (bắt buộc) + comment tối thiểu 10 ký tự (bắt buộc) + ảnh tối đa 5 (tuỳ chọn, lưu Cloudinary).
* Mỗi order\_item chỉ được review 1 lần.
* Điểm trung bình hiển thị trên card sản phẩm và trang chi tiết.
* Farmer có thể phản hồi review (1 lần, hiển thị công khai).

## **Digital Cooperative — Gom đơn (Model: B2C Aggregate, Supply-side)**

| **Tóm tắt model:** |
| --- |
| • HTX\_MANAGER tạo ra một Gian hàng của Hợp tác xã (HTX\_SHOP) dành riêng cho đơn sỉ/Bundle. Nông dân (HTX\_MEMBER) đẩy số lượng (pledge quantity) vào HTX\_SHOP. |
| • Khách hàng (Buyer sỉ) vào HTX\_SHOP mua một cục lớn. |
| • Hệ thống sẽ tự động điều phối: "Đơn 500kg này sẽ lấy 200kg nhà A, 300kg nhà B". |
| • Không triển khai góp vốn trong MVP (để hướng mở rộng v2). |
| Nói tóm lại:  **Retail**: Farmer tự bán qua shop của mình → doanh thu 100% của farmer đó  **Wholesale**: HTX\_MANAGER tạo HTX\_SHOP riêng → farmers pledge sản lượng → buyer mua từ HTX\_SHOP → system dispatch từ pledges |

### **Luồng tạo & quản lý Bundle**

* + HTX\_MANAGER tạo Bundle trong HTX\_SHOP: chọn loại nông sản, tên, tỉnh/huyện, sản lượng mục tiêu (kg), giá/kg, deadline gom.
  + HTX\_MEMBER nhận thông báo Bundle mới trong khu vực. Đăng ký tham gia với số kg đóng góp.
  + Dashboard Bundle hiển thị thanh tiến độ: "Đã gom X / Y kg, cần thêm Z kg".
  + HTX\_MANAGER theo dõi danh sách farmer tham gia, có thể cancel Bundle trước deadline.

### **Luồng fulfill từ Bundle**

* + Buyer muốn mua sỉ sẽ vào HTX\_SHOP, đặt hàng sản phẩm trong Bundle.
  + Tại trang chi tiết sản phẩm của HTX\_SHOP, UI phải hiển thị rõ thông báo cho Buyer sỉ: "Đơn hàng sẽ bắt đầu được giao sau ngày [Deadline gom đơn]".

### **Xác nhận Bundle & Phân chia doanh thu**

* + Khi tổng sản lượng đạt ngưỡng HOẶC deadline đến → HTX\_MANAGER bấm Confirm Bundle.
  + System tự động tính: contribution\_percent = quantity\_kg của mỗi farmer / tổng sản lượng bundle.
  + estimated\_revenue = tổng doanh thu bundle × contribution\_percent.
  + Notify tất cả HTX\_MEMBER tham gia qua in-app + Telegram (nếu đã đăng ký): "Bundle #X đã gom đủ, doanh thu dự kiến của bạn: X đồng".
  + Sub-order của buyer chuyển sang PREPARING → flow tiếp tục bình thường.
  + Bundle không đạt ngưỡng khi deadline: status → EXPIRED → toàn bộ pledges bị giải phóng, không ảnh hưởng đơn lẻ vì 2 luồng đã tách rời.

### **Người mua sỉ (Wholesale)**

* + Không có role WHOLESALER riêng trong MVP.
  + Trong v2: có thể cân nhắc thêm tính năng "Đăng nhu cầu mua" cho buyer sỉ.

## **Cấu hình mùa vụ (Seasonal Config)**

* Bảng seasonal\_config: (province, product\_category, start\_month, end\_month).
* HTX\_MANAGER config cho tỉnh/danh mục của vùng mình.
* ADMIN config toàn quốc, có thể override config của HTX\_MANAGER.
* Cron job chạy hàng ngày (hoặc khi có đơn) để cập nhật lại status của tất cả sản phẩm theo config.
  1. **Thông báo**

| **Sự kiện** | **Nhận thông báo** | **Kênh** |
| --- | --- | --- |
| Có đơn hàng mới | FARMER/HTX\_MEMBER | In-app + Telegram (nếu đăng ký) |
| Trạng thái đơn thay đổi | BUYER | In-app |
| Bundle đạt ngưỡng / confirm | HTX\_MEMBER trong bundle | In-app + Telegram |
| Yêu cầu gia nhập HTX mới | HTX\_MANAGER | In-app |
| HTX được duyệt / từ chối | FARMER tạo HTX | In-app |
| Review mới cho sản phẩm | FARMER (chủ sản phẩm) | In-app |

Usecase & Role Matrix

| **B = BUYER** | **F = FARMER** | **M = HTX\_MEMBER** | **HM = HTX\_MANAGER** | **A = ADMIN** |
| --- | --- | --- | --- | --- |

| **#** | **Use Case** | **B** | **F** | **M** | **HM** | **A** | **Priority** |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **AUTH & TÀI KHOẢN** | | | | | | | |
| 01 | Đăng ký tài khoản (FARMER/BUYER) | **✅** | **✅** | **✅** | **✅** | — | **MVP** |
| 02 | Đăng nhập / Đăng xuất | **✅** | **✅** | **✅** | **✅** | **✅** | **MVP** |
| 03 | Cập nhật thông tin cá nhân | **✅** | **✅** | **✅** | **✅** | **✅** | **MVP** |
| 04 | Toggle chế độ Bán/Mua (Sell/Buy mode) | — | **✅** | **✅** | **✅** | — | **MVP** |
| **GIAN HÀNG & HTX** | | | | | | | |
| 05 | Tạo & chỉnh sửa gian hàng (profile vườn) | — | **✅** | **✅** | **✅** | — | **MVP** |
| 06 | Xem trang gian hàng công khai | **✅** | **✅** | **✅** | **✅** | **✅** | **MVP** |
| 07 | Tạo HTX mới (khai báo chính thức) | — | **✅** | — | — | — | **MVP** |
| 08 | Xin gia nhập HTX | — | **✅** | — | — | — | **MVP** |
| 09 | Duyệt / Từ chối thành viên HTX | — | — | — | **✅** | — | **MVP** |
| 10 | ADMIN duyệt / Từ chối HTX mới | — | — | — | — | **✅** | **MVP** |
| **SẢN PHẨM** | | | | | | | |
| 11 | Đăng sản phẩm bằng Form thủ công | — | **✅** | **✅** | **✅** | — | **MVP** |
| 12 | Đăng sản phẩm bằng Voice-to-Product (AI) | — | **✅** | **✅** | **✅** | — | **MVP** |
| 13 | Chỉnh sửa / Ẩn / Xóa sản phẩm | — | **✅** | **✅** | **✅** | — | **MVP** |
| 14 | Chuẩn hóa mô tả bằng AI Input Refiner | — | **✅** | **✅** | **✅** | — | **MVP** |
| 15 | Xem danh sách catalog (có filter & search) | **✅** | **✅** | **✅** | **✅** | **✅** | **MVP** |
| 16 | Xem chi tiết sản phẩm + truy xuất nguồn gốc | **✅** | **✅** | **✅** | **✅** | **✅** | **MVP** |
| **AI MARKETING LAB** | | | | | | | |
| 17 | Tạo caption marketing (3 phong cách) | — | **✅** | **✅** | **✅** | — | **MVP** |
| 18 | Tạo poster quảng cáo (AI + Puppeteer) | — | **✅** | **✅** | **✅** | — | **MVP** |
| **GIỎ HÀNG & ĐẶT HÀNG** | | | | | | | |
| 19 | Thêm / Sửa / Xóa sản phẩm trong giỏ | **✅** | **✅** | **✅** | **✅** | — | **MVP** |
| 20 | Đặt hàng có tài khoản (COD / VietQR) | **✅** | **✅** | **✅** | **✅** | — | **MVP** |
| 21 | Guest checkout (chỉ SĐT + địa chỉ) | **✅** | — | — | — | — | **MVP** |
| 22 | Merge lịch sử đơn guest khi đăng ký tài khoản | **✅** | — | — | — | — | **MVP** |
| 23 | Theo dõi trạng thái đơn hàng (buyer) | **✅** | **✅** | **✅** | **✅** | — | **MVP** |
| 24 | Xem & xác nhận đơn hàng mới (seller) | — | **✅** | **✅** | **✅** | — | **MVP** |
| 25 | Cập nhật trạng thái sub-order (seller) | — | **✅** | **✅** | **✅** | — | **MVP** |
| 26 | Xem lịch sử đơn hàng & doanh thu | **✅** | **✅** | **✅** | **✅** | — | **MVP** |
| **ĐÁNH GIÁ** | | | | | | | |
| 27 | Tạo đánh giá sản phẩm (sau khi nhận hàng) | **✅** | — | — | — | — | **NICE** |
| 28 | Phản hồi đánh giá (seller reply) | — | **✅** | **✅** | **✅** | — | **NICE** |
| **DIGITAL COOPERATIVE (GOM ĐƠN)** | | | | | | | |
| 29 | Tạo Bundle gom đơn mới | — | — | — | **✅** | — | **MVP** |
| 30 | Xem danh sách Bundle khu vực | — | — | **✅** | **✅** | — | **MVP** |
| 31 | Đăng ký tham gia Bundle (khai báo sản lượng) | — | — | **✅** | **✅** | — | **MVP** |
| 32 | Xem tiến độ Bundle (thanh %) | — | — | **✅** | **✅** | — | **MVP** |
| 33 | Hủy tham gia Bundle (trước deadline) | — | — | **✅** | — | — | **NICE** |
| 34 | Confirm Bundle (khi đủ sản lượng) | — | — | — | **✅** | — | **MVP** |
| 35 | Xem phân chia doanh thu | — | — | **✅** | **✅** | — | **MVP** |
| **SEASONAL CONFIG** | | | | | | | |
| 36 | Config mùa vụ theo tỉnh/danh mục (vùng HTX) | — | — | — | **✅** | — | **MVP** |
| 37 | Config mùa vụ toàn quốc | — | — | — | — | **✅** | **MVP** |
| **THÔNG BÁO** | | | | | | | |
| 38 | Nhận & đọc thông báo in-app | **✅** | **✅** | **✅** | **✅** | — | **MVP** |
| 39 | Đăng ký / Hủy nhận thông báo Telegram | — | **✅** | **✅** | **✅** | — | **MVP** |
| **ADMIN** | | | | | | | |
| 40 | Xem & duyệt HTX đang pending | — | — | — | — | **✅** | **MVP** |
| 41 | Tìm kiếm & ban/unban user | — | — | — | — | **✅** | **MVP** |
| 42 | Config mùa vụ toàn quốc (duplicate UC-37) | — | — | — | — | **✅** | **MVP** |

API Contract

openapi: 3.0.3

info:

title: "Cap Nong API"

description: |

API Contract v1.1 - Updated with business logic fixes:

- HTX\_SHOP model for Cooperative (separate retail / wholesale flows)

- HTX Lifecycle (Leave / Remove member with pledge cleanup rules)

- Inventory lock at Checkout (race condition prevention)

- Order Cancellation full flow

- Guest OTP verification (anti-spam)

- AI Poster returns content JSON (client-side render via html2canvas)

- Unit management with Vietnamese localization and conversion

## Roles

- PUBLIC: No auth required

- BUYER: Buyer

- FARMER: Farmer, inherits BUYER

- HTX\_MEMBER: HTX member, inherits FARMER

- HTX\_MANAGER: HTX manager, inherits HTX\_MEMBER

- ADMIN: System admin (seeded in DB)

## Base URLs

- Spring Boot (main): http://localhost:8080/api/v1

- Python AI Service: http://localhost:8000/api/v1

## Cooperative Model (Fixed)

Retail (Farmer sells own products) and Wholesale (HTX\_SHOP Bundle) are fully separated.

HTX\_MANAGER creates HTX\_SHOP -> Members pledge quantity -> Buyer orders from HTX\_SHOP ->

System dispatches from pledges -> Revenue distributed by contribution %.

version: "1.1.0"

servers:

- url: http://localhost:8080/api/v1

description: Spring Boot - Development

- url: https://api.capnong.vn/v1

description: Spring Boot - Production

- url: http://localhost:8000/api/v1

description: Python AI Service - Development

tags:

- name: auth

- name: users

- name: units

- name: shops

- name: htx

- name: htx-shop

- name: products

- name: cart

- name: orders

- name: reviews

- name: cooperative

- name: ai

- name: notifications

- name: admin

components:

securitySchemes:

BearerAuth:

type: http

scheme: bearer

bearerFormat: JWT

schemas:

# ─── AUTH ───────────────────────────────────────────────

RegisterRequest:

type: object

required: [full\_name, phone, password, role]

properties:

full\_name: { type: string, example: "Nguyen Van An" }

phone: { type: string, pattern: '^(0|\+84)[3-9]\d{8}$', example: "0912345678" }

email: { type: string, format: email }

password: { type: string, minLength: 6 }

role: { type: string, enum: [FARMER, BUYER] }

LoginRequest:

type: object

required: [phone, password]

properties:

phone: { type: string }

password: { type: string }

AuthResponse:

type: object

properties:

access\_token: { type: string }

refresh\_token: { type: string }

expires\_in: { type: integer, example: 3600 }

user: { $ref: '#/components/schemas/UserSummary' }

GuestOtpRequest:

type: object

required: [phone]

description: "Send OTP to guest phone before checkout. Rate limit: 3/phone/hour."

properties:

phone: { type: string, pattern: '^(0|\+84)[3-9]\d{8}$' }

GuestOtpVerifyRequest:

type: object

required: [phone, otp\_code]

properties:

phone: { type: string }

otp\_code: { type: string, minLength: 6, maxLength: 6 }

GuestOtpVerifyResponse:

type: object

properties:

guest\_token:

type: string

description: "Short-lived token (30 min) for guest checkout. Pass as X-Guest-Token header."

phone: { type: string }

expires\_in: { type: integer, example: 1800 }

# ─── USER ────────────────────────────────────────────────

UserSummary:

type: object

properties:

id: { type: string, format: uuid }

full\_name: { type: string }

phone: { type: string }

role: { type: string, enum: [BUYER, FARMER, HTX\_MEMBER, HTX\_MANAGER, ADMIN] }

avatar\_url: { type: string, nullable: true }

shop\_slug: { type: string, nullable: true }

UserProfile:

allOf:

- $ref: '#/components/schemas/UserSummary'

- type: object

properties:

email: { type: string, nullable: true }

created\_at: { type: string, format: date-time }

htx\_id: { type: string, format: uuid, nullable: true }

htx\_name: { type: string, nullable: true }

is\_banned: { type: boolean, default: false }

# ─── UNITS ───────────────────────────────────────────────

UnitResponse:

type: object

description: |

Seed data (read-only). Examples:

KG: kg, factor=1; YEN: yen, base=KG, factor=10;

TA: ta, base=KG, factor=100; TAN: tan, base=KG, factor=1000;

LANG: lang, base=KG, factor=0.1

properties:

code: { type: string, example: KG }

display\_name: { type: string, example: "Kilogram" }

symbol: { type: string, example: kg }

base\_unit: { type: string, example: KG }

conversion\_factor:

type: number

format: double

description: "1 unit = conversion\_factor \* base\_unit. E.g. 1 ta = 100 kg"

example: 1.0

category: { type: string, enum: [WEIGHT, VOLUME, COUNT, PACKAGING] }

aliases:

type: array

description: "Alternative names used in Voice extract (e.g. [ky, ki, kilogam])"

items: { type: string }

# ─── SHOP ────────────────────────────────────────────────

ShopCreateRequest:

type: object

required: [name, slug, province, district]

properties:

name: { type: string }

slug: { type: string, pattern: '^[a-z0-9-]+$' }

province: { type: string }

district: { type: string }

bio: { type: string }

years\_experience: { type: integer }

farm\_area\_m2: { type: integer }

avatar\_url: { type: string }

cover\_url: { type: string }

ShopResponse:

type: object

properties:

id: { type: string, format: uuid }

slug: { type: string }

name: { type: string }

province: { type: string }

district: { type: string }

bio: { type: string }

years\_experience: { type: integer }

farm\_area\_m2: { type: integer }

avatar\_url: { type: string }

cover\_url: { type: string }

owner: { $ref: '#/components/schemas/UserSummary' }

htx: { $ref: '#/components/schemas/HtxSummary', nullable: true }

average\_rating: { type: number, format: float }

total\_reviews: { type: integer }

created\_at: { type: string, format: date-time }

# ─── HTX ─────────────────────────────────────────────────

HtxSummary:

type: object

properties:

id: { type: string, format: uuid }

name: { type: string }

province: { type: string }

status: { type: string, enum: [PENDING, ACTIVE, SUSPENDED, REJECTED] }

total\_members: { type: integer }

HtxCreateRequest:

type: object

required: [name, official\_code, province, district]

properties:

name: { type: string }

official\_code: { type: string, pattern: '^\d{8,12}$', description: "Official HTX code (8-12 digits)" }

province: { type: string }

district: { type: string }

description: { type: string }

document\_url: { type: string, nullable: true, description: "Photo of establishment decision (optional)" }

HtxResponse:

allOf:

- $ref: '#/components/schemas/HtxSummary'

- type: object

properties:

official\_code: { type: string }

district: { type: string }

description: { type: string }

document\_url: { type: string, nullable: true }

manager: { $ref: '#/components/schemas/UserSummary' }

htx\_shop\_slug: { type: string, nullable: true, description: "Auto-created when ADMIN approves HTX" }

created\_at: { type: string, format: date-time }

ProcessJoinRequest:

type: object

required: [action]

properties:

action: { type: string, enum: [APPROVE, REJECT] }

note: { type: string }

RemoveMemberRequest:

type: object

required: [reason]

properties:

reason: { type: string, minLength: 10, description: "Required - will be sent to member as notification" }

LeaveHtxRequest:

type: object

properties:

reason: { type: string }

# ─── HTX\_SHOP ────────────────────────────────────────────

HtxShopResponse:

type: object

description: |

HTX's dedicated shop for wholesale/Bundle orders.

Auto-created when ADMIN approves HTX. Slug = htx-{official\_code}.

Completely separate from individual farmer shops.

properties:

id: { type: string, format: uuid }

slug: { type: string, example: "htx-01234567" }

name: { type: string }

htx: { $ref: '#/components/schemas/HtxSummary' }

province: { type: string }

district: { type: string }

description: { type: string }

avatar\_url: { type: string }

active\_bundles\_count: { type: integer }

created\_at: { type: string, format: date-time }

# ─── PRODUCT ─────────────────────────────────────────────

ProductCreateRequest:

type: object

required: [name, category, unit\_code, price\_per\_unit, available\_quantity]

properties:

name: { type: string }

description: { type: string }

category: { type: string, enum: [FRUIT, VEGETABLE, GRAIN, TUBER, HERB, OTHER] }

unit\_code: { type: string, description: "Unit code from /units endpoint", example: KG }

price\_per\_unit: { type: number, format: double }

available\_quantity: { type: number, format: double }

harvest\_date: { type: string, format: date }

available\_from: { type: string, format: date }

farming\_method: { type: string, enum: [TRADITIONAL, ORGANIC, VIETGAP, GLOBALGAP] }

pesticide\_free: { type: boolean, default: false }

location\_detail: { type: string }

images: { type: array, items: { type: string, format: uri }, maxItems: 10 }

ProductResponse:

type: object

properties:

id: { type: string, format: uuid }

name: { type: string }

description: { type: string }

category: { type: string }

unit: { $ref: '#/components/schemas/UnitResponse' }

price\_per\_unit: { type: number }

available\_quantity: { type: number }

harvest\_date: { type: string, format: date, nullable: true }

available\_from: { type: string, format: date, nullable: true }

farming\_method: { type: string }

pesticide\_free: { type: boolean }

location\_detail: { type: string }

status: { type: string, enum: [IN\_SEASON, UPCOMING, OFF\_SEASON, OUT\_OF\_STOCK, HIDDEN] }

images: { type: array, items: { type: string } }

average\_rating: { type: number, format: float, nullable: true }

total\_reviews: { type: integer }

shop: { $ref: '#/components/schemas/ShopResponse' }

created\_at: { type: string, format: date-time }

ProductListResponse:

type: object

properties:

data: { type: array, items: { $ref: '#/components/schemas/ProductResponse' } }

pagination: { $ref: '#/components/schemas/Pagination' }

# ─── CART ────────────────────────────────────────────────

CartItemRequest:

type: object

required: [product\_id, quantity]

properties:

product\_id: { type: string, format: uuid }

quantity: { type: number, minimum: 0.1 }

CartResponse:

type: object

properties:

id: { type: string, format: uuid }

items: { type: array, items: { $ref: '#/components/schemas/CartItem' } }

total\_price: { type: number }

total\_shops: { type: integer }

CartItem:

type: object

properties:

id: { type: string, format: uuid }

product: { $ref: '#/components/schemas/ProductResponse' }

quantity: { type: number }

subtotal: { type: number }

# ─── ORDER ───────────────────────────────────────────────

CheckoutRequest:

type: object

required: [shipping\_address, payment\_method]

description: |

Backend performs SELECT FOR UPDATE on each product at checkout.

If any item is insufficient -> 409 INVENTORY\_INSUFFICIENT with conflict list.

If all OK -> deduct quantity + create Order + SubOrders in one transaction.

properties:

shipping\_address: { $ref: '#/components/schemas/Address' }

payment\_method: { type: string, enum: [COD, VIET\_QR] }

note: { type: string }

guest\_token:

type: string

nullable: true

description: "Required for guest checkout (no Bearer token). From /auth/guest/otp/verify."

Address:

type: object

required: [full\_name, phone, street, district, province]

properties:

full\_name: { type: string }

phone: { type: string }

street: { type: string }

district: { type: string }

province: { type: string }

OrderResponse:

type: object

properties:

id: { type: string, format: uuid }

order\_code: { type: string, example: "CN-20260401-0001" }

buyer: { $ref: '#/components/schemas/UserSummary', nullable: true }

guest\_phone: { type: string, nullable: true }

sub\_orders: { type: array, items: { $ref: '#/components/schemas/SubOrder' } }

shipping\_address: { $ref: '#/components/schemas/Address' }

payment\_method: { type: string }

payment\_status: { type: string, enum: [PENDING, PAID, FAILED] }

total\_price: { type: number }

created\_at: { type: string, format: date-time }

SubOrder:

type: object

properties:

id: { type: string, format: uuid }

shop: { $ref: '#/components/schemas/ShopResponse' }

items: { type: array, items: { $ref: '#/components/schemas/CartItem' } }

subtotal: { type: number }

status: { type: string, enum: [PENDING, CONFIRMED, PREPARING, SHIPPED, DELIVERED, CANCELLED] }

cancel\_reason: { type: string, nullable: true }

cancelled\_by: { type: string, enum: [BUYER, SELLER, SYSTEM], nullable: true }

UpdateSubOrderStatusRequest:

type: object

required: [status]

description: |

Valid transitions: PENDING->CONFIRMED->PREPARING->SHIPPED->DELIVERED

Cancellable by seller: PENDING->CANCELLED, CONFIRMED->CANCELLED

cancel\_reason is required when status=CANCELLED (seller cancel).

On cancel: available\_quantity restored, buyer notified with reason.

properties:

status: { type: string, enum: [CONFIRMED, PREPARING, SHIPPED, DELIVERED, CANCELLED] }

cancel\_reason: { type: string, description: "Required when status=CANCELLED" }

InventoryConflictError:

type: object

properties:

code: { type: string, example: INVENTORY\_INSUFFICIENT }

message: { type: string }

conflicts:

type: array

items:

type: object

properties:

product\_id: { type: string, format: uuid }

product\_name: { type: string }

requested\_quantity: { type: number }

available\_quantity: { type: number }

# ─── REVIEW ──────────────────────────────────────────────

ReviewCreateRequest:

type: object

required: [product\_id, order\_item\_id, rating, comment]

properties:

product\_id: { type: string, format: uuid }

order\_item\_id: { type: string, format: uuid, description: "Verify DELIVERED status" }

rating: { type: integer, minimum: 1, maximum: 5 }

comment: { type: string, minLength: 10 }

images: { type: array, items: { type: string, format: uri }, maxItems: 5 }

ReviewResponse:

type: object

properties:

id: { type: string, format: uuid }

author: { $ref: '#/components/schemas/UserSummary' }

product\_id: { type: string, format: uuid }

rating: { type: integer }

comment: { type: string }

images: { type: array, items: { type: string } }

seller\_reply: { type: string, nullable: true }

created\_at: { type: string, format: date-time }

# ─── COOPERATIVE ─────────────────────────────────────────

BundleCreateRequest:

type: object

required: [product\_category, product\_name, unit\_code, target\_quantity, price\_per\_unit, deadline]

description: "HTX\_MANAGER creates Bundle under HTX\_SHOP. Retail farmer shop is NOT involved."

properties:

product\_category: { type: string, enum: [FRUIT, VEGETABLE, GRAIN, TUBER, HERB, OTHER] }

product\_name: { type: string }

unit\_code: { type: string, example: KG }

target\_quantity: { type: number, description: "Target in base unit" }

price\_per\_unit: { type: number, description: "Wholesale price from HTX\_SHOP to buyer" }

deadline: { type: string, format: date }

description: { type: string }

min\_pledge\_quantity: { type: number, nullable: true }

BundleResponse:

type: object

properties:

id: { type: string, format: uuid }

htx\_shop: { $ref: '#/components/schemas/HtxShopResponse' }

product\_category: { type: string }

product\_name: { type: string }

unit: { $ref: '#/components/schemas/UnitResponse' }

target\_quantity: { type: number }

current\_pledged\_quantity: { type: number }

current\_sold\_quantity: { type: number, description: "Quantity already ordered by buyers from HTX\_SHOP" }

progress\_percent: { type: number, format: float }

price\_per\_unit: { type: number }

deadline: { type: string, format: date }

status:

type: string

enum: [OPEN, FULL, CONFIRMED, EXPIRED, CANCELLED]

description: |

OPEN: accepting pledges

FULL: pledge target reached, waiting for manager confirm

CONFIRMED: dispatching to fulfill buyer orders

EXPIRED: deadline passed without reaching target - all pledges released

CANCELLED: manually cancelled by manager

pledges: { type: array, items: { $ref: '#/components/schemas/PledgeResponse' } }

created\_at: { type: string, format: date-time }

PledgeRequest:

type: object

required: [quantity]

properties:

quantity: { type: number, minimum: 0.1 }

note: { type: string }

PledgeResponse:

type: object

properties:

id: { type: string, format: uuid }

farmer: { $ref: '#/components/schemas/UserSummary' }

quantity: { type: number }

unit: { $ref: '#/components/schemas/UnitResponse' }

contribution\_percent: { type: number, format: float }

estimated\_revenue:

type: number

nullable: true

description: "Only populated when Bundle is CONFIRMED"

status: { type: string, enum: [ACTIVE, WITHDRAWN, EXPIRED] }

created\_at: { type: string, format: date-time }

WithdrawPledgeRequest:

type: object

description: |

Only allowed when Bundle status = OPEN.

Also called automatically when member Leaves/is Removed from HTX

and has ACTIVE pledges in OPEN Bundles.

properties:

reason: { type: string }

# ─── SEASONAL CONFIG ──────────────────────────────────────

SeasonalConfigRequest:

type: object

required: [province, product\_category, start\_month, end\_month]

properties:

province: { type: string }

product\_category: { type: string, enum: [FRUIT, VEGETABLE, GRAIN, TUBER, HERB, OTHER] }

start\_month: { type: integer, minimum: 1, maximum: 12 }

end\_month: { type: integer, minimum: 1, maximum: 12 }

note: { type: string }

SeasonalConfigResponse:

type: object

properties:

id: { type: string, format: uuid }

province: { type: string }

product\_category: { type: string }

start\_month: { type: integer }

end\_month: { type: integer }

configured\_by: { type: string, enum: [HTX\_MANAGER, ADMIN] }

note: { type: string }

updated\_at: { type: string, format: date-time }

# ─── AI ───────────────────────────────────────────────────

VoiceExtractRequest:

type: object

required: [transcript]

properties:

transcript:

type: string

description: "Raw text from Web Speech API"

example: "toi co nam ta xoai cat chu gia hai muoi lam ngan mot ky thu hoach tuan sau"

VoiceExtractResponse:

type: object

description: |

LLM extracts fields and converts units to base unit using aliases table.

Example: "nam ta" -> quantity=500, unit\_code=KG, raw\_unit\_text="ta"

FE highlights yellow if confidence < 0.7.

properties:

name: { type: string, nullable: true }

description: { type: string, nullable: true }

category: { type: string, nullable: true }

unit\_code: { type: string, description: "Base unit after conversion", example: KG }

raw\_unit\_text: { type: string, description: "Unit as spoken before conversion", example: "ta" }

price\_per\_unit: { type: number, nullable: true }

available\_quantity: { type: number, nullable: true, description: "Converted to base unit" }

harvest\_note: { type: string, nullable: true }

confidence\_scores:

type: object

properties:

name: { type: number }

price\_per\_unit: { type: number }

available\_quantity: { type: number }

unit\_code: { type: number }

category: { type: number }

raw\_transcript: { type: string }

RefineDescriptionRequest:

type: object

required: [raw\_text]

properties:

raw\_text: { type: string }

product\_name: { type: string, nullable: true }

RefineDescriptionResponse:

type: object

properties:

refined\_text: { type: string }

changes\_summary: { type: string }

CaptionRequest:

type: object

required: [product\_name, description, style]

properties:

product\_name: { type: string }

description: { type: string }

province: { type: string, nullable: true }

style: { type: string, enum: [FUNNY, RUSTIC, PROFESSIONAL] }

CaptionResponse:

type: object

properties:

captions:

type: array

items:

type: object

properties:

style: { type: string }

text: { type: string }

hashtags: { type: array, items: { type: string } }

PosterContentRequest:

type: object

required: [product\_name, price\_per\_unit, unit\_code, shop\_name, province]

description: |

AI generates text content only. NO server-side image rendering.

Client-side flow: receive JSON -> render React <PosterTemplate> component

-> html2canvas/dom-to-image -> PNG Blob -> upload to Cloudinary from FE.

properties:

product\_name: { type: string }

price\_per\_unit: { type: number }

unit\_code: { type: string }

available\_quantity: { type: number, nullable: true }

shop\_name: { type: string }

province: { type: string }

farming\_method: { type: string, nullable: true }

pesticide\_free: { type: boolean, default: false }

template\_id:

type: string

enum: [FRESH\_GREEN, WARM\_HARVEST, MINIMAL\_WHITE]

default: FRESH\_GREEN

description: "FE uses this to select the correct React poster component"

bg\_removed\_image\_url: { type: string, format: uri, nullable: true }

PosterContentResponse:

type: object

description: "Text content for FE to render into poster component. No image data."

properties:

template\_id: { type: string }

headline: { type: string, example: "Xoai Cat Chu Dong Thap" }

tagline: { type: string, example: "Hai tay tung trai - Ngot tu vuon den ban" }

price\_display: { type: string, example: "25.000d/kg" }

badge\_texts: { type: array, items: { type: string }, example: ["Khong thuoc", "Hai tay"] }

shop\_display: { type: string }

cta\_text: { type: string }

color\_scheme:

type: object

properties:

primary: { type: string, example: "#2D6A4F" }

accent: { type: string, example: "#F4A261" }

text\_on\_primary: { type: string, example: "#FFFFFF" }

RemoveBgRequest:

type: object

required: [image\_base64]

properties:

image\_base64: { type: string, description: "Base64 encoded image" }

RemoveBgResponse:

type: object

properties:

image\_url: { type: string, format: uri, description: "Cloudinary URL, TTL 1 hour if not attached to product" }

# ─── NOTIFICATION ─────────────────────────────────────────

NotificationResponse:

type: object

properties:

id: { type: string, format: uuid }

type:

type: string

enum: [NEW\_ORDER, ORDER\_STATUS\_UPDATE, ORDER\_CANCELLED, BUNDLE\_FULL,

BUNDLE\_CONFIRMED, BUNDLE\_EXPIRED, BUNDLE\_JOINED, PLEDGE\_WITHDRAWN,

HTX\_JOIN\_REQUEST, HTX\_APPROVED, HTX\_REJECTED, HTX\_MEMBER\_REMOVED,

REVIEW\_NEW, SYSTEM]

title: { type: string }

body: { type: string }

is\_read: { type: boolean }

created\_at: { type: string, format: date-time }

metadata: { type: object }

TelegramRegisterRequest:

type: object

required: [telegram\_chat\_id]

properties:

telegram\_chat\_id: { type: string }

# ─── COMMON ───────────────────────────────────────────────

Pagination:

type: object

properties:

page: { type: integer }

limit: { type: integer }

total: { type: integer }

total\_pages: { type: integer }

ApiError:

type: object

properties:

code: { type: string }

message: { type: string }

timestamp: { type: string, format: date-time }

SuccessMessage:

type: object

properties:

message: { type: string, example: "Success" }

# ══════════════════════════════════════════════════════════════

# PATHS

# ══════════════════════════════════════════════════════════════

paths:

# ── AUTH ──────────────────────────────────────────────────

/auth/register:

post:

tags: [auth]

summary: Register account (FARMER or BUYER only)

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/RegisterRequest' }

responses:

'201':

description: Created

content:

application/json:

schema: { $ref: '#/components/schemas/AuthResponse' }

'409':

description: Phone already exists

content:

application/json:

schema: { $ref: '#/components/schemas/ApiError' }

/auth/login:

post:

tags: [auth]

summary: Login with phone + password

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/LoginRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/AuthResponse' }

'401':

description: Wrong credentials

content:

application/json:

schema: { $ref: '#/components/schemas/ApiError' }

/auth/refresh:

post:

tags: [auth]

summary: Refresh access token

requestBody:

required: true

content:

application/json:

schema:

type: object

required: [refresh\_token]

properties:

refresh\_token: { type: string }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/AuthResponse' }

/auth/logout:

post:

tags: [auth]

summary: Logout (invalidate refresh token)

security:

- BearerAuth: []

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/SuccessMessage' }

/auth/guest/otp/send:

post:

tags: [auth]

summary: Send OTP to guest phone (required before guest checkout)

description: "Rate limit: 3 attempts/phone/hour. OTP valid 5 minutes."

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/GuestOtpRequest' }

responses:

'200':

description: OTP sent

content:

application/json:

schema: { $ref: '#/components/schemas/SuccessMessage' }

'429':

description: Rate limit exceeded

content:

application/json:

schema: { $ref: '#/components/schemas/ApiError' }

/auth/guest/otp/verify:

post:

tags: [auth]

summary: Verify OTP -> receive guest\_token for checkout

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/GuestOtpVerifyRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/GuestOtpVerifyResponse' }

'400':

description: Invalid or expired OTP

content:

application/json:

schema: { $ref: '#/components/schemas/ApiError' }

# ── USERS ─────────────────────────────────────────────────

/users/me:

get:

tags: [users]

summary: Get own profile

security:

- BearerAuth: []

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/UserProfile' }

put:

tags: [users]

summary: Update own profile

security:

- BearerAuth: []

requestBody:

required: true

content:

application/json:

schema:

type: object

properties:

full\_name: { type: string }

email: { type: string }

avatar\_url: { type: string }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/UserProfile' }

# ── UNITS ─────────────────────────────────────────────────

/units:

get:

tags: [units]

summary: List all units (static seed data, FE should cache)

parameters:

- name: category

in: query

schema: { type: string, enum: [WEIGHT, VOLUME, COUNT, PACKAGING] }

responses:

'200':

description: OK

content:

application/json:

schema:

type: array

items: { $ref: '#/components/schemas/UnitResponse' }

/units/{code}:

get:

tags: [units]

summary: Get unit by code

parameters:

- name: code

in: path

required: true

schema: { type: string }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/UnitResponse' }

# ── SHOPS ─────────────────────────────────────────────────

/shops:

post:

tags: [shops]

summary: Create personal shop (FARMER, 1 per account)

security:

- BearerAuth: []

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/ShopCreateRequest' }

responses:

'201':

description: Created

content:

application/json:

schema: { $ref: '#/components/schemas/ShopResponse' }

'409':

description: Slug taken or shop already exists

content:

application/json:

schema: { $ref: '#/components/schemas/ApiError' }

/shops/{slug}:

get:

tags: [shops]

summary: View public shop page

parameters:

- name: slug

in: path

required: true

schema: { type: string }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/ShopResponse' }

put:

tags: [shops]

summary: Update shop (owner only)

security:

- BearerAuth: []

parameters:

- name: slug

in: path

required: true

schema: { type: string }

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/ShopCreateRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/ShopResponse' }

/shops/{slug}/products:

get:

tags: [shops]

summary: List products of a shop

parameters:

- name: slug

in: path

required: true

schema: { type: string }

- name: status

in: query

schema: { type: string, enum: [IN\_SEASON, UPCOMING, OUT\_OF\_STOCK, HIDDEN, ALL] }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/ProductListResponse' }

# ── HTX ───────────────────────────────────────────────────

/htx:

post:

tags: [htx]

summary: Create HTX (submit for ADMIN approval)

description: "FARMER creates HTX -> PENDING. On APPROVE: HTX\_SHOP auto-created, creator becomes HTX\_MANAGER."

security:

- BearerAuth: []

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/HtxCreateRequest' }

responses:

'201':

description: Created, pending approval

content:

application/json:

schema: { $ref: '#/components/schemas/HtxResponse' }

/htx/{htx\_id}:

get:

tags: [htx]

summary: HTX details

parameters:

- name: htx\_id

in: path

required: true

schema: { type: string, format: uuid }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/HtxResponse' }

/htx/{htx\_id}/join:

post:

tags: [htx]

summary: FARMER requests to join HTX

description: "Only FARMERs not already in an HTX can apply. 1 farmer = 1 HTX at a time."

security:

- BearerAuth: []

parameters:

- name: htx\_id

in: path

required: true

schema: { type: string, format: uuid }

requestBody:

required: false

content:

application/json:

schema:

type: object

properties:

message: { type: string }

responses:

'201':

description: Request submitted

content:

application/json:

schema: { $ref: '#/components/schemas/SuccessMessage' }

/htx/{htx\_id}/join-requests/{request\_id}:

patch:

tags: [htx]

summary: HTX\_MANAGER approves/rejects join request

security:

- BearerAuth: []

parameters:

- name: htx\_id

in: path

required: true

schema: { type: string, format: uuid }

- name: request\_id

in: path

required: true

schema: { type: string, format: uuid }

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/ProcessJoinRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/SuccessMessage' }

/htx/{htx\_id}/members/{member\_id}:

delete:

tags: [htx]

summary: HTX\_MANAGER removes a member (kick)

description: |

Not allowed if member has ACTIVE pledges in OPEN/FULL Bundles.

On success: role -> FARMER, all ACTIVE pledges -> WITHDRAWN, member notified with reason.

security:

- BearerAuth: []

parameters:

- name: htx\_id

in: path

required: true

schema: { type: string, format: uuid }

- name: member\_id

in: path

required: true

schema: { type: string, format: uuid }

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/RemoveMemberRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/SuccessMessage' }

'409':

description: Member has active pledges in open bundles

content:

application/json:

schema: { $ref: '#/components/schemas/ApiError' }

/htx/{htx\_id}/leave:

post:

tags: [htx]

summary: HTX\_MEMBER leaves HTX voluntarily

description: |

Not allowed if member has ACTIVE pledges in OPEN/FULL Bundles.

On success: role -> FARMER, all ACTIVE pledges -> WITHDRAWN.

security:

- BearerAuth: []

parameters:

- name: htx\_id

in: path

required: true

schema: { type: string, format: uuid }

requestBody:

required: false

content:

application/json:

schema: { $ref: '#/components/schemas/LeaveHtxRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/SuccessMessage' }

'409':

description: Cannot leave - has active pledges

content:

application/json:

schema: { $ref: '#/components/schemas/ApiError' }

/htx/{htx\_id}/seasonal-config:

get:

tags: [htx]

summary: View HTX seasonal config

security:

- BearerAuth: []

parameters:

- name: htx\_id

in: path

required: true

schema: { type: string, format: uuid }

responses:

'200':

description: OK

content:

application/json:

schema:

type: array

items: { $ref: '#/components/schemas/SeasonalConfigResponse' }

post:

tags: [htx]

summary: HTX\_MANAGER creates/updates seasonal config for region

security:

- BearerAuth: []

parameters:

- name: htx\_id

in: path

required: true

schema: { type: string, format: uuid }

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/SeasonalConfigRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/SeasonalConfigResponse' }

# ── HTX\_SHOP ──────────────────────────────────────────────

/htx-shops/{slug}:

get:

tags: [htx-shop]

summary: View HTX public shop page (shows bundles, not individual products)

parameters:

- name: slug

in: path

required: true

schema: { type: string }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/HtxShopResponse' }

put:

tags: [htx-shop]

summary: HTX\_MANAGER updates HTX\_SHOP info

security:

- BearerAuth: []

parameters:

- name: slug

in: path

required: true

schema: { type: string }

requestBody:

required: true

content:

application/json:

schema:

type: object

properties:

name: { type: string }

description: { type: string }

avatar\_url: { type: string }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/HtxShopResponse' }

# ── PRODUCTS ──────────────────────────────────────────────

/products:

get:

tags: [products]

summary: List products with search and filter

parameters:

- name: q

in: query

schema: { type: string }

description: Full-text search by product name

- name: category

in: query

schema: { type: string, enum: [FRUIT, VEGETABLE, GRAIN, TUBER, HERB, OTHER] }

- name: province

in: query

schema: { type: string }

- name: district

in: query

schema: { type: string }

- name: status

in: query

schema: { type: string, enum: [IN\_SEASON, UPCOMING] }

- name: farming\_method

in: query

schema: { type: string, enum: [TRADITIONAL, ORGANIC, VIETGAP, GLOBALGAP] }

- name: min\_price

in: query

schema: { type: number }

- name: max\_price

in: query

schema: { type: number }

- name: sort

in: query

schema: { type: string, enum: [price\_asc, price\_desc, newest, best\_seller] }

default: newest

- name: page

in: query

schema: { type: integer, default: 1 }

- name: limit

in: query

schema: { type: integer, default: 20 }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/ProductListResponse' }

post:

tags: [products]

summary: Create product (requires shop)

security:

- BearerAuth: []

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/ProductCreateRequest' }

responses:

'201':

description: Created

content:

application/json:

schema: { $ref: '#/components/schemas/ProductResponse' }

/products/{product\_id}:

get:

tags: [products]

summary: Product detail with traceability info

parameters:

- name: product\_id

in: path

required: true

schema: { type: string, format: uuid }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/ProductResponse' }

put:

tags: [products]

summary: Update product (owner only)

security:

- BearerAuth: []

parameters:

- name: product\_id

in: path

required: true

schema: { type: string, format: uuid }

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/ProductCreateRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/ProductResponse' }

delete:

tags: [products]

summary: Hide product (soft delete -> HIDDEN)

security:

- BearerAuth: []

parameters:

- name: product\_id

in: path

required: true

schema: { type: string, format: uuid }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/SuccessMessage' }

# ── CART ──────────────────────────────────────────────────

/cart:

get:

tags: [cart]

summary: View cart

security:

- BearerAuth: []

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/CartResponse' }

/cart/items:

post:

tags: [cart]

summary: Add item to cart (soft stock check only)

description: "Hard inventory lock happens at POST /orders (checkout), not here."

security:

- BearerAuth: []

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/CartItemRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/CartResponse' }

/cart/items/{item\_id}:

put:

tags: [cart]

summary: Update item quantity (0 = remove)

security:

- BearerAuth: []

parameters:

- name: item\_id

in: path

required: true

schema: { type: string, format: uuid }

requestBody:

required: true

content:

application/json:

schema:

type: object

required: [quantity]

properties:

quantity: { type: number, minimum: 0 }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/CartResponse' }

delete:

tags: [cart]

summary: Remove item from cart

security:

- BearerAuth: []

parameters:

- name: item\_id

in: path

required: true

schema: { type: string, format: uuid }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/CartResponse' }

# ── ORDERS ────────────────────────────────────────────────

/orders:

post:

tags: [orders]

summary: Checkout (with inventory lock)

description: |

SELECT FOR UPDATE on each product. If any insufficient -> 409 INVENTORY\_INSUFFICIENT.

All sufficient -> deduct quantity + create Order + SubOrders in one transaction.

Guest: no Bearer needed, pass guest\_token in body.

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/CheckoutRequest' }

responses:

'201':

description: Order created

content:

application/json:

schema: { $ref: '#/components/schemas/OrderResponse' }

'409':

description: Inventory insufficient

content:

application/json:

schema: { $ref: '#/components/schemas/InventoryConflictError' }

get:

tags: [orders]

summary: Order history (buyer=purchases, farmer=sales)

security:

- BearerAuth: []

parameters:

- name: status

in: query

schema: { type: string }

- name: page

in: query

schema: { type: integer, default: 1 }

responses:

'200':

description: OK

content:

application/json:

schema:

type: object

properties:

data: { type: array, items: { $ref: '#/components/schemas/OrderResponse' } }

pagination: { $ref: '#/components/schemas/Pagination' }

/orders/{order\_id}:

get:

tags: [orders]

summary: Order detail

security:

- BearerAuth: []

parameters:

- name: order\_id

in: path

required: true

schema: { type: string, format: uuid }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/OrderResponse' }

/orders/guest/{order\_code}:

get:

tags: [orders]

summary: Guest order tracking (no login required)

parameters:

- name: order\_code

in: path

required: true

schema: { type: string }

- name: phone

in: query

required: true

schema: { type: string }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/OrderResponse' }

'404':

description: Not found

content:

application/json:

schema: { $ref: '#/components/schemas/ApiError' }

/orders/{order\_id}/cancel:

post:

tags: [orders]

summary: Buyer cancels order (only when ALL sub-orders are PENDING)

description: "On cancel: available\_quantity restored for all items."

security:

- BearerAuth: []

parameters:

- name: order\_id

in: path

required: true

schema: { type: string, format: uuid }

requestBody:

required: false

content:

application/json:

schema:

type: object

properties:

note: { type: string }

responses:

'200':

description: Cancelled

content:

application/json:

schema: { $ref: '#/components/schemas/OrderResponse' }

'409':

description: Cannot cancel - not all sub-orders in PENDING

content:

application/json:

schema: { $ref: '#/components/schemas/ApiError' }

/orders/sub-orders/{sub\_order\_id}/status:

patch:

tags: [orders]

summary: Farmer updates sub-order status

description: |

Valid: PENDING->CONFIRMED->PREPARING->SHIPPED->DELIVERED

Cancel allowed: PENDING->CANCELLED, CONFIRMED->CANCELLED (seller only)

cancel\_reason required when CANCELLED. On cancel: quantity restored, buyer notified.

security:

- BearerAuth: []

parameters:

- name: sub\_order\_id

in: path

required: true

schema: { type: string, format: uuid }

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/UpdateSubOrderStatusRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/SubOrder' }

'400':

description: Invalid transition or missing cancel\_reason

content:

application/json:

schema: { $ref: '#/components/schemas/ApiError' }

# ── REVIEWS ───────────────────────────────────────────────

/reviews:

post:

tags: [reviews]

summary: Create review (buyer, after DELIVERED, once per order\_item)

security:

- BearerAuth: []

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/ReviewCreateRequest' }

responses:

'201':

description: Created

content:

application/json:

schema: { $ref: '#/components/schemas/ReviewResponse' }

'403':

description: Not delivered yet or already reviewed

content:

application/json:

schema: { $ref: '#/components/schemas/ApiError' }

/products/{product\_id}/reviews:

get:

tags: [reviews]

summary: Product reviews list

parameters:

- name: product\_id

in: path

required: true

schema: { type: string, format: uuid }

- name: page

in: query

schema: { type: integer, default: 1 }

responses:

'200':

description: OK

content:

application/json:

schema:

type: object

properties:

data: { type: array, items: { $ref: '#/components/schemas/ReviewResponse' } }

average\_rating: { type: number }

pagination: { $ref: '#/components/schemas/Pagination' }

/reviews/{review\_id}/reply:

post:

tags: [reviews]

summary: Farmer replies to review (once, public)

security:

- BearerAuth: []

parameters:

- name: review\_id

in: path

required: true

schema: { type: string, format: uuid }

requestBody:

required: true

content:

application/json:

schema:

type: object

required: [reply]

properties:

reply: { type: string }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/ReviewResponse' }

# ── COOPERATIVE ───────────────────────────────────────────

/cooperative/bundles:

get:

tags: [cooperative]

summary: List bundles (filter by province, district, category, status)

security:

- BearerAuth: []

parameters:

- name: province

in: query

schema: { type: string }

- name: district

in: query

schema: { type: string }

- name: category

in: query

schema: { type: string }

- name: status

in: query

schema: { type: string, enum: [OPEN, FULL, CONFIRMED, EXPIRED, CANCELLED] }

default: OPEN

- name: page

in: query

schema: { type: integer, default: 1 }

responses:

'200':

description: OK

content:

application/json:

schema:

type: object

properties:

data: { type: array, items: { $ref: '#/components/schemas/BundleResponse' } }

pagination: { $ref: '#/components/schemas/Pagination' }

post:

tags: [cooperative]

summary: HTX\_MANAGER creates Bundle under HTX\_SHOP

security:

- BearerAuth: []

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/BundleCreateRequest' }

responses:

'201':

description: Created

content:

application/json:

schema: { $ref: '#/components/schemas/BundleResponse' }

/cooperative/bundles/{bundle\_id}:

get:

tags: [cooperative]

summary: Bundle detail with pledges

security:

- BearerAuth: []

parameters:

- name: bundle\_id

in: path

required: true

schema: { type: string, format: uuid }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/BundleResponse' }

/cooperative/bundles/{bundle\_id}/pledges:

post:

tags: [cooperative]

summary: HTX\_MEMBER pledges quantity to Bundle

description: "Bundle must be OPEN. 1 pledge per member per bundle (upsert quantity)."

security:

- BearerAuth: []

parameters:

- name: bundle\_id

in: path

required: true

schema: { type: string, format: uuid }

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/PledgeRequest' }

responses:

'200':

description: OK - returns updated Bundle

content:

application/json:

schema: { $ref: '#/components/schemas/BundleResponse' }

/cooperative/bundles/{bundle\_id}/pledges/{pledge\_id}/withdraw:

post:

tags: [cooperative]

summary: HTX\_MEMBER withdraws pledge (Bundle must be OPEN)

description: |

Also called automatically by system when member Leaves/is Removed from HTX.

Not allowed when Bundle is FULL or CONFIRMED.

security:

- BearerAuth: []

parameters:

- name: bundle\_id

in: path

required: true

schema: { type: string, format: uuid }

- name: pledge\_id

in: path

required: true

schema: { type: string, format: uuid }

requestBody:

required: false

content:

application/json:

schema: { $ref: '#/components/schemas/WithdrawPledgeRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/SuccessMessage' }

'409':

description: Cannot withdraw from FULL or CONFIRMED bundle

content:

application/json:

schema: { $ref: '#/components/schemas/ApiError' }

/cooperative/bundles/{bundle\_id}/confirm:

patch:

tags: [cooperative]

summary: HTX\_MANAGER confirms Bundle

description: |

After confirm:

1. Bundle status -> CONFIRMED

2. contribution\_percent calculated per pledge

3. estimated\_revenue calculated per pledge

4. All participating members notified (in-app + Telegram)

5. HTX\_SHOP sub-orders -> PREPARING

security:

- BearerAuth: []

parameters:

- name: bundle\_id

in: path

required: true

schema: { type: string, format: uuid }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/BundleResponse' }

/cooperative/bundles/{bundle\_id}/cancel:

patch:

tags: [cooperative]

summary: HTX\_MANAGER cancels Bundle (only OPEN or FULL)

description: "All pledges -> WITHDRAWN. Does not affect retail buyer orders (separate flow)."

security:

- BearerAuth: []

parameters:

- name: bundle\_id

in: path

required: true

schema: { type: string, format: uuid }

requestBody:

required: true

content:

application/json:

schema:

type: object

required: [reason]

properties:

reason: { type: string }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/BundleResponse' }

# ── AI ────────────────────────────────────────────────────

/ai/voice-extract:

post:

tags: [ai]

summary: Extract product fields from voice transcript + unit conversion

description: |

Base URL: Python service (http://localhost:8000/api/v1)

Looks up unit aliases table to convert regional terms to base units.

Example: "nam ta" -> quantity=500, unit\_code=KG

security:

- BearerAuth: []

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/VoiceExtractRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/VoiceExtractResponse' }

/ai/refine-description:

post:

tags: [ai]

summary: Normalize product description (AI Input Refiner)

description: "Base URL: Python service"

security:

- BearerAuth: []

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/RefineDescriptionRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/RefineDescriptionResponse' }

/ai/generate-caption:

post:

tags: [ai]

summary: Generate marketing captions (3 styles)

description: "Base URL: Python service"

security:

- BearerAuth: []

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/CaptionRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/CaptionResponse' }

/ai/poster-content:

post:

tags: [ai]

summary: Generate poster text content (client-side rendering via html2canvas)

description: |

Base URL: Python service.

SERVER returns text JSON only. NO image rendering on server (no Puppeteer).

CLIENT-SIDE FLOW:

1. Call this endpoint -> receive PosterContentResponse

2. FE renders React <PosterTemplate id={template\_id}> with the content

3. html2canvas or dom-to-image captures the component -> PNG Blob

4. FE uploads PNG directly to Cloudinary

5. FE saves Cloudinary URL to product

Zero RAM overhead on server.

security:

- BearerAuth: []

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/PosterContentRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/PosterContentResponse' }

/ai/remove-bg:

post:

tags: [ai]

summary: Remove background from product image (Clipdrop API)

description: "Base URL: Python service. Call before /ai/poster-content if you want clean product photo."

security:

- BearerAuth: []

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/RemoveBgRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/RemoveBgResponse' }

# ── NOTIFICATIONS ─────────────────────────────────────────

/notifications:

get:

tags: [notifications]

summary: In-app notification list

security:

- BearerAuth: []

parameters:

- name: is\_read

in: query

schema: { type: boolean }

- name: page

in: query

schema: { type: integer, default: 1 }

responses:

'200':

description: OK

content:

application/json:

schema:

type: object

properties:

data: { type: array, items: { $ref: '#/components/schemas/NotificationResponse' } }

unread\_count: { type: integer }

pagination: { $ref: '#/components/schemas/Pagination' }

/notifications/{notification\_id}/read:

patch:

tags: [notifications]

summary: Mark notification as read

security:

- BearerAuth: []

parameters:

- name: notification\_id

in: path

required: true

schema: { type: string, format: uuid }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/SuccessMessage' }

/notifications/read-all:

patch:

tags: [notifications]

summary: Mark all as read

security:

- BearerAuth: []

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/SuccessMessage' }

/notifications/telegram/register:

post:

tags: [notifications]

summary: Register Telegram notifications

security:

- BearerAuth: []

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/TelegramRegisterRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/SuccessMessage' }

/notifications/telegram/unregister:

delete:

tags: [notifications]

summary: Unregister Telegram notifications

security:

- BearerAuth: []

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/SuccessMessage' }

# ── ADMIN ─────────────────────────────────────────────────

/admin/htx-requests:

get:

tags: [admin]

summary: List HTX by status (default PENDING)

security:

- BearerAuth: []

parameters:

- name: status

in: query

schema: { type: string, enum: [PENDING, ACTIVE, SUSPENDED, REJECTED] }

default: PENDING

- name: page

in: query

schema: { type: integer, default: 1 }

responses:

'200':

description: OK

content:

application/json:

schema:

type: object

properties:

data: { type: array, items: { $ref: '#/components/schemas/HtxResponse' } }

pagination: { $ref: '#/components/schemas/Pagination' }

/admin/htx-requests/{htx\_id}:

patch:

tags: [admin]

summary: ADMIN approves or rejects HTX

description: |

On APPROVE: HTX->ACTIVE, creator->HTX\_MANAGER, HTX\_SHOP auto-created (slug=htx-{code}), notify creator.

On REJECT: HTX->REJECTED, notify creator with note.

security:

- BearerAuth: []

parameters:

- name: htx\_id

in: path

required: true

schema: { type: string, format: uuid }

requestBody:

required: true

content:

application/json:

schema:

type: object

required: [action]

properties:

action: { type: string, enum: [APPROVE, REJECT] }

note: { type: string, description: "Required when REJECT" }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/HtxResponse' }

/admin/users:

get:

tags: [admin]

summary: Search users

security:

- BearerAuth: []

parameters:

- name: q

in: query

schema: { type: string }

- name: role

in: query

schema: { type: string }

- name: is\_banned

in: query

schema: { type: boolean }

- name: page

in: query

schema: { type: integer, default: 1 }

responses:

'200':

description: OK

content:

application/json:

schema:

type: object

properties:

data: { type: array, items: { $ref: '#/components/schemas/UserProfile' } }

pagination: { $ref: '#/components/schemas/Pagination' }

/admin/users/{user\_id}/ban:

patch:

tags: [admin]

summary: Ban or unban user

security:

- BearerAuth: []

parameters:

- name: user\_id

in: path

required: true

schema: { type: string, format: uuid }

requestBody:

required: true

content:

application/json:

schema:

type: object

required: [action]

properties:

action: { type: string, enum: [BAN, UNBAN] }

reason: { type: string }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/SuccessMessage' }

/admin/seasonal-config:

get:

tags: [admin]

summary: View all seasonal config (nationwide)

security:

- BearerAuth: []

parameters:

- name: province

in: query

schema: { type: string }

- name: category

in: query

schema: { type: string }

responses:

'200':

description: OK

content:

application/json:

schema:

type: array

items: { $ref: '#/components/schemas/SeasonalConfigResponse' }

post:

tags: [admin]

summary: ADMIN creates/overrides national seasonal config

security:

- BearerAuth: []

requestBody:

required: true

content:

application/json:

schema: { $ref: '#/components/schemas/SeasonalConfigRequest' }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/SeasonalConfigResponse' }

/admin/seasonal-config/{config\_id}:

delete:

tags: [admin]

summary: Delete seasonal config entry

security:

- BearerAuth: []

parameters:

- name: config\_id

in: path

required: true

schema: { type: string, format: uuid }

responses:

'200':

description: OK

content:

application/json:

schema: { $ref: '#/components/schemas/SuccessMessage' }

Nghiệp vụ DRAFT

**CẠP NÔNG – HỆ SINH THÁI THƯƠNG MẠI NÔNG SẢN THÔNG MINH**

Khẩu hiệu: *Kết nối thực chất – Giá trị bền vững*

Tên dự án: CẠP NÔNG

Lĩnh vực: Agri-Tech, E-commerce, Blockchain & AI

1. TỔNG QUAN DỰ ÁN

Cạp Nông là nền tảng thương mại điện tử thế hệ mới dành riêng cho nông sản địa phương. Dự án giải quyết "điểm nghẽn" lớn nhất hiện nay: Khoảng cách công nghệ của nông dân và Niềm tin về chất lượng của người tiêu dùng. Bằng cách ứng dụng trí tuệ nhân tạo (AI) để đơn giản hóa vận hành và Blockchain để minh bạch hóa nguồn gốc, Cạp Nông biến mỗi hộ nông dân thành một thương hiệu uy tín trên không gian số.

2. VẤN ĐỀ VÀ THỰC TRẠNG

* Nông dân: Có kỹ năng canh tác tốt nhưng gặp khó khăn khi tiếp cận công nghệ (ngại viết bài, ngại quản lý đơn hàng phức tạp).
* Thị trường: Người tiêu dùng có nhu cầu cao về thực phẩm sạch nhưng thiếu công cụ kiểm chứng nguồn gốc đáng tin cậy.
* Chi phí: Các giải pháp truy xuất nguồn gốc hiện nay thường đi kèm chi phí thiết bị IoT đắt đỏ, khó triển khai đại trà.

3. GIẢI PHÁP ĐỘT PHÁ CỦA CẠP NÔNG

3.1. Trải nghiệm "Thương mại 1-chạm" cho Nông dân

Hệ thống loại bỏ rào cản kỹ thuật thông qua các tính năng AI tích hợp:

* Đăng bán bằng giọng nói (Voice-to-Commerce): Tận dụng công nghệ xử lý ngôn ngữ tự nhiên (NLP) để chuyển đổi lời nói của nông dân thành bài đăng chuẩn hóa (tiêu đề, mô tả, phân loại).
* Tự động hóa nội dung thị giác: AI tự động tách nền, hiệu chỉnh ánh sáng ảnh nông sản thực tế để tạo ra hình ảnh chuyên nghiệp cho gian hàng.

3.2. Hệ thống "Lòng tin Kỹ thuật số" (Digital Trust)

Thay vì phụ thuộc hoàn toàn vào thiết bị IoT vật lý, Cạp Nông ứng dụng mô hình Cặp song sinh số (Digital Twin):

* Hồ sơ sinh trưởng chuẩn: Xây dựng bộ dữ liệu giả định về kích thước, màu sắc và tốc độ phát triển lý tưởng của sản phẩm (VD: Bưởi Da Xanh, Thanh Long).
* Xác thực chéo (Cross-verification): AI so sánh ảnh chụp định kỳ từ nông dân với dữ liệu thời tiết, khí hậu từ các API công cộng (OpenWeather, NASA Power). Nếu có sự mâu thuẫn (VD: Cây lớn nhanh bất thường trong khi hạn hán), hệ thống sẽ cảnh báo rủi ro gian lận.

4. KIẾN TRÚC CÔNG NGHỆ CỐT LÕI

| Công nghệ | Ứng dụng cụ thể trong Cạp Nông |
| --- | --- |
| Generative AI | Tự động viết kịch bản quảng bá, tối ưu hóa công cụ tìm kiếm (SEO) cho từng nông hộ. |
| Computer Vision | Phân tích hình ảnh để đo lường kích thước trái cây và phát hiện dấu hiệu bệnh lý từ xa. |
| Blockchain (Layer 2) | Lưu trữ nhật ký canh tác và chứng chỉ số (NFT) cho từng lô hàng, đảm bảo dữ liệu không thể bị sửa xóa. |
| Dữ liệu giả định | Tạo ra các kịch bản đối chứng để AI tự học cách nhận diện các hành vi bón phân/thuốc hóa học bất thường. |

5. LỘ TRÌNH TRIỂN KHAI (ROADMAP)

Giai đoạn 1: Xây dựng & Chuẩn hóa

* Hoàn thiện Web App với giao diện Mobile-first tối giản.
* Thiết lập "Bộ dữ liệu vàng" cho 02 sản phẩm chủ lực: Bưởi Da Xanh và Thanh Long.
* Tích hợp Smart Contract cơ bản trên mạng Polygon.

Giai đoạn 2: Thử nghiệm thực địa

* Thử nghiệm giả định vận hành quy trình logistics kết nối tự động với các đơn vị vận chuyển.

Giai đoạn 3: Tối ưu & Tăng trưởng

* Sử dụng dữ liệu thực tế thu thập được để tinh chỉnh AI nhận diện chính xác hơn.
* Mở rộng danh mục lên 10 loại đặc sản vùng miền.
* Xây dựng hệ thống điểm tín dụng (Credit Score) cho nông dân dựa trên sự trung thực của dữ liệu.

6. CHIẾN LƯỢC TIẾP CẬN THỊ TRƯỜNG (GO-TO-MARKET)

* Kênh Hợp tác xã (B2B2C): Tiếp cận thông qua các tổ chức chính trị - xã hội tại địa phương để tạo niềm tin ban đầu.
* Chiến dịch "Chuyện của vườn": Sử dụng AI để xuất bản tự động các video ngắn về quá trình lao động thực tế của nông dân lên TikTok/Reels, đánh vào cảm xúc và nhu cầu mua thực phẩm sạch của khách hàng đô thị.
* Mô hình bảo chứng: Cam kết hoàn tiền 200% nếu dữ liệu trên Blockchain sai lệch so với kiểm định thực tế, được bảo chứng bởi quỹ rủi ro của sàn

7. KẾT LUẬN

Cạp Nông không chỉ là một trang web bán hàng, mà là một giải pháp công nghệ toàn diện giúp số hóa nông nghiệp từ gốc. Bằng cách thay thế các thiết bị phần cứng đắt đỏ bằng thuật toán AI và dữ liệu đối soát thông minh, dự án đảm bảo tính khả thi cực cao trong bối cảnh nông thôn Việt Nam hiện nay.