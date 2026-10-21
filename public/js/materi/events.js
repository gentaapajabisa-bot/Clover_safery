"use strict";
/* Delegasi event: klik, submit form, alarm, akun lokal. */

/* =========================================================
   Interaksi (delegasi)
   ========================================================= */
function slotMsg(form, text, ok) {
  const el = $("#form-msg") || $(".msg-slot", form);
  if (el) el.innerHTML = text ? `<div class="msg ${ok ? "ok" : "err"}">${esc(text)}</div>` : "";
}
document.addEventListener("click", async (e) => {
  const t = e.target.closest("[data-act]");
  if (!t) return;
  const act = t.dataset.act;
  if (act === "alarm") {
    Alarm.start();
    return;
  }
  if (act === "myth") {
    const i = +t.dataset.i;
    S.myth[i] = !S.myth[i];
    t.setAttribute("aria-expanded", String(!!S.myth[i]));
    $("#myth-a-" + i).hidden = !S.myth[i];
    return;
  }
  if (act === "scn-tab") {
    S.scn = +t.dataset.i;
    paintScn();
    return;
  }
  if (act === "scn-pick") {
    const i = +t.dataset.i;
    const p = S.picked[S.scn] || (S.picked[S.scn] = { last: null, set: [] });
    p.last = i;
    if (!p.set.includes(i)) p.set.push(i);
    paintScn(i);
    return;
  }
  if (act === "help-open") {
    S.help = S.help === t.dataset.k ? null : t.dataset.k;
    $$("#help-opts [data-act=help-open]").forEach((b) =>
      b.setAttribute("aria-expanded", String(b.dataset.k === S.help))
    );
    const pn = $("#help-panel");
    pn.hidden = !S.help;
    pn.innerHTML = S.help ? HELP_PANELS[S.help] : "";
    if (S.help) pn.focus();
    return;
  }
  if (act === "tab") {
    S.tab = t.dataset.t;
    render();
    return;
  }
  if (act === "logout") {
    Auth.logout();
    location.hash = "#/";
    render();
    toast("Kamu sudah keluar.");
    return;
  }
  if (act === "del-me") {
    const me = Auth.current();
    if (!me) return;
    if (
      me.role === "guru" &&
      Object.values(Auth.users()).filter((u) => u.role === "guru").length === 1 &&
      Object.keys(Auth.users()).length > 1
    ) {
      toast("Kamu satu-satunya Guru BK. Jadikan akun lain Guru BK sebelum menghapus akunmu.");
      return;
    }
    if (confirm("Hapus akunmu dari perangkat ini? Tindakan ini tidak bisa dibatalkan.")) {
      const u = Auth.users();
      delete u[me.username];
      Auth.save(u);
      Auth.logout();
      location.hash = "#/";
      render();
      toast("Akun dihapus.");
    }
    return;
  }
  if (act === "g-del") {
    const me = Auth.current();
    if (!me || me.role !== "guru") return;
    const u = Auth.users();
    const name = t.dataset.u;
    if (!u[name]) return;
    if (confirm(`Hapus akun “${name}” dari perangkat ini?`)) {
      delete u[name];
      Auth.save(u);
      render();
      toast("Akun dihapus.");
    }
    return;
  }
  if (act === "g-reset") {
    const me = Auth.current();
    if (!me || me.role !== "guru") return;
    const name = t.dataset.u;
    const u = Auth.users();
    if (!u[name]) return;
    const pw = prompt(`Ketik kata sandi sementara untuk “${name}” (min. 8 karakter, huruf dan angka):`);
    if (pw === null) return;
    const err = Auth.validPw(pw, name);
    if (err) {
      toast(err);
      return;
    }
    const salt = Auth.newSalt();
    u[name].salt = salt;
    u[name].hash = await Auth.hash(pw, salt);
    Auth.save(u);
    toast("Kata sandi diatur ulang. Sampaikan langsung kepada pemilik akun.");
    return;
  }
  if (act === "ref-save") {
    await saveReflectionHistory(t);
    return;
  }
  if (act === "ref-copy") {
    const R = S.ref;
    const lines = ["Refleksi Clover Safety (ditulis oleh saya sendiri)"];
    const add = (l, v) => {
      if (v && String(v).trim()) lines.push(l + ": " + v);
    };
    add("1. Pesan terpenting", R.text.q1);
    const q2n = [
      "Hadiah lalu menuntut imbalan",
      "Meminta dirahasiakan",
      "Memaksa meminta foto/data",
      "Mengajak bertemu diam-diam",
      "Menekan/mengancam",
      "Menjauhkan dari keluarga/teman",
      "Belum yakin",
    ];
    if (R.q2.length) lines.push("2. Tanda bahaya yang kupahami: " + R.q2.map((i) => q2n[i]).join("; "));
    add("3. Pentingnya privasi", R.text.q3t);
    add("5. Orang yang bisa kuhubungi", R.text.q5);
    add("6. Hal yang ingin kulakukan", R.text.q6);
    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast("Jawabanmu disalin. Tempelkan hanya jika kamu mau menunjukkannya.");
    } catch {
      toast("Tidak bisa menyalin otomatis di browser ini.");
    }
    return;
  }
  if (act === "tr-copy") {
    const text = S.trusted
      .filter((x) => x.r || x.c)
      .map((x) => `${x.r} — ${x.c}`)
      .join("\n");
    if (!text) {
      toast("Isi dulu setidaknya satu baris.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      toast("Daftar disalin.");
    } catch {
      toast("Tidak bisa menyalin otomatis di browser ini.");
    }
    return;
  }
});

document.addEventListener("change", (e) => {
  const t = e.target;
  if (t.matches("[data-cl]")) {
    const id = t.dataset.cl,
      v = +t.value;
    const st = S.checks[id] || (S.checks[id] = []);
    const i = st.indexOf(v);
    if (t.checked && i < 0) st.push(v);
    if (!t.checked && i >= 0) st.splice(i, 1);
    const c = $("#cnt-" + id);
    if (c) c.textContent = counterText(id);
    return;
  }
  if (t.matches("[data-bd]")) {
    const i = +t.dataset.bd;
    S.boundary[i] = +t.value;
    $("#bd-fb-" + i).hidden = false;
    return;
  }
  if (t.matches("[data-role]")) {
    $("#guru-code").hidden = t.value !== "guru";
    return;
  }
  if (t.matches("[data-q2]")) {
    const i = +t.dataset.q2;
    const a = S.ref.q2;
    const k = a.indexOf(i);
    if (t.checked && k < 0) a.push(i);
    if (!t.checked && k >= 0) a.splice(k, 1);
    return;
  }
  if (t.matches("[data-q4]")) {
    const i = +t.dataset.q4;
    const a = S.ref.q4;
    const k = a.indexOf(i);
    if (t.checked && k < 0) a.push(i);
    if (!t.checked && k >= 0) a.splice(k, 1);
    return;
  }
  if (t.matches("[data-q3]")) {
    S.ref.q3 = t.parentElement.textContent.trim();
    return;
  }
  if (t.matches("[data-ropt]")) {
    const i = +t.dataset.ropt;
    let a = S.ref.opts;
    if (t.checked) {
      if (i === 5) {
        a = S.ref.opts = [5];
        $$("[data-ropt]").forEach((x) => {
          if (+x.dataset.ropt !== 5) x.checked = false;
        });
      } else {
        a = S.ref.opts = a.filter((x) => x !== 5);
        if (!a.includes(i)) a.push(i);
        const n = $('[data-ropt="5"]');
        if (n) n.checked = false;
      }
    } else S.ref.opts = a.filter((x) => x !== i);
    $("#ref-help").hidden = !(S.ref.opts.includes(3) || S.ref.opts.includes(4));
    return;
  }
});
document.addEventListener("input", (e) => {
  const t = e.target;
  if (t.matches("[data-ref]")) {
    S.ref.text[t.dataset.ref] = t.value;
    return;
  }
  if (t.matches("[data-tr]")) {
    S.trusted[+t.dataset.tr][t.dataset.f] = t.value;
  }
});

document.addEventListener("submit", async (e) => {
  const f = e.target;
  if (f.id === "ref-form") {
    e.preventDefault();
    S.ref.done = true;
    $("#ref-end").hidden = false;
    $("#ref-end").scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }
  const kind = f.dataset.form;
  if (!kind) return;
  e.preventDefault();
  const btn = $("button[type=submit]", f);
  btn.disabled = true;
  try {
    if (kind === "login") {
      const r = await Auth.login($("#l-u").value, $("#l-p").value);
      if (r.err) {
        slotMsg(f, r.err, false);
        return;
      }
      location.href = "/dashboard";
      toast("Selamat datang kembali!");
    } else if (kind === "register") {
      if (!$("#r-ok").checked) {
        slotMsg(f, "Centang pernyataan persetujuan terlebih dahulu.", false);
        return;
      }
      const role = ($("input[name=role]:checked", f) || {}).value || "siswa";
      const r = await Auth.register({
        nickname: $("#r-n").value,
        username: $("#r-u").value,
        role,
        code: ($("#r-c") || {}).value || "",
        pw: $("#r-p").value,
        pw2: $("#r-p2").value,
      });
      if (r.err) {
        slotMsg(f, r.err, false);
        return;
      }
      render();
      toast("Akun dibuat. Selamat belajar!");
    } else if (kind === "nick") {
      const me = Auth.current();
      const v = $("#n-n").value.trim();
      if (v.length < 2 || v.length > 20) {
        slotMsg(f, "Nama panggilan harus 2–20 karakter.", false);
        return;
      }
      const u = Auth.users();
      u[me.username].nickname = v;
      Auth.save(u);
      render();
      toast("Nama panggilan diperbarui.");
    } else if (kind === "pw") {
      const me = Auth.current();
      const u = Auth.users();
      const rec = u[me.username];
      if ((await Auth.hash($("#p-o").value, rec.salt)) !== rec.hash) {
        slotMsg(f, "Kata sandi lama tidak cocok.", false);
        return;
      }
      const err = Auth.validPw($("#p-n").value, me.username);
      if (err) {
        slotMsg(f, err, false);
        return;
      }
      if ($("#p-n").value !== $("#p-n2").value) {
        slotMsg(f, "Konfirmasi kata sandi baru belum sama.", false);
        return;
      }
      rec.salt = Auth.newSalt();
      rec.hash = await Auth.hash($("#p-n").value, rec.salt);
      Auth.save(u);
      ["#p-o", "#p-n", "#p-n2"].forEach((s) => {
        $(s).value = "";
      });
      slotMsg(f, "Kata sandi berhasil diganti.", true);
    }
  } catch {
    slotMsg(f, "Terjadi kesalahan. Coba lagi.", false);
  } finally {
    if (btn.isConnected) btn.disabled = false;
  }
});

render();
