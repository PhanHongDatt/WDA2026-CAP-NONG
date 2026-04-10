"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Home, ChevronRight, Trash2 } from "lucide-react";
import ProductCard from "@/components/ui/ProductCard";
import { useWishlist } from "@/hooks/useWishlist";
import { productService } from "@/services";
import type { Product } from "@/types/product";

/**
 * Wishlist page — danh sách yêu thích
 * Dùng useWishlist hook (localStorage) + fetch product data từ API
 */
export default function WishlistPage() {
  const { ids, toggle, clear } = useWishlist();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      if (ids.size === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // Load each product by ID, skip failures
        const results = await Promise.allSettled(
          [...ids].map((id) => productService.getById(id))
        );
        const loaded = results
          .filter((r): r is PromiseFulfilledResult<Product | null> => r.status === "fulfilled")
          .map((r) => r.value)
          .filter((p): p is Product => p !== null);
        setProducts(loaded);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [ids]);

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

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
          <Heart className="w-6 h-6 text-red-500 fill-red-500" />
          Sản phẩm yêu thích
          {ids.size > 0 && (
            <span className="text-sm font-normal text-foreground-muted">({ids.size})</span>
          )}
        </h1>
        {ids.size > 0 && (
          <button
            type="button"
            onClick={clear}
            className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Xóa tất cả
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
          <p className="text-foreground-muted text-sm">Đang tải...</p>
        </div>
      ) : products.length === 0 ? (
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
            <ShoppingCart className="w-5 h-5" /> Khám phá nông sản
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <button
                type="button"
                onClick={() => toggle(product.id)}
                className="absolute top-2 right-2 z-10 p-1.5 bg-white/90 dark:bg-surface/90 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
                aria-label="Xóa khỏi yêu thích"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
