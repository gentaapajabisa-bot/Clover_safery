/* Backsound lagu Clover Safety: volume kecil, berlanjut dari posisi terakhir, ikut tombol suara (clover_sound). */
(function () {
  "use strict";
  var VOL = 0.16;
  var KEY_T = "clover_bgm_t";
  function off() {
    try {
      return localStorage.getItem("clover_sound") === "off";
    } catch (e) {
      return false;
    }
  }
  var a;
  try {
    a = new Audio("/audio/lagu-clover.mp3");
  } catch (e) {
    return;
  }
  a.loop = true;
  a.preload = "none";
  a.volume = 0;
  // loading screen punya musiknya sendiri; backsound ini mulai dari awal setelah loading selesai
  try {
    var t = parseFloat(sessionStorage.getItem(KEY_T) || "0");
    if (t > 0) a.addEventListener("loadedmetadata", function () { if (t < a.duration) a.currentTime = t; }, { once: true });
  } catch (e) {
    /* abaikan */
  }
  var fade = null;
  function to(v, ms, then) {
    clearInterval(fade);
    var from = a.volume, k = 0, n = Math.max(1, Math.round(ms / 40));
    fade = setInterval(function () {
      k++;
      a.volume = Math.max(0, Math.min(1, from + ((v - from) * k) / n));
      if (k >= n) { clearInterval(fade); if (then) then(); }
    }, 40);
  }
  function blocked() {
    return document.documentElement.classList.contains("cl-loading") || document.hidden || off() || /#\/bantuan/.test(location.hash);
  }
  function play() {
    if (blocked() || !a.paused) return;
    var p;
    try { p = a.play(); } catch (e) { return; }
    if (p && p.then) p.then(function () { if (blocked()) a.pause(); else to(VOL, 2000); }).catch(function () { /* tunggu gestur */ });
  }
  function stop() {
    if (a.paused) return;
    to(0, 350, function () { a.pause(); });
  }
  function sync() { if (blocked()) stop(); else play(); }
  function save() {
    try { if (a.currentTime > 0) sessionStorage.setItem(KEY_T, String(a.currentTime)); } catch (e) { /* abaikan */ }
  }
  ["pointerdown", "keydown", "touchstart"].forEach(function (ev) {
    addEventListener(ev, function () { setTimeout(sync, 0); }, { passive: true });
  });
  document.addEventListener("visibilitychange", sync);
  addEventListener("hashchange", sync);
  addEventListener("storage", sync);
  addEventListener("pagehide", save);
  setInterval(function () { save(); sync(); }, 1500);
  sync();
})();
