import Dashboard from "@/components/Dashboard";
import { getDashboardData } from "@/lib/queries";

// 動的 API を使っていないので既定で静的レンダリングされる。
//  - build:pages : ビルド時に一度だけ SQLite を読み、HTML に焼き込む
//  - dev / start : 書き込み後に revalidatePath で作り直す
export default function Page() {
  const data = getDashboardData();
  return <Dashboard data={data} />;
}
