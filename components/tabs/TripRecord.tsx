"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { TripPhoto, TripRace } from "@/lib/types";

// public/ の画像は basePath を自分で前に付ける必要がある（next/image も同じ）。
// NEXT_PUBLIC_ なのでビルド時に埋め込まれる。
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const asset = (p: string) => `${BASE}${p}`;

const yen = (n: number) => `${n.toLocaleString("ja-JP")}円`;

/** 場面ごとにまとめる。並びは撮影順のまま。 */
function byScene(photos: TripPhoto[]) {
  const groups: { scene: string; photos: TripPhoto[] }[] = [];
  for (const p of photos) {
    const scene = p.scene ?? "";
    const last = groups.at(-1);
    if (last && last.scene === scene) last.photos.push(p);
    else groups.push({ scene, photos: [p] });
  }
  return groups;
}

function SubHead({ ja, en, note }: { ja: string; en: string; note?: string }) {
  return (
    <div className="mb-3 flex items-baseline gap-3 border-b border-rule-firm pb-1">
      <h4 className="mincho text-sm">{ja}</h4>
      <span className="latin text-[0.7rem] uppercase tracking-[0.22em] text-ink-faint">
        {en}
      </span>
      {note && <span className="ml-auto text-xs text-ink-faint">{note}</span>}
    </div>
  );
}

// ---------------------------------------------------------------- 写真

function Lightbox({
  photos,
  index,
  onMove,
  onClose,
}: {
  photos: TripPhoto[];
  index: number | null;
  onMove: (i: number) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const open = index !== null;

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onMove((index + delta + photos.length) % photos.length);
    },
    [index, onMove, photos.length]
  );

  const p = index !== null ? photos[index] : null;

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // 画像の外（backdrop）を押したら閉じる
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
      aria-label={p?.caption ?? "写真"}
      className="m-auto max-h-none max-w-none bg-transparent p-0 backdrop:bg-black/85"
    >
      {p && (
        <figure className="flex max-w-[94vw] flex-col items-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- 静的エクスポートで最適化サーバーが無いため素の img */}
          <img
            src={asset(p.src)}
            alt={p.caption ?? ""}
            width={p.width ?? undefined}
            height={p.height ?? undefined}
            className="block h-auto max-h-[80vh] w-auto max-w-[94vw] object-contain"
          />
          <figcaption className="mt-3 flex w-full items-baseline gap-3 text-sm text-white/85">
            <span className="mincho">{p.caption}</span>
            {p.taken_at && (
              <span className="latin text-xs text-white/55">{p.taken_at}</span>
            )}
            <span className="latin ml-auto text-xs text-white/55">
              {index! + 1} / {photos.length}
            </span>
          </figcaption>
          <div className="mt-3 flex gap-6 text-sm text-white/75">
            <button type="button" className="cursor-pointer hover:text-white" onClick={() => step(-1)}>
              ← 前
            </button>
            <button type="button" className="cursor-pointer hover:text-white" onClick={onClose}>
              閉じる
            </button>
            <button type="button" className="cursor-pointer hover:text-white" onClick={() => step(1)}>
              次 →
            </button>
          </div>
        </figure>
      )}
    </dialog>
  );
}

function Gallery({ photos }: { photos: TripPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const groups = byScene(photos);

  return (
    <div>
      <SubHead ja="写真" en="Photos" note={`${photos.length}枚`} />
      <div className="space-y-5">
        {groups.map((g) => {
          const first = g.photos[0].taken_at;
          const last = g.photos.at(-1)!.taken_at;
          return (
            <div key={`${g.scene}-${g.photos[0].id}`}>
              {g.scene && (
                <p className="mb-2 flex items-baseline gap-2 text-xs text-ink-muted">
                  <span className="mincho">{g.scene}</span>
                  {first && (
                    <span className="latin text-ink-faint">
                      {first}
                      {last && last !== first && `–${last}`}
                    </span>
                  )}
                </p>
              )}
              <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
                {g.photos.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => setOpen(photos.indexOf(p))}
                      className="group block w-full cursor-zoom-in text-left"
                    >
                      <span className="block aspect-square overflow-hidden bg-paper-sunk">
                        {/* eslint-disable-next-line @next/next/no-img-element -- 静的エクスポートで最適化サーバーが無いため素の img */}
                        <img
                          src={asset(p.thumb_src ?? p.src)}
                          alt={p.caption ?? ""}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-opacity group-hover:opacity-85"
                        />
                      </span>
                      <span className="mt-1 block truncate text-[0.7rem] leading-tight text-ink-muted">
                        {p.caption}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
      <Lightbox
        photos={photos}
        index={open}
        onMove={setOpen}
        onClose={() => setOpen(null)}
      />
    </div>
  );
}

// ---------------------------------------------------------------- レース

function RaceCard({ race }: { race: TripRace }) {
  const facts = [race.track, race.conditions, race.meeting].filter(Boolean).join("・");

  return (
    <article className="border-b border-rule py-4 first:pt-1">
      <header className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="latin text-sm text-accent">
          {race.course}
          {race.race_no}R
        </span>
        <h5 className="mincho text-base">
          {race.race_name}
          {race.grade && (
            <span className="latin ml-1 text-xs text-ink-muted">({race.grade})</span>
          )}
        </h5>
        {race.post_time && (
          <span className="latin ml-auto text-xs text-ink-faint">
            {race.post_time}
            <span className="ml-0.5">発走</span>
          </span>
        )}
      </header>
      {facts && <p className="mt-1 text-xs text-ink-faint">{facts}</p>}

      <table className="mt-3 w-full text-sm">
        <thead>
          <tr className="text-left text-[0.7rem] text-ink-faint">
            <th className="w-7 pb-1 font-normal">着</th>
            <th className="w-8 pb-1 font-normal">馬番</th>
            <th className="pb-1 font-normal">馬名</th>
            <th className="hidden pb-1 font-normal sm:table-cell">騎手</th>
            <th className="w-10 pb-1 text-right font-normal">人気</th>
            <th className="w-12 pb-1 text-right font-normal">着差</th>
          </tr>
        </thead>
        <tbody>
          {race.placings.map((h) => (
            <tr key={h.pos} className="border-t border-rule/70">
              <td className="latin py-1 text-ink-muted">{h.pos}</td>
              <td className="latin py-1 tabular-nums">{h.no}</td>
              <td className="py-1">
                {h.name}
                {h.jockey && (
                  <span className="ml-2 inline-block whitespace-nowrap text-xs text-ink-faint sm:hidden">
                    {h.jockey}
                  </span>
                )}
              </td>
              <td className="hidden py-1 text-ink-muted sm:table-cell">{h.jockey}</td>
              <td className="latin py-1 text-right tabular-nums text-ink-muted">{h.pop}</td>
              <td className="py-1 text-right text-xs text-ink-faint">
                {h.margin ?? <span className="latin">{h.time}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {race.bets.length > 0 && (
        <div className="mt-3 border-l-2 border-accent pl-3 text-sm">
          <ul className="space-y-1">
            {race.bets.map((b, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <span className="mincho text-accent">的中</span>
                {b.bettor && <span className="text-xs text-ink-muted">{b.bettor}</span>}
                <span>
                  {b.type}
                  <span className="latin ml-1.5 tabular-nums">{b.hit}</span>
                </span>
                {b.detail && <span className="text-xs text-ink-faint">{b.detail}</span>}
                {b.dividend_yen && (
                  <span className="ml-auto text-xs text-ink-muted">
                    配当 <span className="latin text-sm text-ink">{yen(b.dividend_yen)}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
          {/* 1枚だけで配当と同額なら重ねて出さない */}
          {race.returned_yen &&
            !(race.bets.length === 1 && race.returned_yen === race.bets[0].dividend_yen) && (
              <p className="mt-1.5 border-t border-rule pt-1.5 text-right text-xs text-ink-muted">
                払戻 計
                <span className="latin ml-1.5 text-sm text-ink">{yen(race.returned_yen)}</span>
              </p>
            )}
        </div>
      )}

      {race.source_url && (
        <p className="mt-2 text-right text-[0.7rem]">
          <a
            href={race.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink-faint underline decoration-rule-firm underline-offset-4 hover:text-ink-muted"
          >
            結果の出典（netkeiba）
          </a>
        </p>
      )}
    </article>
  );
}

function Races({ races }: { races: TripRace[] }) {
  return (
    <div>
      <SubHead ja="注目レース" en="Races" note={`${races.length}レース`} />
      {races.map((r) => (
        <RaceCard key={r.id} race={r} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- まとめ

/**
 * 写真とレースをひとつの details にたたむ。
 * セットリストと同じく、開きっぱなしだと1件で一覧が埋まるため。
 */
export default function TripRecord({
  photos,
  races,
}: {
  photos: TripPhoto[];
  races: TripRace[];
}) {
  if (photos.length === 0 && races.length === 0) return null;
  const parts = [
    photos.length > 0 && `写真${photos.length}枚`,
    races.length > 0 && `注目レース${races.length}`,
  ].filter(Boolean);

  return (
    <details className="group/rec mt-5">
      <summary
        className="flex cursor-pointer list-none items-baseline gap-3 border-y border-rule py-2
                   [&::-webkit-details-marker]:hidden"
      >
        <span className="latin text-xs uppercase tracking-[0.22em] text-ink-muted">
          Record
        </span>
        <span className="text-xs text-ink-faint">{parts.join(" / ")}</span>
        <span
          aria-hidden
          className="ml-auto w-3 text-center text-xs text-ink-faint group-open/rec:hidden"
        >
          ＋
        </span>
        <span
          aria-hidden
          className="ml-auto hidden w-3 text-center text-xs text-ink-faint group-open/rec:inline"
        >
          −
        </span>
      </summary>

      <div className="space-y-8 pt-5">
        {photos.length > 0 && <Gallery photos={photos} />}
        {races.length > 0 && <Races races={races} />}
      </div>
    </details>
  );
}
