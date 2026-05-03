import Link from "next/link";
import { Clock, Users, Flame } from "lucide-react";
import type { CoopPool } from "@/types/order";
import ProgressBar from "@/components/ui/ProgressBar";

interface CoopPoolCardProps {
  pool: CoopPool;
}

/**
 * CoopPoolCard — matching home.html lines 273-308 exactly
 *
 * NOTE: BE BundleResponseDto.unitCode serializes to `unit_code` (string),
 * but FE Bundle type defines `unit` as UnitResponse (object with symbol).
 * We handle both cases gracefully.
 */
export default function CoopPoolCard({ pool }: CoopPoolCardProps) {
  const progress = pool.progress_percent;

  // Handle unit: could be UnitResponse object (from mock) or string (from API)
  const unitSymbol =
    typeof pool.unit === "object" && pool.unit !== null
      ? pool.unit.symbol
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : (pool as any).unit_code || "kg";

  return (
    <section className="mb-12">
      {/* matches home.html line 274: bg-green-50 rounded-2xl p-8 border border-green-100 flex items-center gap-12 */}
      <div className="bg-green-50 rounded-2xl p-8 border border-green-100 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
        {/* Left - Info */}
        <div className="flex-shrink-0">
          <div className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-4 inline-flex items-center gap-1 uppercase tracking-wider">
            <Flame className="w-4 h-4 fill-current text-yellow-300" /> Đang gom đơn
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {pool.product_name}
          </h2>
          <p className="text-gray-600 mb-6 max-w-md">
            Chung tay mua chung để có mức giá tốt nhất trực tiếp từ nhà vườn.
            Hỗ trợ vận chuyển tận nhà.
          </p>
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-6">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {Array.isArray(pool.pledges) ? pool.pledges.length : 0} người tham gia
            </span>
          </div>
          <Link
            href={`/cooperative`}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90 transition-all inline-block"
          >
            Xem chi tiết &amp; Tham gia
          </Link>
        </div>

        {/* Right - Progress */}
        <div className="flex-grow w-full lg:w-auto">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-semibold text-gray-700">
                Tiến độ gom đơn
              </span>
              <span className="text-2xl font-black text-primary">
                {progress}%
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 mb-4 overflow-hidden">
              <ProgressBar
                value={progress}
                className="bg-primary h-full rounded-full transition-all duration-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 mb-1">Đã gom</p>
                <p className="font-bold text-gray-900">
                  {pool.current_pledged_quantity.toLocaleString("vi-VN")} /{" "}
                  {pool.target_quantity.toLocaleString("vi-VN")} {unitSymbol}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-gray-500 mb-1">Thời gian còn lại</p>
                <p className="font-bold text-accent flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {getTimeRemaining(pool.deadline)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function getTimeRemaining(deadline: string) {
  const now = new Date();
  const end = new Date(deadline);
  const diff = end.getTime() - now.getTime();
  if (diff <= 0) return "Đã kết thúc";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return `${days > 0 ? days + " ngày " : ""}${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
