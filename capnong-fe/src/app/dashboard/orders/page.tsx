"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Truck,
  PackageCheck,
  XCircle,
  ChevronRight,
  TrendingUp,
  Package,
  DollarSign,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Pagination from "@/components/ui/Pagination";

type OrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

const STATUS_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "PENDING", label: "Chờ xác nhận" },
  { value: "CONFIRMED", label: "Đã xác nhận" },
  { value: "PREPARING", label: "Đang chuẩn bị" },
  { value: "SHIPPED", label: "Đang giao" },
  { value: "DELIVERED", label: "Đã nhận" },
  { value: "CANCELLED", label: "Đã hủy" },
];

const NEXT_STATUS: Partial<Record<OrderStatus, { next: OrderStatus; label: string; icon: typeof CheckCircle2 }>> = {
  PENDING: { next: "CONFIRMED", label: "Xác nhận", icon: CheckCircle2 },
  CONFIRMED: { next: "PREPARING", label: "Chuẩn bị", icon: Package },
  PREPARING: { next: "SHIPPED", label: "Giao hàng", icon: Truck },
  SHIPPED: { next: "DELIVERED", label: "Đã giao", icon: PackageCheck },
};

function statusBadge(status: OrderStatus) {
  switch (status) {
    case "PENDING": return "bg-yellow-50 text-warning dark:bg-yellow-900/30 dark:text-yellow-300";
    case "CONFIRMED": return "bg-blue-50 text-info dark:bg-blue-900/30 dark:text-blue-300";
    case "PREPARING": return "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300";
    case "SHIPPED": return "bg-primary-50 text-primary dark:bg-primary-dark dark:text-primary";
    case "DELIVERED": return "bg-green-50 text-success dark:bg-green-900/30 dark:text-green-300";
    case "CANCELLED": return "bg-red-50 text-accent dark:bg-red-900/30 dark:text-red-300";
  }
}
function statusLabel(status: OrderStatus) {
  switch (status) {
    case "PENDING": return "⏳ Chờ xác nhận";
    case "CONFIRMED": return "✅ Đã xác nhận";
    case "PREPARING": return "📦 Đang chuẩn bị";
    case "SHIPPED": return "🚚 Đang giao";
    case "DELIVERED": return "✔️ Đã nhận";
    case "CANCELLED": return "❌ Đã hủy";
  }
}

const INITIAL_ORDERS: {
  id: string; buyer: string; phone: string; products: string;
  total: number; status: OrderStatus; date: string;
}[] = [
  { id: "#CN-0042", buyer: "Nguyễn Thu Hà", phone: "0901***567", products: "Xoài Cát Hòa Lộc x2, Cam Sành x3", total: 325000, status: "PENDING", date: "20/03/2026" },
  { id: "#CN-0041", buyer: "Trần Minh Tuấn", phone: "0912***890", products: "Bưởi Da Xanh x5", total: 340000, status: "CONFIRMED", date: "19/03/2026" },
  { id: "#CN-0040", buyer: "Lê Văn Bình", phone: "0987***321", products: "Sầu Riêng Ri6 x2", total: 250000, status: "SHIPPED", date: "18/03/2026" },
  { id: "#CN-0039", buyer: "Phạm Thị Mai", phone: "0934***654", products: "Cam Sành Hà Giang x10", total: 450000, status: "DELIVERED", date: "15/03/2026" },
  { id: "#CN-0038", buyer: "Hoàng Minh Đức", phone: "0921***111", products: "Xoài Cát Hòa Lộc x1", total: 95000, status: "CANCELLED", date: "14/03/2026" },
  { id: "#CN-0037", buyer: "Lê Thanh Tùng", phone: "0938***222", products: "Cam Sành x8", total: 360000, status: "DELIVERED", date: "12/03/2026" },
  { id: "#CN-0036", buyer: "Trương Ngọc Anh", phone: "0945***333", products: "Bưởi Da Xanh x3", total: 204000, status: "DELIVERED", date: "10/03/2026" },
];

/**
 * /dashboard/orders — UC-24, 25, 26
 * Seller: xem & xác nhận đơn hàng, cập nhật trạng thái, xem doanh thu
 */
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

export default function OrderManagementPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = useState<any[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingData, setLoadingData] = useState(true);
  const ITEMS_PER_PAGE = 5;
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  
  // Dashboard states
  const [stats, setStats] = useState({ totalOrders: 0, grossRevenue: 0, pendingOrders: 0, deliveredOrders: 0 });
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  /* Reusable: fetch status counts from API */
  const fetchStatusCounts = useCallback(async () => {
    try {
      const { apiOrderService } = await import("@/services/api/order");
      const fetchCount = async (st: string) => {
         const res = await apiOrderService.getSellerSubOrders({ status: st === "all" ? undefined : st, page: 0, size: 1 });
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         const count = (res as any).total_elements ?? (res as any).totalElements ?? 0;
         return { [st]: count };
      };
      const countsArray = await Promise.all(STATUS_FILTERS.map(f => fetchCount(f.value)));
      const newCounts = countsArray.reduce((acc, curr) => ({ ...acc, ...curr }), {});
      setStatusCounts(newCounts);
      setStats(prev => ({ 
        ...prev, 
        pendingOrders: newCounts["PENDING"] || 0,
        deliveredOrders: newCounts["DELIVERED"] || 0 
      }));
    } catch { /* silent */ }
  }, []);

  /* Fetch KPIs + counts on mount */
  useEffect(() => {
    async function loadDashboard() {
      try {
        const { apiDashboardService } = await import("@/services/api/dashboard");
        const summary = await apiDashboardService.getFarmerSummary();
        setStats(prev => ({ ...prev, grossRevenue: summary.grossRevenue || 0, totalOrders: summary.totalOrders || 0 }));
      } catch { /* silent */ }
      fetchStatusCounts();
    }
    loadDashboard();
  }, [fetchStatusCounts]);

  /* Fetch real orders from API, fallback to mock */
  const fetchOrders = useCallback(async () => {
    setLoadingData(true);
    try {
      const { apiOrderService } = await import("@/services/api/order");
      const apiOrders = await apiOrderService.getSellerSubOrders({
        status: activeFilter,
        page: currentPage - 1,
        size: ITEMS_PER_PAGE
      });
      // The endpoint returns a paginated list or array. If paginated, it's .content
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderList = (apiOrders as any).content || apiOrders;
      if (Array.isArray(orderList) && orderList.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped = orderList.map((o: any) => ({
          // subOrders might have parent order code if backend passes it, else fallback to id
          id: o.orderCode || o.id || "#???",
          buyer: o.buyerName || o.guestName || o.buyer_name || o.guest_name || "Khách hàng",
          phone: o.buyerPhone || o.guestPhone || o.buyer_phone || o.guest_phone || "—",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          products: (o.items || []).map((i: any) => `${i.productName || i.product?.name || "SP"} x${i.quantity || 1}`).join(", ") || "—",
          total: o.subtotal || o.totalAmount || 0,
          status: (o.status || "PENDING") as OrderStatus,
          date: o.createdAt || o.created_at ? new Date(o.createdAt || o.created_at).toLocaleDateString("vi-VN") : "—",
        }));
        setOrders(mapped);
        
        // Update pagination from BE if returning Page
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiTotalElements = (apiOrders as any).total_elements ?? (apiOrders as any).totalElements;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const apiTotalPages = (apiOrders as any).total_pages ?? (apiOrders as any).totalPages;
        
        if (apiTotalElements !== undefined) {
          setTotalElements(apiTotalElements);
          setTotalPages(apiTotalPages);
        } else {
          setTotalElements(mapped.length);
          setTotalPages(Math.ceil(mapped.length / ITEMS_PER_PAGE));
        }
      } else {
        setOrders([]);
        setTotalElements(0);
        setTotalPages(1);
      }
    } catch {
      if (USE_MOCK) { setOrders(INITIAL_ORDERS); }
    } finally {
      setLoadingData(false);
    }
  }, [activeFilter, currentPage]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  /* Optimistic count adjustment helper */
  const adjustCounts = (fromStatus: string, toStatus: string) => {
    setStatusCounts((prev) => {
      const next = { ...prev };
      if (next[fromStatus] !== undefined) next[fromStatus] = Math.max(0, next[fromStatus] - 1);
      if (next[toStatus] !== undefined) next[toStatus] = (next[toStatus] || 0) + 1;
      if (next["all"] !== undefined) { /* total stays same */ }
      return next;
    });
  };

  /* advance status */
  const handleAdvance = async (id: string) => {
    if (processingIds.has(id)) return; // prevent double-click
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const ns = NEXT_STATUS[order.status as OrderStatus];
    if (!ns) return;
    const oldStatus = order.status;
    
    // Lock this order
    setProcessingIds((prev) => new Set(prev).add(id));
    
    // Optimistic UI + count
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: ns.next } : o));
    adjustCounts(oldStatus, ns.next);

    try {
       const { apiOrderService } = await import("@/services/api/order");
       await apiOrderService.updateSubOrderStatus(id, ns.next);
       // Refresh real counts in background after success
       fetchStatusCounts();
    } catch {
       // Rollback on fail
       setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: oldStatus } : o)));
       adjustCounts(ns.next, oldStatus);
    } finally {
       setProcessingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  /* cancel order */
  const handleCancel = async (id: string) => {
    if (processingIds.has(id)) return;
    const order = orders.find(o => o.id === id);
    if (!order) return;
    const oldStatus = order.status;

    setProcessingIds((prev) => new Set(prev).add(id));

    // Optimistic cancel + count
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "CANCELLED" as OrderStatus } : o));
    adjustCounts(oldStatus, "CANCELLED");
    setCancellingId(null);
    setCancelReason("");
    
    try {
       const { apiOrderService } = await import("@/services/api/order");
       await apiOrderService.updateSubOrderStatus(id, "CANCELLED");
       fetchStatusCounts();
    } catch {
       // Rollback on fail
       setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: oldStatus } : o)));
       adjustCounts("CANCELLED", oldStatus);
    } finally {
       setProcessingIds((prev) => { const next = new Set(prev); next.delete(id); return next; });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="p-2 hover:bg-gray-100 dark:hover:bg-surface-hover rounded-full transition-colors" aria-label="Quay lại dashboard">
          <ArrowLeft className="w-5 h-5 text-foreground-muted" />
        </Link>
        <h1 className="text-2xl font-black text-foreground">Quản lý đơn hàng</h1>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-surface rounded-xl p-4 border border-gray-100 dark:border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-foreground-muted">Tổng doanh thu</p>
            <p className="text-lg font-bold text-gray-900 dark:text-foreground">{formatCurrency(stats.grossRevenue)}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-surface rounded-xl p-4 border border-gray-100 dark:border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
            <Package className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-foreground-muted">Chờ xác nhận</p>
            <p className="text-lg font-bold text-gray-900 dark:text-foreground">{stats.pendingOrders}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-surface rounded-xl p-4 border border-gray-100 dark:border-border flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-info" />
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-foreground-muted">Thành công</p>
            <p className="text-lg font-bold text-gray-900 dark:text-foreground">{stats.deliveredOrders}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_FILTERS.map((f) => (
          <button type="button"
            key={f.value}
            onClick={() => { setActiveFilter(f.value); setCurrentPage(1); }}
            className={
              activeFilter === f.value
                ? "whitespace-nowrap rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
                : "whitespace-nowrap rounded-full bg-white dark:bg-surface border border-border px-5 py-2 text-sm font-medium text-foreground hover:border-primary transition-colors flex items-center gap-1.5"
            }
          >
            {f.label}
            {statusCounts[f.value] !== undefined && (
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                activeFilter === f.value ? "bg-white/20 text-white" : "bg-gray-100 dark:bg-surface-hover text-foreground-muted"
              }`}>
                {statusCounts[f.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders List / Loading */}
      <div className="space-y-3 relative">
        {loadingData ? (
          /* Skeletons */
          Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-5">
              <div className="flex flex-col sm:flex-row justify-between gap-4 animate-pulse">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                    <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-full"></div>
                  </div>
                  <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                  <div className="h-4 w-full max-w-sm bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <>
            {orders.map((order) => {
          const ns = NEXT_STATUS[order.status];
          return (
            <div key={order.id} className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-5 hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 dark:text-foreground">{order.id}</span>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusBadge(order.status)}`}>
                      {statusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-foreground">
                    <span className="font-medium">{order.buyer}</span>
                    <span className="text-gray-400 mx-2">·</span>
                    <span className="text-gray-500 dark:text-foreground-muted">{order.phone}</span>
                  </p>
                  <p className="text-sm text-gray-500 dark:text-foreground-muted">{order.products}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>📅 {order.date}</span>
                    <span className="font-bold text-primary text-sm">{formatCurrency(order.total)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-start gap-2 shrink-0">
                  {/* Advance status */}
                  {ns && (
                    <button type="button"
                      onClick={() => handleAdvance(order.id)}
                      disabled={processingIds.has(order.id)}
                      className={`flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium transition-opacity ${
                        processingIds.has(order.id) ? "opacity-50 cursor-wait" : "hover:opacity-90"
                      }`}
                    >
                      {processingIds.has(order.id) ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <ns.icon className="w-4 h-4" />
                      )}
                      {ns.label}
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}

                  {/* Cancel */}
                  {(order.status === "PENDING" || order.status === "CONFIRMED" || order.status === "PREPARING") && (
                    <button type="button"
                      onClick={() => setCancellingId(cancellingId === order.id ? null : order.id)}
                      disabled={processingIds.has(order.id)}
                      className={`flex items-center gap-1.5 text-red-500 border border-red-200 dark:border-red-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        processingIds.has(order.id) ? "opacity-50 cursor-wait" : "hover:bg-red-50 dark:hover:bg-red-900/20"
                      }`}
                    >
                      <XCircle className="w-4 h-4" />
                      Hủy
                    </button>
                  )}
                </div>
              </div>

              {/* Cancel reason form */}
              {cancellingId === order.id && (
                <div className="mt-4 p-4 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30 space-y-3">
                  <label htmlFor={`cancel-${order.id}`} className="block text-sm font-medium text-red-700 dark:text-red-300">
                    Lý do hủy đơn (bắt buộc)
                  </label>
                  <select
                    id={`cancel-${order.id}`}
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-background border border-red-200 dark:border-red-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
                  >
                    <option value="">Chọn lý do...</option>
                    <option value="out_of_stock">Hết hàng</option>
                    <option value="wrong_price">Sai giá</option>
                    <option value="natural_disaster">Thiên tai</option>
                    <option value="buyer_request">Khách yêu cầu hủy</option>
                    <option value="other">Lý do khác</option>
                  </select>
                  <div className="flex gap-2">
                    <button type="button"
                      onClick={() => cancelReason && handleCancel(order.id)}
                      disabled={!cancelReason}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      Xác nhận hủy
                    </button>
                    <button type="button"
                      onClick={() => { setCancellingId(null); setCancelReason(""); }}
                      className="border border-gray-200 dark:border-border px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-foreground-muted hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors"
                    >
                      Thôi
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
          </>
        )}
      </div>

      {!loadingData && orders.length === 0 && (
        <div className="text-center py-12 text-foreground-muted">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Không có đơn hàng nào</p>
        </div>
      )}

      <div className="mt-6 flex flex-col items-center gap-3">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        <p className="text-xs text-foreground-muted">
          Trang {currentPage}/{totalPages || 1} — {totalElements} đơn hàng
        </p>
      </div>
    </div>
  );
}
