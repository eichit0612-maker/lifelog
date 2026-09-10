// db/schema.sql のテーブル定義と 1:1 で対応する型。

export type GameStatus = "scheduled" | "win" | "lose" | "draw" | "cancelled";
export type MediaType = "movie" | "anime" | "drama";
export type Rating = 1 | 2 | 3 | 4 | 5;

export type Gourmet = {
  id: number;
  name: string;
  location: string | null;
  genre: string | null;
  rating: number | null;
  memo: string | null;
  visited_on: string | null;
  created_at: string;
  updated_at: string;
};

export type Trip = {
  id: number;
  title: string | null;
  place: string;
  start_date: string;
  end_date: string | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export type BasketballGame = {
  id: number;
  game_date: string;
  tip_off: string | null;
  team: string;
  opponent: string;
  league: string | null;
  venue: string | null;
  status: GameStatus;
  our_score: number | null;
  opponent_score: number | null;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

export type WatchLog = {
  id: number;
  title: string;
  media_type: MediaType;
  genre: string | null;
  watched_on: string | null;
  rating: number | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
};

export type TabKey = "gourmet" | "trips" | "basketball" | "watch";

export type DashboardStats = {
  gourmetCount: number;
  gourmetAvgRating: number | null;
  tripCount: number;
  tripPlaceCount: number;
  gameRecord: { win: number; lose: number; draw: number };
  upcomingGameCount: number;
  watchCount: number;
  watchAvgRating: number | null;
};

export type DashboardData = {
  gourmet: Gourmet[];
  trips: Trip[];
  games: BasketballGame[];
  watchLogs: WatchLog[];
  stats: DashboardStats;
};
