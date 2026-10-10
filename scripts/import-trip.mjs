// 旅行1件ぶんの JSON を、今の DB に追記する。既存の記録は消さない。
//   node scripts/import-trip.mjs db/kyoto-keiba-2026-10-03.json
// 同じ見出し・開始日の旅行がすでにあれば何もしない（二重登録しない）。
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { insertTripBundle, readBundle } from "./trip-bundle.mjs";

const file = process.argv[2];
if (!file) {
  console.error("使い方: node scripts/import-trip.mjs <bundle.json>");
  process.exit(1);
}

const root = process.cwd();
const dbPath = process.env.LIFELOG_DB_PATH ?? path.join(root, "db", "lifelog.db");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(fs.readFileSync(path.join(root, "db", "schema.sql"), "utf8"));

const bundle = readBundle(path.resolve(file));
const tripId = insertTripBundle(db, bundle);
if (tripId === null) {
  console.log(`登録済みのためスキップ: ${bundle.trip.title} (${bundle.trip.start_date})`);
} else {
  console.log(
    `追加: ${bundle.trip.title} (trip_id=${tripId}) 写真 ${bundle.photos?.length ?? 0} 枚 / レース ${bundle.races?.length ?? 0} 件`
  );
}
db.close();
