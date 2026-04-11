/**
 * API Shop Service — Khớp BE ShopController
 *
 * BE Endpoints:
 *   POST /api/shops                → Tạo gian hàng (FARMER+)
 *   GET  /api/shops/{slug}         → Chi tiết gian hàng (public)
 *   PUT  /api/shops/{slug}         → Cập nhật gian hàng (owner only)
 *   GET  /api/shops/{slug}/products → Danh sách SP của shop (public)
 *
 * BE ShopCreateRequest: { name, slug, province, district, bio }
 * Response: ApiResponse<Object>
 */
import api from "../api";
import type { IShopService } from "../types";
import type { Product } from "@/types/product";
import type { Shop } from "@/types/shop";

export const apiShopService: IShopService = {
  async getBySlug(slug: string): Promise<Shop | null> {
    try {
      const res = await api.get(`/api/shops/${slug}`);
      return res.data.data || res.data || null;
    } catch {
      return null;
    }
  },

  async getProducts(shopSlug: string): Promise<Product[]> {
    try {
      const res = await api.get(`/api/shops/${shopSlug}/products`);
      return res.data.data || res.data || [];
    } catch {
      return [];
    }
  },

  async getFeaturedShops(): Promise<Shop[]> {
    // BE hiện chưa có endpoint featured shops → return empty
    // TODO: Khi BE thêm GET /api/shops?featured=true → implement
    return [];
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
