"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, ChevronDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chờ xác nhận" },
  { value: "confirmed", label: "Đã xác nhận" },
  { value: "shipping", label: "Đang giao" },
  { value: "delivered", label: "Đã nhận" },
  { value: "cancelled", label: "Đã hủy" },
];

const ORDERS = [
  { id: "#CN-0042", buyer: "Nguyễn Thu Hà", phone: "0901***567", products: "Xoài Cát Hòa Lộc x2, Cam Sành x3", total: 325000, status: "pending", statusLabel: "Chờ xác nhận", statusColor: "bg-yellow-50 text-warning", date: "14/03/2026" },
  { id: "#CN-0041", buyer: "Trần Minh Tuấn", phone: "0912***890", products: "Bưởi Da Xanh x5", total: 340000, status: "confirmed", statusLabel: "Đã xác nhận", statusColor: "bg-blue-50 text-info", date: "13/03/2026" },
  { id: "#CN-0040", buyer: "Lê Văn Bình", phone: "0987***321", products: "Sầu Riêng Ri6 x2", total: 250000, status: "shipping", statusLabel: "Đang giao", statusColor: "bg-primary-50 text-primary", date: "12/03/2026" },
  { id: "#CN-0039", buyer: "Phạm Thị Mai", phone: "0934***654", products: "Cam Sành Hà Giang x10", total: 450000, status: "delivered", statusLabel: "Đã nhận", statusColor: "bg-green-50 text-success", date: "10/03/2026" },
  { id: "#CN-0038", buyer: "Hoàng Minh Đức", phone: "0921***111", products: "Xoài Cát Hòa Lộc x1", total: 95000, status: "cancelled", statusLabel: "Đã hủy", statusColor: "bg-red-50 text-accent", date: "09/03/2026" },
];

export default function OrderManagementPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? ORDERS
      : ORDERS.filter((o) => o.status === activeFilter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/dashboard"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground-muted" />
        </Link>
        <h1 className="text-2xl font-black text-foreground">
          Quản lý đơn hàng
        </h1>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={
              activeFilter === f.value
                ? "whitespace-nowrap rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white"
                : "whitespace-nowrap rounded-full bg-white border border-border px-5 py-2 text-sm font-medium hover:border-primary transition-colors"
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-border rounded-xl shadow-sm overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50">
                <th className="text-left px-5 py-3 font-bold text-foreground-muted">Mã đơn</th>
                <th className="text-left px-5 py-3 font-bold text-foreground-muted">Khách hàng</th>
                <th className="text-left px-5 py-3 font-bold text-foreground-muted">Sản phẩm</th>
                <th className="text-right px-5 py-3 font-bold text-foreground-muted">Tổng</th>
                <th className="text-center px-5 py-3 font-bold text-foreground-muted">Trạng thái</th>
                <th className="text-center px-5 py-3 font-bold text-foreground-muted">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-bold">{order.id}</td>
                  <td className="px-5 py-4">
                    <span className="block font-medium">{order.buyer}</span>
                    <span className="text-xs text-foreground-muted">{order.phone}</span>
                  </td>
                  <td className="px-5 py-4 text-foreground-muted max-w-[200px] truncate">
                    {order.products}
                  </td>
                  <td className="px-5 py-4 text-right font-bold text-primary">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${order.statusColor}`}>
                      {order.statusLabel}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center text-foreground-muted">
                    {order.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden divide-y divide-border">
          {filtered.map((order) => (
            <div key={order.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{order.id}</span>
                <span className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${order.statusColor}`}>
                  {order.statusLabel}
                </span>
              </div>
              <p className="text-sm font-medium">{order.buyer}</p>
              <p className="text-xs text-foreground-muted truncate mb-2">{order.products}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-foreground-muted">{order.date}</span>
                <span className="font-bold text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm text-foreground-muted text-center mt-6">
        Hiển thị {filtered.length} đơn hàng
      </p>
    </div>
  );
}
