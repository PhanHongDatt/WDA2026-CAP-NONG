"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import {
  LogOut,
  Package,
  Wallet,
  TrendingUp,
  Calendar,
  AlertTriangle,
  AlertCircle,
  Users,
  User,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  Send,
  Minus,
  Check,
} from "lucide-react";
import { leaveHtx, getMyHtx, getMyPledges, getHtxMembers, getMyHtxBundles, addPledge, withdrawPledge } from "@/services/api/htx";
import { getAllSeasonalConfigs } from "@/services/api/seasonal-config";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ProgressBar from "@/components/ui/ProgressBar";

const MONTHS = ["T1","T2","T3","T4","T5","T6","T7","T8","T9","T10","T11","T12"];

type ManageTab = "overview" | "bundles" | "members" | "seasonal";

const TAB_CONFIG = [
  { key: "overview" as ManageTab, label: "Tổng quan", icon: TrendingUp },
  { key: "bundles" as ManageTab, label: "Bundle gom đơn", icon: Package },
  { key: "members" as ManageTab, label: "Thành viên", icon: Users },
  { key: "seasonal" as ManageTab, label: "Mùa vụ", icon: Calendar },
];

function MyHtxContent() {
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [htx, setHtx] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pledges, setPledges] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [bundles, setBundles] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [members, setMembers] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [seasonalConfig, setSeasonalConfig] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [leavingHtx, setLeavingHtx] = useState(false);
  const [leaveError, setLeaveError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ManageTab>("overview");
  const [expandedBundle, setExpandedBundle] = useState<string | null>(null);

  // Pledge form state
  const [pledgeFormBundle, setPledgeFormBundle] = useState<string | null>(null);
  const [pledgeQuantity, setPledgeQuantity] = useState("");
  const [pledgeNote, setPledgeNote] = useState("");
  const [pledgeSubmitting, setPledgeSubmitting] = useState(false);
  const [pledgeError, setPledgeError] = useState<string | null>(null);
  const [pledgeSuccess, setPledgeSuccess] = useState<string | null>(null);
  const [withdrawingPledge, setWithdrawingPledge] = useState<string | null>(null);

  const fetchHtxData = useCallback(async () => {
    try {
      const [htxData, pledgesData, bundlesData, membersData, seasonalData] = await Promise.all([
        getMyHtx().catch(() => null),
        getMyPledges().catch(() => []),
        getMyHtxBundles().catch(() => []),
        getHtxMembers().catch(() => []),
        getAllSeasonalConfigs().catch(() => []),
      ]);
      setHtx(htxData);
      setPledges(pledgesData as any[]);
      setBundles(bundlesData as any[]);
      setMembers(membersData as any[]);
      setSeasonalConfig(seasonalData as any[]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHtxData();
    const interval = setInterval(fetchHtxData, 30_000);
    return () => clearInterval(interval);
  }, [fetchHtxData]);

  const handleLeaveHtx = async () => {
    setLeaveError(null);
    setLeavingHtx(true);
    try {
      await leaveHtx();
      window.dispatchEvent(new Event("auth-changed"));
    } catch (err: any) {
      setLeaveError(err?.response?.data?.message || err.message || "Không thể rời HTX");
    } finally {
      setLeavingHtx(false);
    }
  };

  const handleAddPledge = async (bundleId: string) => {
    const qty = parseFloat(pledgeQuantity);
    if (!qty || qty <= 0) {
      setPledgeError("Vui lòng nhập số lượng hợp lệ");
      return;
    }
    setPledgeSubmitting(true);
    setPledgeError(null);
    setPledgeSuccess(null);
    try {
      await addPledge(bundleId, qty, pledgeNote || undefined);
      setPledgeSuccess("Cam kết thành công! 🎉");
      setPledgeFormBundle(null);
      setPledgeQuantity("");
      setPledgeNote("");
      await fetchHtxData();
      setTimeout(() => setPledgeSuccess(null), 3000);
    } catch (err: any) {
      setPledgeError(err?.response?.data?.message || err.message || "Không thể tham gia");
    } finally {
      setPledgeSubmitting(false);
    }
  };

  const handleWithdrawPledge = async (pledgeId: string) => {
    if (!confirm("Bạn có chắc muốn rút cam kết này?")) return;
    setWithdrawingPledge(pledgeId);
    try {
      await withdrawPledge(pledgeId);
      await fetchHtxData();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Không thể rút cam kết");
    } finally {
      setWithdrawingPledge(null);
    }
  };

  if (loading) return <div className="text-center py-20 text-gray-500">Đang tải...</div>;
  if (!htx) return <div className="text-center py-20">Không tìm thấy thông tin HTX</div>;

  const isManager = user?.role === "HTX_MANAGER";

  // Helper: find existing pledge for current user in a bundle
  const findMyPledgeInBundle = (bundle: any) => {
    const bPledges = Array.isArray(bundle.pledges) ? bundle.pledges : [];
    return bPledges.find((p: any) => {
      const farmerId = p.farmer?.id || p.farmer_id;
      return farmerId && user?.id && String(farmerId) === String(user.id);
    });
  };

  // Also check from my pledges list
  const findMyPledgeForBundle = (bundleId: string) => {
    const fromBundle = bundles.find((b: any) => String(b.id) === bundleId);
    if (fromBundle) {
      const found = findMyPledgeInBundle(fromBundle);
      if (found) return found;
    }
    // Fallback: check pledges list
    return pledges.find((p: any) => {
      const bId = p.bundle?.id || p.bundle_id;
      return String(bId) === bundleId && (p.status === "ACTIVE");
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-surface border border-gray-100 dark:border-border p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-foreground">HTX {htx.name}</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Mã: {htx.official_code} • Khu vực: {htx.province}</p>
        </div>
        <div className="flex items-center gap-3">
          {isManager && (
            <Link
              href="/cooperative/manage"
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
            >
              ⚙️ Quản lý HTX
            </Link>
          )}
          {!isManager && (
            <button
              onClick={handleLeaveHtx}
              disabled={leavingHtx}
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {leavingHtx ? "Đang xử lý..." : "Rời HTX"}
            </button>
          )}
        </div>
      </div>

      {leaveError && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm">
          <AlertTriangle className="w-4 h-4" /> {leaveError}
        </div>
      )}

      {pledgeSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center gap-2 text-sm animate-pulse">
          <Check className="w-4 h-4" /> {pledgeSuccess}
        </div>
      )}

      {/* Tab nav */}
      <div className="flex gap-1 bg-gray-100 dark:bg-background-light p-1 rounded-xl overflow-x-auto">
        {TAB_CONFIG.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-white dark:bg-surface text-primary shadow-sm"
                : "text-gray-500 dark:text-foreground-muted hover:text-gray-700 dark:hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ Tab: Tổng quan ═══ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-100 dark:border-green-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <Wallet className="w-8 h-8 text-green-600" />
                <span className="text-xs font-bold text-green-600 bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full">Cam kết</span>
              </div>
              <p className="text-2xl font-black text-green-800 dark:text-green-300">
                {pledges.filter((p: any) => p.status === "ACTIVE").length}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">Cam kết đang hoạt động</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-100 dark:border-blue-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <Package className="w-8 h-8 text-blue-600" />
                <span className="text-xs font-bold text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 rounded-full">Bundles</span>
              </div>
              <p className="text-2xl font-black text-blue-800 dark:text-blue-300">
                {bundles.filter((b: any) => b.status === "OPEN").length}
              </p>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">Bundle đang mở</p>
            </div>
          </div>

          {/* Pledge history */}
          <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border p-5">
            <h3 className="font-bold text-sm text-gray-900 dark:text-foreground mb-4">📋 Lịch sử cam kết</h3>
            {pledges.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">Chưa có cam kết nào</p>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-border">
                {pledges.slice(0, 10).map((p: any) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-gray-900 dark:text-foreground">
                        {p.bundle?.product_name || p.bundle?.productName || p.product_name || "Bundle"}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.quantity} {p.bundle?.unit_code || "kg"} • {p.created_at ? new Date(p.created_at).toLocaleDateString("vi-VN") : ""}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      p.status === "ACTIVE" ? "bg-green-50 text-green-700" : p.status === "WITHDRAWN" ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"
                    }`}>
                      {p.status === "ACTIVE" ? "✅ Hoạt động" : p.status === "WITHDRAWN" ? "↩️ Đã rút" : p.status === "EXPIRED" ? "⏰ Hết hạn" : p.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ Tab: Bundle gom đơn ═══ */}
      {activeTab === "bundles" && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-foreground text-lg">
            📦 Bundle gom đơn — {htx.name}
          </h2>

          {bundles.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Chưa có bundle nào đang mở.</p>
            </div>
          ) : (
            bundles.map((b: any) => {
              const targetKg = Number(b.target_quantity) || 0;
              const currentKg = Number(b.current_pledged_quantity) || 0;
              const pct = targetKg > 0 ? Math.min(100, Math.round((currentKg / targetKg) * 100)) : 0;
              const bPledges = Array.isArray(b.pledges) ? b.pledges : [];
              const isExpanded = expandedBundle === String(b.id);
              const myPledge = findMyPledgeForBundle(String(b.id));
              const isOpen = b.status === "OPEN";
              const isFull = b.status === "FULL";
              const canJoin = isOpen && !myPledge;
              const canWithdraw = myPledge && (isOpen || isFull) && myPledge.status === "ACTIVE";
              const remaining = targetKg - currentKg;
              const minPledge = Number(b.min_pledge_quantity) || 0;
              const showForm = pledgeFormBundle === String(b.id);

              return (
                <div key={b.id} className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border overflow-hidden">
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-bold text-gray-900 dark:text-foreground">{b.product_name}</h3>
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                            b.status === "OPEN" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                            : b.status === "FULL" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                            : b.status === "CONFIRMED" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                          }`}>
                            {b.status === "OPEN" ? "🟢 Đang mở" : b.status === "FULL" ? "🟡 Đủ SL" : b.status === "CONFIRMED" ? "✅ Đã xác nhận" : b.status}
                          </span>
                          {myPledge && (
                            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                              🙋 Bạn đã tham gia ({myPledge.quantity} {b.unit_code || "kg"})
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-gray-500 dark:text-foreground-muted">
                          <span>🎯 {currentKg}/{targetKg} {b.unit_code || "kg"}</span>
                          <span>💰 {formatCurrency(Number(b.price_per_unit) || 0)}/{(b.unit_code || "kg").toLowerCase()}</span>
                          <span>👥 {bPledges.length} farmer</span>
                          {b.deadline && <span>📅 Deadline: {new Date(b.deadline).toLocaleDateString("vi-VN")}</span>}
                          {minPledge > 0 && <span>📏 Tối thiểu: {minPledge} {b.unit_code || "kg"}</span>}
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <ProgressBar
                            value={pct}
                            className={`h-full rounded-full transition-all duration-700 ${pct >= 100 ? "bg-success" : "bg-gradient-to-r from-primary to-primary-light"}`}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400">
                            Tổng giá trị: {formatCurrency(currentKg * (Number(b.price_per_unit) || 0))} / {formatCurrency(targetKg * (Number(b.price_per_unit) || 0))}
                          </p>
                          {bPledges.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setExpandedBundle(isExpanded ? null : String(b.id))}
                              className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                            >
                              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              {isExpanded ? "Ẩn chi tiết" : `Xem ${bPledges.length} cam kết`}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 sm:items-end justify-center shrink-0">
                        {canJoin && !showForm && (
                          <button
                            type="button"
                            onClick={() => {
                              setPledgeFormBundle(String(b.id));
                              setPledgeError(null);
                              setPledgeQuantity("");
                              setPledgeNote("");
                            }}
                            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity shadow-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Tham gia gom đơn
                          </button>
                        )}
                        {canWithdraw && (
                          <button
                            type="button"
                            onClick={() => handleWithdrawPledge(myPledge.id)}
                            disabled={withdrawingPledge === myPledge.id}
                            className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                            {withdrawingPledge === myPledge.id ? "Đang rút..." : "Rút cam kết"}
                          </button>
                        )}
                        {!canJoin && !canWithdraw && myPledge && (
                          <span className="text-xs text-gray-400 italic">Đã cam kết • {myPledge.status}</span>
                        )}
                      </div>
                    </div>

                    {/* Inline pledge form */}
                    {showForm && (
                      <div className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-gray-900 dark:text-foreground">
                            🌾 Cam kết sản lượng — {b.product_name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => { setPledgeFormBundle(null); setPledgeError(null); }}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Số lượng ({b.unit_code || "kg"}) *
                            </label>
                            <input
                              type="number"
                              min={minPledge || 1}
                              max={remaining > 0 ? remaining : undefined}
                              step="0.1"
                              value={pledgeQuantity}
                              onChange={(e) => setPledgeQuantity(e.target.value)}
                              placeholder={`${minPledge > 0 ? `Tối thiểu ${minPledge}` : "Nhập số lượng"} • Còn lại ${remaining > 0 ? remaining : 0} ${b.unit_code || "kg"}`}
                              className="w-full px-3 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Ghi chú (tùy chọn)</label>
                            <input
                              type="text"
                              value={pledgeNote}
                              onChange={(e) => setPledgeNote(e.target.value)}
                              placeholder="Ví dụ: Xoài cát Hòa Lộc, vườn B2"
                              className="w-full px-3 py-2.5 bg-white dark:bg-background border border-gray-200 dark:border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                          </div>
                        </div>

                        {remaining > 0 && (
                          <p className="text-xs text-gray-400">
                            💡 Bundle còn cần thêm <strong>{remaining} {b.unit_code || "kg"}</strong> để đạt mục tiêu
                            {minPledge > 0 && <> • Tối thiểu <strong>{minPledge} {b.unit_code || "kg"}</strong></>}
                          </p>
                        )}

                        {pledgeError && (
                          <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5" /> {pledgeError}
                          </p>
                        )}

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => { setPledgeFormBundle(null); setPledgeError(null); }}
                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 font-medium"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddPledge(String(b.id))}
                            disabled={pledgeSubmitting || !pledgeQuantity}
                            className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            <Send className="w-4 h-4" />
                            {pledgeSubmitting ? "Đang gửi..." : "Xác nhận cam kết"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pledge detail */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 dark:border-border bg-gray-50/50 dark:bg-background-light/50 divide-y divide-gray-100 dark:divide-border">
                      {bPledges.map((p: any) => {
                        const pFarmerId = p.farmer?.id || p.farmer_id;
                        const isMe = pFarmerId && user?.id && String(pFarmerId) === String(user.id);
                        return (
                          <div key={p.id} className={`px-5 py-3 flex flex-col sm:flex-row sm:items-center gap-3 ${isMe ? "bg-primary/5 border-l-3 border-primary" : ""}`}>
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isMe ? "bg-primary/20" : "bg-primary/10"}`}>
                                <User className={`w-4 h-4 ${isMe ? "text-primary" : "text-primary"}`} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-foreground truncate">
                                  {p.farmer?.full_name || p.farmer?.fullName || p.farmer?.username || p.farmer_full_name || p.farmer_name || "Farmer"}
                                  {isMe && <span className="ml-2 text-[10px] text-primary font-bold">(Bạn)</span>}
                                </p>
                                <p className="text-[11px] text-gray-400">
                                  {p.farmer?.phone || p.farmer_phone || ""} • {p.created_at ? new Date(p.created_at).toLocaleDateString("vi-VN") : ""}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 sm:gap-4">
                              <span className="text-sm font-bold text-gray-900 dark:text-foreground whitespace-nowrap">
                                {p.quantity || p.quantity_kg || 0} {b.unit_code || "kg"}
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                                p.status === "DELIVERED" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                : p.status === "PARTIAL" ? "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                : p.status === "WITHDRAWN" ? "bg-red-50 text-red-600"
                                : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              }`}>
                                {p.status === "DELIVERED" ? "📦 Đã giao" : p.status === "PARTIAL" ? "⚠️ Giao một phần" : p.status === "WITHDRAWN" ? "↩️ Đã rút" : "✅ Đang hoạt động"}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ═══ Tab: Thành viên ═══ */}
      {activeTab === "members" && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-foreground text-lg">
            👥 Thành viên HTX — {htx.name}
          </h2>
          <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-background-light text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Họ tên</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">SĐT</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Vai trò</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Ngày gia nhập</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-border">
                  {members.map((m: any) => (
                    <tr key={m.id} className="hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-foreground">
                            {m.full_name || m.fullName || m.username || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-foreground-muted">
                        {m.phone || "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          (m.role === "HTX_MANAGER") ? "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                        }`}>
                          {m.role === "HTX_MANAGER" ? "👑 Chủ HTX" : "🌾 Thành viên"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-foreground-muted">
                        {m.created_at ? new Date(m.created_at).toLocaleDateString("vi-VN") : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {members.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Chưa có thành viên nào.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ Tab: Mùa vụ (read-only) ═══ */}
      {activeTab === "seasonal" && (
        <div className="space-y-4">
          <h2 className="font-bold text-gray-900 dark:text-foreground text-lg">
            🗓️ Cấu hình mùa vụ
          </h2>

          {/* Info banner */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Cấu hình mùa vụ được quản lý bởi Quản trị viên (Admin)
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Xem lịch mùa vụ theo vùng để lên kế hoạch sản xuất.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-background-light text-left">
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Danh mục</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Vùng</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Thời gian</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Trực quan</th>
                    <th className="px-6 py-3 text-xs font-medium text-gray-500 dark:text-foreground-muted uppercase">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-border">
                  {seasonalConfig.map((cfg: any) => {
                    const startMonth = cfg.start_month || cfg.startMonth || 1;
                    const endMonth = cfg.end_month || cfg.endMonth || 12;
                    return (
                      <tr key={cfg.id} className="hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-foreground">
                          {cfg.product_category || cfg.productCategory || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-foreground-muted">
                          {cfg.province || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-foreground-muted">
                          {MONTHS[startMonth - 1]} → {MONTHS[endMonth - 1]}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-[2px]">
                            {Array.from({ length: 12 }, (_, i) => {
                              const m = i + 1;
                              const inSeason =
                                startMonth <= endMonth
                                  ? m >= startMonth && m <= endMonth
                                  : m >= startMonth || m <= endMonth;
                              return (
                                <div
                                  key={i}
                                  title={MONTHS[i]}
                                  className={`w-4 h-4 rounded-sm ${inSeason ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
                                />
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-foreground-muted">
                          {cfg.note || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {seasonalConfig.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Chưa có cấu hình mùa vụ nào.</p>
                <p className="text-xs mt-1">Admin sẽ cấu hình lịch mùa vụ cho các vùng sản xuất.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyHtxPage() {
  return (
    <ProtectedRoute roles={["HTX_MEMBER", "HTX_MANAGER"]}>
      <MyHtxContent />
    </ProtectedRoute>
  );
}
