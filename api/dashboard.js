import { getDb } from "../lib/db.js";
import { json, method, requireUser, rowsOf } from "../lib/security.js";

export default async function handler(req, res) {
  if (!method(req, res, "GET")) return;
  try {
    const user = await requireUser(req, res);
    if (!user) return;

    const db = getDb();
    const [activity, reports] = await Promise.all([
      db.execute(
        "SELECT action, details, created_at FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 8",
        [user.id]
      ),
      db.execute(
        "SELECT id, title, status, created_at FROM security_reports WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 5",
        [user.id]
      ),
    ]);

    return json(res, 200, { user, activity: rowsOf(activity), reports: rowsOf(reports) });
  } catch (e) {
    console.error("dashboard failed", e?.message);
    return json(res, 500, { error: "Dashboard tidak dapat dimuat." });
  }
}
