/**
 * API Address Service — Khớp BE AddressController
 *
 * BE Endpoints (prefix /api/address):
 *   GET /provinces                          → Danh sách Tỉnh/TP
 *   GET /provinces/{provinceCode}/wards     → Danh sách Xã/Phường theo Tỉnh
 */
import api from "../api";

export interface Province {
  code: number;
  name: string;
}

export interface Ward {
  code: number;
  name: string;
}

/**
 * Lấy danh sách tất cả Tỉnh/Thành phố
 */
export async function getProvinces(): Promise<Province[]> {
  const res = await api.get("/api/address/provinces");
  return res.data.data || res.data || [];
}

/**
 * Lấy danh sách Xã/Phường theo mã Tỉnh/TP
 */
export async function getWards(provinceCode: number): Promise<Ward[]> {
  const res = await api.get(`/api/address/provinces/${provinceCode}/wards`);
  return res.data.data || res.data || [];
}
