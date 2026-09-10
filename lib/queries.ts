import "server-only";
import { getDb } from "./db";
import type {
  BasketballGame,
  DashboardData,
  DashboardStats,
  Gourmet,
  Trip,
  WatchLog,
} from "./types";

export function listGourmet(): Gourmet[] {
  return getDb()
    .prepare(
      `SELECT * FROM gourmet
       ORDER BY COALESCE(visited_on, created_at) DESC, id DESC`
    )
    .all() as Gourmet[];
}

export function listTrips(): Trip[] {
  return getDb()
    .prepare(`SELECT * FROM trips ORDER BY start_date DESC, id DESC`)
    .all() as Trip[];
}

export function listGames(): BasketballGame[] {
  // 予定を先頭（日付昇順）、その後に過去の試合を新しい順で並べる。
  return getDb()
    .prepare(
      `SELECT * FROM basketball_games
       ORDER BY
         CASE WHEN status = 'scheduled' THEN 0 ELSE 1 END,
         CASE WHEN status = 'scheduled' THEN game_date END ASC,
         CASE WHEN status <> 'scheduled' THEN game_date END DESC,
         id DESC`
    )
    .all() as BasketballGame[];
}

export function listWatchLogs(): WatchLog[] {
  return getDb()
    .prepare(`SELECT * FROM watch_logs ORDER BY watched_on DESC, id DESC`)
    .all() as WatchLog[];
}

export function getStats(): DashboardStats {
  const db = getDb();

  const gourmet = db
    .prepare(`SELECT COUNT(*) AS count, AVG(rating) AS avg FROM gourmet`)
    .get() as { count: number; avg: number | null };

  const trips = db
    .prepare(`SELECT COUNT(*) AS count, COUNT(DISTINCT place) AS places FROM trips`)
    .get() as { count: number; places: number };

  const record = db
    .prepare(
      `SELECT
         SUM(status = 'win')  AS win,
         SUM(status = 'lose') AS lose,
         SUM(status = 'draw') AS draw,
         SUM(status = 'scheduled') AS upcoming
       FROM basketball_games`
    )
    .get() as { win: number | null; lose: number | null; draw: number | null; upcoming: number | null };

  const watch = db
    .prepare(`SELECT COUNT(*) AS count, AVG(rating) AS avg FROM watch_logs`)
    .get() as { count: number; avg: number | null };

  return {
    gourmetCount: gourmet.count,
    gourmetAvgRating: gourmet.avg,
    tripCount: trips.count,
    tripPlaceCount: trips.places,
    gameRecord: { win: record.win ?? 0, lose: record.lose ?? 0, draw: record.draw ?? 0 },
    upcomingGameCount: record.upcoming ?? 0,
    watchCount: watch.count,
    watchAvgRating: watch.avg,
  };
}

export function getDashboardData(): DashboardData {
  return {
    gourmet: listGourmet(),
    trips: listTrips(),
    games: listGames(),
    watchLogs: listWatchLogs(),
    stats: getStats(),
  };
}
