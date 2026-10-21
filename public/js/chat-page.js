/* Chat pengguna ↔ admin (butuh common.js). Polling ringan; berhenti saat tab tersembunyi. */
let lastId = 0;
let timer = null;
let sending = false;

function bubble(m) {
  return `<div class="bubble ${m.sender_role === "user" ? "mine" : ""}">${esc(m.body)}<time>${m.sender_role === "admin" ? "Admin · " : ""}${esc(fmtTime(m.created_at))}</time></div>`;
}

function append(messages, force) {
  if (!messages.length) return;
  const log = $("#chat-log");
  const stick = force || log.scrollHeight - log.scrollTop - log.clientHeight < 80;
  const empty = $("#chat-empty");
  if (empty) empty.remove();
  log.insertAdjacentHTML("beforeend", messages.map(bubble).join(""));
  lastId = Number(messages[messages.length - 1].id);
  if (stick) log.scrollTop = log.scrollHeight;
}

let loaded = false;
async function poll() {
  try {
    const { messages } = await api(`/api/chat?after=${lastId}`, null, "GET");
    append(messages, !loaded);
    loaded = true;
    const empty = $("#chat-empty");
    if (empty) empty.textContent = "Belum ada pesan. Tulis pesan pertamamu kepada admin.";
    message("");
  } catch (e) {
    message(e.message);
  }
}

function schedule() {
  clearInterval(timer);
  timer = setInterval(() => !document.hidden && poll(), 5000);
}

document.addEventListener("DOMContentLoaded", async () => {
  $("#logout").addEventListener("click", logout);
  const user = await requireSession();
  if (!user) return;
  if (user.role === "admin" && $("#admin-link")) $("#admin-link").hidden = false;

  await poll();
  schedule();
  document.addEventListener("visibilitychange", () => !document.hidden && poll());

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
    if (!body || sending) return;
    sending = true;
    $("#chat-send").disabled = true;
    try {
      await api("/api/chat", { body }, "POST");
      input.value = "";
      autosize();
      await poll();
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
