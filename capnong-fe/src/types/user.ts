// ─── User Types — Khớp BE DTO (camelCase từ Jackson) ───

export type UserRole = "BUYER" | "FARMER" | "HTX_MEMBER" | "HTX_MANAGER" | "ADMIN";

/** UserSummary — nested trong các response khác (Product, Order, Review...) */
export interface UserSummary {
  id: string;             // UUID hoặc Long (BE trả numeric ID)
  full_name: string;
  phone: string;
  role: UserRole;
  avatar_url?: string;
  shop_slug?: string;
}

/** User — đầy đủ (dùng cho AuthContext) */
export interface User extends UserSummary {
  username?: string;
  email?: string;
  htx_id?: string;
  htx_name?: string;
  is_banned: boolean;
  created_at: string;
}

// ─── Auth ───

/**
 * BE LoginRequest: { identifier, password }
 * identifier = username HOẶC SĐT
 */
export interface LoginRequest {
  identifier: string;
  password: string;
}

/**
 * BE RegisterRequest: { identifier, username, password, fullName, otp, role }
 * identifier = email HOẶC SĐT
 */
export interface RegisterRequest {
  identifier: string;     // SĐT hoặc email
  username: string;
  password: string;
  fullName: string;
  otp: string;
  role: "FARMER" | "BUYER";
}

/**
 * BE AuthResponse (snake_case — Jackson SNAKE_CASE config):
 * { access_token, refresh_token, type, expires_in, username, phone, email, role, shop_slug }
 * → Flat, KHÔNG có nested user object
 */
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  type: string;           // "Bearer"
  expires_in: number;
  username: string;
  phone: string;
  email?: string;
  role: string;
  shop_slug?: string;
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

// ─── BE UserResponse (camelCase from Jackson) ───
export interface UserProfileResponse {
  id: number;
  username: string;
  phone: string;
  email?: string;
  full_name: string;
  avatar_url?: string;
  role: string;
  active: boolean;
  created_at: string;
  // BE may also send camelCase in some endpoints — handle both
  fullName?: string;
  avatarUrl?: string;
  createdAt?: string;
}
