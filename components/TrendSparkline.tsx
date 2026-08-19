"use client";

import type { TraitScores } from "@/lib/types";

const LINES: { key: keyof TraitScores; label: string; color: string }[] = [
  { key: "coldPct", label: "냉정", color: "var(--accent)" },
  { key: "impulsePct", label: "충동", color: "#f97316" },
  { key: "prosocialPct", label: "적응", color: "#10b981" },
];

const W = 300;
const H = 84;
const PAD = 6;

export function TrendSparkline({ history }: { history: TraitScores[] }) {
  if (history.length < 2) return null;

  const n = history.length;
  const x = (i: number) => PAD + (i / (n - 1)) * (W - PAD * 2);
  const y = (pct: number) => H - PAD - (pct / 100) * (H - PAD * 2);

  return (
    <div className="glass p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">기질 추이</p>
        <div className="flex gap-3">
          {LINES.map((l) => (
            <span key={l.key} className="flex items-center gap-1 text-[11px] text-re-muted">
              <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" preserveAspectRatio="none">
        {[25, 50, 75].map((g) => (
          <line
            key={g}
            x1={PAD}
            x2={W - PAD}
            y1={y(g)}
            y2={y(g)}
            stroke="var(--border)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        ))}
        {LINES.map((l) => {
          const points = history.map((h, i) => `${x(i)},${y(h[l.key] as number)}`).join(" ");
          return (
            <polyline
              key={l.key}
              points={points}
              fill="none"
              stroke={l.color}
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        })}
        {LINES.map((l) => {
          const last = history[n - 1];
          return (
            <circle key={l.key} cx={x(n - 1)} cy={y(last[l.key] as number)} r={3.5} fill={l.color} />
          );
        })}
      </svg>
      <p className="mt-1 text-[11px] text-re-muted">최근 {n}회 검사 기준 · 진단 아님</p>
    </div>
  );
}
