/* Panel admin (butuh common.js). Hak akses selalu diperiksa ulang di backend. */
document.addEventListener("DOMContentLoaded", async () => {
  $("#logout").addEventListener("click", logout);

  const user = await requireSession(true);
  if (!user) return;

  try {
    const [stats, list] = await Promise.all([
      api("/api/admin/stats", null, "GET"),
      api("/api/admin/users", null, "GET"),
    ]);

    $("#total-users").textContent = stats.users.total ?? 0;
    $("#active-users").textContent = stats.users.active ?? 0;
    $("#pending-reports").textContent = stats.reports.pending ?? 0;

    const actionCell = (u) => {
      if (String(u.id) === String(user.id)) return "Akun kamu";
      const active = u.status === "active";
      return `<button class="logout" data-user="${Number(u.id)}" data-status="${active ? "suspended" : "active"}">${active ? "Tangguhkan" : "Aktifkan"}</button>`;
    };

    $("#users").innerHTML = list.users.length
      ? table(
          [
            ["Nama", (u) => esc(u.name)],
            ["Email", (u) => esc(u.email)],
            ["Peran", (u) => esc(u.role)],
            ["Status", (u) => `<span class="pill ${u.status === "suspended" ? "off" : ""}">${esc(u.status)}</span>`],
            ["Aksi", actionCell],
          ],
          list.users
        )
      : `<p class="empty">Belum ada pengguna.</p>`;

    $("#activity").innerHTML = stats.activity.length
      ? table(
          [
            ["Pengguna ID", (a) => esc(a.user_id ?? "-")],
            ["Aktivitas", (a) => esc(a.action)],
            ["Detail", (a) => esc(a.details || "-")],
            ["Waktu", (a) => esc(fmtDate(a.created_at))],
          ],
          stats.activity
        )
      : `<p class="empty">Belum ada aktivitas.</p>`;
  } catch (e) {
    message(e.message);
  }

  $("#users").addEventListener("click", async (e) => {
    const b = e.target.closest("button[data-user]");
    if (!b) return;
    if (!confirm(`Ubah status akun ini menjadi ${b.dataset.status}?`)) return;
    b.disabled = true;
    try {
      await api("/api/admin/users", { id: Number(b.dataset.user), status: b.dataset.status }, "PATCH");
      location.reload();
    } catch (err) {
      message(err.message);
      b.disabled = false;
    }
  });
});
