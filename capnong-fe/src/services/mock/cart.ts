/**
 * Mock Cart Service — localStorage cart, dùng khi NEXT_PUBLIC_USE_MOCK_DATA=true
 */
import type { ICartService, CartItem } from "../types";

import { MOCK_SEASONAL_PRODUCTS, MOCK_NEW_PRODUCTS } from "@/lib/mock-data";

const CART_KEY = "capnong-cart";
const ALL_PRODUCTS = [...MOCK_SEASONAL_PRODUCTS, ...MOCK_NEW_PRODUCTS];

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export const mockCartService: ICartService = {
  async getCart(): Promise<CartItem[]> {
    return readCart();
  },

  async addItem(productId: string, quantity: number): Promise<void> {
    const cart = readCart();
    const existing = cart.find((item) => item.product?.id === productId || item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      const product = ALL_PRODUCTS.find((p) => p.id === productId);
      if (!product) throw new Error("Không tìm thấy sản phẩm");
      cart.push({ id: crypto.randomUUID(), product, quantity });
    }
    writeCart(cart);
  },

  async updateItem(itemId: string, quantity: number): Promise<void> {
    const cart = readCart();
    const item = cart.find((i) => i.id === itemId);
    if (item) {
      item.quantity = quantity;
      writeCart(cart);
    }
  },

  async removeItem(itemId: string): Promise<void> {
    const cart = readCart().filter((i) => i.id !== itemId);
    writeCart(cart);
  },

  async clearCart(): Promise<void> {
    localStorage.removeItem(CART_KEY);
  },

  async getItemCount(): Promise<number> {
    return readCart().reduce((sum, item) => sum + item.quantity, 0);
  },
};
