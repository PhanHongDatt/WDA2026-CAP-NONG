"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Bell, Package, Users, ShoppingCart, Star, MessageSquare, CheckCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import * as notificationApi from "@/services/api/notification";

/* ─── Notification Interface ─── */
interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

function notificationIcon(type: string) {
  switch (type) {
    case "ORDER_NEW": case "NEW_ORDER": return <ShoppingCart className="w-4 h-4 text-primary" />;
    case "ORDER_STATUS": case "ORDER_STATUS_UPDATE": return <Package className="w-4 h-4 text-info" />;
    case "BUNDLE_THRESHOLD": case "BUNDLE_FULL": case "BUNDLE_CONFIRMED": return <Users className="w-4 h-4 text-amber-500" />;
    case "HTX_JOIN_REQUEST": case "HTX_APPROVED": return <Users className="w-4 h-4 text-purple-500" />;
    case "REVIEW_NEW": return <Star className="w-4 h-4 text-warning" />;
    default: return <MessageSquare className="w-4 h-4 text-gray-400" />;
  }
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

/**
 * NotificationBell — Bell icon với badge + dropdown danh sách thông báo
 * UC-38: Nhận & đọc thông báo in-app
 * Gọi API thật từ BE — không có mock data
 */
export default function NotificationBell() {
  const { isLoggedIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  /* Fetch notifications from API */
  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      const result = await notificationApi.getNotifications(0, 20);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: Notification[] = result.notifications.map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.body || n.message,
        created_at: n.created_at || n.createdAt,
        is_read: n.is_read !== undefined ? n.is_read : (n.isRead || false),
      }));
      setNotifications(mapped);
      setUnreadCount(result.unreadCount || mapped.filter((n) => !n.is_read).length);
      setLoaded(true);
    } catch {
      // API unavailable — show empty
      if (!loaded) {
        setNotifications([]);
        setUnreadCount(0);
        setLoaded(true);
      }
    }
  }, [isLoggedIn, loaded]);

  /* Fetch on mount + poll unread count only when tab visible */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchNotifications();

    let interval: ReturnType<typeof setInterval> | null = null;

    const startPolling = () => {
      if (interval) return;
      interval = setInterval(async () => {
        if (!isLoggedIn) return;
        try {
          const count = await notificationApi.getUnreadCount();
          setUnreadCount(count);
        } catch { /* silent */ }
      }, 30_000);
    };

    const stopPolling = () => {
      if (interval) { clearInterval(interval); interval = null; }
    };

    // Only poll when tab is visible
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchNotifications(); // refresh immediately
        startPolling();
      } else {
        stopPolling();
      }
    };

    if (document.visibilityState === "visible") startPolling();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [fetchNotifications, isLoggedIn]);

  /* Refresh when dropdown opens */
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await notificationApi.markAllAsRead();
    } catch { /* silent fallback */ }
  };

  const markRead = async (n: Notification) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
    );
    if (!n.is_read) {
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await notificationApi.markAsRead(n.id);
      } catch { /* silent fallback */ }
    }
    
    setOpen(false);
    
    // Simple redirect based on type
    if (n.type === "ORDER_NEW" || n.type === "NEW_ORDER") {
      window.location.href = "/dashboard/orders";
    } else if (n.type.includes("ORDER")) {
      window.location.href = "/orders";
    }
  };

  if (!isLoggedIn) return null;

  return (
    <div className="relative" ref={ref}>
      {/* Bell Button */}
      <button type="button"
        onClick={() => setOpen(!open)}
        className="relative p-1 cursor-pointer"
        aria-label="Thông báo"
      >
        <Bell className="w-6 h-6 text-gray-600 dark:text-foreground-muted hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-surface font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-surface border border-gray-200 dark:border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-border flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-foreground">
              Thông báo
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-bold text-white bg-accent px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button type="button"
                onClick={markAllRead}
                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Đọc tất cả
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-border">
            {notifications.map((n) => (
              <button type="button"
                key={n.id}
                onClick={() => markRead(n)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-surface-hover transition-colors ${
                  !n.is_read ? "bg-primary/5 dark:bg-primary/10" : ""
                }`}
              >
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-background-light flex items-center justify-center shrink-0 mt-0.5">
                    {notificationIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!n.is_read ? "font-bold text-gray-900 dark:text-foreground" : "font-medium text-gray-700 dark:text-foreground"}`}>
                        {n.title}
                      </p>
                      {!n.is_read && (
                        <span className="w-2 h-2 bg-primary rounded-full shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-foreground-muted mt-0.5 truncate">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {notifications.length === 0 && (
            <div className="py-8 text-center text-foreground-muted text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Chưa có thông báo
            </div>
          )}
        </div>
      )}
    </div>
  );
}
