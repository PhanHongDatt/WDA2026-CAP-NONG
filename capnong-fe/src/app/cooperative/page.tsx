import type { Metadata } from "next";
import Link from "next/link";
import { Flame, Users, Clock, TrendingUp, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Gom Đơn Hàng",
  description: "Dashboard gom đơn thông minh. Hợp tác xã kỹ thuật số giúp nông dân giảm chi phí vận chuyển, tăng lợi nhuận.",
};

const POOLS = [
  {
    id: 1,
    productName: "Cam sành Vĩnh Long - Bến Tre",
    targetQty: 1000,
    currentQty: 650,
    pricePerUnit: 35000,
    participants: 12,
    deadline: "17/03/2026",
    status: "OPEN" as const,
  },
  {
    id: 2,
    productName: "Sầu riêng Ri6 Đắk Lắk",
    targetQty: 500,
    currentQty: 500,
    pricePerUnit: 115000,
    participants: 8,
    deadline: "12/03/2026",
    status: "FULFILLED" as const,
  },
  {
    id: 3,
    productName: "Bưởi da xanh Bến Tre",
    targetQty: 800,
    currentQty: 320,
    pricePerUnit: 58000,
    participants: 6,
    deadline: "20/03/2026",
    status: "OPEN" as const,
  },
];

const PROFIT_TABLE = [
  { farmer: "Nhà Vườn Bác Ba", qty: 200, percentage: 30.8, revenue: 7000000 },
  { farmer: "HTX Bến Tre", qty: 180, percentage: 27.7, revenue: 6300000 },
  { farmer: "Nông trại Xanh", qty: 150, percentage: 23.1, revenue: 5250000 },
  { farmer: "Vườn Cần Thơ", qty: 120, percentage: 18.4, revenue: 4200000 },
];

export default function CooperativePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-foreground">
          🤝 Dashboard Gom Đơn
        </h1>
        <p className="text-foreground-muted mt-1">
          Hợp tác xã kỹ thuật số — Gom đơn thông minh, chia lợi nhuận công
          bằng
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pool đang mở", value: "2", icon: Flame, color: "text-accent bg-red-50" },
          { label: "Tổng người tham gia", value: "26", icon: Users, color: "text-info bg-blue-50" },
          { label: "Đã hoàn thành", value: "15", icon: CheckCircle2, color: "text-success bg-green-50" },
          { label: "Doanh thu gom đơn", value: formatCurrency(87500000), icon: TrendingUp, color: "text-primary bg-primary-50" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-foreground-muted font-medium uppercase tracking-wider">
                {stat.label}
              </p>
              <p className="text-lg font-black text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pool List */}
      <section>
        <h2 className="text-xl font-bold mb-4">Danh sách Pool</h2>
        <div className="space-y-4">
          {POOLS.map((pool) => {
            const progress = Math.round(
              (pool.currentQty / pool.targetQty) * 100
            );
            const isFulfilled = pool.status === "FULFILLED";

            return (
              <div
                key={pool.id}
                className="bg-white border border-border rounded-xl p-6 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                          isFulfilled
                            ? "bg-green-50 text-success"
                            : "bg-red-50 text-accent"
                        }`}
                      >
                        {isFulfilled ? "✅ Đã hoàn thành" : "🔥 Đang gom"}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold">{pool.productName}</h3>
                    <p className="text-sm text-foreground-muted">
                      Giá: {formatCurrency(pool.pricePerUnit)}/kg •{" "}
                      {pool.participants} người tham gia • Hạn:{" "}
                      {pool.deadline}
                    </p>
                  </div>
                  {!isFulfilled && (
                    <button className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-light transition-colors shrink-0">
                      Tham gia
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isFulfilled
                          ? "bg-success"
                          : "bg-gradient-to-r from-primary to-primary-light"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-foreground-muted shrink-0">
                    {pool.currentQty.toLocaleString()}/{pool.targetQty.toLocaleString()} kg ({progress}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Profit Sharing Table */}
      <section>
        <h2 className="text-xl font-bold mb-4">
          Bảng phân chia lợi nhuận — Cam sành VL-BT
        </h2>
        <div className="bg-white border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-gray-50">
                  <th className="text-left px-5 py-3 font-bold text-foreground-muted">
                    Nông dân / HTX
                  </th>
                  <th className="text-right px-5 py-3 font-bold text-foreground-muted">
                    Số lượng (kg)
                  </th>
                  <th className="text-right px-5 py-3 font-bold text-foreground-muted">
                    Tỷ lệ
                  </th>
                  <th className="text-right px-5 py-3 font-bold text-foreground-muted">
                    Doanh thu ước tính
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PROFIT_TABLE.map((row) => (
                  <tr key={row.farmer} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium">{row.farmer}</td>
                    <td className="px-5 py-4 text-right">
                      {row.qty.toLocaleString()}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-primary">
                      {row.percentage}%
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-primary">
                      {formatCurrency(row.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-primary-50 border-t border-primary/20">
                  <td className="px-5 py-3 font-black">Tổng</td>
                  <td className="px-5 py-3 text-right font-black">
                    {PROFIT_TABLE.reduce((s, r) => s + r.qty, 0).toLocaleString()}
                  </td>
                  <td className="px-5 py-3 text-right font-black text-primary">
                    100%
                  </td>
                  <td className="px-5 py-3 text-right font-black text-primary">
                    {formatCurrency(
                      PROFIT_TABLE.reduce((s, r) => s + r.revenue, 0)
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
