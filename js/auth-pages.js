const $ = s => document.querySelector(s);
async function api(path, data, method = "POST") {
  const res = await fetch(path, { method, credentials: "same-origin", headers: data ? {"Content-Type":"application/json"} : {}, body: data ? JSON.stringify(data) : undefined });
  let result = {};
  try { result = await res.json(); } catch {}
  if (!res.ok) throw new Error(result.error || "Permintaan gagal.");
  return result;
}
function message(text, type="error") {
  const el = $("#message"); if (!el) return;
  el.className = "msg " + type; el.textContent = text; el.hidden = !text;
}
const form = $("#auth-form");
if (form) form.addEventListener("submit", async e => {
  e.preventDefault();
  const btn = form.querySelector("button[type=submit]");
  btn.disabled = true; message("");
  try {
    const isRegister = form.dataset.mode === "register";
    const data = isRegister
      ? {name: $("#name").value, email: $("#email").value, password: $("#password").value}
      : {email: $("#email").value, password: $("#password").value};
    if (isRegister && data.password !== $("#confirm").value) throw new Error("Konfirmasi kata sandi belum sama.");
    await api(isRegister ? "/api/auth/register" : "/api/auth/login", data);
    location.href = "/dashboard";
  } catch (err) { message(err.message); }
  finally { btn.disabled = false; }
});
async function requireSession(admin=false) {
  try {
    const {user} = await api("/api/auth/me", null, "GET");
    if (!user) { location.replace("/login"); return null; }
    if (admin && user.role !== "admin") { location.replace("/dashboard"); return null; }
    return user;
  } catch { message("Backend belum siap. Periksa konfigurasi DATABASE_URL dan deployment."); return null; }
}
async function logout() {
  try { await api("/api/auth/logout", {}); } finally { location.href = "/login"; }
}
window.CloverAuth = {api, message, requireSession, logout};
