"use strict";
/* Event klik/input untuk simulasi, kuis, glosarium, dan pengaturan. */

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
  } else if (x === "quiz-pick") {
    Q.sel = i;
    const [qt, qo, qa, qe] = QUIZ[Q.i];
    if (i === qa) Q.ok++;
    Q.log.push({ q: qt, chosen: qo[i], correct: qo[qa], ok: i === qa, explanation: qe });
    paintQuiz();
    const b = $("[data-x=quiz-next]");
    if (b) b.focus();
  } else if (x === "quiz-next") {
    Q.i++;
    Q.sel = null;
    paintQuiz();
    if (Q.i >= QUIZ.length) saveQuizHistory();
    const h = $("#quiz-root .card h2, #quiz-root .callout");
    if (h) {
      h.setAttribute("tabindex", "-1");
      h.focus();
    }
  } else if (x === "quiz-reset") {
    Q = { i: 0, sel: null, ok: 0, log: [], saved: false };
    paintQuiz();
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
