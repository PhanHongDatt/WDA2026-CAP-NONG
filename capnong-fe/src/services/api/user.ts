/**
 * API User Service — Khớp BE UserController
 *
 * Endpoints:
 *   GET    /api/users/me              → Profile
 *   PUT    /api/users/me              → Update profile
 *   POST   /api/users/me/avatar       → Upload avatar (multipart)
 *   PUT    /api/users/me/password     → Change password
 *   POST   /api/users/me/send-update-otp  → Send OTP for update
 *   POST   /api/users/me/link-google  → Link Google account
 */
import api from "../api";
import type { IUserService } from "../types";
import type { User, UserProfileResponse } from "@/types/user";

export const apiUserService: IUserService = {
  async getProfile(): Promise<User> {
    const res = await api.get<{ success: boolean; data: UserProfileResponse }>("/api/users/me");
    return normalizeUserProfile(res.data.data);
  },

  async updateProfile(data: {
    fullName?: string;
    username?: string;
    email?: string;
    phone?: string;
    otp?: string;
  }): Promise<User> {
    const res = await api.put<{ success: boolean; data: UserProfileResponse }>("/api/users/me", data);
    return normalizeUserProfile(res.data.data);
  },

  async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await api.post<{ success: boolean; data: UserProfileResponse }>(
      "/api/users/me/avatar",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return normalizeUserProfile(res.data.data);
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.put("/api/users/me/password", { oldPassword, newPassword });
  },

  async sendUpdateOtp(identifier: string): Promise<void> {
    await api.post("/api/users/me/send-update-otp", { identifier });
  },
};

/* ─── Link Google account ─── */
export async function linkGoogleAccount(supabaseToken: string): Promise<void> {
  await api.post("/api/users/me/link-google", { supabaseToken });
}

/* ─── Normalize BE UserResponse → FE User ─── */
function normalizeUserProfile(p: UserProfileResponse): User {
  return {
    id: String(p.id),
    full_name: p.fullName || "",
    username: p.username,
    phone: p.phone || "",
    email: p.email,
    role: p.role as User["role"],
    avatar_url: p.avatarUrl,
    is_banned: !(p.active ?? true),
    created_at: p.createdAt || new Date().toISOString(),
  };
}
