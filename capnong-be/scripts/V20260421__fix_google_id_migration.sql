-- Migration script: Fix google_id từ Supabase UUID sang giá trị đúng
-- Ngày: 2026-04-21
-- Mô tả: google_id đang lưu Supabase User UUID thay vì Google Account sub.
--         Vì không thể reverse-lookup từ UUID sang Google sub,
--         script này clear các giá trị UUID sai, cho phép auto-recovery
--         tự động cập nhật khi user đăng nhập Google lần tiếp theo.

-- Step 1: Xem các user bị ảnh hưởng (chỉ xem, không sửa gì)
SELECT id, username, email, google_id, google_email
FROM users
WHERE google_id IS NOT NULL
  AND google_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';
-- ^ Regex match UUID format — chắc chắn đây là Supabase UUID, không phải Google sub

-- Step 2: Clear google_id sai để auto-recovery hoạt động
-- Khi user đăng nhập Google lần tới, checkGoogleLogin() sẽ:
--   1. findByGoogleId(realGoogleSub) → miss
--   2. findByEmail(email) → match
--   3. Thấy google_id != null → auto-update sang giá trị đúng
--
-- NHƯNG vì google_id cũ là UUID sai, nếu để nguyên thì bước 2.findByEmail
-- sẽ match nhưng google_id vẫn = UUID cũ → auto-recovery vẫn update OK.
-- 
-- Tuy nhiên, nếu google_email cũng NULL thì email lookup có thể fail
-- nếu user đăng ký bằng SĐT (email = null trong DB).
-- Nên ta cập nhật google_email cho các user bị ảnh hưởng nếu nó null.

-- Kiểm tra user nào bị thiếu cả email lẫn google_email
SELECT id, username, email, google_email, google_id
FROM users
WHERE google_id IS NOT NULL
  AND google_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  AND email IS NULL;

-- Step 3 (OPTIONAL - chỉ chạy nếu muốn clear hoàn toàn):
-- Đặt google_id thành NULL cho tất cả các user có google_id dạng UUID
-- Điều này buộc user phải link lại Google từ Profile page.
-- Chỉ cần chạy nếu auto-recovery không hoạt động đúng.

-- UNCOMMENT để chạy:
-- UPDATE users
-- SET google_id = NULL
-- WHERE google_id IS NOT NULL
--   AND google_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- === GIẢI PHÁP KHUYẾN NGHỊ ===
-- KHÔNG cần chạy Step 3 ngay. Lý do:
-- Auto-recovery trong checkGoogleLogin() đã xử lý:
-- - User "phanhongdat" có email → khi login Google lần tới → findByEmail match
--   → thấy googleId != null → auto-update googleId sang Google sub đúng.
-- - User "min" tương tự.
--
-- Chỉ cần restart BE với code mới là đủ.
