/**
 * Service Interfaces — khớp API Contract v1.1
 * 
 * Bất kỳ BE nào implement đúng contract → FE chạy tốt.
 * Mock adapter trả data giả khi không có BE.
 */

import type { Product } from "@/types/product";
import type { Shop } from "@/types/shop";
import type { User } from "@/types/user";

/* ─── Auth ──────────────────────────────────────── */

export interface AuthResult {
  access_token: string;
  refresh_token?: string;
  user: User;
}

export interface IAuthService {
  login(phone: string, password: string): Promise<AuthResult>;
  register(data: {
    full_name: string;
    phone: string;
    password: string;
    role: string;
    email?: string;
  }): Promise<AuthResult>;
  logout(): void;
  getToken(): string | null;
}

/* ─── Products ──────────────────────────────────── */

export interface ProductSearchParams {
  category?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  keyword?: string;
  page?: number;
  size?: number;
}

export interface PaginatedResult<T> {
  content: T[];
  total_elements: number;
  total_pages: number;
  page: number;
  size: number;
}

export interface IProductService {
  search(params?: ProductSearchParams): Promise<PaginatedResult<Product>>;
  getById(id: string): Promise<Product | null>;
  getBySlug(slug: string): Promise<Product | null>;
  getSeasonalProducts(): Promise<Product[]>;
  getNewProducts(): Promise<Product[]>;
  getFlashDeals(): Promise<Product[]>;
}

/* ─── Cart ──────────────────────────────────────── */

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface ICartService {
  getCart(): Promise<CartItem[]>;
  addItem(productId: string, quantity: number): Promise<void>;
  updateItem(itemId: string, quantity: number): Promise<void>;
  removeItem(itemId: string): Promise<void>;
  clearCart(): Promise<void>;
  getItemCount(): Promise<number>;
}

/* ─── Shops ─────────────────────────────────────── */

export interface IShopService {
  getBySlug(slug: string): Promise<Shop | null>;
  getProducts(shopSlug: string): Promise<Product[]>;
}
