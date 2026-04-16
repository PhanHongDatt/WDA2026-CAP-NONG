/**
 * Shop Normalizer — Transform BE ShopResponse (camelCase) → FE Shop (snake_case)
 *
 * BE ShopResponse fields:
 *   id (UUID), slug, name, province, district, bio,
 *   yearsExperience, farmAreaM2, avatarUrl, coverUrl,
 *   averageRating, totalReviews, createdAt,
 *   ownerId, ownerUsername, ownerFullName, ownerAvatarUrl
 */

import type { Shop } from "@/types/shop";

/* eslint-disable @typescript-eslint/no-explicit-any */

export function normalizeShop(raw: any): Shop {
  if (!raw) return raw;

  return {
    id: String(raw.id || ""),
    slug: raw.slug || "",
    name: raw.name || "",
    province: raw.province || "",
    district: raw.district || "",
    bio: raw.bio || undefined,
    description: raw.description || undefined,
    years_experience: raw.yearsExperience ?? raw.years_experience ?? undefined,
    farm_area_m2: raw.farmAreaM2 ?? raw.farm_area_m2 ?? undefined,
    avatar_url: raw.avatarUrl ?? raw.avatar_url ?? undefined,
    cover_url: raw.coverUrl ?? raw.cover_url ?? undefined,
    owner: raw.owner || {
      id: String(raw.ownerId || ""),
      full_name: raw.ownerFullName || raw.ownerUsername || "",
      phone: "",
      role: "FARMER" as const,
      avatar_url: raw.ownerAvatarUrl || undefined,
    },
    htx: raw.htx || undefined,
    average_rating: Number(raw.averageRating ?? raw.average_rating ?? 0),
    total_reviews: Number(raw.totalReviews ?? raw.total_reviews ?? 0),
    created_at: raw.createdAt || raw.created_at || new Date().toISOString(),
  } as Shop;
}

export function normalizeShops(rawList: any[]): Shop[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(normalizeShop);
}
