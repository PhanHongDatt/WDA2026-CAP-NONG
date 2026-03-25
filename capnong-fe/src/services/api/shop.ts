/**
 * API Shop Service — gọi BE thật theo API Contract v1.1
 */
import type { IShopService } from "../types";
import type { Product } from "@/types/product";
import type { Shop } from "@/types/shop";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const apiShopService: IShopService = {
  async getBySlug(slug: string): Promise<Shop | null> {
    try {
      const res = await fetch(`${API_URL}/shops/${slug}`, { headers: getAuthHeaders() });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || json;
    } catch {
      return null;
    }
  },

  async getProducts(shopSlug: string): Promise<Product[]> {
    try {
      const res = await fetch(`${API_URL}/shops/${shopSlug}/products`, {
        headers: getAuthHeaders(),
      });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || json || [];
    } catch {
      return [];
    }
  },
};
