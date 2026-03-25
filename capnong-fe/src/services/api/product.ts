/**
 * API Product Service — gọi BE thật theo API Contract v1.1
 */
import type { IProductService, PaginatedResult, ProductSearchParams } from "../types";
import type { Product } from "@/types/product";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const apiProductService: IProductService = {
  async search(params?: ProductSearchParams): Promise<PaginatedResult<Product>> {
    const url = new URL(`${API_URL}/products`);
    if (params?.category) url.searchParams.set("category", params.category);
    if (params?.status) url.searchParams.set("status", params.status);
    if (params?.minPrice) url.searchParams.set("minPrice", String(params.minPrice));
    if (params?.maxPrice) url.searchParams.set("maxPrice", String(params.maxPrice));
    if (params?.keyword) url.searchParams.set("keyword", params.keyword);
    url.searchParams.set("page", String(params?.page || 0));
    url.searchParams.set("size", String(params?.size || 20));

    const res = await fetch(url.toString(), { headers: getAuthHeaders() });
    if (!res.ok) throw new Error("Lỗi tải sản phẩm");
    const json = await res.json();
    const data = json.data || json;
    // Normalize Spring Boot Page response
    return {
      content: data.content || [],
      total_elements: data.total_elements ?? data.totalElements ?? 0,
      total_pages: data.total_pages ?? data.totalPages ?? 0,
      page: data.number ?? data.page ?? 0,
      size: data.size ?? 20,
    };
  },

  async getById(id: string): Promise<Product | null> {
    try {
      const res = await fetch(`${API_URL}/products/${id}`, { headers: getAuthHeaders() });
      if (!res.ok) return null;
      const json = await res.json();
      const data = json.data || json;
      return data.product || data;
    } catch {
      return null;
    }
  },

  async getBySlug(slug: string): Promise<Product | null> {
    // BE dùng UUID, gọi search bằng slug nếu cần
    return this.getById(slug);
  },

  async getSeasonalProducts(): Promise<Product[]> {
    const result = await this.search({ status: "IN_SEASON", size: 8 });
    return result.content;
  },

  async getNewProducts(): Promise<Product[]> {
    const result = await this.search({ size: 8 });
    return result.content;
  },

  async getFlashDeals(): Promise<Product[]> {
    // Flash deals = sản phẩm có giá tốt, BE chưa có endpoint riêng
    const result = await this.search({ size: 6 });
    return result.content;
  },
};
