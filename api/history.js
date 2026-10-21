/* Riwayat jawaban kuis & refleksi. SEMUA query dibatasi `user_id = pengguna sesi`:
   hanya pemilik yang dapat membaca, menyimpan, atau menghapus. Tidak ada endpoint admin. */
import { getDb } from "../lib/db.js";
import { cleanText, json, logActivity, requireUser, rowsOf, toId } from "../lib/security.js";

const MAX_ENTRIES = 200;
const clip = (v, n) => String(v ?? "").slice(0, n);

/** Membangun ulang payload dari input yang sudah dibatasi bentuk & panjangnya (tidak menyimpan JSON mentah). */
function buildEntry(body) {
  const kind = body?.kind;
  if (kind === "kuis") {
    const answers = Array.isArray(body.answers) ? body.answers.slice(0, 20) : [];
    if (!answers.length) return { error: "Data kuis kosong." };
    const clean = answers.map((a) => ({
      q: clip(a?.q, 300),
      chosen: clip(a?.chosen, 200),
      correct: clip(a?.correct, 200),
      ok: a?.ok === true,
      explanation: clip(a?.explanation, 300),
    }));
    const ok = clean.filter((a) => a.ok).length;
    return {
      kind,
      title: "Kuis latihan",
      summary: `${ok} dari ${clean.length} jawaban sesuai saran keselamatan`,
      data: { answers: clean },
    };
  }
  if (kind === "refleksi") {
    const items = (Array.isArray(body.items) ? body.items : [])
      .slice(0, 20)
      .map((i) => ({ label: clip(i?.label, 200), value: clip(i?.value, 1500) }))
      .filter((i) => i.label && i.value.trim());
    if (!items.length) return { error: "Isi dulu setidaknya satu jawaban refleksi." };
    const first = items.find((i) => i.value.trim());
    return { kind, title: "Refleksi setelah puzzle", summary: clip(first.value.replace(/\s+/g, " "), 120), data: { items } };
  }
  return { error: "Jenis riwayat tidak dikenal." };
}

export default async function handler(req, res) {
  try {
    const user = await requireUser(req, res);
    if (!user) return;
    const db = getDb();

    if (req.method === "GET") {
      const id = toId(req.query?.id);
      if (req.query?.id !== undefined) {
        if (!id) return json(res, 400, { error: "Riwayat tidak valid." });
        const row = rowsOf(
          await db.execute("SELECT id, kind, title, summary, data, created_at FROM user_history WHERE id = ? AND user_id = ? LIMIT 1", [id, user.id])
        )[0];
        if (!row) return json(res, 404, { error: "Riwayat tidak ditemukan." });
        let data = {};
        try {
          data = JSON.parse(row.data);
        } catch {
          /* data rusak: tampilkan kosong */
        }
        return json(res, 200, { entry: { ...row, data } });
      }
      const list = rowsOf(
        await db.execute(
          `SELECT id, kind, title, summary, created_at FROM user_history WHERE user_id = ? ORDER BY id DESC LIMIT ${MAX_ENTRIES}`,
          [user.id]
        )
      );
      return json(res, 200, { history: list });
    }

    if (req.method === "POST") {
      const entry = buildEntry(req.body);
      if (entry.error) return json(res, 400, { error: entry.error });
      const count = rowsOf(await db.execute("SELECT COUNT(*) AS n FROM user_history WHERE user_id = ?", [user.id]))[0];
      if (Number(count?.n) >= MAX_ENTRIES) return json(res, 400, { error: `Riwayat penuh (maks. ${MAX_ENTRIES}). Hapus beberapa dulu di halaman Riwayat.` });
      const text = JSON.stringify(entry.data);
      if (text.length > 30000) return json(res, 400, { error: "Data terlalu besar." });
      await db.execute("INSERT INTO user_history (user_id, kind, title, summary, data) VALUES (?, ?, ?, ?, ?)", [
        user.id,
        entry.kind,
        entry.title,
        cleanText(entry.summary, 300) || null,
        text,
      ]);
      await logActivity(db, user.id, "history_add", `Riwayat ${entry.kind} disimpan`);
      return json(res, 201, { ok: true });
    }

    if (req.method === "DELETE") {
      const id = toId(req.query?.id);
      if (!id) return json(res, 400, { error: "Riwayat tidak valid." });
      await db.execute("DELETE FROM user_history WHERE id = ? AND user_id = ?", [id, user.id]);
      return json(res, 200, { ok: true });
    }

    res.setHeader("Allow", "GET, POST, DELETE");
    return json(res, 405, { error: "Metode tidak diizinkan." });
  } catch (e) {
    console.error("history failed", e?.message);
    return json(res, 500, { error: "Riwayat tidak dapat diproses. Pastikan skema database terbaru sudah dijalankan." });
  }
}
