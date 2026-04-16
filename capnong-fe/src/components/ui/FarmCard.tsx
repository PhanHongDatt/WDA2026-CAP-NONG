"use client";

import { SafeImage } from "@/lib/safe-image";
import Link from "next/link";
import { ChevronRight, Users, Package, ShoppingBag, ShieldCheck, Leaf } from "lucide-react";
import type { Shop } from "@/types/shop";

interface FarmCardProps {
  shop: Shop;
}

/**
 * FarmCard — Redesign giống hình tham khảo "Khám phá nhà cung cấp"
 * Layout: Logo + Tên > | Dòng SP chính | Stats row | Badges
 * Hover: nhẹ nhàng translate-y + shadow
 */
export default function FarmCard({ shop }: FarmCardProps) {
  /* Derive mock stats from available data */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shopAny = shop as any;
  const customerCount = shopAny.customer_count ?? Math.floor((shop.total_reviews || 10) * 0.8);
  const productCount = shopAny.product_count ?? Math.floor(50 + Math.random() * 80);
  const orderCount = shopAny.order_count ?? `${Math.floor(shop.total_reviews * 1.5)}+`;

  /* Derive main product line from bio */
  const mainProducts = shopAny.main_products
    ?? (shop.bio?.includes("dừa") ? "Trái cây, Dừa" 
      : shop.bio?.includes("rau") ? "Rau củ quả"
      : "Trái cây, Rau củ quả");

  /* Derive certification badges */
  const badges: string[] = shopAny.certifications ?? ["ATTP"];
  if (shop.average_rating >= 4.8) badges.push("VietGap");
  // Deduplicate
  const uniqueBadges = [...new Set(badges)];

  return (
    <Link
      href={`/shop/${shop.slug}`}
      className="group bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-2xl p-5 block hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
    >
      {/* Header: Avatar + Name + Arrow */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 dark:bg-background-light flex-shrink-0 border border-gray-100 dark:border-border">
          {shop.avatar_url ? (
            <SafeImage
              src={shop.avatar_url}
              alt={shop.name}
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-lg font-bold text-primary">
              {shop.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <h3 className="font-bold text-sm text-gray-900 dark:text-foreground truncate group-hover:text-primary transition-colors">
              {shop.name}
            </h3>
            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors flex-shrink-0" />
          </div>
        </div>
      </div>

      {/* Main product line */}
      <div className="mb-4">
        <p className="text-[11px] text-gray-400 dark:text-foreground-muted mb-0.5">· Dòng sản phẩm chính:</p>
        <p className="text-sm font-semibold text-gray-700 dark:text-foreground">{mainProducts}</p>
      </div>

      {/* Stats row — giống hình tham khảo */}
      <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-gray-100 dark:border-border">
        <div className="text-center">
          <Users className="w-4 h-4 text-gray-400 mx-auto mb-1" />
          <p className="text-base font-bold text-gray-900 dark:text-foreground">{customerCount}</p>
          <p className="text-[10px] text-gray-400">khách hàng</p>
        </div>
        <div className="text-center">
          <Package className="w-4 h-4 text-gray-400 mx-auto mb-1" />
          <p className="text-base font-bold text-gray-900 dark:text-foreground">{productCount}</p>
          <p className="text-[10px] text-gray-400">sản phẩm</p>
        </div>
        <div className="text-center">
          <ShoppingBag className="w-4 h-4 text-gray-400 mx-auto mb-1" />
          <p className="text-base font-bold text-gray-900 dark:text-foreground">{orderCount}</p>
          <p className="text-[10px] text-gray-400">đơn hàng</p>
        </div>
      </div>

      {/* Certification badges */}
      <div className="flex gap-2">
        {uniqueBadges.map((badge) => (
          <span
            key={badge}
            className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-gray-200 dark:border-border text-gray-600 dark:text-foreground-muted"
          >
            {badge === "VietGap" ? <Leaf className="w-3 h-3 text-green-500" /> : <ShieldCheck className="w-3 h-3 text-blue-500" />}
            {badge}
          </span>
        ))}
      </div>
    </Link>
  );
}
