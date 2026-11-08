"use strict";
/* Efek suara Clover Safety: bunyi di setiap klik/ketukan, nada berhasil, dan nada naik level.
   Dibuat dengan Web Audio (tanpa file). Pilihan suara dibagi dengan loading screen (kunci clover_sound). */
(function () {
  var KEY = "clover_sound";
  var ctx = null;
  function isMuted() {
    try {
      return localStorage.getItem(KEY) === "off";
    } catch (e) {
      return false;
    }
  }
  function audio() {
    try {
      if (!ctx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      }
      if (ctx && ctx.state === "suspended") ctx.resume();
    } catch (e) {
      ctx = null;
    }
    return ctx;
  }
  /** Satu nada: frekuensi, mulai (detik dari sekarang), durasi, volume, bentuk gelombang, geser ke frekuensi lain. */
  function tone(f, at, dur, vol, type, to) {
    var c = ctx;
    var o = c.createOscillator();
    var g = c.createGain();
    var t = c.currentTime + at;
    o.type = type || "sine";
    o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  function play(fn) {
    if (isMuted() || !audio()) return;
    try {
      fn();
    } catch (e) {
      /* abaikan */
    }
  }
  var Sfx = {
    /** klik biasa: "pop" pendek */
    click: function () {
      play(function () {
        tone(520, 0, 0.09, 0.09, "triangle", 880);
        tone(1320, 0.015, 0.06, 0.03, "sine");
      });
    },
    /** memilih skor / centang: dua nada naik */
    pick: function () {
      play(function () {
        tone(660, 0, 0.08, 0.08, "triangle");
        tone(990, 0.07, 0.1, 0.07, "triangle");
      });
    },
    /** terkunci: dengung rendah */
    locked: function () {
      play(function () {
        tone(190, 0, 0.18, 0.1, "square", 120);
      });
    },
    /** bagian selesai: arpeggio naik */
    success: function () {
      play(function () {
        [523, 659, 784, 1047].forEach(function (f, i) {
          tone(f, i * 0.09, 0.32, 0.1, "triangle");
        });
      });
    },
    /** naik level / selesai semua: fanfare */
    level: function () {
      play(function () {
        [523, 659, 784, 1047, 784, 1047, 1319].forEach(function (f, i) {
          tone(f, i * 0.11, 0.42, 0.11, "triangle");
        });
        tone(262, 0, 1.1, 0.07, "sine");
      });
    },
    isMuted: isMuted,
  };
  window.Sfx = Sfx;

  var SEL = 'a[href], button, [role="button"], summary, select, label.rate, input[type="radio"], input[type="checkbox"], .opt, .chip';
  /* pointerdown = bunyi langsung saat disentuh, bukan menunggu klik selesai */
  document.addEventListener(
    "pointerdown",
    function (e) {
      var t = e.target && e.target.closest ? e.target.closest(SEL) : null;
      if (!t || e.button > 0) return;
      if (t.closest(".sfx-toggle")) return;
      if (t.disabled || t.getAttribute("aria-disabled") === "true" || t.classList.contains("locked") || t.classList.contains("is-locked")) {
        Sfx.locked();
        return;
      }
      if (t.matches('label.rate, input[type="radio"], input[type="checkbox"]')) Sfx.pick();
      else Sfx.click();
    },
    true
  );
  /* tombol keyboard (Enter/Spasi) pada elemen interaktif */
  document.addEventListener(
    "keydown",
    function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var t = e.target && e.target.closest ? e.target.closest("a[href], button, summary") : null;
      if (t && !t.closest(".sfx-toggle")) Sfx.click();
    },
    true
  );

  /* ---------- tombol suara melayang ---------- */
  function mount() {
    if (document.querySelector(".sfx-toggle")) return;
    var st = document.createElement("style");
    st.textContent =
      ".sfx-toggle{position:fixed;left:14px;bottom:14px;z-index:900;width:44px;height:44px;border-radius:50%;border:2px solid rgba(255,255,255,.6);background:#2f6b0b;color:#fff;font-size:1.15rem;line-height:1;cursor:pointer;display:grid;place-items:center;box-shadow:0 6px 16px rgba(0,0,0,.28)}" +
      ".sfx-toggle:hover{background:#3f8a0b}.sfx-toggle:focus-visible{outline:3px solid #f0b93a;outline-offset:2px}" +
      "html.cl-loading .sfx-toggle{display:none}@media(max-width:720px){.sfx-toggle{bottom:78px;width:40px;height:40px}}";
    document.head.appendChild(st);
    var b = document.createElement("button");
    b.type = "button";
    b.className = "sfx-toggle";
    function paint() {
      var m = isMuted();
      b.textContent = m ? "🔇" : "🔊";
      b.setAttribute("aria-label", m ? "Efek suara mati. Tekan untuk menyalakan" : "Efek suara menyala. Tekan untuk mematikan");
      b.setAttribute("aria-pressed", String(!m));
      b.title = m ? "Nyalakan suara" : "Matikan suara";
    }
    b.addEventListener("click", function () {
      var m = isMuted();
      try {
        localStorage.setItem(KEY, m ? "on" : "off");
      } catch (e) {
        /* abaikan */
      }
      paint();
      if (m) Sfx.click();
    });
    paint();
    document.body.appendChild(b);
  }
  if (document.body) mount();
  else document.addEventListener("DOMContentLoaded", mount);
})();
