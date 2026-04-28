"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Flame,
  Users,
  Clock,
  TrendingUp,
  CheckCircle2,
  Plus,
  Building2,
  UserPlus,
  LogOut,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import ProgressBar from "@/components/ui/ProgressBar";

/* ─── Display interface — khớp 1:1 với BE BundleResponseDto (snake_case qua WebConfig) ─── */
interface PoolDisplay {
  id: string;
  productName: string;       // ← BE: product_name
  targetQty: number;         // ← BE: target_quantity
  currentQty: number;        // ← BE: current_pledged_quantity
  pricePerUnit: number;      // ← BE: price_per_unit
  unitCode: string;          // ← BE: unit_code
  participants: number;      // ← BE: pledges.length
  deadline: string;          // ← BE: deadline (LocalDate)
  status: "OPEN" | "FULFILLED";
}

/* ─── Display interface — khớp 1:1 với BE HtxResponse (snake_case qua WebConfig) ─── */
interface HtxDisplay {
  id: string;
  name: string;              // ← BE: name
  province: string;          // ← BE: province
  members: number;           // ← BE: HtxResponse KHÔNG có totalMembers, dùng 0 fallback
  manager: string;           // ← BE: manager_full_name || manager_username
}

/* ─── Mock Data (fallback khi API chưa sẵn) ─── */
const MOCK_POOLS: PoolDisplay[] = [
  { id: "mock-1", productName: "Cam sành Vĩnh Long - Bến Tre", targetQty: 1000, currentQty: 650, pricePerUnit: 35000, unitCode: "KG", participants: 12, deadline: "17/03/2026", status: "OPEN" },
  { id: "mock-2", productName: "Sầu riêng Ri6 Đắk Lắk", targetQty: 500, currentQty: 500, pricePerUnit: 115000, unitCode: "KG", participants: 8, deadline: "12/03/2026", status: "FULFILLED" },
  { id: "mock-3", productName: "Bưởi da xanh Bến Tre", targetQty: 800, currentQty: 320, pricePerUnit: 58000, unitCode: "KG", participants: 6, deadline: "20/03/2026", status: "OPEN" },
];



const MOCK_ACTIVE_HTX: HtxDisplay[] = [
  { id: "htx-001", name: "HTX Trái Cây Bến Tre", province: "Bến Tre", members: 15, manager: "Nguyễn Văn A" },
  { id: "htx-002", name: "HTX Nông Sản Vĩnh Long", province: "Vĩnh Long", members: 22, manager: "Trần Thị B" },
  { id: "htx-003", name: "HTX Cam Hà Giang", province: "Hà Giang", members: 10, manager: "Lê Văn C" },
];

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/**
 * Map BE snake_case BundleResponseDto → FE PoolDisplay (camelCase UI).
 *
 * BE BundleResponseDto fields (after SNAKE_CASE serialization):
 *   id, htx_shop, product_category, product_name, unit_code,
 *   target_quantity, current_pledged_quantity, progress_percent,
 *   price_per_unit, deadline, status, description, min_pledge_quantity,
 *   pledges (List<PledgeResponseDto>), created_at
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBundleToPool(b: any): PoolDisplay {
  return {
    id: String(b.id || ""),
    productName: b.product_name || "",
    targetQty: Number(b.target_quantity) || 0,
    currentQty: Number(b.current_pledged_quantity) || 0,
    pricePerUnit: Number(b.price_per_unit) || 0,
    unitCode: b.unit_code || "KG",
    participants: Array.isArray(b.pledges) ? b.pledges.length : 0,
    deadline: b.deadline
      ? new Date(b.deadline).toLocaleDateString("vi-VN")
      : "—",
    status:
      b.status === "FULL" ||
        b.status === "CONFIRMED" ||
        Number(b.current_pledged_quantity) >= Number(b.target_quantity)
        ? "FULFILLED"
        : "OPEN",
  };
}

/**
 * Map BE snake_case HtxResponse → FE HtxDisplay (camelCase UI).
 *
 * BE HtxResponse fields (after SNAKE_CASE serialization):
 *   id, name, official_code, province, ward, description,
 *   document_url, status, admin_note, created_at,
 *   manager_id, manager_username, manager_full_name,
 *   created_by_user_id, created_by_username
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHtxToDisplay(h: any): HtxDisplay {
  return {
    id: String(h.id || ""),
    name: h.name || "",
    province: h.province || "",
    members: 0, // HtxResponse không có totalMembers, chỉ HtxResponseDto có
    manager: h.manager_full_name || h.manager_username || "",
  };
}

/* ─── HTX Join Card Component ─── */
function HtxJoinCard({
  htx,
  myJoinRequests,
  joinRequested,
  hasAnyPendingRequest,
  onRequestJoin,
}: {
  htx: HtxDisplay;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  myJoinRequests: any[];
  joinRequested: string | null;
  hasAnyPendingRequest?: boolean;
  onRequestJoin: () => void;
}) {
  const [showHistory, setShowHistory] = useState(false);

  // Get ALL requests for this HTX, sorted by created_at desc (latest first)
  const allReqs = myJoinRequests
    .filter((r) => (r.htx_id || r.htxId) === htx.id)
    .sort((a, b) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime());

  // The latest request determines the current status
  const latestReq = allReqs[0] || (joinRequested === htx.id ? { status: "PENDING", created_at: new Date().toISOString() } : null);

  const statusConfig: Record<string, { label: string; emoji: string; bg: string; text: string }> = {
    PENDING: { label: "Chờ duyệt", emoji: "⏳", bg: "bg-amber-50 dark:bg-amber-900/10", text: "text-amber-600 dark:text-amber-400" },
    APPROVED: { label: "Đã duyệt", emoji: "✅", bg: "bg-green-50 dark:bg-green-900/10", text: "text-green-600 dark:text-green-400" },
    REJECTED: { label: "Bị từ chối", emoji: "❌", bg: "bg-red-50 dark:bg-red-900/10", text: "text-red-600 dark:text-red-400" },
  };

  return (
    <div className="bg-white dark:bg-surface border border-border rounded-xl p-5 space-y-3">
      <h3 className="font-bold text-gray-900 dark:text-foreground">{htx.name}</h3>
      <div className="text-sm text-gray-500 dark:text-foreground-muted space-y-1">
        <p>📍 {htx.province}</p>
        {htx.members > 0 && <p>👥 {htx.members} thành viên</p>}
        <p>👤 QL: {htx.manager}</p>
      </div>

      {/* Current status */}
      {latestReq?.status === "PENDING" && (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 font-medium p-2 bg-amber-50 dark:bg-amber-900/10 rounded-lg justify-center">
          <Clock className="w-4 h-4" /> Đã gửi yêu cầu — chờ duyệt
        </div>
      )}

      {latestReq?.status === "APPROVED" && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 font-medium p-2 bg-green-50 dark:bg-green-900/10 rounded-lg justify-center">
          <CheckCircle2 className="w-4 h-4" /> Yêu cầu đã được duyệt
        </div>
      )}

      {latestReq?.status === "REJECTED" && (
        <div className="space-y-2">
          <div className="flex flex-col gap-1 p-2 bg-red-50 dark:bg-red-900/10 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 font-medium justify-center">
              <XCircle className="w-4 h-4" /> Yêu cầu gần nhất bị từ chối
            </div>
            {latestReq.note && <p className="text-xs text-red-600/80 dark:text-red-400/80 text-center italic">&quot;{latestReq.note}&quot;</p>}
          </div>
          <button
            type="button"
            disabled={hasAnyPendingRequest}
            onClick={onRequestJoin}
            title={hasAnyPendingRequest ? "Bạn đang chờ duyệt ở một HTX khác" : "Gửi lại yêu cầu gia nhập"}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium w-full justify-center transition-colors ${
              hasAnyPendingRequest
                ? "bg-gray-100/50 text-gray-400 cursor-not-allowed dark:bg-gray-800/50 dark:text-gray-500 border border-transparent"
                : "border border-primary/20 text-primary hover:bg-primary/5"
            }`}
          >
            Gửi lại yêu cầu
          </button>
        </div>
      )}

      {/* No request yet — show join button */}
      {!latestReq && (
        <button
          type="button"
          disabled={hasAnyPendingRequest}
          onClick={onRequestJoin}
          title={hasAnyPendingRequest ? "Bạn đang chờ duyệt ở một HTX khác" : "Xin gia nhập HTX"}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium w-full justify-center transition-colors ${
            hasAnyPendingRequest
              ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
              : "bg-primary/10 text-primary hover:bg-primary/20"
          }`}
        >
          <UserPlus className="w-4 h-4" /> Xin gia nhập
        </button>
      )}

      {/* History toggle */}
      {allReqs.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium w-full justify-center py-1"
          >
            {showHistory ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showHistory ? "Ẩn lịch sử" : `Xem lịch sử (${allReqs.length} lần gửi)`}
          </button>

          {showHistory && (
            <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto">
              {allReqs.map((req, i) => {
                const cfg = statusConfig[req.status] || { label: req.status, emoji: "❓", bg: "bg-gray-50", text: "text-gray-500" };
                return (
                  <div key={req.id || i} className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs ${cfg.bg}`}>
                    <div className="flex items-center gap-2 min-w-0">
                      <span>{cfg.emoji}</span>
                      <span className={`font-medium ${cfg.text}`}>{cfg.label}</span>
                      {req.note && <span className="text-gray-400 truncate italic">— {req.note}</span>}
                    </div>
                    <span className="text-gray-400 shrink-0">
                      {req.created_at ? new Date(req.created_at).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CooperativeContent() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const isFarmerOnly = user?.role === "FARMER";
  const isHtxMember = user?.role === "HTX_MEMBER" || user?.role === "HTX_MANAGER";

  // HTX_MEMBER / HTX_MANAGER → redirect to /cooperative/me
  useEffect(() => {
    if (isHtxMember) {
      router.replace("/cooperative/me");
    }
  }, [isHtxMember, router]);

  /* UC-08: Join HTX */
  const [joinRequested, setJoinRequested] = useState<string | null>(null);
  const [showJoinModalId, setShowJoinModalId] = useState<string | null>(null);
  const [joinMessage, setJoinMessage] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  /* UC-31: Pledge into Bundle */
  const [pledgingPoolId, setPledgingPoolId] = useState<string | null>(null);
  const [pledgeKg, setPledgeKg] = useState("");
  const [pledgedPools, setPledgedPools] = useState<Set<string>>(new Set());
  const [pledgeIdMap, setPledgeIdMap] = useState<Map<string, string>>(new Map()); // poolId → pledgeId

  /* Leave HTX */
  const [leavingHtx, setLeavingHtx] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);

  /* ─── API-first fetch for bundles + HTX list ─── */
  /* Dashboard Summary Data */
  const [summaryData, setSummaryData] = useState<{
    totalOrders: number;
    pendingOrders: number;
    outOfStockProducts: number;
    grossRevenue: number;
    netRevenue: number;
  } | null>(null);
  const [pools, setPools] = useState<PoolDisplay[]>(USE_MOCK ? MOCK_POOLS : []);
  const [activeHtx, setActiveHtx] = useState<HtxDisplay[]>(USE_MOCK ? MOCK_ACTIVE_HTX : []);

  const [myJoinRequests, setMyJoinRequests] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const htxApi = await import("@/services/api/htx");
      const dashboardApi = await import("@/services/api/dashboard");
      const [apiBundles, apiHtxList, userSummary, myReqs] = await Promise.all([
        htxApi.getOpenBundles().catch(() => null),
        htxApi.getAllHtx().catch(() => null),
        isLoggedIn ? dashboardApi.apiDashboardService.getFarmerSummary().catch(() => null) : Promise.resolve(null),
        // Only FARMER can call my-join-requests; HTX_MEMBER/MANAGER would get Access Denied
        isFarmerOnly ? htxApi.getMyJoinRequests().catch(() => []) : Promise.resolve([]),
      ]);

      // Map bundles: BE snake_case → FE camelCase
      if (Array.isArray(apiBundles) && apiBundles.length > 0) {
        setPools(apiBundles.map(mapBundleToPool));
      }

      // Map HTX list: BE snake_case → FE camelCase
      if (Array.isArray(apiHtxList) && apiHtxList.length > 0) {
        setActiveHtx(apiHtxList.map(mapHtxToDisplay));
      }
      if (userSummary) {
        setSummaryData(userSummary);
      }
      if (Array.isArray(myReqs)) {
        setMyJoinRequests(myReqs);
      }
    } catch (err) {
      console.error("Failed to fetch cooperative data:", err);
      // No mock fallback — show empty state
    }
  }, [isLoggedIn, isFarmerOnly]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const confirmJoinHtx = async () => {
    if (!showJoinModalId) return;
    setIsJoining(true);
    try {
      const htxApi = await import("@/services/api/htx");
      await htxApi.requestJoinHtx(showJoinModalId, joinMessage);
      setJoinRequested(showJoinModalId);
      setShowJoinModalId(null);
      setJoinMessage("");
      // Refresh join requests so the UI updates (button → "chờ duyệt")
      await fetchData();
    } catch { /* optimistic — UI already updated */ }
    setIsJoining(false);
  };

  const handlePledge = async (poolId: string) => {
    if (!pledgeKg || Number(pledgeKg) <= 0) return;
    setPledgedPools((prev) => new Set(prev).add(poolId));
    setPledgingPoolId(null);
    const qty = Number(pledgeKg);
    setPledgeKg("");
    try {
      const htxApi = await import("@/services/api/htx");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await htxApi.addPledge(poolId, qty);
      // Store pledgeId for later withdraw
      if (result?.id) {
        setPledgeIdMap((prev) => new Map(prev).set(poolId, String(result.id)));
      }
      // Reload data after pledge
      fetchData();
    } catch { /* optimistic */ }
  };

  /* UC-33: Cancel pledge — gọi API thật */
  const handleCancelPledge = async (poolId: string) => {
    const pledgeId = pledgeIdMap.get(poolId);
    if (!pledgeId) {
      // Fallback: xóa local state, log warning
      console.warn("Không tìm thấy pledgeId cho pool", poolId);
      setPledgedPools((prev) => {
        const next = new Set(prev);
        next.delete(poolId);
        return next;
      });
      return;
    }
    // Optimistic UI update
    setPledgedPools((prev) => {
      const next = new Set(prev);
      next.delete(poolId);
      return next;
    });
    try {
      const htxApi = await import("@/services/api/htx");
      await htxApi.withdrawPledge(pledgeId);
      setPledgeIdMap((prev) => {
        const next = new Map(prev);
        next.delete(poolId);
        return next;
      });
      fetchData();
    } catch {
      // Revert on error
      setPledgedPools((prev) => new Set(prev).add(poolId));
    }
  };

  /* UC: Rời HTX (HTX_MEMBER) */
  const handleLeaveHtx = async () => {
    setLeavingHtx(true);
    setLeaveError(null);
    try {
      const htxApi = await import("@/services/api/htx");
      await htxApi.leaveHtx();
      // Refresh user context to reflect role change
      const { refreshProfile } = await import("@/contexts/AuthContext").then(() => ({
        refreshProfile: async () => {
          // Trigger auth-changed event to reload user profile
          window.dispatchEvent(new Event("auth-changed"));
        }
      }));
      await refreshProfile();
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const msg = (err as any)?.response?.data?.message || (err instanceof Error ? err.message : "Không thể rời HTX.");
      setLeaveError(msg);
    } finally {
      setLeavingHtx(false);
    }
  };

  /* ─── Computed stats từ data thật ─── */
  const openPools = pools.filter((p) => p.status === "OPEN").length;
  const totalParticipants = pools.reduce((s, p) => s + p.participants, 0);
  const fulfilledPools = pools.filter((p) => p.status === "FULFILLED").length;
  const totalRevenue = pools
    .filter((p) => p.status === "FULFILLED")
    .reduce((s, p) => s + p.currentQty * p.pricePerUnit, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">🤝 Dashboard Gom Đơn</h1>
          <p className="text-foreground-muted mt-1">
            Hợp tác xã kỹ thuật số — Gom đơn thông minh, chia lợi nhuận công bằng
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isHtxMember && user?.role === "HTX_MEMBER" && (
            <>
              <button
                type="button"
                onClick={handleLeaveHtx}
                disabled={leavingHtx}
                className="flex items-center gap-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {leavingHtx ? "Đang rời..." : "Rời HTX"}
              </button>
            </>
          )}
          {isFarmerOnly && (
            <Link href="/cooperative/create" className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" /> Tạo HTX mới
            </Link>
          )}
        </div>
      </div>

      {/* Leave HTX error/warning */}
      {leaveError && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg px-4 py-3 text-sm">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{leaveError}</span>
          <button type="button" onClick={() => setLeaveError(null)} className="ml-auto opacity-60 hover:opacity-100 text-lg leading-none">&times;</button>
        </div>
      )}

      {/* Summary Cards — computed từ API data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng đơn hàng", value: summaryData?.totalOrders?.toString() || "0", icon: Users, color: "text-info bg-blue-50 dark:bg-blue-900/20" },
          { label: "Đơn chờ xử lý", value: summaryData?.pendingOrders?.toString() || "0", icon: Clock, color: "text-accent bg-red-50 dark:bg-red-900/20" },
          { label: "Đã hoàn thành", value: (summaryData ? (summaryData.totalOrders - summaryData.pendingOrders).toString() : "0"), icon: CheckCircle2, color: "text-success bg-green-50 dark:bg-green-900/20" },
          { label: "Tổng doanh thu", value: formatCurrency(summaryData?.grossRevenue || 0), icon: TrendingUp, color: "text-primary bg-primary-50 dark:bg-primary-dark" },
          { label: "Pool đang mở", value: String(openPools), icon: Flame, color: "text-accent bg-red-50 dark:bg-red-900/20" },
          { label: "Tổng người tham gia", value: String(totalParticipants), icon: Users, color: "text-info bg-blue-50 dark:bg-blue-900/20" },
          { label: "Pool hoàn thành", value: String(fulfilledPools), icon: CheckCircle2, color: "text-success bg-green-50 dark:bg-green-900/20" },
          { label: "Doanh thu gom đơn", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-primary bg-primary-50 dark:bg-primary-dark" },
        ].map((stat, i) => (
          <div key={`${stat.label}-${i}`} className="bg-white dark:bg-surface border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-foreground-muted font-medium uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg font-black text-foreground">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ═══ UC-08: Xin gia nhập HTX (chỉ FARMER chưa có HTX) ═══ */}
      {isFarmerOnly && (
        <section>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" /> Các HTX đang hoạt động
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeHtx.map((htx) => {
              const hasAnyPendingRequest = myJoinRequests.some((r) => r.status === "PENDING") || joinRequested !== null;
              return (
                <HtxJoinCard
                  key={htx.id}
                  htx={htx}
                  myJoinRequests={myJoinRequests}
                  joinRequested={joinRequested}
                  hasAnyPendingRequest={hasAnyPendingRequest}
                  onRequestJoin={() => setShowJoinModalId(htx.id)}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* Join Modal */}
      {showJoinModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface w-full max-w-md rounded-2xl p-6 shadow-xl relative animate-[fadeIn_0.2s_ease-out]">
            <h3 className="text-xl font-bold mb-3 text-foreground">Gửi yêu cầu gia nhập</h3>
            <p className="text-sm text-foreground-muted mb-4 leading-relaxed">
              Vui lòng để lại lời nhắn cho Quản lý Hợp tác xã (không bắt buộc):
            </p>
            <textarea
              className="w-full border border-border rounded-xl p-3 bg-background min-h-[100px] mb-4 outline-none focus:border-primary transition-colors text-sm resize-none text-foreground"
              placeholder="VD: Chào anh/chị, tôi là nông dân tại khu vực..."
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
            />
            <div className="flex gap-3 justify-end items-center">
              <button
                className="px-4 py-2 rounded-lg font-medium text-foreground-muted hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm"
                onClick={() => { setShowJoinModalId(null); setJoinMessage(""); }}
                disabled={isJoining}
              >
                Hủy
              </button>
              <button
                className="bg-primary text-white px-5 py-2 rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50 text-sm"
                onClick={confirmJoinHtx}
                disabled={isJoining}
              >
                {isJoining ? "Đang gửi..." : "Gửi yêu cầu"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
