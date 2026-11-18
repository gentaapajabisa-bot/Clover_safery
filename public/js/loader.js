/* Loading screen video bunga mekar.
   Tampil sekali per sesi tab (ubah ONCE_PER_SESSION ke false untuk tampil di setiap halaman). */
(function () {
  var ONCE_PER_SESSION = true;
  var MIN_MS = 2600; // durasi minimal tampil
  var MAX_MS = 7000; // batas maksimal, jaga-jaga jika load lama
  try {
    if (ONCE_PER_SESSION && sessionStorage.getItem("cs-loaded")) return;
    sessionStorage.setItem("cs-loaded", "1");
  } catch (e) {}

  var el = document.createElement("div");
  el.id = "cs-loader";
  el.setAttribute("role", "status");
  el.setAttribute("aria-label", "Memuat Clover Safery");
  el.innerHTML =
    '<video muted playsinline autoplay preload="auto" poster="/media/bloom-poster.jpg">' +
    '<source src="/media/bloom.mp4" type="video/mp4" /></video>' +
    '<div class="cs-loader-shade"></div>' +
    '<div class="cs-loader-text">CLOVER SAFERY<small>Memuat ruang digital yang lebih aman…</small></div>';
  document.documentElement.appendChild(el);
  document.documentElement.style.overflow = "hidden";

  var v = el.querySelector("video");
  v.muted = true;
  var p = v.play();
  if (p && p.catch) p.catch(function () {});

  var start = Date.now();
  var done = false;
  function hide() {
    if (done) return;
    done = true;
    el.classList.add("cs-hide");
    document.documentElement.style.overflow = "";
    setTimeout(function () {
      el.remove();
    }, 700);
  }
  function ready() {
    setTimeout(hide, Math.max(0, MIN_MS - (Date.now() - start)));
  }
  if (document.readyState === "complete") ready();
  else window.addEventListener("load", ready);
  setTimeout(hide, MAX_MS);
})();
