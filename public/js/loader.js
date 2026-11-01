/* Loading screen Clover Safety (suara sambutan bahasa Inggris + musik latar): tampil sekali per sesi browser.
   Di halaman awal, loading screen jalan saat pengguna menekan Masuk / Buat akun, sehingga suara dan musik
   langsung bisa diputar (sentuhan itulah yang diizinkan browser). Halaman bantuan darurat tidak pernah ditahan. */
(function () {
  "use strict";
  var KEY = "clover_loader_seen";
  var root = document.documentElement;
  function seen() {
    try {
      return !!sessionStorage.getItem(KEY);
    } catch (e) {
      return false;
    }
  }
  function mark() {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch (e) {
      /* tanpa sessionStorage: tampilkan sekali di halaman ini saja */
    }
  }

  function start(afterClose) {
  var TIPS = [
    "It is okay to say “no” calmly.",
    "A secret that scares you does not have to be kept.",
    "A gift never means you owe anything.",
    "You are not alone. A trusted adult is always there.",
    "Need help? SAPA 129 is ready to listen.",
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
  el.setAttribute("aria-label", "Loading Clover Safety");
  var leaves = "";
  for (var i = 0; i < 14; i++) {
    var s = 14 + ((i * 7) % 20);
    leaves +=
      '<span class="leaf" style="--x:' + ((i * 37 + 8) % 96) + "%;--s:" + s + "px;--d:" + (7 + (i % 5) * 1.6) + "s;--t:" + ((i * 0.7) % 6) + 's">' + CLOVER + "</span>";
  }
  el.innerHTML =
    '<div class="rays"></div><div class="vignette"></div>' +
    leaves +
    '<div class="top"><span>🍀 Clover Safety</span><span class="actions"><button type="button" class="snd" aria-pressed="true" aria-label="Sound on">🔊</button><button type="button" class="skip">Skip ›</button></span></div>' +
    '<div class="stage">' +
    '<div class="emblem"><img src="/img/clover-shield.svg" alt="" width="260" height="300" /></div>' +
    '<h1 class="title" aria-label="Clover Safety">' + letters("Clover Safety") + "</h1>" +
    '<p class="sub">Digital education &amp; protection</p>' +
    '<p class="hello"><strong class="h1t"></strong><span class="h2t"></span></p>' +
    "</div>" +
    '<div class="bottom"><p class="tip"></p>' +
    '<div class="meter"><div class="bar"><div class="fill"></div></div><div class="pct">0%</div></div>' +
    '<p class="state">Loading…</p></div>';
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
  hint.textContent = "🔊 Tap the screen for sound & music";
  hint.hidden = true;
  el.querySelector(".bottom").appendChild(hint);
  var shown = 0;
  var target = 0;
  var loaded = false;
  var closed = false;
  var t0 = Date.now();
  var MIN = 14000;

  function paint(v) {
    var n = Math.min(100, Math.round(v));
    fill.style.width = v + "%";
    pct.textContent = n + "%";
    state.textContent =
      n >= 100 ? "Ready!" : n > 80 ? "Almost there…" : n > 55 ? "Preparing your lessons…" : n > 25 ? "Loading the experience…" : "Saying hello…";
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
  var MUSIC_VOL = 0.34;
  var music = null;
  var musicOn = false;
  try {
    music = new Audio("/audio/clover-theme.mp3");
    music.loop = true;
    music.preload = "auto";
    music.volume = 0;
  } catch (e) {
    music = null;
  }
  var fadeTimer = null;
  function fadeTo(v, ms, then) {
    if (!music) return;
    clearInterval(fadeTimer);
    var from = music.volume,
      steps = Math.max(1, Math.round(ms / 40)),
      k = 0;
    fadeTimer = setInterval(function () {
      k++;
      music.volume = Math.max(0, Math.min(1, from + ((v - from) * k) / steps));
      if (k >= steps) {
        clearInterval(fadeTimer);
        if (then) then();
      }
    }, 40);
  }
  function duck(on) {
    if (musicOn && !muted) fadeTo(on ? MUSIC_VOL * 0.4 : MUSIC_VOL, 400);
  }
  function startMusic() {
    if (!music || muted || closed || musicOn) return;
    var pr;
    try {
      pr = music.play();
    } catch (e) {
      return;
    }
    if (pr && pr.then)
      pr
        .then(function () {
          musicOn = true;
          if (closed || muted) {
            music.pause();
            return;
          }
          fadeTo(MUSIC_VOL, 2500);
        })
        .catch(function () {
          /* diblokir browser: menunggu ketukan pertama */
        });
  }
  var speaking = false;
  var actx = null;
  var synth = window.speechSynthesis;
  function setMuted(m) {
    muted = m;
    snd.textContent = m ? "🔇" : "🔊";
    snd.setAttribute("aria-pressed", String(!m));
    snd.setAttribute("aria-label", m ? "Sound off" : "Sound on");
    try {
      localStorage.setItem("clover_sound", m ? "off" : "on");
    } catch (e) {
      /* abaikan */
    }
    if (m && synth) synth.cancel();
    if (m && music && musicOn) {
      fadeTo(0, 300, function () {
        music.pause();
        musicOn = false;
      });
    }
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
    u.onstart = function () {
      duck(true);
    };
    u.onend = u.onerror = function () {
      speaking = false;
      duck(false);
      if (done) done();
    };
    speaking = true;
    synth.speak(u);
  }
  function speak() {
    if (played || muted || closed) return;
    played = true;
    hint.hidden = true;
    startMusic();
    chime(false);
    if (!synth || typeof SpeechSynthesisUtterance === "undefined") return;
    try {
      synth.cancel();
      setTimeout(function () {
        if (closed || muted) return;
        say("Welcome to Clover Safety!", "en-US", function () {
          if (closed || muted) return;
          setTimeout(function () {
            if (!closed && !muted) say("Hi, I'm Clover Safety. I'll be with you every step of the way.", "en-US");
          }, 500);
        });
      }, 450);
    } catch (e) {
      /* suara tidak tersedia */
    }
  }
  function unlock() {
    startMusic();
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
  else {
    startMusic(); // sebagian browser mengizinkan musik otomatis
    setTimeout(function () {
      if (!played && !muted && !closed) hint.hidden = false;
    }, 700);
  }
  if (synth && synth.addEventListener) synth.addEventListener("voiceschanged", function () {});
  snd.addEventListener("click", function () {
    setMuted(!muted);
    if (!muted) {
      played = false;
      speak();
    }
  });

  /* ---------- Teks sapaan diketik pelan-pelan ---------- */
  var HELLO1 = "Hi, I’m Clover Safety! 🍀 ";
  var HELLO2 = "I’m a friend who will always be with you. You matter, you deserve respect, and you deserve protection.";
  var h1t = el.querySelector(".h1t");
  var h2t = el.querySelector(".h2t");
  var typed = 0;
  var typer = setInterval(function () {
    typed++;
    if (typed <= HELLO1.length) h1t.textContent = HELLO1.slice(0, typed);
    else h2t.textContent = HELLO2.slice(0, typed - HELLO1.length);
    if (typed >= HELLO1.length + HELLO2.length) clearInterval(typer);
  }, 42);
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
    if (music && musicOn)
      fadeTo(0, 900, function () {
        music.pause();
      });
    else if (music) music.pause();
    setTimeout(function () {
      el.classList.add("out");
      root.classList.remove("cl-loading");
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
        if (afterClose) afterClose();
      }, 700);
    }, 280);
  }
  var tick = setInterval(function () {
    var elapsed = Date.now() - t0;
    // naik bertahap (ease-in-out) sampai 92%; sisanya menunggu halaman benar-benar siap
    var x = Math.min(1, elapsed / MIN);
    target = 92 * (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
    shown += (target - shown) * 0.12;
    if (loaded && elapsed >= MIN && !(speaking && elapsed < 22000)) {
      shown = 100;
      return close();
    }
    paint(shown);
    if (elapsed > 1200) skip.classList.add("show");
    if (elapsed > 26000) close();
  }, 50);
  function ready() {
    loaded = true;
  }
  if (document.readyState === "complete") ready();
  else window.addEventListener("load", ready);
  skip.addEventListener("click", close);
  }

  var landing = /^\/(index(\.html)?)?$/.test(location.pathname);
  if (landing) {
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== "_self") return;
      var path;
      try {
        path = new URL(a.href, location.href).pathname;
      } catch (err) {
        return;
      }
      if ((path !== "/login" && path !== "/register") || seen()) return;
      e.preventDefault();
      mark();
      var dest = a.href;
      start(function () {
        location.href = dest;
      });
    });
  } else if (!seen() && !/#\/(bantuan|tentang)/.test(location.hash)) {
    mark();
    start();
  }
})();
