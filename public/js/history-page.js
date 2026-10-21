/* Riwayat kuis & refleksi (butuh common.js). Data hanya milik pengguna yang login. */
let entries = [];
let filter = "all";
const KIND = { kuis: "Kuis", refleksi: "Refleksi" };
const details = new Map(); // id → HTML detail (sudah di-escape)

function detailHtml(entry) {
  const d = entry.data || {};
  let body = "";
  if (entry.kind === "kuis") {
    body = (d.answers || [])
      .map(
        (a, i) => `<dt>${i + 1}. ${esc(a.q)}</dt>
          <dd>Jawabanmu: ${esc(a.chosen)} — <span class="${a.ok ? "ok" : "no"}">${a.ok ? "sesuai saran keselamatan" : "perlu dipikirkan lagi"}</span></dd>
          ${a.ok ? "" : `<dd>Jawaban yang disarankan: ${esc(a.correct)}</dd>`}
          <dd class="muted">${esc(a.explanation)}</dd>`
      )
      .join("");
  } else {
    body = (d.items || []).map((i) => `<dt>${esc(i.label)}</dt><dd>${esc(i.value)}</dd>`).join("");
  }
  return `<dl>${body || "<dd>Tidak ada isi.</dd>"}</dl>
    <div class="row-actions"><button class="logout danger" type="button" data-del="${Number(entry.id)}">Hapus entri ini</button></div>`;
}

function render() {
  const list = entries.filter((e) => filter === "all" || e.kind === filter);
  $("#history").innerHTML = list.length
    ? list
        .map(
          (e) => `<article class="hist" data-id="${Number(e.id)}">
            <button class="hist-head" type="button" aria-expanded="false" data-open="${Number(e.id)}">
              <span class="pill">${esc(KIND[e.kind] || e.kind)}</span>
              <span class="hist-title"><strong>${esc(e.title)}</strong><span>${esc(e.summary || "")} · ${esc(fmtDate(e.created_at))}</span></span>
              <span aria-hidden="true">▾</span>
            </button>
            <div class="hist-body" hidden></div>
          </article>`
        )
        .join("")
    : `<p class="empty">${entries.length ? "Tidak ada entri untuk filter ini." : "Belum ada riwayat. Selesaikan kuis atau refleksi di materi, lalu hasilnya muncul di sini."}</p>`;
}

async function load() {
  entries = (await api("/api/history", null, "GET")).history || [];
  render();
}

document.addEventListener("DOMContentLoaded", async () => {
  $("#logout").addEventListener("click", logout);
  const user = await requireSession();
  if (!user) return;
  if (user.role === "admin" && $("#admin-link")) $("#admin-link").hidden = false;

  try {
    await load();
  } catch (e) {
    message(e.message);
    $("#history").innerHTML = "";
  }

  document.querySelector(".filters").addEventListener("click", (e) => {
    const b = e.target.closest("[data-filter]");
    if (!b) return;
    filter = b.dataset.filter;
    document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("active", c === b));
    render();
  });

  $("#history").addEventListener("click", async (e) => {
    const open = e.target.closest("[data-open]");
    const del = e.target.closest("[data-del]");
    if (open) {
      const card = open.closest(".hist");
      const body = $(".hist-body", card);
      const show = body.hidden;
      if (show && !body.innerHTML) {
        body.innerHTML = `<p class="empty">Memuat…</p>`;
        try {
          const { entry } = await api(`/api/history?id=${Number(open.dataset.open)}`, null, "GET");
          body.innerHTML = detailHtml(entry);
        } catch (err) {
          body.innerHTML = "";
          return message(err.message);
        }
      }
      body.hidden = !show;
      open.setAttribute("aria-expanded", String(show));
    } else if (del) {
      if (!confirm("Hapus entri riwayat ini?")) return;
      del.disabled = true;
      try {
        await api(`/api/history?id=${Number(del.dataset.del)}`, null, "DELETE");
        await load();
        message("Entri dihapus.", "ok");
      } catch (err) {
        message(err.message);
        del.disabled = false;
      }
    }
  });
});
