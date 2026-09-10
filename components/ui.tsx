import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white shadow-sm transition
                  hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  unit,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  unit?: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${accent}`} />
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold tabular-nums">
        {value}
        {unit && (
          <span className="ml-1 text-sm font-normal text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  );
}

export function Badge({
  children,
  tone = "slate",
}: {
  children: ReactNode;
  tone?: "slate" | "rose" | "emerald" | "amber" | "violet" | "sky" | "red";
}) {
  const tones: Record<string, string> = {
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    emerald: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
    sky: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    red: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  };
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function Stars({ value }: { value: number | null }) {
  if (value == null) {
    return <span className="text-xs text-slate-400">未評価</span>;
  }
  return (
    <span
      className="text-sm tracking-tight text-amber-500"
      aria-label={`5段階評価で${value}`}
      title={`${value} / 5`}
    >
      {"★".repeat(value)}
      <span className="text-slate-300 dark:text-slate-700">{"★".repeat(5 - value)}</span>
    </span>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      {message}
    </div>
  );
}

export function TabHeader({
  title,
  count,
  action,
}: {
  title: string;
  count: number;
  action: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <h2 className="text-lg font-semibold">
        {title}
        <span className="ml-2 font-mono text-sm font-normal text-slate-500 dark:text-slate-400">
          {count}
        </span>
      </h2>
      {/* モック段階では見た目のみ。登録フォームは次のステップで実装する。 */}
      <button
        type="button"
        disabled
        className="cursor-not-allowed rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-400 dark:border-slate-800 dark:text-slate-600"
        title="登録フォームは未実装（モック）"
      >
        + {action}
      </button>
    </div>
  );
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${y}/${m}/${d}`;
}

export function formatDateRange(start: string, end: string | null): string {
  if (!end || end === start) return formatDate(start);
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  return `${formatDate(start)} 〜 ${sameYear ? end.slice(5).replace("-", "/") : formatDate(end)}`;
}

export function nightsLabel(start: string, end: string | null): string {
  if (!end || end === start) return "日帰り";
  const nights = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / 86_400_000
  );
  return `${nights}泊${nights + 1}日`;
}
