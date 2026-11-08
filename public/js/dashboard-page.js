/* Dashboard pengguna (butuh common.js). */
document.addEventListener("DOMContentLoaded", async () => {
  $("#logout").addEventListener("click", logout);

  const user = await requireSession();
  if (!user) return;

  $("#welcome").textContent = `Halo, ${user.name}`;
  if (user.role === "admin") $("#admin-link").hidden = false;

  paintLearning();

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

/** Ringkasan kemajuan belajar + tautan ke langkah berikutnya. */
function paintLearning() {
  if (typeof Progress === "undefined") return;
  const n = Progress.doneCount(),
    total = Progress.STEPS.length,
    nxt = Progress.next();
  $("#learn-title").textContent = n === 0 ? "Mulai belajar" : nxt ? "Lanjutkan belajar" : "Semua langkah selesai 🎉";
  const game = `Pangkat: ${Progress.rank()} · ${Progress.xp()} XP. `;
  $("#learn-text").textContent = nxt
    ? `${game}${n} dari ${total} level selesai. Berikutnya: ${nxt.label}.`
    : `${game}${n} dari ${total} level selesai. Kamu boleh mengulang materi kapan saja.`;
  const bar = $("#learn-prog");
  bar.setAttribute("aria-valuenow", String(n));
  $("i", bar).style.width = (n / total) * 100 + "%";
  $("#learn-link").setAttribute("href", nxt ? "/belajar#/" + nxt.key : "/belajar");
  $("#learn-link").textContent = n === 0 ? "Mulai belajar →" : nxt ? "Lanjutkan →" : "Buka materi →";
}
