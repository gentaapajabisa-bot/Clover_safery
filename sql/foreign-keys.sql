-- OPSIONAL — hanya untuk TiDB v8.5+ (foreign key sudah GA).
-- Jalankan SETELAH `schema.sql`. Di versi lama, constraint ini diabaikan atau ditolak;
-- aplikasi tetap berjalan normal tanpanya.

ALTER TABLE user_sessions
  ADD CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE activity_logs
  ADD CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL;

ALTER TABLE security_reports
  ADD CONSTRAINT fk_report_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE user_profiles
  ADD CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE user_avatars
  ADD CONSTRAINT fk_avatar_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE trusted_contacts
  ADD CONSTRAINT fk_contact_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE chat_messages
  ADD CONSTRAINT fk_chat_thread_user FOREIGN KEY (thread_user_id) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE user_history
  ADD CONSTRAINT fk_history_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;
