/* Halaman sambutan: pengguna yang sudah login langsung diarahkan ke dashboard (butuh common.js). */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const { user } = await api("/api/auth/me", null, "GET");
    if (user) location.replace("/dashboard");
  } catch {
    /* backend belum siap: tetap tampilkan halaman sambutan */
  }
});

// Offline (PWA)
if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost"))
  navigator.serviceWorker.register("/sw.js").catch(() => {});
