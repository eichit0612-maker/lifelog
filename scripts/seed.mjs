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

// 滋賀レイクス 2026-27 レギュラーシーズン全60試合。
// 公式サイト https://shigalakes.com/schedule/list/ から取得（2026-09-12 時点）。
// 対戦相手は公式表記の略称のまま（京都 / 琉球 / A東京 など）。
// 1月以降は開始時刻が未発表のため null。会場の「(予定)」表記も公式のまま残す。
// 結果は入れない。観たあとに自分で埋める。
// [日付, 開始時刻, 対戦相手, 会場, ホームなら1]
const lakesFixtures = [
  ["2026-09-25", "18:35", "京都", "にっしんでんきアリーナ京都(京都市体育館)", 0],
  ["2026-09-27", "14:35", "京都", "にっしんでんきアリーナ京都(京都市体育館)", 0],
  ["2026-10-03", "14:05", "琉球", "滋賀ダイハツアリーナ", 1],
  ["2026-10-04", "14:05", "琉球", "滋賀ダイハツアリーナ", 1],
  ["2026-10-07", "19:05", "東京SR", "滋賀ダイハツアリーナ", 1],
  ["2026-10-10", "14:05", "広島", "広島サンプラザホール", 0],
  ["2026-10-12", "14:05", "信州", "滋賀ダイハツアリーナ", 1],
  ["2026-10-19", "19:35", "琉球", "沖縄サントリーアリーナ", 0],
  ["2026-10-21", "19:05", "神戸", "滋賀ダイハツアリーナ", 1],
  ["2026-10-23", "19:05", "長崎", "滋賀ダイハツアリーナ", 1],
  ["2026-10-30", "19:35", "名古屋D", "IGアリーナ", 0],
  ["2026-11-01", "15:05", "名古屋D", "IGアリーナ", 0],
  ["2026-11-06", "19:05", "川崎", "滋賀ダイハツアリーナ", 1],
  ["2026-11-08", "15:05", "三河", "刈谷市体育館", 0],
  ["2026-11-12", "19:05", "千葉J", "滋賀ダイハツアリーナ", 1],
  ["2026-11-14", "15:05", "横浜BC", "横浜BUNTAI", 0],
  ["2026-11-16", "19:05", "群馬", "オープンハウスアリーナ太田", 0],
  ["2026-12-04", "19:05", "A東京", "滋賀ダイハツアリーナ", 1],
  ["2026-12-12", "16:05", "長崎", "ハピネスアリーナ", 0],
  ["2026-12-13", "17:05", "長崎", "ハピネスアリーナ", 0],
  ["2026-12-16", "19:05", "茨城", "滋賀ダイハツアリーナ", 1],
  ["2026-12-19", "14:05", "A千葉", "千葉ポートアリーナ", 0],
  ["2026-12-20", "14:05", "A千葉", "千葉ポートアリーナ", 0],
  ["2026-12-26", "14:05", "広島", "滋賀ダイハツアリーナ", 1],
  ["2026-12-27", "14:05", "広島", "滋賀ダイハツアリーナ", 1],
  ["2026-12-30", "14:05", "京都", "滋賀ダイハツアリーナ", 1],
  ["2027-01-02", "15:05", "三遠", "豊橋市総合体育館", 0],
  ["2027-01-03", "15:05", "三遠", "豊橋市総合体育館", 0],
  ["2027-01-25", null, "富山", "滋賀ダイハツアリーナ", 1],
  ["2027-01-27", null, "宇都宮", "とちぎん・ブレックスアリーナ宇都宮", 0],
  ["2027-01-30", null, "神戸", "GLION ARENA KOBE", 0],
  ["2027-01-31", null, "神戸", "GLION ARENA KOBE", 0],
  ["2027-02-03", null, "島根", "バンダイナムコアリーナ松江(松江市総合体育館)", 0],
  ["2027-02-05", null, "佐賀", "滋賀ダイハツアリーナ", 1],
  ["2027-02-07", null, "佐賀", "滋賀ダイハツアリーナ", 1],
  ["2027-02-11", null, "横浜BC", "滋賀ダイハツアリーナ", 1],
  ["2027-02-13", null, "宇都宮", "滋賀ダイハツアリーナ", 1],
  ["2027-02-15", null, "茨城", "滋賀ダイハツアリーナ", 1],
  ["2027-02-17", null, "秋田", "CNAアリーナ☆あきた", 0],
  ["2027-03-06", null, "信州", "エア・ウォーターアリーナ松本", 0],
  ["2027-03-07", null, "信州", "エア・ウォーターアリーナ松本", 0],
  ["2027-03-10", null, "千葉J", "LaLa arena TOKYO-BAY", 0],
  ["2027-03-12", null, "大阪", "滋賀ダイハツアリーナ", 1],
  ["2027-03-14", null, "大阪", "滋賀ダイハツアリーナ", 1],
  ["2027-03-17", null, "仙台", "ゼビオアリーナ仙台", 0],
  ["2027-03-20", null, "三河", "滋賀ダイハツアリーナ", 1],
  ["2027-03-21", null, "三河", "滋賀ダイハツアリーナ", 1],
  ["2027-03-24", null, "川崎", "滋賀ダイハツアリーナ", 1],
  ["2027-04-02", null, "秋田", "ナイスアリーナ", 0],
  ["2027-04-04", null, "三遠", "滋賀ダイハツアリーナ(予定)", 1],
  ["2027-04-06", null, "名古屋D", "滋賀ダイハツアリーナ(予定)", 1],
  ["2027-04-10", null, "島根", "滋賀ダイハツアリーナ(予定)", 1],
  ["2027-04-11", null, "島根", "滋賀ダイハツアリーナ(予定)", 1],
  ["2027-04-13", null, "A東京", "TOYOTA ARENA TOKYO", 0],
  ["2027-04-20", null, "大阪", "おおきにアリーナ舞洲", 0],
  ["2027-04-24", null, "北海道", "滋賀ダイハツアリーナ(予定)", 1],
  ["2027-04-25", null, "北海道", "滋賀ダイハツアリーナ(予定)", 1],
  ["2027-04-28", null, "群馬", "オープンハウスアリーナ太田", 0],
  ["2027-04-30", null, "東京SR", "TOYOTA ARENA TOKYO", 0],
  ["2027-05-02", null, "佐賀", "SAGAアリーナ", 0],
];

const games = lakesFixtures.map(([date, tip, opp, venue, isHome]) => [
  date,
  tip,
  "滋賀レイクス",
  opp,
  "B.PREMIER",
  venue,
  isHome,
  "scheduled",
  null,
  null,
  null,
]);

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
     (game_date, tip_off, team, opponent, league, venue, is_home,
      status, our_score, opponent_score, memo)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
