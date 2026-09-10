import type { BasketballGame, GameStatus } from "@/lib/types";
import { EmptyNote, SectionHead } from "../ui";

const STATUS_LABEL: Record<GameStatus, string> = {
  scheduled: "予定",
  win: "勝",
  lose: "敗",
  draw: "分",
  cancelled: "中止",
};

function Result({ game }: { game: BasketballGame }) {
  const hasScore = game.our_score !== null && game.opponent_score !== null;

  if (!hasScore) {
    return (
      <span
        className={`text-xs ${
          game.status === "cancelled" ? "text-ink-faint line-through" : "text-ink-muted"
        }`}
      >
        {STATUS_LABEL[game.status]}
      </span>
    );
  }

  const won = game.status === "win";
  return (
    <span className="flex items-baseline gap-2">
      <span className="latin text-lg tabular-nums">
        {game.our_score}
        <span className="mx-1 text-ink-faint">–</span>
        {game.opponent_score}
      </span>
      <span
        className={`mincho text-sm ${won ? "text-accent" : "text-ink-muted"}`}
      >
        {STATUS_LABEL[game.status]}
      </span>
    </span>
  );
}

function GameRow({ game }: { game: BasketballGame }) {
  const [, m, d] = game.game_date.split("-");
  return (
    <li className="grid grid-cols-[3.5rem_1fr] items-baseline gap-x-4 border-b border-rule py-5 sm:grid-cols-[4.5rem_1fr_auto] sm:gap-x-6">
      <div className="latin text-ink-muted">
        <span className="text-base tabular-nums">
          {m}<span className="text-ink-faint">/</span>{d}
        </span>
        {game.tip_off && (
          <div className="text-xs text-ink-faint tabular-nums">{game.tip_off}</div>
        )}
      </div>

      <div className="min-w-0">
        <h4 className="mincho leading-snug">
          {game.team}
          <span className="mx-2 text-xs text-ink-faint">対</span>
          {game.opponent}
        </h4>
        {game.venue && (
          <p className="mt-1 text-xs text-ink-muted">{game.venue}</p>
        )}
        {game.memo && <p className="mt-2 text-sm text-ink-muted">{game.memo}</p>}
      </div>

      <div className="col-start-2 mt-2 sm:col-start-3 sm:mt-0 sm:text-right">
        <Result game={game} />
      </div>
    </li>
  );
}

export default function BasketballTab({ items }: { items: BasketballGame[] }) {
  // リーグごとにまとめる。順序は登場順を保つ。
  const leagues: { name: string; games: BasketballGame[] }[] = [];
  for (const g of items) {
    const name = g.league ?? "その他";
    const found = leagues.find((l) => l.name === name);
    if (found) found.games.push(g);
    else leagues.push({ name, games: [g] });
  }

  return (
    <section>
      <SectionHead ja="籠球" en="Basketball" count={items.length} />
      {items.length === 0 ? (
        <EmptyNote>観る予定の試合がありません。</EmptyNote>
      ) : (
        <div className="space-y-10">
          {leagues.map((l) => (
            <div key={l.name}>
              <h3 className="latin mb-3 border-b border-rule-firm pb-1.5 text-xs uppercase tracking-[0.22em] text-ink-muted">
                {l.name}
              </h3>
              <ol>
                {l.games.map((g) => (
                  <GameRow key={g.id} game={g} />
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
