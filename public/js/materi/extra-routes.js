"use strict";
/* Mendaftarkan rute tambahan (kartu latihan kini ada di pageHome). */

/* ---------- Rute & beranda ---------- */
ROUTES["/simulasi"] = { t: "Simulasi Chat", nav: "Simulasi Chat", r: pageSim, a: paintSim };
ROUTES["/kuis"] = { t: "Kuis Latihan", nav: "Kuis", r: pageQuiz, a: paintQuiz };
ROUTES["/kamus"] = { t: "Kamus Istilah", nav: "Kamus", r: pageTerms };
ROUTES["/tampilan"] = { t: "Tampilan dan Aksesibilitas", r: pageSettings };
