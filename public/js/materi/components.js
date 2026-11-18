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

/** Popup "Level selesai!" bergaya game: XP, bintang, lencana, konfeti, dan nada fanfare. */
function levelUp(st) {
  const old = document.getElementById("lvl-pop");
  if (old) old.remove();
  const i = Progress.STEPS.findIndex((x) => x.key === st.key);
  const all = Progress.doneCount() === Progress.STEPS.length;
  const star = Progress.stars(st.key);
  const nxt = Progress.next();
  const confetti = Array.from({ length: 26 }, (_, k) => `<i style="--x:${(k * 37) % 100}%;--d:${(k % 6) * 0.12}s;--c:${["#8fe022", "#f0b93a", "#ffffff", "#4d9c10"][k % 4]}"></i>`).join("");
  const el = document.createElement("div");
  el.id = "lvl-pop";
  el.className = "lvl-pop";
  el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  el.setAttribute("aria-labelledby", "lvl-t");
  el.innerHTML = `<div class="confetti" aria-hidden="true">${confetti}</div>
    <div class="lvl-card">
      <p class="lvl-k">${all ? "Petualangan selesai!" : "Level " + (i + 1) + " selesai!"}</p>
      <div class="lvl-orb" aria-hidden="true">${st.icon}</div>
      <h2 id="lvl-t">${all ? "Kamu resmi jadi " + Progress.rank() + "!" : "Kerja bagus!"}</h2>
      <p class="lvl-stars" aria-label="${star} dari 3 bintang">${"★".repeat(star)}${"☆".repeat(3 - star)}</p>
      <p><strong>+${Progress.stepXp(st.key)} XP</strong> · Lencana <strong>🏅 ${st.badge}</strong></p>
      <p class="lvl-rank">Pangkatmu sekarang: <strong>${Progress.rank()}</strong> · Total ${Progress.xp()} XP</p>
      <div class="btn-row" style="justify-content:center">
        ${nxt ? `<a class="btn btn-primary" href="#/${nxt.key}" data-close-pop>Lanjut: Level ${Progress.STEPS.findIndex((x) => x.key === nxt.key) + 1}</a>` : `<a class="btn btn-primary" href="#/" data-close-pop>Lihat peta petualangan</a>`}
        <button type="button" class="btn" data-close-pop>Tutup</button>
      </div>
    </div>`;
  document.body.appendChild(el);
  el.addEventListener("click", (e) => {
    if (e.target.closest("[data-close-pop]") || e.target === el) el.remove();
  });
  el.addEventListener("keydown", (e) => {
    if (e.key === "Escape") el.remove();
  });
  const first = el.querySelector("a.btn");
  if (first) first.focus();
  if (window.Sfx) (all ? Sfx.level : Sfx.success)();
}
