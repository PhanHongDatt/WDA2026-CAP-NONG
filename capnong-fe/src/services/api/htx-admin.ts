/**
 * API HTX Admin Service — Khớp BE HtxAdminController
 *
 * BE Endpoints (prefix /api/admin/htx-requests):
 *   GET     /                → Danh sách đơn HTX đang chờ duyệt (PENDING)
 *   GET     /all             → Tất cả HTX (mọi trạng thái)
 *   GET     /{htxId}         → Chi tiết HTX
 *   PATCH   /{htxId}         → Xét duyệt HTX { action: "APPROVE"|"REJECT", note? }
 *
 * Roles: ADMIN only
 */
import api from "../api";

/* ─── Types ─── */
export interface HtxRequestResponse {
  id: string;
  name: string;
  officialCode: string;
  province: string;
  district: string;
  description?: string;
  documentUrl?: string;
  status: "PENDING" | "ACTIVE" | "REJECTED" | "SUSPENDED";
  creatorId: string;
  creatorName?: string;
  createdAt?: string;
  updatedAt?: string;
  reviewNote?: string;
}

/* ─── API Functions ─── */

/**
 * Danh sách đơn thành lập HTX đang chờ duyệt (PENDING)
 */
export async function getPendingHtxRequests(): Promise<HtxRequestResponse[]> {
  const res = await api.get("/api/admin/htx-requests");
  return res.data.data || res.data || [];
}

/**
 * Xem tất cả HTX (mọi trạng thái)
 */
export async function getAllHtxRequests(): Promise<HtxRequestResponse[]> {
  const res = await api.get("/api/admin/htx-requests/all");
  return res.data.data || res.data || [];
}

/**
 * Xem chi tiết HTX
 */
export async function getHtxRequestDetail(htxId: string): Promise<HtxRequestResponse> {
  const res = await api.get(`/api/admin/htx-requests/${htxId}`);
  return res.data.data || res.data;
}

/**
 * Xét duyệt HTX — APPROVE hoặc REJECT
 * Nếu APPROVE → creator trở thành HTX_MANAGER, HTX status = ACTIVE
 */
export async function reviewHtxRequest(
  htxId: string,
  action: "APPROVE" | "REJECT",
  note?: string
): Promise<HtxRequestResponse> {
  const res = await api.patch(`/api/admin/htx-requests/${htxId}`, { action, note });
  return res.data.data || res.data;
}
