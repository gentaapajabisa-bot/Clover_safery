"use strict";
/* Komponen kecil yang dipakai ulang oleh halaman. */

/* =========================================================
   Komponen
   ========================================================= */
function counterText(id) {
  const n = (S.checks[id] || []).length;
  return `Kamu mencentang ${n} dari ${CL_TOTAL[id]} pernyataan. Ini hanya penanda saat belajar, bukan skor atau penilaian.`;
}
function checklist(id, title, items) {
  const st = S.checks[id] || (S.checks[id] = []);
  return `<fieldset class="checklist"><legend>${esc(title)}</legend>
    ${items.map((t, i) => `<label class="chk"><input type="checkbox" data-cl="${id}" value="${i}" ${st.includes(i) ? "checked" : ""}><span>${esc(t)}</span></label>`).join("")}
    <p class="counter" id="cnt-${id}" aria-live="polite">${counterText(id)}</p></fieldset>`;
}
function routeBtn(href, label, cls = "btn") {
  return `<a class="${cls}" href="${href}">${label}</a>`;
}
