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
    '<div class="top"><span>🍀 Clover Safety</span><button type="button" class="skip">Lewati ›</button></div>' +
    '<div class="stage">' +
    '<div class="emblem"><img src="/img/clover-shield.svg" alt="" width="260" height="300" /></div>' +
    '<h1 class="title">Clover Safety</h1>' +
    '<p class="sub">Edukasi &amp; perlindungan digital</p>' +
    '<p class="hello"><strong>Hai, perkenalkan aku Clover Safety!</strong> 🍀 Aku teman yang akan selalu menemanimu.</p>' +
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
  var shown = 0;
  var target = 0;
  var loaded = false;
  var closed = false;
  var t0 = Date.now();
  var MIN = 2600;

  function paint(v) {
    var n = Math.min(100, Math.round(v));
    fill.style.width = v + "%";
    pct.textContent = n + "%";
    state.textContent = n >= 100 ? "Siap!" : n > 70 ? "Menyiapkan materi…" : n > 35 ? "Memuat tampilan…" : "Memuat…";
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
  var tipTimer = setInterval(showTip, 2200);

  function close() {
    if (closed) return;
    closed = true;
    clearInterval(tipTimer);
    clearInterval(tick);
    paint(100);
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
    // naik mulus sampai 92% menurut waktu; sisanya menunggu halaman benar-benar siap
    target = Math.min(92, (elapsed / MIN) * 92);
    shown += (target - shown) * 0.18;
    if (loaded && elapsed >= MIN) {
      shown = 100;
      return close();
    }
    paint(shown);
    if (elapsed > 1200) skip.classList.add("show");
    if (elapsed > 7000) close();
  }, 50);
  function ready() {
    loaded = true;
  }
  if (document.readyState === "complete") ready();
  else window.addEventListener("load", ready);
  skip.addEventListener("click", close);
})();
