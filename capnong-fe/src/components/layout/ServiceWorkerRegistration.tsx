"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerRegistration — registers SW for offline caching (Paper #5)
 * 
 * DEV: Unregister all SWs + clear caches to prevent offline/online loop
 * PROD: Register SW for offline support
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed — silent fail in production
      });
    } else {
      // DEV MODE: Unregister ALL service workers to prevent
      // request interception → offline/online loop → UI flickering
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      });
      // Clear SW caches that may serve stale HTML
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name));
        });
      }
    }
  }, []);

  return null;
}
