"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  Truck,
  Package,
  PackageCheck,
  XCircle,
  Phone,
  MapPin,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STEPS: { status: OrderStatus; label: string; icon: typeof CheckCircle2 }[] = [
  { status: "PENDING", label: "Đặt hàng", icon: Package },
  { status: "CONFIRMED", label: "Xác nhận", icon: CheckCircle2 },
  { status: "PREPARING", label: "Chuẩn bị", icon: Package },
  { status: "SHIPPED", label: "Giao hàng", icon: Truck },
  { status: "DELIVERED", label: "Đã nhận", icon: PackageCheck },
];

const STATUS_ORDER: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"];

const NEXT_STATUS: Partial<Record<OrderStatus, { next: OrderStatus; label: string }>> = {
  PENDING: { next: "CONFIRMED", label: "Xác nhận đơn" },
  CONFIRMED: { next: "PREPARING", label: "Bắt đầu chuẩn bị" },
  PREPARING: { next: "SHIPPED", label: "Giao hàng" },
  SHIPPED: { next: "DELIVERED", label: "Đã giao thành công" },
};

const MOCK_ORDER = {
  id: "#CN-0042",
  status: "PENDING" as OrderStatus,
  date: "20/03/2026 14:30",
  buyer: { name: "Nguyễn Thu Hà", phone: "0901345567", address: "123 Nguyễn Huệ, Quận 1, TP.HCM" },
  items: [
    { name: "Xoài Cát Hòa Lộc", qty: 2, price: 95000, image: "/images/products/xoai-cat.png" },
    { name: "Cam Sành Hà Giang", qty: 3, price: 45000, image: "/images/products/cam-sanh.png" },
  ],
  shipping_fee: 25000,
  note: "Giao buổi sáng, gọi trước khi giao.",
};

export default function SellerOrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState(MOCK_ORDER);
  const [sellerNote, setSellerNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const { orderService } = await import("@/services");
        const orders = await orderService.getMyOrders();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const found = (orders as any[]).find((o: any) => {
          const code = String(o.orderCode || o.id || "").replace(/[#\s]/g, "");
          return code === orderId.replace(/[#\s]/g, "");
        });
        if (found) {
          setOrder({
            id: `#${found.orderCode || found.id}`,
            status: (found.status || "PENDING") as OrderStatus,
            date: found.createdAt ? new Date(found.createdAt).toLocaleString("vi-VN") : MOCK_ORDER.date,
            buyer: {
              name: found.buyerName || found.guestName || "Khách hàng",
              phone: found.buyerPhone || found.guestPhone || "",
              address: found.shippingAddress || found.streetAddress || "",
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            items: (found.items || []).map((i: any) => ({
              name: i.productName || "SP",
              qty: i.quantity || 1,
              price: i.pricePerUnit || 0,
              image: i.productImage || "/images/products/xoai-cat.png",
            })),
            shipping_fee: found.shippingFee || 25000,
            note: found.orderNotes || "",
          });
        }
      } catch { /* keep mock */ }
      setLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  const subtotal = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const total = subtotal + order.shipping_fee;
  const currentStepIdx = STATUS_ORDER.indexOf(order.status);
  const ns = NEXT_STATUS[order.status];

  const handleAdvance = async () => {
    if (!ns) return;
    // Optimistic
    setOrder((prev) => ({ ...prev, status: ns.next }));
    try {
      // If BE has status update endpoint — call it
      const api = (await import("@/services/api")).default;
      await api.patch(`/api/orders/${orderId.replace(/#/g, "")}/status`, { status: ns.next });
    } catch { /* optimistic UI already updated */ }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/orders" className="p-2 hover:bg-gray-100 dark:hover:bg-surface-hover rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground-muted" />
        </Link>
        <div>
          <h1 className="text-xl font-black text-foreground">Chi tiết đơn hàng {order.id}</h1>
          <p className="text-xs text-foreground-muted mt-0.5">Ngày đặt: {order.date}</p>
        </div>
      </div>

      {/* Progress */}
      {order.status !== "CANCELLED" && (
        <div className="bg-white dark:bg-surface rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => {
              const done = i <= currentStepIdx;
              const isCurrent = i === currentStepIdx;
              return (
                <div key={step.status} className="flex flex-col items-center flex-1 relative">
                  {i > 0 && (
                    <div className={`absolute top-4 right-1/2 w-full h-0.5 ${i <= currentStepIdx ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`} />
                  )}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${done ? "bg-primary text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-400"} ${isCurrent ? "ring-4 ring-primary/20" : ""}`}>
                    <step.icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] mt-1.5 font-medium ${done ? "text-primary" : "text-gray-400"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Action button */}
          {ns && (
            <div className="mt-4 text-center">
              <button type="button" onClick={handleAdvance} className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-primary-light transition-colors shadow-md shadow-primary/20">
                {ns.label}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Buyer info */}
      <div className="bg-white dark:bg-surface rounded-xl border border-border p-5 space-y-3">
        <h3 className="text-sm font-bold text-foreground-muted uppercase tracking-wider">Thông tin người mua</h3>
        <div className="space-y-2 text-sm">
          <p className="font-bold text-foreground">{order.buyer.name}</p>
          <p className="flex items-center gap-2 text-foreground-muted">
            <Phone className="w-4 h-4" /> {order.buyer.phone}
          </p>
          <p className="flex items-center gap-2 text-foreground-muted">
            <MapPin className="w-4 h-4 text-primary" /> {order.buyer.address}
          </p>
        </div>
        {order.note && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg text-sm text-yellow-700 dark:text-yellow-300 border-l-2 border-yellow-400">
            <span className="font-bold">Ghi chú:</span> {order.note}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="bg-white dark:bg-surface rounded-xl border border-border p-5">
        <h3 className="text-sm font-bold text-foreground-muted uppercase tracking-wider mb-3">Sản phẩm</h3>
        <div className="space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-lg bg-gray-50 dark:bg-background-light overflow-hidden shrink-0">
                <Image src={item.image} alt={item.name} width={56} height={56} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground text-sm">{item.name}</p>
                <p className="text-xs text-foreground-muted">SL: {item.qty} × {formatCurrency(item.price)}</p>
              </div>
              <p className="font-bold text-sm text-foreground">{formatCurrency(item.price * item.qty)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-border space-y-1 text-sm">
          <div className="flex justify-between text-foreground-muted">
            <span>Tạm tính</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-foreground-muted">
            <span>Phí vận chuyển</span>
            <span>{formatCurrency(order.shipping_fee)}</span>
          </div>
          <div className="flex justify-between font-bold text-foreground text-base pt-1">
            <span>Tổng cộng</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Seller note */}
      <div className="bg-white dark:bg-surface rounded-xl border border-border p-5">
        <h3 className="text-sm font-bold text-foreground-muted uppercase tracking-wider mb-3">Ghi chú nội bộ</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={sellerNote}
            onChange={(e) => setSellerNote(e.target.value)}
            placeholder="Ghi chú cho đơn hàng này..."
            className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white dark:bg-background"
          />
          <button type="button" aria-label="Gửi ghi chú" title="Gửi ghi chú" className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors">
            <MessageSquare className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
