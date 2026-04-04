"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const BANNERS = [
  {
    src: "/images/banners/banner-traicay.png",
    alt: "Mùa trái cây miền Tây",
    href: "/catalog?category=trai-cay",
  },
  {
    src: "/images/banners/banner-dalat.png",
    alt: "Nông sản Đà Lạt tươi mỗi ngày",
    href: "/catalog?region=da-lat",
  },
  {
    src: "/images/banners/banner-gomdon.png",
    alt: "Gom đơn tiết kiệm",
    href: "/cooperative",
  },
];

const SIDE_BANNERS = [
  {
    src: "/images/banners/banner-traicay.png",
    alt: "Giá sốc hôm nay",
    href: "/catalog?sort=flash-deal",
    label: "⚡ Giá sốc hôm nay",
  },
  {
    src: "/images/banners/banner-gomdon.png",
    alt: "Miễn phí giao hàng",
    href: "/catalog",
    label: "🚚 Miễn phí giao hàng",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % BANNERS.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + BANNERS.length) % BANNERS.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="mb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-3 h-[280px]">
          {/* Main Carousel */}
          <div className="flex-1 relative rounded-xl overflow-hidden group">
            {BANNERS.map((b, i) => (
              <Link
                key={i}
                href={b.href}
                className={`absolute inset-0 transition-opacity duration-700 ${
                  i === current ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <Image
                  src={b.src}
                  alt={b.alt}
                  fill
                  className="object-cover"
                  priority={i === 0}
                />
              </Link>
            ))}

            {/* Nav arrows */}
            <button type="button"
              onClick={(e) => { e.preventDefault(); prev(); }}
              aria-label="Banner trước"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button type="button"
              onClick={(e) => { e.preventDefault(); next(); }}
              aria-label="Banner tiếp theo"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/30 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {BANNERS.map((_, i) => (
                <button type="button"
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Chuyển đến banner ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current
                      ? "bg-white w-5"
                      : "bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Side Banners — stacked */}
          <div className="w-[280px] flex flex-col gap-3 shrink-0">
            {SIDE_BANNERS.map((b, i) => (
              <Link
                key={i}
                href={b.href}
                className="relative flex-1 rounded-xl overflow-hidden group/side"
              >
                <Image
                  src={b.src}
                  alt={b.alt}
                  fill
                  className="object-cover group-hover/side:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <span className="absolute bottom-3 left-3 text-white font-bold text-sm z-10">
                  {b.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
