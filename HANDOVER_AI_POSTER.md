# Báo cáo tích hợp: AI Poster & Marketing (Frontend ➡️ Backend)

Bản ghi nhớ này liệt kê các thay đổi kỹ thuật ở phía Frontend (Next.js) đối với tính năng **AI Poster / Marketing** để team Backend dễ dàng hình dung và `rap` (tích hợp) API mới.

---

## 1. Vấn đề đã giải quyết ở Frontend
Trước đây, màn hình Dashboard Marketing gặp hiện tượng màn hình trắng, giật (flickering), và dính lỗi Infinity Loop Render của Next.js (lỗi SSR crash). 
Frontend đã can thiệp để ổn định hoàn toàn UI:
1. **Xóa bỏ các ngắt quãng chặn luồng (blocking timeouts)** trong hệ thống Mock API cũ vì nó làm sập server-side render.
2. **Sửa lỗi truy cập `localStorage` sai cách**: Chuyển logic đọc local storage sang Hook `useEffect` để tránh xung đột với chế độ kết xuất phía máy chủ (SSR) của Next 16.
3. **Cấu hình lại Next.config**: Hủy bỏ các cấu hình rewrite API/Proxy bị lỗi gây ra lỗi vòng lặp `Too many redirects`.

---

## 2. Các điểm Backend cần lưu ý khi nối API mới

Hiện tại Frontend đã tái cấu trúc lại các Component của phần Marketing vào thư mục (untracked/new files):
* `capnong-fe/src/components/marketing/`
* `capnong-fe/src/app/dashboard/marketing/page.tsx`
* `capnong-fe/src/lib/safe-image.tsx` (Component hiển thị an toàn khi ảnh AI bị lỗi)

### 📌 Cấu trúc Render Ảnh (Image Handling)
* Do hình ảnh AI sinh ra từ Vertex AI / Cloudinary đôi khi cần vài giây để load, Frontend đã bọc nó vào cớ chế `safe-image.tsx` và `image-loader.ts`.
* Nếu Link ảnh BE trả về bị hỏng (Error 404), giao diện sẽ tự Fallback về ảnh mặc định chứ không làm sập ứng dụng.
* **Yêu cầu API BE:** Đảm bảo trường `imageUrl` (hoặc tương tự) được trả về trực tiếp dưới dạng CDN URL (Cloudinary Link) ngay khi AI sinh hình xong.

### 📌 Trạng thái Loading Sinh Ảnh
* Ở Front-end hiện có sẵn Loading State. Khi gọi API sinh ảnh (`POST /api/marketing/generate` chẳng hạn), BE nên xử lý theo 1 trong 2 cách:
  - **Cách 1 (Đồng bộ - đang dùng):** BE giữ connection và trả về kết quả ngay (Frontend sẽ quay spinner chờ BE).
  - **Cách 2 (Bất đồng bộ):** BE trả mã `202 Accepted`, Frontend sẽ tự động Polling (gọi API thăm dò mỗi 3 giây) để hỏi kết quả.

---

**Kết luận:** 
UI Marketing nay đã ổn định ở phía Next.js. Team BE hoàn toàn có thể thay thế thẳng các hàm gọi service đang mock của FE hiện tại bằng Axios request trỏ tới endpoint Backend thực tế. Mọi State Management (React Query/Zustand) ở FE đã được bọc kỹ bằng Error Boundary.
