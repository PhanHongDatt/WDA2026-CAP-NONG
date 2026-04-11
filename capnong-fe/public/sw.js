/**
 * Service Worker — Cạp Nông v2
 * 
 * Strategy Overview (based on Google Workbox patterns):
 * ─────────────────────────────────────────────────────
 * 1. PRECACHE: Shell HTML + offline page (install time)
 * 2. CACHE-FIRST: Static assets (JS, CSS, fonts, images) → instant load from cache
 * 3. STALE-WHILE-REVALIDATE: API data → show cached immediately, update in background
 * 4. NETWORK-FIRST: HTML navigation → try network, fallback to cache/offline
 * 
 * Ref: web.dev/runtime-caching-with-workbox
 *      developers.google.com/web/fundamentals/instant-and-offline
 */

const CACHE_VERSION = "capnong-v2";
const STATIC_CACHE = "capnong-static-v2";
const API_CACHE = "capnong-api-v2";
const IMAGE_CACHE = "capnong-images-v2";
const OFFLINE_URL = "/offline";

const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/favicon.svg",
];

// Max items in each cache to prevent unbounded growth
const MAX_API_ENTRIES = 50;
const MAX_IMAGE_ENTRIES = 100;
const API_CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

/* ─── INSTALL ─── */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_ASSETS))
  );
  self.skipWaiting();
});

/* ─── ACTIVATE — clean old caches ─── */
self.addEventListener("activate", (event) => {
  const validCaches = [CACHE_VERSION, STATIC_CACHE, API_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => !validCaches.includes(k)).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ─── Helper: limit cache size ─── */
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    // Delete oldest entries (FIFO)
    const toDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(toDelete.map((k) => cache.delete(k)));
  }
}

/* ─── FETCH ─── */
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only GET
  if (request.method !== "GET") return;

  // 1) API requests → Stale-While-Revalidate
  //    Show cached response immediately, update cache in background
  if (url.pathname.startsWith("/api/") || url.hostname !== self.location.hostname) {
    if (url.pathname.includes("/api/")) {
      event.respondWith(staleWhileRevalidate(request));
      return;
    }
  }

  // 2) Static assets → Cache-First (instant from cache)
  if (/\.(js|css|woff2?|ttf|otf)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 3) Images → Cache-First with size limit
  if (/\.(png|jpg|jpeg|webp|avif|svg|gif|ico)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, MAX_IMAGE_ENTRIES));
    return;
  }

  // 4) Navigation (HTML) → Network-First with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  // 5) Everything else → Network-First
  event.respondWith(networkFirst(request));
});

/* ─── Strategy: Cache-First ─── */
async function cacheFirst(request, cacheName, maxEntries) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
      if (maxEntries) trimCache(cacheName, maxEntries);
    }
    return response;
  } catch {
    return new Response("", { status: 503 });
  }
}

/* ─── Strategy: Stale-While-Revalidate ─── */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);

  // Revalidate in background regardless
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        // Store with timestamp header for freshness check
        const headers = new Headers(response.headers);
        headers.set("sw-cached-at", Date.now().toString());
        const timedResponse = new Response(response.clone().body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        });
        cache.put(request, timedResponse);
        trimCache(API_CACHE, MAX_API_ENTRIES);
      }
      return response;
    })
    .catch(() => cached || new Response(JSON.stringify({ error: "offline" }), {
      status: 503,
      headers: { "Content-Type": "application/json" },
    }));

  // Return cached immediately if available and fresh enough
  if (cached) {
    const cachedAt = parseInt(cached.headers.get("sw-cached-at") || "0", 10);
    const age = Date.now() - cachedAt;
    // If cache is fresh (< 5 min), return it immediately
    // Background fetch still updates cache for next time
    if (age < API_CACHE_MAX_AGE) {
      return cached;
    }
  }

  // No cache or stale → wait for network
  return fetchPromise;
}

/* ─── Strategy: Network-First ─── */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    // Cache successful navigation responses
    if (response.ok && request.mode === "navigate") {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Navigation fallback → offline page
    if (request.mode === "navigate") {
      return caches.match(OFFLINE_URL) || new Response("Offline", { status: 503 });
    }
    return new Response("", { status: 503 });
  }
}
