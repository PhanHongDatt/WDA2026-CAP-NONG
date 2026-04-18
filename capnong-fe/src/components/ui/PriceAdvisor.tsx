"use client";

import { useState, useEffect, useCallback } from "react";

/* ── Mock price database by category + region ── */
const PRICE_DB: Record<string, { min: number; avg: number; max: number; trend: string }> = {
  "xoài": { min: 65000, avg: 85000, max: 120000, trend: "tăng nhẹ 8% so với tháng trước" },
  "cam": { min: 25000, avg: 42000, max: 65000, trend: "ổn định" },
  "cam sành": { min: 30000, avg: 45000, max: 60000, trend: "giảm nhẹ 5% (cuối mùa)" },
  "bưởi": { min: 35000, avg: 55000, max: 80000, trend: "tăng 12% (đầu mùa)" },
  "sầu riêng": { min: 90000, avg: 135000, max: 220000, trend: "đang cao mùa, tăng 15%" },
  "chôm chôm": { min: 20000, avg: 35000, max: 55000, trend: "ổn định" },
  "thanh long": { min: 15000, avg: 28000, max: 45000, trend: "giảm 10% (dư cung)" },
  "rau muống": { min: 8000, avg: 12000, max: 18000, trend: "ổn định" },
  "cà chua": { min: 15000, avg: 25000, max: 40000, trend: "tăng nhẹ" },
  "ớt": { min: 30000, avg: 55000, max: 90000, trend: "biến động mạnh" },
  "mít": { min: 25000, avg: 40000, max: 60000, trend: "ổn định" },
  "dưa hấu": { min: 8000, avg: 15000, max: 25000, trend: "giảm nhẹ (hết Tết)" },
  "chuối": { min: 10000, avg: 18000, max: 30000, trend: "ổn định" },
  "default": { min: 20000, avg: 50000, max: 100000, trend: "chưa có dữ liệu cụ thể" },
};

function lookupPrice(name: string) {
  const lower = name.toLowerCase().trim();
  for (const [key, data] of Object.entries(PRICE_DB)) {
    if (key !== "default" && lower.includes(key)) return { ...data, matched: key };
  }
  return { ...PRICE_DB["default"], matched: "" };
}

function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN").format(n) + "đ";
}

interface PriceAdvisorProps {
  productName: string;
  currentPrice: string;
  onPriceChange?: (newPrice: string) => void;
}

export default function PriceAdvisor({ productName, currentPrice, onPriceChange }: PriceAdvisorProps) {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<ReturnType<typeof lookupPrice> | null>(null);

  const analyze = useCallback(async () => {
    if (!productName.trim()) return;
    setVisible(true);

    // Try real API first
    try {
      const aiApi = await import("@/services/api/ai");
      const result = await aiApi.getPriceAdvice({
        productName,
        category: "",
        province: "",
        currentPrice: Number(currentPrice) || undefined,
      });
      if (result.priceRange) {
        setData({
          min: result.priceRange.min,
          avg: result.suggestedPrice || Math.round((result.priceRange.min + result.priceRange.max) / 2),
          max: result.priceRange.max,
          trend: result.marketTrend || "chưa có dữ liệu",
          matched: productName,
        });
        return;
      }
    } catch {
      // API unavailable → local fallback
    }

    setData(lookupPrice(productName));
  }, [productName, currentPrice]);

  // Auto-show when product name changes (debounced)
  useEffect(() => {
    if (!productName.trim()) { setVisible(false); return; }
    const t = setTimeout(() => analyze(), 800);
    return () => clearTimeout(t);
  }, [productName, analyze]);

  if (!visible || !data) return null;

  const price = Number(currentPrice) || 0;
  const priceFeedback = price > 0
    ? price < data.min
      ? { text: "Thấp hơn giá thị trường — có thể khó cạnh tranh lâu dài", color: "text-red-600" }
      : price > data.max
        ? { text: "Cao hơn giá thị trường — cần đảm bảo chất lượng vượt trội", color: "text-amber-600" }
        : { text: "Nằm trong khoảng giá thị trường — phù hợp", color: "text-green-700" }
    : null;

  // Calculate slider bounds
  const sliderMin = data.min * 0.8;
  const sliderMax = data.max * 1.5;
  const val = price > 0 ? price : data.avg;
  const percentage = Math.min(Math.max(((val - sliderMin) / (sliderMax - sliderMin)) * 100, 0), 100);

  return (
    <div className="bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/40 rounded-xl p-4 space-y-2">
      <p className="text-xs font-bold text-amber-800 dark:text-amber-300">
        Gợi ý giá bán {data.matched ? `"${data.matched}"` : ""}
      </p>
      <div className="flex items-baseline gap-4 text-sm">
        <span className="text-foreground-muted">Thấp: <strong className="text-foreground">{formatVND(data.min)}</strong></span>
        <span className="text-foreground-muted">TB: <strong className="text-primary font-bold">{formatVND(data.avg)}</strong></span>
        <span className="text-foreground-muted">Cao: <strong className="text-foreground">{formatVND(data.max)}</strong></span>
      </div>

      {/* Interactive visual slider */}
      <div className="relative py-2 group">
        {/* Full Track background (Gradient) */}
        <div className="absolute inset-y-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 to-primary rounded-full pointer-events-none mt-[8px] opacity-30" />
        
        {/* Filled Track background with Animated Stripes */}
        <div 
          className="absolute inset-y-0 left-0 h-2 bg-primary rounded-full pointer-events-none mt-[8px] overflow-hidden" 
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.2)_10px,rgba(255,255,255,0.2)_20px)] animate-[bg-scroll_2s_linear_infinite]" style={{ backgroundSize: "28px 28px" }} />
        </div>

        {/* Input Native Element */}
        <input
          type="range"
          min={sliderMin}
          max={sliderMax}
          step={100}
          value={val}
          onChange={(e) => onPriceChange?.(e.target.value)}
          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-transparent relative z-10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-4 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 transition-all outline-none align-middle"
        />
        
        {/* Tooltip Overlay */}
        <div className="absolute top-0 right-0 -translate-y-full opacity-0 group-hover:opacity-100 transition-opacity bg-background border border-border px-2 py-1 rounded shadow-sm text-xs font-bold pointer-events-none z-20">
          {formatVND(val)}
        </div>
      </div>

      <p className="text-[11px] text-foreground-muted">
        Xu hướng: {data.trend}
      </p>
      {priceFeedback && (
        <p className={`text-[11px] font-medium ${priceFeedback.color}`}>
          {priceFeedback.text}
        </p>
      )}
    </div>
  );
}
