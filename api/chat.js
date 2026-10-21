/* Chat pengguna ↔ admin. Satu percakapan per pengguna; pengguna hanya bisa
   membaca dan menulis di percakapannya sendiri (thread_user_id = id sesi). */
import { getDb } from "../lib/db.js";
import { cleanText, json, requireUser, rowsOf, toId } from "../lib/security.js";

const PAGE = 100;
const FLOOD_LIMIT = 20; // pesan per menit

export default async function handler(req, res) {
  try {
    const user = await requireUser(req, res);
    if (!user) return;
    const db = getDb();

    if (req.method === "GET") {
      if (req.query?.count !== undefined) {
        const row = rowsOf(
          await db.execute(
            "SELECT COUNT(*) AS n FROM chat_messages WHERE thread_user_id = ? AND sender_role = 'admin' AND read_at IS NULL",
            [user.id]
          )
        )[0];
        return json(res, 200, { unread: Number(row?.n) || 0 });
      }
      const after = toId(req.query?.after) || 0;
      // Ambil PAGE pesan terbaru (setelah `after`), lalu urutkan naik untuk tampilan.
      const rows = rowsOf(
        await db.execute(
          `SELECT id, sender_role, body, created_at FROM chat_messages
            WHERE thread_user_id = ? AND id > ? ORDER BY id DESC LIMIT ${PAGE}`,
          [user.id, after]
        )
      ).reverse();
      await db.execute(
        "UPDATE chat_messages SET read_at = UTC_TIMESTAMP() WHERE thread_user_id = ? AND sender_role = 'admin' AND read_at IS NULL",
        [user.id]
      );
      return json(res, 200, { messages: rows });
    }

    if (req.method === "POST") {
      const body = cleanText(req.body?.body, 2000);
      if (!body) return json(res, 400, { error: body === undefined ? "Pesan maksimal 2000 karakter." : "Pesan tidak boleh kosong." });
      const recent = rowsOf(
        await db.execute(
          "SELECT COUNT(*) AS n FROM chat_messages WHERE thread_user_id = ? AND sender_role = 'user' AND created_at > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 MINUTE)",
          [user.id]
        )
      )[0];
      if (Number(recent?.n) >= FLOOD_LIMIT) return json(res, 429, { error: "Terlalu banyak pesan. Tunggu sebentar." });
      await db.execute(
        "INSERT INTO chat_messages (thread_user_id, sender_id, sender_role, body) VALUES (?, ?, 'user', ?)",
        [user.id, user.id, body]
      );
      return json(res, 201, { ok: true });
    }

    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Metode tidak diizinkan." });
  } catch (e) {
    console.error("chat failed", e?.message);
    return json(res, 500, { error: "Chat tidak dapat diproses. Pastikan skema database terbaru sudah dijalankan." });
  }
}
