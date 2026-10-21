"use strict";
/* Kamus istilah digital dengan pencarian. */

/* ---------- Kamus istilah ---------- */
const TERMS = [
  [
    "Grooming",
    "Proses ketika seseorang mendekati, membangun kepercayaan, lalu memanipulasi anak atau remaja agar mau melakukan hal yang tidak pantas atau merahasiakannya.",
  ],
  [
    "Akun palsu (catfishing)",
    "Akun yang memakai identitas atau foto orang lain. Seseorang di internet belum tentu sama dengan yang ia akui.",
  ],
  [
    "Pemerasan foto (sextortion)",
    "Ancaman menyebarkan foto atau video pribadi untuk memaksa seseorang menuruti permintaan. Yang bersalah adalah pengancam, bukan korban. Simpan bukti dan segera minta bantuan.",
  ],
  ["OTP", "Kode sekali pakai untuk masuk atau memverifikasi akun. Jangan berikan kepada siapa pun."],
  [
    "Phishing",
    "Pesan atau tautan palsu yang memancing kamu menyerahkan kata sandi atau data. Jangan klik tautan dari pengirim yang tidak kamu kenal.",
  ],
  ["Doxing", "Menyebarkan data pribadi seseorang (alamat, sekolah, nomor telepon) tanpa izin."],
  [
    "Perundungan siber",
    "Menyakiti, mengejek, atau mengancam seseorang lewat media digital. Kamu boleh melapor dan meminta bantuan.",
  ],
  [
    "Jejak digital",
    "Semua yang pernah diunggah atau dikirim secara daring. Sesuatu yang sudah terkirim sulit ditarik kembali.",
  ],
  [
    "Verifikasi dua langkah",
    "Lapisan keamanan tambahan saat masuk ke akun, misalnya kode di ponsel. Aktifkan jika tersedia.",
  ],
  ["Blokir dan lapor", "Fitur di aplikasi dan game untuk menghentikan kontak dan melaporkan akun bermasalah."],
  [
    "Orang dewasa tepercaya",
    "Orang dewasa yang mendengarkan tanpa menyalahkan, misalnya orang tua, wali, wali kelas, atau guru BK.",
  ],
];
function pageTerms() {
  return `<h1 tabindex="-1">Kamus Istilah</h1><p class="lead">Arti istilah yang sering muncul saat bermain dan berselancar di internet.</p>
  <label class="lbl" for="term-q">Cari istilah</label><input id="term-q" type="text" autocomplete="off" placeholder="mis. OTP"><p class="hint" id="term-n" role="status" aria-live="polite"></p>
  <div id="terms">${TERMS.map(([a, b]) => `<details data-s="${esc((a + " " + b).toLowerCase())}"><summary>${esc(a)}</summary><div class="dbody"><p>${esc(b)}</p></div></details>`).join("")}</div>`;
}
