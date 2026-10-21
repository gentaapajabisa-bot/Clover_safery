"use strict";
/* Kontak tepercaya dari akun (server). Hanya terbaca bila sudah login, dan hanya milik pengguna itu.
   Dipakai di halaman Bantuan dan panel alarm; mengubah daftar dilakukan di /kontak. */
const TrustedServer = {
  list: null, // null = belum dimuat / tidak login
  loading: null,
  load() {
    if (!this.loading) {
      this.loading = fetch("/api/contacts", { credentials: "same-origin" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          this.list = d && Array.isArray(d.contacts) ? d.contacts : null;
        })
        .catch(() => {
          this.list = null;
        });
    }
    return this.loading;
  },
  html() {
    if (this.list === null) {
      return `<p class="hint"><a href="/login">Masuk</a> untuk menyimpan kontak orang tepercaya di akunmu. Daftar ini hanya bisa dilihat olehmu.</p>`;
    }
    if (!this.list.length) {
      return `<p class="hint">Belum ada kontak tersimpan. <a href="/kontak">Tambahkan kontak tepercaya →</a></p>`;
    }
    const items = this.list
      .map((c) => {
        const tel = c.phone ? String(c.phone).replace(/[^0-9+]/g, "") : "";
        return `<li><strong>${esc(c.name)}</strong> — ${esc(c.relationship)}${c.note ? `<br><span class="hint">${esc(c.note)}</span>` : ""}${tel ? `<br><a href="tel:${esc(tel)}">📞 ${esc(c.phone)}</a>` : ""}</li>`;
      })
      .join("");
    return `<ul class="clean" style="margin:0">${items}</ul><p class="hint" style="margin-top:10px"><a href="/kontak">Kelola kontak →</a></p>`;
  },
  async paint(selector) {
    const el = $(selector);
    if (!el) return;
    await this.load();
    const target = $(selector); // halaman bisa berganti selama menunggu
    if (target) target.innerHTML = this.html();
  },
};

/** Dipanggil router setelah halaman Bantuan tampil. */
function paintTrusted() {
  TrustedServer.paint("#srv-trusted");
}
document.addEventListener("click", (e) => {
  if (e.target.closest && e.target.closest("#al-trust")) TrustedServer.paint("#al-contacts");
});
