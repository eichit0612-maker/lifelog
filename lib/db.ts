import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const DB_PATH = process.env.LIFELOG_DB_PATH ?? path.join(process.cwd(), "db", "lifelog.db");
const SCHEMA_PATH = path.join(process.cwd(), "db", "schema.sql");

// dev の HMR で接続が増え続けないよう global にキャッシュする。
const globalForDb = globalThis as unknown as { lifelogDb?: Database.Database };

function createConnection(): Database.Database {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // schema.sql は CREATE TABLE IF NOT EXISTS なので毎回流しても安全。
  db.exec(fs.readFileSync(SCHEMA_PATH, "utf8"));

  return db;
}

export function getDb(): Database.Database {
  if (!globalForDb.lifelogDb) {
    globalForDb.lifelogDb = createConnection();
  }
  return globalForDb.lifelogDb;
}
