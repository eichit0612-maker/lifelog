import type { BasketballGame, GameStatus } from "@/lib/types";
import { Badge, Card, EmptyState, TabHeader, formatDate } from "../ui";

const STATUS_LABEL: Record<GameStatus, string> = {
  scheduled: "予定",
  win: "勝ち",
  lose: "負け",
  draw: "引き分け",
  cancelled: "中止",
};

const STATUS_TONE = {
  scheduled: "sky",
  win: "emerald",
  lose: "red",
  draw: "slate",
  cancelled: "slate",
} as const;

function GameRow({ game }: { game: BasketballGame }) {
  const hasScore = game.our_score !== null && game.opponent_score !== null;
  return (
    <Card className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4">
      <div className="w-24 shrink-0">
        <p className="font-mono text-sm">{formatDate(game.game_date)}</p>
        {game.tip_off && (
          <p className="font-mono text-xs text-slate-400">{game.tip_off}</p>
        )}
      </div>

      <div className="min-w-40 flex-1">
        <p className="font-semibold">vs {game.opponent}</p>
        {game.venue && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{game.venue}</p>
        )}
      </div>

      <div className="w-28 shrink-0 text-center">
        {hasScore ? (
          <p className="font-mono text-lg font-semibold tabular-nums">
            {game.our_score}
            <span className="mx-1 text-slate-400">-</span>
            {game.opponent_score}
          </p>
        ) : (
          <p className="font-mono text-sm text-slate-400">—</p>
        )}
      </div>

      <div className="w-20 shrink-0 text-right">
        <Badge tone={STATUS_TONE[game.status]}>{STATUS_LABEL[game.status]}</Badge>
      </div>

      {game.memo && (
        <p className="w-full text-sm text-slate-600 dark:text-slate-300">{game.memo}</p>
      )}
    </Card>
  );
}

export default function BasketballTab({ items }: { items: BasketballGame[] }) {
  const upcoming = items.filter((g) => g.status === "scheduled");
  const finished = items.filter((g) => g.status !== "scheduled");

  return (
    <section>
      <TabHeader title="バスケ 試合" count={items.length} action="試合を追加" />
      {items.length === 0 ? (
        <EmptyState message="まだ試合が登録されていません。" />
      ) : (
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              これからの予定
            </h3>
            {upcoming.length === 0 ? (
              <EmptyState message="予定されている試合はありません。" />
            ) : (
              <div className="space-y-2">
                {upcoming.map((g) => (
                  <GameRow key={g.id} game={g} />
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
              過去の試合
            </h3>
            <div className="space-y-2">
              {finished.map((g) => (
                <GameRow key={g.id} game={g} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
