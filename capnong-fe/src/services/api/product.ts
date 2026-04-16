/**
 * API Product Service — Khớp BE ProductController
 *
 * BE Endpoints:
 *   GET     /api/products              → Tìm kiếm + pagination + filter (public)
 *   GET     /api/products/{id}         → Chi tiết sản phẩm (public)
 *   POST    /api/products              → Tạo sản phẩm (FARMER+)
 *   PUT     /api/products/{id}         → Cập nhật sản phẩm (FARMER+)
 *   PATCH   /api/products/{id}/status  → Đổi trạng thái (FARMER+)
 *   PATCH   /api/products/{id}/price   → Đổi giá (FARMER+)
 *   PATCH   /api/products/{id}/quantity → Đổi sản lượng (FARMER+)
 *   DELETE  /api/products/{id}         → Soft-delete (FARMER+)
 *   POST    /api/products/{id}/images  → Upload ảnh (FARMER+)
 *   DELETE  /api/products/{productId}/images/{imageId} → Xóa ảnh
 *   GET     /api/shops/{slug}/products → Lấy SP theo shop (public)
 *
 * BE Response: ApiResponse<PagedResponse<ProductResponse>>
 *   PagedResponse: { content, page, size, totalElements, totalPages, last }
 *   ProductResponse: camelCase fields → cần normalizer
 */
import api from "../api";
import type { IProductService, PaginatedResult, ProductSearchParams } from "../types";
import type { Product } from "@/types/product";
import { normalizeProduct, normalizeProducts } from "../normalizers/product";

export const apiProductService: IProductService = {
  /**
   * Search products — GET /api/products
   */
  async search(params?: ProductSearchParams): Promise<PaginatedResult<Product>> {
    const queryParams: Record<string, string> = {};
    if (params?.category) queryParams.category = params.category;
    if (params?.keyword) queryParams.keyword = params.keyword;
    if (params?.status) queryParams.status = params.status;
    if (params?.minPrice !== undefined) queryParams.minPrice = String(params.minPrice);
    if (params?.maxPrice !== undefined) queryParams.maxPrice = String(params.maxPrice);
    if (params?.province) queryParams.province = params.province;
    if (params?.farmingMethod) queryParams.farmingMethod = params.farmingMethod;
    if (params?.pesticideFree !== undefined) queryParams.pesticideFree = String(params.pesticideFree);
    if (params?.shopId) queryParams.shopId = params.shopId;
    if (params?.shopSlug) queryParams.shopSlug = params.shopSlug;
    if (params?.sort) queryParams.sort = params.sort;
    queryParams.page = String(params?.page || 0);
    queryParams.size = String(params?.size || 20);

    const res = await api.get("/api/products", { params: queryParams });
    const data = res.data.data || res.data;
    return {
      content: normalizeProducts(data.content || []),
      total_elements: data.totalElements ?? 0,
      total_pages: data.totalPages ?? 0,
      page: data.page ?? 0,
      size: data.size ?? 20,
    };
  },

  /**
   * Get product by ID — GET /api/products/{id}
   */
  async getById(id: string): Promise<Product | null> {
    try {
      const res = await api.get(`/api/products/${id}`);
      const raw = res.data.data || res.data;
      return raw ? normalizeProduct(raw) : null;
    } catch {
      return null;
    }
  },

  /**
   * Get product by slug — BE không có endpoint slug riêng
   * → Tìm bằng search keyword, trả kết quả đầu tiên
   */
  async getBySlug(slug: string): Promise<Product | null> {
    try {
      const result = await this.search({ keyword: slug, size: 1 });
      return result.content.length > 0 ? result.content[0] : null;
    } catch {
      return null;
    }
  },

  /**
   * Sản phẩm đang mùa — GET /api/products?status=IN_SEASON&size=8
   */
  async getSeasonalProducts(): Promise<Product[]> {
    try {
      const result = await this.search({ status: "IN_SEASON", size: 8 });
      return result.content;
    } catch {
      return [];
    }
  },

  /**
   * Sản phẩm mới — GET /api/products?sort=createdAt,desc&size=8
   */
  async getNewProducts(): Promise<Product[]> {
    try {
      const result = await this.search({ sort: "createdAt,desc", size: 8 });
      return result.content;
    } catch {
      return [];
    }
  },

  /**
   * Flash deals — GET /api/products?sort=pricePerUnit,asc&size=8
   * BE chưa có endpoint flash deal riêng → dùng giá thấp nhất
   */
  async getFlashDeals(): Promise<Product[]> {
    try {
      const result = await this.search({ sort: "pricePerUnit,asc", size: 8 });
      return result.content;
    } catch {
      return [];
    }
  },

  /**
   * Create product — POST /api/products
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

/** Named export for direct import */
export const createProduct = apiProductService.createProduct!.bind(apiProductService);
