// サンプルデータ投入スクリプト:  npm run db:seed
// 既存データを全消しして入れ直すので、開発用途のみ。
//
// 評価(rating) と 日付 は意図的に未入力(NULL)にしてある。
// 実際に行った / 観たときに自分で埋める前提。
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const root = process.cwd();
const dbPath = process.env.LIFELOG_DB_PATH ?? path.join(root, "db", "lifelog.db");

fs.mkdirSync(path.dirname(dbPath), { recursive: true });
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.exec(fs.readFileSync(path.join(root, "db", "schema.sql"), "utf8"));

db.exec(`
  DELETE FROM gourmet;
  DELETE FROM trips;
  DELETE FROM basketball_games;
  DELETE FROM watch_logs;
  DELETE FROM sqlite_sequence
   WHERE name IN ('gourmet', 'trips', 'basketball_games', 'watch_logs');
`);

// [店名, 場所, ジャンル, 評価, メモ, 訪問日]
const gourmet = [
  ["都路里", "京都府京都市東山区", "甘味・カフェ", null, "抹茶パフェで知られる祇園の甘味処。", null],
  ["塩元帥", "大阪府", "ラーメン", null, "天然塩ラーメンの店。自家製麺。", null],
  ["きときと寿司", "富山県", "寿司", null, "富山湾の地魚を出す回転寿司。", null],
];

// 旅行はタブだけ用意して中身なし（あとから追加）
const trips = [];

// [日付, 開始時刻, 応援チーム, 対戦相手, リーグ, 会場, ステータス, 自スコア, 相手スコア, メモ]
// 結果は入れていない。実在チームの架空のスコアを置かないため、すべて予定として登録する。
const games = [
  ["2026-10-03", "18:05", "滋賀レイクス", "広島ドラゴンフライズ", "B.LEAGUE", "滋賀ダイハツアリーナ", "scheduled", null, null, null],
  ["2026-10-10", "16:05", "滋賀レイクス", "京都ハンナリーズ", "B.LEAGUE", "滋賀ダイハツアリーナ", "scheduled", null, null, null],
  ["2026-10-24", "19:05", "滋賀レイクス", "大阪エヴェッサ", "B.LEAGUE", "おおきにアリーナ舞洲", "scheduled", null, null, null],
  ["2026-10-22", "09:30", "ロサンゼルス・レイカーズ", "ゴールデンステート・ウォリアーズ", "NBA", "クリプト・ドット・コム・アリーナ", "scheduled", null, null, null],
  ["2026-11-06", "10:00", "ボストン・セルティックス", "ニューヨーク・ニックス", "NBA", "TDガーデン", "scheduled", null, null, null],
  ["2026-11-20", "11:00", "デンバー・ナゲッツ", "オクラホマシティ・サンダー", "NBA", "ボール・アリーナ", "scheduled", null, null, null],
];

// [タイトル, 種別, ジャンル, 視聴日, 評価, ひとこと感想]
const watchLogs = [
  ["ちいかわ 人魚の島の秘密", "movie", "アニメ映画", null, null, null],
  ["メダリスト", "anime", "スポーツ", null, null, null],
  ["ハイキュー!!", "anime", "スポーツ", null, null, null],
  ["エヴァンゲリオン（リバイバル上映）", "movie", "SF", null, null, null],
  ["ヤニねこ", "anime", "コメディ", null, null, null],
];

const insertGourmet = db.prepare(
  `INSERT INTO gourmet (name, location, genre, rating, memo, visited_on)
   VALUES (?, ?, ?, ?, ?, ?)`
);
const insertTrip = db.prepare(
  `INSERT INTO trips (title, place, start_date, end_date, memo) VALUES (?, ?, ?, ?, ?)`
);
const insertGame = db.prepare(
  `INSERT INTO basketball_games
     (game_date, tip_off, team, opponent, league, venue, status, our_score, opponent_score, memo)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);
const insertWatch = db.prepare(
  `INSERT INTO watch_logs (title, media_type, genre, watched_on, rating, comment)
   VALUES (?, ?, ?, ?, ?, ?)`
);

db.transaction(() => {
  for (const row of gourmet) insertGourmet.run(...row);
  for (const row of trips) insertTrip.run(...row);
  for (const row of games) insertGame.run(...row);
  for (const row of watchLogs) insertWatch.run(...row);
})();

const count = (table) => db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get().c;
console.log(`seeded -> ${dbPath}`);
console.log(`  gourmet:          ${count("gourmet")}`);
console.log(`  trips:            ${count("trips")}`);
console.log(`  basketball_games: ${count("basketball_games")}`);
console.log(`  watch_logs:       ${count("watch_logs")}`);
db.close();
