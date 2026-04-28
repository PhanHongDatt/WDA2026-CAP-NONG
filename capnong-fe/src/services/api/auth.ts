/**
 * API Auth Service — Khớp chính xác với BE AuthController
 *
 * BE Endpoints:
 *   POST /api/auth/login          { identifier, password }
 *   POST /api/auth/register       { identifier, username, password, fullName, otp, role }
 *   POST /api/auth/refresh        { refreshToken }
 *   POST /api/auth/logout         { refreshToken }
 *   POST /api/auth/send-register-otp  { identifier }
 *   POST /api/auth/forgot-password    { identifier }
 *   POST /api/auth/reset-password     { identifier, otp, newPassword }
 *   POST /api/auth/oauth/google       { supabaseToken }
 *   POST /api/auth/oauth/google/register  { supabaseToken, username }
 *
 * BE Response wrapper: ApiResponse<AuthResponse> = { success, message, data: AuthResponse }
 * BE AuthResponse (camelCase): { accessToken, refreshToken, type, expiresIn, username, phone, email, role }
 */
import api from "../api";
import type { IAuthService, AuthResult } from "../types";
import type { User, AuthResponse as BEAuthResponse, UserProfileResponse } from "@/types/user";

export const apiAuthService: IAuthService = {
  /**
   * Login — gửi identifier (username hoặc SĐT) + password
   */
  async login(phone: string, password: string): Promise<AuthResult> {
    const res = await api.post<{ success: boolean; message: string; data: BEAuthResponse }>(
      "/api/auth/login",
      { identifier: phone, password }
    );
    const authData = res.data.data;

    // Lưu tokens
    localStorage.setItem("access_token", authData.access_token);
    if (authData.refresh_token) {
      localStorage.setItem("refresh_token", authData.refresh_token);
    }

    // Gọi /users/me để lấy full profile (BE AuthResponse thiếu id, fullName, avatarUrl, ...)
    const user = await fetchUserProfile(authData);

    return {
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      user,
    };
  },

  /**
   * Register — BE yêu cầu OTP verify trước
   */
  async register(data: {
    full_name: string;
    phone: string;
    password: string;
    role: string;
    email?: string;
    username?: string;
    otp?: string;
  }): Promise<AuthResult> {
    const res = await api.post<{ success: boolean; message: string; data: BEAuthResponse }>(
      "/api/auth/register",
      {
        identifier: data.phone || data.email,
        username: data.username || data.phone,
        password: data.password,
        full_name: data.full_name,
        otp: data.otp || "", // OTP from register form
        role: data.role,
      }
    );
    const authData = res.data.data;

    localStorage.setItem("access_token", authData.access_token);
    if (authData.refresh_token) {
      localStorage.setItem("refresh_token", authData.refresh_token);
    }

    const user = await fetchUserProfile(authData);

    return {
      access_token: authData.access_token,
      refresh_token: authData.refresh_token,
      user,
      merged_orders_count: authData.merged_orders_count,
    };
  },

  /**
   * Logout — thu hồi refresh token
   */
  logout(): void {
    const refreshToken = localStorage.getItem("refresh_token");
    if (refreshToken) {
      // Fire-and-forget
      api.post("/api/auth/logout", { refresh_token: refreshToken }).catch(() => {});
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("capnong-user");
  },

  /**
   * Get stored token
   */
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  },
};

/* ─── Extended Auth Methods (không nằm trong IAuthService interface) ─── */

/**
 * Force refresh token
 */
export async function forceRefresh(): Promise<void> {
  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) return;
  const res = await api.post<{ data: BEAuthResponse }>("/api/auth/refresh", { refresh_token: refreshToken });
  const authData = res.data.data;
  localStorage.setItem("access_token", authData.access_token);
  if (authData.refresh_token) {
    localStorage.setItem("refresh_token", authData.refresh_token);
  }
}

/**
 * Gửi OTP trước khi đăng ký
 */
export async function sendRegisterOtp(identifier: string): Promise<void> {
  await api.post("/api/auth/send-register-otp", { identifier });
}

/**
 * Quên mật khẩu — gửi OTP
 */
export async function forgotPassword(identifier: string): Promise<void> {
  await api.post("/api/auth/forgot-password", { identifier });
}

/**
 * Đặt lại mật khẩu
 */
export async function resetPassword(identifier: string, otp: string, newPassword: string): Promise<void> {
  await api.post("/api/auth/reset-password", { identifier, otp, new_password: newPassword });
}

/**
 * Google OAuth Login — POST /api/auth/oauth/google
 * Dùng supabaseToken từ Supabase Google sign-in
 */
export async function googleLogin(supabaseToken: string): Promise<AuthResult> {
  const res = await api.post<{ success: boolean; message: string; data: BEAuthResponse }>(
    "/api/auth/oauth/google",
    { supabase_token: supabaseToken }
  );
  const authData = res.data.data;

  localStorage.setItem("access_token", authData.access_token);
  if (authData.refresh_token) {
    localStorage.setItem("refresh_token", authData.refresh_token);
  }

  const user = await fetchUserProfile(authData);
  return { access_token: authData.access_token, refresh_token: authData.refresh_token, user };
}

/**
 * Google OAuth Register — POST /api/auth/oauth/google/register
 * Khi user Google chưa có tài khoản → cần chọn username
 */
export async function googleRegister(supabaseToken: string, username: string): Promise<AuthResult> {
  const res = await api.post<{ success: boolean; message: string; data: BEAuthResponse }>(
    "/api/auth/oauth/google/register",
    { supabase_token: supabaseToken, username }
  );
  const authData = res.data.data;

  localStorage.setItem("access_token", authData.access_token);
  if (authData.refresh_token) {
    localStorage.setItem("refresh_token", authData.refresh_token);
  }

  const user = await fetchUserProfile(authData);
  return { access_token: authData.access_token, refresh_token: authData.refresh_token, user };
}
/* ─── Helper: Fetch full profile sau login ─── */
async function fetchUserProfile(authData: BEAuthResponse): Promise<User> {
  try {
    const profileRes = await api.get<{ success: boolean; data: UserProfileResponse }>("/api/users/me");
    const p = profileRes.data.data;
    return {
      id: String(p.id),
      full_name: p.full_name || p.fullName || "",
      username: p.username,
      phone: p.phone || "",
      email: p.email,
      role: p.role as User["role"],
      avatar_url: p.avatar_url || p.avatarUrl,
      is_banned: !(p.active ?? true),
      created_at: p.created_at || p.createdAt || new Date().toISOString(),
    };
  } catch {
    // Fallback: build user từ AuthResponse (thiếu một số field)
    return {
      id: "",
      full_name: authData.username || "",
      username: authData.username,
      phone: authData.phone || "",
      email: authData.email,
      role: authData.role as User["role"],
      is_banned: false,
      created_at: new Date().toISOString(),
    };
  }
}
