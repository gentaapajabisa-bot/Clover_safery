/* Chat sisi admin (butuh common.js). Hak admin diperiksa ulang di backend. */
let current = null; // { id, name, email, avatar_version }
let lastId = 0;
let sending = false;

const bubble = (m) =>
  `<div class="bubble ${m.sender_role === "admin" ? "mine" : ""}">${esc(m.body)}<time>${esc(fmtTime(m.created_at))}</time></div>`;

async function loadThreads() {
  const { threads } = await api("/api/admin/chat", null, "GET");
  $("#threads").innerHTML = threads.length
    ? threads
        .map((t) => {
          const u = { id: t.user_id, name: t.name, avatar_version: t.avatar_version };
          const unread = Number(t.unread) || 0;
          return `<button type="button" class="thread ${current && Number(current.id) === Number(t.user_id) ? "active" : ""}" data-user="${Number(t.user_id)}">
            ${avatarHtml(u, "lg")}
            <span class="thread-body"><strong>${esc(t.name)}</strong><span>${esc((t.last_role === "admin" ? "Kamu: " : "") + t.last_body)}</span></span>
            ${unread ? `<span class="badge">${unread}</span>` : ""}
          </button>`;
        })
        .join("")
    : `<p class="empty" style="padding:18px">Belum ada pesan dari pengguna.</p>`;
}

async function loadMessages(reset) {
  if (!current) return;
  const data = await api(`/api/admin/chat?user=${Number(current.id)}&after=${reset ? 0 : lastId}`, null, "GET");
  current = data.user;
  const log = $("#chat-log");
  if (reset) log.innerHTML = "";
  if (data.messages.length) {
    const stick = reset || log.scrollHeight - log.scrollTop - log.clientHeight < 80;
    log.insertAdjacentHTML("beforeend", data.messages.map(bubble).join(""));
    lastId = Number(data.messages[data.messages.length - 1].id);
    if (stick) log.scrollTop = log.scrollHeight;
  }
}

async function openThread(id) {
  current = { id };
  lastId = 0;
  await loadMessages(true);
  $("#thread-head").innerHTML = `${avatarHtml(current, "lg")}<div><strong>${esc(current.name)}</strong><small>${esc(current.email)}</small></div>`;
  $("#chat-form").hidden = false;
  $("#chat-input").focus();
  await loadThreads();
  initChrome(window.__me);
}

document.addEventListener("DOMContentLoaded", async () => {
  $("#logout").addEventListener("click", logout);
  const user = await requireSession(true);
  if (!user) return;
  window.__me = user;

  try {
    await loadThreads();
  } catch (e) {
    return message(e.message);
  }

  $("#threads").addEventListener("click", (e) => {
    const b = e.target.closest("[data-user]");
    if (b) openThread(Number(b.dataset.user)).catch((err) => message(err.message));
  });

  setInterval(async () => {
    if (document.hidden) return;
    try {
      await loadThreads();
      await loadMessages(false);
    } catch {
      /* percobaan berikutnya akan mencoba lagi */
    }
  }, 5000);

  const input = $("#chat-input");
  const autosize = () => {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 140) + "px";
  };
  input.addEventListener("input", autosize);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      $("#chat-form").requestSubmit();
    }
  });
  $("#chat-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = input.value.trim();
    if (!body || !current || sending) return;
    sending = true;
    $("#chat-send").disabled = true;
    try {
      await api("/api/admin/chat", { user_id: Number(current.id), body }, "POST");
      input.value = "";
      autosize();
      await loadMessages(false);
      await loadThreads();
      $("#chat-log").scrollTop = $("#chat-log").scrollHeight;
    } catch (err) {
      message(err.message);
    } finally {
      sending = false;
      $("#chat-send").disabled = false;
      input.focus();
    }
  });
});
