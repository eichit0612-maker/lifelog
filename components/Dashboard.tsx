"use client";

import { useState } from "react";
import type { DashboardData, TabKey } from "@/lib/types";
import { StatCard } from "./ui";
import GourmetTab from "./tabs/GourmetTab";
import TripsTab from "./tabs/TripsTab";
import BasketballTab from "./tabs/BasketballTab";
import WatchTab from "./tabs/WatchTab";

const TABS: { key: TabKey; label: string; icon: string; active: string }[] = [
  { key: "gourmet", label: "グルメ", icon: "🍜", active: "border-rose-500 text-rose-600 dark:text-rose-400" },
  { key: "trips", label: "旅行記録", icon: "🧳", active: "border-emerald-500 text-emerald-600 dark:text-emerald-400" },
  { key: "basketball", label: "バスケ", icon: "🏀", active: "border-amber-500 text-amber-600 dark:text-amber-400" },
  { key: "watch", label: "鑑賞ログ", icon: "🎬", active: "border-violet-500 text-violet-600 dark:text-violet-400" },
];

function round1(n: number | null): string {
  return n == null ? "—" : n.toFixed(1);
}

export default function Dashboard({ data }: { data: DashboardData }) {
  const [tab, setTab] = useState<TabKey>("gourmet");
  const { stats } = data;
  const { win, lose, draw } = stats.gameRecord;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Lifelog Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          食べたもの・行った場所・試合・観た作品を 1 か所にまとめる
        </p>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="お店"
          value={stats.gourmetCount}
          unit="件"
          sub={`平均評価 ${round1(stats.gourmetAvgRating)}`}
          accent="bg-rose-500"
        />
        <StatCard
          label="旅行"
          value={stats.tripCount}
          unit="回"
          sub={`${stats.tripPlaceCount} か所`}
          accent="bg-emerald-500"
        />
        <StatCard
          label="戦績"
          value={`${win}勝${lose}敗${draw > 0 ? `${draw}分` : ""}`}
          sub={`予定 ${stats.upcomingGameCount} 試合`}
          accent="bg-amber-500"
        />
        <StatCard
          label="鑑賞"
          value={stats.watchCount}
          unit="本"
          sub={`平均評価 ${round1(stats.watchAvgRating)}`}
          accent="bg-violet-500"
        />
      </div>

      <div
        role="tablist"
        aria-label="ライフログのカテゴリ"
        className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800"
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
              className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                selected
                  ? t.active
                  : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <span className="mr-1.5" aria-hidden>
                {t.icon}
              </span>
              {t.label}
            </button>
          );
        })}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "gourmet" && <GourmetTab items={data.gourmet} />}
        {tab === "trips" && <TripsTab items={data.trips} />}
        {tab === "basketball" && <BasketballTab items={data.games} />}
        {tab === "watch" && <WatchTab items={data.watchLogs} />}
      </div>
    </main>
  );
}
