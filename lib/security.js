import { createHash, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { getDb } from "./db.js";

const scrypt = promisify(scryptCallback);

export const SESSION_COOKIE = "clover_session";

/* ---------- Hash & token ---------- */

export const sha256 = (value) => createHash("sha256").update(value).digest("hex");
export const newToken = () => randomBytes(32).toString("base64url");

export async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${Buffer.from(derived).toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  const [scheme, salt, hash] = String(stored || "").split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const actual = Buffer.from(await scrypt(password, salt, 64));
  const expected = Buffer.from(hash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Hash palsu agar waktu respons login tidak membocorkan apakah email terdaftar. */
const DUMMY_HASH = `scrypt$${"0".repeat(32)}$${"0".repeat(128)}`;
export const verifyDummyPassword = (password) => verifyPassword(password, DUMMY_HASH);

/* ---------- Hasil query ---------- */

/** Menyeragamkan bentuk hasil driver TiDB (array, [rows, meta], atau { rows }). */
export function rowsOf(result) {
  if (Array.isArray(result)) return Array.isArray(result[0]) ? result[0] : result;
  return result?.rows || result?.data || [];
}

/* ---------- Cookie & sesi ---------- */

export function sessionDays() {
  return Math.max(1, Math.min(30, Number(process.env.SESSION_TTL_DAYS || 7)));
}

const cookieFlags = (maxAge) => `Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;

export function setSessionCookie(res, token, days = sessionDays()) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=${encodeURIComponent(token)}; ${cookieFlags(days * 86400)}`);
}

export function clearSessionCookie(res) {
  res.setHeader("Set-Cookie", `${SESSION_COOKIE}=; ${cookieFlags(0)}`);
}

export function parseCookies(req) {
  const cookies = {};
  for (const part of (req.headers.cookie || "").split(";")) {
    const i = part.indexOf("=");
    if (i < 1) continue;
    const key = part.slice(0, i).trim();
    try {
      cookies[key] = decodeURIComponent(part.slice(i + 1).trim());
    } catch {
      /* abaikan cookie dengan encoding rusak */
    }
  }
  return cookies;
}

/** Membuat sesi baru di database, mengirim cookie, dan mengembalikan token mentahnya. */
export async function createSession(db, res, userId) {
  const token = newToken();
  const days = sessionDays();
  await db.execute(
    "INSERT INTO user_sessions (user_id, token_hash, expires_at) VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? DAY))",
    [userId, sha256(token), days]
  );
  setSessionCookie(res, token, days);
  return token;
}

export async function logActivity(db, userId, action, details = null) {
  await db.execute("INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)", [userId, action, details]);
}

export async function currentUser(req) {
  const token = parseCookies(req)[SESSION_COOKIE];
  if (!token) return null;
  const result = await getDb().execute(
    `SELECT u.id, u.name, u.email, u.role, u.status, COALESCE(p.avatar_version, 0) AS avatar_version
       FROM user_sessions s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN user_profiles p ON p.user_id = u.id
      WHERE s.token_hash = ? AND s.expires_at > UTC_TIMESTAMP()
      LIMIT 1`,
    [sha256(token)]
  );
  const user = rowsOf(result)[0] || null;
  return user && user.status === "active" ? user : null;
}

/* ---------- Respons & guard ---------- */

export function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

export function method(req, res, expected) {
  if (req.method === expected) return true;
  res.setHeader("Allow", expected);
  json(res, 405, { error: "Metode tidak diizinkan." });
  return false;
}

export async function requireUser(req, res) {
  const user = await currentUser(req);
  if (!user) {
    json(res, 401, { error: "Silakan login kembali." });
    return null;
  }
  return user;
}

export async function requireAdmin(req, res) {
  const user = await requireUser(req, res);
  if (!user) return null;
  if (user.role !== "admin") {
    json(res, 403, { error: "Akses khusus admin." });
    return null;
  }
  return user;
}

/* ---------- Validasi input bersama ---------- */

/** Mengubah nilai apa pun menjadi teks rapi; null bila kosong. Mengembalikan undefined bila terlalu panjang. */
export function cleanText(value, max) {
  const text = String(value ?? "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
    .trim();
  if (!text) return null;
  return text.length > max ? undefined : text;
}

const PHONE_RE = /^[0-9+()\-\s]{5,30}$/;
/** Nomor telepon opsional: null bila kosong, undefined bila tidak valid. */
export function cleanPhone(value) {
  const text = cleanText(value, 30);
  if (text === null) return null;
  return text && PHONE_RE.test(text) ? text : undefined;
}

/** Angka id positif dari input, atau null. */
export function toId(value) {
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}
