/**
 * Product Normalizer — Transform BE ProductResponse (camelCase) → FE Product (snake_case)
 *
 * BE ProductResponse fields:
 *   id (UUID), name, description, category, unitCode, unitName, pricePerUnit,
 *   availableQuantity, locationDetail, status, createdAt, harvestDate, availableFrom,
 *   farmingMethod, pesticideFree, minOrderQuantity, weight, origin, shelfLife,
 *   averageRating, totalReviews, images[{id, url, sortOrder}],
 *   shopId, shopSlug, shopName
 *
 * FE Product fields:
 *   id, name, slug, description, category, unit, price_per_unit,
 *   available_quantity, harvest_date, available_from, farming_method,
 *   pesticide_free, location_detail, status, images (string[]),
 *   average_rating, total_reviews, sold_count, shop (ShopSummary),
 *   created_at, updated_at
 */

import type { Product } from "@/types/product";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Generate slug from product name (Vietnamese-safe)
 */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Normalize a single BE ProductResponse → FE Product
 */
export function normalizeProduct(raw: any): Product {
  if (!raw) return raw;

  // Extract image URLs from BE's image objects
  const images: string[] = Array.isArray(raw.images)
    ? raw.images.map((img: any) => (typeof img === "string" ? img : img.url || ""))
    : [];

  return {
    id: String(raw.id || ""),
    name: raw.name || "",
    slug: raw.slug || generateSlug(raw.name || ""),
    description: raw.description || "",
    category: raw.category || "OTHER",
    unit: {
      code: raw.unitCode || raw.unit?.code || "KG",
      display_name: raw.unitName || raw.unit?.display_name || raw.unitCode || "Kg",
      symbol: raw.unitCode?.toLowerCase() || raw.unit?.symbol || "kg",
    },
    price_per_unit: Number(raw.pricePerUnit ?? raw.price_per_unit ?? 0),
    available_quantity: Number(raw.availableQuantity ?? raw.available_quantity ?? 0),
    harvest_date: raw.harvestDate || raw.harvest_date || undefined,
    available_from: raw.availableFrom || raw.available_from || undefined,
    farming_method: raw.farmingMethod || raw.farming_method || "TRADITIONAL",
    pesticide_free: raw.pesticideFree ?? raw.pesticide_free ?? false,
    location_detail: raw.locationDetail || raw.location_detail || "",
    status: raw.status || "IN_SEASON",
    images,
    average_rating: Number(raw.averageRating ?? raw.average_rating ?? 0),
    total_reviews: Number(raw.totalReviews ?? raw.total_reviews ?? 0),
    sold_count: Number(raw.soldCount ?? raw.sold_count ?? 0),
    shop: {
      id: String(raw.shopId || raw.shop?.id || ""),
      slug: raw.shopSlug || raw.shop?.slug || "",
      name: raw.shopName || raw.shop?.name || "",
      province: raw.shop?.province || "",
      district: raw.shop?.district || "",
      avatar_url: raw.shop?.avatar_url || raw.ownerAvatarUrl || undefined,
      owner: raw.shop?.owner || {
        id: "",
        full_name: raw.shopName || "",
        phone: "",
        role: "FARMER" as const,
      },
      average_rating: Number(raw.averageRating ?? 0),
      total_reviews: Number(raw.totalReviews ?? 0),
    },
    created_at: raw.createdAt || raw.created_at || new Date().toISOString(),
    updated_at: raw.updatedAt || raw.updated_at || new Date().toISOString(),
  } as Product;
}

/**
 * Normalize an array of BE ProductResponse → FE Product[]
 */
export function normalizeProducts(rawList: any[]): Product[] {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(normalizeProduct);
}
