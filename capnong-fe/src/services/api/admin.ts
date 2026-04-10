/**
 * API Admin Service — Khớp BE AdminController
 *
 * BE Endpoints (prefix /api/admin/users):
 *   GET  /                → Danh sách user (page, size)
 *   GET  /{id}            → Chi tiết user
 *   PATCH /{id}/ban       → Khóa tài khoản
 *   PATCH /{id}/unban     → Mở khóa tài khoản
 *   PATCH /{id}/role      → Thay đổi role { role: string }
 *
 * Roles: ADMIN only
 */
import api from "../api";
import type { UserProfileResponse } from "@/types/user";

/**
 * Lấy danh sách tất cả users (phân trang)
 */
export async function getAllUsers(
  page: number = 0,
  size: number = 20
): Promise<{ content: UserProfileResponse[]; totalElements: number; totalPages: number }> {
  const res = await api.get("/api/admin/users", { params: { page, size } });
  const data = res.data.data || res.data;
  return {
    content: data.content || [],
    totalElements: data.totalElements || 0,
    totalPages: data.totalPages || 0,
  };
}

/**
 * Xem chi tiết user
 */
export async function getUserDetail(userId: string | number): Promise<UserProfileResponse> {
  const res = await api.get(`/api/admin/users/${userId}`);
  return res.data.data || res.data;
}

/**
 * Khóa tài khoản
 */
export async function banUser(userId: string | number): Promise<UserProfileResponse> {
  const res = await api.patch(`/api/admin/users/${userId}/ban`);
  return res.data.data || res.data;
}

/**
 * Mở khóa tài khoản
 */
export async function unbanUser(userId: string | number): Promise<UserProfileResponse> {
  const res = await api.patch(`/api/admin/users/${userId}/unban`);
  return res.data.data || res.data;
}

/**
 * Thay đổi role
 */
export async function changeUserRole(userId: string | number, role: string): Promise<UserProfileResponse> {
  const res = await api.patch(`/api/admin/users/${userId}/role`, { role });
  return res.data.data || res.data;
}

/**
 * Duyệt HTX
 */
export async function approveHtx(htxId: string | number): Promise<void> {
  await api.patch(`/api/admin/htx/${htxId}/approve`);
}

/**
 * Từ chối HTX
 */
export async function rejectHtx(htxId: string | number): Promise<void> {
  await api.patch(`/api/admin/htx/${htxId}/reject`);
}
