"use client";

import { useEffect, useMemo, useState } from "react";
import { LIKERT } from "@/lib/types";
import { TRAIT_ITEMS, TOTAL_ITEMS, bandLabel, computeScores, interpret } from "@/lib/trait-test";
import { clearTest, loadAnswers, loadScores, saveAnswers, saveScores } from "@/lib/storage";
import type { TraitScores } from "@/lib/types";
import { Check, RotateCcw } from "lucide-react";

export function TraitTestPanel({ onFinished }: { onFinished?: () => void }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState<TraitScores | null>(null);

  useEffect(() => {
    const a = loadAnswers();
    setAnswers(a);
    const s = loadScores();
    setScores(s);
    const firstBlank = TRAIT_ITEMS.findIndex((q) => a[q.id] === undefined);
    if (firstBlank >= 0) setIdx(firstBlank);
  }, []);

  const doneCount = useMemo(
    () => TRAIT_ITEMS.filter((q) => answers[q.id] !== undefined).length,
    [answers]
  );
  const allDone = doneCount === TOTAL_ITEMS;
  const q = TRAIT_ITEMS[idx];

  const pick = (value: number) => {
    if (!q) return;
    const next = { ...answers, [q.id]: value };
    setAnswers(next);
    saveAnswers(next);
    if (idx < TRAIT_ITEMS.length - 1) {
      setIdx(idx + 1);
    }
  };

  const finish = () => {
    if (!allDone) return;
    const s = computeScores(answers);
    saveScores(s);
    setScores(s);
  };

  const reset = () => {
    clearTest();
    setAnswers({});
    setScores(null);
    setIdx(0);
  };

  if (scores && allDone) {
    const rows = [
      { label: "냉정·공감 둔감 기질", pct: scores.coldPct, hint: "사이코패스 논의와 자주 겹치는 자기보고 축(진단 아님)" },
      { label: "충동·규칙 이탈 기질", pct: scores.impulsePct, hint: "소시오패스 일상어 서사와 자주 겹치는 자기보고 축(진단 아님)" },
      { label: "사회 적응·조절 자원", pct: scores.prosocialPct, hint: "높을수록 파훼법에 쓸 ‘근육’이 있는 편" },
    ];
    return (
      <div className="space-y-4">
        <div className="glass p-5 text-center">
          <p className="text-sm text-re-muted">결과 (자기보고 퍼센트)</p>
          <p className="mt-2 text-lg font-bold">기질이 얼마나 있는지 — 교육용 점수</p>
          <p className="mt-2 text-xs text-re-muted">사이코/소시오/ASPD 확정 진단이 아닙니다.</p>
        </div>

        {rows.map((r) => {
          const b = bandLabel(r.pct);
          return (
            <div key={r.label} className="glass p-4">
              <div className="flex items-end justify-between gap-2">
                <div>
                  <p className="font-semibold">{r.label}</p>
                  <p className="mt-1 text-xs text-re-muted">{r.hint}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-3xl font-black text-re-accent">{r.pct}%</p>
                  <p className="text-xs text-re-muted">{b.label}</p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-re-border">
                <div className="h-full rounded-full bg-re-accent transition-all" style={{ width: `${r.pct}%` }} />
              </div>
            </div>
          );
        })}

        <div className="glass p-4 text-sm leading-relaxed text-re-muted">
          <p className="font-semibold text-re-text">해석</p>
          <p className="mt-2">{interpret(scores)}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary flex-1" onClick={() => onFinished?.()}>
            파훼법 보기
          </button>
          <button type="button" className="btn-ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            다시 검사
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="glass p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">성향 테스트</h2>
          <span className="font-mono text-sm text-re-muted">
            {doneCount}/{TOTAL_ITEMS}
          </span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-re-border">
          <div
            className="h-full rounded-full bg-re-accent transition-all"
            style={{ width: `${Math.round((doneCount / TOTAL_ITEMS) * 100)}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-re-muted">최근 6개월 기준 · 솔직하게 · 타인 낙인용 아님</p>
      </div>

      {q && (
        <div className="glass p-5 sm:p-6">
          <p className="text-xs text-re-accent">
            {idx + 1} / {TOTAL_ITEMS}
          </p>
          <p className="mt-3 text-base font-medium leading-[1.7] sm:text-lg">{q.text}</p>

          <div className="mt-6 grid gap-2">
            {LIKERT.map((o) => {
              const on = answers[q.id] === o.value;
              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => pick(o.value)}
                  className={`flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition ${
                    on
                      ? "border-re-accent bg-re-accent/10 text-re-accent"
                      : "border-re-border hover:border-re-accent/50"
                  }`}
                >
                  <span>{o.label}</span>
                  {on && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              className="btn-ghost flex-1"
              disabled={idx === 0}
              onClick={() => setIdx((i) => Math.max(0, i - 1))}
            >
              이전
            </button>
            <button
              type="button"
              className="btn-ghost flex-1"
              disabled={idx >= TRAIT_ITEMS.length - 1}
              onClick={() => setIdx((i) => Math.min(TRAIT_ITEMS.length - 1, i + 1))}
            >
              다음
            </button>
          </div>
        </div>
      )}

      {allDone && (
        <button type="button" className="btn-primary w-full" onClick={finish}>
          결과 보기 (%)
        </button>
      )}
    </div>
  );
}
