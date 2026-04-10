"use client";

import { useNetwork } from "@/hooks/useNetwork";
import { WifiOff, Wifi, Signal } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * NetworkStatus — Top banner showing offline/slow network state
 * 
 * - Offline → Red banner: "Bạn đang ngoại tuyến — xem dữ liệu đã lưu"
 * - Slow (2G) → Yellow banner: "Mạng yếu — đang ưu tiên tải nội dung quan trọng"
 * - Reconnect → Green flash: "Đã kết nối lại!" (tự biến mất sau 3s)
 */
export default function NetworkStatus() {
  const { isOnline, quality, isSlow } = useNetwork();
  const [showReconnect, setShowReconnect] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  // Track offline → online transitions
  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      // Just came back online
      setShowReconnect(true);
      setWasOffline(false);
      const timer = setTimeout(() => setShowReconnect(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  // Reconnected flash
  if (showReconnect) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] bg-green-600 text-white text-center py-2 text-sm font-medium animate-slide-down">
        <div className="flex items-center justify-center gap-2">
          <Wifi className="w-4 h-4" />
          Đã kết nối lại!
        </div>
      </div>
    );
  }

  // Offline
  if (!isOnline) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 text-white text-center py-2 text-sm font-medium">
        <div className="flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          Bạn đang ngoại tuyến — xem dữ liệu đã lưu
        </div>
      </div>
    );
  }

  // Slow network (2G / slow-2g)
  if (isSlow) {
    return (
      <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white text-center py-1.5 text-xs font-medium">
        <div className="flex items-center justify-center gap-2">
          <Signal className="w-3.5 h-3.5" />
          Mạng yếu — đang ưu tiên tải nội dung quan trọng
        </div>
      </div>
    );
  }

  return null;
}
