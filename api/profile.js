import { getDb } from "../lib/db.js";
import {
  SESSION_COOKIE,
  cleanPhone,
  cleanText,
  hashPassword,
  json,
  logActivity,
  parseCookies,
  requireUser,
  rowsOf,
  sha256,
  toId,
  verifyPassword,
} from "../lib/security.js";

const MAX_AVATAR_B64 = 280_000; // ≈ 200 KB; browser sudah memperkecil foto jadi ±30 KB
const AVATAR_RE = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/;

/** Memastikan isi file benar-benar gambar sesuai tipe yang diklaim (bukan sekadar label). */
function matchesMagic(mime, bytes) {
  if (mime === "jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mime === "png") return bytes.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  if (mime === "webp") return bytes.subarray(0, 4).toString("latin1") === "RIFF" && bytes.subarray(8, 12).toString("latin1") === "WEBP";
  return false;
}

async function loadProfile(db, id) {
  const row = rowsOf(
    await db.execute(
      `SELECT u.id, u.name, u.email, u.role, u.created_at, p.phone, p.bio, COALESCE(p.avatar_version, 0) AS avatar_version
         FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id
        WHERE u.id = ? LIMIT 1`,
      [id]
    )
  )[0];
  return row ? { ...row, avatar_version: Number(row.avatar_version) || 0 } : null;
}

async function sendAvatar(req, res, user, db) {
  const target = toId(req.query?.avatar);
  // Foto sendiri boleh dilihat pemiliknya; admin boleh melihat foto pengguna (untuk daftar chat).
  if (!target || (target !== Number(user.id) && user.role !== "admin")) return json(res, 404, { error: "Foto tidak ditemukan." });
  const row = rowsOf(await db.execute("SELECT mime, data_b64 FROM user_avatars WHERE user_id = ? LIMIT 1", [target]))[0];
  if (!row) return json(res, 404, { error: "Foto tidak ditemukan." });
  res.statusCode = 200;
  res.setHeader("Content-Type", `image/${row.mime}`);
  res.setHeader("Cache-Control", "private, max-age=86400");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "default-src 'none'; sandbox");
  res.end(Buffer.from(row.data_b64, "base64"));
}

async function changePassword(req, res, user, db) {
  const current = String(req.body?.current_password || "");
  const next = req.body?.new_password;
  if (typeof next !== "string" || next.length < 10 || next.length > 200) {
    return json(res, 400, { error: "Kata sandi baru minimal 10 karakter." });
  }
  const row = rowsOf(await db.execute("SELECT password_hash FROM users WHERE id = ? LIMIT 1", [user.id]))[0];
  if (!row || !(await verifyPassword(current, row.password_hash))) {
    return json(res, 400, { error: "Kata sandi saat ini tidak cocok." });
  }
  await db.execute("UPDATE users SET password_hash = ? WHERE id = ?", [await hashPassword(next), user.id]);
  // Sesi di perangkat lain dicabut; sesi yang sedang dipakai tetap berlaku.
  const token = parseCookies(req)[SESSION_COOKIE];
  await db.execute("DELETE FROM user_sessions WHERE user_id = ? AND token_hash <> ?", [user.id, sha256(token || "")]);
  await logActivity(db, user.id, "password_change", "Kata sandi diganti");
  return json(res, 200, { ok: true });
}

async function updateProfile(req, res, user, db) {
  const name = cleanText(req.body?.name, 100);
  const phone = cleanPhone(req.body?.phone);
  const bio = cleanText(req.body?.bio, 300);
  if (!name || name.length < 2) return json(res, 400, { error: "Nama harus 2–100 karakter." });
  if (phone === undefined) return json(res, 400, { error: "Nomor telepon tidak valid (angka, spasi, +, -, maks. 30 karakter)." });
  if (bio === undefined) return json(res, 400, { error: "Bio maksimal 300 karakter." });

  await db.execute("UPDATE users SET name = ? WHERE id = ?", [name, user.id]);
  await db.execute(
    `INSERT INTO user_profiles (user_id, phone, bio) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE phone = VALUES(phone), bio = VALUES(bio)`,
    [user.id, phone, bio]
  );
  await logActivity(db, user.id, "profile_update", "Profil diperbarui");
  return json(res, 200, { ok: true, profile: await loadProfile(db, user.id) });
}

async function saveAvatar(req, res, user, db) {
  const match = AVATAR_RE.exec(String(req.body?.avatar || ""));
  if (!match || match[2].length > MAX_AVATAR_B64) {
    return json(res, 400, { error: "Foto harus berformat JPG, PNG, atau WebP dengan ukuran kecil." });
  }
  const [, mime, b64] = match;
  if (!matchesMagic(mime, Buffer.from(b64, "base64"))) return json(res, 400, { error: "Isi file bukan gambar yang valid." });

  await db.execute(
    `INSERT INTO user_avatars (user_id, mime, data_b64) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE mime = VALUES(mime), data_b64 = VALUES(data_b64)`,
    [user.id, mime, b64]
  );
  await db.execute(
    `INSERT INTO user_profiles (user_id, avatar_version) VALUES (?, 1)
     ON DUPLICATE KEY UPDATE avatar_version = avatar_version + 1`,
    [user.id]
  );
  await logActivity(db, user.id, "avatar_update", "Foto profil diganti");
  return json(res, 200, { ok: true, profile: await loadProfile(db, user.id) });
}

async function removeAvatar(res, user, db) {
  await db.execute("DELETE FROM user_avatars WHERE user_id = ?", [user.id]);
  await db.execute("UPDATE user_profiles SET avatar_version = 0 WHERE user_id = ?", [user.id]);
  return json(res, 200, { ok: true, profile: await loadProfile(db, user.id) });
}

export default async function handler(req, res) {
  try {
    const user = await requireUser(req, res);
    if (!user) return;
    const db = getDb();

    if (req.method === "GET") {
      if (req.query?.avatar !== undefined) return sendAvatar(req, res, user, db);
      return json(res, 200, { profile: await loadProfile(db, user.id) });
    }
    if (req.method === "PATCH") return req.body?.new_password !== undefined ? changePassword(req, res, user, db) : updateProfile(req, res, user, db);
    if (req.method === "POST") return saveAvatar(req, res, user, db);
    if (req.method === "DELETE") return removeAvatar(res, user, db);

    res.setHeader("Allow", "GET, PATCH, POST, DELETE");
    return json(res, 405, { error: "Metode tidak diizinkan." });
  } catch (e) {
    console.error("profile failed", e?.message);
    return json(res, 500, { error: "Profil tidak dapat diproses. Pastikan skema database terbaru sudah dijalankan." });
  }
}
