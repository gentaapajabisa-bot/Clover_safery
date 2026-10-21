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
  if (text) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
}

/** URL foto profil (kosong bila belum ada). `v` memaksa browser memuat ulang saat foto diganti. */
function avatarSrc(user) {
  return user && Number(user.avatar_version) > 0
    ? `/api/profile?avatar=${Number(user.id)}&v=${Number(user.avatar_version)}`
    : "";
}

/** HTML avatar: foto bila ada, jika tidak huruf awal nama. Semua nilai di-escape. */
function avatarHtml(user, size = "") {
  const cls = `avatar ${size}`.trim();
  const src = avatarSrc(user);
  if (src) return `<span class="${cls}"><img src="${esc(src)}" alt="" loading="lazy" /></span>`;
  const initial = (String(user?.name || "?").trim()[0] || "?").toUpperCase();
  return `<span class="${cls}" aria-hidden="true">${esc(initial)}</span>`;
}

/** Mengisi chip profil di topbar dan lencana pesan belum dibaca di sidebar. */
function initChrome(user) {
  const chip = $("#me-chip");
  if (chip) {
    chip.innerHTML = `${avatarHtml(user)}<span class="me-name">${esc(user.name)}</span>`;
    chip.hidden = false;
  }
  const badge = $("[data-chat-badge]");
  if (badge) {
    const url = user.role === "admin" && badge.dataset.chatBadge === "admin" ? "/api/admin/chat?count=1" : "/api/chat?count=1";
    api(url, null, "GET")
      .then(({ unread }) => {
        if (unread > 0) {
          badge.textContent = unread > 99 ? "99+" : String(unread);
          badge.hidden = false;
        }
      })
      .catch(() => {});
  }
}

/** Format jam singkat untuk gelembung chat. */
function fmtTime(value) {
  return fmtDate(value);
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
    initChrome(user);
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
