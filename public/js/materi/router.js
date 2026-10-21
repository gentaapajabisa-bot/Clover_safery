"use strict";
/* Daftar rute (hash), navigasi, dan render halaman. */

/* =========================================================
   Router
   ========================================================= */
const ROUTES = {
  "/": { t: "Beranda Clover Safery", nav: "Beranda Clover Safery", r: pageHome },
  "/tanda-bahaya": { t: "Mengenali Tanda Bahaya", nav: "Mengenali Tanda Bahaya", r: pageSigns, key: "tanda-bahaya" },
  "/privasi": {
    t: "Menjaga Privasi dan Batasan Diri",
    nav: "Menjaga Privasi dan Batasan Diri",
    r: pagePrivacy,
    key: "privasi",
  },
  "/tindakan": {
    t: "Menentukan Tindakan yang Aman",
    nav: "Menentukan Tindakan yang Aman",
    r: pageAction,
    a: () => paintScn(),
    key: "tindakan",
  },
  "/refleksi": { t: "Refleksi Setelah Puzzle", nav: "Refleksi Setelah Puzzle", r: pageReflect, key: "refleksi" },
  "/bantuan": { t: "Meminta Bantuan", nav: "Meminta Bantuan", r: pageHelp, key: "bantuan" },
  "/akun": {
    t: "Akun — Clover Safery",
    r: () =>
      `<h1 tabindex="-1">Akun Clover Safery</h1><p class="lead">Halaman login sekarang terpisah dari materi edukasi.</p><p><a class="btn btn-primary" href="/login">Masuk atau daftar akun</a></p>`,
  },
  "/guru": { t: "Panduan Guru BK", r: pageGuru },
  "/tentang": { t: "Tentang dan Privasi", r: pageAbout },
};
function buildNav(cur) {
  const me = Auth.current();
  $("#nav-list").innerHTML =
    Object.entries(ROUTES)
      .filter(([p, r]) => r.nav)
      .map(([p, r]) => `<li><a href="#${p}" ${p === cur ? 'aria-current="page"' : ""}>${r.nav}</a></li>`)
      .join("") +
    (me && me.role === "guru"
      ? `<li><a href="#/guru" ${cur === "/guru" ? 'aria-current="page"' : ""}>Panduan Guru BK</a></li>`
      : "");
  const a = $("#acct-link");
  a.textContent = me ? "👤 " + me.nickname : "Masuk";
  a.setAttribute("aria-label", me ? `Akun: ${me.nickname}` : "Masuk atau daftar (opsional)");
  if (cur === "/akun") a.setAttribute("aria-current", "page");
  else a.removeAttribute("aria-current");
}
function render() {
  let p = location.hash.replace(/^#/, "") || "/";
  if (!ROUTES[p]) p = "/";
  const r = ROUTES[p];
  $("#main").innerHTML = r.r();
  if (r.a) r.a();
  if (r.key) Auth.markOpened(r.key);
  buildNav(p);
  document.title = r.t + " — Clover Safery";
  $("#nav-main").classList.remove("open");
  $("#menu-toggle").setAttribute("aria-expanded", "false");
  window.scrollTo(0, 0);
  const h = $("#main h1");
  if (h) {
    h.setAttribute("tabindex", "-1");
    h.focus({ preventScroll: true });
  }
}
window.addEventListener("hashchange", () => {
  if (Alarm.active) return;
  render();
});
$("#menu-toggle").addEventListener("click", (e) => {
  const n = $("#nav-main");
  const o = n.classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", String(o));
});
