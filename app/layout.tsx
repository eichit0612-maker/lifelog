import type { Metadata } from "next";
import { EB_Garamond } from "next/font/google";
import "./globals.css";

// 欧文・数字のみ。和文はシステムの明朝/ゴシックを使うので subsets は latin だけでよい。
const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "記録帳 — Lifelog",
  description: "食べたもの、行った場所、観た試合と作品の記録",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${ebGaramond.variable} h-full`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
