import type { ReactNode } from "react";

/** 見出し。日本語の下に小さく欧文を添える。 */
export function SectionHead({
  ja,
  en,
  count,
  note,
}: {
  ja: string;
  en: string;
  count?: number;
  note?: string;
}) {
  return (
    <header className="accent-rule mb-7">
      <div className="flex items-baseline gap-3">
        <h2 className="mincho text-xl tracking-wide">{ja}</h2>
        <span className="latin text-xs uppercase tracking-[0.22em] text-ink-faint">
          {en}
        </span>
        {count !== undefined && (
          <span className="latin ml-auto text-sm text-ink-muted">{count}</span>
        )}
      </div>
      {note && <p className="mt-2 text-xs text-ink-muted">{note}</p>}
    </header>
  );
}

/** 通し番号。台帳の行番号のような役割。 */
export function Index({ n }: { n: number }) {
  return (
    <span className="latin select-none text-sm text-ink-faint">
      {String(n).padStart(2, "0")}
    </span>
  );
}

/** ラベル。囲みではなく、細い縦罫と小さな文字で示す。 */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="border-l border-rule-firm pl-2 text-xs text-ink-muted">
      {children}
    </span>
  );
}

/**
 * 5段階評価。★を並べず、小さな升目を打つ。
 * 未評価は「評価なし」と書かず、空の升目のまま置く。文字が並ぶと目障りなので。
 */
export function Rating({ value }: { value: number | null }) {
  return (
    <span
      className={`inline-flex items-center gap-[3px] ${value == null ? "opacity-45" : ""}`}
      title={value == null ? "未評価" : `${value} / 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          aria-hidden
          className={`block h-[7px] w-[7px] ${
            value != null && i <= value ? "bg-accent" : "border border-rule-firm"
          }`}
        />
      ))}
      <span className="sr-only">
        {value == null ? "未評価" : `5段階評価で${value}`}
      </span>
    </span>
  );
}

/** 日付。未入力は罫線だけを引いて「書ける場所」に見せる。 */
export function DateText({ value }: { value: string | null }) {
  if (!value) {
    return (
      <span
        className="inline-block w-16 border-b border-dotted border-rule-firm align-middle"
        title="未記入"
      />
    );
  }
  const [y, m, d] = value.split("-");
  return (
    <span className="latin text-sm text-ink-muted">
      {y}<span className="mx-[2px] text-ink-faint">.</span>{m}
      <span className="mx-[2px] text-ink-faint">.</span>{d}
    </span>
  );
}

export function DateRange({ start, end }: { start: string; end: string | null }) {
  if (!end || end === start) return <DateText value={start} />;
  return (
    <span className="latin text-sm text-ink-muted">
      <DateText value={start} />
      <span className="mx-1 text-ink-faint">—</span>
      <DateText value={end} />
    </span>
  );
}

/** 空のタブ。破線の箱は置かず、余白と一行の説明で見せる。 */
export function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <div className="border-t border-rule py-16 text-center">
      <p className="mincho text-sm text-ink-muted">{children}</p>
    </div>
  );
}
