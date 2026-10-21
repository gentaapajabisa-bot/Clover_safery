"use strict";
/* Halaman materi edukasi. */

/* =========================================================
   Halaman
   ========================================================= */
function pageHome() {
  const flow = [
    ["#/tanda-bahaya", "Kenali tanda bahaya", "Pelajari pola perilaku yang perlu diwaspadai."],
    ["#/privasi", "Pahami privasi &amp; batasan", "Apa yang boleh dibagikan dan apa yang tidak."],
    ["#/tindakan", "Latih tindakan aman", "Pilih langkah yang tepat lewat skenario."],
    ["#/refleksi", "Refleksi setelah puzzle", "Tuliskan apa yang sudah kamu pelajari."],
    ["#/bantuan", "Akses bantuan", "Tahu ke mana dan kepada siapa meminta tolong."],
  ];
  const extra = [
    ["#/simulasi", "💬", "Simulasi chat", "Latihan membalas pesan yang membuat tidak nyaman."],
    ["#/kuis", "📝", "Kuis latihan", "Uji ingatan tanpa nilai."],
    ["#/kamus", "📖", "Kamus istilah", "Arti istilah di dunia digital."],
  ];
  return `
  <section class="hero2">
    <div>
      <h1 tabindex="-1">Selamat Datang di Clover Safety!</h1>
      <p class="lead">Selamat menyelesaikan puzzle Clover Safety! Setelah bermain puzzle, kamu dapat mempelajari tanda bahaya, memahami batas privasi, menentukan tindakan yang aman, dan melakukan refleksi. Jika kamu merasa tidak aman atau membutuhkan bantuan, kamu dapat langsung membuka menu bantuan.</p>
      <ul class="pillars" aria-label="Empat pegangan Clover Safety">
        <li>Kenali Bahaya</li>
        <li>Jaga Privasi</li>
        <li>Tentukan Tindakan Aman</li>
        <li>Berani Mencari Bantuan</li>
      </ul>
      <div class="btn-row">
        ${routeBtn("#/tanda-bahaya", "Mulai Belajar", "btn btn-gold")}
        ${routeBtn("#/refleksi", "Refleksi Setelah Puzzle", "btn btn-line")}
        ${routeBtn("#/bantuan", "Meminta Bantuan", "btn btn-help")}
      </div>
    </div>
    <div class="art" aria-hidden="true"><img src="/img/clover-shield.svg" alt="" /></div>
  </section>

  <section class="sec" aria-labelledby="alur">
    <div class="sec-head">
      <h2 id="alur">Alur belajarmu</h2>
      <p>Ikuti urutan ini, atau mulai dari bagian mana pun yang kamu butuhkan.</p>
    </div>
    <ol class="steps">
      ${flow.map((f, i) => `<li><a href="${f[0]}"><span class="n" aria-hidden="true">${i + 1}</span><strong>${f[1]}</strong><span class="d">${f[2]}</span></a></li>`).join("")}
    </ol>
  </section>

  <section class="sec" aria-labelledby="latihan">
    <div class="sec-head">
      <h2 id="latihan">Latihan tambahan</h2>
      <p>Berlatih dengan santai, tanpa penilaian.</p>
    </div>
    <div class="tiles">
      ${extra.map((x) => `<a class="tile" href="${x[0]}"><span class="i" aria-hidden="true">${x[1]}</span><span><strong>${x[2]}</strong><span class="d">${x[3]}</span></span></a>`).join("")}
    </div>
  </section>

  <div class="promise"><p>Kamu berhak merasa aman, menjaga privasi, menetapkan batasan diri, dan meminta bantuan. Kamu tidak harus menghadapi situasi berbahaya sendirian.</p></div>

  <div class="infogrid">
    <section class="card">
      <h3>Tentang tombol alarm</h3>
      <p>Tombol merah <strong>ALARM TANDA BAHAYA</strong> ada di semua halaman. Saat ditekan, perangkatmu membunyikan sirene sampai kamu menekan <strong>HENTIKAN ALARM</strong>.</p>
      <p>Alarm <strong>hanya berbunyi di perangkatmu</strong>. Alarm tidak otomatis menghubungi guru, orang tua, atau petugas. Jadi setelah menjauh ke tempat aman, tetap minta bantuan orang dewasa tepercaya.</p>
    </section>
    <section class="card">
      <h3>Kembali ke dashboard</h3>
      <p>Lihat ringkasan akun dan aktivitasmu kapan saja lewat dashboard.</p>
      <p><a class="btn btn-primary" href="/dashboard">Buka dashboard</a></p>
      <p class="hint">Menu bantuan dan alarm tetap bisa dipakai siapa saja.</p>
    </section>
  </div>`;
}

function pageSigns() {
  return `
  <h1 tabindex="-1">Mengenali Tanda Bahaya</h1>
  <p class="lead">Beberapa pola perilaku perlu diwaspadai, baik saat bertemu langsung maupun di dunia maya. Ketuk setiap kartu untuk membaca penjelasannya.</p>
  <div>
    ${SIGNS.map((s) => `<details><summary><span aria-hidden="true" style="font-size:1.4rem">${s[0]}</span> ${esc(s[1])}</summary><div class="dbody"><p>${esc(s[2])}</p></div></details>`).join("")}
  </div>
  <div class="callout kuning"><p><strong>Penting:</strong> satu tanda saja tidak otomatis membuktikan terjadinya grooming. Namun setiap perasaan tidak aman atau tidak nyaman layak ditanggapi dengan serius, dan kamu boleh membicarakannya dengan orang dewasa tepercaya.</p></div>

  <h2 style="margin-top:28px">Mitos atau fakta?</h2>
  <p>Ketuk pernyataan untuk melihat penjelasannya. Tidak ada nilai atau skor.</p>
  <div id="myth-root">
    ${MYTHS.map((m, i) => `<div style="margin:10px 0"><button type="button" class="myth" data-act="myth" data-i="${i}" aria-expanded="${!!S.myth[i]}">${esc(m[0])}</button><div class="myth-ans" ${S.myth[i] ? "" : "hidden"} id="myth-a-${i}">${esc(m[1])}</div></div>`).join("")}
  </div>

  ${checklist("signs", "Checklist Mengenali Tanda Bahaya", CL_SIGNS)}
  <div class="btn-row">${routeBtn("#/privasi", "Lanjut: Privasi dan Batasan Diri", "btn btn-primary")}${routeBtn("#/bantuan", "Meminta Bantuan", "btn btn-pink")}</div>`;
}

function pagePrivacy() {
  return `
  <h1 tabindex="-1">Menjaga Privasi dan Batasan Diri</h1>
  <p class="lead">Privasi adalah hak setiap siswa, dan setiap orang berhak menetapkan batasan.</p>
  <div class="grid g2">
    <div class="card"><h3>🔑 Jaga informasi pentingmu</h3><p>Kata sandi, kode keamanan, alamat, lokasi, nomor telepon, dan informasi akun adalah milikmu. Berhati-hatilah saat membagikannya di internet.</p></div>
    <div class="card"><h3>📷 Foto dan video pribadi</h3><p>Kamu tidak wajib mengirim foto atau video pribadi kepada siapa pun.</p></div>
    <div class="card"><h3>✋ Kamu boleh menolak</h3><p>Kamu berhak menolak permintaan, ajakan, percakapan, atau sentuhan yang membuatmu tidak nyaman.</p></div>
    <div class="card"><h3>🗣️ Tidak harus merahasiakan</h3><p>Kamu tidak harus merahasiakan sesuatu yang membuatmu takut atau terancam. Kamu berhak mencari bantuan tanpa merasa malu atau bersalah.</p></div>
  </div>
  <div class="callout pink"><p><strong>Menetapkan batasan bukan berarti kamu tidak sopan. Kamu berhak menjaga diri dan merasa aman.</strong></p></div>

  <h2>Kartu batasanku</h2>
  <p>Pilih seberapa luas kamu mau membagikan tiap hal. Setelah memilih, kamu akan melihat saran. Pilihanmu tidak disimpan.</p>
  <div id="boundary-root">
    ${BOUNDARY.map(
      (b, i) => `<fieldset><legend>${esc(b[0])}</legend>
      ${BOUNDARY_OPTS.map((o, j) => `<label class="chk"><input type="radio" name="bd-${i}" data-bd="${i}" value="${j}" ${S.boundary[i] === j ? "checked" : ""}><span>${esc(o)}</span></label>`).join("")}
      <div class="fb aman" id="bd-fb-${i}" role="status" ${S.boundary[i] === undefined ? "hidden" : ""}>Saran: ${esc(b[1])}</div></fieldset>`
    ).join("")}
  </div>

  <h2>Tips pengaturan akun dan game</h2>
  <details><summary>🔐 Akun dan kata sandi</summary><div class="dbody"><ul class="clean"><li>Gunakan kata sandi yang berbeda untuk tiap akun.</li><li>Jangan beri tahu kode OTP atau kode keamanan kepada siapa pun.</li><li>Keluar dari akun saat memakai perangkat bersama.</li></ul></div></details>
  <details><summary>🌐 Profil media sosial dan game</summary><div class="dbody"><ul class="clean"><li>Atur akun menjadi privat jika memungkinkan.</li><li>Hindari memasang nama lengkap, nama sekolah, atau foto seragam di profil publik.</li><li>Terima permintaan pertemanan hanya dari orang yang kamu kenal.</li></ul></div></details>
  <details><summary>📍 Lokasi dan kamera</summary><div class="dbody"><ul class="clean"><li>Matikan berbagi lokasi pada aplikasi yang tidak membutuhkannya.</li><li>Pikirkan dulu sebelum memberi izin kamera dan mikrofon kepada aplikasi.</li></ul></div></details>

  ${checklist("priv", "Checklist Prinsip Privasi", CL_PRIV)}
  <div class="btn-row">${routeBtn("#/tindakan", "Lanjut: Tindakan yang Aman", "btn btn-primary")}${routeBtn("#/bantuan", "Meminta Bantuan", "btn btn-pink")}</div>`;
}

function pageAction() {
  return `
  <h1 tabindex="-1">Menentukan Tindakan yang Aman</h1>
  <p class="lead">Baca situasinya, lalu coba pilihan tindakan. Kamu boleh mencoba semua pilihan. Tidak ada label korban atau pelaku, dan yang ada hanyalah penjelasan agar kamu bisa memilih langkah yang lebih aman.</p>
  <div id="scn-root"></div>
  <div class="card" id="scn-expl" style="margin-top:18px">
    <h3>Ingat selalu</h3>
    <ul class="clean">${SCN_EXPL.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
  </div>
  ${checklist("act", "Checklist Tindakan Aman", CL_ACT)}
  <div class="btn-row">${routeBtn("#/refleksi", "Lanjut: Refleksi Setelah Puzzle", "btn btn-primary")}${routeBtn("#/bantuan", "Meminta Bantuan", "btn btn-pink")}</div>`;
}
function paintScn(focusI) {
  const root = $("#scn-root");
  if (!root) return;
  const sc = SCN[S.scn];
  const picked = S.picked[S.scn] || { last: null, set: [] };
  root.innerHTML = `
    <div class="tabs" role="group" aria-label="Pilih skenario">
      ${SCN.map((x, i) => `<button type="button" class="tab" data-act="scn-tab" data-i="${i}" aria-pressed="${i === S.scn}">Skenario ${i + 1}: ${esc(x.judul)}</button>`).join("")}
    </div>
    <div class="card">
      <h2 style="font-size:1.2rem">Situasi</h2>
      <p>${esc(sc.q)}</p>
      <div role="group" aria-label="Pilihan tindakan">
        ${sc.opts.map((o, i) => `<button type="button" class="opt" data-act="scn-pick" data-i="${i}" aria-pressed="${picked.set.includes(i)}">${esc(o[0])}</button>`).join("")}
      </div>
      <div id="scn-fb" role="status" aria-live="polite">
        ${
          picked.last !== null
            ? (() => {
                const o = sc.opts[picked.last];
                return `<div class="fb ${o[1]}"><strong>${o[1] === "aman" ? "Langkah yang melindungi dirimu" : "Mari pikirkan lagi bersama"}</strong><p style="margin:.4em 0 0">${esc(o[2])}</p></div>`;
              })()
            : `<p class="hint">Pilih salah satu tindakan untuk melihat penjelasannya.</p>`
        }
      </div>
    </div>`;
  if (focusI !== undefined) {
    const b = $(`[data-act="scn-pick"][data-i="${focusI}"]`, root);
    if (b) b.focus();
  }
}

function pageReflect() {
  const R = S.ref;
  const q2 = [
    "Memberi hadiah lalu menuntut imbalan",
    "Meminta dirahasiakan",
    "Memaksa meminta foto/data pribadi",
    "Mengajak bertemu diam-diam",
    "Menekan atau mengancam",
    "Menjauhkan dari keluarga/teman",
    "Saya belum yakin",
  ];
  const q3 = [
    "Supaya tubuh dan datakumu terlindungi",
    "Supaya aku bisa menolak dengan percaya diri",
    "Supaya orang lain menghormati batasanku",
    "Aku belum yakin",
  ];
  const q4 = [
    "Menolak atau berhenti membalas jika aman",
    "Memblokir atau melaporkan akun",
    "Menyimpan bukti tanpa menyebarkannya",
    "Bercerita kepada orang dewasa tepercaya",
    "Aku belum tahu",
  ];
  const ropts = [
    "Saya lebih memahami tanda bahaya.",
    "Saya ingin belajar lebih banyak tentang batas privasi.",
    "Saya masih belum yakin bagaimana merespons dengan aman.",
    "Saya ingin berbicara dengan guru BK atau orang dewasa tepercaya.",
    "Saya sedang membutuhkan bantuan.",
    "Saya memilih tidak menjawab.",
  ];
  const txt = (k, label, hint) =>
    `<label class="lbl" for="r-${k}">${label}</label><textarea id="r-${k}" data-ref="${k}" maxlength="400" placeholder="(boleh dikosongkan)">${esc(R.text[k] || "")}</textarea>${hint ? `<p class="hint">${hint}</p>` : ""}`;
  const grp = (name, arr, vals, type) =>
    arr
      .map(
        (t, i) =>
          `<label class="chk"><input type="${type}" name="${name}" data-${name}="${i}" ${type === "radio" ? (R[name] === t ? "checked" : "") : vals.includes(i) ? "checked" : ""}><span>${esc(t)}</span></label>`
      )
      .join("");
  return `
  <h1 tabindex="-1">Refleksi Setelah Puzzle</h1>
  <div class="callout"><p>Selamat menyelesaikan puzzle Clover Safety! Luangkan waktu sejenak untuk merefleksikan hal yang kamu pelajari. <strong>Tidak ada nilai benar atau salah.</strong> Kamu boleh melewati pertanyaan yang tidak ingin kamu jawab.</p></div>
  <div class="callout kuning"><p>Jawabanmu <strong>tidak disimpan dan tidak dikirim</strong> ke mana pun; jawaban hilang saat halaman ditutup atau dimuat ulang. Jangan menulis nama lengkap, alamat, kata sandi, atau data pribadi lain.</p></div>
  <form id="ref-form" novalidate>
    <div class="card" style="margin-bottom:14px"><h3>1. Apa pesan terpenting yang kamu dapatkan setelah menyelesaikan puzzle?</h3>${txt("q1", "Jawabanku")}</div>
    <fieldset><legend>2. Tanda bahaya apa yang sekarang lebih kamu pahami?</legend>${grp("q2", q2, R.q2, "checkbox")}</fieldset>
    <fieldset><legend>3. Mengapa penting menjaga privasi dan batasan diri?</legend>${grp("q3", q3, [], "radio")}${txt("q3t", "Atau tulis dengan kata-katamu sendiri")}</fieldset>
    <fieldset><legend>4. Apa yang dapat kamu lakukan jika seseorang meminta sesuatu yang membuatmu tidak nyaman?</legend>${grp("q4", q4, R.q4, "checkbox")}</fieldset>
    <div class="card" style="margin-bottom:14px"><h3>5. Siapa yang dapat kamu hubungi jika merasa takut atau tidak aman?</h3>${txt("q5", "Jawabanku", "Cukup tulis perannya (misalnya “guru BK”, “ibu”), tanpa nomor atau alamat.")}</div>
    <div class="card" style="margin-bottom:14px"><h3>6. Apa satu hal yang ingin kamu lakukan untuk menjaga keselamatan diri?</h3>${txt("q6", "Jawabanku")}</div>
    <fieldset id="ref-opts"><legend>Bagaimana perasaanmu sekarang? (boleh pilih lebih dari satu)</legend>
      ${ropts.map((t, i) => `<label class="chk"><input type="checkbox" data-ropt="${i}" ${R.opts.includes(i) ? "checked" : ""}><span>${esc(t)}</span></label>`).join("")}
    </fieldset>
    <div class="callout pink" id="ref-help" role="status" ${R.opts.includes(3) || R.opts.includes(4) ? "" : "hidden"}>
      <p><strong>Terima kasih sudah jujur. Kamu tidak sendirian.</strong> Kamu bisa langsung melihat pilihan bantuan sekarang juga.</p>
      <div class="btn-row">${routeBtn("#/bantuan", "Buka Menu Meminta Bantuan", "btn btn-primary")}</div>
    </div>
    <div class="btn-row"><button type="submit" class="btn btn-primary">Selesai Refleksi</button><button type="button" class="btn" data-act="ref-copy">Salin jawabanku (jika ingin menunjukkan ke orang dewasa)</button></div>
  </form>
  <div id="ref-end" ${R.done ? "" : "hidden"}>
    <div class="callout hijau" style="margin-top:20px"><p><strong>Terima kasih telah melakukan refleksi.</strong> Kamu berhak merasa aman, menjaga privasi, menolak hal yang membuatmu tidak nyaman, dan mencari bantuan. Kamu tidak harus menghadapi situasi berbahaya sendirian.</p></div>
    <div class="btn-row">${routeBtn("#/tanda-bahaya", "Pelajari Lagi", "btn")}${routeBtn("#/", "Kembali ke Beranda", "btn")}${routeBtn("#/bantuan", "Aku Ingin Meminta Bantuan", "btn btn-pink")}</div>
  </div>`;
}

const HELP_PANELS = {
  dewasa: `<h3>Berbicara dengan orang dewasa tepercaya</h3>
    <p>Orang dewasa tepercaya bisa orang tua atau wali, kakak atau saudara dewasa, wali kelas, atau orang lain yang membuatmu merasa aman. Pilih orang yang akan mendengarkan tanpa menyalahkanmu.</p>
    <p><strong>Kalimat pembuka yang bisa dipakai:</strong></p>
    <ul class="clean"><li>“Aku mau cerita sesuatu yang membuatku tidak nyaman. Boleh minta waktunya sebentar?”</li><li>“Ada orang yang meminta sesuatu dan aku takut. Aku butuh bantuan.”</li></ul>
    <p>Jika orang pertama kurang menanggapi, <strong>coba orang dewasa lain</strong>. Kamu berhak didengar.</p>`,
  bk: `<h3>Meminta bantuan guru BK</h3>
    <p>Guru BK bertugas membantu siswa, dan kamu tidak perlu membuktikan apa pun terlebih dulu. Kamu boleh datang saat istirahat, minta wali kelas mengantarmu, atau menitip pesan: “Aku ingin bertemu guru BK.”</p>
    <p>Kamu tidak harus menceritakan semuanya sekaligus. Mulailah dari apa yang sanggup kamu ceritakan. Jika membawa tangkapan layar pesan, tunjukkan langsung kepada guru BK dan jangan sebarkan ke teman.</p>`,
  resmi: `<h3>Jalur pelaporan resmi</h3>
    <p><strong>SAPA 129</strong> adalah layanan pengaduan kekerasan terhadap perempuan dan anak dari Kementerian PPPA. Kamu bisa membuka laman resminya, atau didampingi orang dewasa tepercaya.</p>
    <div class="btn-row"><a class="btn btn-primary" href="${OFFICIAL_URL}" target="_blank" rel="noopener noreferrer">Buka laman resmi SAPA 129 ↗</a><a class="btn" href="tel:129">Telepon 129</a></div>
    <p class="hint" style="margin-top:12px">Clover Safety tidak mengirim laporan apa pun. Laporan hanya terkirim jika kamu atau orang dewasa yang membantumu mengirimkannya sendiri lewat layanan resmi tersebut.</p>`,
  bahaya: `<div class="callout merah"><h3 style="color:#8f0a12">Jika kamu merasa sedang dalam bahaya</h3>
    <ol style="padding-left:1.2em;margin:0 0 1em"><li>Jika memungkinkan, <strong>menjauhlah ke tempat yang aman</strong>.</li><li>Dekati <strong>orang dewasa tepercaya</strong> atau tempat yang <strong>aman dan ramai</strong> (kantor guru, pos satpam, toko, masjid/gereja).</li><li>Jika ada ancaman langsung, <strong>minta bantuan segera</strong> kepada orang di sekitar atau hubungi layanan darurat.</li></ol>
    <p>Kamu tidak perlu mengisi formulir atau menceritakan seluruh kejadian untuk mendapat bantuan.</p>
    <div class="btn-row"><a class="btn btn-danger" href="tel:112">Telepon 112 (darurat)</a><a class="btn" href="tel:129">Telepon 129 (SAPA)</a><button type="button" class="btn btn-danger" data-act="alarm">🚨 Bunyikan alarm</button></div></div>`,
};
function pageHelp() {
  const opts = [
    ["dewasa", "🧑‍🤝‍🧑", "Saya ingin berbicara dengan orang dewasa tepercaya."],
    ["bk", "🏫", "Saya ingin meminta bantuan guru BK."],
    ["resmi", "📞", "Saya ingin mengetahui jalur pelaporan resmi."],
    ["bahaya", "🆘", "Saya merasa sedang dalam bahaya."],
  ];
  return `
  <h1 tabindex="-1">Meminta Bantuan</h1>
  <div class="callout pink"><p><strong>Jika seseorang membuatmu takut, memaksa, mengancam, atau meminta sesuatu yang membuatmu tidak nyaman, kamu berhak mendapatkan bantuan. Kamu tidak perlu membuktikan semuanya sendiri untuk meminta pertolongan.</strong></p></div>
  <p>Halaman ini bisa dibuka kapan saja, tanpa harus menyelesaikan materi atau mengisi refleksi.</p>
  <div class="grid g2" id="help-opts">
    ${opts.map((o) => `<button type="button" class="opt" style="margin:0" data-act="help-open" data-k="${o[0]}" aria-expanded="${S.help === o[0]}" aria-controls="help-panel"><span class="ico" aria-hidden="true">${o[1]}</span>${esc(o[2])}</button>`).join("")}
  </div>
  <div class="card" id="help-panel" tabindex="-1" style="margin-top:16px" ${S.help ? "" : "hidden"}>${S.help ? HELP_PANELS[S.help] : ""}</div>

  <h2 style="margin-top:28px">Kontak tepercaya</h2>
  <div class="grid g2">
    <div class="card"><ul class="clean" style="margin:0"><li>Guru BK atau wali kelas</li><li>Orang tua atau wali (jika aman untuk dihubungi)</li><li>Anggota keluarga dewasa atau orang dewasa tepercaya lainnya</li><li><strong>SAPA 129</strong> — bantuan terkait kekerasan terhadap perempuan dan anak di Indonesia (<a href="tel:129">129</a>; <a href="${OFFICIAL_URL}" target="_blank" rel="noopener noreferrer">laman resmi ↗</a>)</li></ul></div>
    <div class="card" style="grid-column:1/-1"><h3>Kontak tepercayaku (tersimpan di akunmu)</h3><div id="srv-trusted"><p class="hint">Memuat…</p></div></div>
    <div class="card"><h3>Catatan sementara</h3>
      <p class="hint">Catatan ini hanya ada di layar ini: tidak disimpan dan tidak dikirim. Tulis peran dan cara bertemunya saja (misalnya “Bu Sari — guru BK — ruang BK saat istirahat”).</p>
      ${S.trusted.map((t, i) => `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0"><input type="text" aria-label="Orang tepercaya ${i + 1}: peran" data-tr="${i}" data-f="r" placeholder="Siapa / perannya" maxlength="40" value="${esc(t.r)}"><input type="text" aria-label="Orang tepercaya ${i + 1}: cara menemui" data-tr="${i}" data-f="c" placeholder="Cara menemui" maxlength="60" value="${esc(t.c)}"></div>`).join("")}
      <button type="button" class="btn btn-small" data-act="tr-copy">Salin daftar</button></div>
  </div>
  <div class="callout biru"><p><strong>Catatan:</strong> Clover Safety tidak mengirim laporan, lokasi, atau pesan kepada siapa pun. Untuk mendapat pertolongan, hubungi orang atau layanan di atas secara langsung.</p></div>`;
}

function pageAbout() {
  return `
  <h1 tabindex="-1">Tentang Clover Safety, Privasi, dan Batasan Fitur</h1>
  <p class="lead">Clover Safety adalah media edukasi pendamping puzzle tentang pencegahan child grooming untuk siswa SMP.</p>
  <div class="grid g2">
    <section class="card"><h3>Data apa yang tersimpan?</h3>
      <ul class="clean"><li><strong>Tanpa akun:</strong> tidak ada data pribadi yang disimpan. Hanya pengaturan tampilan (tema, ukuran huruf) yang diingat di perangkat ini.</li><li><strong>Dengan akun:</strong> hanya nama panggilan, nama pengguna, peran, sidik kata sandi (hash), dan daftar halaman materi yang sudah dibuka. Semuanya tersimpan <strong>di browser perangkat ini saja</strong>.</li><li><strong>Tidak pernah disimpan:</strong> jawaban refleksi, centang checklist, pilihan skenario, atau isi “peta orang tepercaya”.</li><li>Kontak tepercaya yang kamu simpan di halaman Kontak, serta profil dan pesan ke admin, tersimpan di server dan <strong>hanya bisa dibuka oleh akunmu</strong> (pesan juga bisa dibaca admin yang kamu hubungi).</li></ul></section>
    <section class="card"><h3>Batasan akun</h3>
      <ul class="clean"><li>Akun hanya berlaku di perangkat dan browser yang sama; tidak bisa dipakai di perangkat lain.</li><li>Membersihkan data browser akan menghapus akun.</li><li>Sesi login berakhir saat tab ditutup, agar aman di komputer bersama.</li><li>Karena tidak memakai server, ini bukan sistem keamanan tingkat lembaga. Peran Guru BK dibuka dengan kode yang bisa dilihat siapa pun yang membuka kode sumber.</li></ul></section>
    <section class="card"><h3>Batasan alarm</h3>
      <ul class="clean"><li>Alarm adalah sinyal suara lokal di perangkat ini.</li><li>Alarm tidak mengirim lokasi, pesan, atau panggilan ke siapa pun.</li><li>Volume mengikuti pengaturan perangkat; website tidak bisa melampaui batas itu.</li><li>Alarm tidak berbunyi otomatis; hanya setelah tombol ditekan.</li></ul></section>
    <section class="card"><h3>Checklist dan refleksi</h3><p>Hanya sarana belajar. Bukan tes, diagnosis, ataupun bukti bahwa seseorang mengalami grooming.</p></section>
  </div>
  <div class="callout kuning"><p>Sebelum dipakai di sekolah, isi, alur bantuan, dan prosedur penanganan sebaiknya ditinjau bersama guru BK atau pihak yang kompeten dalam perlindungan anak.</p></div>`;
}
