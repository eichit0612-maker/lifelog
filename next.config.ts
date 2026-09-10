import path from "node:path";
import type { NextConfig } from "next";

// STATIC_EXPORT=1 のときだけ静的エクスポートに切り替える。
//
//  - ローカル (`npm run dev`)  : 通常の Next.js サーバー。Server Actions が使えるので
//                                登録・編集フォームから SQLite に書き込める。
//  - Pages 向け (`build:pages`): out/ に静的化。閲覧専用の公開サイト。
//
// output: "export" を常時 ON にすると dev でも Server Actions が使えなくなるため分けている。
const isStaticExport = process.env.STATIC_EXPORT === "1";

// GitHub Pages のプロジェクトサイトは https://<user>.github.io/<repo>/ に置かれるため
// basePath が必要。ユーザーサイト（<user>.github.io）や独自ドメインなら空。CI が自動設定する。
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(isStaticExport
    ? {
        output: "export" as const,
        basePath,
        assetPrefix: basePath || undefined,
        // 静的エクスポートでは next/image の最適化サーバーが無い。
        images: { unoptimized: true },
        // /about → /about/index.html。Pages の配信と相性が良い。
        trailingSlash: true,
      }
    : {}),
  // better-sqlite3 はネイティブモジュール。バンドルせず require させる。
  serverExternalPackages: ["better-sqlite3"],
  turbopack: { root: path.resolve(process.cwd()) },
};

export default nextConfig;
