/**
 * Types Barrel Export — Cạp Nông
 *
 * Single source of truth: export từ các file type riêng lẻ.
 * KHÔNG define type ở đây — tránh duplicate.
 */

// ─── Core API wrapper ───
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

// ─── Re-export domain types ───
export type { User, UserSummary, UserRole, LoginRequest, RegisterRequest, AuthResponse, Address, UserProfileResponse } from "./user";
export type { Product, ProductStatus, ProductCategory, FarmingMethod, ShopSummary, ProductBadge, Category, ProductFilter, ProductCreateRequest } from "./product";
export type { Shop } from "./shop";
export type { Order, OrderItem, SubOrder, SubOrderStatus, PaymentMethod, Bundle, BundlePledge } from "./order";
export type { Htx, HtxSummary, HtxJoinRequest, HtxShop } from "./htx";
export type { Notification, NotificationType } from "./notification";
export type { UnitResponse } from "./unit";
export type { VoiceExtractRequest, VoiceExtractResponse, RefineDescriptionRequest, RefineDescriptionResponse, CaptionRequest, CaptionResult, PosterContentRequest, PosterContentResponse } from "./ai";
