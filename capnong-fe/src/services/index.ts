/**
 * Service Registry — Cạp Nông
 *
 * Toggle mock/api qua env: NEXT_PUBLIC_USE_MOCK_DATA=true|false
 * Khi USE_MOCK=false → gọi BE thật qua Axios interceptor.
 */

import type { IAuthService, IProductService, ICartService, IShopService, IUserService, IOrderService } from "./types";

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
import { apiUserService } from "./api/user";
import { apiOrderService } from "./api/order";

/* ─── Toggle ─── */
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

/* ─── Exported services ─── */
export const authService: IAuthService = USE_MOCK ? mockAuthService : apiAuthService;
export const productService: IProductService = USE_MOCK ? mockProductService : apiProductService;
export const cartService: ICartService = USE_MOCK ? mockCartService : apiCartService;
export const shopService: IShopService = USE_MOCK ? mockShopService : apiShopService;

// Services chỉ có API adapter (không cần mock)
export const userService: IUserService = apiUserService;
export const orderService: IOrderService = apiOrderService;

/* ─── Re-export types ─── */
export type { IAuthService, IProductService, ICartService, IShopService, IUserService, IOrderService } from "./types";
export type { AuthResult, CartItem, PaginatedResult, ProductSearchParams } from "./types";

/* ─── Debug utility ─── */
export const serviceMode = USE_MOCK ? "MOCK" : "API";
