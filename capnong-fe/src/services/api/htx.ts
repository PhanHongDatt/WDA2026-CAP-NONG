/**
 * API HTX Service — Khớp BE HtxController + CooperativeController
 *
 * HtxController (prefix /api/v1/htx):
 *   POST /                       → Tạo HTX
 *   GET  /{id}                   → Chi tiết HTX
 *   GET  /{id}/members           → Danh sách thành viên
 *   POST /{id}/join              → Gửi yêu cầu tham gia
 *   GET  /join-requests          → DS yêu cầu chờ duyệt (HTX_MANAGER)
 *   PATCH /join-requests/{id}    → Duyệt/Từ chối yêu cầu
 *
 * CooperativeController (prefix /api/v1/cooperatives):
 *   GET  /bundles                → DS gói thu mua mở
 *   GET  /bundles/{id}           → Chi tiết gói (+ pledges)
 *   POST /bundles                → Tạo gói (HTX_MANAGER)
 *   POST /bundles/{id}/pledges   → Cam kết nông sản (FARMER)
 *   DELETE /pledges/{id}         → Rút cam kết
 *   GET  /my-pledges             → DS cam kết của tôi
 */
import api from "../api";

/* ═══════ HTX Management ═══════ */

export async function createHtx(data: {
  name: string;
  officialCode: string;
  province: string;
  district: string;
  description?: string;
  documentUrl?: string;
}): Promise<unknown> {
  const res = await api.post("/api/v1/htx", data);
  return res.data.data || res.data;
}

export async function getHtxDetail(id: string): Promise<unknown> {
  const res = await api.get(`/api/v1/htx/${id}`);
  return res.data.data || res.data;
}

export async function getHtxMembers(htxId: string): Promise<unknown[]> {
  const res = await api.get(`/api/v1/htx/${htxId}/members`);
  return res.data.data || res.data || [];
}

export async function requestJoinHtx(htxId: string, message?: string): Promise<void> {
  await api.post(`/api/v1/htx/${htxId}/join`, { message });
}

export async function getPendingJoinRequests(): Promise<unknown[]> {
  const res = await api.get("/api/v1/htx/join-requests");
  return res.data.data || res.data || [];
}

export async function handleJoinRequest(
  requestId: string,
  action: "APPROVE" | "REJECT",
  note?: string
): Promise<void> {
  await api.patch(`/api/v1/htx/join-requests/${requestId}`, { action, note });
}

/* ═══════ Cooperative Bundles ═══════ */

export async function getOpenBundles(): Promise<unknown[]> {
  const res = await api.get("/api/v1/cooperatives/bundles");
  return res.data.data || res.data || [];
}

export async function getBundleDetail(bundleId: string): Promise<{ bundle: unknown; pledges: unknown[] }> {
  const res = await api.get(`/api/v1/cooperatives/bundles/${bundleId}`);
  const data = res.data.data || res.data;
  return {
    bundle: data.bundle || data,
    pledges: data.pledges || [],
  };
}

export async function createBundle(data: {
  productCategory: string;
  productName: string;
  unitCode: string;
  targetQuantity: number;
  pricePerUnit: number;
  deadline: string;
  description?: string;
  minPledgeQuantity?: number;
}): Promise<unknown> {
  const res = await api.post("/api/v1/cooperatives/bundles", data);
  return res.data.data || res.data;
}

export async function addPledge(
  bundleId: string,
  quantity: number,
  note?: string
): Promise<unknown> {
  const res = await api.post(`/api/v1/cooperatives/bundles/${bundleId}/pledges`, {
    quantity,
    note,
  });
  return res.data.data || res.data;
}

export async function withdrawPledge(pledgeId: string): Promise<void> {
  await api.delete(`/api/v1/cooperatives/pledges/${pledgeId}`);
}

export async function getMyPledges(): Promise<unknown[]> {
  const res = await api.get("/api/v1/cooperatives/my-pledges");
  return res.data.data || res.data || [];
}

/* ═══════ Admin / Listing ═══════ */

export async function getAllHtx(): Promise<unknown[]> {
  const res = await api.get("/api/v1/htx");
  return res.data.data || res.data || [];
}

/* ═══════ Join Request Actions ═══════ */

export async function approveJoinRequest(requestId: string): Promise<void> {
  await handleJoinRequest(requestId, "APPROVE");
}

export async function rejectJoinRequest(requestId: string): Promise<void> {
  await handleJoinRequest(requestId, "REJECT");
}

/* ═══════ Bundle Actions ═══════ */

export async function confirmBundle(bundleId: string): Promise<void> {
  await api.patch(`/api/v1/cooperatives/bundles/${bundleId}`, { status: "CONFIRMED" });
}

export async function cancelBundle(bundleId: string): Promise<void> {
  await api.patch(`/api/v1/cooperatives/bundles/${bundleId}`, { status: "CANCELLED" });
}
