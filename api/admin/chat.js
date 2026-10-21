/* Chat sisi admin: daftar percakapan, membaca satu percakapan, dan membalas. */
import { getDb } from "../../lib/db.js";
import { cleanText, json, requireAdmin, rowsOf, toId } from "../../lib/security.js";

const PAGE = 100;

export default async function handler(req, res) {
  try {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const db = getDb();

    if (req.method === "GET") {
      if (req.query?.count !== undefined) {
        const row = rowsOf(await db.execute("SELECT COUNT(*) AS n FROM chat_messages WHERE sender_role = 'user' AND read_at IS NULL"))[0];
        return json(res, 200, { unread: Number(row?.n) || 0 });
      }

      const userId = toId(req.query?.user);
      if (!userId) {
        const threads = rowsOf(
          await db.execute(
            `SELECT t.user_id, u.name, u.email, COALESCE(p.avatar_version, 0) AS avatar_version,
                    lm.body AS last_body, lm.sender_role AS last_role, lm.created_at AS last_at,
                    (SELECT COUNT(*) FROM chat_messages c
                      WHERE c.thread_user_id = t.user_id AND c.sender_role = 'user' AND c.read_at IS NULL) AS unread
               FROM (SELECT thread_user_id AS user_id, MAX(id) AS last_id FROM chat_messages GROUP BY thread_user_id) t
               JOIN chat_messages lm ON lm.id = t.last_id
               JOIN users u ON u.id = t.user_id
               LEFT JOIN user_profiles p ON p.user_id = u.id
              ORDER BY t.last_id DESC LIMIT 100`
          )
        );
        return json(res, 200, { threads });
      }

      const after = toId(req.query?.after) || 0;
      const who = rowsOf(
        await db.execute(
          `SELECT u.id, u.name, u.email, COALESCE(p.avatar_version, 0) AS avatar_version
             FROM users u LEFT JOIN user_profiles p ON p.user_id = u.id WHERE u.id = ? LIMIT 1`,
          [userId]
        )
      )[0];
      if (!who) return json(res, 404, { error: "Pengguna tidak ditemukan." });
      const messages = rowsOf(
        await db.execute(
          `SELECT id, sender_role, body, created_at FROM chat_messages
            WHERE thread_user_id = ? AND id > ? ORDER BY id DESC LIMIT ${PAGE}`,
          [userId, after]
        )
      ).reverse();
      await db.execute(
        "UPDATE chat_messages SET read_at = UTC_TIMESTAMP() WHERE thread_user_id = ? AND sender_role = 'user' AND read_at IS NULL",
        [userId]
      );
      return json(res, 200, { user: who, messages });
    }

    if (req.method === "POST") {
      const userId = toId(req.body?.user_id);
      const body = cleanText(req.body?.body, 2000);
      if (!userId) return json(res, 400, { error: "Penerima tidak valid." });
      if (!body) return json(res, 400, { error: body === undefined ? "Pesan maksimal 2000 karakter." : "Pesan tidak boleh kosong." });
      const exists = rowsOf(await db.execute("SELECT id FROM users WHERE id = ? LIMIT 1", [userId]))[0];
      if (!exists) return json(res, 404, { error: "Pengguna tidak ditemukan." });
      await db.execute(
        "INSERT INTO chat_messages (thread_user_id, sender_id, sender_role, body) VALUES (?, ?, 'admin', ?)",
        [userId, admin.id, body]
      );
      return json(res, 201, { ok: true });
    }

    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Metode tidak diizinkan." });
  } catch (e) {
    console.error("admin chat failed", e?.message);
    return json(res, 500, { error: "Chat admin tidak dapat diproses. Pastikan skema database terbaru sudah dijalankan." });
  }
}
