/**
 * Shop Normalizer — Transform BE ShopResponse (camelCase) → FE Shop (snake_case)
 *
 * BE ShopResponse fields:
 *   id (UUID), slug, name, province, ward, bio,
 *   yearsExperience, farmAreaM2, avatarUrl, coverUrl,
 *   averageRating, totalReviews, createdAt,
 *   ownerId, ownerUsername, ownerFullName, ownerAvatarUrl
 */

import type { Shop } from "@/types/shop";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function normalizeShop(raw: any): Shop {
  if (!raw) return raw;

  // 🎀 FALLBACK MOCK DATA HÌNH ẢNH
  const avatar = raw.avatarUrl ?? raw.avatar_url;
  const cover = raw.coverUrl ?? raw.cover_url;
  const seed = (raw.id || raw.name || "shop").toString().substring(0, 5);
  const mockAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=e8f5e9`;
  const mockCover = `https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1200&q=80`;

  return {
    id: String(raw.id || ""),
    slug: raw.slug || "",
    name: raw.name || "",
    province: raw.province || "",
    ward: raw.ward || "",
    bio: raw.bio || undefined,
    description: raw.description || undefined,
    years_experience: raw.yearsExperience ?? raw.years_experience ?? undefined,
    farm_area_m2: raw.farmAreaM2 ?? raw.farm_area_m2 ?? undefined,
    avatar_url: avatar || mockAvatar,
    cover_url: cover || mockCover,
    owner: raw.owner || {
      id: String(raw.ownerId || ""),
      full_name: raw.ownerFullName || raw.ownerUsername || "",
      phone: "",
      role: "FARMER" as const,
      avatar_url: raw.ownerAvatarUrl || undefined,
    },
    htx: raw.htx || undefined,
    isHtxShop: raw.isHtxShop ?? raw.is_htx_shop ?? false,
    average_rating: Number(raw.averageRating ?? raw.average_rating ?? 0),
    total_reviews: Number(raw.totalReviews ?? raw.total_reviews ?? 0),
    product_count: raw.productCount ?? raw.product_count ?? undefined,
    order_count: raw.orderCount ?? raw.order_count ?? undefined,
    created_at: raw.createdAt || raw.created_at || new Date().toISOString(),
  } as Shop;
}

export function normalizeShops(rawList: any[]): Shop[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(normalizeShop);
}
