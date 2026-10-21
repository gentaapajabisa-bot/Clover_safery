/* Service worker Clover Safety: halaman & aset dicache untuk pemakaian offline.
   Naikkan CACHE_VERSION setiap kali daftar atau isi aset berubah. */
const CACHE_VERSION = "clover-safety-v10";

const PRECACHE = [
  "/",
  "/login",
  "/belajar",
  "/register",
  "/dashboard",
  "/admin",
  "/profile",
  "/kontak",
  "/riwayat",
  "/chat",
  "/admin-chat",
  "/css/styles.css",
  "/css/extra.css",
  "/css/auth.css",
  "/css/features.css",
  "/css/beranda.css",
  "/js/theme.js",
  "/js/materi-guard.js",
  "/js/landing.js",
  "/js/materi/core.js",
  "/js/materi/local-auth.js",
  "/js/materi/state.js",
  "/js/materi/trusted-server.js",
  "/js/materi/history-save.js",
  "/js/materi/alarm.js",
  "/js/materi/content.js",
  "/js/materi/components.js",
  "/js/materi/pages.js",
  "/js/materi/pages-local-account.js",
  "/js/materi/router.js",
  "/js/materi/events.js",
  "/js/materi/settings.js",
  "/js/materi/simulasi.js",
  "/js/materi/kuis.js",
  "/js/materi/kamus.js",
  "/js/materi/extra-routes.js",
  "/js/materi/extra-events.js",
  "/js/materi/pwa.js",
  "/js/common.js",
  "/js/auth-form.js",
  "/js/dashboard-page.js",
  "/js/admin-page.js",
  "/js/profile-page.js",
  "/js/contacts-page.js",
  "/js/chat-page.js",
  "/js/history-page.js",
  "/js/admin-chat-page.js",
  "/manifest.webmanifest",
  "/icon.svg",
  "/img/clover-shield.svg",
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
