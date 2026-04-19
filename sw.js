// ─── Service Worker · Premium Network-First Strategy ────────────────────
// Cache name change kore v3 kora holo jate sob user notun update peye jay
const CACHE_NAME = "weather-app-v3"; 
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/style.css",
  "/script.js",
  "/config.js",
  "/manifest.json",
  "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&display=swap",
  "https://cdn.jsdelivr.net/npm/chart.js",
];

/* ── Install: pre-cache static shell ──────────────────────────────── */
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Notun update aslei jeno force install hoy
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

/* ── Activate: clean old caches ───────────────────────────────────── */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim()) // Notun service worker ke control nite bola
  );
});

/* ── Fetch: Network-First for HTML/CSS/JS, Cache fallback ─────────── */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 1. Amader nijer file (HTML, CSS, JS) er jonno Network-First
  // Ete user sorsasori live update dekhte pabe refresh charai
  if (url.origin === location.origin) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request)) // Internet na thakle offline cache dekhabe
    );
    return;
  }

  // 2. External API (Weather / Map) er jonno Cache-First jeta agei chilo
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
