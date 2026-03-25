/**
 * API Auth Service — gọi BE thật theo API Contract v1.1
 * 
 * BE trả camelCase (accessToken, userId, fullName, shopSlug)
 * FE normalize về snake_case (access_token, user_id, full_name, shop_slug)
 * Wrapper: ApiResponse<AuthResponse> → { success, message, data: AuthResponse }
 */
import type { IAuthService, AuthResult } from "../types";
import type { User } from "@/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const apiAuthService: IAuthService = {
  async login(phone: string, password: string): Promise<AuthResult> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Đăng nhập thất bại");
    }
    const json = await res.json();
    return normalizeAuthResponse(json);
  },

  async register(data): Promise<AuthResult> {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: data.full_name,
        phone: data.phone,
        password: data.password,
        role: data.role,
        email: data.email,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Đăng ký thất bại");
    }
    const json = await res.json();
    return normalizeAuthResponse(json);
  },

  logout(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("capnong-user");
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  },
};

/**
 * Normalize BE AuthResponse (camelCase) → FE format (snake_case)
 * 
 * BE trả: { success, message, data: { accessToken, tokenType, userId, fullName, phone, email, role, shopSlug } }
 * FE cần: { access_token, user: { id, full_name, phone, email, role, shop_slug, ... } }
 */
function normalizeAuthResponse(json: Record<string, unknown>): AuthResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = (json.data || json) as any;

  // Token: camelCase (accessToken) hoặc snake_case (access_token)
  const token = d.accessToken || d.access_token || d.token || "";

  // Lưu token
  if (token) localStorage.setItem("access_token", token);
  if (d.refreshToken || d.refresh_token) {
    localStorage.setItem("refresh_token", d.refreshToken || d.refresh_token);
  }

  // User: có thể là object riêng hoặc flat trong response
  const user: User = d.user ? normalizeUser(d.user) : {
    id: String(d.userId || d.user_id || d.id || ""),
    full_name: d.fullName || d.full_name || "",
    phone: d.phone || "",
    email: d.email,
    role: d.role as User["role"],
    shop_slug: d.shopSlug || d.shop_slug,
    is_banned: d.isBanned ?? d.is_banned ?? false,
    created_at: d.createdAt || d.created_at || new Date().toISOString(),
  };

  return { access_token: token, refresh_token: d.refreshToken || d.refresh_token, user };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeUser(u: any): User {
  return {
    id: String(u.id || u.userId || u.user_id || ""),
    full_name: u.fullName || u.full_name || "",
    phone: u.phone || "",
    email: u.email,
    role: u.role as User["role"],
    shop_slug: u.shopSlug || u.shop_slug,
    avatar_url: u.avatarUrl || u.avatar_url,
    htx_id: u.htxId || u.htx_id,
    htx_name: u.htxName || u.htx_name,
    is_banned: u.isBanned ?? u.is_banned ?? false,
    created_at: u.createdAt || u.created_at || new Date().toISOString(),
  };
}
