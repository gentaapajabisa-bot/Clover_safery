/* Halaman profil: data diri, foto, dan kata sandi (butuh common.js). */
const AVATAR_SIZE = 256;

/** Memotong persegi dari tengah, memperkecil, lalu mengeluarkan JPEG kecil (data URL). */
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Foto tidak dapat dibaca."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("File itu bukan gambar yang bisa dibuka."));
      img.onload = () => {
        const side = Math.min(img.width, img.height);
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = AVATAR_SIZE;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff"; // PNG transparan → latar putih saat jadi JPEG
        ctx.fillRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);
        ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, AVATAR_SIZE, AVATAR_SIZE);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  $("#logout").addEventListener("click", logout);
  const user = await requireSession();
  if (!user) return;
  if (user.role === "admin" && $("#admin-link")) $("#admin-link").hidden = false;

  const paint = (p) => {
    $("#avatar-view").innerHTML = avatarHtml(p, "xl");
    $("#avatar-remove").hidden = !(Number(p.avatar_version) > 0);
    $("#p-title").textContent = p.name;
    $("#p-sub").textContent = `${p.email} · ${p.role === "admin" ? "Admin" : "Pengguna"} · bergabung ${fmtDate(p.created_at)}`;
    $("#p-name").value = p.name;
    $("#p-email").value = p.email;
    $("#p-phone").value = p.phone || "";
    $("#p-bio").value = p.bio || "";
    $("#bio-count").textContent = $("#p-bio").value.length;
    initChrome(p); // perbarui chip di topbar
  };

  try {
    paint((await api("/api/profile", null, "GET")).profile);
  } catch (e) {
    return message(e.message);
  }

  $("#p-bio").addEventListener("input", () => ($("#bio-count").textContent = $("#p-bio").value.length));

  $("#profile-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      const { profile } = await api(
        "/api/profile",
        { name: $("#p-name").value, phone: $("#p-phone").value, bio: $("#p-bio").value },
        "PATCH"
      );
      paint(profile);
      message("Profil disimpan.", "ok");
    } catch (err) {
      message(err.message);
    } finally {
      btn.disabled = false;
    }
  });

  // Foto: pilih file → perkecil di browser → unggah.
  const pick = $("#avatar-pick");
  pick.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      $("#avatar-file").click();
    }
  });
  $("#avatar-file").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return message("Pilih file gambar (JPG, PNG, WebP, atau GIF).");
    if (file.size > 15 * 1024 * 1024) return message("Ukuran foto terlalu besar (maksimal 15 MB).");
    pick.setAttribute("aria-busy", "true");
    try {
      const avatar = await resizeImage(file);
      const { profile } = await api("/api/profile", { avatar }, "POST");
      paint(profile);
      message("Foto profil diperbarui.", "ok");
    } catch (err) {
      message(err.message);
    } finally {
      pick.removeAttribute("aria-busy");
    }
  });
  $("#avatar-remove").addEventListener("click", async () => {
    if (!confirm("Hapus foto profil?")) return;
    try {
      const { profile } = await api("/api/profile", null, "DELETE");
      paint(profile);
      message("Foto profil dihapus.", "ok");
    } catch (err) {
      message(err.message);
    }
  });

  $("#password-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const next = $("#pw-new").value;
    if (next !== $("#pw-confirm").value) return message("Konfirmasi kata sandi baru belum sama.");
    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    try {
      await api("/api/profile", { current_password: $("#pw-current").value, new_password: next }, "PATCH");
      e.target.reset();
      message("Kata sandi diganti. Perangkat lain telah dikeluarkan.", "ok");
    } catch (err) {
      message(err.message);
    } finally {
      btn.disabled = false;
    }
  });
});
