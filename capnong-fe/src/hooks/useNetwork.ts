"use client";

import { useState, useEffect, useSyncExternalStore } from "react";

/* ─── Types ─── */
export type ConnectionQuality = "4g" | "3g" | "2g" | "slow-2g" | "offline" | "unknown";

export interface NetworkInfo {
  /** Browser online/offline */
  isOnline: boolean;
  /** Connection quality: 4g, 3g, 2g, slow-2g, offline */
  quality: ConnectionQuality;
  /** User prefers reduced data (Save-Data header) */
  saveData: boolean;
  /** Effective round-trip time in ms (0 if unknown) */
  rtt: number;
  /** Effective downlink speed in Mbps (0 if unknown) */
  downlink: number;
}

/* ─── Navigator.connection types ─── */
interface NetworkInformation {
  effectiveType?: ConnectionQuality;
  saveData?: boolean;
  rtt?: number;
  downlink?: number;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

function getConnection(): NetworkInformation | undefined {
  if (typeof navigator === "undefined") return undefined;
  return (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
}

function getSnapshot(): NetworkInfo {
  if (typeof navigator === "undefined") {
    return { isOnline: true, quality: "4g", saveData: false, rtt: 0, downlink: 10 };
  }
  const conn = getConnection();
  return {
    isOnline: navigator.onLine,
    quality: !navigator.onLine
      ? "offline"
      : (conn?.effectiveType as ConnectionQuality) || "unknown",
    saveData: conn?.saveData || false,
    rtt: conn?.rtt || 0,
    downlink: conn?.downlink || 0,
  };
}

/**
 * useNetwork — Network-aware hook
 * 
 * Ref: web.dev/adaptive-serving-based-on-network-quality
 * Ref: developer.mozilla.org/en-US/docs/Web/API/NetworkInformation
 * 
 * Usage:
 *   const { isOnline, quality, isSlow, saveData } = useNetwork();
 *   if (isSlow) → load low-res images, skip animations, show cached data
 *   if (!isOnline) → show offline banner
 */
export function useNetwork(): NetworkInfo & { isSlow: boolean } {
  const [info, setInfo] = useState<NetworkInfo>(getSnapshot);

  useEffect(() => {
    const update = () => setInfo(getSnapshot());

    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    const conn = getConnection();
    conn?.addEventListener("change", update);

    // Initial sync
    update();

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      conn?.removeEventListener("change", update);
    };
  }, []);

  return {
    ...info,
    isSlow: info.quality === "2g" || info.quality === "slow-2g" || info.quality === "offline",
  };
}
