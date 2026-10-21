/* Menerapkan tema, ukuran huruf, dan kontras dari pengaturan lokal.
   Nama kunci penyimpanan lama dipertahankan agar pengaturan yang sudah tersimpan tetap terbaca. */
(() => {
  const mq = window.matchMedia ? matchMedia("(prefers-color-scheme: dark)") : null;

  function read() {
    try {
      return JSON.parse(localStorage.getItem("pazzel_prefs") || "{}");
    } catch {
      return {};
    }
  }

  function apply() {
    const prefs = read();
    const root = document.documentElement;
    const theme = prefs.theme || "auto";
    root.dataset.theme = theme === "auto" ? (mq && mq.matches ? "dark" : "light") : theme;
    root.dataset.size = prefs.size === "lg" ? "lg" : "normal";
    root.dataset.contrast = prefs.contrast ? "high" : "normal";
  }

  window.PazzelTheme = { apply };
  apply();
  if (mq && mq.addEventListener) mq.addEventListener("change", apply);
})();
