"use client";

import { useState } from "react";
import { COPE_CARDS } from "@/lib/content";
import { loadScores } from "@/lib/storage";
import { bandLabel } from "@/lib/trait-test";
import { ChevronDown, Shield } from "lucide-react";
import { useEffect } from "react";

export function CopePanel() {
  const [openId, setOpenId] = useState(COPE_CARDS[0]?.id ?? "");
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const s = loadScores();
    if (!s) {
      setHint("테스트를 먼저 하면, 높은 축에 맞는 파훼법을 우선 추천합니다.");
      return;
    }
    const tips: string[] = [];
    if (s.impulsePct >= 65) tips.push("충동 기질이 높아요 → 「10초 멈춤」「자극 다스리기」부터");
    if (s.coldPct >= 65) tips.push("냉정 기질이 높아요 → 「관점 전환」「관계 수습」부터");
    if (s.prosocialPct < 35) tips.push("적응 자원이 낮아요 → 「규칙 카드」「도움 요청」을 꼭 보세요");
    if (tips.length === 0) {
      tips.push(
        `최근: 냉정 ${s.coldPct}%(${bandLabel(s.coldPct).label}) · 충동 ${s.impulsePct}% · 자원 ${s.prosocialPct}%`
      );
    }
    setHint(tips.join(" · "));
  }, []);

  return (
    <div className="space-y-4">
      <div className="glass p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-re-accent/15">
            <Shield className="h-5 w-5 text-re-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold">사회 적응 파훼법</h2>
            <p className="mt-1 text-sm text-re-muted">
              기질을 숨겨 남을 이용하라는 뜻이 아닙니다. 해 없이 관계·직장에 녹아드는 루틴입니다.
            </p>
            {hint && <p className="mt-2 text-xs text-re-accent">{hint}</p>}
          </div>
        </div>
      </div>

      {COPE_CARDS.map((card) => {
        const open = openId === card.id;
        return (
          <div key={card.id} className={`glass overflow-hidden ${open ? "" : "bento-hover"}`}>
            <button
              type="button"
              onClick={() => setOpenId(open ? "" : card.id)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{card.title}</p>
                <p className="mt-1 text-xs text-re-muted">{card.forWhen}</p>
              </div>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-re-muted transition-transform duration-300 ${open ? "rotate-180" : ""}`}
              />
            </button>
            {open && (
              <div className="animate-tab-in space-y-3 border-t border-re-border px-4 pb-4 pt-3">
                <ol className="list-decimal space-y-2 pl-4 text-sm leading-relaxed text-re-muted">
                  {card.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-re-muted">
                  <strong className="text-re-text">주의 · </strong>
                  {card.caution}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
