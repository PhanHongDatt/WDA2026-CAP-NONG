/**
 * ─── Constants (khớp Nghiệp vụ Baseline + API Contract) ───
 */

import type { ProductCategory, FarmingMethod, ProductStatus } from "@/types/product";
import type { SubOrderStatus, BundleStatus, PaymentMethod } from "@/types/order";

/**
 * API Base URLs
 */
const isServer = typeof window === 'undefined';
export const API_BASE_URL = isServer 
  ? (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1") 
  : "/api/v1";

export const AI_API_BASE_URL = isServer 
  ? (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_AI_API_URL || "http://localhost:8000/api/v1") 
  : "/api/ai/v1";

/**
 * Product categories — khớp DB ENUM
 */
export const CATEGORIES: { id: ProductCategory | "ALL"; label: string; icon: string }[] = [
  { id: "ALL", label: "Tất cả", icon: "🌾" },
  { id: "FRUIT", label: "Trái cây", icon: "🍊" },
  { id: "VEGETABLE", label: "Rau củ", icon: "🥬" },
  { id: "GRAIN", label: "Gạo & Ngũ cốc", icon: "🌾" },
  { id: "TUBER", label: "Khoai, Củ", icon: "🥔" },
  { id: "HERB", label: "Gia vị & Thảo mộc", icon: "🌿" },
  { id: "OTHER", label: "Đặc sản khác", icon: "🧺" },
] as const;

/**
 * Vietnamese regions for filtering
 */
export const REGIONS = [
  { id: "all", label: "Tất cả vùng miền" },
  { id: "dbscl", label: "Đồng bằng Sông Cửu Long" },
  { id: "tay-nguyen", label: "Tây Nguyên" },
  { id: "dong-nam-bo", label: "Đông Nam Bộ" },
  { id: "bac-trung-bo", label: "Bắc Trung Bộ" },
  { id: "dong-bac", label: "Đông Bắc" },
  { id: "tay-bac", label: "Tây Bắc" },
] as const;

/**
 * Product status — 5 trạng thái (khớp DB + Baseline §3)
 */
export const SEASON_STATUS: Record<ProductStatus, { label: string; color: string; emoji: string }> = {
  IN_SEASON: { label: "Đang mùa", color: "bg-primary text-white", emoji: "🟢" },
  UPCOMING: { label: "Sắp thu hoạch", color: "bg-warning text-white", emoji: "🟡" },
  OFF_SEASON: { label: "Ngoài mùa", color: "bg-gray-300 text-gray-600", emoji: "⚪" },
  OUT_OF_STOCK: { label: "Hết hàng", color: "bg-accent text-white", emoji: "🔴" },
  HIDDEN: { label: "Đã ẩn", color: "bg-gray-400 text-white", emoji: "🚫" },
};

/**
 * Farming methods — khớp DB ENUM
 */
export const FARMING_METHODS: Record<FarmingMethod, string> = {
  TRADITIONAL: "Canh tác truyền thống",
  ORGANIC: "Hữu cơ",
  VIETGAP: "VietGAP",
  GLOBALGAP: "GlobalGAP",
};

/**
 * Sub-Order status (theo workflow: PENDING → CONFIRMED → PREPARING → SHIPPED → DELIVERED)
 */
export const ORDER_STATUS: Record<SubOrderStatus, { label: string; color: string }> = {
  PENDING: { label: "Đang xử lý", color: "text-warning" },
  CONFIRMED: { label: "Đã xác nhận", color: "text-info" },
  PREPARING: { label: "Đang chuẩn bị", color: "text-blue-500" },
  SHIPPED: { label: "Đang giao", color: "text-primary" },
  DELIVERED: { label: "Đã nhận", color: "text-success" },
  CANCELLED: { label: "Đã hủy", color: "text-accent" },
};

/**
 * Bundle status — khớp API Contract
 */
export const BUNDLE_STATUS: Record<BundleStatus, { label: string; color: string }> = {
  OPEN: { label: "Đang mở", color: "text-primary" },
  FULL: { label: "Đã đủ", color: "text-info" },
  CONFIRMED: { label: "Đã xác nhận", color: "text-success" },
  EXPIRED: { label: "Hết hạn", color: "text-gray-400" },
  CANCELLED: { label: "Đã hủy", color: "text-accent" },
};

/**
 * Payment methods
 */
export const PAYMENT_METHODS: Record<PaymentMethod, string> = {
  COD: "Thanh toán khi nhận hàng (COD)",
  VIET_QR: "Chuyển khoản VietQR",
};

/**
 * Navigation links
 */
export const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/catalog", label: "Sản phẩm" },
  { href: "/cooperative", label: "Gom đơn" },
] as const;
