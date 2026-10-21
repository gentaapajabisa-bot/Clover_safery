import { getDb } from "../../lib/db.js";
import { SESSION_COOKIE, clearSessionCookie, json, method, parseCookies, sha256 } from "../../lib/security.js";

export default async function handler(req, res) {
  if (!method(req, res, "POST")) return;
  try {
    const token = parseCookies(req)[SESSION_COOKIE];
    if (token) await getDb().execute("DELETE FROM user_sessions WHERE token_hash = ?", [sha256(token)]);
  } catch (e) {
    console.error("logout failed", e?.message);
  }
  // Cookie selalu dihapus, apa pun hasil query-nya.
  clearSessionCookie(res);
  return json(res, 200, { ok: true });
}
