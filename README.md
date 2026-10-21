# Clover Safety

Media edukasi keselamatan digital (materi, simulasi chat, kuis, kamus, alarm tanda bahaya) dengan **login berbasis server**, **dashboard pengguna**, dan **panel admin**. Berjalan di **Vercel** (static + Functions) dengan database **TiDB Cloud**.

## Struktur proyek

```
Clover_safery/
├── public/            # Seluruh file statis yang dilayani ke browser
│   ├── index.html     #   halaman sambutan (tanpa isi materi) + landing.js
│   ├── belajar.html   #   materi edukasi (SPA berbasis hash-route), dijaga materi-guard.js
│   ├── login.html · register.html · dashboard.html · admin.html · profile.html
│   ├── css/           #   styles.css, extra.css (materi) · auth.css (login/dashboard/admin)
│   ├── js/            #   theme.js (tema) · common.js (helper bersama) · auth-form.js
│   │   │              #   dashboard-page.js · admin-page.js
│   │   └── materi/    #   materi edukasi, dimuat berurutan oleh index.html:
│   │                  #     core · local-auth* · state · alarm · content · components · pages
│   │                  #     pages-local-account* · router · events · settings · simulasi · kuis
│   │                  #     kamus · extra-routes · extra-events · pwa
│   ├── sw.js          #   service worker (offline)
│   └── manifest.webmanifest, icon.*
├── api/               # Vercel Functions
│   ├── auth/          #   register · login · logout · me
│   ├── admin/         #   stats · users
│   └── dashboard.js
├── lib/               # db.js (koneksi TiDB) · security.js (hash, sesi, guard)
├── sql/               # schema.sql · foreign-keys.sql (opsional)
├── vercel.json        # header keamanan (CSP, HSTS, dll.) & outputDirectory
└── package.json
```

> Hanya isi `public/` yang bisa diakses publik. `lib/`, `sql/`, dan file konfigurasi tidak ikut terlayani.

## Setup database (TiDB)

1. Buat cluster TiDB Cloud (Starter/Essential) yang mendukung Serverless Driver.
2. Buka **SQL Editor**, pilih database tujuan, lalu jalankan seluruh isi `sql/schema.sql`.
   Skema tidak memuat `CREATE DATABASE`/`USE` dan tidak memakai foreign key, supaya aman di semua versi TiDB.
3. _(Opsional, TiDB v8.5+)_ jalankan `sql/foreign-keys.sql` untuk menambah foreign key.

## Fitur akun: profil, kontak tepercaya, chat admin

> **Wajib:** jalankan ulang seluruh `sql/schema.sql` di database yang sudah ada (aman, hanya `CREATE TABLE IF NOT EXISTS`). Tanpa tabel baru (`user_profiles`, `user_avatars`, `trusted_contacts`, `chat_messages`), login akan gagal karena sesi kini membaca `user_profiles`.

| Jalur | Keterangan |
| --- | --- |
| `/profile` | Nama, telepon, bio, **foto profil** (dipotong persegi 256px di browser), ganti kata sandi |
| `/kontak` | **Kontak tepercaya** — hanya pemilik yang bisa melihat/menambah/ubah/hapus (maks. 20); tidak ada endpoint admin |
| `/chat` | Chat pengguna ↔ admin (hanya percakapan sendiri) |
| `/admin-chat` | Admin melihat daftar percakapan dan membalas |
| `/belajar#/bantuan` & alarm | Menampilkan kontak tepercaya akun (bila login) dengan tombol telepon |

API baru: `api/profile.js`, `api/contacts.js`, `api/chat.js`, `api/admin/chat.js` (total 11 Functions, masih di bawah batas 12 paket Hobby Vercel). Foto divalidasi di server (tipe, ukuran, magic bytes) dan hanya bisa diambil pemilik atau admin. Chat memakai polling 5 detik, bukan realtime.

## Deploy ke Vercel

1. Impor repositori ini ke Vercel (Framework Preset: **Other**; tanpa build command).
2. Di **Settings → Environment Variables** tambahkan:
   - `DATABASE_URL` — connection string dari TiDB Cloud
   - `SESSION_TTL_DAYS` — mis. `7` (opsional, rentang 1–30)
3. Deploy. Jangan pernah meng-commit `.env` atau password database.

Pengembangan lokal: salin `.env.example` ke `.env`, isi nilainya, lalu `npm install && npm run dev`.

## Menjadikan akun admin

1. Daftar lewat `/register`.
2. Di SQL Editor TiDB: `UPDATE users SET role = 'admin' WHERE email = 'email-kamu@example.com';`
3. Logout, lalu login lagi. Panel admin ada di `/admin`.

Akun baru selalu berperan `user`; tidak ada pilihan admin di halaman publik, dan hak akses dicek ulang di backend.

## Halaman & endpoint

| Jalur                                                      | Keterangan                        |
| ---------------------------------------------------------- | --------------------------------- |
| `/`                                                        | Halaman sambutan (Masuk/Daftar)   |
| `/belajar`                                                 | Materi edukasi (wajib login*)     |
| `/login` · `/register`                                     | Masuk / daftar                    |
| `/dashboard`                                               | Dashboard pengguna                |
| `/admin`                                                   | Panel admin                       |
| `POST /api/auth/register` · `login` · `logout`, `GET …/me` | Autentikasi & sesi                |
| `GET /api/dashboard`                                       | Aktivitas & laporan milik sendiri |
| `GET /api/admin/stats`, `GET/PATCH /api/admin/users`       | Khusus admin                      |

> \* Alur: `/` → `/login` → `/dashboard` → `/belajar`. Rute `/belajar#/bantuan` dan `#/tentang` tetap terbuka tanpa login demi keselamatan (tombol alarm menuju halaman bantuan). Penjagaan `/belajar` dilakukan di sisi klien; file statisnya tetap bisa diunduh langsung, jadi ini pengatur alur, bukan pengaman data.

## Keamanan

- Kata sandi di-hash dengan **scrypt** (salt acak); perbandingan memakai `timingSafeEqual`.
- Sesi: token acak 256-bit di cookie `HttpOnly; Secure; SameSite=Lax`; yang disimpan di database hanya **hash SHA-256**-nya.
- Login memakai hash pembanding untuk email yang tidak terdaftar sehingga waktu respons tidak membocorkan keberadaan akun. Sesi kedaluwarsa dibersihkan saat login; menangguhkan akun langsung mencabut semua sesinya.
- CSP ketat (`script-src 'self'`), HSTS, `nosniff`, `frame-ancestors 'none'` di `vercel.json`.

## Catatan & batasan

- Paket ini perlu diuji di cluster TiDB dan project Vercel milikmu sebelum dipakai untuk data nyata.
- Belum ada pembatasan percobaan login di server (rate limiting) dan verifikasi email.
- Fitur laporan baru menampilkan daftar; form pembuatan laporan belum ada.
- Materi edukasi (`public/js/materi/local-auth.js` dan `pages-local-account.js`, bertanda `*` di atas) masih memuat sistem akun **lokal** lama (disimpan di browser, termasuk kode Guru BK di `core.js`). Itu bukan keamanan sungguhan dan terpisah dari login server. Kunci penyimpanan lokal masih berawalan `pazzel_` agar data pengguna lama tidak hilang.
