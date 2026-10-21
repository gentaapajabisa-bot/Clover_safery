import { getDb } from "../../lib/db.js";
import { json, method, requireAdmin, rowsOf } from "../../lib/security.js";

export default async function handler(req, res) {
  if (!method(req, res, "GET")) return;
  try {
    if (!(await requireAdmin(req, res))) return;

    const db = getDb();
    const [users, reports, activity] = await Promise.all([
      db.execute(
        "SELECT COUNT(*) AS total, COALESCE(SUM(status = 'active'), 0) AS active, COALESCE(SUM(status = 'suspended'), 0) AS suspended FROM users"
      ),
      db.execute(
        `SELECT COUNT(*) AS total,
                COALESCE(SUM(status = 'pending'), 0)  AS pending,
                COALESCE(SUM(status = 'reviewed'), 0) AS reviewed,
                COALESCE(SUM(status = 'resolved'), 0) AS resolved
           FROM security_reports`
      ),
      db.execute(
        "SELECT id, user_id, action, details, created_at FROM activity_logs ORDER BY created_at DESC, id DESC LIMIT 10"
      ),
    ]);

    return json(res, 200, {
      users: rowsOf(users)[0] || {},
      reports: rowsOf(reports)[0] || {},
      activity: rowsOf(activity),
    });
  } catch (e) {
    console.error("admin stats failed", e?.message);
    return json(res, 500, { error: "Statistik admin gagal dimuat." });
  }
}
