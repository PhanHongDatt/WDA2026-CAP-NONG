"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { shimmer } from "@/lib/image-placeholder";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  variant?: "seasonal" | "latest";
}

/**
 * ProductCard — Redesign theo feedback
 * - Badge overlay trên hình
 * - "Đã bán" cùng row với tên
 * - Bỏ hover translate (lag ĐT), đổi sang border highlight
 * - Nút ♥ tooltip + hover fill đỏ
 * - Unified CTA: "Thêm vào giỏ"
 * - Bỏ ĐVT row riêng
 */
export default function ProductCard({
  product,
  variant = "seasonal",
}: ProductCardProps) {
  const [liked, setLiked] = useState(false);

  /* Badges tự tính từ product data */
  const badges: { label: string; color: string }[] = [];
  if (product.pesticide_free) badges.push({ label: "Không BVTV", color: "bg-green-600" });
  if (product.farming_method === "ORGANIC") badges.push({ label: "Hữu cơ", color: "bg-green-600" });
  if (product.farming_method === "VIETGAP") badges.push({ label: "VietGAP", color: "bg-blue-600" });
  if (product.farming_method === "GLOBALGAP") badges.push({ label: "GlobalGAP", color: "bg-blue-600" });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: connect cartService.addItem
    console.log("Add to cart:", product.slug);
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
    // TODO: connect wishlistService
  };

  return (
    <div className="group bg-white dark:bg-surface rounded-xl overflow-hidden relative border border-gray-100 dark:border-border hover:border-primary/50 hover:shadow-md transition-all duration-200">
      {/* Image Container — badges & wishlist overlay */}
      <Link href={`/product/${product.id}`} className="block relative">
        <div className="aspect-square bg-gray-50 dark:bg-background-light overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            placeholder="blur"
            blurDataURL={shimmer(400, 400)}
          />
        </div>

        {/* Badges — overlay trên hình */}
        {badges.length > 0 && (
          <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
            {badges.map((badge, i) => (
              <span
                key={i}
                className={`${badge.color} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}

        {/* Wishlist — tooltip + fill */}
        <button
          type="button"
          onClick={handleToggleLike}
          title="Thêm vào yêu thích"
          aria-label="Thêm vào yêu thích"
          className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            liked
              ? "bg-red-500 text-white shadow-lg"
              : "bg-white/80 dark:bg-surface/80 text-gray-400 hover:text-red-500 hover:bg-white shadow-sm backdrop-blur-sm"
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-white" : ""}`} />
        </button>
      </Link>

      {/* Content */}
      <div className="p-3">
        {/* Name + Sold Count — cùng khu vực */}
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-bold text-sm text-gray-900 dark:text-foreground leading-tight line-clamp-2 hover:text-primary transition-colors mb-1">
            {product.name}
          </h3>
        </Link>

        {/* Sold count — cùng row sau tên */}
        {product.sold_count > 0 && (
          <p className="text-[11px] text-gray-400 dark:text-foreground-muted mb-2">
            Đã bán {product.sold_count > 999 ? `${(product.sold_count / 1000).toFixed(1)}k` : product.sold_count}
          </p>
        )}

        {/* Price */}
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-lg font-black text-primary">
            {formatCurrency(product.price_per_unit)}
          </span>
          <span className="text-[11px] text-gray-400 dark:text-foreground-muted">
            /{product.unit.symbol}
          </span>
        </div>

        {/* CTA — unified "Thêm vào giỏ" */}
        <button
          type="button"
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary-light active:scale-[0.98] transition-all"
        >
          <ShoppingCart className="w-4 h-4" />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
