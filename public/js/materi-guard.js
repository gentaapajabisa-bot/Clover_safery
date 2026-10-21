/* Penjaga halaman materi (/belajar): materi hanya tampil setelah sesi login terverifikasi.
   Rute bantuan tetap terbuka untuk siapa saja demi keselamatan. */
(function () {
  "use strict";
  var PUBLIC_ROUTES = ["/bantuan", "/tentang"];
  var root = document.documentElement;
  var verified = false;

  function route() {
    return location.hash.replace(/^#/, "") || "/";
  }
  function isPublic() {
    return PUBLIC_ROUTES.indexOf(route()) !== -1;
  }
  function toLogin() {
    location.replace("/login");
  }
  function reveal() {
    root.classList.remove("gating");
  }

  fetch("/api/auth/me", { credentials: "same-origin" })
    .then(function (res) {
      if (!res.ok) throw new Error("session");
      return res.json();
    })
    .then(function (data) {
      verified = !!(data && data.user);
      if (verified || isPublic()) reveal();
      else toLogin();
    })
    .catch(function () {
      if (isPublic()) reveal();
      else toLogin();
    });

  window.addEventListener("hashchange", function () {
    if (!verified && !isPublic()) toLogin();
  });
})();
