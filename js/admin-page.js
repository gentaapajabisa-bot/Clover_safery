const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
document.addEventListener("DOMContentLoaded", async () => {
  $("#logout").addEventListener("click", CloverAuth.logout);
  const user = await CloverAuth.requireSession(true);
  if (!user) return;
  try {
    const stats = await CloverAuth.api("/api/admin/stats", null, "GET");
    $("#total-users").textContent = stats.users.total ?? 0;
    $("#active-users").textContent = stats.users.active ?? 0;
    $("#pending-reports").textContent = stats.reports.pending ?? 0;
    const list = await CloverAuth.api("/api/admin/users", null, "GET");
    $("#users").innerHTML = list.users.length ? `<div class="tablewrap"><table><thead><tr><th>Nama</th><th>Email</th><th>Peran</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${list.users.map(u=>`<tr><td>${esc(u.name)}</td><td>${esc(u.email)}</td><td>${esc(u.role)}</td><td><span class="pill ${u.status==="suspended"?"off":""}">${esc(u.status)}</span></td><td>${u.id!==user.id?`<button class="logout" data-user="${Number(u.id)}" data-status="${u.status==="active"?"suspended":"active"}">${u.status==="active"?"Tangguhkan":"Aktifkan"}</button>`:"Akun kamu"}</td></tr>`).join("")}</tbody></table></div>` : `<p class="empty">Belum ada pengguna.</p>`;
    $("#activity").innerHTML = stats.activity.length ? `<div class="tablewrap"><table><thead><tr><th>Pengguna ID</th><th>Aktivitas</th><th>Detail</th><th>Waktu</th></tr></thead><tbody>${stats.activity.map(a=>`<tr><td>${esc(a.user_id ?? "-")}</td><td>${esc(a.action)}</td><td>${esc(a.details || "-")}</td><td>${esc(a.created_at || "-")}</td></tr>`).join("")}</tbody></table></div>` : `<p class="empty">Belum ada aktivitas.</p>`;
  } catch(e) { CloverAuth.message(e.message); }
  $("#users").addEventListener("click", async e => {
    const b = e.target.closest("button[data-user]"); if (!b) return;
    if (!confirm(`Ubah status akun ini menjadi ${b.dataset.status}?`)) return;
    b.disabled = true;
    try { await CloverAuth.api("/api/admin/users", {id:Number(b.dataset.user),status:b.dataset.status}, "PATCH"); location.reload(); }
    catch(err) { CloverAuth.message(err.message); b.disabled=false; }
  });
});
