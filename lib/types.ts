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

export type SetlistSong = {
  id: number;
  trip_id: number;
  performed_on: string;
  act_no: number;
  artist: string;
  stage: string | null;
  song_no: number;
  title: string;
  url: string | null;
  created_at: string;
  updated_at: string;
};

export type TripPhoto = {
  id: number;
  trip_id: number;
  sort_no: number;
  src: string;
  thumb_src: string | null;
  scene: string | null;
  caption: string | null;
  taken_at: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
  updated_at: string;
};

/** trip_races.placings の1要素。 */
export type RacePlacing = {
  pos: number;
  no: number;
  name: string;
  jockey: string | null;
  pop: number | null;
  time: string | null;
  margin: string | null;
};

/** trip_races の行。placings は JSON 文字列のままでなく、読み出し時に配列へ戻す。 */
export type TripRace = {
  id: number;
  trip_id: number;
  race_date: string;
  course: string;
  meeting: string | null;
  race_no: number;
  race_name: string;
  grade: string | null;
  track: string | null;
  conditions: string | null;
  post_time: string | null;
  placings: RacePlacing[];
  bettor: string | null;
  bet_type: string | null;
  bet_detail: string | null;
  hit: string | null;
  dividend_yen: number | null;
  returned_yen: number | null;
  photo: string | null;
  source_url: string | null;
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
  is_home: number | null;
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
  setlist: SetlistSong[];
  tripPhotos: TripPhoto[];
  tripRaces: TripRace[];
  games: BasketballGame[];
  watchLogs: WatchLog[];
  stats: DashboardStats;
};
