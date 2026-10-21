"use strict";
/* Pendaftaran service worker (offline) dan render awal. */

/* ---------- Offline (PWA) ---------- */
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost"))
  navigator.serviceWorker.register("/sw.js").catch(() => {});

render();
