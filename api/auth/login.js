import { getDb } from "../../lib/db.js";
import {
  clearSessionCookie,
  createSession,
  json,
  logActivity,
  method,
  rowsOf,
  verifyDummyPassword,
  verifyPassword,
} from "../../lib/security.js";

export default async function handler(req, res) {
  if (!method(req, res, "POST")) return;
  try {
    const email = String(req.body?.email || "")
      .trim()
      .toLowerCase();
    const password = String(req.body?.password || "");
    if (!email || !password || email.length > 190 || password.length > 200) {
      return json(res, 400, { error: "Email dan kata sandi wajib diisi." });
    }

    const db = getDb();
    const result = await db.execute(
      "SELECT id, name, email, password_hash, role, status FROM users WHERE email = ? LIMIT 1",
      [email]
    );
    const user = rowsOf(result)[0];

    // Selalu hitung hash agar waktu respons sama, baik email terdaftar maupun tidak.
    const valid = user ? await verifyPassword(password, user.password_hash) : await verifyDummyPassword(password);
    if (!user || !valid || user.status !== "active") {
      clearSessionCookie(res);
      return json(res, 401, { error: "Email atau kata sandi tidak cocok." });
    }

    // Bersihkan sesi kedaluwarsa sambil lalu agar tabel tidak menumpuk.
    await db.execute("DELETE FROM user_sessions WHERE expires_at <= UTC_TIMESTAMP()");
    await createSession(db, res, user.id);
    await logActivity(db, user.id, "login", "Login berhasil");

    return json(res, 200, { ok: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) {
    console.error("login failed", e?.message);
    return json(res, 500, { error: "Login gagal. Periksa konfigurasi database." });
  }
}
