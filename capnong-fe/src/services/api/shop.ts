/**
 * API Shop Service — Khớp BE ShopController
 *
 * BE Endpoints:
 *   POST /api/shops                → Tạo gian hàng (FARMER+)
 *   GET  /api/shops/me             → Gian hàng của tôi (FARMER)
 *   GET  /api/shops/{slug}         → Chi tiết gian hàng (public)
 *   PUT  /api/shops/{slug}         → Cập nhật gian hàng (owner only)
 *   DELETE /api/shops/{slug}       → Xóa gian hàng (owner only)
 *   GET  /api/shops/{slug}/products → Danh sách SP của shop (public)
 *
 * Response: ApiResponse<ShopResponse> (camelCase)
 */
import api from "../api";
import type { IShopService } from "../types";
import type { Product } from "@/types/product";
import type { Shop } from "@/types/shop";
import { normalizeShop } from "../normalizers/shop";
import { normalizeProducts } from "../normalizers/product";

export const apiShopService: IShopService = {
  async getBySlug(slug: string): Promise<Shop | null> {
    try {
      const res = await api.get(`/api/shops/${slug}`);
      const raw = res.data.data || res.data;
      return raw ? normalizeShop(raw) : null;
    } catch {
      return null;
    }
  },

  async getProducts(shopSlug: string): Promise<Product[]> {
    try {
      const res = await api.get(`/api/shops/${shopSlug}/products`);
      const data = res.data.data || res.data;
      // BE trả PagedResponse → lấy content
      const content = data.content || data;
      return normalizeProducts(Array.isArray(content) ? content : []);
    } catch {
      return [];
    }
  },

  async getFeaturedShops(): Promise<Shop[]> {
    try {
      const res = await api.get(`/api/shops?featured=true&size=5`);
      const data = res.data.data || res.data;
      const content = data.content || data;
      return Array.isArray(content) ? content.map(normalizeShop) : [];
    } catch {
      return [];
    }
  },

  async createShop(data: {
    name: string;
    slug: string;
    province: string;
    district: string;
    bio?: string;
  }): Promise<unknown> {
    const res = await api.post("/api/shops", data);
    return res.data.data || res.data;
  },

  async updateShop(slug: string, data: {
    name: string;
    slug: string;
    province: string;
    district: string;
    bio?: string;
  }): Promise<unknown> {
    const res = await api.put(`/api/shops/${slug}`, data);
    return res.data.data || res.data;
  },
};

/* ═══════ Additional Shop Endpoints ═══════ */

/**
 * Xem gian hàng của tôi — GET /api/shops/me (FARMER)
 */
export async function getMyShop(): Promise<Shop | null> {
  try {
    const res = await api.get("/api/shops/me");
    const raw = res.data.data || res.data;
    return raw ? normalizeShop(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Xóa gian hàng (soft delete) — DELETE /api/shops/{slug} (owner only)
 */
export async function deleteShop(slug: string): Promise<void> {
  await api.delete(`/api/shops/${slug}`);
}
