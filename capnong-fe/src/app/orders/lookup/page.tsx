"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Package,
  ArrowLeft,
  CheckCircle2,
  Truck,
  Clock,
  Phone,
  MapPin,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "PENDING", label: "Đặt hàng" },
  { status: "CONFIRMED", label: "Xác nhận" },
  { status: "PREPARING", label: "Chuẩn bị" },
  { status: "SHIPPED", label: "Đang giao" },
  { status: "DELIVERED", label: "Đã nhận" },
];

const STATUS_ORDER: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"];

/* Mock: chỉ trả kết quả khi SĐT = 0901234567, mã = CN-0042 */
const MOCK_RESULT = {
  id: "#CN-0042",
  status: "SHIPPED" as OrderStatus,
  date: "20/03/2026",
  total: 325000,
  seller_name: "Vườn Xoài Bác Ba",
  items: [
    { name: "Xoài Cát Hòa Lộc", qty: 2, price: 95000 },
    { name: "Cam Sành Hà Giang", qty: 3, price: 45000 },
  ],
  shipping_address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
};

export default function OrderLookupPage() {
  const [phone, setPhone] = useState("");
  const [orderId, setOrderId] = useState("");
  const [result, setResult] = useState<typeof MOCK_RESULT | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setNotFound(false);
    setResult(null);
    try {
      const { orderService } = await import("@/services");
      const orders = await orderService.getMyOrders();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const match = (orders as any[]).find((o: any) => {
        const code = (o.orderCode || o.id || "").replace(/[#\s]/g, "").toUpperCase();
        return code === orderId.replace(/[#\s]/g, "").toUpperCase();
      });
      if (match) {
        setResult({
          id: match.orderCode || match.id,
          status: (match.status || "PENDING") as OrderStatus,
          date: match.createdAt ? new Date(match.createdAt).toLocaleDateString("vi-VN") : "—",
          total: match.totalAmount || 0,
          seller_name: match.items?.[0]?.shopName || match.sellerName || "Nhà vườn",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items: (match.items || []).map((i: any) => ({ name: i.productName || "SP", qty: i.quantity || 1, price: i.pricePerUnit || 0 })),
          shipping_address: match.shippingAddress || match.streetAddress || "—",
        });
      } else {
        // Fallback to mock for demo
        if (phone.replace(/\s/g, "") === "0901234567" && orderId.replace(/[#\s]/g, "").toUpperCase() === "CN-0042") {
          setResult(MOCK_RESULT);
        } else {
          setNotFound(true);
        }
      }
    } catch {
      // API fail → fallback mock
      if (phone.replace(/\s/g, "") === "0901234567" && orderId.replace(/[#\s]/g, "").toUpperCase() === "CN-0042") {
        setResult(MOCK_RESULT);
      } else {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const currentStepIdx = result ? STATUS_ORDER.indexOf(result.status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-surface-hover rounded-full transition-colors" aria-label="Quay lại trang chủ">
          <ArrowLeft className="w-5 h-5 text-foreground-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground">Tra cứu đơn hàng</h1>
          <p className="text-sm text-foreground-muted">Không cần đăng nhập — chỉ cần SĐT và mã đơn</p>
        </div>
      </div>

      {/* Search form */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lookup-phone" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Số điện thoại đặt hàng
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="lookup-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901 234 567"
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div>
            <label htmlFor="lookup-order" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
              Mã đơn hàng
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="lookup-order"
                type="text"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="CN-0042"
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleSearch}
          disabled={!phone || !orderId || loading}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          <Search className="w-4 h-4" />
          {loading ? "Đang tìm..." : "Tra cứu"}
        </button>
      </div>

      {/* Not found */}
      {notFound && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5 text-center">
          <Package className="w-10 h-10 text-red-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-red-700 dark:text-red-300">Không tìm thấy đơn hàng</p>
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">Vui lòng kiểm tra lại SĐT và mã đơn hàng</p>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6 space-y-6">
          {/* Order header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg text-gray-900 dark:text-foreground">{result.id}</span>
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  🚚 Đang giao
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-foreground-muted mt-0.5">{result.seller_name} · {result.date}</p>
            </div>
            <span className="font-bold text-primary text-lg">{formatCurrency(result.total)}</span>
          </div>

          {/* Progress tracker */}
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => {
              const done = i <= currentStepIdx;
              const isCurrent = i === currentStepIdx;
              return (
                <div key={step.status} className="flex flex-col items-center flex-1 relative">
                  {i > 0 && (
                    <div className={`absolute top-4 right-1/2 w-full h-0.5 ${i <= currentStepIdx ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                    done ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400"
                  } ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                    {done ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] mt-1.5 font-medium ${done ? "text-primary" : "text-gray-400"}`}>{step.label}</span>
                </div>
              );
            })}
          </div>

          {/* Items */}
          <div>
            <h4 className="text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase mb-2">Sản phẩm</h4>
            <div className="space-y-2">
              {result.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-700 dark:text-foreground">{item.name} × {item.qty}</span>
                  <span className="font-medium text-gray-900 dark:text-foreground">{formatCurrency(item.price * item.qty)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-foreground-muted">
            <MapPin className="w-4 h-4 text-primary" />
            {result.shipping_address}
          </div>
        </div>
      )}

      {/* Hint */}
      {process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true" && (
      <p className="text-center text-xs text-foreground-muted">
        Demo: SĐT <code className="bg-gray-100 dark:bg-surface px-1.5 py-0.5 rounded text-primary font-mono">0901234567</code>, mã
        <code className="bg-gray-100 dark:bg-surface px-1.5 py-0.5 rounded text-primary font-mono ml-1">CN-0042</code>
      </p>
      )}
    </div>
  );
}
