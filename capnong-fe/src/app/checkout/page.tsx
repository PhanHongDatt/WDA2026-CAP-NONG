"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  MapPin,
  CreditCard,
  Banknote,
  ShieldCheck,
  CheckCircle2,
  Smartphone,
  QrCode,
  BookOpen,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

/* Mock saved addresses */
const SAVED_ADDRESSES = [
  { id: 1, label: "Nhà", detail: "123 Nguyễn Huệ, Quận 1, TP.HCM", name: "Nguyễn Văn A", phone: "0901234567" },
  { id: 2, label: "Cơ quan", detail: "456 Lê Lợi, Quận 3, TP.HCM", name: "Nguyễn Văn A", phone: "0901234567" },
];

export default function CheckoutPage() {
  const { isLoggedIn } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BANK">("COD");
  const [submitted, setSubmitted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<number | null>(isLoggedIn ? 1 : null);
  const [showNewAddress, setShowNewAddress] = useState(!isLoggedIn);

  const subtotal = 185000;
  const shippingFee = 30000;
  const total = subtotal + shippingFee;

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-black mb-3">Đặt hàng thành công!</h2>
        <p className="text-foreground-muted mb-8">
          Cảm ơn bạn đã đặt hàng. Chúng tôi sẽ xác nhận đơn hàng trong vòng 15
          phút.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/"
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          Trang chủ
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/cart" className="hover:text-primary transition-colors">
          Giỏ hàng
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">Thanh toán</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Shipping Info */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Thông tin giao hàng</h3>
            </div>

            {/* Saved address selector (logged-in only) */}
            {isLoggedIn && (
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-foreground">Địa chỉ đã lưu</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAVED_ADDRESSES.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => { setSelectedAddress(addr.id); setShowNewAddress(false); }}
                      className={`text-left p-3 rounded-lg border-2 transition-colors ${selectedAddress === addr.id && !showNewAddress ? "border-primary bg-primary/5" : "border-gray-200 dark:border-border hover:border-gray-300"}`}
                    >
                      <span className="text-xs font-bold text-primary">{addr.label}</span>
                      <p className="text-sm text-gray-700 dark:text-foreground mt-0.5">{addr.detail}</p>
                      <p className="text-[11px] text-foreground-muted">{addr.name} · {addr.phone}</p>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => { setShowNewAddress(true); setSelectedAddress(null); }}
                  className={`text-sm font-medium ${showNewAddress ? "text-primary" : "text-foreground-muted hover:text-primary"} transition-colors`}
                >
                  + Nhập địa chỉ mới
                </button>
              </div>
            )}

            {/* Address form (always show for guest, toggle for logged-in) */}
            {showNewAddress && (
              <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="checkout-name" className="block text-sm font-medium mb-2">
                    Họ và tên *
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-phone" className="block text-sm font-medium mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    placeholder="0901 234 567"
                    className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="checkout-email" className="block text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                />
              </div>
              <div>
                <label htmlFor="checkout-address" className="block text-sm font-medium mb-2">
                  Địa chỉ giao hàng *
                </label>
                <textarea
                  id="checkout-address"
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  rows={3}
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none resize-none"
                />
              </div>
              <div>
                <label htmlFor="checkout-note" className="block text-sm font-medium mb-2">
                  Ghi chú
                </label>
                <input
                  id="checkout-note"
                  type="text"
                  placeholder="Ví dụ: Giao ngoài giờ hành chính"
                  className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                />
              </div>
            </div>
            )}
          </div>

          {/* Guest OTP Verification — UC-21 */}
          {!isLoggedIn && (
            <div className="bg-white dark:bg-surface border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Smartphone className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg text-foreground">Xác minh số điện thoại</h3>
              </div>
              <p className="text-sm text-foreground-muted mb-4">
                Bạn đang mua hàng với tư cách khách. Vui lòng xác minh SĐT bằng mã OTP để hoàn tất đơn hàng.
              </p>
              {!otpSent ? (
                <button type="button" onClick={() => setOtpSent(true)} className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
                  Gửi mã OTP
                </button>
              ) : !otpVerified ? (
                <div className="space-y-3">
                  <p className="text-sm text-success font-medium">✅ Mã OTP đã gửi đến SĐT của bạn</p>
                  <div className="flex gap-3 items-end">
                    <div>
                      <label htmlFor="checkout-otp" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">Nhập mã OTP (6 số)</label>
                      <input
                        id="checkout-otp"
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                        placeholder="123456"
                        className="w-36 px-4 py-2.5 text-center text-lg font-bold tracking-widest border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                      />
                    </div>
                    <button type="button" onClick={() => otpCode.length === 6 && setOtpVerified(true)} disabled={otpCode.length !== 6} className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50 transition-opacity">
                      Xác minh
                    </button>
                    <button type="button" onClick={() => setOtpSent(false)} className="text-sm text-foreground-muted hover:underline">
                      Gửi lại
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-success font-medium text-sm">
                  <CheckCircle2 className="w-5 h-5" />
                  Số điện thoại đã xác minh thành công!
                </div>
              )}
            </div>
          )}

          {/* Payment Method */}
          <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <CreditCard className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-lg">Phương thức thanh toán</h3>
            </div>
            <div className="space-y-3">
              <label
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  paymentMethod === "COD"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="accent-primary w-4 h-4"
                />
                <Banknote className="w-5 h-5 text-foreground-muted" />
                <div>
                  <p className="font-bold text-sm">
                    Thanh toán khi nhận hàng (COD)
                  </p>
                  <p className="text-xs text-foreground-muted">
                    Thanh toán bằng tiền mặt khi nhận được hàng
                  </p>
                </div>
              </label>
              <label
                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                  paymentMethod === "BANK"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "BANK"}
                  onChange={() => setPaymentMethod("BANK")}
                  className="accent-primary w-4 h-4"
                />
                <CreditCard className="w-5 h-5 text-foreground-muted" />
                <div>
                  <p className="font-bold text-sm">Chuyển khoản ngân hàng</p>
                  <p className="text-xs text-foreground-muted">
                    Quét mã QR để thanh toán trước
                  </p>
                </div>
              </label>
            </div>

            {/* VietQR Mock — chỉ hiện khi chọn BANK */}
            {paymentMethod === "BANK" && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-background-light rounded-xl border border-gray-200 dark:border-border space-y-3">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-primary" />
                  <span className="font-bold text-sm text-gray-900 dark:text-foreground">Quét mã VietQR để thanh toán</span>
                </div>
                {/* Mock QR Code */}
                <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-300 rounded-xl flex items-center justify-center relative">
                  <div className="grid grid-cols-5 gap-1">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div key={i} className={`w-6 h-6 rounded-sm ${[0,1,4,5,6,9,10,14,15,19,20,21,24].includes(i) ? "bg-gray-800" : "bg-white border border-gray-200"}`} />
                    ))}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-white px-1 text-[10px] font-bold text-primary">VietQR</span>
                  </div>
                </div>
                <div className="text-center text-xs text-gray-500 dark:text-foreground-muted space-y-1">
                  <p>Ngân hàng: <strong>Vietcombank</strong></p>
                  <p>STK: <strong>0123 456 789</strong></p>
                  <p>Chủ TK: <strong>CONG TY CAP NONG</strong></p>
                  <p>Số tiền: <strong className="text-primary">{formatCurrency(total)}</strong></p>
                  <p className="text-[10px] italic">Sau khi chuyển khoản, đơn hàng sẽ được xác nhận thủ công</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-border rounded-xl p-6 sticky top-24 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Đơn hàng của bạn</h3>
            <div className="space-y-3 text-sm border-b border-border pb-4 mb-4">
              <div className="flex justify-between">
                <span className="text-foreground-muted">Tạm tính</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-muted">Phí giao hàng</span>
                <span className="font-medium">{formatCurrency(shippingFee)}</span>
              </div>
            </div>
            <div className="flex justify-between mb-6">
              <span className="font-bold text-base">Tổng thanh toán</span>
              <span className="font-bold text-2xl text-primary">
                {formatCurrency(total)}
              </span>
            </div>

            <button type="button"
              onClick={() => setSubmitted(true)}
              className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 text-base"
            >
              Đặt hàng
            </button>

            <div className="flex items-center gap-2 text-xs text-foreground-muted mt-4 justify-center">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span>Bảo mật thanh toán bởi Cạp Nông</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
