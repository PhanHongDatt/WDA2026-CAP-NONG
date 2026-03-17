/**
 * API Base URL — Spring Boot backend
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

/**
 * Product categories
 */
export const CATEGORIES = [
  { id: "all", label: "Tất cả", icon: "🌾" },
  { id: "trai-cay", label: "Trái cây", icon: "🍊" },
  { id: "rau-cu", label: "Rau củ", icon: "🥬" },
  { id: "hat-ngu-coc", label: "Ngũ cốc & Hạt", icon: "🌾" },
  { id: "thuy-hai-san", label: "Thủy hải sản", icon: "🐟" },
  { id: "gia-vi", label: "Gia vị & Thảo mộc", icon: "🌿" },
  { id: "thit-trung", label: "Thịt & Trứng", icon: "🥚" },
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
 * Season status
 */
export const SEASON_STATUS = {
  IN_SEASON: { label: "Đang mùa", color: "bg-primary text-white" },
  UPCOMING: { label: "Sắp thu hoạch", color: "bg-warning text-white" },
  OUT_OF_STOCK: { label: "Hết hàng", color: "bg-gray-400 text-white" },
} as const;

/**
 * Order status
 */
export const ORDER_STATUS = {
  PENDING: { label: "Đang xử lý", color: "text-warning" },
  CONFIRMED: { label: "Đã xác nhận", color: "text-info" },
  SHIPPING: { label: "Đang giao", color: "text-primary" },
  DELIVERED: { label: "Đã nhận", color: "text-success" },
  CANCELLED: { label: "Đã hủy", color: "text-accent" },
} as const;

/**
 * Navigation links
 */
export const NAV_LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/catalog", label: "Sản phẩm" },
  { href: "/cooperative", label: "Gom đơn" },
] as const;
