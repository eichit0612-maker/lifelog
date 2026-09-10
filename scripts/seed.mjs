// サンプルデータ投入スクリプト:  npm run db:seed
// 既存データを全消しして入れ直すので、開発用途のみ。
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

const gourmet = [
  ["麺屋 ひなた", "東京都新宿区", "ラーメン", 5, "煮干し香る塩そば。替え玉は細麺推奨。", "2026-09-05"],
  ["鮨 かねさか", "東京都港区", "寿司", 5, "夜のおまかせ。穴子が絶品だった。", "2026-08-22"],
  ["Trattoria Ponte", "神奈川県横浜市", "イタリアン", 4, "パスタランチが1200円でコスパ最高。", "2026-08-10"],
  ["喫茶 ゆず", "東京都杉並区", "カフェ", 4, "静かで作業がはかどる。プリンが手作り。", "2026-07-28"],
  ["炭火焼肉 大将", "埼玉県さいたま市", "焼肉", 3, "タン塩は良かったがやや混雑。", "2026-07-11"],
  ["スパイスカレー 月光", "東京都渋谷区", "カレー", 5, "3種あいがけ。ラッシー付きで満足度高い。", "2026-06-30"],
];

const trips = [
  ["夏の北海道ドライブ", "北海道 富良野・美瑛", "2026-08-14", "2026-08-17", "ラベンダー畑が満開。青い池は朝イチが空いていて正解だった。"],
  ["京都ひとり旅", "京都府 京都市", "2026-06-06", "2026-06-08", "早朝の伏見稲荷は人が少なく最高。喫茶店巡りもできた。"],
  ["日帰り鎌倉", "神奈川県 鎌倉市", "2026-05-03", "2026-05-03", "江ノ電が混雑。海沿いを歩いてしらす丼を食べた。"],
  ["沖縄 家族旅行", "沖縄県 石垣島", "2026-03-20", "2026-03-24", "川平湾のグラスボート。夜の星空がとにかく綺麗だった。"],
];

const games = [
  // 予定
  ["2026-09-20", "19:00", "レイクサイド BC", "市民体育館 A コート", "scheduled", null, null, "リーグ戦 第5節"],
  ["2026-09-27", "13:30", "サンダーバーズ", "第二総合体育館", "scheduled", null, null, "アウェイ。集合は12:00。"],
  ["2026-10-04", "18:00", "OB チーム", "市民体育館 B コート", "scheduled", null, null, "練習試合"],
  // 結果
  ["2026-09-06", "19:00", "グリーンウィングス", "市民体育館 A コート", "win", 78, 65, "第3Qのプレスがはまった。"],
  ["2026-08-30", "14:00", "ノースブリッジ", "県立体育館", "lose", 61, 74, "リバウンドで完敗。要改善。"],
  ["2026-08-23", "19:00", "レイクサイド BC", "市民体育館 A コート", "win", 70, 68, "残り8秒のフリースローで逆転。"],
  ["2026-08-09", "13:30", "サンダーバーズ", "第二総合体育館", "draw", 66, 66, "延長なしの練習試合。"],
  ["2026-07-26", "19:00", "セントラルズ", "市民体育館 A コート", "cancelled", null, null, "台風のため中止。"],
];

const watchLogs = [
  ["デューン 砂の惑星 PART3", "movie", "SF", "2026-09-07", 5, "映像と音の圧が劇場向き。IMAXで観て正解。"],
  ["葬送のフリーレン 2期", "anime", "ファンタジー", "2026-09-01", 5, "戦闘作画もいいが、間の取り方がやっぱり好き。"],
  ["ゴジラ -1.0", "movie", "特撮", "2026-08-18", 4, "銀座のシーンが白眉。人間ドラマも良い。"],
  ["ダンジョン飯", "anime", "ファンタジー", "2026-08-02", 4, "飯パートの説得力がすごい。原作も読みたい。"],
  ["ミッション:インポッシブル", "movie", "アクション", "2026-07-15", 4, "生身スタントの説得力。頭を空にして楽しめる。"],
  ["SHOGUN 将軍", "drama", "歴史", "2026-06-21", 5, "全10話一気見。所作と美術の作り込みが別格。"],
  ["君たちはどう生きるか", "movie", "アニメ映画", "2026-05-30", 3, "解釈は分かれそう。映像は文句なし。"],
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
     (game_date, tip_off, opponent, venue, status, our_score, opponent_score, memo)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
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
