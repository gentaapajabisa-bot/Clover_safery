import { connect } from "@tidbcloud/serverless";

let db;

/** Koneksi dibuat sekali per instance function dan dipakai ulang. */
export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL belum dikonfigurasi.");
  if (!db) db = connect({ url: process.env.DATABASE_URL });
  return db;
}
