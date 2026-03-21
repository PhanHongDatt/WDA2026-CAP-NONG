// ─── Notification Types (khớp API Contract) ───

export type NotificationType =
  | "NEW_ORDER"
  | "ORDER_STATUS_UPDATE"
  | "ORDER_CANCELLED"
  | "BUNDLE_FULL"
  | "BUNDLE_CONFIRMED"
  | "BUNDLE_EXPIRED"
  | "BUNDLE_JOINED"
  | "PLEDGE_WITHDRAWN"
  | "HTX_JOIN_REQUEST"
  | "HTX_APPROVED"
  | "HTX_REJECTED"
  | "HTX_MEMBER_REMOVED"
  | "REVIEW_NEW"
  | "SYSTEM";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, unknown>;
}
