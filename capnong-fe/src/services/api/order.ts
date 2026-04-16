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
  }): Promise<unknown> {
    const res = await api.post("/api/orders", data);
    return res.data.data || res.data;
  },

  /** GET /api/orders — Lịch sử đơn hàng (paginated) */
  async getMyOrders(status?: string, page?: number, size?: number): Promise<unknown> {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    params.page = String(page || 0);
    params.size = String(size || 20);
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
  async getSellerSubOrders(status?: string): Promise<unknown[]> {
    const params: Record<string, string> = {};
    if (status) params.status = status;
    const res = await api.get("/api/orders/seller", { params });
    return res.data.data || res.data || [];
  },

  /** PATCH /api/orders/sub-orders/{subOrderId}/status — Farmer cập nhật trạng thái */
  async updateSubOrderStatus(subOrderId: string, status: string): Promise<void> {
    await api.patch(`/api/orders/sub-orders/${subOrderId}/status`, { status });
  },
};
