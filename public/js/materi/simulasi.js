"use strict";
/* Simulasi chat: data skenario dan tampilannya. */

/* ---------- Simulasi chat ---------- */
const SIMS = [
  {
    judul: "Teman baru di game",
    start: "a",
    nodes: {
      a: {
        them: ["Hai! Skill-mu keren banget 😎 Mau kukirimi skin langka?", "Gratis kok."],
        ch: [
          {
            t: "Boleh, makasih!",
            n: "b",
            tone: "hati",
            fb: "Wajar tertarik. Tapi hadiah dari orang yang baru kenal perlu diwaspadai. Perhatikan apa yang diminta setelahnya.",
          },
          {
            t: "Nggak usah, aku nggak terima hadiah dari orang yang baru kenal.",
            n: "ok1",
            tone: "aman",
            fb: "Menolak sejak awal adalah langkah yang kuat.",
          },
        ],
      },
      b: {
        them: [
          "Sama-sama! Pindah chat ke aplikasi lain yuk. Jangan bilang siapa-siapa ya, nanti diganggu orang.",
          "Kirim fotomu dong, biar aku yakin kamu asli.",
        ],
        ch: [
          {
            t: "Kirim foto biar dia senang.",
            n: "warn",
            tone: "hati",
            fb: "Hadiah bukan utang. Foto yang sudah terkirim sulit dikendalikan, dan permintaan biasanya bertambah.",
          },
          {
            t: "Aku nggak mau. Kenapa harus dirahasiakan?",
            n: "c",
            tone: "aman",
            fb: "Pertanyaan bagus. Permintaan merahasiakan adalah tanda bahaya.",
          },
          {
            t: "Aku mau tunjukkan chat ini ke guru BK.",
            n: "ok2",
            tone: "aman",
            fb: "Langkah yang sangat baik. Kamu tidak perlu menghadapinya sendirian.",
          },
        ],
      },
      c: {
        them: ["Kamu tega? Aku udah kasih hadiah. Kalau kamu nggak mau, aku marah ya."],
        ch: [
          {
            t: "Berhenti membalas, blokir, simpan tangkapan layar, lalu cerita ke orang dewasa tepercaya.",
            n: "ok2",
            tone: "aman",
            fb: "Tekanan seperti ini bukan tanda orang yang menghargaimu. Kamu tidak perlu berdebat.",
          },
          {
            t: "Menurutinya supaya dia tidak marah.",
            n: "warn",
            tone: "hati",
            fb: "Rasa takut itu wajar, tetapi menuruti tekanan biasanya membuat tuntutan bertambah.",
          },
        ],
      },
      ok1: {
        end: "aman",
        title: "Kamu menjaga dirimu",
        text: "Kamu boleh menolak sejak awal. Jika orang itu terus mendekat, blokir dan ceritakan kepada orang dewasa tepercaya.",
      },
      ok2: {
        end: "aman",
        title: "Kamu mengambil langkah melindungi diri",
        text: "Menghentikan percakapan dan melibatkan orang dewasa tepercaya adalah cara yang tepat. Simpan bukti pesan, jangan sebarkan.",
      },
      warn: {
        end: "hati",
        title: "Mari pikirkan lagi bersama",
        text: "Kalau kamu sudah terlanjur menuruti, itu bukan salahmu. Yang bersalah adalah pihak yang menekan. Kamu tetap bisa meminta bantuan guru BK atau orang dewasa tepercaya kapan saja.",
      },
    },
  },
  {
    judul: "“Kakak kelas” baru",
    start: "a",
    nodes: {
      a: {
        them: ["Hai, aku kakak kelas dari sekolah sebelah. Boleh minta nomor HP dan alamat sekolahmu?"],
        ch: [
          {
            t: "Kirim saja, kayaknya dia baik.",
            n: "warn",
            tone: "hati",
            fb: "Perhatian bisa tulus, tetapi nomor dan lokasi adalah informasi pribadi yang tidak wajib kamu bagikan.",
          },
          {
            t: "Aku belum kenal kamu, jadi nggak kasih info pribadi.",
            n: "b",
            tone: "aman",
            fb: "Tegas dan sopan. Menolak adalah hakmu.",
          },
        ],
      },
      b: {
        them: ["Ih sombong. Ya udah, kalau gitu ketemuan aja di mal, tapi jangan bilang orang tuamu."],
        ch: [
          {
            t: "Setuju, diam-diam saja.",
            n: "warn",
            tone: "hati",
            fb: "Bertemu tanpa sepengetahuan orang dewasa membuat tidak ada yang tahu keberadaanmu.",
          },
          {
            t: "Tidak. Aku akan cerita ke orang tua dan memblokir akun ini.",
            n: "ok",
            tone: "aman",
            fb: "Memblokir dan bercerita melindungimu.",
          },
        ],
      },
      ok: {
        end: "aman",
        title: "Keputusan yang aman",
        text: "Kamu menolak membagikan data, menolak pertemuan rahasia, dan melibatkan orang dewasa.",
      },
      warn: {
        end: "hati",
        title: "Mari pikirkan lagi bersama",
        text: "Data pribadi dan pertemuan rahasia membuat kamu lebih sulit dilindungi. Kamu bisa berhenti kapan saja dan meminta bantuan.",
      },
    },
  },
];
let SIM = { s: 0, node: null, log: [], end: null };
function simEnter(id) {
  const n = SIMS[SIM.s].nodes[id];
  SIM.node = id;
  if (n.end) {
    SIM.end = n;
    return;
  }
  n.them.forEach((t) => SIM.log.push({ k: "them", t }));
}
function simReset() {
  SIM.log = [];
  SIM.end = null;
  simEnter(SIMS[SIM.s].start);
}
function pageSim() {
  if (!SIM.node) simReset();
  return `<h1 tabindex="-1">Simulasi Chat</h1>
  <p class="lead">Latihan membalas pesan di lingkungan yang aman. Pilih balasanmu, lihat penjelasannya, dan coba jalur lain kapan saja. Tidak ada nilai.</p><div id="sim-root"></div>`;
}
function paintSim() {
  const root = $("#sim-root");
  if (!root) return;
  const n = SIMS[SIM.s].nodes[SIM.node];
  root.innerHTML = `<div class="tabs" role="group" aria-label="Pilih simulasi">${SIMS.map((x, i) => `<button type="button" class="tab" data-x="sim-tab" data-i="${i}" aria-pressed="${i === SIM.s}">${esc(x.judul)}</button>`).join("")}</div>
  <div class="card"><div class="chat" role="log" aria-live="polite">${SIM.log.map((m) => (m.k === "fb" ? `<div class="fb ${m.tone}"><p style="margin:0">${esc(m.t)}</p></div>` : `<div class="bub ${m.k}"><span class="sr-only">${m.k === "me" ? "Kamu" : "Dia"}: </span>${esc(m.t)}</div>`)).join("")}</div>
  ${
    SIM.end
      ? `<div class="callout ${SIM.end.end === "aman" ? "hijau" : "kuning"}"><p><strong>${esc(SIM.end.title)}</strong></p><p>${esc(SIM.end.text)}</p></div><div class="btn-row"><button type="button" class="btn btn-primary" data-x="sim-reset">Coba jalur lain</button>${routeBtn("#/bantuan", "Meminta Bantuan", "btn btn-pink")}</div>`
      : `<p class="hint">Apa balasanmu?</p><div role="group" aria-label="Pilihan balasan">${n.ch.map((c, i) => `<button type="button" class="opt" data-x="sim-pick" data-i="${i}">${esc(c.t)}</button>`).join("")}</div>`
  }</div>`;
}
