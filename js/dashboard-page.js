const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
document.addEventListener("DOMContentLoaded", async () => {
  $("#logout").addEventListener("click", CloverAuth.logout);
  const user = await CloverAuth.requireSession();
  if (!user) return;
  $("#welcome").textContent = `Halo, ${user.name}`;
  if (user.role === "admin") $("#admin-link").hidden = false;
  try {
    const data = await CloverAuth.api("/api/dashboard", null, "GET");
    const activity = data.activity || [];
    $("#activity").innerHTML = activity.length ? `<div class="tablewrap"><table><thead><tr><th>Aktivitas</th><th>Detail</th><th>Waktu</th></tr></thead><tbody>${activity.map(a=>`<tr><td>${esc(a.action)}</td><td>${esc(a.details || "-")}</td><td>${esc(a.created_at || "-")}</td></tr>`).join("")}</tbody></table></div>` : `<p class="empty">Belum ada aktivitas yang tercatat.</p>`;
    const reports = data.reports || [];
    $("#reports").innerHTML = reports.length ? `<div class="tablewrap"><table><thead><tr><th>Judul</th><th>Status</th><th>Dibuat</th></tr></thead><tbody>${reports.map(r=>`<tr><td>${esc(r.title)}</td><td><span class="pill">${esc(r.status)}</span></td><td>${esc(r.created_at || "-")}</td></tr>`).join("")}</tbody></table></div>` : `<p class="empty">Belum ada laporan keamanan.</p>`;
  } catch (e) { CloverAuth.message(e.message); }
});
