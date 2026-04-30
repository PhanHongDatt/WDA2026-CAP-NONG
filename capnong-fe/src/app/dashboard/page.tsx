"use client";

import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Star,
  ArrowUpRight,
  Clock,
  Plus,
  Users,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import SimpleBarChart from "@/components/ui/SimpleBarChart";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";

const AIDigestCard = lazy(() => import("@/components/ui/AIDigestCard"));

const STATS = [
  { label: "Đơn hàng", value: "28", icon: Package, color: "text-info bg-blue-50 dark:bg-blue-900/30" },
  { label: "Sản phẩm", value: "12", icon: ShoppingCart, color: "text-primary bg-primary-50 dark:bg-primary-dark" },
  { label: "Doanh thu", value: formatCurrency(15600000), icon: TrendingUp, color: "text-success bg-green-50 dark:bg-green-900/30" },
  { label: "Đánh giá", value: "4.8", icon: Star, color: "text-warning bg-yellow-50 dark:bg-yellow-900/30" },
];

const RECENT_ORDERS = [
  { originalId: "mock1", id: "#CN-0042", buyer: "Nguyễn Thu Hà", product: "Xoài Cát Hòa Lộc x2", total: 190000, status: "Đang giao", statusColor: "text-primary bg-primary-50" },
  { originalId: "mock2", id: "#CN-0041", buyer: "Trần Minh Tuấn", product: "Cam Sành Hà Giang x5", total: 225000, status: "Đã xác nhận", statusColor: "text-info bg-blue-50" },
  { originalId: "mock3", id: "#CN-0040", buyer: "Lê Văn Bình", product: "Bưởi Da Xanh x3", total: 204000, status: "Đã nhận", statusColor: "text-success bg-green-50" },
];

const REVENUE_DATA = [
  { label: "T1", value: 1200000 },
  { label: "T2", value: 2100000 },
  { label: "T3", value: 1800000 },
  { label: "T4", value: 3200000 },
  { label: "T5", value: 2900000 },
  { label: "T6", value: 4100000 },
  { label: "T7", value: 3800000 },
  { label: "T8", value: 4500000 },
  { label: "T9", value: 3900000 },
  { label: "T10", value: 5200000 },
  { label: "T11", value: 4800000 },
  { label: "T12", value: 6100000 },
];

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

const EMPTY_STATS = [
  { label: "Đơn hàng", value: "—", icon: Package, color: "text-info bg-blue-50 dark:bg-blue-900/30" },
  { label: "Sản phẩm", value: "—", icon: ShoppingCart, color: "text-primary bg-primary-50 dark:bg-primary-dark" },
  { label: "Doanh thu", value: "—", icon: TrendingUp, color: "text-success bg-green-50 dark:bg-green-900/30" },
  { label: "Đánh giá", value: "—", icon: Star, color: "text-warning bg-yellow-50 dark:bg-yellow-900/30" },
];

function DashboardContent() {
  const { user, isHtxManager } = useAuth();
  const displayName = user?.full_name || "Nhà vườn";
  const roleSubtitle = "Tổng quan hoạt động gian hàng của bạn";

  const [stats, setStats] = useState<any[]>(USE_MOCK ? STATS : EMPTY_STATS);
  const [recentOrders, setRecentOrders] = useState(USE_MOCK ? RECENT_ORDERS : []);
  const [revenueData, setRevenueData] = useState(USE_MOCK ? REVENUE_DATA : [] as { label: string; value: number }[]);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [productNames, setProductNames] = useState<string[] | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      const { orderService } = await import("@/services");
      const { apiDashboardService } = await import("@/services/api/dashboard");
      const { getSellerProducts } = await import("@/services/api/product");
      
      const [summaryRes, ordersRes, revenueRes, productsRes] = await Promise.allSettled([
        apiDashboardService.getFarmerSummary(),
        orderService.getSellerSubOrders({ size: 3 }),
        apiDashboardService.getMonthlyRevenue(),
        getSellerProducts(0, 10),
      ]);

      const summary = summaryRes.status === "fulfilled" 
        ? summaryRes.value 
        : { totalOrders: 0, pendingOrders: 0, totalProducts: 0, grossRevenue: 0, netRevenue: 0, averageRating: 0, totalReviews: 0 };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiOrders: any = ordersRes.status === "fulfilled" ? ordersRes.value : {};
      const orders = Array.isArray(apiOrders.content) ? apiOrders.content : (Array.isArray(apiOrders) ? apiOrders : []);

      const ratingDisplay = summary.averageRating > 0 ? (
        <span className="flex items-baseline md:items-end xl:items-baseline">
          {summary.averageRating.toFixed(1)}
          <span className="text-sm font-medium text-foreground-muted ml-0.5">/{summary.totalReviews}</span>
        </span>
      ) : "—";

      setStats([
        { label: "Đơn hàng", value: String(summary.totalOrders || 0), icon: Package, color: "text-info bg-blue-50 dark:bg-blue-900/30" },
        { label: "Sản phẩm", value: String(summary.totalProducts || 0), icon: ShoppingCart, color: "text-primary bg-primary-50 dark:bg-primary-dark" },
        { label: "Doanh thu", value: formatCurrency(summary.grossRevenue || 0), icon: TrendingUp, color: "text-success bg-green-50 dark:bg-green-900/30" },
        { label: "Đánh giá", value: ratingDisplay, icon: Star, color: "text-warning bg-yellow-50 dark:bg-yellow-900/30" },
      ]);

      setPendingOrdersCount(summary.pendingOrders || 0);

      if (orders.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setRecentOrders(orders.slice(0, 3).map((o: any) => {
          // Map items: nested product object has name, quantity is on item level
          const itemsText = (o.items || []).map((i: any) => {
            const pName = i.product?.name || i.productName || i.product_name || "SP";
            const qty = i.quantity || 1;
            return `${pName} x${Math.round(qty)}`;
          }).join(", ") || "—";

          return {
            originalId: o.id, // Full UUID for React key
            id: o.subOrderCode || String(o.id || "").substring(0, 8).toUpperCase() || "#???",
            buyer: o.buyerName || o.order?.buyerName || o.order?.guestName || o.order?.buyer_name || o.order?.guest_name || "Khách",
            product: itemsText,
            total: o.subtotal || o.totalAmount || 0,
            status: o.status === "DELIVERED" ? "Đã nhận" : o.status === "SHIPPED" ? "Đang giao" : o.status === "PENDING" ? "Chờ xác nhận" : o.status === "CANCELLED" ? "Đã hủy" : "Đã xác nhận",
            statusColor: o.status === "DELIVERED" ? "text-success bg-green-50" : o.status === "SHIPPED" ? "text-primary bg-primary-50" : o.status === "CANCELLED" ? "text-red-600 bg-red-50" : "text-info bg-blue-50",
          };
        }));
      } else {
        setRecentOrders([]);
      }

      // Monthly revenue chart
      if (revenueRes.status === "fulfilled" && revenueRes.value.length > 0) {
        setRevenueData(revenueRes.value.map(r => ({ label: r.label, value: r.revenue })));
      }

      if (productsRes.status === "fulfilled") {
        setProductNames(productsRes.value.content.map(p => p.name));
      } else {
        setProductNames([]);
      }
    } catch {
      if (USE_MOCK) { setStats(STATS); setRecentOrders(RECENT_ORDERS); setRevenueData(REVENUE_DATA); }
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">
            Xin chào, {displayName}! 👋
          </h1>
          <p className="text-foreground-muted mt-1">
            {roleSubtitle}
          </p>
        </div>
        {isHtxManager ? (
          <Link
            href="/cooperative/manage"
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors shadow-md shadow-primary/20"
          >
            <Users className="w-5 h-5" />
            Quản lý HTX
          </Link>
        ) : (
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors shadow-md shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            Đăng sản phẩm
          </Link>
        )}
      </div>

      {user?.role === "FARMER" && !isHtxManager && !user?.htx_id && (
        <div className="bg-gradient-to-r from-primary-dark to-primary text-white p-6 sm:p-8 rounded-xl shadow-lg border border-primary-light flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          {/* Decorative background circle */}
          <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-white opacity-5 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-start sm:items-center gap-4 relative z-10 w-full md:w-auto">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center shrink-0 border border-white/10 hidden sm:flex">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black mb-1.5 flex items-center gap-2">Phát triển cùng Hợp tác xã! <span className="text-2xl">🌱</span></h2>
              <p className="text-white/90 text-sm max-w-lg">
                Gom đơn hàng số lượng lớn, đẩy mạnh xuất khẩu và tiếp cận hàng ngàn người mua sỉ bằng cách gia nhập hệ sinh thái HTX số.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row shrink-0 gap-3 w-full md:w-auto relative z-10">
            <Link href="/cooperative" className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-6 py-3 rounded-lg text-sm font-bold transition-colors text-center shadow-inner">
              Tìm & Tham gia
            </Link>
            <Link href="/cooperative/create" className="bg-white text-primary hover:bg-gray-50 px-6 py-3 rounded-lg text-sm font-bold shadow-md transition-transform hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Thành lập HTX
            </Link>
          </div>
        </div>
      )}

      {/* AI Proactive Digest — Trợ lý AI nhắc nhở */}
      {["FARMER", "HTX_MANAGER", "HTX_MEMBER"].includes(user?.role || "") && (
        <Suspense fallback={
          <div className="h-32 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/10 dark:to-blue-900/10 border border-emerald-200/60 dark:border-emerald-800/30 rounded-2xl animate-pulse flex items-center justify-center text-sm text-foreground-muted">
            🤖 Đang tải Trợ lý AI...
          </div>
        }>
          {productNames !== null ? (
            <AIDigestCard
              province={(user as any)?.province || "Tiền Giang"}
              farmerName={user?.full_name || undefined}
              products={productNames}
            />
          ) : (
            <div className="h-32 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/10 dark:to-blue-900/10 border border-emerald-200/60 dark:border-emerald-800/30 rounded-2xl animate-pulse flex items-center justify-center text-sm text-foreground-muted">
              🤖 Đang chuẩn bị dữ liệu sản phẩm...
            </div>
          )}
        </Suspense>
      )}
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-surface border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm"
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}
            >
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-foreground-muted uppercase tracking-wider font-medium">
                {stat.label}
              </p>
              <p className="text-xl font-black text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart + Recent Orders */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Chart */}
          <div className="bg-white dark:bg-surface border border-border rounded-xl shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">📊 Doanh thu theo tháng</h3>
              <span className="text-xs text-foreground-muted bg-primary/5 px-3 py-1 rounded-full font-medium">
                Năm 2026
              </span>
            </div>
            <SimpleBarChart data={revenueData} height={180} />
          </div>

          {/* Recent Orders */}
          <div className="bg-white dark:bg-surface border border-border rounded-xl shadow-sm">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h3 className="font-bold text-lg">Đơn hàng gần đây</h3>
              <Link
                href="/dashboard/orders"
                className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
              >
                Xem tất cả <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {recentOrders.map((order, i) => (
                <div
                  key={order.originalId || order.id || i}
                  className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors"
                >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-bold">{order.id}</span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${order.statusColor}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-muted truncate">
                    {order.buyer} — {order.product}
                  </p>
                </div>
                <span className="text-sm font-bold text-primary shrink-0 ml-4">
                  {formatCurrency(order.total)}
                </span>
              </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-surface border border-border rounded-xl shadow-sm p-5 space-y-4">
          <h3 className="font-bold text-lg">Thao tác nhanh</h3>
          <div className="space-y-3">
            <Link
              href="/dashboard/products/new"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-primary-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm">Đăng sản phẩm mới</span>
            </Link>
            <Link
              href="/dashboard/orders"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-info group-hover:bg-info group-hover:text-white transition-colors">
                <Package className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm">Quản lý đơn hàng</span>
            </Link>
            <Link
              href="/cooperative"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-yellow-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center text-warning group-hover:bg-warning group-hover:text-white transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm">Dashboard gom đơn</span>
            </Link>
            <Link
              href="/dashboard/marketing"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Star className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm">AI Marketing Lab</span>
            </Link>
            <Link
              href="/dashboard/products/drafts"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Clock className="w-5 h-5" />
              </div>
              <span className="font-medium text-sm">SP Nháp</span>
            </Link>
          </div>

          {/* Notification */}
          {pendingOrdersCount > 0 && (
            <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {pendingOrdersCount} đơn hàng cần xác nhận
                  </p>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    Vui lòng xác nhận trong vòng 24 giờ
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * /dashboard — Dashboard for FARMER / HTX_MANAGER
 * Protected route with role guard
 */
export default function DashboardPage() {
  return (
    <ProtectedRoute roles={["FARMER", "HTX_MANAGER", "HTX_MEMBER", "ADMIN"]}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
