/* Loading screen Clover Safety: tampil sekali per sesi browser. Halaman bantuan darurat tidak pernah ditahan. */
(function () {
  "use strict";
  var KEY = "clover_loader_seen";
  var root = document.documentElement;
  try {
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, "1");
  } catch (e) {
    /* tanpa sessionStorage: tampilkan sekali di halaman ini saja */
  }
  if (/#\/(bantuan|tentang)/.test(location.hash)) return;

  var TIPS = [
    "Kamu boleh berkata “tidak” dengan tenang.",
    "Rahasia yang membuatmu takut tidak perlu dijaga.",
    "Hadiah tidak membuatmu berutang apa pun.",
    "Kamu tidak sendirian. Selalu ada orang dewasa tepercaya.",
    "Butuh bantuan? SAPA 129 siap mendengarkan.",
  ];
  var CLOVER =
    '<svg viewBox="0 0 64 64" aria-hidden="true"><g fill="#c9f56f"><path d="M32 30c-10-12-24-4-18 6 4 7 14 6 18-6z"/><path d="M32 30c10-12 24-4 18 6-4 7-14 6-18-6z"/><path d="M32 34c-12 8-8 22 2 20 8-2 9-12-2-20z"/><path d="M32 34c12 8 8 22-2 20-8-2-9-12 2-20z" opacity=".85"/></g></svg>';

  function letters(t) {
    var out = "";
    for (var k = 0; k < t.length; k++)
      out += t.charAt(k) === " " ? '<span class="sp"> </span>' : '<span class="ch" style="--i:' + k + '">' + t.charAt(k) + "</span>";
    return out;
  }
  var el = document.createElement("div");
  el.id = "cl-loader";
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  el.setAttribute("aria-label", "Memuat Clover Safety");
  var leaves = "";
  for (var i = 0; i < 14; i++) {
    var s = 14 + ((i * 7) % 20);
    leaves +=
      '<span class="leaf" style="--x:' + ((i * 37 + 8) % 96) + "%;--s:" + s + "px;--d:" + (7 + (i % 5) * 1.6) + "s;--t:" + ((i * 0.7) % 6) + 's">' + CLOVER + "</span>";
  }
  el.innerHTML =
    '<div class="rays"></div><div class="vignette"></div>' +
    leaves +
    '<div class="top"><span>🍀 Clover Safety</span><span class="actions"><button type="button" class="snd" aria-pressed="true" aria-label="Suara menyala">🔊</button><button type="button" class="skip">Lewati ›</button></span></div>' +
    '<div class="stage">' +
    '<div class="emblem"><img src="/img/clover-shield.svg" alt="" width="260" height="300" /></div>' +
    '<h1 class="title" aria-label="Clover Safety">' + letters("Clover Safety") + "</h1>" +
    '<p class="sub">Edukasi &amp; perlindungan digital</p>' +
    '<p class="hello"><strong class="h1t"></strong><span class="h2t"></span></p>' +
    "</div>" +
    '<div class="bottom"><p class="tip"></p>' +
    '<div class="meter"><div class="bar"><div class="fill"></div></div><div class="pct">0%</div></div>' +
    '<p class="state">Memuat…</p></div>';
  root.classList.add("cl-loading");
  root.appendChild(el);

  var fill = el.querySelector(".fill");
  var pct = el.querySelector(".pct");
  var state = el.querySelector(".state");
  var tip = el.querySelector(".tip");
  var skip = el.querySelector(".skip");
  var snd = el.querySelector(".snd");
  var hint = document.createElement("p");
  hint.className = "sound-hint";
  hint.textContent = "🔊 Ketuk layar untuk mendengar sapaan";
  hint.hidden = true;
  el.querySelector(".bottom").appendChild(hint);
  var shown = 0;
  var target = 0;
  var loaded = false;
  var closed = false;
  var t0 = Date.now();
  var MIN = 7200;

  function paint(v) {
    var n = Math.min(100, Math.round(v));
    fill.style.width = v + "%";
    pct.textContent = n + "%";
    state.textContent =
      n >= 100 ? "Siap!" : n > 80 ? "Hampir selesai…" : n > 55 ? "Menyiapkan materi…" : n > 25 ? "Memuat tampilan…" : "Menyapa kamu…";
  }
  var ti = 0;
  function showTip() {
    tip.classList.add("swap");
    setTimeout(function () {
      tip.textContent = "💡 " + TIPS[ti++ % TIPS.length];
      tip.classList.remove("swap");
    }, 300);
  }
  showTip();

  /* ---------- Suara: sapaan (Web Speech) + denting (Web Audio). Browser menahan suara sebelum ada ketukan,
     jadi bila terblokir, suara diputar pada ketukan/tombol pertama. ---------- */
  var muted = false;
  try {
    muted = localStorage.getItem("clover_sound") === "off";
  } catch (e) {
    /* abaikan */
  }
  var played = false;
  var actx = null;
  var synth = window.speechSynthesis;
  function setMuted(m) {
    muted = m;
    snd.textContent = m ? "🔇" : "🔊";
    snd.setAttribute("aria-pressed", String(!m));
    snd.setAttribute("aria-label", m ? "Suara mati" : "Suara menyala");
    try {
      localStorage.setItem("clover_sound", m ? "off" : "on");
    } catch (e) {
      /* abaikan */
    }
    if (m && synth) synth.cancel();
  }
  setMuted(muted);
  function audio() {
    try {
      if (!actx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) actx = new AC();
      }
      if (actx && actx.state === "suspended") actx.resume();
    } catch (e) {
      actx = null;
    }
    return actx;
  }
  function note(freq, at, dur, vol) {
    var c = actx;
    var o = c.createOscillator();
    var g = c.createGain();
    o.type = "sine";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime + at);
    g.gain.exponentialRampToValueAtTime(vol, c.currentTime + at + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + at + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(c.currentTime + at);
    o.stop(c.currentTime + at + dur + 0.05);
  }
  function chime(final) {
    if (muted || !audio()) return;
    var seq = final ? [784, 988, 1319] : [523, 659, 784, 1047];
    for (var n = 0; n < seq.length; n++) note(seq[n], n * 0.13, final ? 0.7 : 0.55, 0.12);
  }
  function pickVoice(lang) {
    var vs = (synth && synth.getVoices()) || [];
    var pre = lang.slice(0, 2);
    var best = null;
    for (var v = 0; v < vs.length; v++) {
      if (vs[v].lang.toLowerCase().indexOf(pre) !== 0) continue;
      if (/female|google|natural|zira|samantha|aria|jenny/i.test(vs[v].name)) return vs[v];
      best = best || vs[v];
    }
    return best;
  }
  function say(text, lang, done) {
    var u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = 0.92;
    u.pitch = 1.15;
    u.volume = 1;
    var voice = pickVoice(lang);
    if (voice) u.voice = voice;
    u.onend = u.onerror = done || function () {};
    synth.speak(u);
  }
  function speak() {
    if (played || muted || closed) return;
    played = true;
    hint.hidden = true;
    chime(false);
    if (!synth || typeof SpeechSynthesisUtterance === "undefined") return;
    try {
      synth.cancel();
      setTimeout(function () {
        if (closed || muted) return;
        say("Welcome to Clover Safety!", "en-US", function () {
          if (closed || muted) return;
          say("Hai, aku Clover Safety. Aku akan menemanimu belajar.", "id-ID");
        });
      }, 450);
    } catch (e) {
      /* suara tidak tersedia */
    }
  }
  function unlock() {
    if (!played && !muted) speak();
  }
  /* coba langsung; bila browser memblokir (belum ada ketukan), tunggu ketukan pertama */
  var gestureEvents = ["pointerdown", "keydown", "touchstart"];
  function onGesture(ev) {
    if (ev.target && ev.target.closest && ev.target.closest(".snd")) return;
    unlock();
    gestureEvents.forEach(function (n) {
      document.removeEventListener(n, onGesture, true);
    });
  }
  gestureEvents.forEach(function (n) {
    document.addEventListener(n, onGesture, true);
  });
  var activation = navigator.userActivation;
  if (activation && activation.hasBeenActive) speak();
  else
    setTimeout(function () {
      if (!played && !muted && !closed) hint.hidden = false;
    }, 700);
  if (synth && synth.addEventListener) synth.addEventListener("voiceschanged", function () {});
  snd.addEventListener("click", function () {
    setMuted(!muted);
    if (!muted) {
      played = false;
      speak();
    }
  });

  /* ---------- Teks sapaan diketik pelan-pelan ---------- */
  var HELLO1 = "Hai, perkenalkan aku Clover Safety! 🍀 ";
  var HELLO2 = "Aku teman yang akan selalu menemanimu. Kamu berharga, kamu layak dihormati, dan kamu berhak mendapatkan perlindungan.";
  var h1t = el.querySelector(".h1t");
  var h2t = el.querySelector(".h2t");
  var typed = 0;
  var typer = setInterval(function () {
    typed++;
    if (typed <= HELLO1.length) h1t.textContent = HELLO1.slice(0, typed);
    else h2t.textContent = HELLO2.slice(0, typed - HELLO1.length);
    if (typed >= HELLO1.length + HELLO2.length) clearInterval(typer);
  }, 24);
  var tipTimer = setInterval(showTip, 2200);

  function close() {
    if (closed) return;
    closed = true;
    clearInterval(tipTimer);
    clearInterval(tick);
    clearInterval(typer);
    paint(100);
    if (played && !muted && loaded) chime(true);
    if (synth) try { synth.cancel(); } catch (e) { /* abaikan */ }
    setTimeout(function () {
      el.classList.add("out");
      root.classList.remove("cl-loading");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 700);
    }, 280);
  }
  var tick = setInterval(function () {
    var elapsed = Date.now() - t0;
    // naik bertahap (ease-in-out) sampai 92%; sisanya menunggu halaman benar-benar siap
    var x = Math.min(1, elapsed / MIN);
    target = 92 * (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    shown += (target - shown) * 0.12;
    if (loaded && elapsed >= MIN) {
      shown = 100;
      return close();
    }
    paint(shown);
    if (elapsed > 1200) skip.classList.add("show");
    if (elapsed > 12000) close();
  }, 50);
  function ready() {
    loaded = true;
  }
  if (document.readyState === "complete") ready();
  else window.addEventListener("load", ready);
  skip.addEventListener("click", close);
})();
