"use client";

import { useEffect, useState } from "react";
import { addCheckIn, loadCheckins } from "@/lib/storage";
import { computeStreak } from "@/lib/streak";
import type { StreakInfo } from "@/lib/types";
import { Flame, Check, X } from "lucide-react";

const DOW = ["일", "월", "화", "수", "목", "금", "토"];

export function StreakCard() {
  const [info, setInfo] = useState<StreakInfo | null>(null);

  useEffect(() => {
    setInfo(computeStreak(loadCheckins()));
  }, []);

  const mark = (success: boolean) => {
    const list = addCheckIn(success);
    setInfo(computeStreak(list));
  };

  if (!info) return null;

  return (
    <div className="glass relative overflow-hidden p-5">
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl"
        style={{ background: "var(--accent)" }}
      />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400/20 to-re-accent/20 ${
              info.current > 0 ? "animate-flame-pulse" : ""
            }`}
          >
            <Flame className={`h-6 w-6 ${info.current > 0 ? "text-orange-500" : "text-re-muted"}`} />
          </div>
          <div>
            <p className="font-mono text-2xl font-black leading-none">
              {info.current}
              <span className="ml-1 text-sm font-medium text-re-muted">일 연속</span>
            </p>
            <p className="mt-1 text-xs text-re-muted">최고 기록 {info.best}일</p>
          </div>
        </div>

        {!info.todayDone ? (
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={() => mark(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-500/40 bg-emerald-500/10 text-emerald-500 transition hover:brightness-110 active:scale-90"
              aria-label="오늘 파훼법을 썼어요"
              title="오늘 파훼법을 썼어요"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => mark(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-re-border bg-re-card text-re-muted transition hover:brightness-110 active:scale-90"
              aria-label="오늘은 어려웠어요"
              title="오늘은 어려웠어요"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <span className="chip chip-on shrink-0">오늘 기록 완료</span>
        )}
      </div>

      <div className="mt-4 flex justify-between gap-1">
        {info.last7.map((d) => {
          const dow = DOW[new Date(d.date).getDay()];
          return (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`h-7 w-7 rounded-full border transition ${
                  d.state === "success"
                    ? "border-emerald-500/60 bg-emerald-500/20"
                    : d.state === "miss"
                      ? "border-re-border bg-re-card"
                      : "border-dashed border-re-border/60"
                }`}
              />
              <span className="text-[10px] text-re-muted">{dow}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-re-muted">
        매일 파훼법을 썼는지만 가볍게 기록해요. 완벽할 필요 없이, 실패한 날도 표시가 남는 게 더 중요합니다.
      </p>
    </div>
  );
}
