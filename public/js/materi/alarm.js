"use strict";
/* Alarm tanda bahaya (sirene, overlay, panel orang tepercaya). */

/* =========================================================
   Alarm
   ========================================================= */
const Alarm = {
  active: false,
  ctx: null,
  osc: null,
  lfo: null,
  lastFocus: null,
  start() {
    if (this.active) return; // tidak boleh ada dua salinan audio
    this.active = true;
    this.lastFocus = document.activeElement;
    $("#al-fail").hidden = true;
    $("#al-trustpanel").hidden = true;
    $("#al-trust").setAttribute("aria-expanded", "false");
    $("#alarm-overlay").hidden = false;
    $("#app").inert = true;
    $("#app").setAttribute("aria-hidden", "true");
    $("#al-stop").focus();
    this.playSiren();
    try {
      if (navigator.vibrate) navigator.vibrate([400, 200, 400, 200, 400, 200, 400]);
    } catch {}
  },
  playSiren() {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) throw new Error("no audio");
      const ctx = new AC();
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.value = 1000;
      const lfo = ctx.createOscillator();
      lfo.type = "triangle";
      lfo.frequency.value = 0.9;
      const lg = ctx.createGain();
      lg.gain.value = 450;
      lfo.connect(lg);
      lg.connect(osc.frequency);
      const g = ctx.createGain();
      g.gain.value = 0.85;
      const comp = ctx.createDynamicsCompressor();
      osc.connect(g);
      g.connect(comp);
      comp.connect(ctx.destination);
      osc.start();
      lfo.start();
      this.ctx = ctx;
      this.osc = osc;
      this.lfo = lfo;
      const check = () => {
        if (this.active && ctx.state !== "running") this.audioFail();
      };
      if (ctx.resume) {
        ctx
          .resume()
          .then(() => setTimeout(check, 300))
          .catch(() => this.audioFail());
      } else setTimeout(check, 300);
    } catch {
      this.audioFail();
    }
  },
  audioFail() {
    const el = $("#al-fail");
    el.innerHTML =
      "Suara alarm tidak dapat diputar di perangkat ini (mungkin volume mati, mode senyap, atau browser memblokir suara). <strong>Tetap lakukan ini:</strong> menjauhlah ke tempat aman, dekati orang dewasa tepercaya atau tempat yang ramai, dan minta bantuan dengan suaramu. Bahaya langsung? Hubungi 112.";
    el.hidden = false;
  },
  stop() {
    if (!this.active) return;
    try {
      this.osc && this.osc.stop();
      this.lfo && this.lfo.stop();
    } catch {}
    try {
      this.ctx && this.ctx.close();
    } catch {}
    this.osc = this.lfo = this.ctx = null;
    this.active = false;
    try {
      if (navigator.vibrate) navigator.vibrate(0);
    } catch {}
    $("#alarm-overlay").hidden = true;
    $("#app").inert = false;
    $("#app").removeAttribute("aria-hidden");
    if (location.hash !== "#/bantuan") location.hash = "#/bantuan";
    else render();
    toast("Alarm dihentikan. Pilihan bantuan ditampilkan di bawah ini.");
    setTimeout(() => {
      const h = $("#main h1");
      if (h) h.focus();
    }, 60);
  },
};
$("#al-stop").addEventListener("click", () => Alarm.stop());
$("#al-trust").addEventListener("click", (e) => {
  const p = $("#al-trustpanel");
  p.hidden = !p.hidden;
  e.currentTarget.setAttribute("aria-expanded", String(!p.hidden));
});
document.addEventListener("keydown", (e) => {
  if (!Alarm.active) return;
  if (e.key === "Escape") {
    Alarm.stop();
    return;
  }
  if (e.key === "Tab") {
    // jebakan fokus di dalam panel alarm
    const f = $$("#alarm-overlay button, #alarm-overlay a[href]").filter((x) => !x.hidden && x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0],
      last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});
