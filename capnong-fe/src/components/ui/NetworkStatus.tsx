"use client";

import { useNetwork } from "@/hooks/useNetwork";
import { WifiOff, Wifi, Signal } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * NetworkStatus — Top banner showing offline/slow network state
 * 
 * Uses CSS opacity transitions instead of conditional mount/unmount
 * to prevent layout shifts that cause visual flickering.
 * 
 * - Offline → Red banner: "Bạn đang ngoại tuyến — xem dữ liệu đã lưu"
 * - Slow (2G) → Yellow banner: "Mạng yếu — đang ưu tiên tải nội dung quan trọng"
 * - Reconnect → Green flash: "Đã kết nối lại!" (tự biến mất sau 3s)
 */
export default function NetworkStatus() {
  const { isOnline, isSlow } = useNetwork();
  const [showReconnect, setShowReconnect] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent SSR hydration mismatch
  useEffect(() => setMounted(true), []);

  // Track offline → online transitions
  useEffect(() => {
    if (!mounted) return;
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowReconnect(true);
      setWasOffline(false);
      const timer = setTimeout(() => setShowReconnect(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline, mounted]);

  // Don't render on server or before hydration
  if (!mounted) return null;

  // Determine which banner to show
  const showOffline = !isOnline;
  const showSlow = isOnline && !showReconnect && isSlow;
  const showAny = showOffline || showSlow || showReconnect;

  if (!showAny) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[100] text-white text-center text-sm font-medium transition-all duration-300"
      style={{
        backgroundColor: showReconnect ? "#16a34a" : showOffline ? "#dc2626" : "#f59e0b",
        paddingTop: "0.5rem",
        paddingBottom: "0.5rem",
      }}
    >
      <div className="flex items-center justify-center gap-2">
        {showReconnect && (
          <>
            <Wifi className="w-4 h-4" />
            Đã kết nối lại!
          </>
        )}
        {showOffline && (
          <>
            <WifiOff className="w-4 h-4" />
            Bạn đang ngoại tuyến — xem dữ liệu đã lưu
          </>
        )}
        {showSlow && (
          <>
            <Signal className="w-3.5 h-3.5" />
            Mạng yếu — đang ưu tiên tải nội dung quan trọng
          </>
        )}
      </div>
    </div>
  );
}
