/**
 * Mock Shop Service — dùng khi NEXT_PUBLIC_USE_MOCK_DATA=true
 */
import type { IShopService } from "../types";
import type { Product } from "@/types/product";
import type { Shop } from "@/types/shop";
import { MOCK_SHOPS, MOCK_SEASONAL_PRODUCTS, MOCK_NEW_PRODUCTS } from "@/lib/mock-data";

const ALL_PRODUCTS = [...MOCK_SEASONAL_PRODUCTS, ...MOCK_NEW_PRODUCTS];

export const mockShopService: IShopService = {
  async getBySlug(slug: string): Promise<Shop | null> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_SHOPS.find((s) => s.slug === slug) || null;
  },

  async getProducts(shopSlug: string): Promise<Product[]> {
    await new Promise((r) => setTimeout(r, 200));
    return ALL_PRODUCTS.filter((p) => p.shop?.slug === shopSlug);
  },

  async getFeaturedShops(): Promise<Shop[]> {
    await new Promise((r) => setTimeout(r, 200));
    return MOCK_SHOPS;
  },
};
