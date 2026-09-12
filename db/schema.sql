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
