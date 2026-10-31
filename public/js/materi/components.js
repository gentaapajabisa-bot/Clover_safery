"use strict";
/* Komponen kecil yang dipakai ulang oleh halaman. */

/* =========================================================
   Komponen
   ========================================================= */
const RATE_LABELS = ["Belum paham", "Sedikit paham", "Cukup paham", "Paham", "Sangat paham"];
const RATE_KEY = { signs: "tanda-bahaya", priv: "privasi", act: "tindakan" };

function rateSummary(id) {
  const total = CL_TOTAL[id];
  const n = Progress.rated(id, total);
  const avg = Progress.average(id, total);
  const pct = Math.round((n / total) * 100);
  const status =
    n === total
      ? `Skor rata-ratamu <strong>${avg.toFixed(1).replace(".", ",")} / 5</strong>. Semua pernyataan sudah kamu nilai.`
      : `Sudah dinilai <strong>${n} dari ${total}</strong> pernyataan. Beri skor semuanya untuk melanjutkan.`;
  return `<div class="rate-bar" aria-hidden="true"><i style="width:${pct}%"></i></div><p>${status}</p>`;
}
/** Penilaian diri: tiap pernyataan diberi skor 1–5. Skor tersimpan di perangkat ini. */
function checklist(id, title, items) {
  const saved = Progress.ratings(id);
  return `<fieldset class="rate-set"><legend>${esc(title)}</legend>
    <p class="hint rate-hint">Beri skor 1–5 untuk tiap pernyataan: <strong>1</strong> = belum paham, <strong>5</strong> = sangat paham. Ini penilaian dirimu sendiri, bukan nilai dari siapa pun.</p>
    ${items
      .map(
        (t, i) => `<div class="rate-row"><p class="rate-q">${esc(t)}</p>
      <div class="rate-opts" role="radiogroup" aria-label="Skor untuk: ${esc(t)}">
        ${[1, 2, 3, 4, 5].map((v) => `<label class="rate" title="${RATE_LABELS[v - 1]}"><input type="radio" name="rate-${id}-${i}" data-rate="${id}" data-i="${i}" value="${v}" ${saved[i] === v ? "checked" : ""}><span>${v}</span></label>`).join("")}
      </div></div>`
      )
      .join("")}
    <div class="rate-sum" id="cnt-${id}" aria-live="polite">${rateSummary(id)}</div></fieldset>`;
}
/** Tombol lanjut: terkunci sampai skor semua terisi (gate = id penilaian). */
function nextBtn(gate, href, label) {
  const ok = Progress.rated(gate, CL_TOTAL[gate]) === CL_TOTAL[gate];
  return `<span class="next-wrap" data-gate="${gate}"><a class="btn btn-primary" href="${href}" ${ok ? "" : "hidden"}>${label}</a><button type="button" class="btn btn-primary is-locked" disabled ${ok ? "hidden" : ""}>🔒 Isi semua skor dulu untuk lanjut</button></span>`;
}
function routeBtn(href, label, cls = "btn") {
  return `<a class="${cls}" href="${href}">${label}</a>`;
}
