import type { Trip } from "@/lib/types";
import { DateRange, EmptyNote, Index, SectionHead, Tag } from "../ui";

function nights(start: string, end: string | null): string {
  if (!end || end === start) return "日帰り";
  const n = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 86_400_000
  );
  return `${n}泊${n + 1}日`;
}

export default function TripsTab({ items }: { items: Trip[] }) {
  return (
    <section>
      <SectionHead ja="旅" en="Travel" count={items.length} />
      {items.length === 0 ? (
        <EmptyNote>行った場所はこれから書き足していきます。</EmptyNote>
      ) : (
        <ol className="border-t border-rule">
          {items.map((t, i) => (
            <li
              key={t.id}
              className="grid grid-cols-[2rem_1fr] gap-x-4 border-b border-rule py-6
                         sm:grid-cols-[2.5rem_1fr_auto] sm:gap-x-6"
            >
              <div className="pt-1">
                <Index n={i + 1} />
              </div>

              <div className="min-w-0">
                <h3 className="mincho text-lg leading-snug">{t.title ?? t.place}</h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Tag>{t.place}</Tag>
                  <Tag>{nights(t.start_date, t.end_date)}</Tag>
                </div>
                {t.memo && (
                  <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-muted">
                    {t.memo}
                  </p>
                )}
              </div>

              <div className="col-start-2 mt-3 sm:col-start-3 sm:mt-1 sm:text-right">
                <DateRange start={t.start_date} end={t.end_date} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
