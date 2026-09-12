import type { BasketballGame, GameStatus } from "@/lib/types";
import { EmptyNote, SectionHead } from "../ui";

const STATUS_LABEL: Record<GameStatus, string> = {
  scheduled: "",
  win: "勝",
  lose: "敗",
  draw: "分",
  cancelled: "中止",
};

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

function weekday(date: string): string {
  // 日付文字列から曜日を出すだけ。ローカルタイムの揺れを避けて UTC で扱う。
  const [y, m, d] = date.split("-").map(Number);
  return DOW[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
}

function Result({ game }: { game: BasketballGame }) {
  const hasScore = game.our_score !== null && game.opponent_score !== null;
  if (!hasScore) {
    return game.status === "cancelled" ? (
      <span className="text-xs text-ink-faint">中止</span>
    ) : (
      // 予定は結果欄を空けておく。あとで書き込む場所として残す。
      <span
        className="inline-block w-12 border-b border-dotted border-rule-firm align-middle"
        title="結果は未記入"
      />
    );
  }
  return (
    <span className="flex items-baseline justify-end gap-2">
      <span className="latin text-base tabular-nums">
        {game.our_score}
        <span className="mx-1 text-ink-faint">–</span>
        {game.opponent_score}
      </span>
      <span
        className={`mincho text-sm ${
          game.status === "win" ? "text-accent" : "text-ink-muted"
        }`}
      >
        {STATUS_LABEL[game.status]}
      </span>
    </span>
  );
}

function GameRow({ game }: { game: BasketballGame }) {
  const [, m, d] = game.game_date.split("-");
  return (
    <li className="grid grid-cols-[4.5rem_1.25rem_1fr] items-baseline gap-x-3 border-b border-rule py-3 sm:grid-cols-[5rem_1.5rem_1fr_auto] sm:gap-x-5">
      <div className="latin text-ink-muted">
        <span className="text-sm tabular-nums">
          {m}<span className="text-ink-faint">/</span>{d}
        </span>
        <span className="ml-1 text-xs text-ink-faint">
          {weekday(game.game_date)}
        </span>
      </div>

      {/* ホームは朱、アウェイは控えめに。 */}
      <div
        className={`text-xs ${game.is_home === 1 ? "text-accent" : "text-ink-faint"}`}
        title={game.is_home === 1 ? "ホーム" : "アウェイ"}
      >
        {game.is_home === 1 ? "H" : "A"}
      </div>

      <div className="min-w-0">
        <span className="mincho">{game.opponent}</span>
        <span className="ml-3 text-xs text-ink-faint">
          {game.tip_off ?? "時刻未定"}
        </span>
        {game.venue && (
          <p className="mt-0.5 truncate text-xs text-ink-muted">{game.venue}</p>
        )}
        {game.memo && <p className="mt-1 text-sm text-ink-muted">{game.memo}</p>}
      </div>

      <div className="col-start-3 mt-1.5 sm:col-start-4 sm:mt-0 sm:text-right">
        <Result game={game} />
      </div>
    </li>
  );
}

/** チーム＋リーグでまとめ、その中を月で区切る。 */
function group(items: BasketballGame[]) {
  const byTeam: { team: string; league: string | null; games: BasketballGame[] }[] = [];
  for (const g of items) {
    const found = byTeam.find((t) => t.team === g.team && t.league === g.league);
    if (found) found.games.push(g);
    else byTeam.push({ team: g.team, league: g.league, games: [g] });
  }
  return byTeam.map((t) => {
    const months: { key: string; label: string; games: BasketballGame[] }[] = [];
    for (const g of t.games) {
      const [y, m] = g.game_date.split("-");
      const key = `${y}-${m}`;
      const found = months.find((x) => x.key === key);
      if (found) found.games.push(g);
      else months.push({ key, label: `${y}年${Number(m)}月`, games: [g] });
    }
    return { ...t, months };
  });
}

export default function BasketballTab({ items }: { items: BasketballGame[] }) {
  const groups = group(items);

  return (
    <section>
      <SectionHead ja="籠球" en="Basketball" count={items.length} />
      {items.length === 0 ? (
        <EmptyNote>観る予定の試合がありません。</EmptyNote>
      ) : (
        <div className="space-y-12">
          {groups.map((t) => (
            <div key={`${t.team}-${t.league}`}>
              <div className="mb-5 flex items-baseline gap-3 border-b border-rule-firm pb-1.5">
                <h3 className="mincho tracking-wide">{t.team}</h3>
                {t.league && (
                  <span className="latin text-xs uppercase tracking-[0.2em] text-ink-faint">
                    {t.league}
                  </span>
                )}
                <span className="latin ml-auto text-sm text-ink-muted">
                  {t.games.length}
                </span>
              </div>

              <div className="space-y-7">
                {t.months.map((mo) => (
                  <div key={mo.key}>
                    <h4 className="mincho mb-1.5 text-xs text-ink-faint">
                      {mo.label}
                    </h4>
                    <ol>
                      {mo.games.map((g) => (
                        <GameRow key={g.id} game={g} />
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
