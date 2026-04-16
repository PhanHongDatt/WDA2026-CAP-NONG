/**
 * API Seasonal Config Service — Khớp BE SeasonalConfigController
 *
 * BE Endpoints (prefix /api/seasonal-configs):
 *   GET     /                     → Danh sách tất cả config (public)
 *   GET     /province/{province}  → Config theo tỉnh (public)
 *   POST    /                     → Tạo config (HTX_MANAGER, ADMIN)
 *   PUT     /{id}                 → Cập nhật config (HTX_MANAGER, ADMIN)
 *   DELETE  /{id}                 → Xóa config (ADMIN only)
 *   POST    /trigger-update       → Kích hoạt cập nhật thủ công (ADMIN)
 */
import api from "../api";

/* ─── Types ─── */
export interface SeasonalConfig {
  id: string;
  province: string;
  category: string;
  startMonth: number;
  endMonth: number;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SeasonalConfigRequest {
  province: string;
  category: string;
  startMonth: number;
  endMonth: number;
  description?: string;
}

/* ─── API Functions ─── */

/** Lấy tất cả config mùa vụ */
export async function getAllSeasonalConfigs(): Promise<SeasonalConfig[]> {
  const res = await api.get("/api/seasonal-configs");
  return res.data.data || res.data || [];
}

/** Lấy config theo tỉnh */
export async function getSeasonalConfigsByProvince(province: string): Promise<SeasonalConfig[]> {
  const res = await api.get(`/api/seasonal-configs/province/${province}`);
  return res.data.data || res.data || [];
}

/** Tạo config mùa vụ (HTX_MANAGER / ADMIN) */
export async function createSeasonalConfig(data: SeasonalConfigRequest): Promise<SeasonalConfig> {
  const res = await api.post("/api/seasonal-configs", data);
  return res.data.data || res.data;
}

/** Cập nhật config mùa vụ */
export async function updateSeasonalConfig(id: string, data: SeasonalConfigRequest): Promise<SeasonalConfig> {
  const res = await api.put(`/api/seasonal-configs/${id}`, data);
  return res.data.data || res.data;
}

/** Xóa config mùa vụ (ADMIN only) */
export async function deleteSeasonalConfig(id: string): Promise<void> {
  await api.delete(`/api/seasonal-configs/${id}`);
}

/** Kích hoạt cập nhật trạng thái mùa vụ thủ công (ADMIN) */
export async function triggerSeasonalUpdate(): Promise<void> {
  await api.post("/api/seasonal-configs/trigger-update");
}
