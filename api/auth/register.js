import { getDb } from "../../lib/db.js";
import { createSession, hashPassword, json, logActivity, method, rowsOf } from "../../lib/security.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isDuplicate = (e) => e?.errno === 1062 || e?.code === "ER_DUP_ENTRY" || /duplicate entry/i.test(e?.message || "");

export default async function handler(req, res) {
  if (!method(req, res, "POST")) return;
  try {
    const { name, email, password } = req.body || {};
    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (cleanName.length < 2 || cleanName.length > 100) return json(res, 400, { error: "Nama harus 2–100 karakter." });
    if (!EMAIL_RE.test(cleanEmail) || cleanEmail.length > 190) return json(res, 400, { error: "Email tidak valid." });
    if (typeof password !== "string" || password.length < 10 || password.length > 200) {
      return json(res, 400, { error: "Kata sandi minimal 10 karakter." });
    }

    const db = getDb();
    const existing = rowsOf(await db.execute("SELECT id FROM users WHERE email = ? LIMIT 1", [cleanEmail]));
    if (existing.length) return json(res, 409, { error: "Email sudah terdaftar." });

    const passwordHash = await hashPassword(password);
    try {
      await db.execute(
        "INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, 'user', 'active')",
        [cleanName, cleanEmail, passwordHash]
      );
    } catch (e) {
      // Dua pendaftaran bersamaan dengan email yang sama: UNIQUE KEY di database yang menang.
      if (isDuplicate(e)) return json(res, 409, { error: "Email sudah terdaftar." });
      throw e;
    }

    const created = rowsOf(await db.execute("SELECT id FROM users WHERE email = ? LIMIT 1", [cleanEmail]))[0];
    if (!created) throw new Error("User insert could not be confirmed");

    await createSession(db, res, created.id);
    await logActivity(db, created.id, "register", "Akun dibuat");

    return json(res, 201, { ok: true, user: { id: created.id, name: cleanName, email: cleanEmail, role: "user" } });
  } catch (e) {
    console.error("register failed", e?.message);
    return json(res, 500, { error: "Pendaftaran gagal. Periksa konfigurasi database." });
  }
}
