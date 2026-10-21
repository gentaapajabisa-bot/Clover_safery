/* Kontak orang tepercaya. SEMUA query dibatasi `user_id = pengguna sesi`:
   hanya pemilik yang dapat melihat, menambah, mengubah, atau menghapus datanya.
   Tidak ada endpoint admin untuk data ini. */
import { getDb } from "../lib/db.js";
import { cleanPhone, cleanText, json, logActivity, requireUser, rowsOf, toId } from "../lib/security.js";

const MAX_CONTACTS = 20;
const COLUMNS = "id, name, relationship, phone, note, created_at";

function parseInput(body) {
  const name = cleanText(body?.name, 100);
  const relationship = cleanText(body?.relationship, 60);
  const phone = cleanPhone(body?.phone);
  const note = cleanText(body?.note, 200);
  if (!name || name.length < 2) return { error: "Nama wajib diisi (2–100 karakter)." };
  if (!relationship) return { error: "Hubungan/peran wajib diisi (maks. 60 karakter), mis. “Guru BK”." };
  if (phone === undefined) return { error: "Nomor telepon tidak valid (angka, spasi, +, -, maks. 30 karakter)." };
  if (note === undefined) return { error: "Catatan maksimal 200 karakter." };
  return { name, relationship, phone, note };
}

export default async function handler(req, res) {
  try {
    const user = await requireUser(req, res);
    if (!user) return;
    const db = getDb();

    if (req.method === "GET") {
      const result = await db.execute(`SELECT ${COLUMNS} FROM trusted_contacts WHERE user_id = ? ORDER BY id ASC LIMIT ${MAX_CONTACTS}`, [user.id]);
      return json(res, 200, { contacts: rowsOf(result), max: MAX_CONTACTS });
    }

    if (req.method === "POST") {
      const input = parseInput(req.body);
      if (input.error) return json(res, 400, { error: input.error });
      const count = rowsOf(await db.execute("SELECT COUNT(*) AS n FROM trusted_contacts WHERE user_id = ?", [user.id]))[0];
      if (Number(count?.n) >= MAX_CONTACTS) return json(res, 400, { error: `Maksimal ${MAX_CONTACTS} kontak tepercaya.` });
      await db.execute(
        "INSERT INTO trusted_contacts (user_id, name, relationship, phone, note) VALUES (?, ?, ?, ?, ?)",
        [user.id, input.name, input.relationship, input.phone, input.note]
      );
      await logActivity(db, user.id, "contact_add", "Kontak tepercaya ditambahkan");
      return json(res, 201, { ok: true });
    }

    if (req.method === "PUT" || req.method === "DELETE") {
      const id = toId(req.method === "PUT" ? req.body?.id : req.query?.id ?? req.body?.id);
      if (!id) return json(res, 400, { error: "Kontak tidak valid." });

      if (req.method === "PUT") {
        const input = parseInput(req.body);
        if (input.error) return json(res, 400, { error: input.error });
        await db.execute(
          "UPDATE trusted_contacts SET name = ?, relationship = ?, phone = ?, note = ? WHERE id = ? AND user_id = ?",
          [input.name, input.relationship, input.phone, input.note, id, user.id]
        );
      } else {
        await db.execute("DELETE FROM trusted_contacts WHERE id = ? AND user_id = ?", [id, user.id]);
        await logActivity(db, user.id, "contact_delete", "Kontak tepercaya dihapus");
      }
      return json(res, 200, { ok: true });
    }

    res.setHeader("Allow", "GET, POST, PUT, DELETE");
    return json(res, 405, { error: "Metode tidak diizinkan." });
  } catch (e) {
    console.error("contacts failed", e?.message);
    return json(res, 500, { error: "Kontak tepercaya tidak dapat diproses. Pastikan skema database terbaru sudah dijalankan." });
  }
}
