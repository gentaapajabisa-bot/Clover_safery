"use strict";
/* Mendaftarkan rute tambahan dan kartu latihan di beranda. */

/* ---------- Rute & beranda ---------- */
ROUTES["/simulasi"] = { t: "Simulasi Chat", nav: "Simulasi Chat", r: pageSim, a: paintSim };
ROUTES["/kuis"] = { t: "Kuis Latihan", nav: "Kuis Latihan", r: pageQuiz, a: paintQuiz };
ROUTES["/kamus"] = { t: "Kamus Istilah", nav: "Kamus Istilah", r: pageTerms };
ROUTES["/tampilan"] = { t: "Tampilan dan Aksesibilitas", r: pageSettings };
const home0 = ROUTES["/"].r;
ROUTES["/"].r = () =>
  home0() +
  `<h2 style="margin-top:24px">Latihan tambahan</h2><div class="grid g3">
  <a class="card" href="#/simulasi" style="text-decoration:none;color:inherit"><span class="ico" aria-hidden="true">💬</span><strong>Simulasi chat</strong><p class="hint">Latihan membalas pesan yang membuat tidak nyaman.</p></a>
  <a class="card" href="#/kuis" style="text-decoration:none;color:inherit"><span class="ico" aria-hidden="true">📝</span><strong>Kuis latihan</strong><p class="hint">Uji ingatan tanpa nilai.</p></a>
  <a class="card" href="#/kamus" style="text-decoration:none;color:inherit"><span class="ico" aria-hidden="true">📖</span><strong>Kamus istilah</strong><p class="hint">Arti istilah di dunia digital.</p></a></div>`;
