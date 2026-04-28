"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Store,
  MapPin,
  Star,
  Calendar,
  Ruler,
  TreePine,
  Edit2,
  ExternalLink,
  Plus,
  Package,
  Loader2,
} from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { getMyShop } from "@/services/api/shop";
import type { Shop } from "@/types/shop";

function ShopOverviewContent() {
  const { user } = useAuth();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const s = await getMyShop();
        setShop(s);
      } catch { /* ignore */ }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  /* ─── Chưa có gian hàng → CTA Tạo mới ─── */
  if (!shop) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-6">
        <div className="w-24 h-24 bg-primary-50 dark:bg-primary-dark rounded-full flex items-center justify-center mx-auto">
          <Store className="w-12 h-12 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground mb-2">
            Chào {user?.full_name || "Nhà vườn"}! 🌱
          </h1>
          <p className="text-foreground-muted max-w-md mx-auto">
            Bạn chưa có gian hàng. Hãy tạo gian hàng để bắt đầu bán nông sản và tiếp cận hàng ngàn người mua trên Cạp Nông.
          </p>
        </div>

        <div className="bg-white dark:bg-surface border border-border rounded-2xl p-6 max-w-md mx-auto text-left space-y-3">
          <h3 className="font-bold text-sm text-foreground">Gian hàng của bạn sẽ có:</h3>
          <ul className="space-y-2 text-sm text-foreground-muted">
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center text-primary text-xs">✓</span>
              Trang cửa hàng riêng với link định danh
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center text-primary text-xs">✓</span>
              Câu chuyện người trồng & thông tin vườn
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center text-primary text-xs">✓</span>
              Đăng bán sản phẩm bằng giọng nói (AI)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center text-primary text-xs">✓</span>
              Nhận đơn hàng & thông báo tức thời
            </li>
          </ul>
        </div>

        <Link
          href="/dashboard/shop/create"
          className="inline-flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-bold hover:bg-primary-light transition-colors shadow-md shadow-primary/20 text-base"
        >
          <Plus className="w-5 h-5" />
          Tạo gian hàng ngay
        </Link>
      </div>
    );
  }

  /* ─── Đã có gian hàng → Hiển thị thông tin ─── */
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Store className="w-6 h-6 text-primary" />
            Gian hàng của tôi
          </h1>
          <p className="text-foreground-muted text-sm mt-1">
            Quản lý thông tin và hình ảnh gian hàng
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/shop/${shop.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Xem trang công khai
          </Link>
          <Link
            href="/dashboard/shop/edit"
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-light transition-colors shadow-sm shadow-primary/20 text-sm"
          >
            <Edit2 className="w-4 h-4" />
            Chỉnh sửa
          </Link>
        </div>
      </div>

      {/* Shop Card */}
      <div className="bg-white dark:bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
        {/* Cover */}
        <div className="h-44 bg-gradient-to-r from-primary/20 to-primary/5 dark:from-primary/30 dark:to-primary/10 relative">
          {shop.cover_url && (
            <Image src={shop.cover_url} alt="Ảnh bìa" fill className="object-cover" />
          )}
        </div>

        {/* Info */}
        <div className="px-6 pb-6 -mt-12 relative">
          <div className="flex items-end gap-4">
            <div className="w-24 h-24 rounded-xl border-4 border-white dark:border-surface shadow-lg overflow-hidden shrink-0 bg-primary flex items-center justify-center">
              {shop.avatar_url ? (
                <Image src={shop.avatar_url} alt={shop.name} width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl font-black text-white">{shop.name.charAt(0)}</span>
              )}
            </div>
            <div className="flex-1 pt-14">
              <h2 className="text-2xl font-black text-foreground">{shop.name}</h2>
              <p className="text-sm text-foreground-muted mt-0.5">
                /shop/{shop.slug}
              </p>
            </div>
          </div>

          {/* Bio */}
          {shop.bio && (
            <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-sm text-foreground leading-relaxed italic">
                &ldquo;{shop.bio}&rdquo;
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[11px] text-foreground-muted uppercase tracking-wider font-medium">Vị trí</p>
            <p className="text-sm font-bold text-foreground">{shop.ward}, {shop.province}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
            <Star className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-[11px] text-foreground-muted uppercase tracking-wider font-medium">Đánh giá</p>
            <p className="text-sm font-bold text-foreground">
              {shop.average_rating > 0 ? `${shop.average_rating.toFixed(1)} ⭐` : "—"}{" "}
              <span className="font-normal text-foreground-muted">({shop.total_reviews})</span>
            </p>
          </div>
        </div>

        {shop.years_experience !== undefined && shop.years_experience !== null && (
          <div className="bg-white dark:bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-[11px] text-foreground-muted uppercase tracking-wider font-medium">Kinh nghiệm</p>
              <p className="text-sm font-bold text-foreground">{shop.years_experience} năm</p>
            </div>
          </div>
        )}

        {shop.farm_area_m2 !== undefined && shop.farm_area_m2 !== null && (
          <div className="bg-white dark:bg-surface border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Ruler className="w-5 h-5 text-info" />
            </div>
            <div>
              <p className="text-[11px] text-foreground-muted uppercase tracking-wider font-medium">Diện tích</p>
              <p className="text-sm font-bold text-foreground">{shop.farm_area_m2.toLocaleString()} m²</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-surface border border-border rounded-xl p-5 space-y-3">
        <h3 className="font-bold text-foreground text-sm">Thao tác nhanh</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/dashboard/products/new"
            className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 hover:bg-primary/10 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Đăng sản phẩm</span>
          </Link>
          <Link
            href="/dashboard/products"
            className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-info group-hover:bg-info group-hover:text-white transition-colors">
              <Package className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Quản lý sản phẩm</span>
          </Link>
          <Link
            href="/dashboard/shop/edit"
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors group"
          >
            <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-foreground-muted group-hover:bg-foreground-muted group-hover:text-white transition-colors">
              <Edit2 className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Sửa thông tin</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * /dashboard/shop — Gian hàng của tôi (FARMER+)
 */
export default function DashboardShopPage() {
  return (
    <ProtectedRoute roles={["FARMER", "HTX_MANAGER", "HTX_MEMBER"]}>
      <ShopOverviewContent />
    </ProtectedRoute>
  );
}
