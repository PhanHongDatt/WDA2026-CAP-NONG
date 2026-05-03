"use client";

import { useState } from "react";
import { SafeImage } from "@/lib/safe-image";
import Link from "next/link";
import { Heart, ShoppingCart, Minus, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { shimmer } from "@/lib/image-placeholder";
import { cartService } from "@/services";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  variant?: "seasonal" | "latest";
}

/**
 * ProductCard — UI/UX upgrade
 * Kỹ thuật: bo góc mềm, gradient nền nhẹ, pill CTA, shadow nổi khối
 */
export default function ProductCard({
  product,
  variant: _variant = "seasonal", // eslint-disable-line @typescript-eslint/no-unused-vars
}: ProductCardProps) {
  const [liked, setLiked] = useState(false);
  const [added, setAdded] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const badges: { label: string; color: string }[] = [];
  if (product.pesticide_free) badges.push({ label: "Không BVTV", color: "bg-green-600" });
  if (product.farming_method === "ORGANIC") badges.push({ label: "Hữu cơ", color: "bg-green-600" });
  if (product.farming_method === "VIETGAP") badges.push({ label: "VietGAP", color: "bg-blue-600" });
  if (product.farming_method === "GLOBALGAP") badges.push({ label: "GlobalGAP", color: "bg-blue-600" });

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await cartService.addItem(product.id, quantity);
      setAdded(true);
      setQuantity(1); // Reset sau khi thêm
      setTimeout(() => setAdded(false), 1500);
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
  };

  return (
    <div className="group bg-gradient-to-b from-white to-green-50/40 dark:from-surface dark:to-surface rounded-2xl overflow-hidden relative border border-gray-100 dark:border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300">
      {/* Image Container */}
      <Link href={`/product/${product.id}`} className="block relative">
        <div className="aspect-square bg-gray-50 dark:bg-background-light overflow-hidden rounded-t-2xl">
          {/* Cache buster */}
          <SafeImage
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={400}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            blurDataURL={shimmer(400, 400)}
          />
        </div>

        {/* Badges overlay */}
        {badges.length > 0 && (
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1 z-10">
            {badges.map((badge, i) => (
              <span
                key={i}
                className={`${badge.color} text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-sm`}
              >
                {badge.label}
              </span>
            ))}
          </div>
        )}

        {/* Wishlist */}
        <button
          type="button"
          onClick={handleToggleLike}
          title="Thêm vào yêu thích"
          aria-label="Thêm vào yêu thích"
          className={`absolute top-2.5 right-2.5 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
            liked
              ? "bg-red-500 text-white shadow-lg scale-110"
              : "bg-white/80 dark:bg-surface/80 text-gray-400 hover:text-red-500 hover:bg-white shadow-sm backdrop-blur-sm"
          }`}
        >
          <Heart className={`w-4 h-4 ${liked ? "fill-white" : ""}`} />
        </button>
      </Link>

      {/* Content */}
      <div className="p-3.5">
        {/* Name */}
        <Link href={`/product/${product.id}`}>
          <h3 className="font-bold text-sm text-gray-900 dark:text-foreground leading-tight line-clamp-2 hover:text-primary transition-colors mb-1">
            {product.name}
          </h3>
        </Link>

        {/* Sold count */}
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

        {/* CTA */}
        <div className="flex items-center gap-1.5 sm:gap-2 mt-auto">
          <div className="flex items-center bg-gray-100 dark:bg-surface-hover rounded-full">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(Math.max(1, quantity - 1)); }}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors shrink-0"
            >
              <Minus className="w-3 h-3" />
            </button>
            <input
              type="number"
              value={quantity || ''}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  setQuantity(0);
                } else {
                  const num = parseInt(val, 10);
                  if (!isNaN(num)) {
                    if (num > product.available_quantity) {
                      setQuantity(product.available_quantity);
                    } else {
                      setQuantity(num);
                    }
                  }
                }
              }}
              onBlur={() => {
                if (!quantity || quantity <= 0) setQuantity(1);
              }}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
              className="w-5 sm:w-6 text-center text-xs font-bold bg-transparent border-none focus:ring-0 p-0 appearance-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-gray-900 dark:text-foreground"
            />
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setQuantity(Math.min(product.available_quantity, quantity + 1)); }}
              className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-foreground-muted hover:text-foreground transition-colors shrink-0"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 sm:py-2 px-2 sm:px-4 rounded-full font-bold text-sm active:scale-[0.97] transition-all duration-200 ${
              added
                ? "bg-green-600 text-white"
                : "bg-primary text-white hover:bg-primary-light hover:shadow-md hover:shadow-primary/20"
            }`}
          >
            <ShoppingCart className="w-4 h-4 shrink-0" />
            <span className="truncate hidden sm:inline">{added ? "Đã thêm" : "Thêm"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
