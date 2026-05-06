// ─── Shop Types (khớp API Contract + Database design) ───

import type { UserSummary } from "./user";
import type { HtxSummary } from "./htx";

export interface Shop {
  id: string;                   // UUID
  slug: string;                 // URL-friendly, unique
  name: string;
  province: string;
  ward: string;
  bio?: string;                 // Câu chuyện người trồng
  description?: string;         // Mô tả gian hàng
  years_experience?: number;
  farm_area_m2?: number;
  avatar_url?: string;
  cover_url?: string;
  owner: UserSummary;
  htx?: HtxSummary;            // null nếu farmer không thuộc HTX
  isHtxShop: boolean;          // phân biệt shop cá nhân hay shop HTX
  average_rating: number;
  total_reviews: number;
  product_count?: number;
  order_count?: number;
  created_at: string;
}

/** ShopCreateRequest — khi FARMER tạo gian hàng */
export interface ShopCreateRequest {
  name: string;
  slug: string;                 // Pattern: ^[a-z0-9-]+$
  province: string;
  ward: string;
  bio?: string;
  years_experience?: number;
  farm_area_m2?: number;
  avatar_url?: string;
  cover_url?: string;
}

// ─── Gallery (FE-only — ảnh vườn trong trang shop) ───

export interface GalleryImage {
  url: string;
  caption: string;
}

// ─── Review (khớp API Contract) ───

export interface Review {
  id: string;
  author_id: string;
  author_name?: string;
  author_avatar_url?: string;
  product_id: string;
  rating: number;               // 1-5
  comment: string;              // Min 10 chars
  images?: string[];            // Tối đa 5 ảnh
  seller_reply?: string;
  created_at: string;
}

export interface ReviewCreateRequest {
  product_id: string;
  order_item_id: string;        // Verify DELIVERED status
  rating: number;
  comment: string;
  images?: string[];
}

export interface ReviewReplyRequest {
  reply: string;
}
