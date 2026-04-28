// ─── Order Types (khớp API Contract v1.1 — Sub-Order model) ───

import type { Product, ShopSummary } from "./product";
import type { UserSummary, Address } from "./user";
import type { UnitResponse } from "./unit";
import type { HtxShop } from "./htx";

// ─── Enums ───

export type PaymentMethod = "COD" | "VIET_QR";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED";
export type SubOrderStatus = "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
export type CancelledBy = "BUYER" | "SELLER" | "SYSTEM";

// ─── Cart ───

export interface CartItemRequest {
  product_id: string;
  quantity: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  total_price: number;
  total_shops: number;
}

// ─── Order (chứa nhiều Sub-Order, mỗi cái theo 1 shop) ───

export interface OrderItem {
  product_id: string;
  product_name_snapshot: string;
  unit_code_snapshot: string;
  price_snapshot: number;
  quantity: number;
  subtotal: number;
  is_reviewed: boolean;
}

export interface SubOrder {
  id: string;
  shop: ShopSummary;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;             // Miễn phí (always 0)
  status: SubOrderStatus;
  cancel_reason?: string;
  cancelled_by?: CancelledBy;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_code: string;               // Format: CN-YYYYMMDD-XXXX
  buyer?: UserSummary;
  guest_phone?: string;
  sub_orders: SubOrder[];
  shipping_address: Address;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  total_price: number;
  note?: string;
  created_at: string;
}

// ─── Checkout ───

export interface CheckoutRequest {
  shipping_address: Address;
  payment_method: PaymentMethod;
  note?: string;
  guest_token?: string;             // Cho guest checkout
}

// ─── Order Actions ───

export interface UpdateSubOrderStatusRequest {
  status: SubOrderStatus;
  cancel_reason?: string;           // Bắt buộc khi status = CANCELLED
}

export interface CancelOrderRequest {
  reason?: string;                  // BUYER cancel: optional reason
}

// ─── Bundle (Gom đơn HTX — thay thế CoopPool) ───

export type BundleStatus = "OPEN" | "FULL" | "CONFIRMED" | "EXPIRED" | "CANCELLED";
export type PledgeStatus = "ACTIVE" | "WITHDRAWN" | "EXPIRED";

export interface BundlePledge {
  id: string;
  farmer: UserSummary;
  quantity: number;
  unit: UnitResponse;
  contribution_percent: number;
  estimated_revenue?: number;       // Chỉ có khi Bundle CONFIRMED
  status: PledgeStatus;
  note?: string;
  created_at: string;
}

export interface Bundle {
  id: string;
  htx_shop: HtxShop;
  product_category: string;
  product_name: string;
  unit: UnitResponse;
  target_quantity: number;
  current_pledged_quantity: number;
  current_sold_quantity: number;
  progress_percent: number;
  price_per_unit: number;
  deadline: string;
  status: BundleStatus;
  description?: string;
  min_pledge_quantity?: number;
  pledges: BundlePledge[];
  created_at: string;
}

export interface BundleCreateRequest {
  product_category: string;
  product_name: string;
  unit_code: string;
  target_quantity: number;
  price_per_unit: number;
  deadline: string;
  description?: string;
  min_pledge_quantity?: number;
}

export interface PledgeRequest {
  quantity: number;
  note?: string;
}

// ─── Legacy aliases (backward compat – sẽ xóa sau) ───
/** @deprecated Dùng Bundle thay thế */
export type CoopPool = Bundle;
/** @deprecated Dùng BundlePledge thay thế */
export type CoopContribution = BundlePledge;
