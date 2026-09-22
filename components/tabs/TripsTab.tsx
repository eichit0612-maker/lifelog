import type { SetlistSong, Trip } from "@/lib/types";
import { DateRange, EmptyNote, Index, SectionHead, Tag } from "../ui";

const DOW = ["日", "月", "火", "水", "木", "金", "土"];

function nights(start: string, end: string | null): string {
  if (!end || end === start) return "日帰り";
  const n = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 86_400_000
  );
  return `${n}泊${n + 1}日`;
}

function dayLabel(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  const dow = DOW[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${m}/${d}(${dow})`;
}

type Act = {
  actNo: number;
  artist: string;
  stage: string | null;
  songs: SetlistSong[];
};

/** 日 → アクト の順に組み直す。クエリ側で順序は揃っている。 */
function byDay(songs: SetlistSong[]) {
  const days: { date: string; acts: Act[] }[] = [];
  for (const s of songs) {
    let day = days.find((d) => d.date === s.performed_on);
    if (!day) {
      day = { date: s.performed_on, acts: [] };
      days.push(day);
    }
    let act = day.acts.find((a) => a.actNo === s.act_no);
    if (!act) {
      act = { actNo: s.act_no, artist: s.artist, stage: s.stage, songs: [] };
      day.acts.push(act);
    }
    act.songs.push(s);
  }
  return days;
}

function ActBlock({ act }: { act: Act }) {
  return (
    // details なので JS なしで開閉できる。静的サイトでもそのまま動く。
    <details className="group border-b border-rule">
      <summary
        className="flex cursor-pointer list-none items-baseline gap-3 py-2.5
                   [&::-webkit-details-marker]:hidden"
      >
        <span className="latin w-5 shrink-0 text-xs text-ink-faint">
          {act.actNo}
        </span>
        <span className="mincho">{act.artist}</span>
        {act.stage && <span className="text-xs text-ink-faint">{act.stage}</span>}
        <span className="latin ml-auto text-xs text-ink-muted">
          {act.songs.length}
          <span className="ml-0.5 text-ink-faint">曲</span>
        </span>
        <span
          aria-hidden
          className="w-3 text-center text-xs text-ink-faint group-open:hidden"
        >
          ＋
        </span>
        <span
          aria-hidden
          className="hidden w-3 text-center text-xs text-ink-faint group-open:inline"
        >
          −
        </span>
      </summary>

      <ol className="pb-3 pl-8">
        {act.songs.map((s) => (
          <li key={s.id} className="flex items-baseline gap-3 py-1">
            <span className="latin w-4 shrink-0 text-right text-xs text-ink-faint">
              {s.song_no}
            </span>
            {s.url ? (
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-ink underline decoration-rule-firm
                           underline-offset-4 transition-colors hover:decoration-accent"
              >
                {s.title}
              </a>
            ) : (
              <span className="text-sm text-ink-muted">{s.title}</span>
            )}
          </li>
        ))}
      </ol>
    </details>
  );
}

function Setlist({ songs }: { songs: SetlistSong[] }) {
  const days = byDay(songs);
  return (
    <div className="mt-6">
      <h4 className="latin mb-3 text-xs uppercase tracking-[0.22em] text-ink-faint">
        Setlist
      </h4>
      <div className="space-y-6">
        {days.map((day, i) => (
          <div key={day.date}>
            <h5 className="mincho mb-1 border-b border-rule-firm pb-1 text-xs text-ink-muted">
              {i + 1}日目
              <span className="latin ml-2 text-ink-faint">
                {dayLabel(day.date)}
              </span>
            </h5>
            {day.acts.map((act) => (
              <ActBlock key={act.actNo} act={act} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TripsTab({
  items,
  setlist,
}: {
  items: Trip[];
  setlist: SetlistSong[];
}) {
  return (
    <section>
      <SectionHead ja="旅" en="Travel" count={items.length} />
      {items.length === 0 ? (
        <EmptyNote>行った場所はこれから書き足していきます。</EmptyNote>
      ) : (
        <ol className="border-t border-rule">
          {items.map((t, i) => {
            const songs = setlist.filter((s) => s.trip_id === t.id);
            return (
              <li
                key={t.id}
                className="grid grid-cols-[2rem_1fr] gap-x-4 border-b border-rule py-6
                           sm:grid-cols-[2.5rem_1fr] sm:gap-x-6"
              >
                <div className="pt-1">
                  <Index n={i + 1} />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h3 className="mincho text-lg leading-snug">
                      {t.title ?? t.place}
                    </h3>
                    <DateRange start={t.start_date} end={t.end_date} />
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <Tag>{t.place}</Tag>
                    <Tag>{nights(t.start_date, t.end_date)}</Tag>
                    {songs.length > 0 && <Tag>{songs.length}曲</Tag>}
                  </div>

                  {t.memo && (
                    <p className="mt-3 max-w-prose text-sm leading-relaxed text-ink-muted">
                      {t.memo}
                    </p>
                  )}

                  {songs.length > 0 && <Setlist songs={songs} />}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
