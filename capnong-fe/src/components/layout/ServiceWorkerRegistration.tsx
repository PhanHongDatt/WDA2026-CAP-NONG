"use client";

import { useEffect } from "react";

/**
 * ServiceWorkerRegistration — registers SW for offline caching (Paper #5)
 * Place this component in layout or ClientProviders.
 */
export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // SW registration failed — silent fail in production
      });
    }
  }, []);

  return null;
}
