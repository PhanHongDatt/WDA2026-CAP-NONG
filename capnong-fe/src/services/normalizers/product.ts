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
  let images: string[] = Array.isArray(raw.images)
    ? raw.images.map((img: any) => (typeof img === "string" ? img : img.url || "")).filter(Boolean)
    : [];

  // 🎀 FALLBACK MOCK DATA HÌNH ẢNH (Theo yêu cầu: chỉ minh họa bằng mockdata khi API không có hình)
  if (images.length === 0) {
    
    // Use a pool of high-quality Unsplash agriculture images instead of loremflickr
    const mockImages = [
      "https://images.unsplash.com/photo-1595853035070-59a39fe84ee3?w=400&q=80", // Tomato
      "https://images.unsplash.com/photo-1519996529931-28324d5a6396?w=400&q=80", // Farm veg
      "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=80", // Pumpkin/Orange
      "https://images.unsplash.com/photo-1557844352-761f2565b576?w=400&q=80", // Vegetables
      "https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=400&q=80", // Oranges
      "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400&q=80", // Bananas
      "https://images.unsplash.com/photo-1596422846543-74c6c21eec4f?w=400&q=80", // Coffee beans
      "https://images.unsplash.com/photo-1628152528751-2f88ebbc22b7?w=400&q=80"  // Durian/Jackfruit lookalike
    ];
    
    // Pick consistently based on id
    const seedNum = raw.id ? String(raw.id).charCodeAt(0) + String(raw.id).charCodeAt(raw.id.length - 1 || 0) : 0;
    const index = seedNum % mockImages.length;
    images = [mockImages[index]];
  }

  return {
    id: String(raw.id || ""),
    name: raw.name || "",
    slug: raw.slug || generateSlug(raw.name || ""),
    description: raw.description || "",
    category: raw.category || "OTHER",
    unit: {
      code: raw.unitCode || raw.unit_code || raw.unit?.code || "KG",
      display_name: raw.unitName || raw.unit_name || raw.unit?.display_name || raw.unitCode || raw.unit_code || "Kg",
      symbol: (raw.unitCode || raw.unit_code || raw.unit?.symbol || "kg").toLowerCase(),
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
    sold_count: Number(raw.soldCount ?? raw.sold_count ?? raw.totalSold ?? raw.total_sold ?? 0),
    shop: {
      id: String(raw.shopId || raw.shop_id || raw.shop?.id || ""),
      slug: raw.shopSlug || raw.shop_slug || raw.shop?.slug || "",
      name: raw.shopName || raw.shop_name || raw.shop?.name || "",
      province: raw.shop?.province || "",
      district: raw.shop?.district || "",
      avatar_url: raw.shop?.avatar_url || raw.ownerAvatarUrl || undefined,
      owner: raw.shop?.owner || {
        id: "",
        full_name: raw.shopName || raw.shop_name || "",
        phone: "",
        role: "FARMER" as const,
      },
      average_rating: Number(raw.averageRating ?? raw.average_rating ?? 0),
      total_reviews: Number(raw.totalReviews ?? raw.total_reviews ?? 0),
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
