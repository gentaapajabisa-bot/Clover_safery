/* Kontak tepercaya (butuh common.js). Data hanya milik pengguna yang login. */
let contacts = [];
let max = 20;

const telHref = (phone) => "tel:" + String(phone).replace(/[^0-9+]/g, "");

function render() {
  $("#c-count").textContent = `${contacts.length}/${max}`;
  $("#contacts").innerHTML = contacts.length
    ? `<div class="contact-list">${contacts
        .map(
          (c) => `<article class="contact-card">
            <h3>${esc(c.name)}</h3>
            <span class="rel">${esc(c.relationship)}</span>
            ${c.phone ? `<span>${esc(c.phone)}</span>` : ""}
            ${c.note ? `<span class="note">${esc(c.note)}</span>` : ""}
            <div class="row-actions">
              ${c.phone ? `<a class="btn-sm primary" href="${esc(telHref(c.phone))}">Telepon</a>` : ""}
              <button class="logout" type="button" data-edit="${Number(c.id)}">Ubah</button>
              <button class="logout danger" type="button" data-del="${Number(c.id)}">Hapus</button>
            </div>
          </article>`
        )
        .join("")}</div>`
    : `<p class="empty">Belum ada kontak. Tambahkan orang dewasa yang kamu percaya, misalnya guru BK, orang tua, atau kerabat.</p>`;
}

async function load() {
  const data = await api("/api/contacts", null, "GET");
  contacts = data.contacts || [];
  max = data.max || max;
  render();
}

function resetForm() {
  $("#contact-form").reset();
  $("#c-id").value = "";
  $("#form-title").textContent = "Tambah kontak";
  $("#c-submit").textContent = "Simpan kontak";
  $("#c-cancel").hidden = true;
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
    $("#contacts").innerHTML = "";
  }

  $("#contact-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = $("#c-id").value;
    const data = {
      name: $("#c-name").value,
      relationship: $("#c-rel").value,
      phone: $("#c-phone").value,
      note: $("#c-note").value,
    };
    const btn = $("#c-submit");
    btn.disabled = true;
    try {
      if (id) await api("/api/contacts", { ...data, id: Number(id) }, "PUT");
      else await api("/api/contacts", data, "POST");
      resetForm();
      await load();
      message(id ? "Kontak diperbarui." : "Kontak ditambahkan.", "ok");
    } catch (err) {
      message(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  $("#c-cancel").addEventListener("click", resetForm);

  $("#contacts").addEventListener("click", async (e) => {
    const edit = e.target.closest("[data-edit]");
    const del = e.target.closest("[data-del]");
    if (edit) {
      const c = contacts.find((x) => Number(x.id) === Number(edit.dataset.edit));
      if (!c) return;
      $("#c-id").value = c.id;
      $("#c-name").value = c.name;
      $("#c-rel").value = c.relationship;
      $("#c-phone").value = c.phone || "";
      $("#c-note").value = c.note || "";
      $("#form-title").textContent = "Ubah kontak";
      $("#c-submit").textContent = "Simpan perubahan";
      $("#c-cancel").hidden = false;
      $("#c-name").focus();
      $("#contact-form").scrollIntoView({ behavior: "smooth", block: "center" });
    } else if (del) {
      if (!confirm("Hapus kontak ini?")) return;
      del.disabled = true;
      try {
        await api(`/api/contacts?id=${Number(del.dataset.del)}`, null, "DELETE");
        if ($("#c-id").value === del.dataset.del) resetForm();
        await load();
        message("Kontak dihapus.", "ok");
      } catch (err) {
        message(err.message);
        del.disabled = false;
      }
    }
  });
});
