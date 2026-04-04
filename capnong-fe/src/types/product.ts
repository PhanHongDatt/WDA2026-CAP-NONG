// ─── Product Types (khớp API Contract v1.1 + Database design) ───

import type { UnitResponse } from "./unit";
import type { UserSummary } from "./user";

// ─── Enums ───

export type ProductCategory = "FRUIT" | "VEGETABLE" | "GRAIN" | "TUBER" | "HERB" | "OTHER";
export type FarmingMethod = "TRADITIONAL" | "ORGANIC" | "VIETGAP" | "GLOBALGAP";
export type ProductStatus = "IN_SEASON" | "UPCOMING" | "OFF_SEASON" | "OUT_OF_STOCK" | "HIDDEN";

// ─── Shop Summary (nested trong Product) ───

export interface ShopSummary {
  id: string;
  slug: string;
  name: string;
  province: string;
  district: string;
  avatar_url?: string;
  owner: UserSummary;
  average_rating: number;
  total_reviews: number;
}

// ─── Product ───

export interface Product {
  id: string;                       // UUID
  name: string;
  slug: string;
  description?: string;
  category: ProductCategory;
  unit: UnitResponse;               // Object (code, display_name, symbol, conversion)
  price_per_unit: number;
  available_quantity: number;        // NUMERIC(12,3)
  harvest_date?: string;            // ISO date
  available_from?: string;          // ISO date
  farming_method: FarmingMethod;
  pesticide_free: boolean;
  location_detail: string;          // Địa điểm canh tác cụ thể
  status: ProductStatus;
  images: string[];                 // Tối đa 10 ảnh (Cloudinary URLs)
  average_rating?: number;
  total_reviews: number;
  sold_count: number;               // FE-computed (hoặc từ API riêng)
  shop: ShopSummary;                // Nested shop info
  created_at: string;
  updated_at: string;
}

// ─── Product Badges (FE-only hiển thị) ───

export interface ProductBadge {
  label: string;
  type: "organic" | "certification" | "harvest" | "promo";
}

// ─── Category (cho UI grid) ───

export interface Category {
  id: ProductCategory | "ALL";
  label: string;
  icon: string;
  productCount?: number;
}

// ─── Filter & Search ───

export interface ProductFilter {
  category?: ProductCategory;
  province?: string;
  district?: string;
  status?: ProductStatus;
  farming_method?: FarmingMethod;
  min_price?: number;
  max_price?: number;
  search?: string;                 // Full-text search
  sort?: "newest" | "price-asc" | "price-desc" | "best-seller";
  page?: number;
  size?: number;
}

// ─── Product Create (cho form đăng SP) ───

export interface ProductCreateRequest {
  name: string;
  description?: string;
  category: ProductCategory;
  unit_code: string;
  price_per_unit: number;
  available_quantity: number;
  harvest_date?: string;
  available_from?: string;
  farming_method: FarmingMethod;
  pesticide_free: boolean;
  location_detail: string;
  images: string[];
}

// ─── Pagination ───

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ProductListResponse {
  data: Product[];
  pagination: Pagination;
}
