"use strict";
/* LEGACY: akun lokal di browser (terpisah dari login server /login). Dipakai panel Guru BK. */

/* =========================================================
   Akun (hanya di perangkat ini — lihat halaman Tentang)
   ========================================================= */
const b64e = (u) => btoa(String.fromCharCode(...u));
const b64d = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const Auth = {
  users() {
    try {
      return JSON.parse(LS.get("pazzel_users") || "{}");
    } catch {
      return {};
    }
  },
  save(u) {
    LS.set("pazzel_users", JSON.stringify(u));
  },
  cryptoOK() {
    return !!(window.crypto && crypto.subtle);
  },
  async hash(pw, saltB64) {
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(pw), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits(
      { name: "PBKDF2", salt: b64d(saltB64), iterations: 150000, hash: "SHA-256" },
      key,
      256
    );
    return b64e(new Uint8Array(bits));
  },
  newSalt() {
    return b64e(crypto.getRandomValues(new Uint8Array(16)));
  },
  current() {
    const n = SS.get("pazzel_session");
    if (!n) return null;
    const u = this.users()[n];
    return u ? { username: n, ...u } : null;
  },
  fail() {
    try {
      return JSON.parse(SS.get("pazzel_fail") || '{"n":0,"until":0}');
    } catch {
      return { n: 0, until: 0 };
    }
  },
  validPw(pw, username) {
    if (pw.length < 8) return "Kata sandi minimal 8 karakter.";
    if (pw.toLowerCase() === (username || "").toLowerCase()) return "Kata sandi tidak boleh sama dengan nama pengguna.";
    if (!/[A-Za-z]/.test(pw) || !/[0-9]/.test(pw)) return "Gunakan kombinasi huruf dan angka pada kata sandi.";
    return "";
  },
  async register({ nickname, username, role, code, pw, pw2 }) {
    if (!this.cryptoOK())
      return {
        err: "Browser ini tidak mendukung penyimpanan kata sandi yang aman. Buka Clover Safery lewat https:// atau gunakan browser terbaru.",
      };
    nickname = nickname.trim();
    username = username.trim().toLowerCase();
    if (nickname.length < 2 || nickname.length > 20) return { err: "Nama panggilan harus 2–20 karakter." };
    if (!/^[a-z0-9_.]{3,20}$/.test(username))
      return { err: "Nama pengguna 3–20 karakter: huruf kecil, angka, titik, atau garis bawah." };
    const users = this.users();
    if (users[username]) return { err: "Nama pengguna itu sudah dipakai. Coba yang lain." };
    if (role === "guru" && code.trim() !== GURU_CODE)
      return { err: "Kode Guru BK tidak sesuai. Tanyakan kepada penanggung jawab sekolah." };
    const pe = this.validPw(pw, username);
    if (pe) return { err: pe };
    if (pw !== pw2) return { err: "Konfirmasi kata sandi belum sama." };
    const salt = this.newSalt();
    users[username] = {
      nickname,
      role: role === "guru" ? "guru" : "siswa",
      salt,
      hash: await this.hash(pw, salt),
      created: new Date().toISOString(),
      opened: [],
    };
    this.save(users);
    SS.set("pazzel_session", username);
    SS.del("pazzel_fail");
    return { ok: true };
  },
  async login(username, pw) {
    if (!this.cryptoOK())
      return { err: "Browser ini tidak mendukung login yang aman. Gunakan browser terbaru atau buka lewat https://." };
    const f = this.fail();
    if (f.until > Date.now())
      return { err: `Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil((f.until - Date.now()) / 1000)} detik.` };
    username = username.trim().toLowerCase();
    const u = this.users()[username];
    let ok = false;
    if (u) {
      ok = (await this.hash(pw, u.salt)) === u.hash;
    } else {
      await this.hash(pw, b64e(new Uint8Array(16)));
    } // samakan waktu proses
    if (!ok) {
      const n = f.n + 1;
      SS.set(
        "pazzel_fail",
        JSON.stringify({ n: n >= MAX_FAIL ? 0 : n, until: n >= MAX_FAIL ? Date.now() + LOCK_MS : 0 })
      );
      return {
        err:
          n >= MAX_FAIL
            ? "Terlalu banyak percobaan. Tunggu 30 detik lalu coba lagi."
            : "Nama pengguna atau kata sandi tidak cocok.",
      };
    }
    SS.set("pazzel_session", username);
    SS.del("pazzel_fail");
    return { ok: true };
  },
  logout() {
    SS.del("pazzel_session");
  },
  markOpened(key) {
    const n = SS.get("pazzel_session");
    if (!n) return;
    const users = this.users();
    const u = users[n];
    if (!u) return;
    u.opened = u.opened || [];
    if (!u.opened.includes(key)) {
      u.opened.push(key);
      this.save(users);
    }
  },
};
