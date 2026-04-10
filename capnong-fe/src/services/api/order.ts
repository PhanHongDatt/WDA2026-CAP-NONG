/**
 * API Order Service — Khớp BE OrderController
 *
 * Endpoints:
 *   POST /api/orders/checkout    → Tạo đơn hàng (hỗ trợ guest via Guest-Session-Id header)
 *   GET  /api/orders/my-orders   → Danh sách đơn hàng của user đang login
 *
 * BE CheckoutRequest: { guestEmail, guestPhone, guestName, streetAddress, wardCode, provinceCode, orderNotes, otpCode }
 * BE OrderResponse: { id, orderCode, status, totalAmount, items[], shippingAddress, createdAt, ... }
 */
import api from "../api";
import type { IOrderService } from "../types";

export const apiOrderService: IOrderService = {
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
    const res = await api.post("/api/orders/checkout", data);
    return res.data.data || res.data;
  },

  async getMyOrders(): Promise<unknown[]> {
    const res = await api.get("/api/orders/my-orders");
    return res.data.data || res.data || [];
  },
};
