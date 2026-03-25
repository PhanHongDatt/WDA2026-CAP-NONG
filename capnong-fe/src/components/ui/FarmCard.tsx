"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import type { Shop } from "@/types/shop";

interface FarmCardProps {
  shop: Shop;
}

/**
 * FarmCard — hover thay đổi ảnh nền (slideshow effect)
 * Hiện avatar mặc định, hover → hiện gallery ảnh vườn
 */
export default function FarmCard({ shop }: FarmCardProps) {
  const [hovered, setHovered] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  /* Dùng gallery nếu có, fallback avatar */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shopAny = shop as any;
  const gallery: string[] = shopAny.gallery_urls?.length
    ? shopAny.gallery_urls
    : [shop.avatar_url || ""];

  const handleMouseEnter = () => {
    setHovered(true);
    /* Auto-cycle ảnh khi hover */
    if (gallery.length > 1) {
      const next = (imgIdx + 1) % gallery.length;
      setImgIdx(next);
    }
  };

  return (
    <Link
      href={`/shop/${shop.slug}`}
      className="group bg-white dark:bg-surface border border-gray-100 dark:border-border rounded-xl overflow-hidden hover:border-primary/50 hover:shadow-md transition-all duration-200 block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top: Banner/Avatar area — hover slideshow */}
      <div className="relative h-28 bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
        <Image
          src={hovered && gallery.length > 1 ? gallery[imgIdx] : (shop.avatar_url || "")}
          alt={shop.name}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        {/* Rating badge */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 dark:bg-surface/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-xs font-bold shadow-sm">
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-400" />
          {shop.average_rating}
        </div>

        {/* Avatar overlay */}
        <div className="absolute -bottom-5 left-4 w-12 h-12 rounded-full border-2 border-white dark:border-surface overflow-hidden bg-white shadow-md">
          <Image
            src={shop.avatar_url || ""}
            alt={shop.name}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Bottom: Info */}
      <div className="pt-7 px-4 pb-4">
        <h3 className="font-bold text-gray-900 dark:text-foreground text-sm leading-tight group-hover:text-primary transition-colors">
          {shop.name}
        </h3>
        <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-foreground-muted mt-1">
          <MapPin className="w-3 h-3" />
          {shop.province}
          <span className="mx-1">•</span>
          {shop.years_experience} năm
        </div>
      </div>
    </Link>
  );
}
