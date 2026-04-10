/**
 * Service Interfaces — Khớp BE API Contract
 *
 * Mỗi interface define contract giữa FE service layer ↔ component.
 * Cả mock adapter và API adapter cùng implement interface này.
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
    username?: string;
    otp?: string;
  }): Promise<AuthResult>;
  logout(): void;
  getToken(): string | null;
}

/* ─── User Profile ─────────────────────────────── */

export interface IUserService {
  getProfile(): Promise<User>;
  updateProfile(data: { fullName?: string; username?: string; email?: string; phone?: string; otp?: string }): Promise<User>;
  uploadAvatar(file: File): Promise<User>;
  changePassword(oldPassword: string, newPassword: string): Promise<void>;
  sendUpdateOtp(identifier: string): Promise<void>;
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
  createProduct?(data: {
    name: string;
    description?: string;
    category: string;
    unitCode: string;
    pricePerUnit: number;
    availableQuantity: number;
    locationDetail: string;
  }): Promise<unknown>;
}

/* ─── Cart ──────────────────────────────────────── */

export interface CartItem {
  id: string;
  productId?: string;
  productName?: string;
  product?: Product;
  quantity: number;
  pricePerUnit?: number;
}

export interface ICartService {
  getCart(): Promise<CartItem[]>;
  addItem(productId: string, quantity: number): Promise<void>;
  updateItem(itemId: string, quantity: number): Promise<void>;
  removeItem(itemId: string): Promise<void>;
  clearCart(): Promise<void>;
  getItemCount(): Promise<number>;
}

/* ─── Orders ───────────────────────────────────── */

export interface IOrderService {
  checkout(data: {
    guestEmail?: string;
    guestPhone?: string;
    guestName?: string;
    streetAddress?: string;
    wardCode?: string;
    provinceCode?: string;
    orderNotes?: string;
    otpCode?: string;
  }): Promise<unknown>;
  getMyOrders(): Promise<unknown[]>;
}

/* ─── Shops ─────────────────────────────────────── */

export interface IShopService {
  getBySlug(slug: string): Promise<Shop | null>;
  getProducts(shopSlug: string): Promise<Product[]>;
  getFeaturedShops(): Promise<Shop[]>;
  createShop?(data: { name: string; slug: string; province: string; district: string; bio?: string }): Promise<unknown>;
  updateShop?(slug: string, data: { name: string; slug: string; province: string; district: string; bio?: string }): Promise<unknown>;
}
