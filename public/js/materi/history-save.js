"use strict";
/* Menyimpan hasil kuis dan refleksi ke riwayat akun (server). Hanya terbaca oleh pemilik akun. */

async function postHistory(payload) {
  const res = await fetch("/api/history", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* bukan JSON */
  }
  if (!res.ok) {
    const err = new Error(data.error || "Gagal menyimpan riwayat.");
    err.status = res.status;
    throw err;
  }
}

const LOGIN_HINT = `Masuk dulu untuk menyimpan ke riwayat: <a href="/login">Masuk</a>.`;

/** Hasil kuis disimpan otomatis saat kuis selesai. */
async function saveQuizHistory() {
  const el = $("#quiz-save");
  if (!el || Q.saved) return;
  Q.saved = true;
  el.textContent = "Menyimpan hasil ke riwayat…";
  try {
    await postHistory({ kind: "kuis", answers: Q.log });
    el.innerHTML = `Hasil kuis tersimpan di <a href="/riwayat">Riwayat</a>. Hanya kamu yang bisa melihatnya.`;
  } catch (e) {
    Q.saved = false;
    el.innerHTML = e.status === 401 ? LOGIN_HINT : esc(e.message);
  }
}

/** Mengumpulkan pertanyaan + jawaban refleksi langsung dari formulir yang tampil (tanpa menyalin daftar opsi). */
function reflectionItems() {
  const form = $("#ref-form");
  if (!form) return [];
  const items = [];
  const typed = (root) =>
    $$("textarea", root)
      .map((t) => t.value.trim())
      .filter(Boolean);
  const picked = (root) => $$("input:checked + span", root).map((s) => s.textContent.trim());
  $$(".card, fieldset", form).forEach((box) => {
    const label = ($("h3, legend", box)?.textContent || "").trim();
    const values = [...picked(box), ...typed(box)];
    if (label && values.length) items.push({ label, value: values.join("; ") });
  });
  return items;
}

async function saveReflectionHistory(btn) {
  const el = $("#ref-save-status");
  const items = reflectionItems();
  if (!items.length) {
    el.textContent = "Isi dulu setidaknya satu jawaban sebelum menyimpan.";
    return;
  }
  btn.disabled = true;
  el.textContent = "Menyimpan…";
  try {
    await postHistory({ kind: "refleksi", items });
    el.innerHTML = `Refleksi tersimpan di <a href="/riwayat">Riwayat</a>. Hanya kamu yang bisa melihatnya.`;
  } catch (e) {
    btn.disabled = false;
    el.innerHTML = e.status === 401 ? LOGIN_HINT : esc(e.message);
  }
}
