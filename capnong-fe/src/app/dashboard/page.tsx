"use client";

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

const STATS = [
  { label: "Đơn hàng", value: "28", icon: Package, color: "text-info bg-blue-50 dark:bg-blue-900/30" },
  { label: "Sản phẩm", value: "12", icon: ShoppingCart, color: "text-primary bg-primary-50 dark:bg-primary-dark" },
  { label: "Doanh thu", value: formatCurrency(15600000), icon: TrendingUp, color: "text-success bg-green-50 dark:bg-green-900/30" },
  { label: "Đánh giá", value: "4.8", icon: Star, color: "text-warning bg-yellow-50 dark:bg-yellow-900/30" },
];

const RECENT_ORDERS = [
  { id: "#CN-0042", buyer: "Nguyễn Thu Hà", product: "Xoài Cát Hòa Lộc x2", total: 190000, status: "Đang giao", statusColor: "text-primary bg-primary-50" },
  { id: "#CN-0041", buyer: "Trần Minh Tuấn", product: "Cam Sành Hà Giang x5", total: 225000, status: "Đã xác nhận", statusColor: "text-info bg-blue-50" },
  { id: "#CN-0040", buyer: "Lê Văn Bình", product: "Bưởi Da Xanh x3", total: 204000, status: "Đã nhận", statusColor: "text-success bg-green-50" },
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

function DashboardContent() {
  const { user, isHtxManager } = useAuth();
  const displayName = user?.full_name || "Nhà vườn";
  const roleSubtitle = isHtxManager
    ? `Tổng quan hợp tác xã${user?.htx_name ? " — " + user.htx_name : ""}`
    : "Tổng quan hoạt động gian hàng của bạn";

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

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
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
            <SimpleBarChart data={REVENUE_DATA} height={180} />
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
              {RECENT_ORDERS.map((order) => (
                <div
                  key={order.id}
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
          <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-foreground">
                  3 đơn hàng cần xác nhận
                </p>
                <p className="text-xs text-foreground-muted mt-0.5">
                  Vui lòng xác nhận trong vòng 24 giờ
                </p>
              </div>
            </div>
          </div>
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
    <ProtectedRoute roles={["FARMER", "HTX_MANAGER", "HTX_MEMBER"]}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
