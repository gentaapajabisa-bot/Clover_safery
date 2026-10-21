"use strict";
/* Konfigurasi, utilitas ($, esc, LS/SS) dan toast. */

/* =========================================================
   KONFIGURASI — ubah sebelum dipakai di sekolah
   ========================================================= */
const GURU_CODE = "BK-Clover Safety-2026"; // kode pendaftaran akun Guru BK (GANTI!). Ini bukan keamanan sungguhan; lihat halaman Tentang.
const OFFICIAL_URL = "https://laporsapa129.kemenpppa.go.id/";
const MAX_FAIL = 5,
  LOCK_MS = 30000;

/* =========================================================
   Utilitas
   ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );
const mem = {};
const LS = {
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch {
      return mem[k] ?? null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch {
      mem[k] = v;
    }
  },
};
const SS = {
  get(k) {
    try {
      return sessionStorage.getItem(k);
    } catch {
      return mem["s_" + k] ?? null;
    }
  },
  set(k, v) {
    try {
      sessionStorage.setItem(k, v);
    } catch {
      mem["s_" + k] = v;
    }
  },
  del(k) {
    try {
      sessionStorage.removeItem(k);
    } catch {
      delete mem["s_" + k];
    }
  },
};
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    t.hidden = true;
  }, 4500);
}
