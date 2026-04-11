"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, User, Tractor, Package, CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/Toast";

type Step = "form" | "otp" | "done";

export default function RegisterPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [role, setRole] = useState<"BUYER" | "FARMER">("BUYER");
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);

  /* Form fields */
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  /* OTP fields */
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState(0);

  /* UC-22: Simulated merge guest orders */
  const hasMergedOrders = phone.startsWith("09");

  /* Countdown timer for OTP resend */
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  /* ─── Step 1: Validate & Send OTP ─── */
  const handleSendOtp = useCallback(async () => {
    if (!fullName.trim() || !phone.trim() || !password.trim()) {
      showToast("error", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }
    if (password.length < 6) {
      showToast("error", "Mật khẩu tối thiểu 6 ký tự");
      return;
    }
    if (!agreed) {
      showToast("error", "Vui lòng đồng ý với điều khoản sử dụng");
      return;
    }

    setLoading(true);
    try {
      const { sendRegisterOtp } = await import("@/services/api/auth");
      await sendRegisterOtp(phone);
      setStep("otp");
      setResendCountdown(60);
      showToast("success", `Mã OTP đã gửi đến ${phone}`);
    } catch {
      showToast("error", "Không gửi được OTP. Vui lòng kiểm tra số điện thoại.");
    } finally {
      setLoading(false);
    }
  }, [fullName, phone, password, agreed, showToast]);

  /* ─── Step 2: Verify OTP & Register ─── */
  const handleVerifyAndRegister = useCallback(async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      showToast("error", "Vui lòng nhập đủ 6 chữ số OTP");
      return;
    }

    setLoading(true);
    try {
      const { authService } = await import("@/services");
      const result = await authService.register({
        full_name: fullName,
        phone,
        password,
        role,
        email: email || undefined,
        username: phone,
        otp: otpCode,
      });

      // Store user data
      if (result.user) {
        localStorage.setItem("capnong-user", JSON.stringify(result.user));
      }

      setStep("done");
      showToast("success", "Đăng ký thành công!");
    } catch (err: unknown) {
      const msg = (err instanceof Error ? err.message : "") || "OTP không hợp lệ hoặc đã hết hạn";
      showToast("error", msg);
    } finally {
      setLoading(false);
    }
  }, [otp, fullName, phone, password, role, email, showToast]);

  /* ─── OTP Input Handler ─── */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      const next = document.getElementById(`otp-${index + 1}`);
      next?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`otp-${index - 1}`);
      prev?.focus();
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    try {
      const { sendRegisterOtp } = await import("@/services/api/auth");
      await sendRegisterOtp(phone);
      setResendCountdown(60);
      showToast("info", "Đã gửi lại mã OTP");
    } catch {
      showToast("error", "Không gửi lại được OTP");
    }
  };

  /* ═══════ STEP 3: Done ═══════ */
  if (step === "done") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 bg-background-light">
        <div className="w-full max-w-md text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-foreground">Đăng ký thành công!</h2>
          <p className="text-foreground-muted">
            Chào mừng bạn đến Cạp Nông 🌿
          </p>

          {/* UC-22: Merge guest banner */}
          {hasMergedOrders && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-left">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                    Đã liên kết 2 đơn hàng cũ!
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                    Chúng tôi đã tìm thấy đơn hàng từ SĐT {phone} khi bạn mua với tư cách khách. Các đơn đã được liên kết vào tài khoản mới.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Link href="/" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors">
              Khám phá ngay
            </Link>
            <Link href="/login" className="border border-gray-200 dark:border-border px-6 py-3 rounded-xl font-medium text-gray-600 dark:text-foreground-muted hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════ STEP 2: OTP Verification ═══════ */
  if (step === "otp") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 bg-background-light">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-surface rounded-2xl shadow-lg border border-border p-8">
            <button
              type="button"
              onClick={() => { setStep("form"); setOtp(["", "", "", "", "", ""]); }}
              className="flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Quay lại
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-3">
                <Leaf className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl font-black text-foreground">Xác nhận OTP</h1>
              <p className="text-foreground-muted text-sm mt-1">
                Nhập mã 6 số đã gửi đến <span className="font-bold text-foreground">{phone}</span>
              </p>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center gap-3 mb-6">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  className="w-12 h-14 text-center text-xl font-bold border-2 border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-colors"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            {/* Resend */}
            <div className="text-center mb-6">
              {resendCountdown > 0 ? (
                <p className="text-sm text-foreground-muted">
                  Gửi lại sau <span className="font-bold text-primary">{resendCountdown}s</span>
                </p>
              ) : (
                <button type="button" onClick={handleResend} className="text-sm text-primary font-bold hover:underline">
                  Gửi lại mã OTP
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={handleVerifyAndRegister}
              disabled={loading || otp.join("").length < 6}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Đang xác nhận...
                </span>
              ) : (
                "Xác nhận & Đăng ký"
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ═══════ STEP 1: Registration Form ═══════ */
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8 bg-background-light">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-surface rounded-2xl shadow-lg border border-border p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-3">
              <Leaf className="w-7 h-7 text-primary" />
            </div>
            <h1 className="text-2xl font-black text-foreground">
              Tạo tài khoản
            </h1>
            <p className="text-foreground-muted text-sm mt-1">
              Tham gia cộng đồng nông sản sạch Cạp Nông
            </p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button type="button"
              onClick={() => setRole("BUYER")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors",
                role === "BUYER"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-gray-300"
              )}
            >
              <User
                className={cn(
                  "w-6 h-6",
                  role === "BUYER" ? "text-primary" : "text-foreground-muted"
                )}
              />
              <span
                className={cn(
                  "text-sm font-bold",
                  role === "BUYER" ? "text-primary" : "text-foreground-muted"
                )}
              >
                Người mua
              </span>
            </button>
            <button type="button"
              onClick={() => setRole("FARMER")}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors",
                role === "FARMER"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-gray-300"
              )}
            >
              <Tractor
                className={cn(
                  "w-6 h-6",
                  role === "FARMER" ? "text-primary" : "text-foreground-muted"
                )}
              />
              <span
                className={cn(
                  "text-sm font-bold",
                  role === "FARMER" ? "text-primary" : "text-foreground-muted"
                )}
              >
                Nông dân
              </span>
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium mb-2">
                Họ và tên *
              </label>
              <input
                id="register-name"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
            </div>
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium mb-2">Email</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com (tuỳ chọn)"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
            </div>
            <div>
              <label htmlFor="register-phone" className="block text-sm font-medium mb-2">
                Số điện thoại *
              </label>
              <input
                id="register-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901 234 567"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
            </div>
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium mb-2">
                Mật khẩu *
              </label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
              />
            </div>

            {/* Farmer-specific field */}
            {role === "FARMER" && (
              <div>
                <label htmlFor="register-farm" className="block text-sm font-medium mb-2">
                  Tên nông trại / HTX
                </label>
                <input
                  id="register-farm"
                  type="text"
                  placeholder="Ví dụ: Nông trại Xanh Đà Lạt"
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                />
              </div>
            )}

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                aria-label="Đồng ý điều khoản sử dụng"
                className="accent-primary mt-1 rounded"
              />
              <span className="text-xs text-foreground-muted">
                Tôi đồng ý với{" "}
                <a href="#" className="text-primary hover:underline">
                  Điều khoản sử dụng
                </a>{" "}
                và{" "}
                <a href="#" className="text-primary hover:underline">
                  Chính sách bảo mật
                </a>{" "}
                của Cạp Nông
              </span>
            </div>

            <button
              type="button"
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Đang gửi OTP...
                </span>
              ) : (
                "Tiếp tục"
              )}
            </button>
          </div>

          <p className="text-center mt-6 text-sm text-foreground-muted">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="text-primary font-bold hover:underline"
            >
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
