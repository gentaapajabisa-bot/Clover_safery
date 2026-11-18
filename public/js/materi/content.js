"use strict";
/* Data konten edukasi: tanda bahaya, privasi, skenario, refleksi, bantuan. */

/* =========================================================
   Data konten
   ========================================================= */
const SIGNS = [
  [
    "🎁",
    "Hadiah atau uang, lalu menuntut imbalan",
    "Seseorang memberi hadiah, pulsa, item game, atau uang, lalu merasa berhak meminta sesuatu yang tidak kamu inginkan. Hadiah yang tulus tidak datang dengan syarat tersembunyi.",
  ],
  [
    "🤫",
    "Meminta percakapan dirahasiakan",
    "Kamu diminta menyembunyikan hubungan atau obrolan dari orang yang kamu percaya, terutama jika hal itu membuatmu takut atau tidak nyaman. Rahasia yang membuat takut bukan rahasia yang harus dijaga.",
  ],
  [
    "📷",
    "Memaksa meminta foto, video, atau data pribadi",
    "Didesak mengirim foto, video, lokasi, nomor telepon, atau informasi akun. Kamu tidak wajib mengirim apa pun, dan menolak adalah hakmu.",
  ],
  [
    "📍",
    "Mengajak bertemu diam-diam",
    "Mengajak bertemu tanpa sepengetahuan orang dewasa yang dapat melindungimu, atau meminta kamu berbohong tentang ke mana kamu pergi.",
  ],
  [
    "⚠️",
    "Menekan, mengancam, atau membuatmu merasa bersalah",
    "Marah, merajuk, mengancam, atau membuatmu merasa jahat ketika kamu menolak. Tekanan seperti ini bukan tanda orang yang menghargaimu.",
  ],
  [
    "🔗",
    "Menjauhkanmu dari keluarga atau teman",
    "Mengatakan bahwa hanya dia yang mengerti kamu, atau membuatmu ragu pada orang-orang yang mendukungmu.",
  ],
];
const CL_SIGNS = [
  "Saya dapat mengenali permintaan yang membuat saya tidak nyaman.",
  "Saya memahami bahwa hadiah tidak membuat seseorang berhak menuntut imbalan.",
  "Saya memahami bahwa permintaan untuk merahasiakan interaksi yang membuat takut dapat menjadi tanda bahaya.",
  "Saya dapat mengenali tekanan, ancaman, atau paksaan.",
  "Saya mengetahui bahwa saya boleh mencari bantuan ketika merasa tidak aman.",
];
const CL_PRIV = [
  "Saya menjaga kata sandi dan kode keamanan akun.",
  "Saya berhati-hati membagikan informasi pribadi di internet.",
  "Saya berhak menolak permintaan yang membuat tidak nyaman.",
  "Saya memahami bahwa hadiah tidak berarti saya harus memenuhi permintaan seseorang.",
  "Saya mengetahui bahwa saya dapat meminta bantuan saat merasa takut atau terancam.",
];
const CL_ACT = [
  "Saya dapat menolak permintaan yang membuat tidak nyaman jika aman.",
  "Saya mengetahui cara menghentikan interaksi berisiko jika aman dilakukan.",
  "Saya mengetahui siapa yang dapat membantu saya.",
  "Saya memahami bahwa keselamatan lebih penting daripada memenuhi permintaan orang lain.",
];
const CL_GURU = [
  "Isi, alur bantuan, dan teks privasi Clover Safery sudah ditinjau bersama pihak yang kompeten dalam perlindungan anak.",
  "Kode pendaftaran Guru BK pada file sudah diganti dan hanya diketahui penanggung jawab.",
  "Nomor dan tautan bantuan (SAPA 129, 112) sudah diperiksa ulang pada sumber resmi.",
  "Sudah ada prosedur tertulis di sekolah jika siswa mengungkapkan pengalaman berisiko (siapa menerima, siapa dilibatkan, kapan orang tua dihubungi, kapan dilaporkan).",
  "Siswa diberi tahu dengan bahasa sederhana bahwa alarm hanya berbunyi di perangkat dan tidak menghubungi siapa pun.",
  "Disepakati bahwa alarm tidak dipakai untuk bercanda, menghukum, atau mempermalukan siswa.",
  "Perangkat sekolah diuji: suara alarm, tombol hentikan, dan tampilan di ponsel.",
];
const CL_TOTAL = { signs: CL_SIGNS.length, priv: CL_PRIV.length, act: CL_ACT.length, guru: CL_GURU.length };

const MYTHS = [
  [
    "“Kalau sudah menerima hadiah, aku harus membalasnya.”",
    "Tidak. Hadiah tidak membuatmu berutang foto, informasi, atau apa pun yang membuatmu tidak nyaman. Kamu boleh mengembalikan, mengabaikan, atau berhenti menerimanya.",
  ],
  [
    "“Kalau aku sudah terlanjur mengirim sesuatu, aku pasti dimarahi dan tidak bisa dibantu.”",
    "Tidak. Yang bersalah adalah orang yang menekan atau mengancam, bukan kamu. Bantuan tetap bisa diminta kapan saja, dan orang dewasa tepercaya ada untuk membantumu, bukan menyalahkanmu.",
  ],
  [
    "“Orang yang baik dan perhatian padaku pasti tidak berbahaya.”",
    "Perhatian bisa tulus, tetapi kadang dipakai untuk membangun kepercayaan sebelum meminta hal yang tidak pantas. Yang perlu diperhatikan adalah permintaannya: apakah membuatmu tidak nyaman, memintamu merahasiakan, atau menekanmu?",
  ],
  ["“Menolak itu tidak sopan.”", "Menolak dengan tenang itu hakmu. Orang yang menghargaimu akan menerima penolakanmu."],
];
const BOUNDARY = [
  [
    "Kata sandi dan kode keamanan",
    "Sebaiknya tidak dibagikan kepada siapa pun, termasuk teman dekat. Orang yang sah tidak akan meminta kode OTP-mu.",
  ],
  [
    "Alamat rumah dan lokasi saat ini",
    "Sebaiknya hanya diketahui keluarga atau orang dewasa tepercaya. Hati-hati dengan fitur berbagi lokasi di aplikasi dan game.",
  ],
  [
    "Nomor telepon",
    "Bagikan hanya kepada orang yang kamu kenal langsung dan percaya. Kamu boleh menolak jika diminta oleh orang yang baru dikenal.",
  ],
  [
    "Foto atau video pribadi",
    "Kamu tidak wajib mengirimnya kepada siapa pun. Foto yang sudah terkirim sulit dikendalikan lagi.",
  ],
  [
    "Nama sekolah dan jadwal harian",
    "Sebaiknya tidak ditampilkan di profil publik. Informasi ini membuat orang asing mudah menemukan keberadaanmu.",
  ],
];
const BOUNDARY_OPTS = [
  "Tidak kubagikan kepada siapa pun",
  "Hanya keluarga / orang dewasa tepercaya",
  "Teman yang kukenal langsung",
];

const SCN = [
  {
    judul: "Hadiah dalam game",
    q: "Seseorang yang kamu kenal melalui internet memberimu hadiah dalam permainan. Setelah itu, ia meminta foto pribadi dan menyuruhmu merahasiakan permintaan tersebut. Kamu merasa tidak nyaman. Apa yang dapat kamu lakukan?",
    opts: [
      [
        "Mengirim foto karena sudah menerima hadiah.",
        "hati",
        "Banyak orang merasa harus membalas hadiah, dan perasaan itu wajar. Tetapi hadiah bukan utang. Foto yang sudah terkirim sulit dikendalikan dan bisa mengundang permintaan berikutnya. Kalau sudah terlanjur mengirim, itu bukan salahmu, dan kamu tetap bisa meminta bantuan.",
      ],
      [
        "Menolak permintaan jika aman dilakukan.",
        "aman",
        "Menolak adalah hakmu. Cukup singkat dan tegas, tanpa alasan panjang. Jika penolakanmu membuat orang itu marah atau mengancam, jangan berdebat. Hentikan percakapan dan segera cari bantuan.",
      ],
      [
        "Menghentikan percakapan atau memblokir akun jika aman.",
        "aman",
        "Memblokir dan berhenti membalas adalah cara sah untuk melindungi diri. Jika kamu khawatir ia akan bereaksi buruk, ceritakan dulu kepada orang dewasa tepercaya sebelum memutuskan.",
      ],
      [
        "Meminta bantuan guru BK atau orang dewasa tepercaya.",
        "aman",
        "Ini langkah yang sangat baik. Kamu tidak harus menghadapi hal ini sendirian, dan kamu tidak perlu menunggu keadaan menjadi lebih buruk untuk meminta tolong.",
      ],
      [
        "Menyimpan bukti yang relevan secara aman tanpa menyebarkannya.",
        "aman",
        "Tangkapan layar pesan dan nama akun bisa membantu orang dewasa yang menolongmu. Simpan di tempat aman dan jangan kirim ke teman atau media sosial. Jika buktinya berupa foto atau video pribadi, jangan disimpan ulang atau diteruskan; langsung tunjukkan kepada orang dewasa tepercaya.",
      ],
    ],
  },
  {
    judul: "Ajakan bertemu",
    q: "Seorang kenalan online mengajakmu bertemu langsung dan berpesan agar kamu tidak memberi tahu orang tua atau guru. Kamu penasaran, tetapi juga mulai ragu. Apa yang dapat kamu lakukan?",
    opts: [
      [
        "Pergi diam-diam karena penasaran.",
        "hati",
        "Rasa penasaran itu manusiawi. Namun bertemu tanpa sepengetahuan orang dewasa membuat tidak ada yang tahu keberadaanmu jika terjadi sesuatu. Permintaan untuk merahasiakan pertemuan adalah tanda bahaya yang layak dipikirkan lagi.",
      ],
      [
        "Menolak ajakan dan tidak membalas lagi.",
        "aman",
        "Kamu tidak wajib bertemu siapa pun. Menolak tanpa alasan panjang sudah cukup.",
      ],
      [
        "Menceritakan ajakan itu kepada orang dewasa tepercaya sebelum memutuskan apa pun.",
        "aman",
        "Bagus. Orang dewasa bisa membantu menilai situasi dan melindungimu. Menceritakannya bukan berarti kamu mengadu atau berbuat salah.",
      ],
      [
        "Mengajak teman untuk menemani secara diam-diam.",
        "hati",
        "Niatmu baik, tetapi teman sebaya sulit melindungimu jika keadaan berubah buruk, dan rahasianya tetap ada. Libatkan orang dewasa tepercaya.",
      ],
      [
        "Melaporkan akun itu ke platform dan memblokirnya jika aman.",
        "aman",
        "Melapor dan memblokir membantu melindungi dirimu dan pengguna lain. Ceritakan juga kepada orang dewasa tepercaya agar kamu tidak sendirian.",
      ],
    ],
  },
  {
    judul: "Ancaman menyebarkan",
    q: "Seseorang mengancam akan menyebarkan sesuatu tentangmu jika kamu tidak menuruti permintaannya. Kamu takut dan bingung. Apa yang dapat kamu lakukan?",
    opts: [
      [
        "Menuruti permintaannya supaya ancamannya berhenti.",
        "hati",
        "Rasa takut itu sangat wajar. Namun menuruti ancaman biasanya tidak menghentikannya; tuntutan sering bertambah. Kamu tidak harus menurut, dan masih ada jalan untuk meminta bantuan.",
      ],
      [
        "Tidak mengonfrontasi, menyimpan bukti pesan, dan segera mencari orang dewasa tepercaya.",
        "aman",
        "Keselamatanmu yang utama. Kamu tidak perlu melawan atau berdebat dengan orang yang mengancam. Simpan bukti pesan dan akun, lalu minta bantuan segera.",
      ],
      [
        "Menghubungi guru BK atau mencari jalur pelaporan resmi seperti SAPA 129.",
        "aman",
        "Langkah yang tepat. Kamu tidak perlu membuktikan semuanya sendiri untuk meminta pertolongan.",
      ],
      [
        "Membalas dengan ancaman juga.",
        "hati",
        "Rasa marah bisa dimengerti, tetapi membalas ancaman bisa memperburuk keadaan dan membuatmu semakin terjebak. Lebih aman berhenti berdebat dan meminta bantuan.",
      ],
      [
        "Menghapus semua pesan supaya tidak ketahuan siapa pun.",
        "hati",
        "Rasa malu atau takut membuat banyak orang ingin menghapus semuanya. Padahal pesan itu bisa menjadi bukti yang membantu orang dewasa menolongmu. Kamu tidak perlu malu; yang salah adalah orang yang mengancam.",
      ],
    ],
  },
];
const SCN_EXPL = [
  "Kamu tidak berutang foto atau informasi pribadi kepada siapa pun.",
  "Kamu tidak harus menghadapi ancaman sendirian.",
  "Jika menolak atau memblokir justru meningkatkan bahaya, utamakan keselamatan dan segera cari bantuan.",
  "Kamu tidak perlu mengonfrontasi orang yang mengancammu.",
  "Bukti tidak boleh disebarkan kepada teman atau diunggah ke media sosial.",
];
