/**
 * API User Address Service — Khớp BE UserAddressController
 *
 * BE Endpoints (prefix /api/users/me/addresses):
 *   GET     /                     → Danh sách địa chỉ đã lưu (default lên đầu)
 *   POST    /                     → Thêm địa chỉ mới (tối đa 10/user)
 *   PUT     /{addressId}          → Cập nhật địa chỉ
 *   DELETE  /{addressId}          → Xóa địa chỉ
 *   PATCH   /{addressId}/default  → Đặt làm địa chỉ mặc định
 *
 * Roles: Authenticated users
 */
import api from "../api";

/* ─── Types ─── */
export interface UserAddress {
  id: string;
  recipientName: string;
  phone: string;
  provinceCode: string;
  provinceName?: string;
  wardCode: string;
  wardName?: string;
  streetAddress: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserAddressRequest {
  recipientName: string;
  phone: string;
  provinceCode: string;
  wardCode: string;
  streetAddress: string;
  isDefault?: boolean;
}

/* ─── API Functions ─── */

/**
 * Lấy tất cả địa chỉ đã lưu (default lên đầu)
 */
export async function getMyAddresses(): Promise<UserAddress[]> {
  const res = await api.get("/api/users/me/addresses");
  return res.data.data || res.data || [];
}

/**
 * Thêm địa chỉ mới (tối đa 10 địa chỉ/user, địa chỉ đầu tiên tự động mặc định)
 */
export async function createAddress(data: UserAddressRequest): Promise<UserAddress> {
  const res = await api.post("/api/users/me/addresses", data);
  return res.data.data || res.data;
}

/**
 * Cập nhật địa chỉ (nếu isDefault=true sẽ set làm mặc định)
 */
export async function updateAddress(addressId: string, data: UserAddressRequest): Promise<UserAddress> {
  const res = await api.put(`/api/users/me/addresses/${addressId}`, data);
  return res.data.data || res.data;
}

/**
 * Xóa địa chỉ (nếu xóa mặc định, hệ thống tự chọn địa chỉ khác)
 */
export async function deleteAddress(addressId: string): Promise<void> {
  await api.delete(`/api/users/me/addresses/${addressId}`);
}

/**
 * Đặt 1 địa chỉ làm mặc định (các địa chỉ khác tự động bỏ mặc định)
 */
export async function setDefaultAddress(addressId: string): Promise<UserAddress> {
  const res = await api.patch(`/api/users/me/addresses/${addressId}/default`);
  return res.data.data || res.data;
}
