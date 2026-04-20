"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  Users,
  TrendingUp,
  Plus,
  Package,

  CheckCircle2,
  XCircle,
  UserPlus,
  Calendar,
  Trash2,
  ChevronDown,
  ChevronRight,
  User,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import ProgressBar from "@/components/ui/ProgressBar";

/* ─── Types ─── */
type ManageTab = "overview" | "members" | "bundles" | "seasonal";

/* ─── Mock Data ─── */
const MOCK_MEMBERS = [
  { id: "m-001", name: "Bác Ba Nhà Vườn", phone: "0902222222", product: "Cam sành", qty: 200, share: "20%", joined_at: "2026-01-15" },
  { id: "m-002", name: "Chú Tư Bến Tre", phone: "0903333333", product: "Bưởi da xanh", qty: 350, share: "35%", joined_at: "2026-01-20" },
  { id: "m-003", name: "Cô Năm Vĩnh Long", phone: "0907777777", product: "Cam sành", qty: 150, share: "15%", joined_at: "2026-02-01" },
  { id: "m-004", name: "Anh Sáu Cần Thơ", phone: "0908888888", product: "Xoài cát", qty: 300, share: "30%", joined_at: "2026-02-18" },
];

type JoinStatus = "PENDING" | "APPROVED" | "REJECTED";
const MOCK_JOIN_REQUESTS: {
  id: string; name: string; phone: string; reason: string; created_at: string; status: JoinStatus;
}[] = [
  { id: "jr-001", name: "Trần Văn Minh", phone: "0911111111", reason: "Muốn tham gia gom đơn bán sỉ cam sành", created_at: "2026-03-19T10:00:00Z", status: "PENDING" },
  { id: "jr-002", name: "Lê Thị Hồng", phone: "0922222222", reason: "Có 2 hecta vườn bưởi, muốn hợp tác tiêu thụ", created_at: "2026-03-20T08:00:00Z", status: "PENDING" },
];

type BundleStatus = "OPEN" | "FULL" | "CONFIRMED" | "EXPIRED" | "CANCELLED";
type PledgeStatus = "COMMITTED" | "DELIVERED" | "PARTIAL";

interface Pledge {
  id: string;
  farmer_name: string;
  farmer_phone: string;
  quantity_kg: number;
  status: PledgeStatus;
  note?: string;
  created_at: string;
}

interface Bundle {
  id: string;
  product_name: string;
  target_kg: number;
  current_kg: number;
  price_per_kg: number;
  deadline: string;
  status: BundleStatus;
  pledges: Pledge[];
}

const MOCK_BUNDLES: Bundle[] = [
  {
    id: "b-001",
    product_name: "Cam Sành Hà Giang",
    target_kg: 500,
    current_kg: 350,
    price_per_kg: 35000,
    deadline: "2026-04-01",
    status: "OPEN",
    pledges: [
      { id: "p-001", farmer_name: "Bác Ba Nhà Vườn", farmer_phone: "0902222222", quantity_kg: 150, status: "COMMITTED", created_at: "2026-03-20" },
      { id: "p-002", farmer_name: "Cô Năm Vĩnh Long", farmer_phone: "0907777777", quantity_kg: 100, status: "DELIVERED", note: "Đã giao kho trung tâm", created_at: "2026-03-21" },
      { id: "p-003", farmer_name: "Anh Sáu Cần Thơ", farmer_phone: "0908888888", quantity_kg: 100, status: "PARTIAL", note: "Mới giao 60kg, còn 40kg", created_at: "2026-03-22" },
    ],
  },
  {
    id: "b-002",
    product_name: "Bưởi Da Xanh Bến Tre",
    target_kg: 300,
    current_kg: 300,
    price_per_kg: 55000,
    deadline: "2026-03-25",
    status: "FULL",
    pledges: [
      { id: "p-004", farmer_name: "Chú Tư Bến Tre", farmer_phone: "0903333333", quantity_kg: 200, status: "DELIVERED", created_at: "2026-03-18" },
      { id: "p-005", farmer_name: "Bác Ba Nhà Vườn", farmer_phone: "0902222222", quantity_kg: 50, status: "COMMITTED", created_at: "2026-03-19" },
      { id: "p-006", farmer_name: "Cô Năm Vĩnh Long", farmer_phone: "0907777777", quantity_kg: 30, status: "COMMITTED", created_at: "2026-03-20" },
      { id: "p-007", farmer_name: "Anh Sáu Cần Thơ", farmer_phone: "0908888888", quantity_kg: 20, status: "DELIVERED", created_at: "2026-03-21" },
    ],
  },
  {
    id: "b-003",
    product_name: "Xoài Cát Hòa Lộc",
    target_kg: 1000,
    current_kg: 200,
    price_per_kg: 45000,
    deadline: "2026-03-15",
    status: "EXPIRED",
    pledges: [
      { id: "p-008", farmer_name: "Anh Sáu Cần Thơ", farmer_phone: "0908888888", quantity_kg: 120, status: "PARTIAL", note: "Mất mùa, chỉ thu hoạch được 80kg", created_at: "2026-03-10" },
      { id: "p-009", farmer_name: "Bác Ba Nhà Vườn", farmer_phone: "0902222222", quantity_kg: 80, status: "COMMITTED", note: "Chưa tới vụ thu hoạch", created_at: "2026-03-12" },
    ],
  },
];

const MOCK_SEASONAL = [
  { id: 1, category: "Trái cây", start_month: 3, end_month: 9 },
  { id: 2, category: "Rau củ", start_month: 10, end_month: 2 },
];
const MONTHS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];

const TAB_CONFIG = [
  { key: "overview" as ManageTab, label: "Tổng quan", icon: TrendingUp },
  { key: "members" as ManageTab, label: "Thành viên", icon: Users },
  { key: "bundles" as ManageTab, label: "Bundle gom đơn", icon: Package },
  { key: "seasonal" as ManageTab, label: "Mùa vụ", icon: Calendar },
];

function statusBadge(status: BundleStatus) {
  switch (status) {
    case "OPEN": return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    case "FULL": return "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
    case "CONFIRMED": return "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    case "EXPIRED": return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
    case "CANCELLED": return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
  }
}
function statusLabel(status: BundleStatus) {
  switch (status) {
    case "OPEN": return "🟢 Đang mở";
    case "FULL": return "🟡 Đủ SL";
    case "CONFIRMED": return "✅ Đã xác nhận";
    case "EXPIRED": return "⏰ Hết hạn";
    case "CANCELLED": return "❌ Đã hủy";
  }
}
function pledgeStatusBadge(status: PledgeStatus) {
  switch (status) {
    case "COMMITTED": return { class: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300", label: "📋 Cam kết" };
    case "DELIVERED": return { class: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300", label: "✅ Đã giao" };
    case "PARTIAL": return { class: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", label: "⚠️ Giao một phần" };
  }
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/* ═════════════════════════════════════════ */
function CoopManageContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ManageTab>("overview");
  const [joinRequests, setJoinRequests] = useState(USE_MOCK ? MOCK_JOIN_REQUESTS : []);
  const [members, setMembers] = useState(USE_MOCK ? MOCK_MEMBERS : []);
  const [bundles, setBundles] = useState<Bundle[]>(USE_MOCK ? MOCK_BUNDLES : []);
  const [seasonalConfig, setSeasonalConfig] = useState(USE_MOCK ? MOCK_SEASONAL : []);
  const [showNewBundle, setShowNewBundle] = useState(false);
  const [expandedBundle, setExpandedBundle] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  /* ─── API Fetch (fallback to mock) ─── */
  const fetchData = useCallback(async () => {
    try {
      const htxApi = await import("@/services/api/htx");
      const [apiMembers, apiBundles, apiJoinReqs] = await Promise.all([
        htxApi.getHtxMembers().catch(() => []),
        htxApi.getOpenBundles().catch(() => []),
        htxApi.getPendingJoinRequests().catch(() => []),
      ]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (Array.isArray(apiMembers) && apiMembers.length > 0) {
        setMembers(apiMembers.map((m: any) => ({
          id: String(m.id || ""),
          name: m.full_name || m.fullName || m.username || "",
          phone: m.phone || "",
          product: "",
          qty: 0,
          share: "",
          joined_at: m.created_at || m.createdAt || "",
        })));
      }
      if (Array.isArray(apiBundles) && apiBundles.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setBundles(apiBundles.map((b: any) => ({
          id: String(b.id || ""),
          product_name: b.product_name || "",
          target_kg: Number(b.target_quantity) || 0,
          current_kg: Number(b.current_pledged_quantity) || 0,
          price_per_kg: Number(b.price_per_unit) || 0,
          deadline: b.deadline || "",
          status: (b.status || "OPEN") as BundleStatus,
          pledges: Array.isArray(b.pledges) ? b.pledges.map((p: any) => ({
            id: String(p.id || ""),
            farmer_name: p.farmer_full_name || p.farmer_name || p.farmer_username || "",
            farmer_phone: p.farmer_phone || "",
            quantity_kg: Number(p.quantity) || 0,
            status: (p.status || "COMMITTED") as PledgeStatus,
            note: p.note || "",
            created_at: p.created_at || "",
          })) : [],
        })));
      }
      if (Array.isArray(apiJoinReqs) && apiJoinReqs.length > 0) {
        setJoinRequests(apiJoinReqs as typeof MOCK_JOIN_REQUESTS);
      }
    } catch {
      if (USE_MOCK) {
        setMembers(MOCK_MEMBERS);
        setBundles(MOCK_BUNDLES);
        setJoinRequests(MOCK_JOIN_REQUESTS);
      }
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // New bundle form
  const [newProduct, setNewProduct] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [deadlineError, setDeadlineError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  /* join request actions → API + optimistic */
  const handleApproveJoin = async (id: string) => {
    setJoinRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "APPROVED" as JoinStatus } : r));
    try {
      const htxApi = await import("@/services/api/htx");
      await htxApi.approveJoinRequest(id);
    } catch { /* optimistic */ }
  };
  const handleRejectJoin = async (id: string) => {
    setJoinRequests((prev) => prev.map((r) => r.id === id ? { ...r, status: "REJECTED" as JoinStatus } : r));
    try {
      const htxApi = await import("@/services/api/htx");
      await htxApi.rejectJoinRequest(id);
    } catch { /* optimistic */ }
  };

  /* bundle actions → API + optimistic */
  const handleConfirmBundle = async (id: string) => {
    setBundles((prev) => prev.map((b) => b.id === id ? { ...b, status: "CONFIRMED" as BundleStatus } : b));
    try {
      const htxApi = await import("@/services/api/htx");
      await htxApi.confirmBundle(id);
    } catch { /* optimistic */ }
  };
  const handleCancelBundle = async (id: string) => {
    setBundles((prev) => prev.map((b) => b.id === id ? { ...b, status: "CANCELLED" as BundleStatus } : b));
    try {
      const htxApi = await import("@/services/api/htx");
      await htxApi.cancelBundle(id);
    } catch { /* optimistic */ }
  };
  const handleCreateBundle = async () => {
    if (!newProduct.trim() || !newTarget || !newPrice) {
      setActionMessage({ type: "error", text: "Vui lòng điền đầy đủ: Loại nông sản, Mục tiêu (kg), Giá/kg" });
      return;
    }

    // === CHỐT CHẶN: Validate deadline ngay tại Frontend ===
    const todayStr = new Date().toISOString().split("T")[0];
    const finalDeadline = newDeadline || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0];

    if (finalDeadline < todayStr) {
      setDeadlineError("Hạn chót phải từ hôm nay trở đi!");
      setActionMessage({ type: "error", text: "❌ Hạn chót không hợp lệ — không được chọn ngày trong quá khứ!" });
      return;
    }
    setDeadlineError("");

    setIsCreating(true);
    try {
      const htxApi = await import("@/services/api/htx");
      const res: any = await htxApi.createBundle({
        productCategory: "OTHER",
        productName: newProduct,
        unitCode: "KG",
        targetQuantity: parseInt(newTarget),
        pricePerUnit: parseInt(newPrice),
        deadline: finalDeadline,
      });

      const newBundle: Bundle = {
        id: res?.id || `b-${Date.now()}`,
        product_name: res?.product_name || newProduct,
        target_kg: res?.target_kg || parseInt(newTarget),
        current_kg: 0,
        price_per_kg: res?.price_per_kg || parseInt(newPrice),
        deadline: res?.deadline || finalDeadline,
        status: "OPEN",
        pledges: [],
      };

      setBundles((prev) => [newBundle, ...prev]);
      setShowNewBundle(false);
      setNewProduct(""); setNewTarget(""); setNewPrice(""); setNewDeadline("");
      setActionMessage({ type: "success", text: "✅ Tạo bundle gom đơn thành công!" });
    } catch (err: any) {
      // Parse lỗi validation từ backend (400 Bad Request)
      const backendData = err?.response?.data?.data;
      const backendMsg = err?.response?.data?.message;
      if (backendData && typeof backendData === "object") {
        // Backend trả field-level errors: { deadline: "...", productName: "..." }
        const msgs = Object.values(backendData).join("; ");
        setActionMessage({ type: "error", text: `❌ ${msgs}` });
        if (backendData.deadline) setDeadlineError(backendData.deadline);
      } else {
        setActionMessage({ type: "error", text: `❌ ${backendMsg || "Lỗi tạo bundle"}` });
      }
    } finally {
      setIsCreating(false);
    }
  };

  const pendingJoin = joinRequests.filter((r) => r.status === "PENDING").length;
  const openBundles = bundles.filter((b) => b.status === "OPEN" || b.status === "FULL").length;

  const [confirmingKickId, setConfirmingKickId] = useState<string | null>(null);

  const handleKickMember = async (id: string, name: string) => {
    if (confirmingKickId !== id) {
      setConfirmingKickId(id);
      setTimeout(() => setConfirmingKickId(null), 5000); // auto-cancel after 5s
      return;
    }
    setConfirmingKickId(null);
    try {
      const htxApi = await import("@/services/api/htx");
      await htxApi.removeMember(id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
      setActionMessage({ type: "success", text: `Đã xóa thành viên "${name}" khỏi HTX thành công.` });
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosMsg = (err as any)?.response?.data?.message;
      const msg = axiosMsg || (err instanceof Error ? err.message : "Không thể xóa thành viên. Vui lòng thử lại.");
      setActionMessage({ type: "error", text: msg });
    }
    setTimeout(() => setActionMessage(null), 5000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
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
      </div>
      {/* Action feedback banner */}
      {actionMessage && (
        <div className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium ${
          actionMessage.type === "success"
            ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
            : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
        }`}>
          <span>{actionMessage.type === "success" ? "✅" : "❌"} {actionMessage.text}</span>
          <button type="button" onClick={() => setActionMessage(null)} className="ml-3 opacity-60 hover:opacity-100 text-lg leading-none">&times;</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Thành viên", value: members.length, icon: Users, color: "text-primary bg-primary-50 dark:bg-primary-dark" },
          { label: "Yêu cầu GN", value: pendingJoin, icon: UserPlus, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30" },
          { label: "Bundle đang mở", value: openBundles, icon: Package, color: "text-info bg-blue-50 dark:bg-blue-900/30" },
          { label: "Doanh thu tháng", value: formatCurrency(45600000), icon: TrendingUp, color: "text-success bg-green-50 dark:bg-green-900/30" },
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

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-border">
        <nav className="flex gap-0 overflow-x-auto">
          {TAB_CONFIG.map((tab) => (
            <button type="button"
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 dark:text-foreground-muted hover:text-gray-700 dark:hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.key === "members" && pendingJoin > 0 && (
                <span className="bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingJoin}</span>
              )}
              {tab.key === "bundles" && openBundles > 0 && (
                <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{openBundles}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ═══ Tab: Tổng quan ═══ */}
      {activeTab === "overview" && (
        <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-border">
            <h2 className="text-lg font-bold text-gray-900 dark:text-foreground">Danh sách Thành viên</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-background-light text-left">
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Tên</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">SĐT</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Sản phẩm</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">SL (kg)</th>
                  <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Tỷ lệ</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-border">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-foreground">{m.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-foreground-muted">{m.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-foreground-muted">{m.product}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-foreground-muted">{m.qty}</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">{m.share}</td>
                    <td className="px-6 py-4 text-right">
                      {confirmingKickId === m.id ? (
                        <div className="flex items-center gap-2 justify-end">
                          <button type="button" onClick={() => handleKickMember(m.id, m.name)} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-red-600 transition-colors">
                            Xác nhận xóa?
                          </button>
                          <button type="button" onClick={() => setConfirmingKickId(null)} className="text-gray-400 hover:text-gray-600 text-xs">
                            Hủy
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => handleKickMember(m.id, m.name)} className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors" title="Xóa thành viên">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══ Tab: Thành viên (Duyệt yêu cầu) ═══ */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-foreground">
            Yêu cầu gia nhập HTX ({joinRequests.filter(r => r.status === "PENDING").length} chờ duyệt)
          </h2>
          {joinRequests.map((req) => (
            <div key={req.id} className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-5">
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-gray-900 dark:text-foreground">{req.name}</p>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      req.status === "PENDING" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      : req.status === "APPROVED" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                    }`}>
                      {req.status === "PENDING" ? "⏳ Chờ" : req.status === "APPROVED" ? "✅ Đã duyệt" : "❌ Từ chối"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-foreground-muted">📱 {req.phone}</p>
                  <p className="text-sm text-gray-600 dark:text-foreground-muted">&quot;{req.reason}&quot;</p>
                  <p className="text-xs text-gray-400">{new Date(req.created_at).toLocaleDateString("vi-VN")}</p>
                </div>
                {req.status === "PENDING" && (
                  <div className="flex items-start gap-2 shrink-0">
                    <button type="button" onClick={() => handleApproveJoin(req.id)} className="flex items-center gap-1.5 bg-success text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                      <CheckCircle2 className="w-4 h-4" /> Duyệt
                    </button>
                    <button type="button" onClick={() => handleRejectJoin(req.id)} className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                      <XCircle className="w-4 h-4" /> Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {joinRequests.length === 0 && (
            <div className="text-center py-12 text-foreground-muted">
              <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có yêu cầu gia nhập nào</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ Tab: Bundle gom đơn ═══ */}
      {activeTab === "bundles" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-gray-900 dark:text-foreground">Quản lý Bundle</h2>
            <button type="button"
              onClick={() => setShowNewBundle(!showNewBundle)}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" /> Tạo Bundle mới
            </button>
          </div>

          {/* New Bundle Form */}
          {showNewBundle && (
            <div className="bg-white dark:bg-surface rounded-xl border-2 border-primary/20 p-6 space-y-4">
              <h3 className="font-bold text-sm text-gray-900 dark:text-foreground">🆕 Tạo Bundle gom đơn mới</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="bundle-product" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">Loại nông sản *</label>
                  <input id="bundle-product" type="text" value={newProduct} onChange={(e) => setNewProduct(e.target.value)} placeholder="VD: Cam Sành Hà Giang" className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label htmlFor="bundle-target" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">Mục tiêu (kg) *</label>
                  <input id="bundle-target" type="number" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} placeholder="500" className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label htmlFor="bundle-price" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">Giá/kg (VNĐ) *</label>
                  <input id="bundle-price" type="number" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} placeholder="35000" className="w-full px-3 py-2 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label htmlFor="bundle-deadline" className="block text-xs font-medium text-gray-500 dark:text-foreground-muted mb-1">Deadline gom *</label>
                  <input id="bundle-deadline" type="date" min={new Date().toISOString().split("T")[0]} value={newDeadline} onChange={(e) => {
                    setNewDeadline(e.target.value);
                    const today = new Date().toISOString().split("T")[0];
                    if (e.target.value && e.target.value < today) {
                      setDeadlineError("Hạn chót phải từ hôm nay trở đi!");
                    } else {
                      setDeadlineError("");
                    }
                  }} className={`w-full px-3 py-2 bg-white dark:bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 ${deadlineError ? "border-red-500 focus:ring-red-300" : "border-gray-200 dark:border-border focus:ring-primary/30"}`} />
                  {deadlineError && <p className="text-red-500 text-xs mt-1 font-medium">⚠️ {deadlineError}</p>}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleCreateBundle} disabled={isCreating || !newProduct.trim() || !newTarget || !newPrice || !!deadlineError} className="bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">{isCreating ? "Đang tạo..." : "Tạo Bundle"}</button>
                <button type="button" onClick={() => setShowNewBundle(false)} className="border border-gray-200 dark:border-border px-6 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-foreground-muted hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors">Hủy</button>
              </div>
            </div>
          )}

          {/* Bundle Cards */}
          {bundles.map((bundle) => {
            const pct = Math.min(100, Math.round((bundle.current_kg / bundle.target_kg) * 100));
            const isExpanded = expandedBundle === bundle.id;
            const deliveredKg = bundle.pledges.filter(p => p.status === "DELIVERED").reduce((s, p) => s + p.quantity_kg, 0);
            const committedKg = bundle.pledges.filter(p => p.status === "COMMITTED").reduce((s, p) => s + p.quantity_kg, 0);
            const partialKg = bundle.pledges.filter(p => p.status === "PARTIAL").reduce((s, p) => s + p.quantity_kg, 0);

            return (
              <div key={bundle.id} className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border overflow-hidden">
                {/* Bundle header */}
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-gray-900 dark:text-foreground">{bundle.product_name}</h3>
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusBadge(bundle.status)}`}>
                          {statusLabel(bundle.status)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 dark:text-foreground-muted">
                        <span>🎯 {bundle.current_kg}/{bundle.target_kg} kg</span>
                        <span>💰 {formatCurrency(bundle.price_per_kg)}/kg</span>
                        <span>👥 {bundle.pledges.length} farmer</span>
                        <span>📅 Deadline: {new Date(bundle.deadline).toLocaleDateString("vi-VN")}</span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <ProgressBar
                          value={pct}
                          className={`h-full rounded-full transition-all duration-700 ${
                            pct >= 100 ? "bg-success" : "bg-gradient-to-r from-primary to-primary-light"
                          }`}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">
                          Tổng giá trị: {formatCurrency(bundle.current_kg * bundle.price_per_kg)} / {formatCurrency(bundle.target_kg * bundle.price_per_kg)}
                        </p>
                        <button
                          type="button"
                          onClick={() => setExpandedBundle(isExpanded ? null : bundle.id)}
                          className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                        >
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                          {isExpanded ? "Ẩn chi tiết" : `Xem ${bundle.pledges.length} cam kết`}
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-start gap-2 shrink-0">
                      {bundle.status === "FULL" && (
                        <button type="button" onClick={() => handleConfirmBundle(bundle.id)} className="flex items-center gap-1.5 bg-success text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
                          <CheckCircle2 className="w-4 h-4" /> Xác nhận
                        </button>
                      )}
                      {(bundle.status === "OPEN" || bundle.status === "FULL") && (
                        <button type="button" onClick={() => handleCancelBundle(bundle.id)} className="flex items-center gap-1.5 text-red-500 border border-red-200 dark:border-red-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <XCircle className="w-4 h-4" /> Hủy
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pledge detail panel */}
                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-border bg-gray-50/50 dark:bg-background-light/50">
                    {/* Summary bar */}
                    <div className="px-5 py-3 flex flex-wrap gap-4 text-xs border-b border-gray-100 dark:border-border">
                      <span className="text-green-700 dark:text-green-300 font-medium">✅ Đã giao: {deliveredKg} kg</span>
                      <span className="text-blue-700 dark:text-blue-300 font-medium">📋 Cam kết: {committedKg} kg</span>
                      {partialKg > 0 && <span className="text-amber-700 dark:text-amber-300 font-medium">⚠️ Giao một phần: {partialKg} kg</span>}
                      <span className="text-gray-500 font-medium">
                        Còn thiếu: {Math.max(0, bundle.target_kg - bundle.current_kg)} kg
                      </span>
                    </div>

                    {/* Pledge list */}
                    <div className="divide-y divide-gray-100 dark:divide-border">
                      {bundle.pledges.map((pledge) => {
                        const ps = pledgeStatusBadge(pledge.status);
                        return (
                          <div key={pledge.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-foreground truncate">{pledge.farmer_name}</p>
                                <p className="text-[11px] text-gray-400">{pledge.farmer_phone} • {new Date(pledge.created_at).toLocaleDateString("vi-VN")}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4">
                              <span className="text-sm font-bold text-gray-900 dark:text-foreground whitespace-nowrap">
                                {pledge.quantity_kg} kg
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${ps.class}`}>
                                {ps.label}
                              </span>
                            </div>
                            {pledge.note && (
                              <p className="text-[11px] text-gray-500 dark:text-foreground-muted italic flex items-start gap-1 sm:max-w-[200px]">
                                <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                {pledge.note}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {bundle.pledges.length === 0 && (
                      <div className="text-center py-6 text-gray-400 text-sm">
                        Chưa có farmer nào cam kết cho bundle này
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {bundles.length === 0 && (
            <div className="text-center py-12 text-foreground-muted">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có bundle nào. Tạo bundle mới để bắt đầu gom đơn!</p>
            </div>
          )}
        </div>
      )}

      {/* ═══ Tab: Mùa vụ vùng HTX ═══ */}
      {activeTab === "seasonal" && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-foreground">
            Cấu hình mùa vụ — {user?.htx_name || "HTX"} ({MOCK_MEMBERS[0]?.product && "Bến Tre"})
          </h2>
          <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-background-light text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Danh mục</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Thời gian</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Trực quan</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-border">
                  {seasonalConfig.map((cfg) => (
                    <tr key={cfg.id} className="hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-foreground">{cfg.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-foreground-muted">{MONTHS[cfg.start_month - 1]} → {MONTHS[cfg.end_month - 1]}</td>
                      <td className="px-6 py-4">
                        <div className="flex gap-[2px]">
                          {Array.from({ length: 12 }, (_, i) => {
                            const m = i + 1;
                            const inSeason = cfg.start_month <= cfg.end_month
                              ? m >= cfg.start_month && m <= cfg.end_month
                              : m >= cfg.start_month || m <= cfg.end_month;
                            return <div key={i} title={MONTHS[i]} className={`w-4 h-4 rounded-sm ${inSeason ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`} />;
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button type="button" aria-label="Xóa cấu hình mùa vụ" onClick={() => setSeasonalConfig((prev) => prev.filter((s) => s.id !== cfg.id))} className="text-red-400 hover:text-red-600 text-sm transition-colors">
                          <Trash2 className="w-4 h-4" />
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
 * /cooperative/manage — Chỉ HTX_MANAGER mới truy cập
 * UC-07: Tạo HTX (implicit — đã tạo)
 * UC-09: Duyệt/Từ chối thành viên HTX
 * UC-29: Tạo Bundle gom đơn
 * UC-30: Farmer cam kết (pledge) vào Bundle
 * UC-34: Confirm Bundle
 * UC-36: Config mùa vụ vùng HTX
 */
export default function CoopManagePage() {
  return (
    <ProtectedRoute roles={["HTX_MANAGER"]}>
      <CoopManageContent />
    </ProtectedRoute>
  );
}
