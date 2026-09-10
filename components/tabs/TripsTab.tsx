import type { Trip } from "@/lib/types";
import { Badge, Card, EmptyState, TabHeader, formatDateRange, nightsLabel } from "../ui";

export default function TripsTab({ items }: { items: Trip[] }) {
  return (
    <section>
      <TabHeader title="旅行記録" count={items.length} action="旅行を追加" />
      {items.length === 0 ? (
        <EmptyState message="まだ旅行の記録がありません。" />
      ) : (
        <ol className="relative space-y-3 border-l border-slate-200 pl-6 dark:border-slate-800">
          {items.map((t) => (
            <li key={t.id} className="relative">
              <span className="absolute -left-[1.9rem] top-5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-slate-50 dark:ring-slate-950" />
              <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold">{t.title ?? t.place}</h3>
                  <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {formatDateRange(t.start_date, t.end_date)}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone="emerald">{t.place}</Badge>
                  <Badge>{nightsLabel(t.start_date, t.end_date)}</Badge>
                </div>
                {t.memo && (
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {t.memo}
                  </p>
                )}
              </Card>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
