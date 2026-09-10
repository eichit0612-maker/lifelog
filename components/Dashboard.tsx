"use client";

import { useState } from "react";
import type { DashboardData, TabKey } from "@/lib/types";
import GourmetTab from "./tabs/GourmetTab";
import TripsTab from "./tabs/TripsTab";
import BasketballTab from "./tabs/BasketballTab";
import WatchTab from "./tabs/WatchTab";

const TABS: { key: TabKey; label: string }[] = [
  { key: "gourmet", label: "グルメ" },
  { key: "trips", label: "旅行" },
  { key: "basketball", label: "バスケ" },
  { key: "watch", label: "鑑賞" },
];

/** 見出し下の数字。値が無いものは出さず、空欄を並べない。 */
function Figure({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="mincho text-sm text-ink-muted">{label}</span>
      <span className="latin text-lg tabular-nums">{value}</span>
      {sub && <span className="text-xs text-ink-faint">{sub}</span>}
    </div>
  );
}

export default function Dashboard({
  data,
  updatedAt,
}: {
  data: DashboardData;
  updatedAt: string;
}) {
  const [tab, setTab] = useState<TabKey>("gourmet");
  const { stats } = data;
  const { win, lose, draw } = stats.gameRecord;
  const hasRecord = win + lose + draw > 0;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
      <header>
        <p className="latin text-[0.7rem] uppercase tracking-[0.3em] text-ink-faint">
          Lifelog
        </p>
        <div className="mt-2 flex items-baseline justify-between gap-4">
          <h1 className="mincho text-3xl tracking-[0.08em]">記録帳</h1>
          <p className="latin text-xs text-ink-faint">
            更新 {updatedAt.replace(/-/g, ".")}
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-baseline gap-x-7 gap-y-2 border-y border-rule py-3">
          <Figure
            label="食"
            value={stats.gourmetCount}
            sub={
              stats.gourmetAvgRating != null
                ? `平均 ${stats.gourmetAvgRating.toFixed(1)}`
                : undefined
            }
          />
          <Figure label="旅" value={stats.tripCount} />
          <Figure
            label="籠球"
            value={stats.upcomingGameCount + win + lose + draw}
            sub={hasRecord ? `${win}勝${lose}敗` : undefined}
          />
          <Figure
            label="観"
            value={stats.watchCount}
            sub={
              stats.watchAvgRating != null
                ? `平均 ${stats.watchAvgRating.toFixed(1)}`
                : undefined
            }
          />
        </div>
      </header>

      <nav
        role="tablist"
        aria-label="記録の種類"
        className="mt-10 flex gap-7 border-b border-rule"
      >
        {TABS.map((t) => {
          const selected = t.key === tab;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              id={`tab-${t.key}`}
              aria-selected={selected}
              aria-controls={`panel-${t.key}`}
              onClick={() => setTab(t.key)}
              className={`mincho -mb-px cursor-pointer border-b-2 pb-2.5 text-sm tracking-wide transition-colors ${
                selected
                  ? "border-accent text-ink"
                  : "border-transparent text-ink-faint hover:text-ink-muted"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </nav>

      <main
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="pt-10"
      >
        {tab === "gourmet" && <GourmetTab items={data.gourmet} />}
        {tab === "trips" && <TripsTab items={data.trips} />}
        {tab === "basketball" && <BasketballTab items={data.games} />}
        {tab === "watch" && <WatchTab items={data.watchLogs} />}
      </main>
    </div>
  );
}
