import { getDb } from "../../lib/db.js";
import { json, requireAdmin, rowsOf } from "../../lib/security.js";

const STATUSES = ["active", "suspended"];

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      if (!(await requireAdmin(req, res))) return;
      const result = await getDb().execute(
        "SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC, id DESC LIMIT 200"
      );
      return json(res, 200, { users: rowsOf(result) });
    }

    if (req.method === "PATCH") {
      const admin = await requireAdmin(req, res);
      if (!admin) return;
      const id = Number(req.body?.id);
      const status = req.body?.status;
      if (!Number.isSafeInteger(id) || id < 1 || !STATUSES.includes(status)) {
        return json(res, 400, { error: "Data perubahan tidak valid." });
      }
      if (id === Number(admin.id)) return json(res, 400, { error: "Admin tidak dapat menangguhkan akunnya sendiri." });

      const db = getDb();
      await db.execute("UPDATE users SET status = ? WHERE id = ?", [status, id]);
      if (status === "suspended") await db.execute("DELETE FROM user_sessions WHERE user_id = ?", [id]);
      return json(res, 200, { ok: true });
    }

    res.setHeader("Allow", "GET, PATCH");
    return json(res, 405, { error: "Metode tidak diizinkan." });
  } catch (e) {
    console.error("admin users failed", e?.message);
    return json(res, 500, { error: "Pengelolaan pengguna gagal." });
  }
}
