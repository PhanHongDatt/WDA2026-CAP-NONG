/**
 * Mock Product Service — dùng khi NEXT_PUBLIC_USE_MOCK_DATA=true
 */
import type { IProductService, PaginatedResult, ProductSearchParams } from "../types";
import type { Product } from "@/types/product";
import {
  MOCK_SEASONAL_PRODUCTS,
  MOCK_NEW_PRODUCTS,
  MOCK_FLASH_DEALS,
} from "@/lib/mock-data";

const ALL_PRODUCTS = [...MOCK_SEASONAL_PRODUCTS, ...MOCK_NEW_PRODUCTS];

export const mockProductService: IProductService = {
  async search(params?: ProductSearchParams): Promise<PaginatedResult<Product>> {
    await new Promise((r) => setTimeout(r, 200));
    let filtered = [...ALL_PRODUCTS];

    if (params?.category) {
      filtered = filtered.filter((p) => p.category === params.category);
    }
    if (params?.keyword) {
      const kw = params.keyword.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(kw) ||
          p.description?.toLowerCase().includes(kw)
      );
    }
    if (params?.minPrice) {
      filtered = filtered.filter((p) => p.price_per_unit >= params.minPrice!);
    }
    if (params?.maxPrice) {
      filtered = filtered.filter((p) => p.price_per_unit <= params.maxPrice!);
    }

    const page = params?.page || 0;
    const size = params?.size || 20;
    const start = page * size;
    const content = filtered.slice(start, start + size);

    return {
      content,
      total_elements: filtered.length,
      total_pages: Math.ceil(filtered.length / size),
      page,
      size,
    };
  },

  async getById(id: string): Promise<Product | null> {
    await new Promise((r) => setTimeout(r, 150));
    return ALL_PRODUCTS.find((p) => p.id === id) || null;
  },

  async getBySlug(slug: string): Promise<Product | null> {
    await new Promise((r) => setTimeout(r, 150));
    return ALL_PRODUCTS.find((p) => p.slug === slug) || null;
  },

  async getSeasonalProducts(): Promise<Product[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_SEASONAL_PRODUCTS;
  },

  async getNewProducts(): Promise<Product[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_NEW_PRODUCTS;
  },

  async getFlashDeals(): Promise<Product[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_FLASH_DEALS;
  },
};
