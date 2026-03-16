const CACHE_NAME = "nr1-radio-v2";
const OFFLINE_URL = "/offline";

// Static assets to pre-cache
const PRECACHE_ASSETS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Don't cache AzuraCast stream or API calls
  if (
    url.hostname !== self.location.hostname ||
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("/radio/")
  ) {
    event.respondWith(fetch(request).catch(() => new Response("", { status: 503 })));
    return;
  }

  // Never cache Next.js build chunks — they are already content-hashed by Next.js
  // so the browser HTTP cache handles them perfectly. Caching them here causes
  // ChunkLoadErrors after every deployment when hashes change.
  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(fetch(request));
    return;
  }

  // Network-first for HTML navigation (except offline fallback)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(OFFLINE_URL))
        .then((res) => res ?? caches.match(OFFLINE_URL))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((res) => {
        if (!res || res.status !== 200 || res.type === "opaque") return res;
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return res;
      });
    })
  );
});
