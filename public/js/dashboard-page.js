/* Dashboard pengguna (butuh common.js). */
document.addEventListener("DOMContentLoaded", async () => {
  $("#logout").addEventListener("click", logout);

  const user = await requireSession();
  if (!user) return;

  $("#welcome").textContent = `Halo, ${user.name}`;
  if (user.role === "admin") $("#admin-link").hidden = false;

  try {
    const data = await api("/api/dashboard", null, "GET");
    const activity = data.activity || [];
    const reports = data.reports || [];

    $("#activity").innerHTML = activity.length
      ? table(
          [
            ["Aktivitas", (a) => esc(a.action)],
            ["Detail", (a) => esc(a.details || "-")],
            ["Waktu", (a) => esc(fmtDate(a.created_at))],
          ],
          activity
        )
      : `<p class="empty">Belum ada aktivitas yang tercatat.</p>`;

    $("#reports").innerHTML = reports.length
      ? table(
          [
            ["Judul", (r) => esc(r.title)],
            ["Status", (r) => `<span class="pill">${esc(r.status)}</span>`],
            ["Dibuat", (r) => esc(fmtDate(r.created_at))],
          ],
          reports
        )
      : `<p class="empty">Belum ada laporan keamanan.</p>`;
  } catch (e) {
    message(e.message);
  }
});
