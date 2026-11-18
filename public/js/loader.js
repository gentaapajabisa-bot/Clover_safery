/* Loading screen video bunga mekar.
   Tidak tampil otomatis: dipanggil dari form login/daftar setelah tombol ditekan.
   API: csLoader.show() dan csLoader.hide(). */
(function () {
  var el, video;

  function build() {
    if (el) return;
    el = document.createElement("div");
    el.id = "cs-loader";
    el.className = "cs-hide";
    el.setAttribute("role", "status");
    el.setAttribute("aria-label", "Memuat Clover Safery");
    el.innerHTML =
      '<video muted playsinline preload="auto" poster="/media/bloom-poster.jpg">' +
      '<source src="/media/bloom.mp4" type="video/mp4" /></video>' +
      '<div class="cs-loader-shade"></div>' +
      '<div class="cs-loader-text">CLOVER SAFERY<small>Memuat ruang digital yang lebih aman…</small></div>';
    document.body.appendChild(el);
    video = el.querySelector("video");
    video.muted = true;
  }

  window.csLoader = {
    show: function () {
      build();
      try {
        video.currentTime = 0;
      } catch (e) {}
      el.classList.remove("cs-hide");
      document.documentElement.style.overflow = "hidden";
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    },
    hide: function () {
      if (!el) return;
      el.classList.add("cs-hide");
      document.documentElement.style.overflow = "";
      video.pause();
    },
  };

  // Siapkan (preload) video begitu halaman siap, supaya langsung jalan saat tombol ditekan.
  document.addEventListener("DOMContentLoaded", build);
})();
