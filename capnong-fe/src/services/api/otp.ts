/**
 * API OTP Service — Khớp BE OtpController
 *
 * BE Endpoints (prefix /api/otp):
 *   POST /send    → Gửi OTP qua SMS { phone }
 *   POST /verify  → Xác nhận OTP { phone, code }
 *
 * Note: Dev mode luôn trả về 123456 trong console log
 */
import api from "../api";

/**
 * Yêu cầu gửi OTP đến số điện thoại
 */
export async function sendOtp(phone: string): Promise<void> {
  await api.post("/api/otp/send", { phone });
}

/**
 * Xác nhận mã OTP
 * @throws Error nếu OTP sai hoặc hết hạn
 */
export async function verifyOtp(phone: string, code: string): Promise<void> {
  await api.post("/api/otp/verify", { phone, code });
}
