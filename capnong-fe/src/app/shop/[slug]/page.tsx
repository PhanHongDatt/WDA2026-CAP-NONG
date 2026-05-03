"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Star,
  MapPin,
  Package,
  Calendar,
  Building2,
  TrendingUp,
} from "lucide-react";
import { shopService } from "@/services";
import { getShopBundles } from "@/services/api/htx";
import ProductCard from "@/components/ui/ProductCard";
import type { Shop } from "@/types/shop";
import type { Product } from "@/types/product";

export default function ShopPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const isHtxShop = slug.startsWith("htx-");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const s = await shopService.getBySlug(slug);
        setShop(s);
        if (s) {
          const prods = await shopService.getProducts(slug);
          setProducts(prods);
          
          if (slug.startsWith("htx-")) {
            const b = await getShopBundles(s.id);
            setBundles(b);
          }
        }
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center">
        <p className="text-xl font-bold text-foreground mb-4">Không tìm thấy nhà vườn</p>
        <Link href="/home" className="text-primary hover:underline">← Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-foreground-muted">
        <Link href="/home" className="hover:text-primary">🏠 Trang chủ</Link>
        <span>›</span>
        <span className="text-foreground font-medium">{shop.name}</span>
      </nav>

      {/* Shop Header */}
      <div className="bg-white dark:bg-surface rounded-2xl border border-border overflow-hidden">
        {/* Banner */}
        <div className="h-40 bg-gradient-to-r from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 relative">
          {shop.cover_url && (
            <Image src={shop.cover_url} alt="Banner" fill className="object-cover opacity-30" />
          )}
        </div>
        {/* Info */}
        <div className="px-6 pb-6 -mt-10 relative">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 bg-primary text-white rounded-xl flex items-center justify-center text-3xl font-black border-4 border-white dark:border-surface shadow-lg shrink-0 overflow-hidden relative">
              {shop.avatar_url ? (
                <Image src={shop.avatar_url} alt={shop.name} fill className="object-cover" />
              ) : (
                shop.name.charAt(0)
              )}
            </div>
            <div className="flex-1 pt-12">
              <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
                {shop.name}
                {isHtxShop && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-bold ml-2">
                    <Building2 className="w-3 h-3" /> Gian hàng Hợp tác xã
                  </span>
                )}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-foreground-muted">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  {shop.ward}, {shop.province}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  {shop.average_rating?.toFixed(1) || "—"} ({shop.total_reviews} đánh giá)
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {products.length} sản phẩm
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Tham gia {new Date(shop.created_at || "").getFullYear() || "2024"}
                </span>
              </div>
            </div>
          </div>
          {shop.description && (
            <p className="mt-4 text-sm text-gray-700 dark:text-foreground-muted leading-relaxed">
              {shop.description}
            </p>
          )}
        </div>
      </div>

      {/* HTX Bundles section */}
      {isHtxShop && bundles.length > 0 && (
        <section className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-amber-900 dark:text-amber-500 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5" /> Sản phẩm sỉ (Gom đơn HTX)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bundles.filter(b => b.status === "OPEN" || b.status === "CONFIRMED").map(b => (
              <div key={b.id} className="bg-white dark:bg-surface p-5 rounded-xl flex justify-between items-center border border-amber-100 dark:border-amber-800">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-foreground">{b.product_name}</h3>
                  <div className="text-sm text-gray-500 mt-1 flex gap-3">
                    <span className="text-amber-600 font-medium">{b.status}</span>
                    <span>Hạn: {new Date(b.deadline).toLocaleDateString("vi-VN")}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 dark:text-foreground">{b.price_per_unit?.toLocaleString()}đ /{b.unit_code}</p>
                  <Link href={`/cooperative/bundles/${b.id}`} className="inline-block mt-2 text-primary hover:underline text-sm font-medium">
                    Xem chi tiết →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Sản phẩm của {shop.name}</h2>
          <span className="text-sm text-foreground-muted">{products.length} sản phẩm</span>
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-foreground-muted">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Chưa có sản phẩm nào</p>
          </div>
        )}
      </section>

      {/* Back button */}
      <div className="text-center">
        <Link href="/home" className="inline-flex items-center gap-2 text-sm text-primary font-medium hover:underline">
          <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}
