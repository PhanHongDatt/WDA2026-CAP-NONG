/**
 * API HTX Service — Khớp BE HtxController + CooperativeController
 *
 * HtxController (prefix /api/htx):
 *   GET  /                       → Danh sách HTX đang hoạt động (public)
 *   GET  /{htxId}                → Chi tiết HTX (public)
 *   POST /                       → Tạo đơn thành lập HTX (FARMER)
 *   POST /{htxId}/join           → Gửi yêu cầu gia nhập (FARMER)
 *   POST /leave                  → Rời HTX (HTX_MEMBER)
 *   GET  /me                     → Xem HTX của tôi (HTX_MEMBER/HTX_MANAGER)
 *   GET  /members                → Danh sách thành viên (HTX_MANAGER)
 *   GET  /join-requests          → DS yêu cầu chờ duyệt (HTX_MANAGER)
 *   PATCH /join-requests/{id}    → Duyệt/Từ chối yêu cầu (HTX_MANAGER)
 *   DELETE /members/{memberId}   → Xóa thành viên (HTX_MANAGER)
 *
 * CooperativeController (prefix /api/v1/cooperatives):
 *   GET  /bundles                → DS gói thu mua mở (public)
 *   GET  /bundles/{id}           → Chi tiết gói (+ pledges)
 *   GET  /shops/{shopId}/bundles → Bundles của 1 HTX shop
 *   POST /bundles                → Tạo gói (HTX_MANAGER)
 *   PUT  /bundles/{id}/cancel    → Hủy gói (HTX_MANAGER)
 *   PUT  /bundles/{id}/confirm   → Xác nhận gói (HTX_MANAGER)
 *   POST /bundles/{bundleId}/pledges → Cam kết nông sản (FARMER)
 *   DELETE /pledges/{pledgeId}   → Rút cam kết
 *   GET  /my-pledges             → DS cam kết của tôi
 */
import api from "../api";

/* ═══════ HTX Management ═══════ */

/**
 * Danh sách HTX đang hoạt động (public)
 */
export async function getAllHtx(): Promise<unknown[]> {
  const res = await api.get("/api/htx");
  return res.data.data || res.data || [];
}

/**
 * Chi tiết HTX (public)
 */
export async function getHtxDetail(htxId: string): Promise<unknown> {
  const res = await api.get(`/api/htx/${htxId}`);
  return res.data.data || res.data;
}

/**
 * Tạo đơn thành lập HTX (FARMER)
 */
export async function createHtx(data: {
  name: string;
  officialCode: string;
  province: string;
  district: string;
  description?: string;
  documentUrl?: string;
}): Promise<unknown> {
  const payload = {
    name: data.name,
    officialCode: data.officialCode,
    province: data.province,
    district: data.district,
    description: data.description,
    documentUrl: data.documentUrl,
  };
  const res = await api.post("/api/htx", payload);
  return res.data.data || res.data;
}

/**
 * Gửi yêu cầu gia nhập HTX (FARMER)
 */
export async function requestJoinHtx(htxId: string, message?: string): Promise<void> {
  await api.post(`/api/htx/${htxId}/join`, { message });
}

/**
 * Rời HTX (HTX_MEMBER) — sau khi rời sẽ quay về role FARMER
 */
export async function leaveHtx(): Promise<void> {
  await api.post("/api/htx/leave");
}

/**
 * Xem HTX của tôi (HTX_MEMBER / HTX_MANAGER)
 */
export async function getMyHtx(): Promise<unknown> {
  const res = await api.get("/api/htx/me");
  return res.data.data || res.data;
}

/**
 * Danh sách thành viên HTX của tôi (HTX_MANAGER)
 * BE lấy HTX dựa trên auth, không cần truyền htxId
 */
export async function getHtxMembers(): Promise<unknown[]> {
  const res = await api.get("/api/htx/members");
  return res.data.data || res.data || [];
}

/**
 * Danh sách đơn xin gia nhập đang chờ (HTX_MANAGER)
 */
export async function getPendingJoinRequests(): Promise<unknown[]> {
  const res = await api.get("/api/htx/join-requests");
  return res.data.data || res.data || [];
}

/**
 * Duyệt/Từ chối đơn gia nhập (HTX_MANAGER)
 */
export async function handleJoinRequest(
  requestId: string,
  action: "APPROVE" | "REJECT",
  note?: string
): Promise<void> {
  await api.patch(`/api/htx/join-requests/${requestId}`, { action, note });
}

/**
 * Xóa thành viên khỏi HTX (HTX_MANAGER)
 * Member sẽ quay về role FARMER
 */
export async function removeMember(memberId: string): Promise<void> {
  await api.delete(`/api/htx/members/${memberId}`);
}

/* ═══════ Join Request Shortcuts ═══════ */

export async function approveJoinRequest(requestId: string): Promise<void> {
  await handleJoinRequest(requestId, "APPROVE");
}

export async function rejectJoinRequest(requestId: string): Promise<void> {
  await handleJoinRequest(requestId, "REJECT");
}

/* ═══════ Cooperative Bundles ═══════ */

/**
 * Danh sách bundles đang OPEN (public)
 */
export async function getOpenBundles(): Promise<unknown[]> {
  const res = await api.get("/api/v1/cooperatives/bundles");
  return res.data.data || res.data || [];
}

/**
 * Chi tiết bundle + pledges + progress
 */
export async function getBundleDetail(bundleId: string): Promise<{ bundle: unknown; pledges: unknown[] }> {
  const res = await api.get(`/api/v1/cooperatives/bundles/${bundleId}`);
  const data = res.data.data || res.data;
  return {
    bundle: data.bundle || data,
    pledges: data.pledges || [],
  };
}

/**
 * Bundles của 1 HTX shop
 */
export async function getShopBundles(shopId: string): Promise<unknown[]> {
  const res = await api.get(`/api/v1/cooperatives/shops/${shopId}/bundles`);
  return res.data.data || res.data || [];
}

/**
 * Tạo Bundle mới (HTX_MANAGER)
 */
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
  const payload = {
    product_category: data.productCategory,
    product_name: data.productName,
    unit_code: data.unitCode,
    target_quantity: data.targetQuantity,
    price_per_unit: data.pricePerUnit,
    deadline: data.deadline,
    description: data.description,
    min_pledge_quantity: data.minPledgeQuantity,
  };
  const res = await api.post("/api/v1/cooperatives/bundles", payload);
  return res.data.data || res.data;
}

/**
 * Hủy Bundle (HTX_MANAGER) — PUT, không phải PATCH
 */
export async function cancelBundle(bundleId: string): Promise<void> {
  await api.put(`/api/v1/cooperatives/bundles/${bundleId}/cancel`);
}

/**
 * Xác nhận Bundle (HTX_MANAGER) — PUT, không phải PATCH
 */
export async function confirmBundle(bundleId: string): Promise<void> {
  await api.put(`/api/v1/cooperatives/bundles/${bundleId}/confirm`);
}

/**
 * Farmer cam kết sản lượng vào Bundle
 */
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

/**
 * Farmer rút cam kết
 */
export async function withdrawPledge(pledgeId: string): Promise<void> {
  await api.delete(`/api/v1/cooperatives/pledges/${pledgeId}`);
}

/**
 * Pledges của farmer hiện tại
 */
export async function getMyPledges(): Promise<unknown[]> {
  const res = await api.get("/api/v1/cooperatives/my-pledges");
  return res.data.data || res.data || [];
}
