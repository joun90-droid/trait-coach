"use client";

import { useEffect, useMemo, useState } from "react";
import type { TabId } from "@/lib/types";
import { DISCLAIMER } from "@/lib/types";
import { loadHistory, loadScores } from "@/lib/storage";
import type { TraitScores } from "@/lib/types";
import { bandLabel } from "@/lib/trait-test";
import { ThemeToggle } from "./ThemeToggle";
import { TraitTestPanel } from "./TraitTestPanel";
import { CopePanel } from "./CopePanel";
import { GuidePanel } from "./GuidePanel";
import { StreakCard } from "./StreakCard";
import { TrendSparkline } from "./TrendSparkline";
import { BookOpen, Home, Shield, ClipboardList, Sparkles } from "lucide-react";

const TABS: { id: TabId; label: string; icon: typeof Home }[] = [
  { id: "home", label: "홈", icon: Home },
  { id: "test", label: "성향 테스트", icon: ClipboardList },
  { id: "cope", label: "파훼법", icon: Shield },
  { id: "guide", label: "가이드", icon: BookOpen },
];

export function Dashboard() {
  const [tab, setTab] = useState<TabId>("home");
  const [scores, setScores] = useState<TraitScores | null>(null);
  const [history, setHistory] = useState<TraitScores[]>([]);

  useEffect(() => {
    setScores(loadScores());
    setHistory(loadHistory());
  }, [tab]);

  const summary = useMemo(() => {
    if (!scores) return null;
    return [
      { key: "냉정 기질", pct: scores.coldPct },
      { key: "충동 기질", pct: scores.impulsePct },
      { key: "적응 자원", pct: scores.prosocialPct },
    ];
  }, [scores]);

  return (
    <div className="relative z-10 mx-auto min-h-dvh max-w-3xl px-4 pb-28 pt-6 sm:px-6">
      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-re-accent">
            <Sparkles className="h-3.5 w-3.5" /> 영재의 · Maker
          </p>
          <h1 className="gradient-text mt-1 text-2xl font-bold sm:text-3xl">영재의 성향 코치</h1>
          <p className="mt-1 text-sm text-re-muted">사이코·소시오 자기점검 % · 사회 적응 파훼법</p>
        </div>
        <ThemeToggle />
      </header>

      <div key={tab} className="animate-tab-in">
        {tab === "home" && (
          <div className="space-y-4">
            <div className="glass bento-hover overflow-hidden p-6 text-center">
              <p className="text-sm text-re-muted">무엇을 하나요</p>
              <p className="mt-2 text-xl font-bold sm:text-2xl">기질 %를 보고, 해 없이 사회에 적응하기</p>
              <p className="mt-3 text-sm text-re-muted">
                냉정·충동 자기보고와 조절 자원을 퍼센트로 보여 주고, 멈춤·공감 연습·규칙·수습 루틴을 안내합니다.
              </p>
            </div>

            <StreakCard />

            <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm leading-relaxed">
              <p className="font-bold text-re-text">{DISCLAIMER.title}</p>
              <ul className="mt-2 space-y-1.5 text-re-muted">
                {DISCLAIMER.lines.map((line) => (
                  <li key={line}>· {line}</li>
                ))}
              </ul>
            </div>

            {summary ? (
              <div className="glass bento-hover p-4">
                <p className="mb-3 text-sm font-semibold">최근 결과</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {summary.map((s) => {
                    const b = bandLabel(s.pct);
                    return (
                      <div key={s.key} className="rounded-xl bg-re-card p-3 text-center">
                        <p className="text-xs text-re-muted">{s.key}</p>
                        <p className="mt-1 font-mono text-2xl font-black text-re-accent">{s.pct}%</p>
                        <p className="mt-1 text-xs text-re-muted">{b.label}</p>
                      </div>
                    );
                  })}
                </div>
                <button type="button" className="btn-primary mt-4 w-full" onClick={() => setTab("cope")}>
                  파훼법으로 이동
                </button>
              </div>
            ) : (
              <button type="button" className="btn-primary w-full" onClick={() => setTab("test")}>
                성향 테스트 시작
              </button>
            )}

            {history.length >= 2 && <TrendSparkline history={history} />}

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["진단 아님", "자기보고 %"],
                ["목표", "해 없는 적응"],
                ["금지", "조종·낙인"],
              ].map(([k, v]) => (
                <div key={k} className="glass bento-hover p-4 text-center">
                  <p className="text-xs text-re-muted">{k}</p>
                  <p className="mt-1 text-sm font-semibold">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "test" && <TraitTestPanel onFinished={() => setTab("cope")} />}
        {tab === "cope" && <CopePanel />}
        {tab === "guide" && <GuidePanel />}

        {(tab === "test" || tab === "cope" || tab === "guide") && (
          <p className="mt-6 text-center text-[11px] leading-relaxed text-re-muted">
            학습·자기점검용 · 임상 진단 아님 · 112 / 119 / 1577-0199 / 109
          </p>
        )}
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-re-border bg-re-panel/95 backdrop-blur-lg">
        <div className="mx-auto flex max-w-3xl">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition sm:text-xs ${
                  active ? "text-re-accent" : "text-re-muted"
                }`}
              >
                <span
                  className={`flex h-7 w-10 items-center justify-center rounded-full transition ${
                    active ? "bg-re-accent/15" : ""
                  }`}
                >
                  <Icon className={`h-5 w-5 transition-transform ${active ? "scale-110" : ""}`} />
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
