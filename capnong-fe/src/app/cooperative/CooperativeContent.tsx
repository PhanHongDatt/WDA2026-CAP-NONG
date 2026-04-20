"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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
 *   id, name, official_code, province, district, description,
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

export default function CooperativeContent() {
  const { user, isLoggedIn } = useAuth();
  const isFarmerOnly = user?.role === "FARMER";
  const isHtxMember = user?.role === "HTX_MEMBER" || user?.role === "HTX_MANAGER";

  /* UC-08: Join HTX */
  const [joinRequested, setJoinRequested] = useState<string | null>(null);

  /* UC-31: Pledge into Bundle */
  const [pledgingPoolId, setPledgingPoolId] = useState<string | null>(null);
  const [pledgeKg, setPledgeKg] = useState("");
  const [pledgedPools, setPledgedPools] = useState<Set<string>>(new Set());

  /* ─── API-first fetch for bundles + HTX list ─── */
  const [pools, setPools] = useState(USE_MOCK ? POOLS : []);
  const [activeHtx, setActiveHtx] = useState(USE_MOCK ? MOCK_ACTIVE_HTX : []);

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

  const fetchData = useCallback(async () => {
    try {
      const htxApi = await import("@/services/api/htx");
      const dashboardApi = await import("@/services/api/dashboard");
      const [apiBundles, apiHtxList, userSummary] = await Promise.all([
        htxApi.getOpenBundles().catch(() => null),
        htxApi.getAllHtx().catch(() => null),
        isLoggedIn ? dashboardApi.apiDashboardService.getFarmerSummary().catch(() => null) : Promise.resolve(null),
      ]);

      // Map bundles: BE snake_case → FE camelCase
      if (Array.isArray(apiBundles) && apiBundles.length > 0) {
        setPools(apiBundles.map(mapBundleToPool));
      } else if (USE_MOCK) {
        setPools(MOCK_POOLS);
      }

      // Map HTX list: BE snake_case → FE camelCase
      if (Array.isArray(apiHtxList) && apiHtxList.length > 0) {
        setActiveHtx(apiHtxList.map(mapHtxToDisplay));
      } else if (USE_MOCK) {
        setActiveHtx(MOCK_ACTIVE_HTX);
      }
      if (userSummary) {
        setSummaryData(userSummary);
      }
    } catch {
      if (USE_MOCK) {
        setPools(MOCK_POOLS);
        setActiveHtx(MOCK_ACTIVE_HTX);
      }
    }
  }, [isLoggedIn]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleJoinHtx = async (htxId: string) => {
    setJoinRequested(htxId);
    try {
      const htxApi = await import("@/services/api/htx");
      await htxApi.requestJoinHtx(htxId);
    } catch { /* optimistic — UI already updated */ }
  };

  const handlePledge = async (poolId: string) => {
    if (!pledgeKg || Number(pledgeKg) <= 0) return;
    setPledgedPools((prev) => new Set(prev).add(poolId));
    setPledgingPoolId(null);
    const qty = Number(pledgeKg);
    setPledgeKg("");
    try {
      const htxApi = await import("@/services/api/htx");
      await htxApi.addPledge(poolId, qty);
      // Reload data after pledge
      fetchData();
    } catch { /* optimistic */ }
  };

  /* UC-33: Cancel pledge */
  const handleCancelPledge = async (poolId: string) => {
    setPledgedPools((prev) => {
      const next = new Set(prev);
      next.delete(poolId);
      return next;
    });
    // Note: Để withdraw thật cần pledgeId, không phải poolId.
    // Hiện tại xóa local state trước, khi có pledgeId sẽ gọi htxApi.withdrawPledge()
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
        {isFarmerOnly && (
          <Link href="/cooperative/create" className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Tạo HTX mới
          </Link>
        )}
      </div>

      {/* Summary Cards — computed từ API data */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Tổng đơn hàng", value: summaryData?.totalOrders?.toString() || "0", icon: Users, color: "text-info bg-blue-50 dark:bg-blue-900/20" },
          { label: "Đơn chờ xử lý", value: summaryData?.pendingOrders?.toString() || "0", icon: Clock, color: "text-accent bg-red-50 dark:bg-red-900/20" },
          { label: "Đã hoàn thành", value: (summaryData ? (summaryData.totalOrders - summaryData.pendingOrders).toString() : "0"), icon: CheckCircle2, color: "text-success bg-green-50 dark:bg-green-900/20" },
          { label: "Tổng doanh thu", value: formatCurrency(summaryData?.grossRevenue || 0), icon: TrendingUp, color: "text-primary bg-primary-50 dark:bg-primary-dark" },
          { label: "Pool đang mở", value: String(openPools), icon: Flame, color: "text-accent bg-red-50 dark:bg-red-900/20" },
          { label: "Tổng người tham gia", value: String(totalParticipants), icon: Users, color: "text-info bg-blue-50 dark:bg-blue-900/20" },
          { label: "Đã hoàn thành", value: String(fulfilledPools), icon: CheckCircle2, color: "text-success bg-green-50 dark:bg-green-900/20" },
          { label: "Doanh thu gom đơn", value: formatCurrency(totalRevenue), icon: TrendingUp, color: "text-primary bg-primary-50 dark:bg-primary-dark" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-surface border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm">
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
            {activeHtx.map((htx) => (
              <div key={htx.id} className="bg-white dark:bg-surface border border-border rounded-xl p-5 space-y-3">
                <h3 className="font-bold text-gray-900 dark:text-foreground">{htx.name}</h3>
                <div className="text-sm text-gray-500 dark:text-foreground-muted space-y-1">
                  <p>📍 {htx.province}</p>
                  {htx.members > 0 && <p>👥 {htx.members} thành viên</p>}
                  <p>👤 QL: {htx.manager}</p>
                </div>
                {joinRequested === htx.id ? (
                  <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 font-medium">
                    <Clock className="w-4 h-4" /> Đã gửi yêu cầu — chờ duyệt
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleJoinHtx(htx.id)}
                    className="flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors w-full justify-center"
                  >
                    <UserPlus className="w-4 h-4" /> Xin gia nhập
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pool List (existing) — UC-31: thêm pledge form */}
      <section>
        <h2 className="text-xl font-bold mb-4">Danh sách Pool</h2>
        <div className="space-y-4">
          {pools.map((pool) => {
            const progress = pool.targetQty > 0
              ? Math.round((pool.currentQty / pool.targetQty) * 100)
              : 0;
            const isFulfilled = pool.status === "FULFILLED";
            const hasPledged = pledgedPools.has(pool.id);
            const isPledging = pledgingPoolId === pool.id;

            return (
              <div key={pool.id} className="bg-white dark:bg-surface border border-border rounded-xl p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${isFulfilled ? "bg-green-50 text-success dark:bg-green-900/30 dark:text-green-300" : "bg-red-50 text-accent dark:bg-red-900/30 dark:text-red-300"}`}>
                        {isFulfilled ? "✅ Đã hoàn thành" : "🔥 Đang gom"}
                      </span>
                      {hasPledged && (
                        <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                          ✓ Đã tham gia
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{pool.productName}</h3>
                    <p className="text-sm text-foreground-muted">
                      Giá: {formatCurrency(pool.pricePerUnit)}/{pool.unitCode.toLowerCase()} • {pool.participants} người tham gia • Hạn: {pool.deadline}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {!isFulfilled && isHtxMember && hasPledged && (
                      <button
                        type="button"
                        onClick={() => handleCancelPledge(pool.id)}
                        className="flex items-center gap-1.5 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        aria-label={`Rút khỏi Bundle ${pool.productName}`}
                      >
                        <LogOut className="w-3.5 h-3.5" /> Rút ra
                      </button>
                    )}
                    {!isFulfilled && isHtxMember && !hasPledged && (
                      <button
                        type="button"
                        onClick={() => setPledgingPoolId(isPledging ? null : pool.id)}
                        className="bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary-light transition-colors shrink-0"
                      >
                        Tham gia
                      </button>
                    )}
                    {!isFulfilled && !isHtxMember && !isLoggedIn && (
                      <span className="text-xs text-foreground-muted italic">Đăng nhập để tham gia</span>
                    )}
                  </div>
                </div>

                {/* UC-31: Pledge form */}
                {isPledging && (
                  <div className="mb-4 p-4 bg-primary/5 dark:bg-primary-dark rounded-lg border border-primary/20 space-y-3">
                    <p className="text-sm font-medium text-gray-900 dark:text-foreground">Nhập số kg bạn cam kết đóng góp:</p>
                    <div className="flex items-end gap-3">
                      <div>
                        <label htmlFor={`pledge-${pool.id}`} className="text-[10px] text-gray-400">Sản lượng ({pool.unitCode.toLowerCase()})</label>
                        <input
                          id={`pledge-${pool.id}`}
                          type="number"
                          min="1"
                          max={pool.targetQty - pool.currentQty}
                          value={pledgeKg}
                          onChange={(e) => setPledgeKg(e.target.value)}
                          placeholder={`Tối đa ${pool.targetQty - pool.currentQty} ${pool.unitCode.toLowerCase()}`}
                          className="w-40 px-3 py-2 border border-gray-200 dark:border-border rounded-lg text-sm bg-white dark:bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                        />
                      </div>
                      <button type="button" onClick={() => handlePledge(pool.id)} disabled={!pledgeKg || Number(pledgeKg) <= 0} className="bg-primary text-white px-5 py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity">
                        Xác nhận
                      </button>
                      <button type="button" onClick={() => { setPledgingPoolId(null); setPledgeKg(""); }} className="text-sm text-foreground-muted hover:underline">
                        Hủy
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                    <ProgressBar
                      value={progress}
                      className={`h-full rounded-full transition-all duration-700 ${isFulfilled ? "bg-success" : "bg-gradient-to-r from-primary to-primary-light"}`}
                    />
                  </div>
                  <span className="text-sm font-bold text-foreground-muted shrink-0">
                    {pool.currentQty.toLocaleString()}/{pool.targetQty.toLocaleString()} {pool.unitCode.toLowerCase()} ({progress}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>


    </div>
  );
}
