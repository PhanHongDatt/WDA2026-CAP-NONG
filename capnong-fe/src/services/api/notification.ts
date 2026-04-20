/**
 * API Notification Service — Khớp BE NotificationController
 *
 * BE Endpoints (prefix /api/v1/notifications):
 *   GET  /                        → Danh sách thông báo (page, limit)
 *   GET  /unread-count            → Số thông báo chưa đọc
 *   PATCH /{id}/read              → Đánh dấu đã đọc
 *   PATCH /read-all               → Đánh dấu tất cả đã đọc
 *   GET /telegram/link            → Nhận link auto-link telegram bot
 *   GET /telegram/status          → Lấy trạng thái liên kết telegram
 *   DELETE /telegram              → Hủy liên kết Telegram
 */
import api from "../api";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationListResult {
  notifications: NotificationItem[];
  unreadCount: number;
}

/**
 * Lấy danh sách thông báo + unread count
 */
export async function getNotifications(
  page: number = 0,
  limit: number = 20
): Promise<NotificationListResult> {
  const res = await api.get("/api/v1/notifications", {
    params: { page, limit },
  });
  const data = res.data.data || res.data;
  return {
    notifications: data.notifications?.content || data.notifications || [],
    unreadCount: data.unread_count ?? data.unreadCount ?? 0,
  };
}

/**
 * Lấy số thông báo chưa đọc
 */
export async function getUnreadCount(): Promise<number> {
  const res = await api.get("/api/v1/notifications/unread-count");
  const data = res.data.data || res.data;
  return data.count ?? 0;
}

/**
 * Đánh dấu 1 thông báo đã đọc
 */
export async function markAsRead(notificationId: string): Promise<void> {
  await api.patch(`/api/v1/notifications/${notificationId}/read`);
}

/**
 * Đánh dấu tất cả đã đọc
 */
export async function markAllAsRead(): Promise<void> {
  await api.patch("/api/v1/notifications/read-all");
}

/**
 * Lấy link liên kết Telegram tự động
 */
export async function getTelegramLink(): Promise<string> {
  const res = await api.get("/api/v1/notifications/telegram/link");
  // Unwrap until we find the link string
  let payload = res.data;
  if (payload?.data) payload = payload.data;
  if (payload?.data) payload = payload.data; // Just in case double nested
  
  return payload?.link || payload || "";
}

/**
 * Lấy trạng thái liên kết Telegram
 */
export async function getTelegramStatus(): Promise<boolean> {
  const res = await api.get("/api/v1/notifications/telegram/status");
  const data = res.data.data || res.data;
  return data.is_linked === true;
}

/**
 * Hủy liên kết Telegram
 */
export async function unlinkTelegram(): Promise<void> {
  await api.delete("/api/v1/notifications/telegram");
}
