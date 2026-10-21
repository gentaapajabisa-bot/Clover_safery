"use strict";
/* Kuis latihan: soal dan tampilannya. */

/* ---------- Kuis latihan ---------- */
const QUIZ = [
  [
    "Seseorang yang baru kamu kenal di game memberi hadiah lalu meminta fotomu. Sikap paling aman?",
    [
      "Mengirim foto sebagai balasan",
      "Menolak, berhenti membalas, dan cerita ke orang dewasa tepercaya",
      "Mengirim foto lalu minta dihapus",
    ],
    1,
    "Hadiah bukan utang. Foto yang terkirim sulit dikendalikan.",
  ],
  [
    "Permintaan “ini rahasia kita ya” paling perlu diwaspadai jika…",
    ["membahas kejutan ulang tahun teman", "tentang hobi bersama", "membuatmu takut atau tidak nyaman"],
    2,
    "Rahasia yang membuat takut tidak perlu dijaga.",
  ],
  [
    "Ada yang mengaku petugas dan meminta kode OTP-mu. Sebaiknya…",
    ["Memberikannya supaya cepat selesai", "Tidak memberikannya kepada siapa pun", "Memberikan setengahnya"],
    1,
    "Pihak yang sah tidak akan meminta kode OTP.",
  ],
  [
    "Kamu sudah terlanjur mengirim sesuatu lalu diancam. Siapa yang bersalah?",
    ["Orang yang mengancam", "Kamu", "Kalian berdua"],
    0,
    "Yang bersalah adalah pihak yang menekan. Kamu tetap bisa dibantu.",
  ],
  [
    "Pesan yang meresahkan sebaiknya…",
    [
      "dihapus agar tidak ketahuan",
      "disimpan aman dan ditunjukkan kepada orang dewasa tepercaya",
      "disebarkan ke grup kelas",
    ],
    1,
    "Bukti membantu orang dewasa menolongmu. Jangan disebarkan.",
  ],
  [
    "Kenalan online mengajak bertemu langsung. Langkah terbaik?",
    [
      "Bercerita dulu kepada orang dewasa tepercaya sebelum memutuskan",
      "Datang diam-diam",
      "Datang bersama teman tanpa memberi tahu orang dewasa",
    ],
    0,
    "Orang dewasa membantu menilai situasi dan melindungimu.",
  ],
  [
    "Mana yang BUKAN tanda bahaya?",
    ["Menjauhkanmu dari keluarga", "Menuntut imbalan setelah memberi hadiah", "Menerima penolakanmu dengan sopan"],
    2,
    "Orang yang menghargaimu menerima penolakanmu.",
  ],
  [
    "Layanan resmi pengaduan kekerasan terhadap anak yang disebut di Clover Safety adalah…",
    ["Grup chat kelas", "SAPA 129", "Kolom komentar publik"],
    1,
    "SAPA 129 (Kementerian PPPA). Bahaya langsung: hubungi 112.",
  ],
];
let Q = { i: 0, sel: null, ok: 0, log: [], saved: false };
function pageQuiz() {
  return `<h1 tabindex="-1">Kuis Latihan</h1><p class="lead">${QUIZ.length} pertanyaan singkat untuk mengingat materi. Setelah menjawab, kamu langsung melihat penjelasannya. Ini bukan ujian. Jika sudah masuk, hasilmu disimpan di Riwayat dan hanya bisa dilihat olehmu.</p><div id="quiz-root"></div>`;
}
function paintQuiz() {
  const root = $("#quiz-root");
  if (!root) return;
  if (Q.i >= QUIZ.length) {
    root.innerHTML = `<div class="callout hijau"><p><strong>Kuis selesai.</strong> Kamu memilih jawaban yang sesuai saran keselamatan ${Q.ok} dari ${QUIZ.length}. Ini bukan nilai. Ulangi kapan saja, atau baca lagi materinya.</p></div><p class="hint" id="quiz-save" role="status"></p><div class="btn-row"><button type="button" class="btn btn-primary" data-x="quiz-reset">Ulangi kuis</button>${routeBtn("#/tanda-bahaya", "Baca materi", "btn")}${routeBtn("#/bantuan", "Meminta Bantuan", "btn btn-pink")}</div>`;
    return;
  }
  const [q, opts, ans, ex] = QUIZ[Q.i],
    done = Q.sel !== null;
  root.innerHTML = `<div class="card"><p class="qprog">Pertanyaan ${Q.i + 1} dari ${QUIZ.length}</p><h2 style="font-size:1.2rem">${esc(q)}</h2>
  <div role="group" aria-label="Pilihan jawaban">${opts.map((o, i) => `<button type="button" class="opt" data-x="quiz-pick" data-i="${i}" aria-pressed="${Q.sel === i}" ${done ? "disabled" : ""}>${esc(o)}</button>`).join("")}</div>
  <div role="status" aria-live="polite">${done ? `<div class="fb ${Q.sel === ans ? "aman" : "hati"}"><strong>${Q.sel === ans ? "Sesuai saran keselamatan" : "Mari pikirkan lagi"}</strong><p style="margin:.4em 0 0">${esc(ex)}</p></div><div class="btn-row"><button type="button" class="btn btn-primary" data-x="quiz-next">${Q.i + 1 < QUIZ.length ? "Pertanyaan berikutnya" : "Lihat ringkasan"}</button></div>` : ""}</div></div>`;
}
