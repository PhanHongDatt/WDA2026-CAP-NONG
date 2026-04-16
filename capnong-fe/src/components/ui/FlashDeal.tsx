"use client";

import { useState, useEffect } from "react";
import { SafeImage } from "@/lib/safe-image";
import Link from "next/link";
import { Zap, ChevronRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { productService } from "@/services";
import type { Product } from "@/types/product";

function useCountdown(hours: number) {
  const [seconds, setSeconds] = useState(hours * 3600);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return { h, m, s };
}

function TimerBox({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center justify-center w-7 h-7 bg-gray-900 text-white text-sm font-bold rounded">
      {String(value).padStart(2, "0")}
    </span>
  );
}

export default function FlashDeal() {
  const { h, m, s } = useCountdown(3);
  const [deals, setDeals] = useState<Product[]>([]);

  useEffect(() => {
    productService.getFlashDeals().then(setDeals);
  }, []);

  return (
    <section className="mb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <div className="flex items-center gap-1.5 text-accent">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                <span className="font-bold text-sm sm:text-lg uppercase tracking-wide">
                  Giá sốc hôm nay
                </span>
              </div>
              {/* Countdown */}
              <div className="flex items-center gap-1">
                <TimerBox value={h} />
                <span className="text-gray-400 font-bold">:</span>
                <TimerBox value={m} />
                <span className="text-gray-400 font-bold">:</span>
                <TimerBox value={s} />
              </div>
            </div>
            <Link
              href="/catalog?sort=flash-deal"
              className="text-xs sm:text-sm text-primary font-semibold flex items-center gap-1 hover:underline"
            >
              Xem tất cả
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Horizontal Product Scroll */}
          <div className="flex gap-0 overflow-x-auto px-1 py-4 scrollbar-hide">
            {deals.map((deal) => {
              // Flash deals: giảm giá cứng 30% (mock)
              const discountPct = 30;
              const soldPct = Math.min(
                Math.round((deal.sold_count / (deal.sold_count + 50)) * 100),
                95
              );

              return (
                <Link
                  key={deal.id}
                  href={`/products/${deal.slug}`}
                  className="flex-shrink-0 w-[140px] sm:w-[180px] px-2 sm:px-3 border-r border-gray-50 last:border-r-0 group"
                >
                  {/* Image */}
                  <div className="relative aspect-square rounded-lg overflow-hidden mb-2 bg-gray-50">
                    <SafeImage
                      src={deal.images[0]}
                      alt={deal.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                    {discountPct > 0 && (
                      <div className="absolute top-0 right-0 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl">
                        -{discountPct}%
                      </div>
                    )}
                  </div>

                  {/* Price */}
                  <div className="text-center mb-1.5">
                    <span className="text-accent font-bold text-base">
                      {formatCurrency(deal.price_per_unit)}
                    </span>
                  </div>

                  {/* Progress bar "Đã bán" — like Shopee */}
                  <div className="relative h-4 bg-red-100 rounded-full overflow-hidden">
                    <div
                      ref={(el) => { if (el) el.style.width = `${soldPct}%`; }}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent to-orange-500 rounded-full transition-all"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white z-10">
                      {soldPct > 70 ? "SẮP HẾT" : `Đã bán ${deal.sold_count}`}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
