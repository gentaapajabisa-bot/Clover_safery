const V = "clover-safety-v3";
const A = ["./","index.html","css/styles.css","css/extra.css","js/theme.js","js/app.js","js/extra.js","manifest.webmanifest","icon.svg","icon-192.png","login.html","register.html","dashboard.html","admin.html","css/auth.css","js/auth-pages.js","js/dashboard-page.js","js/admin-page.js"];
self.addEventListener("install", e => e.waitUntil(caches.open(V).then(c => c.addAll(A)).then(() => self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => clients.claim())));
self.addEventListener("fetch", e => {
  const r = e.request;
  if(r.method !== "GET" || new URL(r.url).origin !== location.origin || new URL(r.url).pathname.startsWith("/api/")) return;
  e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); return res; })
    .catch(() => caches.match(r).then(m => m || caches.match("index.html"))));
});
