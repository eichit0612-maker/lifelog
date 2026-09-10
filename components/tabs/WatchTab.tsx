import type { MediaType, WatchLog } from "@/lib/types";
import { Badge, EmptyState, Stars, TabHeader, formatDate } from "../ui";

const MEDIA_LABEL: Record<MediaType, string> = {
  movie: "映画",
  anime: "アニメ",
  drama: "ドラマ",
};

const MEDIA_TONE = {
  movie: "violet",
  anime: "sky",
  drama: "amber",
} as const;

export default function WatchTab({ items }: { items: WatchLog[] }) {
  return (
    <section>
      <TabHeader title="映画・アニメ鑑賞ログ" count={items.length} action="記録を追加" />
      {items.length === 0 ? (
        <EmptyState message="まだ鑑賞ログがありません。" />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-3xl text-left text-sm">
            <thead className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">タイトル</th>
                <th className="px-4 py-3 font-medium">種別</th>
                <th className="px-4 py-3 font-medium">ジャンル</th>
                <th className="px-4 py-3 font-medium">視聴日</th>
                <th className="px-4 py-3 font-medium">評価</th>
                <th className="px-4 py-3 font-medium">ひとこと感想</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-medium">{w.title}</td>
                  <td className="px-4 py-3">
                    <Badge tone={MEDIA_TONE[w.media_type]}>
                      {MEDIA_LABEL[w.media_type]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {w.genre ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(w.watched_on)}
                  </td>
                  <td className="px-4 py-3">
                    <Stars value={w.rating} />
                  </td>
                  <td className="max-w-xs px-4 py-3 text-slate-600 dark:text-slate-300">
                    {w.comment ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
