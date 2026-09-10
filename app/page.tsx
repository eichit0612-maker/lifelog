import Dashboard from "@/components/Dashboard";
import { getDashboardData } from "@/lib/queries";

// 動的 API を使っていないので既定で静的レンダリングされる。
//  - build:pages : ビルド時に一度だけ SQLite を読み、HTML に焼き込む
//  - dev / start : 書き込み後に revalidatePath で作り直す
export default function Page() {
  const data = getDashboardData();
  // 静的サイトなので「最終更新 = 最後にビルドした日」になる。
  const updatedAt = new Date().toISOString().slice(0, 10);
  return <Dashboard data={data} updatedAt={updatedAt} />;
}
