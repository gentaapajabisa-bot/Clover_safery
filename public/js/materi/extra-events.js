"use strict";
/* Event klik/input untuk simulasi, glosarium, dan pengaturan. */

/* ---------- Interaksi ---------- */
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-x]");
  if (!t) return;
  const x = t.dataset.x,
    i = +t.dataset.i;
  if (x === "pref") {
    const k = t.dataset.k;
    setP(k, k === "contrast" ? t.dataset.v === "1" : t.dataset.v);
    $$(`[data-x=pref][data-k=${k}]`).forEach((b) => b.setAttribute("aria-pressed", String(b === t)));
  } else if (x === "sim-tab") {
    SIM.s = i;
    simReset();
    paintSim();
  } else if (x === "sim-reset") {
    simReset();
    paintSim();
  } else if (x === "sim-pick") {
    const c = SIMS[SIM.s].nodes[SIM.node].ch[i];
    SIM.log.push({ k: "me", t: c.t }, { k: "fb", tone: c.tone, t: c.fb });
    simEnter(c.n);
    paintSim();
    const b = $("#sim-root .opt, #sim-root [data-x=sim-reset]");
    if (b) b.focus({ preventScroll: true });
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id !== "term-q") return;
  const v = e.target.value.trim().toLowerCase();
  let n = 0;
  $$("#terms details").forEach((d) => {
    const m = !v || d.dataset.s.includes(v);
    d.hidden = !m;
    if (m) n++;
  });
  $("#term-n").textContent = v ? (n ? `${n} istilah ditemukan.` : "Istilah tidak ditemukan. Coba kata lain.") : "";
});
