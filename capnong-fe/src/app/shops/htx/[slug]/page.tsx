"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  MapPin,
  Users,
  Package,
  Star,
  Clock,
  ShoppingCart,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import ProgressBar from "@/components/ui/ProgressBar";

/* ─── Display interfaces — khớp BE response (snake_case qua WebConfig) ─── */

interface HtxDetail {
  name: string;
  province: string;
  members: number;
  manager: string;
  description: string;
  rating: number;
  total_orders: number;
}

interface BundleDisplay {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  target_qty: number;
  current_qty: number;
  deadline: string;
  status: "OPEN" | "FULFILLED";
}

/* ─── Default mock data (fallback khi API chưa sẵn) ─── */
const MOCK_HTX: HtxDetail = {
  name: "HTX Trái Cây Bến Tre",
  province: "Bến Tre",
  members: 15,
  manager: "Nguyễn Văn A",
  description: "Hợp tác xã chuyên cung cấp trái cây đặc sản Bến Tre: bưởi da xanh, chôm chôm, dừa tươi. Cam kết canh tác an toàn, giá gốc từ nhà vườn.",
  rating: 4.6,
  total_orders: 128,
};

const MOCK_BUNDLES: BundleDisplay[] = [
  {
    id: "bp-1",
    name: "Bưởi Da Xanh Bến Tre",
    price: 58000,
    unit: "kg",
    image: "🍊",
    target_qty: 800,
    current_qty: 520,
    deadline: "25/03/2026",
    status: "OPEN",
  },
  {
    id: "bp-2",
    name: "Chôm Chôm Java",
    price: 42000,
    unit: "kg",
    image: "🫐",
    target_qty: 500,
    current_qty: 500,
    deadline: "18/03/2026",
    status: "FULFILLED",
  },
  {
    id: "bp-3",
    name: "Dừa Xiêm Bến Tre",
    price: 25000,
    unit: "trái",
    image: "🥥",
    target_qty: 1000,
    current_qty: 350,
    deadline: "30/03/2026",
    status: "OPEN",
  },
];

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/**
 * Map BE snake_case HtxResponse → FE HtxDetail.
 *
 * BE HtxResponse fields (after SNAKE_CASE serialization):
 *   id, name, official_code, province, ward, description,
 *   document_url, status, admin_note, created_at,
 *   manager_id, manager_username, manager_full_name,
 *   created_by_user_id, created_by_username
 *
 * NOTE: HtxResponse KHÔNG có totalMembers. Chỉ HtxResponseDto mới có.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapHtxDetail(raw: any): HtxDetail {
  return {
    name: raw.name || "—",
    province: raw.province || "—",
    members: Number(raw.total_members) || 0,          // HtxResponseDto có total_members
    manager: raw.manager_full_name || raw.manager_username || "—",
    description: raw.description || "",
    rating: Number(raw.rating) || 0,
    total_orders: Number(raw.total_orders) || 0,
  };
}

/**
 * Map BE snake_case BundleResponseDto → FE BundleDisplay.
 *
 * BE BundleResponseDto fields (after SNAKE_CASE serialization):
 *   id, htx_shop, product_category, product_name, unit_code,
 *   target_quantity, current_pledged_quantity, progress_percent,
 *   price_per_unit, deadline, status, description, min_pledge_quantity,
 *   pledges (List<PledgeResponseDto>), created_at
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBundleDisplay(b: any): BundleDisplay {
  return {
    id: String(b.id || ""),
    name: b.product_name || "Sản phẩm",
    price: Number(b.price_per_unit) || 0,
    unit: b.unit_code || "kg",
    image: "📦",
    target_qty: Number(b.target_quantity) || 0,
    current_qty: Number(b.current_pledged_quantity) || 0,
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

export default function HtxShopPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [htx, setHtx] = useState<HtxDetail | null>(USE_MOCK ? MOCK_HTX : null);
  const [bundles, setBundles] = useState<BundleDisplay[]>(USE_MOCK ? MOCK_BUNDLES : []);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const htxApi = await import("@/services/api/htx");
      const [htxDetail, apiBundles] = await Promise.all([
        htxApi.getHtxDetail(slug),
        htxApi.getOpenBundles(),
      ]);

      // Map HTX detail: BE snake_case → FE
      if (htxDetail) {
        setHtx(mapHtxDetail(htxDetail));
      }

      // Map bundles: BE snake_case → FE
      if (Array.isArray(apiBundles) && apiBundles.length > 0) {
        setBundles(apiBundles.map(mapBundleDisplay));
      }
    } catch {
      if (USE_MOCK) { setHtx(MOCK_HTX); setBundles(MOCK_BUNDLES); }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/cooperative" className="p-2 hover:bg-gray-100 dark:hover:bg-surface-hover rounded-full transition-colors" aria-label="Quay lại">
          <ArrowLeft className="w-5 h-5 text-foreground-muted" />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-foreground">{htx?.name || "HTX"}</h1>
          <p className="text-sm text-foreground-muted">Gian hàng HTX — Đơn sỉ / Bundle</p>
        </div>
      </div>

      {/* HTX Info Banner */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary-dark dark:to-surface rounded-2xl p-6 border border-primary/20">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center text-4xl shrink-0">
            🏛️
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-foreground">{htx?.name || "HTX"}</h2>
            <p className="text-sm text-gray-600 dark:text-foreground-muted">{htx?.description || ""}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-foreground-muted">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {htx?.province || "—"}</span>
              {(htx?.members ?? 0) > 0 && (
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {htx?.members} thành viên</span>
              )}
              {(htx?.rating ?? 0) > 0 && (
                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-400" /> {htx?.rating}</span>
              )}
              {(htx?.total_orders ?? 0) > 0 && (
                <span className="flex items-center gap-1"><Package className="w-3.5 h-3.5" /> {htx?.total_orders} đơn hoàn thành</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bundle Products */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" /> Sản phẩm gom đơn
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bundles.map((bp) => {
            const progress = bp.target_qty > 0 ? Math.round((bp.current_qty / bp.target_qty) * 100) : 0;
            const isFulfilled = bp.status === "FULFILLED";
            return (
              <div key={bp.id} className="bg-white dark:bg-surface border border-gray-100 dark:border-border rounded-xl overflow-hidden shadow-sm">
                {/* Product image area */}
                <div className="h-36 bg-gray-50 dark:bg-background-light flex items-center justify-center text-6xl">
                  {bp.image}
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isFulfilled ? "bg-green-50 text-success dark:bg-green-900/30" : "bg-red-50 text-accent dark:bg-red-900/30"}`}>
                      {isFulfilled ? "✅ Đã gom đủ" : "🔥 Đang gom"}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-foreground">{bp.name}</h3>
                  <p className="text-lg font-black text-primary">{formatCurrency(bp.price)}<span className="text-xs font-normal text-foreground-muted">/{bp.unit.toLowerCase()}</span></p>

                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-[10px] text-foreground-muted mb-1">
                      <span>{bp.current_qty}/{bp.target_qty} {bp.unit.toLowerCase()}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-full h-2 overflow-hidden">
                      <ProgressBar value={progress} className={`h-full rounded-full ${isFulfilled ? "bg-success" : "bg-gradient-to-r from-primary to-primary-light"}`} />
                    </div>
                  </div>

                  {/* Deadline notice */}
                  <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                    <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-[11px] text-amber-700 dark:text-amber-300">
                      {isFulfilled
                        ? "Đơn sẽ bắt đầu giao hàng ngay"
                        : `Đơn sẽ bắt đầu giao sau ngày ${bp.deadline}`}
                    </p>
                  </div>

                  {/* Deadline + Buy button */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs text-foreground-muted">
                      <Clock className="w-3 h-3" /> Hạn: {bp.deadline}
                    </span>
                    <button
                      type="button"
                      className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" /> Mua sỉ
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notice */}
      <div className="text-center text-xs text-foreground-muted py-4">
        Gian hàng HTX dành cho đơn sỉ. Mua lẻ vui lòng xem{" "}
        <Link href="/catalog" className="text-primary font-medium hover:underline">danh mục sản phẩm</Link>.
      </div>
    </div>
  );
}
