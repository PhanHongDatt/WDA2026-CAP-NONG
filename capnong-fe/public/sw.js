/**
 * Service Worker — Cạp Nông (Paper #5: Offline Caching)
 * Network-first strategy + offline fallback
 */

const CACHE_NAME = "capnong-v1";
const OFFLINE_URL = "/offline";

const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
];

// Install — pre-cache essential assets
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) { return key !== CACHE_NAME; })
          .map(function (key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — network-first with offline fallback
self.addEventListener("fetch", function (event) {
  var request = event.request;

  // Only handle GET requests
  if (request.method !== "GET") return;

  // Skip API requests
  if (request.url.indexOf("/api/") !== -1) return;

  event.respondWith(
    fetch(request)
      .then(function (response) {
        // Cache successful static asset responses
        if (response.ok && /\.(js|css|png|jpg|webp|avif|svg|woff2?)$/.test(request.url)) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(request, clone);
          });
        }
        return response;
      })
      .catch(function () {
        // Try cache
        return caches.match(request).then(function (cached) {
          if (cached) return cached;
          // Fallback to offline page for navigation
          if (request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          return new Response("", { status: 503 });
        });
      })
  );
});
