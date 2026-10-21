/* Form login & daftar (butuh common.js). */
const form = $("#auth-form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    message("");
    try {
      const isRegister = form.dataset.mode === "register";
      const data = { email: $("#email").value, password: $("#password").value };
      if (isRegister) {
        data.name = $("#name").value;
        if (data.password !== $("#confirm").value) throw new Error("Konfirmasi kata sandi belum sama.");
      }
      await api(isRegister ? "/api/auth/register" : "/api/auth/login", data);
      location.href = "/dashboard";
    } catch (err) {
      message(err.message);
    } finally {
      btn.disabled = false;
    }
  });
}

// Sudah punya sesi aktif? Tidak perlu login lagi.
if (form) {
  api("/api/auth/me", null, "GET")
    .then(({ user }) => {
      if (user) location.replace("/dashboard");
    })
    .catch(() => {});
}
