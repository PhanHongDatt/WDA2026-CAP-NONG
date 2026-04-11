"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  XCircle,
  MapPin,
  Phone,
  ChevronDown,
  Star,
  MessageSquare,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import EmojiPicker from "@/components/ui/EmojiPicker";

type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STEPS: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: "PENDING", label: "Đặt hàng", icon: Clock },
  { status: "CONFIRMED", label: "Xác nhận", icon: CheckCircle2 },
  { status: "PREPARING", label: "Chuẩn bị", icon: Package },
  { status: "SHIPPED", label: "Đang giao", icon: Truck },
  { status: "DELIVERED", label: "Đã nhận", icon: CheckCircle2 },
];

const STATUS_ORDER: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"];

const MOCK_BUYER_ORDERS: {
  id: string; status: OrderStatus; date: string; total: number;
  seller_name: string; seller_phone: string;
  items: { name: string; qty: number; price: number; image_url?: string }[];
  shipping_address: string;
  cancel_reason?: string;
}[] = [
  {
    id: "#CN-0042",
    status: "SHIPPED",
    date: "20/03/2026",
    total: 325000,
    seller_name: "Vườn Xoài Bác Ba",
    seller_phone: "0912***678",
    items: [
      { name: "Xoài Cát Hòa Lộc", qty: 2, price: 95000, image_url: "/images/products/xoai.jpg" },
      { name: "Cam Sành Hà Giang", qty: 3, price: 45000, image_url: "/images/products/cam.jpg" },
    ],
    shipping_address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
  },
  {
    id: "#CN-0039",
    status: "DELIVERED",
    date: "15/03/2026",
    total: 450000,
    seller_name: "HTX Cam Sành Hà Giang",
    seller_phone: "0934***654",
    items: [
      { name: "Cam Sành Hà Giang", qty: 10, price: 45000, image_url: "/images/products/cam.jpg" },
    ],
    shipping_address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
  },
  {
    id: "#CN-0035",
    status: "CANCELLED",
    date: "08/03/2026",
    total: 95000,
    seller_name: "Vườn Xoài Bác Ba",
    seller_phone: "0912***678",
    items: [
      { name: "Xoài Cát Hòa Lộc", qty: 1, price: 95000, image_url: "/images/products/xoai.jpg" },
    ],
    shipping_address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    cancel_reason: "Người mua yêu cầu hủy — đặt nhầm sản phẩm",
  },
];

function BuyerOrderContent() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [orders, setOrders] = useState(MOCK_BUYER_ORDERS);
  const [loadingOrders, setLoadingOrders] = useState(true);

  /* Fetch real orders from API, fallback to mock */
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const { orderService } = await import("@/services");
      const apiOrders = await orderService.getMyOrders();
      if (Array.isArray(apiOrders) && apiOrders.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = apiOrders.map((o: any) => ({
          id: o.orderCode || o.id || "#???",
          status: (o.status || "PENDING") as OrderStatus,
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("vi-VN") : "—",
          total: o.totalAmount || 0,
          seller_name: o.items?.[0]?.shopName || o.sellerName || "Nhà vườn",
          seller_phone: o.sellerPhone || "—",
          items: (o.items || []).map((item: any) => ({
            name: item.productName || item.name || "Sản phẩm",
            qty: item.quantity || 1,
            price: item.pricePerUnit || item.price || 0,
            image_url: item.imageUrl || item.image_url,
          })),
          shipping_address: o.shippingAddress || o.streetAddress || "—",
          cancel_reason: o.cancelReason,
        }));
        setOrders(mapped);
        setExpandedId(mapped[0]?.id || null);
      } else {
        setExpandedId(MOCK_BUYER_ORDERS[0]?.id || null);
      }
    } catch {
      /* keep mock data */
      setExpandedId(MOCK_BUYER_ORDERS[0]?.id || null);
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  /* UC-27: Review state */
  const [reviewingOrderId, setReviewingOrderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewedOrders, setReviewedOrders] = useState<Set<string>>(new Set());
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const reviewFileRef = useRef<HTMLInputElement>(null);

  const handleSubmitReview = async (orderId: string) => {
    if (reviewRating === 0 || reviewComment.length < 10) return;
    // Optimistic UI update
    setReviewedOrders((prev) => new Set(prev).add(orderId));
    setReviewingOrderId(null);
    const savedRating = reviewRating;
    const savedComment = reviewComment;
    const savedImages = [...reviewImages];
    setReviewRating(0);
    setReviewComment("");
    setReviewImages([]);
    // Call API in background
    try {
      const { createReview } = await import("@/services/api/review");
      // Find the order to get product/item IDs
      const order = orders.find((o) => o.id === orderId);
      const firstItem = order?.items?.[0];
      await createReview({
        productId: (firstItem as unknown as { productId?: string })?.productId || orderId,
        orderItemId: orderId,
        rating: savedRating,
        comment: savedComment,
        images: savedImages.length > 0 ? savedImages : undefined,
      });
    } catch {
      /* optimistic — UI already updated, silent fail */
    }
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-surface-hover rounded-full transition-colors" aria-label="Quay lại trang chủ">
          <ArrowLeft className="w-5 h-5 text-foreground-muted" />
        </Link>
        <h1 className="text-2xl font-black text-foreground">Đơn hàng của tôi</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {[
          { value: "all", label: "Tất cả" },
          { value: "SHIPPED", label: "🚚 Đang giao" },
          { value: "DELIVERED", label: "✔️ Đã nhận" },
          { value: "CANCELLED", label: "❌ Đã hủy" },
        ].map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={
              filter === f.value
                ? "whitespace-nowrap rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
                : "whitespace-nowrap rounded-full bg-white dark:bg-surface border border-border px-5 py-2 text-sm font-medium hover:border-primary transition-colors"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loadingOrders && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-foreground-muted text-sm">Đang tải đơn hàng...</p>
        </div>
      )}

      {/* Orders */}
      {!loadingOrders && (
      <>
      <div className="space-y-4">
        {filtered.map((order) => {
          const expanded = expandedId === order.id;
          const isCancelled = order.status === "CANCELLED";
          const currentStepIdx = STATUS_ORDER.indexOf(order.status);

          return (
            <div key={order.id} className="bg-white dark:bg-surface rounded-2xl border border-gray-100 dark:border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
              {/* Order header - clickable */}
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : order.id)}
                className="w-full text-left p-5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-900 dark:text-foreground">{order.id}</span>
                      <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        isCancelled ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                        : order.status === "DELIVERED" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                      }`}>
                        {isCancelled ? "❌ Đã hủy" : order.status === "DELIVERED" ? "✔️ Đã nhận" : "🚚 Đang giao"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-foreground-muted mt-0.5">
                      {order.seller_name} · {order.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary">{formatCurrency(order.total)}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                </div>
              </button>

              {/* Expanded detail — ticket-notch separator */}
              {expanded && (
                <>
                  {/* Tear line — phiếu thu nông sản */}
                  <div className="ticket-notch relative mx-0 overflow-hidden">
                    <div className="border-t-2 border-dashed border-gray-200 dark:border-gray-600 mx-6" />
                  </div>
                  <div className="p-5 space-y-6">
                  {/* Progress tracker */}
                  {!isCancelled && (
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
                              <step.icon className="w-4 h-4" />
                            </div>
                            <span className={`text-[10px] mt-1.5 font-medium ${done ? "text-primary" : "text-gray-400"}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {isCancelled && (
                    <div className="flex items-start gap-3 p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg">
                      <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">Đơn hàng này đã bị hủy</p>
                        {order.cancel_reason && (
                          <p className="text-xs text-red-500/80 dark:text-red-300/70 mt-1">
                            Lý do: {order.cancel_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase mb-2">Sản phẩm</h4>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          {item.image_url && (
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                              <Image src={item.image_url} alt={item.name} width={40} height={40} className="w-full h-full object-cover" />
                            </div>
                          )}
                          <div className="flex justify-between flex-1 text-sm">
                            <span className="text-gray-700 dark:text-foreground">{item.name} × {item.qty}</span>
                            <span className="font-medium text-gray-900 dark:text-foreground">{formatCurrency(item.price * item.qty)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Seller + shipping */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                      <h4 className="text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Người bán</h4>
                      <p className="text-gray-900 dark:text-foreground font-medium">{order.seller_name}</p>
                      <p className="text-gray-500 dark:text-foreground-muted flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {order.seller_phone}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Giao đến</h4>
                      <p className="text-gray-700 dark:text-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" /> {order.shipping_address}
                      </p>
                    </div>
                  </div>

                  {/* UC-27: Review section (only for DELIVERED) */}
                  {order.status === "DELIVERED" && (
                    <div className="border-t border-gray-100 dark:border-border pt-4">
                      {reviewedOrders.has(order.id) ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[1,2,3,4,5].map((s) => <Star key={s} className={`w-4 h-4 ${s <= 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />)}
                            </div>
                            <span className="text-xs text-foreground-muted">Đã đánh giá</span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-foreground">Sản phẩm rất tươi ngon, đóng gói cẩn thận. Sẽ mua lại!</p>
                          {/* UC-28: Seller reply */}
                          <div className="ml-6 p-3 bg-gray-50 dark:bg-background-light rounded-lg border-l-2 border-primary">
                            <div className="flex items-center gap-2 mb-1">
                              <MessageSquare className="w-3.5 h-3.5 text-primary" />
                              <span className="text-xs font-bold text-primary">Phản hồi từ {order.seller_name}</span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-foreground-muted">
                              Cảm ơn bạn đã ủng hộ! Rất vui vì bạn hài lòng với sản phẩm. Hẹn gặp lại! 🌿
                            </p>
                          </div>
                        </div>
                      ) : reviewingOrderId === order.id ? (
                        <div className="space-y-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-foreground">Đánh giá đơn hàng</p>
                          {/* Star rating */}
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map((s) => (
                              <button key={s} type="button" onClick={() => setReviewRating(s)} className="p-0.5" aria-label={`${s} sao`}>
                                <Star className={`w-6 h-6 transition-colors ${s <= reviewRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 hover:text-yellow-300"}`} />
                              </button>
                            ))}
                          </div>
                          {/* Comment */}
                          <div>
                            <label htmlFor={`review-${order.id}`} className="block text-xs text-gray-500 dark:text-foreground-muted mb-1">Nhận xét (tối thiểu 10 ký tự)</label>
                            <textarea
                              id={`review-${order.id}`}
                              rows={3}
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                              className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-border rounded-lg bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                            />
                            {reviewComment.length > 0 && reviewComment.length < 10 && (
                              <p className="text-[11px] text-accent mt-1">Cần tối thiểu 10 ký tự ({reviewComment.length}/10)</p>
                            )}
                          </div>
                          {/* Media upload */}
                          <div>
                            <input ref={reviewFileRef} type="file" accept="image/*" multiple className="hidden" aria-label="Upload ảnh đánh giá" onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              files.forEach(f => {
                                const reader = new FileReader();
                                reader.onload = () => setReviewImages(prev => [...prev, reader.result as string]);
                                reader.readAsDataURL(f);
                              });
                            }} />
                            <button type="button" onClick={() => reviewFileRef.current?.click()} className="text-xs text-primary font-medium hover:underline">
                              📷 Thêm ảnh/video
                            </button>
                            <EmojiPicker onSelect={(emoji) => setReviewComment(prev => prev + emoji)} />
                            {reviewImages.length > 0 && (
                              <div className="flex gap-2 mt-2">
                                {reviewImages.map((img, i) => (
                                  <div key={i} className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50">
                                    <Image src={img} alt={`Review ${i+1}`} width={64} height={64} className="w-full h-full object-cover" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => handleSubmitReview(order.id)} disabled={reviewRating === 0 || reviewComment.length < 10} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                              Gửi đánh giá
                            </button>
                            <button type="button" onClick={() => { setReviewingOrderId(null); setReviewRating(0); setReviewComment(""); }} className="text-sm text-foreground-muted hover:underline">
                              Hủy
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" onClick={() => setReviewingOrderId(order.id)} className="flex items-center gap-2 text-sm text-primary font-medium hover:underline">
                          <Star className="w-4 h-4" /> Viết đánh giá
                        </button>
                      )}
                    </div>
                  )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-foreground-muted">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Không có đơn hàng nào</p>
        </div>
      )}
      </>
      )}
    </div>
  );
}

/**
 * /orders — UC-23: Theo dõi đơn hàng (Buyer)
 */
export default function BuyerOrdersPage() {
  return (
    <ProtectedRoute roles={["BUYER"]}>
      <BuyerOrderContent />
    </ProtectedRoute>
  );
}
