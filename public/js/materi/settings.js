"use strict";
/* Pengaturan tampilan & aksesibilitas (tema, ukuran huruf, kontras). */

/* ---------- Pengaturan tampilan ---------- */
const getP = () => {
  try {
    return JSON.parse(LS.get("pazzel_prefs") || "{}");
  } catch {
    return {};
  }
};
const setP = (k, v) => {
  const p = getP();
  p[k] = v;
  LS.set("pazzel_prefs", JSON.stringify(p));
  window.PazzelTheme && PazzelTheme.apply();
};
function pageSettings() {
  const p = getP();
  const grp = (k, label, opts, cur) =>
    `<fieldset><legend>${label}</legend><div class="tabs" role="group" aria-label="${label}">${opts.map(([v, l]) => `<button type="button" class="tab" data-x="pref" data-k="${k}" data-v="${v}" aria-pressed="${cur === v}">${l}</button>`).join("")}</div></fieldset>`;
  return `<h1 tabindex="-1">Tampilan &amp; Aksesibilitas</h1>
  <p class="lead">Atur supaya Clover Safery nyaman dibaca. Pengaturan ini hanya tersimpan di perangkat ini dan tidak berisi data pribadi.</p>
  ${grp(
    "theme",
    "Tema",
    [
      ["auto", "Ikuti perangkat"],
      ["light", "Terang"],
      ["dark", "Gelap"],
    ],
    p.theme || "auto"
  )}
  ${grp(
    "size",
    "Ukuran huruf",
    [
      ["normal", "Normal"],
      ["lg", "Besar"],
    ],
    p.size || "normal"
  )}
  ${grp(
    "contrast",
    "Kontras",
    [
      ["0", "Normal"],
      ["1", "Tinggi"],
    ],
    p.contrast ? "1" : "0"
  )}
  <div class="callout biru"><p><strong>Tanpa internet:</strong> setelah dibuka sekali, halaman dan alarm tetap bisa dipakai saat offline. Kamu juga bisa memasangnya lewat menu browser (“Tambahkan ke layar utama”).</p></div>`;
}
