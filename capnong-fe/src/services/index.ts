/**
 * Service Registry — Cạp Nông
 *
 * Toggle mock/api qua env: NEXT_PUBLIC_USE_MOCK_DATA=true|false
 * Bất kỳ BE nào implement đúng API Contract v1.1 → FE chạy tốt.
 */

import type { IAuthService, IProductService, ICartService, IShopService } from "./types";

// Mock adapters
import { mockAuthService } from "./mock/auth";
import { mockProductService } from "./mock/product";
import { mockCartService } from "./mock/cart";
import { mockShopService } from "./mock/shop";

// API adapters
import { apiAuthService } from "./api/auth";
import { apiProductService } from "./api/product";
import { apiCartService } from "./api/cart";
import { apiShopService } from "./api/shop";

/* ─── Toggle ─── */
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/* ─── Exported services ─── */
export const authService: IAuthService = USE_MOCK ? mockAuthService : apiAuthService;
export const productService: IProductService = USE_MOCK ? mockProductService : apiProductService;
export const cartService: ICartService = USE_MOCK ? mockCartService : apiCartService;
export const shopService: IShopService = USE_MOCK ? mockShopService : apiShopService;

/* ─── Re-export types ─── */
export type { IAuthService, IProductService, ICartService, IShopService } from "./types";
export type { AuthResult, CartItem, PaginatedResult, ProductSearchParams } from "./types";

/* ─── Debug utility ─── */
export const serviceMode = USE_MOCK ? "MOCK" : "API";
