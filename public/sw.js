const CACHE_NAME = "nr1-radio-v3";
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

  // Don't cache AzuraCast stream or API calls — these are infinite/long-lived
  // responses, and cache.put() on an infinite stream body never resolves,
  // stalling the fetch for the page.
  if (
    url.hostname !== self.location.hostname ||
    url.pathname.startsWith("/api/") ||
    url.pathname.includes("/radio/") ||
    url.pathname === "/stream"
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

// --- Web push: live-show alerts -------------------------------------------
// The payload is built in src/app/api/webhooks/azuracast/live/route.ts.

self.addEventListener("push", (event) => {
  // A push with no body, or an unparseable one, still has to show something:
  // most browsers show their own "site updated in background" notice if a push
  // event ends without one.
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = payload.title || "NR1 is live";
  const body = payload.body || "A live show just started. Tap to listen.";
  const url = payload.url || "/listen";

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      // Same tag collapses an earlier unread live alert instead of stacking.
      tag: payload.tag || "nr1-live",
      renotify: true,
      data: { url },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/listen";

  // Focus an already-open NR1 tab rather than opening a second one, so the
  // listener does not end up with two players running at once.
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          const sameOrigin = new URL(client.url).origin === self.location.origin;
          if (sameOrigin && "focus" in client) {
            if ("navigate" in client) client.navigate(target);
            return client.focus();
          }
        }
        return self.clients.openWindow(target);
      })
  );
});
