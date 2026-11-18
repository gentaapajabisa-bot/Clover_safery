"use strict";
/* LEGACY: halaman akun lokal dan Guru BK (lihat local-auth.js). */

/* ---- Akun ---- */
function pageAccount() {
  const me = Auth.current();
  if (me) return pageDashboard(me);
  const masuk = S.tab === "masuk";
  return `
  <h1 tabindex="-1">Akun Clover Safery</h1>
  <div class="callout biru"><p><strong>Akun itu opsional.</strong> Semua materi, alarm, dan menu bantuan bisa dipakai tanpa masuk. Akun hanya mencatat halaman materi yang sudah kamu buka.</p></div>
  ${!Auth.cryptoOK() ? `<div class="msg err" role="alert">Browser ini membatasi fitur keamanan yang dibutuhkan untuk akun. Buka Clover Safery lewat alamat https:// atau gunakan browser terbaru. Materi dan alarm tetap bisa dipakai.</div>` : ""}
  <div class="tabs" role="tablist" aria-label="Masuk atau Daftar">
    <button type="button" class="tab" role="tab" data-act="tab" data-t="masuk" aria-selected="${masuk}">Masuk</button>
    <button type="button" class="tab" role="tab" data-act="tab" data-t="daftar" aria-selected="${!masuk}">Daftar</button>
  </div>
  <div class="card" style="max-width:520px">
  ${
    masuk
      ? `
    <form data-form="login" novalidate>
      <label class="lbl" for="l-u">Nama pengguna</label><input id="l-u" type="text" autocomplete="username" autocapitalize="none" required>
      <label class="lbl" for="l-p">Kata sandi</label><input id="l-p" type="password" autocomplete="current-password" required>
      <div id="form-msg" role="alert"></div>
      <div class="btn-row"><button class="btn btn-primary" type="submit">Masuk</button></div>
      <p class="hint" style="margin-top:12px">Lupa kata sandi? Minta Guru BK mengatur ulang kata sandi di perangkat ini.</p>
    </form>`
      : `
    <form data-form="register" novalidate>
      <label class="lbl" for="r-n">Nama panggilan <span class="hint">(bukan nama lengkap)</span></label><input id="r-n" type="text" maxlength="20" autocomplete="off" required>
      <label class="lbl" for="r-u">Nama pengguna</label><input id="r-u" type="text" maxlength="20" autocomplete="off" autocapitalize="none" aria-describedby="r-u-h" required>
      <p class="hint" id="r-u-h">3–20 karakter: huruf kecil, angka, titik, garis bawah. Jangan memakai nama lengkap, tanggal lahir, atau nomor telepon.</p>
      <fieldset style="margin:14px 0"><legend>Saya mendaftar sebagai</legend>
        <label class="chk"><input type="radio" name="role" value="siswa" checked data-role><span>Siswa</span></label>
        <label class="chk"><input type="radio" name="role" value="guru" data-role><span>Guru BK</span></label>
        <div id="guru-code" hidden><label class="lbl" for="r-c">Kode Guru BK</label><input id="r-c" type="password" autocomplete="off"></div>
      </fieldset>
      <label class="lbl" for="r-p">Kata sandi</label><input id="r-p" type="password" autocomplete="new-password" aria-describedby="r-p-h" required>
      <p class="hint" id="r-p-h">Minimal 8 karakter, kombinasi huruf dan angka. Jangan pakai kata sandi yang sama dengan akun lain.</p>
      <label class="lbl" for="r-p2">Ulangi kata sandi</label><input id="r-p2" type="password" autocomplete="new-password" required>
      <label class="chk" style="margin-top:10px"><input type="checkbox" id="r-ok" required><span>Saya paham akun ini hanya tersimpan di perangkat ini dan tidak dikirim ke mana pun.</span></label>
      <div id="form-msg" role="alert"></div>
      <div class="btn-row"><button class="btn btn-primary" type="submit">Buat akun</button></div>
    </form>`
  }
  </div>`;
}
function pageDashboard(me) {
  const mods = [
    ["tanda-bahaya", "Tanda Bahaya"],
    ["privasi", "Privasi &amp; Batasan"],
    ["tindakan", "Tindakan Aman"],
    ["refleksi", "Refleksi"],
    ["bantuan", "Bantuan"],
  ];
  const op = me.opened || [];
  const n = mods.filter((m) => op.includes(m[0])).length;
  const tips = [
    "Kamu boleh berkata “tidak” dengan tenang tanpa alasan panjang.",
    "Rahasia yang membuatmu takut tidak perlu dijaga.",
    "Hadiah tidak membuatmu berutang apa pun.",
    "Simpan pesan yang meresahkan, tunjukkan kepada orang dewasa tepercaya, dan jangan sebarkan.",
    "Kamu boleh meminta bantuan kapan saja, dan tidak perlu menunggu keadaan menjadi parah.",
  ];
  const tip = tips[new Date().getDate() % tips.length];
  return `
  <h1 tabindex="-1">Halo, ${esc(me.nickname)}! 👋</h1>
  <p class="lead">Kamu masuk sebagai <span class="tag">${me.role === "guru" ? "Guru BK" : "Siswa"}</span> dengan nama pengguna <strong>${esc(me.username)}</strong>.</p>
  <div class="grid g2">
    <section class="card"><h2>Kemajuan belajar</h2>
      <div class="bar" role="progressbar" aria-valuemin="0" aria-valuemax="${mods.length}" aria-valuenow="${n}" aria-label="Halaman materi yang sudah dibuka"><i style="width:${(n / mods.length) * 100}%"></i></div>
      <p style="margin:8px 0 12px">${n} dari ${mods.length} halaman sudah kamu buka.</p>
      <div style="display:flex;flex-wrap:wrap;gap:8px">${mods.map((m) => `<span class="pill ${op.includes(m[0]) ? "done" : ""}">${op.includes(m[0]) ? "✓" : "○"} ${m[1]}</span>`).join("")}</div>
      <p class="hint" style="margin-top:12px">Yang dicatat hanya halaman yang sudah dibuka. Jawaban refleksi dan checklist tidak disimpan. Ini bukan nilai.</p>
    </section>
    <section class="card"><h2>💡 Pengingat hari ini</h2><p style="font-size:1.1rem">${esc(tip)}</p>
      <div class="btn-row">${routeBtn("#/tanda-bahaya", "Lanjut belajar", "btn btn-primary")}${routeBtn("#/bantuan", "Meminta Bantuan", "btn btn-pink")}${me.role === "guru" ? routeBtn("#/guru", "Panduan Guru BK", "btn") : ""}</div></section>
  </div>
  <h2 style="margin-top:24px">Pengaturan akun</h2>
  <div class="grid g2">
    <section class="card"><h3>Ganti nama panggilan</h3>
      <form data-form="nick" novalidate><label class="lbl" for="n-n">Nama panggilan baru</label><input id="n-n" type="text" maxlength="20" value="${esc(me.nickname)}"><div class="msg-slot" role="status"></div><div class="btn-row"><button class="btn" type="submit">Simpan</button></div></form></section>
    <section class="card"><h3>Ganti kata sandi</h3>
      <form data-form="pw" novalidate>
        <label class="lbl" for="p-o">Kata sandi lama</label><input id="p-o" type="password" autocomplete="current-password">
        <label class="lbl" for="p-n">Kata sandi baru</label><input id="p-n" type="password" autocomplete="new-password">
        <label class="lbl" for="p-n2">Ulangi kata sandi baru</label><input id="p-n2" type="password" autocomplete="new-password">
        <div class="msg-slot" role="status"></div><div class="btn-row"><button class="btn" type="submit">Ganti kata sandi</button></div></form></section>
  </div>
  <div class="btn-row" style="margin-top:20px"><button type="button" class="btn" data-act="logout">Keluar</button><button type="button" class="btn btn-danger" data-act="del-me">Hapus akunku</button></div>`;
}

/* ---- Guru BK ---- */
function pageGuru() {
  const me = Auth.current();
  if (!me || me.role !== "guru") {
    return `<h1 tabindex="-1">Panduan Guru BK</h1><div class="callout kuning"><p>Halaman ini hanya untuk akun Guru BK. ${me ? "Akunmu terdaftar sebagai siswa." : "Silakan masuk terlebih dahulu."}</p></div><div class="btn-row">${routeBtn("/login", "Masuk ke Clover Safery", "btn btn-primary")}</div><p>Menu bantuan dan alarm tetap bisa dipakai siapa saja.</p>`;
  }
  const users = Auth.users();
  const rows = Object.entries(users)
    .map(
      ([u, d]) =>
        `<tr><td>${esc(u)}</td><td>${esc(d.nickname)}</td><td>${d.role === "guru" ? "Guru BK" : "Siswa"}</td><td>${(d.opened || []).length}/5</td><td>${u === me.username ? "<em>(kamu)</em>" : `<button type="button" class="btn btn-small" data-act="g-reset" data-u="${esc(u)}">Atur ulang sandi</button> <button type="button" class="btn btn-small btn-danger" data-act="g-del" data-u="${esc(u)}">Hapus</button>`}</td></tr>`
    )
    .join("");
  return `
  <h1 tabindex="-1">Panduan Guru BK</h1>
  <p class="lead">Ringkasan untuk membantu penggunaan Clover Safery di kelas dan sekolah.</p>
  <div class="callout biru"><p>Clover Safery <strong>tidak mengirim data siswa kepada guru</strong>. Jawaban refleksi dan checklist tidak disimpan, sehingga tidak ada yang bisa dilihat di sini selain daftar akun lokal dan jumlah halaman yang dibuka.</p></div>

  <h2>Saat siswa mengungkapkan pengalaman berisiko</h2>
  <div class="grid g2">
    <div class="card"><h3>Lakukan</h3><ul class="clean"><li>Dengarkan dengan tenang; ucapkan terima kasih karena siswa berani bercerita.</li><li>Tegaskan bahwa ini bukan salah siswa.</li><li>Jelaskan dengan jujur langkah selanjutnya dan siapa yang akan dilibatkan.</li><li>Ikuti prosedur perlindungan anak sekolah dan jalur pelaporan resmi (misalnya SAPA 129).</li><li>Catat fakta secukupnya, simpan dengan aman, dan batasi yang mengetahui.</li></ul></div>
    <div class="card"><h3>Hindari</h3><ul class="clean"><li>Menyalahkan, menghakimi, atau bertanya “kenapa kamu mau?”.</li><li>Meminta siswa mengulang cerita berkali-kali kepada banyak orang.</li><li>Mengonfrontasi terduga pelaku sendirian.</li><li>Meminta atau menyebarkan foto/video pribadi siswa sebagai bukti.</li><li>Menjanjikan kerahasiaan mutlak yang tidak bisa dipenuhi bila ada risiko keselamatan.</li></ul></div>
  </div>

  <h2 style="margin-top:24px">Saran penggunaan di kelas</h2>
  <ol style="padding-left:1.3em"><li>Beri tahu siswa bahwa refleksi tidak dinilai dan boleh dilewati.</li><li>Jelaskan fungsi dan batasan alarm dengan bahasa sederhana.</li><li>Sediakan waktu setelah sesi bagi siswa yang ingin berbicara pribadi.</li><li>Siapkan pendamping saat sesi, karena topiknya bisa membuat sebagian siswa tidak nyaman.</li></ol>

  ${checklist("guru", "Checklist kesiapan sekolah (tidak disimpan)", CL_GURU)}

  <h2 style="margin-top:24px">Akun di perangkat ini</h2>
  <div class="card" style="overflow-x:auto"><table class="t"><thead><tr><th scope="col">Nama pengguna</th><th scope="col">Panggilan</th><th scope="col">Peran</th><th scope="col">Halaman dibuka</th><th scope="col">Aksi</th></tr></thead><tbody>${rows}</tbody></table>
  <p class="hint">Atur ulang sandi memberikan kata sandi sementara yang kamu ketik sendiri; sampaikan secara langsung kepada pemilik akun.</p></div>`;
}
