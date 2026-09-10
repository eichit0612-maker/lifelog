import type { Gourmet } from "@/lib/types";
import { DateText, EmptyNote, Index, Rating, SectionHead, Tag } from "../ui";

export default function GourmetTab({ items }: { items: Gourmet[] }) {
  return (
    <section>
      <SectionHead ja="食" en="Food" count={items.length} />
      {items.length === 0 ? (
        <EmptyNote>まだ書き留めた店がありません。</EmptyNote>
      ) : (
        <ol className="border-t border-rule">
          {items.map((g, i) => (
            <li
              key={g.id}
              className="grid grid-cols-[2rem_1fr] gap-x-4 border-b border-rule py-6
                         sm:grid-cols-[2.5rem_1fr_auto] sm:gap-x-6"
            >
              <div className="pt-1">
                <Index n={i + 1} />
              </div>

              <div className="min-w-0">
                <h3 className="mincho text-lg leading-snug">{g.name}</h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                  {g.genre && <Tag>{g.genre}</Tag>}
                  {g.location && <Tag>{g.location}</Tag>}
                </div>
                {g.memo && (
                  <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-muted">
                    {g.memo}
                  </p>
                )}
              </div>

              <div className="col-start-2 mt-4 flex items-center gap-5 sm:col-start-3 sm:mt-1 sm:flex-col sm:items-end sm:gap-2">
                <Rating value={g.rating} />
                <DateText value={g.visited_on} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
