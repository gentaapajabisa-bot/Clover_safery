# Clover Safety

Versi pengembangan Clover Safety: edukasi digital + login berbasis server + dashboard pengguna + panel admin dengan TiDB Cloud Serverless dan Vercel Functions.

## Fitur yang dipertahankan
- Materi edukasi keselamatan digital, simulasi, kuis, kamus, pengaturan aksesibilitas dan alarm lokal dari aplikasi awal.
- Identitas/branding diperbarui menjadi Clover Safety.
- Halaman terpisah `/login`, `/register`, `/dashboard`, dan `/admin`.
- Backend API untuk daftar/login/logout, pemeriksaan sesi, dashboard, statistik admin dan pengelolaan status pengguna.
- Password disimpan dengan scrypt; sesi memakai token acak di cookie HttpOnly/Secure/SameSite dan hash token di database.

## Setup database TiDB
1. Buat cluster TiDB Cloud Starter/Essential yang mendukung TiDB Cloud Serverless Driver.
2. Buka SQL Editor dan jalankan `sql/schema.sql` (jika console sudah memilih database `clover_safety`, hapus baris `CREATE DATABASE`/`USE` jika tidak didukung dalam editor).
3. Di Vercel > Settings > Environment Variables, tambahkan `DATABASE_URL` sesuai connection string yang disediakan TiDB Cloud Serverless Driver. Jangan pernah commit password database ke GitHub.
4. Tambahkan `SESSION_TTL_DAYS` bernilai `7`.
5. Deploy ulang.

## Jadikan akun admin
1. Daftar lewat `/register` menggunakan email milikmu.
2. Buka SQL Editor TiDB dan jalankan:
   `UPDATE users SET role='admin' WHERE email='email-kamu@example.com';`
3. Logout lalu login lagi. Panel admin tersedia di `/admin`.

Akun registrasi baru selalu mendapat peran `user`. Tidak ada pilihan peran admin di halaman publik. Hak akses admin dicek kembali di backend.

## Jalur penting
- `/` — materi edukasi
- `/login` — masuk
- `/register` — daftar
- `/dashboard` — dashboard pengguna
- `/admin` — panel admin
- `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`
- `/api/dashboard`, `/api/admin/stats`, `/api/admin/users`

## Environment
Salin `.env.example` sebagai referensi saja. Untuk produksi, masukkan nilai sebenarnya ke Vercel Environment Variables. Jangan commit `.env`.

## Catatan
Ini paket starter implementasi yang perlu diuji di cluster TiDB dan project Vercel milikmu sebelum digunakan untuk data nyata. Driver `@tidbcloud/serverless` saat ini ditujukan untuk TiDB Cloud Starter/Essential. Fitur pelaporan baru menampilkan daftar laporan yang ada; form pembuatan laporan dan verifikasi email belum termasuk. Materi edukasi dapat dibuka tanpa login.
