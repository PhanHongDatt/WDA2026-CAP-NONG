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

/* ─── User Addresses ─────────────────────────────────────── */

export interface UserAddress {
  id: string;
  fullName: string;
  phone: string;
  street: string;
  ward: string;
  province: string;
  isDefault: boolean;
}

export type UserAddressRequest = Omit<UserAddress, "id" | "isDefault"> & { isDefault?: boolean };

export const apiUserAddressService = {
  /** Lấy danh sách địa chỉ */
  async getAddresses(): Promise<UserAddress[]> {
    const res = await api.get("/api/users/me/addresses");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (res.data.data || res.data).map((item: any) => ({
      id: item.id,
      fullName: item.full_name || item.fullName || "",
      phone: item.phone || "",
      street: item.street || "",
      ward: item.ward || "",
      province: item.province || "",
      isDefault: item.is_default || item.isDefault || false,
    }));
  },

  /** Thêm địa chỉ mới */
  async createAddress(data: UserAddressRequest): Promise<UserAddress> {
    const payload = {
      full_name: data.fullName,
      phone: data.phone,
      street: data.street,
      ward: data.ward,
      province: data.province,
      is_default: data.isDefault,
    };
    const res = await api.post("/api/users/me/addresses", payload);
    const item = res.data.data;
    return {
      id: item.id,
      fullName: item.full_name || item.fullName || "",
      phone: item.phone || "",
      street: item.street || "",
      ward: item.ward || "",
      province: item.province || "",
      isDefault: item.is_default || item.isDefault || false,
    };
  },

  /** Cập nhật địa chỉ */
  async updateAddress(id: string, data: UserAddressRequest): Promise<UserAddress> {
    const payload = {
      full_name: data.fullName,
      phone: data.phone,
      street: data.street,
      ward: data.ward,
      province: data.province,
      is_default: data.isDefault,
    };
    const res = await api.put(`/api/users/me/addresses/${id}`, payload);
    const item = res.data.data;
    return {
      id: item.id,
      fullName: item.full_name || item.fullName || "",
      phone: item.phone || "",
      street: item.street || "",
      ward: item.ward || "",
      province: item.province || "",
      isDefault: item.is_default || item.isDefault || false,
    };
  },

  /** Xóa địa chỉ */
  async deleteAddress(id: string): Promise<void> {
    await api.delete(`/api/users/me/addresses/${id}`);
  },

  /** Đặt làm địa chỉ mặc định */
  async setDefault(id: string): Promise<UserAddress> {
    const res = await api.patch(`/api/users/me/addresses/${id}/default`);
    const item = res.data.data;
    return {
      id: item.id,
      fullName: item.full_name || item.fullName || "",
      phone: item.phone || "",
      street: item.street || "",
      ward: item.ward || "",
      province: item.province || "",
      isDefault: item.is_default || item.isDefault || false,
    };
  }
};
