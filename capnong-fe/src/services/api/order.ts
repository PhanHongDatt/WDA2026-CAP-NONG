/**
 * API Order Service — Khớp BE OrderController (updated)
 *
 * BE Endpoints:
 *   POST   /api/orders                              → Checkout: tạo đơn hàng từ giỏ
 *   GET    /api/orders                              → Lịch sử đơn hàng (paginated, filter by status)
 *   GET    /api/orders/{orderId}                    → Chi tiết đơn hàng
 *   GET    /api/orders/guest/{orderCode}?phone=...  → Tra cứu đơn guest
 *   POST   /api/orders/{orderId}/cancel             → Buyer hủy đơn
 *   GET    /api/orders/seller?status=...            → Farmer xem danh sách đơn con
 *   PATCH  /api/orders/sub-orders/{subOrderId}/status → Farmer cập nhật trạng thái đơn con
 */
import api from "../api";
import type { IOrderService } from "../types";

export const apiOrderService: IOrderService = {
  /** POST /api/orders — Checkout */
  async checkout(data: {
    guestEmail?: string;
    guestPhone?: string;
    guestName?: string;
    streetAddress?: string;
    wardCode?: string;
    provinceCode?: string;
    orderNotes?: string;
    otpCode?: string;
    paymentMethod?: string;
  }): Promise<unknown> {
    const payload = {
      guest_email: data.guestEmail,
      guest_phone: data.guestPhone,
      guest_name: data.guestName,
      street_address: data.streetAddress,
      ward_code: data.wardCode,
      province_code: data.provinceCode,
      order_notes: data.orderNotes,
      otp_code: data.otpCode,
      payment_method: data.paymentMethod,
    };
    const res = await api.post("/api/orders", payload);
    return res.data.data || res.data;
  },

  /** GET /api/orders — Lịch sử đơn hàng (paginated) */
  async getMyOrders(opts?: { status?: string; page?: number; size?: number; sort?: string }): Promise<unknown> {
    const params: Record<string, string> = {};
    if (opts?.status && opts.status !== "all") params.status = opts.status;
    params.page = String(opts?.page || 0);
    params.size = String(opts?.size || 20);
    if (opts?.sort) params.sort = opts.sort;
    const res = await api.get("/api/orders", { params });
    return res.data.data || res.data;
  },

  /** GET /api/orders/{orderId} — Chi tiết đơn hàng */
  async getOrderDetail(orderId: string): Promise<unknown> {
    const res = await api.get(`/api/orders/${orderId}`);
    return res.data.data || res.data;
  },

  /** GET /api/orders/guest/{orderCode}?phone=... — Tra cứu đơn guest */
  async getGuestOrder(orderCode: string, phone: string): Promise<unknown> {
    const res = await api.get(`/api/orders/guest/${orderCode}`, { params: { phone } });
    return res.data.data || res.data;
  },

  /** POST /api/orders/{orderId}/cancel — Buyer hủy đơn */
  async cancelOrder(orderId: string): Promise<void> {
    await api.post(`/api/orders/${orderId}/cancel`);
  },

  /** GET /api/orders/seller — Farmer xem danh sách đơn con */
  async getSellerSubOrders(opts?: { status?: string; page?: number; size?: number }): Promise<unknown> {
    const params: Record<string, string> = {};
    if (opts?.status && opts.status !== "all") params.status = opts.status;
    params.page = String(opts?.page || 0);
    params.size = String(opts?.size || 5); // Default 5 for dashboard
    const res = await api.get("/api/orders/seller", { params });
    return res.data.data || res.data || [];
  },

  /** PATCH /api/orders/sub-orders/{subOrderId}/status — Farmer cập nhật trạng thái */
  async updateSubOrderStatus(subOrderId: string, status: string, cancelReason?: string): Promise<void> {
    const payload: Record<string, string> = { status };
    if (cancelReason) payload.cancel_reason = cancelReason;
    await api.patch(`/api/orders/sub-orders/${subOrderId}/status`, payload);
  },

  /** GET /api/orders/sub-orders/{subOrderId} — Farmer xem chi tiết 1 đơn con */
  async getSubOrderDetail(subOrderId: string): Promise<unknown> {
    const res = await api.get(`/api/orders/sub-orders/${subOrderId}`);
    return res.data.data || res.data;
  },
};

/**
 * GET /api/orders/shops/{shopId} — Lấy đơn hàng theo Shop cụ thể
 * Dùng cho HTX Manager xem đơn hàng thuộc Gian hàng HTX
 */
export async function getShopSubOrders(
  shopId: string,
  opts?: { status?: string; page?: number; size?: number }
): Promise<unknown> {
  const params: Record<string, string> = {};
  if (opts?.status && opts.status !== "all") params.status = opts.status;
  params.page = String(opts?.page || 0);
  params.size = String(opts?.size || 20);
  const res = await api.get(`/api/orders/shops/${shopId}`, { params });
  return res.data.data || res.data || [];
}
