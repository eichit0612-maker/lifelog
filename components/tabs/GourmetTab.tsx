import type { Gourmet } from "@/lib/types";
import { Badge, Card, EmptyState, Stars, TabHeader, formatDate } from "../ui";

export default function GourmetTab({ items }: { items: Gourmet[] }) {
  return (
    <section>
      <TabHeader title="グルメ" count={items.length} action="お店を追加" />
      {items.length === 0 ? (
        <EmptyState message="まだお店が登録されていません。" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((g) => (
            <Card key={g.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold leading-snug">{g.name}</h3>
                <Stars value={g.rating} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {g.genre && <Badge tone="rose">{g.genre}</Badge>}
                {g.location && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {g.location}
                  </span>
                )}
              </div>
              {g.memo && (
                <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {g.memo}
                </p>
              )}
              <p className="mt-3 font-mono text-xs text-slate-400">
                {formatDate(g.visited_on)}
              </p>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
