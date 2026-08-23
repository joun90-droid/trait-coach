"use client";

import type { ReactNode } from "react";
import { formatPct, formatWon } from "@/lib/margin-calc";

export function KpiCard({
  label,
  value,
  sub,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "good" | "bad" | "warn";
  icon?: ReactNode;
}) {
  const toneClass =
    tone === "good"
      ? "text-re-success"
      : tone === "bad"
        ? "text-re-danger"
        : tone === "warn"
          ? "text-re-gold"
          : "text-re-text";

  return (
    <div className="glass bento-hover p-4">
      <p className="flex items-center gap-1.5 text-xs text-re-muted">
        {icon}
        {label}
      </p>
      <p className={`mt-1.5 font-mono text-xl font-black tabular-nums ${toneClass} sm:text-2xl`}>{value}</p>
      {sub && <p className="mt-1 text-[11px] text-re-muted">{sub}</p>}
    </div>
  );
}

/** 목표 순이익률 대비 달성률 진행 바 (0~100%+ 표시, 음수는 빨간 축소 바) */
export function MarginProgressBar({
  currentPct,
  targetPct,
}: {
  currentPct: number;
  targetPct: number;
}) {
  const ratio = targetPct > 0 ? currentPct / targetPct : currentPct >= 0 ? 1 : 0;
  const widthPct = Math.max(0, Math.min(100, ratio * 100));
  const isNegative = currentPct < 0;
  const achieved = currentPct >= targetPct;

  const barColor = isNegative ? "bg-re-danger" : achieved ? "bg-re-success" : "bg-re-accent";

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs text-re-muted">
        <span>목표 대비 달성률</span>
        <span className={`font-semibold ${isNegative ? "text-re-danger" : achieved ? "text-re-success" : "text-re-text"}`}>
          {isNegative ? "적자" : `${Math.round(ratio * 100)}%`}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-re-card">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  );
}

const BREAKDOWN_COLORS: Record<string, string> = {
  원가: "#94a3b8",
  수수료: "#f97316",
  배송비: "#a855f7",
  기타비용: "#eab308",
  부가세: "#64748b",
  순이익: "var(--success)",
};

export interface BreakdownSegment {
  label: string;
  amount: number;
}

/** 판매가를 100%로 두고 구성요소를 스택 바로 시각화 (음수 순이익은 별도 배지로 표시) */
export function BreakdownBar({ price, segments }: { price: number; segments: BreakdownSegment[] }) {
  const safePrice = price > 0 ? price : 1;
  const visible = segments.filter((s) => s.amount > 0);
  const negativeProfit = segments.find((s) => s.label === "순이익" && s.amount < 0);

  return (
    <div>
      <div className="flex h-6 w-full overflow-hidden rounded-lg border border-re-border">
        {visible.map((s) => (
          <div
            key={s.label}
            style={{
              width: `${Math.min(100, (s.amount / safePrice) * 100)}%`,
              background: BREAKDOWN_COLORS[s.label] ?? "var(--muted)",
            }}
            title={`${s.label} ${formatWon(s.amount)}`}
          />
        ))}
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-3">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center justify-between gap-2 text-[11px]">
            <span className="flex items-center gap-1.5 text-re-muted">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: s.amount < 0 ? "var(--danger)" : (BREAKDOWN_COLORS[s.label] ?? "var(--muted)") }}
              />
              {s.label}
            </span>
            <span className={`font-mono tabular-nums ${s.amount < 0 ? "text-re-danger" : "text-re-text"}`}>
              {formatWon(s.amount)}
            </span>
          </div>
        ))}
      </div>
      {negativeProfit && (
        <p className="mt-2 text-[11px] font-medium text-re-danger">
          ⚠ 이 구성으로는 판매할수록 손해입니다 (순이익 {formatPct((negativeProfit.amount / safePrice) * 100)})
        </p>
      )}
    </div>
  );
}
