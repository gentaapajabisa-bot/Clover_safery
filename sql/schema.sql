-- Clover Safety — skema database untuk TiDB (kompatibel MySQL).
--
-- Cara pakai: pilih database tujuan di SQL Editor / koneksi (mis. `clover_safery`
-- atau `test` bawaan TiDB Cloud), lalu jalankan seluruh file ini.
-- Skema sengaja tidak memuat CREATE DATABASE/USE karena sebagian editor menolaknya.
--
-- Foreign key tidak dipakai di sini supaya jalan di semua versi TiDB.
-- Jika kluster Anda TiDB v8.5+, jalankan juga `sql/foreign-keys.sql` (opsional).
-- Waktu disimpan dalam UTC.

CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  name          VARCHAR(100)    NOT NULL,
  email         VARCHAR(190)    NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,
  role          ENUM('user','admin')       NOT NULL DEFAULT 'user',
  status        ENUM('active','suspended') NOT NULL DEFAULT 'active',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_sessions (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64)        NOT NULL,
  expires_at DATETIME        NOT NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_session_token (token_hash),
  KEY idx_session_user (user_id),
  KEY idx_session_expiry (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NULL,
  action     VARCHAR(100)    NOT NULL,
  details    TEXT            NULL,
  created_at DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_activity_user (user_id),
  KEY idx_activity_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS security_reports (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id     BIGINT UNSIGNED NOT NULL,
  title       VARCHAR(180)    NOT NULL,
  description TEXT            NOT NULL,
  status      ENUM('pending','reviewed','resolved') NOT NULL DEFAULT 'pending',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_report_user (user_id),
  KEY idx_report_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Akun admin pertama: daftar lewat /register seperti pengguna biasa, lalu jalankan
-- UPDATE users SET role = 'admin' WHERE email = 'email-admin-kamu@example.com';

-- ---------------------------------------------------------------------------
-- Profil, kontak tepercaya, dan chat dengan admin.
-- Bagian ini hanya memakai CREATE TABLE IF NOT EXISTS, jadi aman dijalankan
-- ulang di database yang sudah berisi tabel di atas.
-- ---------------------------------------------------------------------------

-- Profil tambahan pengguna. Foto disimpan terpisah (user_avatars) agar query profil tetap ringan.
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id        BIGINT UNSIGNED NOT NULL,
  phone          VARCHAR(30)     NULL,
  bio            VARCHAR(300)    NULL,
  avatar_version INT UNSIGNED    NOT NULL DEFAULT 0,
  updated_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Foto profil (gambar sudah diperkecil di browser), disimpan sebagai base64.
CREATE TABLE IF NOT EXISTS user_avatars (
  user_id    BIGINT UNSIGNED NOT NULL,
  mime       VARCHAR(20)     NOT NULL,
  data_b64   MEDIUMTEXT      NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Kontak orang tepercaya. Setiap query di backend selalu memakai user_id sesi,
-- sehingga hanya pemilik yang dapat melihat dan menambahkan datanya (admin pun tidak).
CREATE TABLE IF NOT EXISTS trusted_contacts (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id      BIGINT UNSIGNED NOT NULL,
  name         VARCHAR(100)    NOT NULL,
  relationship VARCHAR(60)     NOT NULL,
  phone        VARCHAR(30)     NULL,
  note         VARCHAR(200)    NULL,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_contact_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat pengguna <-> admin. Satu percakapan per pengguna (thread_user_id = pemilik percakapan).
CREATE TABLE IF NOT EXISTS chat_messages (
  id             BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  thread_user_id BIGINT UNSIGNED NOT NULL,
  sender_id      BIGINT UNSIGNED NOT NULL,
  sender_role    ENUM('user','admin') NOT NULL,
  body           VARCHAR(2000)   NOT NULL,
  read_at        DATETIME        NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_chat_thread (thread_user_id, id),
  KEY idx_chat_unread (sender_role, read_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Riwayat jawaban kuis dan refleksi. Hanya pemilik yang dapat membaca (admin pun tidak).
CREATE TABLE IF NOT EXISTS user_history (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  kind       ENUM('kuis','refleksi') NOT NULL,
  title      VARCHAR(150)    NOT NULL,
  summary    VARCHAR(300)    NULL,
  data       TEXT            NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_history_user (user_id, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
