import type { Metadata } from "next";
import Link from "next/link";
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Star,
  ArrowUpRight,
  Clock,
  Plus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard Nông Dân",
  description: "Quản lý gian hàng, sản phẩm, đơn hàng và doanh thu trên Cạp Nông.",
};

const STATS = [
  { label: "Đơn hàng", value: "28", icon: Package, color: "text-info bg-blue-50" },
  { label: "Sản phẩm", value: "12", icon: ShoppingCart, color: "text-primary bg-primary-50" },
  { label: "Doanh thu", value: formatCurrency(15600000), icon: TrendingUp, color: "text-success bg-green-50" },
  { label: "Đánh giá", value: "4.8", icon: Star, color: "text-warning bg-yellow-50" },
];

const RECENT_ORDERS = [
  { id: "#CN-0042", buyer: "Nguyễn Thu Hà", product: "Xoài Cát Hòa Lộc x2", total: 190000, status: "Đang giao", statusColor: "text-primary bg-primary-50" },
  { id: "#CN-0041", buyer: "Trần Minh Tuấn", product: "Cam Sành Hà Giang x5", total: 225000, status: "Đã xác nhận", statusColor: "text-info bg-blue-50" },
  { id: "#CN-0040", buyer: "Lê Văn Bình", product: "Bưởi Da Xanh x3", total: 204000, status: "Đã nhận", statusColor: "text-success bg-green-50" },
];

export default function DashboardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">
            Xin chào, Nhà vườn Bác Ba! 👋
          </h1>
          <p className="text-foreground-muted mt-1">
            Tổng quan hoạt động gian hàng của bạn
          </p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors shadow-md shadow-primary/20"
        >
          <Plus className="w-5 h-5" />
          Đăng sản phẩm
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm"
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
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white border border-border rounded-xl shadow-sm">
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
                className="px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
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

        {/* Quick Actions */}
        <div className="bg-white border border-border rounded-xl shadow-sm p-5 space-y-4">
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
