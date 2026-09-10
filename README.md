# Lifelog Dashboard

個人用ライフログ。グルメ / 旅行 / バスケ / 映画・アニメ鑑賞を 1 画面のタブで切り替えて管理する。

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- SQLite (better-sqlite3)
- GitHub Pages（静的エクスポート）

SQLite を手元の正データとして持ち、**ビルド時に読んで静的サイトへ焼き込む**構成。
記録の追加・編集はローカル、公開サイトは閲覧専用。

## セットアップ

```bash
npm install
npm run db:seed   # スキーマ作成 + サンプルデータ投入
npm run dev       # http://localhost:3000
```

### `.npmrc` の `ignore-scripts=true` について

`better-sqlite3` は `binding.gyp` を同梱しているため、npm が自動で `node-gyp rebuild` を
実行しようとする。しかし各プラットフォーム向けのビルド済みバイナリが
`node_modules/better-sqlite3/prebuilds/` に同梱されているので、自前ビルドは不要。

これを止めないと Visual Studio (Desktop development with C++) が無い Windows 環境で
`npm install` が失敗する。そのため `.npmrc` でインストールスクリプトを無効にしている。

**postinstall が必須の依存を今後追加したときは、この設定を見直すこと。**

DB ファイルは `db/lifelog.db`（git 管理外）。`LIFELOG_DB_PATH` で場所を変更できる。

| コマンド | 内容 |
| --- | --- |
| `npm run dev` | 開発サーバー。ここで記録を追加・編集する |
| `npm run build` | 通常ビルド（サーバーあり） |
| `npm run build:pages` | GitHub Pages 用に `out/` へ静的エクスポート |
| `npm run preview:pages` | 静的エクスポートをローカルで確認 |
| `npm run db:seed` | サンプルデータを入れ直す（既存データは削除） |
| `npm run db:reset` | DB ファイルごと作り直す |
| `npm run db:checkpoint` | WAL を本体に書き戻す（コミット前に実行） |

## ディレクトリ

```
db/schema.sql          スキーマ定義（唯一の正）
lib/db.ts              接続。起動時に schema.sql を流す（IF NOT EXISTS）
lib/queries.ts         一覧取得・集計クエリ
lib/types.ts           テーブルと 1:1 の TypeScript 型
app/page.tsx           サーバーコンポーネント。DB から読んで Dashboard に渡す
components/Dashboard.tsx  タブ切り替え（クライアント）
components/tabs/*      各タブの表示
```

## テーブル

### `gourmet` — グルメ

| 列 | 型 | 内容 |
| --- | --- | --- |
| `id` | INTEGER PK | |
| `name` | TEXT NOT NULL | 店名 |
| `location` | TEXT | 場所 |
| `genre` | TEXT | ジャンル |
| `rating` | INTEGER | 1–5 |
| `memo` | TEXT | メモ |
| `visited_on` | TEXT | 訪問日 `YYYY-MM-DD` |

### `trips` — 旅行記録

| 列 | 型 | 内容 |
| --- | --- | --- |
| `id` | INTEGER PK | |
| `title` | TEXT | 見出し（任意） |
| `place` | TEXT NOT NULL | 場所 |
| `start_date` | TEXT NOT NULL | 開始日 |
| `end_date` | TEXT | 終了日。日帰りは `start_date` と同じか NULL |
| `memo` | TEXT | 思い出メモ |

### `basketball_games` — バスケ試合

| 列 | 型 | 内容 |
| --- | --- | --- |
| `id` | INTEGER PK | |
| `game_date` | TEXT NOT NULL | 日付 |
| `tip_off` | TEXT | 開始時刻 `HH:MM` |
| `opponent` | TEXT NOT NULL | 対戦相手 |
| `venue` | TEXT | 会場 |
| `status` | TEXT NOT NULL | `scheduled` / `win` / `lose` / `draw` / `cancelled` |
| `our_score` / `opponent_score` | INTEGER | スコア |
| `memo` | TEXT | メモ |

CHECK 制約で次を DB 側から保証している。

- `scheduled` / `cancelled` はスコア NULL、`win` / `lose` / `draw` はスコア必須
- `win` なら自分のスコアが上、`lose` なら下、`draw` なら同点

### `watch_logs` — 映画・アニメ鑑賞ログ

| 列 | 型 | 内容 |
| --- | --- | --- |
| `id` | INTEGER PK | |
| `title` | TEXT NOT NULL | タイトル |
| `media_type` | TEXT NOT NULL | `movie` / `anime` / `drama` |
| `genre` | TEXT | ジャンル |
| `watched_on` | TEXT NOT NULL | 視聴日 |
| `rating` | INTEGER | 1–5 |
| `comment` | TEXT | ひとこと感想 |

全テーブル共通で `created_at` / `updated_at` を持ち、`updated_at` は UPDATE トリガーで自動更新される。

## GitHub Pages へのデプロイ

`.github/workflows/deploy.yml` が main への push で動く。初回だけリポジトリの
**Settings → Pages → Source** を **GitHub Actions** にしておく。

```
ローカル                              GitHub
──────────────────────────────       ──────────────────────────
npm run dev で記録を追加
  ↓ SQLite (db/lifelog.db) に書き込み
npm run db:checkpoint
  ↓ WAL を本体へ
git commit db/lifelog.db  ──push──▶  Actions
                                       ↓ npm ci
                                       ↓ npm run build:pages（ここで DB を読む）
                                       ↓ out/ を artifact に
                                     GitHub Pages（閲覧専用）
```

`db/lifelog.db` は **意図的に git 管理下** に置いている。CI がビルド時にこれを読むため。
コミット前に `npm run db:checkpoint` を忘れると、直近の記録が `-wal` 側に残って公開サイトに出ない。

### basePath

`https://<user>.github.io/<repo>/` に置くと URL にリポジトリ名が挟まるので `basePath` が要る。
ワークフローがリポジトリ名から自動で決めるため、通常は何もしなくてよい。

- `<user>.github.io` リポジトリ、または `public/CNAME` あり（独自ドメイン）→ basePath なし
- それ以外 → `/<repo>`

手元で確認するときは `NEXT_PUBLIC_BASE_PATH=/<repo> npm run build:pages`。

### 公開範囲について

GitHub Pages のサイトは（プライベートリポジトリから配信した場合でも）URL を知っていれば誰でも見られる。
人に見せたくない記録を入れるなら、Pages ではなく認証のかかる場所に置くか、公開用に絞ったビューを別途用意すること。

## 現状のスコープ

読み取り専用のモック。「+ 追加」ボタンは配置のみで無効。

### 静的エクスポートの制約

`out/` にはサーバーが無いので、公開サイト側では次が動かない。

- Server Actions / Route Handlers
- リクエスト時の SQLite 参照

そのため **書き込みはローカル専用**にする。`next.config.ts` は `STATIC_EXPORT=1` のときだけ
`output: "export"` になるので、`npm run dev` では通常の Next.js サーバーとして
Server Actions が使える。ここが記録の入力口になる。

次にやること:

1. 登録・編集フォーム（Server Actions + `revalidatePath`）— **ローカルの `npm run dev` でのみ動く**
2. 削除
3. タブごとの検索・絞り込み（ジャンル、評価、期間）— 静的サイトでも動くようクライアント側で実装する
4. タブ状態を URL に持たせて共有・リロード対応
