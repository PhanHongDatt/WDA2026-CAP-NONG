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
  // BE returns snake_case: product_category
  product_category?: string;
  productCategory?: string;
  // BE returns snake_case: start_month, end_month
  start_month?: number;
  end_month?: number;
  startMonth?: number;
  endMonth?: number;
  note?: string;
  configured_by?: string;
  configured_by_username?: string;
  updated_at?: string;
  updatedAt?: string;
}

export interface SeasonalConfigRequest {
  province: string;
  productCategory: string;
  startMonth: number;
  endMonth: number;
  note?: string;
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
  // BE uses global SNAKE_CASE ObjectMapper → send snake_case keys
  const res = await api.post("/api/seasonal-configs", {
    province: data.province,
    product_category: data.productCategory,
    start_month: data.startMonth,
    end_month: data.endMonth,
    note: data.note || "",
  });
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
