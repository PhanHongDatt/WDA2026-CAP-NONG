/**
 * API Cart Service — gọi BE thật theo API Contract v1.1
 */
import type { ICartService, CartItem } from "../types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export const apiCartService: ICartService = {
  async getCart(): Promise<CartItem[]> {
    const res = await fetch(`${API_URL}/cart`, { headers: getAuthHeaders() });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json.data || json;
    // Normalize cart items
    return (data.items || data || []).map((item: Record<string, unknown>) => ({
      id: item.id,
      product: item.product,
      quantity: item.quantity,
    }));
  },

  async addItem(productId: string, quantity: number): Promise<void> {
    const res = await fetch(`${API_URL}/cart/items`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ product_id: productId, quantity }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Lỗi thêm vào giỏ hàng");
    }
  },

  async updateItem(itemId: string, quantity: number): Promise<void> {
    const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ quantity }),
    });
    if (!res.ok) throw new Error("Lỗi cập nhật giỏ hàng");
  },

  async removeItem(itemId: string): Promise<void> {
    const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Lỗi xoá item");
  },

  async clearCart(): Promise<void> {
    // Nếu BE không có endpoint clear, xoá từng item
    const items = await this.getCart();
    await Promise.all(items.map((item) => this.removeItem(item.id)));
  },

  async getItemCount(): Promise<number> {
    const items = await this.getCart();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
};
