/* Form login & daftar (butuh common.js dan loader.js). */
const form = $("#auth-form");
const LOADER_MIN_MS = 2800; // video bunga mekar diputar minimal selama ini sebelum pindah ke dashboard

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type=submit]");
    btn.disabled = true;
    message("");
    let success = false;
    try {
      const isRegister = form.dataset.mode === "register";
      const data = { email: $("#email").value, password: $("#password").value };
      if (isRegister) {
        data.name = $("#name").value;
        if (data.password !== $("#confirm").value) throw new Error("Konfirmasi kata sandi belum sama.");
      }
      const started = Date.now();
      if (window.csLoader) window.csLoader.show();
      await api(isRegister ? "/api/auth/register" : "/api/auth/login", data);
      success = true;
      const wait = Math.max(0, LOADER_MIN_MS - (Date.now() - started));
      setTimeout(() => {
        location.href = "/dashboard";
      }, wait);
    } catch (err) {
      if (window.csLoader) window.csLoader.hide();
      message(err.message);
    } finally {
      if (!success) btn.disabled = false;
    }
  });
}
