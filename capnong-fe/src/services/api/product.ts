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
      total_elements: data.total_elements ?? data.totalElements ?? 0,
      total_pages: data.total_pages ?? data.totalPages ?? 0,
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
    harvestDate?: string;
    farmingMethod?: string;
    pesticideFree?: boolean;
  }): Promise<unknown> {
    const reqData = {
      name: data.name,
      description: data.description,
      category: data.category,
      unit_code: data.unitCode,
      price_per_unit: data.pricePerUnit,
      available_quantity: data.availableQuantity,
      location_detail: data.locationDetail,
      harvest_date: data.harvestDate,
      farming_method: data.farmingMethod,
      pesticide_free: data.pesticideFree,
    };
    const res = await api.post("/api/products", reqData);
    return res.data.data || res.data;
  },
};

/** Named export for direct import */
export const createProduct = apiProductService.createProduct!.bind(apiProductService);

/* ═══════ Product Management (FARMER+) ═══════ */

/**
 * Lấy danh sách sản phẩm của Seller hiện tại — GET /api/products/seller
 */
export async function getSellerProducts(page = 0, size = 50): Promise<PaginatedResult<Product>> {
  const res = await api.get("/api/products/seller", { params: { page, size } });
  const data = res.data.data || res.data;
  return {
    content: normalizeProducts(data.content || []),
    total_elements: data.total_elements ?? data.totalElements ?? 0,
    total_pages: data.total_pages ?? data.totalPages ?? 0,
    page: data.page ?? 0,
    size: data.size ?? 20,
  };
}

/**
 * Cập nhật toàn bộ thông tin sản phẩm — PUT /api/products/{id}
 */
export async function updateProduct(
  id: string,
  data: {
    name: string;
    description?: string;
    category: string;
    unitCode: string;
    pricePerUnit: number;
    availableQuantity: number;
    locationDetail?: string;
    farmingMethod?: string;
    pesticideFree?: boolean;
  }
): Promise<unknown> {
  const reqData = {
    name: data.name,
    description: data.description,
    category: data.category,
    unit_code: data.unitCode,
    price_per_unit: data.pricePerUnit,
    available_quantity: data.availableQuantity,
    location_detail: data.locationDetail,
    farming_method: data.farmingMethod,
    pesticide_free: data.pesticideFree,
  };
  const res = await api.put(`/api/products/${id}`, reqData);
  return res.data.data || res.data;
}

/**
 * Cập nhật trạng thái sản phẩm — PATCH /api/products/{id}/status
 * Status: IN_SEASON, UPCOMING, OFF_SEASON, OUT_OF_STOCK, HIDDEN
 */
export async function updateProductStatus(id: string, status: string): Promise<unknown> {
  const res = await api.patch(`/api/products/${id}/status`, { status });
  return res.data.data || res.data;
}

/**
 * Cập nhật giá sản phẩm — PATCH /api/products/{id}/price
 */
export async function updateProductPrice(id: string, price: number): Promise<unknown> {
  const res = await api.patch(`/api/products/${id}/price`, { price });
  return res.data.data || res.data;
}

/**
 * Cập nhật sản lượng — PATCH /api/products/{id}/quantity
 * Tự động OUT_OF_STOCK nếu quantity = 0
 */
export async function updateProductQuantity(id: string, quantity: number): Promise<unknown> {
  const res = await api.patch(`/api/products/${id}/quantity`, { quantity });
  return res.data.data || res.data;
}

/**
 * Xóa sản phẩm (soft delete) — DELETE /api/products/{id}
 */
export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/api/products/${id}`);
}

/**
 * Upload ảnh sản phẩm — POST /api/products/{id}/images (multipart)
 * Tối đa 10 ảnh/sản phẩm
 */
export async function uploadProductImages(id: string, files: File[]): Promise<unknown> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const res = await api.post(`/api/products/${id}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data || res.data;
}

/**
 * Xóa 1 ảnh sản phẩm — DELETE /api/products/{productId}/images/{imageId}
 */
export async function deleteProductImage(productId: string, imageId: string): Promise<void> {
  await api.delete(`/api/products/${productId}/images/${imageId}`);
}

/**
 * Xóa nhiều ảnh sản phẩm — DELETE /api/products/{productId}/images?ids=...
 */
export async function deleteProductImages(productId: string, imageIds: string[]): Promise<void> {
  await api.delete(`/api/products/${productId}/images`, {
    params: { ids: imageIds.join(",") },
  });
}
/**
 * Cập nhật thứ tự ảnh — PUT /api/products/{productId}/images/sort
 */
export async function updateProductImageSort(productId: string, imageIds: string[]): Promise<void> {
  await api.put(`/api/products/${productId}/images/sort`, imageIds);
}

/**
 * Lấy danh sách sản phẩm ngẫu nhiên — GET /api/products/random
 */
export async function getRandomProducts(limit = 10): Promise<Product[]> {
  try {
    const res = await api.get(`/api/products/random?limit=${limit}`);
    const data = res.data.data || res.data;
    return normalizeProducts(Array.isArray(data) ? data : []);
  } catch {
    return [];
  }
}
