import type { MediaType, WatchLog } from "@/lib/types";
import { DateText, EmptyNote, Index, Rating, SectionHead } from "../ui";

const MEDIA_LABEL: Record<MediaType, string> = {
  movie: "映画",
  anime: "アニメ",
  drama: "ドラマ",
};

export default function WatchTab({ items }: { items: WatchLog[] }) {
  return (
    <section>
      <SectionHead ja="観" en="Screen" count={items.length} />
      {items.length === 0 ? (
        <EmptyNote>観た作品はまだ記録していません。</EmptyNote>
      ) : (
        <ol className="border-t border-rule">
          {items.map((w, i) => (
            <li
              key={w.id}
              className="grid grid-cols-[2rem_1fr] gap-x-4 border-b border-rule py-5
                         sm:grid-cols-[2.5rem_1fr_auto] sm:gap-x-6"
            >
              <div className="pt-1">
                <Index n={i + 1} />
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h3 className="mincho text-lg leading-snug">{w.title}</h3>
                  <span className="text-xs text-ink-faint">
                    {MEDIA_LABEL[w.media_type]}
                    {w.genre && `・${w.genre}`}
                  </span>
                </div>
                {w.comment && (
                  <p className="mt-2 max-w-prose text-sm leading-relaxed text-ink-muted">
                    {w.comment}
                  </p>
                )}
              </div>

              <div className="col-start-2 mt-3 flex items-center gap-5 sm:col-start-3 sm:mt-1 sm:flex-col sm:items-end sm:gap-2">
                <Rating value={w.rating} />
                <DateText value={w.watched_on} />
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
