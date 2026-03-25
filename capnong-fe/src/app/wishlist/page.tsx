"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ShoppingCart, ChevronRight, Home } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";

/**
 * Wishlist page — danh sách yêu thích
 * TODO: Kết nối wishlistService khi API sẵn
 */
export default function WishlistPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted mb-6">
        <Link href="/home" className="hover:text-primary transition-colors flex items-center gap-1">
          <Home className="w-3.5 h-3.5" />
          Trang chủ
        </Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">Yêu thích</span>
      </nav>

      <h1 className="text-2xl font-black text-foreground mb-6 flex items-center gap-2">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        Sản phẩm yêu thích
      </h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Chưa có sản phẩm yêu thích</h2>
          <p className="text-foreground-muted mb-6">
            Nhấn ♥ trên sản phẩm để thêm vào danh sách yêu thích
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors"
          >
            Khám phá nông sản
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
