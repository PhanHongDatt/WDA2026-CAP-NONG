"use client";

import { useState, useEffect, useRef } from "react";

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

/** Debounce delay before declaring offline (ms) — prevents SW-induced flicker */
const OFFLINE_DEBOUNCE_MS = 2000;

/**
 * useNetwork — Network-aware hook with debounced offline detection
 * 
 * Prevents rapid online↔offline toggling caused by Service Worker
 * intercepting failed requests and triggering browser offline events.
 * 
 * Ref: web.dev/adaptive-serving-based-on-network-quality
 * Ref: developer.mozilla.org/en-US/docs/Web/API/NetworkInformation
 */
export function useNetwork(): NetworkInfo & { isSlow: boolean } {
  const [info, setInfo] = useState<NetworkInfo>(() => ({
    ...getSnapshot(),
    isOnline: true, // Assume online initially to prevent flash
  }));
  const offlineTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      // Clear pending offline timer — we're back online
      if (offlineTimer.current) {
        clearTimeout(offlineTimer.current);
        offlineTimer.current = null;
      }
      setInfo(getSnapshot());
    };

    const handleOffline = () => {
      // Debounce offline: wait 2s before declaring offline
      // This prevents SW-induced micro-disconnects from flashing the banner
      if (offlineTimer.current) clearTimeout(offlineTimer.current);
      offlineTimer.current = setTimeout(() => {
        // Double-check: still offline after debounce?
        if (!navigator.onLine) {
          setInfo(getSnapshot());
        }
      }, OFFLINE_DEBOUNCE_MS);
    };

    const handleConnectionChange = () => {
      // Connection quality change (3G→4G etc) — update immediately
      if (navigator.onLine) {
        setInfo(getSnapshot());
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    const conn = getConnection();
    conn?.addEventListener("change", handleConnectionChange);

    // Initial sync (only if actually offline after mount)
    if (!navigator.onLine) {
      offlineTimer.current = setTimeout(() => {
        if (!navigator.onLine) setInfo(getSnapshot());
      }, OFFLINE_DEBOUNCE_MS);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      conn?.removeEventListener("change", handleConnectionChange);
      if (offlineTimer.current) clearTimeout(offlineTimer.current);
    };
  }, []);

  return {
    ...info,
    isSlow: info.quality === "2g" || info.quality === "slow-2g" || info.quality === "offline",
  };
}
