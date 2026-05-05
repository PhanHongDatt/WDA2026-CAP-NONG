"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, ArrowLeft, Loader2, CheckCircle2, KeyRound } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { TornEdgeBottom } from "@/components/ui/TornEdges";

type Step = "phone" | "otp" | "reset" | "done";

export default function ForgotPasswordPage() {
  return (
    <div className="relative w-full">
      <div 
        className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 relative z-0"
        style={{
          backgroundImage: 'url("/images/banners/banner-background.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-white/20 dark:bg-black/40 z-[-1]" />
        
        <ForgotPasswordContent />
      </div>
      <TornEdgeBottom />
    </div>
  );
}

function ForgotPasswordContent() {
  const router = useRouter();
  const { showToast } = useToast();

  const [step, setStep] = useState<Step>("phone");
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  /* Step 1: Send OTP */
  const handleSendOtp = useCallback(async () => {
    if (!identifier.trim()) {
      showToast("error", "Vui lòng nhập SĐT hoặc email");
      return;
    }
    setLoading(true);
    try {
      const { forgotPassword } = await import("@/services/api/auth");
      await forgotPassword(identifier);
      setStep("otp");
      setResendCountdown(60);
      showToast("success", `Mã OTP đã gửi đến ${identifier}`);
    } catch {
      showToast("error", "Không gửi được OTP. Vui lòng kiểm tra lại.");
    } finally {
      setLoading(false);
    }
  }, [identifier, showToast]);

  /* Step 2: Verify OTP → go to reset */
  const handleVerifyOtp = useCallback(() => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      showToast("error", "Vui lòng nhập đủ 6 chữ số OTP");
      return;
    }
    setStep("reset");
  }, [otp, showToast]);

  /* Step 3: Reset password */
  const handleResetPassword = useCallback(async () => {
    if (newPassword.length < 6) {
      showToast("error", "Mật khẩu mới tối thiểu 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("error", "Mật khẩu xác nhận không khớp");
      return;
    }
    setLoading(true);
    try {
      const { resetPassword } = await import("@/services/api/auth");
      await resetPassword(identifier, otp.join(""), newPassword);
      setStep("done");
      showToast("success", "Đặt lại mật khẩu thành công!");
    } catch {
      showToast("error", "OTP không hợp lệ hoặc đã hết hạn");
    } finally {
      setLoading(false);
    }
  }, [identifier, otp, newPassword, confirmPassword, showToast]);

  /* OTP Input */
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`forgot-otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`forgot-otp-${index - 1}`)?.focus();
    }
  };

  const handleResend = async () => {
    if (resendCountdown > 0) return;
    try {
      const { forgotPassword } = await import("@/services/api/auth");
      await forgotPassword(identifier);
      setResendCountdown(60);
      showToast("info", "Đã gửi lại mã OTP");
    } catch {
      showToast("error", "Không gửi lại được OTP");
    }
  };

  if (step === "done") {
    return (
      <div className="w-full max-w-md my-8 relative z-10 text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-3xl font-black text-foreground">Đã đặt lại mật khẩu!</h2>
          <p className="text-foreground-muted">
            Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.
          </p>
          <Link
            href="/login"
            className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors"
          >
            Đăng nhập
          </Link>
        </div>
    );
  }

  return (
    <div className="w-full max-w-md my-8 relative z-10">
      <div className="bg-white dark:bg-surface rounded-2xl shadow-xl border border-border p-8">

          {/* Back button */}
          <button
            type="button"
            onClick={() => {
              if (step === "phone") router.push("/login");
              else if (step === "otp") setStep("phone");
              else if (step === "reset") { setStep("otp"); setOtp(["", "", "", "", "", ""]); }
            }}
            className="flex items-center gap-1 text-sm text-foreground-muted hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-2xl mb-3">
              {step === "reset" ? (
                <KeyRound className="w-7 h-7 text-primary" />
              ) : (
                <Leaf className="w-7 h-7 text-primary" />
              )}
            </div>
            <h1 className="text-2xl font-black text-foreground">
              {step === "phone" && "Quên mật khẩu"}
              {step === "otp" && "Xác nhận OTP"}
              {step === "reset" && "Đặt mật khẩu mới"}
            </h1>
            <p className="text-foreground-muted text-sm mt-1">
              {step === "phone" && "Nhập SĐT hoặc email để nhận mã xác nhận"}
              {step === "otp" && (
                <>Nhập mã 6 số đã gửi đến <span className="font-bold text-foreground">{identifier}</span></>
              )}
              {step === "reset" && "Tạo mật khẩu mới cho tài khoản của bạn"}
            </p>
          </div>

          {/* ═══ Step 1: Phone/Email ═══ */}
          {step === "phone" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="forgot-identifier" className="block text-sm font-medium mb-2">
                  SĐT hoặc Email *
                </label>
                <input
                  id="forgot-identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="0901 234 567 hoặc email@example.com"
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                  autoFocus
                />
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang gửi...
                  </span>
                ) : (
                  "Gửi mã OTP"
                )}
              </button>
            </div>
          )}

          {/* ═══ Step 2: OTP ═══ */}
          {step === "otp" && (
            <div className="space-y-6">
              <div className="flex justify-center gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`forgot-otp-${i}`}
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

              <div className="text-center">
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
                onClick={handleVerifyOtp}
                disabled={otp.join("").length < 6}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 disabled:opacity-60"
              >
                Xác nhận
              </button>
            </div>
          )}

          {/* ═══ Step 3: New Password ═══ */}
          {step === "reset" && (
            <div className="space-y-4">
              <div>
                <label htmlFor="forgot-new-pw" className="block text-sm font-medium mb-2">
                  Mật khẩu mới *
                </label>
                <input
                  id="forgot-new-pw"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="forgot-confirm-pw" className="block text-sm font-medium mb-2">
                  Xác nhận mật khẩu *
                </label>
                <input
                  id="forgot-confirm-pw"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3.5 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...
                  </span>
                ) : (
                  "Đặt lại mật khẩu"
                )}
              </button>
            </div>
          )}

          <p className="text-center mt-6 text-sm text-foreground-muted">
            Nhớ mật khẩu rồi?{" "}
            <Link href="/login" className="text-primary font-bold hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
    </div>
  );
}
