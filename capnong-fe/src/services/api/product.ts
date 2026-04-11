/**
 * API Product Service — Khớp BE ProductController
 *
 * BE Endpoints:
 *   POST    /api/products         → Tạo sản phẩm (FARMER+)
 *   DELETE  /api/products/{id}    → Soft-delete (FARMER+)
 *   GET     /api/shops/{slug}/products → Lấy danh sách SP theo shop (public)
 *
 * ⚠️ BE hiện CHƯA CÓ: GET /api/products (list all), GET /api/products/{id} (detail)
 *    → FE dùng mock data fallback cho search + detail
 */
import api from "../api";
import type { IProductService, PaginatedResult, ProductSearchParams } from "../types";
import type { Product } from "@/types/product";

// Import mock fallback cho các endpoint BE chưa implement
import { mockProductService } from "../mock/product";

export const apiProductService: IProductService = {
  /**
   * Search products — BE chưa có endpoint riêng → dùng mock fallback
   * TODO: Đổi sang API thật khi BE team implement GET /api/products
   */
  async search(params?: ProductSearchParams): Promise<PaginatedResult<Product>> {
    // Khi BE có endpoint GET /api/products → uncomment code dưới
    // try {
    //   const url = new URL(`${api.defaults.baseURL}/api/products`);
    //   if (params?.category) url.searchParams.set("category", params.category);
    //   if (params?.keyword) url.searchParams.set("keyword", params.keyword);
    //   url.searchParams.set("page", String(params?.page || 0));
    //   url.searchParams.set("size", String(params?.size || 20));
    //   const res = await api.get(url.pathname + url.search);
    //   const data = res.data.data || res.data;
    //   return { content: data.content || [], total_elements: data.totalElements ?? 0, total_pages: data.totalPages ?? 0, page: data.number ?? 0, size: data.size ?? 20 };
    // } catch { }

    return mockProductService.search(params);
  },

  /**
   * Get product by ID — BE chưa có → mock fallback
   */
  async getById(id: string): Promise<Product | null> {
    return mockProductService.getById(id);
  },

  async getBySlug(slug: string): Promise<Product | null> {
    return mockProductService.getBySlug(slug);
  },

  async getSeasonalProducts(): Promise<Product[]> {
    return mockProductService.getSeasonalProducts();
  },

  async getNewProducts(): Promise<Product[]> {
    return mockProductService.getNewProducts();
  },

  async getFlashDeals(): Promise<Product[]> {
    return mockProductService.getFlashDeals();
  },

  /**
   * Create product — BE có!
   * POST /api/products { name, description, category, unitCode, pricePerUnit, availableQuantity, locationDetail }
   */
  async createProduct(data: {
    name: string;
    description?: string;
    category: string;
    unitCode: string;
    pricePerUnit: number;
    availableQuantity: number;
    locationDetail: string;
  }): Promise<unknown> {
    const res = await api.post("/api/products", data);
    return res.data.data || res.data;
  },
};

/** Named export for direct import fallback */
export const createProduct = apiProductService.createProduct!.bind(apiProductService);
