/**
 * API Unit Service — Khớp BE UnitController
 *
 * BE Endpoints (prefix /api/units):
 *   GET     /         → Danh sách đơn vị tính (public)
 *   GET     /{code}   → Chi tiết đơn vị theo code (public)
 *   POST    /         → Tạo đơn vị (ADMIN)
 *   PUT     /{id}     → Cập nhật đơn vị (ADMIN)
 *   DELETE  /{id}     → Xóa đơn vị (ADMIN)
 */
import api from "../api";

/* ─── Types ─── */
export interface Unit {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface UnitCreateRequest {
  code: string;
  name: string;
  description?: string;
}

export interface UnitUpdateRequest {
  name: string;
  description?: string;
}

/* ─── API Functions ─── */

/** Lấy tất cả đơn vị tính (public) */
export async function getAllUnits(): Promise<Unit[]> {
  const res = await api.get("/api/units");
  return res.data.data || res.data || [];
}

/** Lấy đơn vị theo code (public) */
export async function getUnitByCode(code: string): Promise<Unit> {
  const res = await api.get(`/api/units/${code}`);
  return res.data.data || res.data;
}

/** Tạo đơn vị tính (ADMIN) */
export async function createUnit(data: UnitCreateRequest): Promise<Unit> {
  const res = await api.post("/api/units", data);
  return res.data.data || res.data;
}

/** Cập nhật đơn vị tính (ADMIN) */
export async function updateUnit(id: string, data: UnitUpdateRequest): Promise<Unit> {
  const res = await api.put(`/api/units/${id}`, data);
  return res.data.data || res.data;
}

/** Xóa đơn vị tính (ADMIN) */
export async function deleteUnit(id: string): Promise<void> {
  await api.delete(`/api/units/${id}`);
}
