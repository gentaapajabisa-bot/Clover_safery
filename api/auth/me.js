import { currentUser, json, method } from "../../lib/security.js";

export default async function handler(req, res) {
  if (!method(req, res, "GET")) return;
  try {
    const user = await currentUser(req);
    return json(res, 200, { user: user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null });
  } catch (e) {
    console.error("session check failed", e?.message);
    return json(res, 500, { error: "Tidak dapat memeriksa sesi." });
  }
}
