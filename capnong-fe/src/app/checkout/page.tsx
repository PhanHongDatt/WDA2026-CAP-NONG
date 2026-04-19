"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
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
  Store,
  Package,
  Loader2,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { cartService, orderService } from "@/services";
import type { CartItem } from "@/services";
import { getProvinces, getWards, type Province, type Ward } from "@/services/api/address";
import { useToast } from "@/components/ui/Toast";

/* Mock saved addresses */
const SAVED_ADDRESSES = [
  { id: 1, label: "Nhà", detail: "123 Nguyễn Huệ, Quận 1, TP.HCM", name: "Nguyễn Văn A", phone: "0901234567" },
  { id: 2, label: "Cơ quan", detail: "456 Lê Lợi, Quận 3, TP.HCM", name: "Nguyễn Văn A", phone: "0901234567" },
];

/** Group cart items by shop → sub-orders */
interface SubOrder {
  shopSlug: string;
  shopName: string;
  shopProvince: string;
  items: CartItem[];
  subtotal: number;
}

function groupByShop(items: CartItem[]): SubOrder[] {
  const map = new Map<string, SubOrder>();
  for (const item of items) {
    const slug = item.product?.shop?.slug || "unknown";
    if (!map.has(slug)) {
      map.set(slug, {
        shopSlug: slug,
        shopName: item.product?.shop?.name || "Nhà vườn",
        shopProvince: item.product?.shop?.province || "",
        items: [],
        subtotal: 0,
      });
    }
    const group = map.get(slug)!;
    group.items.push(item);
    const price = item.product?.price_per_unit || 0;
    group.subtotal += price * item.quantity;
  }
  return Array.from(map.values());
}

export default function CheckoutPage() {
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "BANK">("COD");
  const [submitted, setSubmitted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [selectedAddress, setSelectedAddress] = useState<number | null>(isLoggedIn ? 1 : null);
  const [showNewAddress, setShowNewAddress] = useState(!isLoggedIn);

  /* ── Form fields (controlled) ── */
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formAddress, setFormAddress] = useState(""); // This is street address
  const [formProvinceCode, setFormProvinceCode] = useState<number | "">("");
  const [formWardCode, setFormWardCode] = useState<number | "">("");
  const [formNote, setFormNote] = useState("");

  /* ── Address Data ── */
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  useEffect(() => {
    getProvinces().then(setProvinces).catch(() => {});
  }, []);

  useEffect(() => {
    if (formProvinceCode) {
      getWards(formProvinceCode as number).then(setWards).catch(() => {});
      setFormWardCode("");
    } else {
      setWards([]);
      setFormWardCode("");
    }
  }, [formProvinceCode]);

  /* ── Submit state ── */
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [createdOrderCode, setCreatedOrderCode] = useState<string>("");
  const [createdOrderPhone, setCreatedOrderPhone] = useState<string>("");

  /* ── Cart data ── */
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCart() {
      try {
        const items = await cartService.getCart();
        setCartItems(items);
      } catch {
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, []);

  const subOrders = useMemo(() => groupByShop(cartItems), [cartItems]);
  const subtotal = useMemo(() => cartItems.reduce((s, i) => s + (i.product?.price_per_unit || 0) * i.quantity, 0), [cartItems]);
  const shippingFee = cartItems.length > 0 ? 30000 * subOrders.length : 0; // phí ship mỗi shop
  const total = subtotal + shippingFee;

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-primary" />
        </div>
        <h2 className="text-3xl font-black mb-3">Đặt hàng thành công!</h2>
        <p className="text-foreground-muted mb-2">
          Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được tách thành{" "}
          <strong className="text-primary">{subOrders.length} đơn hàng con</strong> theo từng nhà vườn.
        </p>
        <p className="text-foreground-muted mb-8">
          Chúng tôi sẽ xác nhận đơn hàng trong vòng 15 phút.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href={isLoggedIn ? "/orders" : `/orders/lookup?code=${createdOrderCode}&phone=${createdOrderPhone}`}
            className="border-2 border-primary text-primary px-8 py-3 rounded-xl font-bold hover:bg-primary/5 transition-colors"
          >
            Xem đơn hàng
          </Link>
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

      {/* Empty cart */}
      {!loading && cartItems.length === 0 && (
        <div className="text-center py-20">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Giỏ hàng trống</h2>
          <p className="text-foreground-muted mb-6">Bạn chưa có sản phẩm nào để thanh toán.</p>
          <Link href="/catalog" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors">
            Khám phá sản phẩm
          </Link>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-foreground-muted">Đang tải giỏ hàng...</p>
        </div>
      )}

      {!loading && cartItems.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Form + Sub-orders */}
          <div className="lg:col-span-3 space-y-6">

            {/* ── Sub-orders by shop ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-lg">
                  Đơn hàng ({subOrders.length} nhà vườn)
                </h3>
              </div>

              {subOrders.map((sub, idx) => (
                <div key={sub.shopSlug} className="bg-white dark:bg-surface border border-border rounded-xl overflow-hidden shadow-sm">
                  {/* Shop header */}
                  <div className="flex items-center gap-3 px-5 py-3 bg-primary/5 border-b border-border">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Store className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-foreground">
                        Đơn hàng #{idx + 1} — {sub.shopName}
                      </p>
                      {sub.shopProvince && (
                        <p className="text-[11px] text-foreground-muted flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {sub.shopProvince}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="divide-y divide-gray-100 dark:divide-border">
                    {sub.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                          <Image
                            src={item.product?.images?.[0] || "/placeholder.jpg"}
                            alt={item.productName || item.product?.name || "Sản phẩm"}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-foreground truncate">
                            {item.product?.name || "Sản phẩm"}
                          </p>
                          <p className="text-xs text-foreground-muted">
                            {formatCurrency(item.product?.price_per_unit || 0)} × {item.quantity} {item.product?.unit?.symbol || "kg"}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-primary whitespace-nowrap">
                          {formatCurrency((item.product?.price_per_unit || 0) * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Sub-order total */}
                  <div className="flex justify-between items-center px-5 py-3 bg-gray-50 dark:bg-background-light border-t border-border">
                    <span className="text-xs text-foreground-muted">Tạm tính đơn #{idx + 1}</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-foreground">
                      {formatCurrency(sub.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping Info */}
            <div className="bg-white dark:bg-surface border border-border rounded-xl p-6 shadow-sm">
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

              {/* Address form */}
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
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
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
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
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
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tỉnh/Thành phố *</label>
                    <select
                      value={formProvinceCode}
                      onChange={(e) => setFormProvinceCode(e.target.value ? Number(e.target.value) : "")}
                      className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none cursor-pointer"
                    >
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      {provinces.map(p => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Quận/Huyện/Xã *</label>
                    <select
                      value={formWardCode}
                      onChange={(e) => setFormWardCode(e.target.value ? Number(e.target.value) : "")}
                      disabled={!formProvinceCode || wards.length === 0}
                      className="w-full px-4 py-3 text-sm border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors outline-none cursor-pointer disabled:bg-gray-100 disabled:opacity-50"
                    >
                      <option value="">Chọn Xã/Phường</option>
                      {wards.map(w => (
                        <option key={w.code} value={w.code}>{w.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label htmlFor="checkout-address" className="block text-sm font-medium mb-2">
                    Địa chỉ cụ thể (Số nhà, Tên đường) *
                  </label>
                  <textarea
                    id="checkout-address"
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    rows={3}
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
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
                    value={formNote}
                    onChange={(e) => setFormNote(e.target.value)}
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
                  <button type="button" onClick={async () => {
                    if (!formPhone) {
                      showToast("error", "Vui lòng nhập số điện thoại ở trên trước.");
                      return;
                    }
                    try {
                      const { default: api } = await import("@/services/api");
                      await api.post("/api/otp/send", { phone: formPhone });
                      setOtpSent(true);
                      showToast("success", "Mã OTP đã được gửi!");
                    } catch (err: any) {
                      showToast("error", err.response?.data?.message || "Lỗi khi gửi mã OTP");
                    }
                  }} className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
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
            <div className="bg-white dark:bg-surface border border-border rounded-xl p-6 shadow-sm">
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

              {/* VietQR Mock */}
              {paymentMethod === "BANK" && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-background-light rounded-xl border border-gray-200 dark:border-border space-y-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-primary" />
                    <span className="font-bold text-sm text-gray-900 dark:text-foreground">Quét mã VietQR để thanh toán</span>
                  </div>
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
            <div className="bg-white dark:bg-surface border border-border rounded-xl p-6 sticky top-24 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Tổng đơn hàng</h3>

              {/* Sub-order breakdown */}
              <div className="space-y-2 text-sm border-b border-border pb-4 mb-3">
                {subOrders.map((sub, idx) => (
                  <div key={sub.shopSlug} className="flex justify-between">
                    <span className="text-foreground-muted truncate mr-2">
                      Đơn #{idx + 1} ({sub.items.length} sp)
                    </span>
                    <span className="whitespace-nowrap">{formatCurrency(sub.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm border-b border-border pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-foreground-muted">Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground-muted">
                    Phí giao hàng ({subOrders.length} đơn × 30.000đ)
                  </span>
                  <span className="font-medium">{formatCurrency(shippingFee)}</span>
                </div>
              </div>
              <div className="flex justify-between mb-6">
                <span className="font-bold text-base">Tổng thanh toán</span>
                <span className="font-bold text-2xl text-primary">
                  {formatCurrency(total)}
                </span>
              </div>

              {submitError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
                  {submitError}
                </div>
              )}

              <button type="button"
                disabled={submitting}
                onClick={async () => {
                  setSubmitError(null);
                  setSubmitting(true);
                  try {
                    const addr = selectedAddress && !showNewAddress
                      ? SAVED_ADDRESSES.find((a) => a.id === selectedAddress)
                      : null;
                    const finalPhone = addr ? addr.phone : formPhone;
                    const result = await orderService.checkout({
                      guestName: addr ? addr.name : formName,
                      guestPhone: finalPhone,
                      guestEmail: formEmail || undefined,
                      streetAddress: addr ? addr.detail : formAddress,
                      wardCode: (!addr && formWardCode) ? String(formWardCode) : undefined,
                      provinceCode: (!addr && formProvinceCode) ? String(formProvinceCode) : undefined,
                      orderNotes: formNote || undefined,
                      otpCode: otpCode || undefined,
                      paymentMethod: paymentMethod === 'BANK' ? 'VIET_QR' : 'COD'
                    }) as any;
                    
                    setCreatedOrderCode(result?.orderCode || result?.order_code || "");
                    setCreatedOrderPhone(finalPhone);
                    
                    setSubmitted(true);
                    window.dispatchEvent(new Event("cartUpdated"));
                    showToast("success", "Đặt hàng thành công!");
                  } catch (err: any) {
                    const msg = err.response?.data?.message || err.message || "Đặt hàng thất bại. Vui lòng thử lại.";
                    setSubmitError(msg);
                    showToast("error", msg);
                  } finally {
                    setSubmitting(false);
                  }
                }}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary-light transition-colors shadow-lg shadow-primary/20 text-base disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Đang xử lý...</span>
                ) : (
                  <>Đặt hàng ({cartItems.length} sản phẩm)</>
                )}
              </button>

              <div className="flex items-center gap-2 text-xs text-foreground-muted mt-4 justify-center">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Bảo mật thanh toán bởi Cạp Nông</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
