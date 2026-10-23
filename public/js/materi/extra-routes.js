"use strict";
/* Mendaftarkan rute tambahan (kartu latihan kini ada di pageHome). */

/* ---------- Rute & beranda ---------- */
ROUTES["/simulasi"] = { t: "Simulasi Chat", nav: "Simulasi Chat", r: pageSim, a: paintSim };
ROUTES["/kuis"] = { t: "Kuis Latihan", nav: "Kuis", r: pageQuiz, a: paintQuiz };
ROUTES["/glosarium"] = { t: "Glosarium", nav: "Glosarium", r: pageTerms };
ROUTES["/kamus"] = { t: "Glosarium", r: pageTerms }; // alias agar tautan lama tetap bisa dibuka
ROUTES["/tampilan"] = { t: "Tampilan dan Aksesibilitas", r: pageSettings };
