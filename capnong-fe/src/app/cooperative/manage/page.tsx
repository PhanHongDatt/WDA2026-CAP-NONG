"use client";

import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Users, TrendingUp, Plus, Package, Settings } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const MOCK_MEMBERS = [
  { id: 1, name: "Bác Ba Nhà Vườn", product: "Cam sành", qty: 200, share: "20%" },
  { id: 2, name: "Chú Tư Bến Tre", product: "Bưởi da xanh", qty: 350, share: "35%" },
  { id: 3, name: "Cô Năm Vĩnh Long", product: "Cam sành", qty: 150, share: "15%" },
  { id: 4, name: "Anh Sáu Cần Thơ", product: "Xoài cát", qty: 300, share: "30%" },
];

function CoopManageContent() {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground dark:text-foreground">
            Quản lý HTX 🏛️
          </h1>
          <p className="text-gray-600 dark:text-foreground-muted mt-1">
            {user?.htx_name || "HTX Trái Cây"} — Xin chào, {user?.full_name}
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-5 h-5" />
          Tạo Pool Gom Đơn
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Thành viên", value: "4", icon: Users, color: "text-primary bg-primary-50 dark:bg-primary-dark" },
          { label: "Pool đang mở", value: "2", icon: Package, color: "text-info bg-blue-50 dark:bg-blue-900/30" },
          { label: "Doanh thu tháng", value: formatCurrency(45600000), icon: TrendingUp, color: "text-success bg-green-50 dark:bg-green-900/30" },
          { label: "Đơn hoàn thành", value: "12", icon: Settings, color: "text-warning bg-yellow-50 dark:bg-yellow-900/30" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-surface rounded-xl p-5 border border-gray-100 dark:border-border">
            <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-foreground-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Members Table */}
      <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-border flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 dark:text-foreground">Danh sách Thành viên</h2>
          <button className="text-sm text-primary font-medium hover:underline">+ Thêm thành viên</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-background-light text-left">
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Tên</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Sản phẩm</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Sản lượng (kg)</th>
                <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-border">
              {MOCK_MEMBERS.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-foreground">{m.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-foreground-muted">{m.product}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-foreground-muted">{m.qty}</td>
                  <td className="px-6 py-4 text-sm font-bold text-primary">{m.share}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/**
 * /cooperative/manage — Chỉ HTX_MANAGER mới truy cập được
 */
export default function CoopManagePage() {
  return (
    <ProtectedRoute roles={["HTX_MANAGER"]}>
      <CoopManageContent />
    </ProtectedRoute>
  );
}
