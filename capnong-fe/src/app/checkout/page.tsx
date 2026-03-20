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
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BANK">("COD");
  const [submitted, setSubmitted] = useState(false);

  const subtotal = 185000;
  const shippingFee = 0;
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
          </div>

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
                <span className="text-success font-medium">Miễn phí</span>
              </div>
            </div>
            <div className="flex justify-between mb-6">
              <span className="font-bold text-base">Tổng thanh toán</span>
              <span className="font-bold text-2xl text-primary">
                {formatCurrency(total)}
              </span>
            </div>

            <button
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
