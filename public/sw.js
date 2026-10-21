/* Service worker Clover Safery: halaman & aset dicache untuk pemakaian offline.
   Naikkan CACHE_VERSION setiap kali daftar atau isi aset berubah. */
const CACHE_VERSION = "clover-safery-v4";

const PRECACHE = [
  "/",
  "/login",
  "/register",
  "/dashboard",
  "/admin",
  "/css/styles.css",
  "/css/extra.css",
  "/css/auth.css",
  "/js/theme.js",
  "/js/app.js",
  "/js/extra.js",
  "/js/common.js",
  "/js/auth-form.js",
  "/js/dashboard-page.js",
  "/js/admin-page.js",
  "/manifest.webmanifest",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first: selalu coba versi terbaru, jatuh ke cache saat offline.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/api/")) return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req).then((hit) => hit || caches.match("/")))
  );
});
