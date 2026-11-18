/* Fungsi bersama untuk halaman login, daftar, dashboard, dan admin. */
const $ = (selector) => document.querySelector(selector);

const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]
  );

/** Menampilkan tanggal dari database (UTC) dalam zona waktu perangkat. */
function fmtDate(value) {
  if (!value) return "-";
  const raw = String(value);
  const hasZone = /[zZ]|[+-]\d\d:?\d\d$/.test(raw);
  const d = new Date(hasZone ? raw : raw.replace(" ", "T") + "Z");
  return Number.isNaN(d.getTime()) ? raw : d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

async function api(path, data, method = "POST") {
  const res = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
  });
  let result = {};
  try {
    result = await res.json();
  } catch {
    /* respons bukan JSON */
  }
  if (!res.ok) throw new Error(result.error || "Permintaan gagal.");
  return result;
}

function message(text, type = "error") {
  const el = $("#message");
  if (!el) return;
  el.className = "msg " + type;
  el.textContent = text;
  el.hidden = !text;
}

async function requireSession(admin = false) {
  try {
    const { user } = await api("/api/auth/me", null, "GET");
    if (!user) {
      location.replace("/login");
      return null;
    }
    if (admin && user.role !== "admin") {
      location.replace("/dashboard");
      return null;
    }
    return user;
  } catch {
    message("Backend belum siap. Periksa konfigurasi DATABASE_URL dan deployment.");
    return null;
  }
}

async function logout() {
  try {
    await api("/api/auth/logout", {});
  } finally {
    location.href = "/login";
  }
}

/** Tabel sederhana: kolom = [judul, fungsi(baris) → HTML aman]. */
function table(columns, rows) {
  const head = columns.map(([title]) => `<th>${esc(title)}</th>`).join("");
  const body = rows.map((row) => `<tr>${columns.map(([, cell]) => `<td>${cell(row)}</td>`).join("")}</tr>`).join("");
  return `<div class="tablewrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
}
