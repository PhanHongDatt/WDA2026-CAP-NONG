// ─── User Types (khớp API Contract v1.1) ───

export type UserRole = "BUYER" | "FARMER" | "HTX_MEMBER" | "HTX_MANAGER" | "ADMIN";

/** UserSummary — nested trong các response khác (Product, Order, Review...) */
export interface UserSummary {
  id: string;             // UUID
  full_name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  shop_slug?: string;
}

/** User — đầy đủ (dùng cho AuthContext) */
export interface User extends UserSummary {
  email?: string;
  htx_id?: string;
  htx_name?: string;
  is_banned: boolean;
  created_at: string;
}

// ─── Auth ───

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  full_name: string;
  phone: string;
  email?: string;
  password: string;
  role: "FARMER" | "BUYER";  // Chỉ 2 role khi đăng ký
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;       // seconds
  user: UserSummary;
}

// ─── Guest Checkout ───

export interface GuestOtpRequest {
  phone: string;
}

export interface GuestOtpVerifyRequest {
  phone: string;
  otp_code: string;
}

export interface GuestOtpVerifyResponse {
  guest_token: string;
  phone: string;
  expires_in: number;
}

// ─── Address ───

export interface Address {
  id?: string;
  full_name: string;
  phone: string;
  street: string;
  district: string;
  province: string;
  is_default?: boolean;
}
