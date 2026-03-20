"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  variant?: "seasonal" | "latest";
}

/**
 * ProductCard — matching home.html template exactly
 * - seasonal: Discount badge, wishlist, unit text, price, badges, quantity +-
 * - latest: Image, name, unit, price, "Thêm vào giỏ" button
 */
export default function ProductCard({
  product,
  variant = "seasonal",
}: ProductCardProps) {
  // originalPrice removed from Product type — discount chỉ dùng trong Flash Deal
  const discountPercent = 0;

  return (
    <div className="product-card-shadow bg-white rounded-xl overflow-hidden relative border border-gray-100 p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      {/* Discount Badge (seasonal only) */}
      {variant === "seasonal" && discountPercent > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
          -{discountPercent}%
        </div>
      )}

      {/* Wishlist Button (seasonal only) */}
      {variant === "seasonal" && (
        <button aria-label="Thêm vào yêu thích" className="absolute top-2 right-2 z-10 text-gray-400 hover:text-accent">
          <Heart className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <Link href={`/products/${product.slug}`}>
        <div className="aspect-square bg-gray-50 rounded-lg mb-4 overflow-hidden">
          <Image
            src={product.images[0]}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </Link>

      {/* Name */}
      <Link href={`/products/${product.slug}`}>
        <h3 className="font-bold text-gray-900 mb-1 leading-tight hover:text-primary transition-colors">
          {product.name}
        </h3>
      </Link>

      {/* Unit */}
      <p className="text-xs text-gray-500 mb-2">ĐVT: {product.unit.symbol}</p>

      {/* Price */}
      <div className="mb-3">
        <span className="text-lg font-bold text-primary">
          {formatCurrency(product.price_per_unit)}
        </span>
        {variant === "seasonal" && (
          <span className="text-xs text-gray-400 ml-1">/{product.unit.symbol}</span>
        )}

      </div>

      {/* Sold Count — Shopee style */}
      {product.sold_count > 0 && (
        <p className="text-xs text-gray-400 mb-2">
          Đã bán {product.sold_count > 999 ? `${(product.sold_count / 1000).toFixed(1)}k` : product.sold_count}
        </p>
      )}

      {/* Badges (seasonal only — computed from farming_method/pesticide_free) */}
      {variant === "seasonal" && (() => {
        const computedBadges: { label: string; type: "organic" | "certification" }[] = [];
        if (product.pesticide_free) computedBadges.push({ label: "Không BVTV", type: "organic" });
        if (product.farming_method === "ORGANIC") computedBadges.push({ label: "Hữu cơ", type: "organic" });
        if (product.farming_method === "VIETGAP") computedBadges.push({ label: "VietGAP", type: "certification" });
        if (product.farming_method === "GLOBALGAP") computedBadges.push({ label: "GlobalGAP", type: "certification" });
        return computedBadges.length > 0 ? (
          <div className="space-y-1 mb-4">
            {computedBadges.map((badge, i) => (
              <span
                key={i}
                className={
                  badge.type === "organic"
                    ? "inline-block text-[10px] bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100 mr-1"
                    : "inline-block text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 mr-1"
                }
              >
                {badge.label}
              </span>
            ))}
          </div>
        ) : null;
      })()}

      {/* CTA */}
      {variant === "latest" ? (
        <button className="w-full py-2 bg-primary text-white rounded-lg font-bold hover:opacity-90 transition-opacity">
          Thêm vào giỏ
        </button>
      ) : (
        <div className="flex items-center border border-gray-200 rounded overflow-hidden">
          <button aria-label="Giảm số lượng" className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border-r border-gray-200 text-gray-600">
            −
          </button>
          <input
            aria-label="Số lượng"
            className="w-full text-center border-none text-sm p-1 focus:ring-0 bg-transparent"
            type="text"
            defaultValue="1"
            readOnly
          />
          <button aria-label="Tăng số lượng" className="px-3 py-1 bg-gray-50 hover:bg-gray-100 border-l border-gray-200 text-gray-600">
            +
          </button>
        </div>
      )}
    </div>
  );
}
