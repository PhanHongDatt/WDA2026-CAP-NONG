"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Shield,
  Users,
  Building2,
  Calendar,
  Search,
  CheckCircle2,
  XCircle,
  Ban,
  UserCheck,
} from "lucide-react";
import Pagination from "@/components/ui/Pagination";

/* ─── Types ─── */
type HtxStatus = "PENDING" | "APPROVED" | "REJECTED";

/* ─── Mock Data ─── */
const MOCK_HTX_REQUESTS: {
  id: string; name: string; registration_code: string;
  province: string; commune: string; description: string;
  creator_name: string; creator_phone: string; created_at: string;
  status: HtxStatus;
}[] = [
  {
    id: "htx-req-001",
    name: "HTX Trái Cây Cai Lậy",
    registration_code: "12345678",
    province: "Tiền Giang",
    commune: "Cai Lậy",
    description: "Hợp tác xã chuyên trồng xoài cát, sầu riêng, chôm chôm. Thành lập từ 2020.",
    creator_name: "Nguyễn Văn Hùng",
    creator_phone: "0912345678",
    created_at: "2026-03-18T10:30:00Z",
    status: "PENDING",
  },
  {
    id: "htx-req-002",
    name: "HTX Rau An Toàn Đà Lạt",
    registration_code: "87654321",
    province: "Lâm Đồng",
    commune: "Đà Lạt",
    description: "HTX chuyên rau sạch công nghệ cao, tiêu chuẩn VietGAP.",
    creator_name: "Trần Thị Mai",
    creator_phone: "0987654321",
    created_at: "2026-03-19T14:00:00Z",
    status: "PENDING" as const,
  },
  {
    id: "htx-req-003",
    name: "HTX Lúa Gạo An Giang",
    registration_code: "11223344",
    province: "An Giang",
    commune: "Châu Đốc",
    description: "HTX chuyên lúa gạo, xuất khẩu Campuchia.",
    creator_name: "Lê Minh Trí",
    creator_phone: "0911223344",
    created_at: "2026-03-15T09:00:00Z",
    status: "APPROVED",
  },
];

const MOCK_USERS = [
  { id: "u-001", full_name: "Nguyễn Thu Hà", phone: "0901111111", role: "BUYER", is_banned: false, created_at: "2026-01-15" },
  { id: "u-002", full_name: "Bác Ba Nhà Vườn", phone: "0902222222", role: "FARMER", is_banned: false, created_at: "2026-01-10" },
  { id: "u-003", full_name: "Chú Tư Bến Tre", phone: "0903333333", role: "HTX_MEMBER", is_banned: false, created_at: "2026-02-01" },
  { id: "u-004", full_name: "Anh Năm Quản Lý", phone: "0904444444", role: "HTX_MANAGER", is_banned: false, created_at: "2026-01-20" },
  { id: "u-005", full_name: "Phạm Quốc Bảo", phone: "0905555555", role: "FARMER", is_banned: true, created_at: "2026-02-18" },
  { id: "u-006", full_name: "Trương Thị Hoa", phone: "0906666666", role: "BUYER", is_banned: false, created_at: "2026-03-05" },
];

const PROVINCES = [
  "An Giang", "Bến Tre", "Đồng Tháp", "Hậu Giang", "Kiên Giang",
  "Lâm Đồng", "Long An", "Sóc Trăng", "Tiền Giang", "Vĩnh Long",
];
const CATEGORIES = [
  { code: "FRUIT", label: "Trái cây" },
  { code: "VEGETABLE", label: "Rau củ" },
  { code: "GRAIN", label: "Ngũ cốc" },
  { code: "TUBER", label: "Củ" },
  { code: "HERB", label: "Thảo mộc" },
  { code: "OTHER", label: "Khác" },
];

const MOCK_SEASONAL_CONFIG = [
  { id: 1, province: "Tiền Giang", category: "FRUIT", label: "Trái cây", start_month: 4, end_month: 8 },
  { id: 2, province: "Lâm Đồng", category: "VEGETABLE", label: "Rau củ", start_month: 1, end_month: 12 },
  { id: 3, province: "An Giang", category: "GRAIN", label: "Ngũ cốc", start_month: 5, end_month: 11 },
  { id: 4, province: "Bến Tre", category: "FRUIT", label: "Trái cây", start_month: 3, end_month: 9 },
];

const MONTHS = ["Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6","Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12"];

type Tab = "htx" | "users" | "seasonal";

const TAB_CONFIG = [
  { key: "htx" as Tab, label: "Duyệt HTX", icon: Building2 },
  { key: "users" as Tab, label: "Quản lý User", icon: Users },
  { key: "seasonal" as Tab, label: "Mùa vụ", icon: Calendar },
];

/* ─── Role badge colors ─── */
function roleBadge(role: string) {
  switch (role) {
    case "BUYER": return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case "FARMER": return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "HTX_MEMBER": return "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    case "HTX_MANAGER": return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    default: return "bg-gray-100 text-gray-600";
  }
}
function roleLabel(role: string) {
  switch (role) {
    case "BUYER": return "Người mua";
    case "FARMER": return "Nông dân";
    case "HTX_MEMBER": return "TV HTX";
    case "HTX_MANAGER": return "QL HTX";
    case "ADMIN": return "Admin";
    default: return role;
  }
}

/* ═══════════════════════════════════════════════ */
/*  ADMIN PAGE CONTENT                             */
/* ═══════════════════════════════════════════════ */
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

function AdminContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("htx");
  const [htxRequests, setHtxRequests] = useState(USE_MOCK ? MOCK_HTX_REQUESTS : []);
  const [users, setUsers] = useState(USE_MOCK ? MOCK_USERS : []);
  const [seasonalConfig, setSeasonalConfig] = useState(USE_MOCK ? MOCK_SEASONAL_CONFIG : []);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [userPage, setUserPage] = useState(1);
  const USERS_PER_PAGE = 5;

  /* ─── API Fetch (fallback to mock) ─── */
  const fetchUsers = useCallback(async () => {
    try {
      const adminApi = await import("@/services/api/admin");
      const result = await adminApi.getAllUsers();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const apiUsers: any[] = (result as any)?.content || (Array.isArray(result) ? result : []);
      if (apiUsers.length > 0) {
        setUsers(apiUsers.map((u: Record<string, unknown>) => ({
          id: String(u.id || ""),
          full_name: String(u.fullName || u.full_name || ""),
          phone: String(u.phone || ""),
          role: String(u.role || "BUYER"),
          is_banned: Boolean(u.banned || u.is_banned),
          created_at: String(u.createdAt || u.created_at || ""),
        })));
      }
    } catch {
      if (USE_MOCK) { setUsers(MOCK_USERS); }
    }
  }, []);

  const fetchHtxRequests = useCallback(async () => {
    try {
      const htxApi = await import("@/services/api/htx");
      const all = await htxApi.getAllHtx();
      if (Array.isArray(all) && all.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setHtxRequests(all.map((h: any) => ({
          id: String(h.id || ""),
          name: h.name || "",
          registration_code: h.officialCode || h.registration_code || "",
          province: h.province || "",
          commune: h.district || h.commune || "",
          description: h.description || "",
          creator_name: h.creatorName || h.managerName || "",
          creator_phone: h.creatorPhone || "",
          created_at: h.createdAt || h.created_at || "",
          status: (h.status || "PENDING") as HtxStatus,
        })));
      }
    } catch {
      if (USE_MOCK) { setHtxRequests(MOCK_HTX_REQUESTS); }
    }
  }, []);

  useEffect(() => { fetchUsers(); fetchHtxRequests(); }, [fetchUsers, fetchHtxRequests]);

  /* ─── HTX Actions → API + optimistic ─── */
  const handleApproveHtx = async (id: string) => {
    setHtxRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "APPROVED" as const } : r))
    );
    try {
      const adminApi = await import("@/services/api/admin");
      await adminApi.approveHtx(id);
    } catch { /* optimistic */ }
  };
  const handleRejectHtx = async (id: string) => {
    setHtxRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "REJECTED" as const } : r))
    );
    try {
      const adminApi = await import("@/services/api/admin");
      await adminApi.rejectHtx(id);
    } catch { /* optimistic */ }
  };

  /* ─── User Actions (API + optimistic UI) ─── */
  const handleToggleBan = async (id: string) => {
    const targetUser = users.find((u) => u.id === id);
    if (!targetUser) return;

    // Optimistic update
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, is_banned: !u.is_banned } : u))
    );

    try {
      const adminApi = await import("@/services/api/admin");
      if (targetUser.is_banned) {
        await adminApi.unbanUser(id);
      } else {
        await adminApi.banUser(id);
      }
    } catch {
      // Revert on error
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, is_banned: targetUser.is_banned } : u))
      );
    }
  };

  /* ─── Seasonal Config Actions ─── */
  const handleDeleteSeason = (id: number) => {
    setSeasonalConfig((prev) => prev.filter((s) => s.id !== id));
  };

  /* ─── Stats ─── */
  const pendingHtx = htxRequests.filter((r) => r.status === "PENDING").length;
  const totalUsers = users.length;
  const bannedUsers = users.filter((u) => u.is_banned).length;
  const totalSeasons = seasonalConfig.length;

  const filteredUsers = users.filter(
    (u) =>
      (u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery)) &&
      (roleFilter === "" || u.role === roleFilter)
  );
  const userTotalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice((userPage - 1) * USERS_PER_PAGE, userPage * USERS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-foreground flex items-center gap-3">
          <Shield className="w-8 h-8 text-primary" />
          Quản trị hệ thống
        </h1>
        <p className="text-foreground-muted mt-1">
          Xin chào, {user?.full_name} — Trang quản trị dành cho ADMIN
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "HTX chờ duyệt", value: pendingHtx, icon: Building2, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/30" },
          { label: "Tổng users", value: totalUsers, icon: Users, color: "text-primary bg-primary-50 dark:bg-primary-dark" },
          { label: "User bị ban", value: bannedUsers, icon: Ban, color: "text-red-500 bg-red-50 dark:bg-red-900/30" },
          { label: "Config mùa vụ", value: totalSeasons, icon: Calendar, color: "text-info bg-blue-50 dark:bg-blue-900/30" },
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

      {/* Tab Bar */}
      <div className="border-b border-gray-200 dark:border-border">
        <nav className="flex gap-0">
          {TAB_CONFIG.map((tab) => (
            <button type="button"
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 dark:text-foreground-muted hover:text-gray-700 dark:hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.key === "htx" && pendingHtx > 0 && (
                <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingHtx}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ═══ Tab: Duyệt HTX ═══ */}
      {activeTab === "htx" && (
        <div className="space-y-4">
          {htxRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6"
            >
              <div className="flex flex-col md:flex-row justify-between gap-4">
                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-foreground">
                      {req.name}
                    </h3>
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        req.status === "PENDING"
                          ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                          : req.status === "APPROVED"
                          ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {req.status === "PENDING" ? "⏳ Chờ duyệt" : req.status === "APPROVED" ? "✅ Đã duyệt" : "❌ Từ chối"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-foreground-muted">
                    {req.description}
                  </p>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 dark:text-foreground-muted">
                    <span>📍 {req.province}, {req.commune}</span>
                    <span>🏢 Mã HTX: {req.registration_code}</span>
                    <span>👤 {req.creator_name} ({req.creator_phone})</span>
                    <span>📅 {new Date(req.created_at).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>

                {/* Actions */}
                {req.status === "PENDING" && (
                  <div className="flex items-start gap-2 shrink-0">
                    <button type="button"
                      onClick={() => handleApproveHtx(req.id)}
                      className="flex items-center gap-1.5 bg-success text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Duyệt
                    </button>
                    <button type="button"
                      onClick={() => handleRejectHtx(req.id)}
                      className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <XCircle className="w-4 h-4" />
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {htxRequests.length === 0 && (
            <div className="text-center py-12 text-foreground-muted">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Không có yêu cầu HTX nào</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ Tab: Quản lý User ═══ */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Search + Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm theo tên hoặc SĐT..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setUserPage(1); }}
                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select
              aria-label="Lọc theo role"
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setUserPage(1); }}
              className="px-4 py-3 bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Tất cả role</option>
              <option value="BUYER">Người mua</option>
              <option value="FARMER">Nông dân</option>
              <option value="HTX_MEMBER">TV HTX</option>
              <option value="HTX_MANAGER">QL HTX</option>
            </select>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-background-light text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Họ tên</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">SĐT</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Role</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Trạng thái</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Ngày tạo</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-border">
                  {paginatedUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-foreground">
                        {u.full_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-foreground-muted">
                        {u.phone}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${roleBadge(u.role)}`}>
                          {roleLabel(u.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.is_banned ? (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                            🚫 Bị ban
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                            ✅ Hoạt động
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-foreground-muted">
                        {new Date(u.created_at).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button type="button"
                          onClick={() => handleToggleBan(u.id)}
                          className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-colors ${
                            u.is_banned
                              ? "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                              : "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          }`}
                        >
                          {u.is_banned ? (
                            <>
                              <UserCheck className="w-3.5 h-3.5" />
                              Unban
                            </>
                          ) : (
                            <>
                              <Ban className="w-3.5 h-3.5" />
                              Ban
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-foreground-muted">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Không tìm thấy user nào</p>
              </div>
            )}
            {/* Pagination */}
            {userTotalPages > 1 && (
              <div className="p-4 border-t border-border flex justify-center">
                <Pagination currentPage={userPage} totalPages={userTotalPages} onPageChange={setUserPage} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ Tab: Mùa vụ toàn quốc ═══ */}
      {activeTab === "seasonal" && (
        <div className="space-y-4">
          {/* Add new config */}
          <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-6">
            <h3 className="font-bold text-sm text-gray-900 dark:text-foreground mb-4">
              ➕ Thêm cấu hình mùa vụ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="season-province" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
                  Tỉnh
                </label>
                <select
                  id="season-province"
                  className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Chọn tỉnh...</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="season-category" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
                  Danh mục
                </label>
                <select
                  id="season-category"
                  className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Chọn danh mục...</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="season-start" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
                  Bắt đầu
                </label>
                <select
                  id="season-start"
                  className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="season-end" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">
                  Kết thúc
                </label>
                <select
                  id="season-end"
                  className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {MONTHS.map((m, i) => (
                    <option key={i} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="button" className="mt-4 bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Thêm cấu hình
            </button>
          </div>

          {/* Existing configs table */}
          <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-border">
              <h3 className="font-bold text-gray-900 dark:text-foreground">
                Cấu hình hiện tại ({seasonalConfig.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-background-light text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Tỉnh</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Danh mục</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Thời gian</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Trực quan</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-border">
                  {seasonalConfig.map((cfg) => (
                    <tr key={cfg.id} className="hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-foreground">
                        {cfg.province}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-foreground-muted">
                        {cfg.label}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-foreground-muted">
                        {MONTHS[cfg.start_month - 1]} → {MONTHS[cfg.end_month - 1]}
                      </td>
                      <td className="px-6 py-4">
                        {/* Season bar visualization */}
                        <div className="flex gap-[2px]">
                          {Array.from({ length: 12 }, (_, i) => {
                            const inSeason =
                              cfg.start_month <= cfg.end_month
                                ? i + 1 >= cfg.start_month && i + 1 <= cfg.end_month
                                : i + 1 >= cfg.start_month || i + 1 <= cfg.end_month;
                            return (
                              <div
                                key={i}
                                title={MONTHS[i]}
                                className={`w-4 h-4 rounded-sm ${
                                  inSeason
                                    ? "bg-primary"
                                    : "bg-gray-200 dark:bg-gray-700"
                                }`}
                              />
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button type="button"
                          onClick={() => handleDeleteSeason(cfg.id)}
                          className="text-red-400 hover:text-red-600 text-sm font-medium transition-colors"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * /admin — Chỉ ADMIN mới truy cập được
 * UC-10: Duyệt HTX
 * UC-37/42: Config mùa vụ toàn quốc
 * UC-40: Duyệt HTX pending
 * UC-41: Ban/unban user
 */
export default function AdminPage() {
  return (
    <ProtectedRoute roles={["ADMIN"]}>
      <AdminContent />
    </ProtectedRoute>
  );
}
