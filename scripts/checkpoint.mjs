// WAL の内容を本体ファイルに書き戻し、db/lifelog.db 単体で完結させる。
// これをやらないと、直近の記録が -wal 側に残ったままコミットされてしまう。
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const dbPath = process.env.LIFELOG_DB_PATH ?? path.join(process.cwd(), "db", "lifelog.db");

if (!fs.existsSync(dbPath)) {
  console.error(`DB が見つかりません: ${dbPath}\n先に \`npm run db:seed\` を実行してください。`);
  process.exit(1);
}

const db = new Database(dbPath);
const result = db.pragma("wal_checkpoint(TRUNCATE)");
db.close();

const kb = (fs.statSync(dbPath).size / 1024).toFixed(1);
console.log(`checkpoint 完了: ${dbPath} (${kb} KB)`, result);
console.log("これで db/lifelog.db をコミットできます。");
