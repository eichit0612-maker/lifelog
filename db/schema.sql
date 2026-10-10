-- ============================================================
--  Lifelog Dashboard - SQLite schema
--  すべての日付は TEXT の ISO 8601 (YYYY-MM-DD) で保持する。
--  SQLite には日付型が無いため、比較・ソートが辞書順で正しく効く形式を使う。
-- ============================================================

PRAGMA foreign_keys = ON;

-- ------------------------------------------------------------
-- 1. グルメ（店名、場所、ジャンル、評価、メモ）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gourmet (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,                       -- 店名
  location    TEXT,                                   -- 場所（住所 / エリア）
  genre       TEXT,                                   -- ジャンル（ラーメン、寿司…）
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5), -- 5段階評価
  memo        TEXT,
  visited_on  TEXT    CHECK (visited_on IS NULL OR visited_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_gourmet_genre      ON gourmet (genre);
CREATE INDEX IF NOT EXISTS idx_gourmet_rating     ON gourmet (rating DESC);
CREATE INDEX IF NOT EXISTS idx_gourmet_visited_on ON gourmet (visited_on DESC);

-- ------------------------------------------------------------
-- 2. 旅行記録（日付、場所、思い出メモ）
--    1泊以上を想定して開始日/終了日を持つ。日帰りは end_date = start_date。
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trips (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT,                                   -- 「京都ひとり旅」などの見出し（任意）
  place       TEXT    NOT NULL,                       -- 場所
  start_date  TEXT    NOT NULL CHECK (start_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  end_date    TEXT    CHECK (end_date IS NULL OR end_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  memo        TEXT,                                   -- 思い出メモ
  created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_trips_start_date ON trips (start_date DESC);

-- 2-b. セットリスト（フェス・ライブで聴いた曲）
--      旅行1件にぶら下がる。act_no は当日の出演順、song_no はその中の曲順。
CREATE TABLE IF NOT EXISTS setlist_songs (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id      INTEGER NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
  performed_on TEXT    NOT NULL CHECK (performed_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  act_no       INTEGER NOT NULL,                    -- その日の何組目か
  artist       TEXT    NOT NULL,
  stage        TEXT,                                -- 雷神STAGE / 風神STAGE など
  song_no      INTEGER NOT NULL,                    -- そのアクトの何曲目か
  title        TEXT    NOT NULL,
  url          TEXT,                                -- 音源へのリンク（任意）
  created_at   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  UNIQUE (trip_id, performed_on, act_no, song_no)
);

CREATE INDEX IF NOT EXISTS idx_setlist_trip   ON setlist_songs (trip_id, performed_on, act_no, song_no);
CREATE INDEX IF NOT EXISTS idx_setlist_artist ON setlist_songs (artist);

-- 2-c. 旅行の写真
--      画像そのものは public/ に置き、ここにはパスだけ持つ。
--      src は basePath を含まないサイトルートからのパス（/trips/...）。
CREATE TABLE IF NOT EXISTS trip_photos (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id     INTEGER NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
  sort_no     INTEGER NOT NULL,                     -- 表示順（撮影順）
  src         TEXT    NOT NULL,                     -- 拡大表示用
  thumb_src   TEXT,                                 -- 一覧用の縮小版（無ければ src）
  scene       TEXT,                                 -- 「京都競馬場」など。一覧で見出しにする
  caption     TEXT,
  taken_at    TEXT    CHECK (taken_at IS NULL OR taken_at GLOB '[0-2][0-9]:[0-5][0-9]'),
  width       INTEGER,                              -- 縦横比を先に確保してレイアウトのずれを防ぐ
  height      INTEGER,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  UNIQUE (trip_id, sort_no)
);

CREATE INDEX IF NOT EXISTS idx_trip_photos_trip ON trip_photos (trip_id, sort_no);

-- 2-d. 旅行先で観たレース（競馬など）
--      着順・配当は公開されている結果から取ったもの。推測では埋めない。
--      bets は自分たちの当たり馬券。1レースで複数買うことがあるので配列で持つ。
--      買っていない・外れたレースなら空配列。
CREATE TABLE IF NOT EXISTS trip_races (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id      INTEGER NOT NULL REFERENCES trips (id) ON DELETE CASCADE,
  race_date    TEXT    NOT NULL CHECK (race_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  course       TEXT    NOT NULL,                    -- 京都 / 阪神 …
  meeting      TEXT,                                -- 4回京都1日目
  race_no      INTEGER NOT NULL CHECK (race_no BETWEEN 1 AND 12),
  race_name    TEXT    NOT NULL,
  grade        TEXT,                                -- G1 / G2 / G3 / L
  track        TEXT,                                -- 芝右1200m
  conditions   TEXT,                                -- 晴・良
  post_time    TEXT    CHECK (post_time IS NULL OR post_time GLOB '[0-2][0-9]:[0-5][0-9]'),
  placings     TEXT    NOT NULL CHECK (json_valid(placings)),  -- 上位の着順 [{pos,no,name,jockey,pop,time,margin}]
  bets         TEXT    NOT NULL DEFAULT '[]' CHECK (json_valid(bets)),
                                                    -- [{bettor,type,detail,hit,dividend_yen}]
                                                    -- dividend_yen は100円あたりの配当
  returned_yen INTEGER CHECK (returned_yen IS NULL OR returned_yen > 0),  -- そのレースの実際の払戻額（合計）
  photo        TEXT,                                -- 関連する写真（trip_photos.src）
  source_url   TEXT,                                -- 結果の出典
  created_at   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  UNIQUE (trip_id, race_date, course, race_no)
);

CREATE INDEX IF NOT EXISTS idx_trip_races_trip ON trip_races (trip_id, race_date, race_no);

-- ------------------------------------------------------------
-- 3. バスケの試合予定・結果（日付、対戦相手、ステータス、スコア）
--    観戦記録なので「どのチームを応援して観たか」を team に持つ。
--    status は team から見た勝敗。
--    status = 'scheduled'（予定）のときスコアは NULL、
--    'win' / 'lose' / 'draw'（結果確定）のときはスコア必須。
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS basketball_games (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  game_date      TEXT    NOT NULL CHECK (game_date GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  tip_off        TEXT    CHECK (tip_off IS NULL OR tip_off GLOB '[0-2][0-9]:[0-5][0-9]'),  -- 開始時刻
  team           TEXT    NOT NULL,                    -- 応援・観戦するチーム
  opponent       TEXT    NOT NULL,                    -- 対戦相手
  league         TEXT,                                -- B.PREMIER / NBA など
  venue          TEXT,                                -- 会場
  is_home        INTEGER CHECK (is_home IN (0, 1)),   -- team から見たホーム/アウェイ
  status         TEXT    NOT NULL DEFAULT 'scheduled'
                         CHECK (status IN ('scheduled', 'win', 'lose', 'draw', 'cancelled')),
  our_score      INTEGER CHECK (our_score IS NULL OR our_score >= 0),   -- team 側の得点
  opponent_score INTEGER CHECK (opponent_score IS NULL OR opponent_score >= 0),
  memo           TEXT,
  created_at     TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at     TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  -- 予定・中止はスコアなし、結果確定はスコアあり
  CHECK (
    (status IN ('scheduled', 'cancelled') AND our_score IS NULL AND opponent_score IS NULL)
    OR
    (status IN ('win', 'lose', 'draw') AND our_score IS NOT NULL AND opponent_score IS NOT NULL)
  ),
  -- スコアとステータスの整合性
  CHECK (
    status <> 'win'  OR our_score >  opponent_score
  ),
  CHECK (
    status <> 'lose' OR our_score <  opponent_score
  ),
  CHECK (
    status <> 'draw' OR our_score =  opponent_score
  )
);

CREATE INDEX IF NOT EXISTS idx_games_date   ON basketball_games (game_date DESC);
CREATE INDEX IF NOT EXISTS idx_games_status ON basketball_games (status);
CREATE INDEX IF NOT EXISTS idx_games_league ON basketball_games (league);

-- ------------------------------------------------------------
-- 4. 映画・アニメ鑑賞ログ（タイトル、ジャンル、視聴日、評価、ひとこと感想）
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS watch_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT    NOT NULL,
  media_type  TEXT    NOT NULL DEFAULT 'movie'
                      CHECK (media_type IN ('movie', 'anime', 'drama')),
  genre       TEXT,                                   -- SF、コメディ…
  -- 視聴日は任意。タイトルだけ先に登録しておける（NULL = これから観る / 日付未記入）。
  watched_on  TEXT    CHECK (watched_on IS NULL OR watched_on GLOB '[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]'),
  rating      INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,                                   -- ひとこと感想
  created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

CREATE INDEX IF NOT EXISTS idx_watch_logs_watched_on ON watch_logs (watched_on DESC);
CREATE INDEX IF NOT EXISTS idx_watch_logs_media_type ON watch_logs (media_type);
CREATE INDEX IF NOT EXISTS idx_watch_logs_rating     ON watch_logs (rating DESC);

-- ------------------------------------------------------------
-- updated_at 自動更新トリガー
-- ------------------------------------------------------------
CREATE TRIGGER IF NOT EXISTS trg_gourmet_updated_at
AFTER UPDATE ON gourmet FOR EACH ROW
BEGIN
  UPDATE gourmet SET updated_at = datetime('now', 'localtime') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_trips_updated_at
AFTER UPDATE ON trips FOR EACH ROW
BEGIN
  UPDATE trips SET updated_at = datetime('now', 'localtime') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_setlist_songs_updated_at
AFTER UPDATE ON setlist_songs FOR EACH ROW
BEGIN
  UPDATE setlist_songs SET updated_at = datetime('now', 'localtime') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_trip_photos_updated_at
AFTER UPDATE ON trip_photos FOR EACH ROW
BEGIN
  UPDATE trip_photos SET updated_at = datetime('now', 'localtime') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_trip_races_updated_at
AFTER UPDATE ON trip_races FOR EACH ROW
BEGIN
  UPDATE trip_races SET updated_at = datetime('now', 'localtime') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_games_updated_at
AFTER UPDATE ON basketball_games FOR EACH ROW
BEGIN
  UPDATE basketball_games SET updated_at = datetime('now', 'localtime') WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS trg_watch_logs_updated_at
AFTER UPDATE ON watch_logs FOR EACH ROW
BEGIN
  UPDATE watch_logs SET updated_at = datetime('now', 'localtime') WHERE id = OLD.id;
END;
