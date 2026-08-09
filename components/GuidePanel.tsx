"use client";

import { useState } from "react";
import { GUIDE_SECTIONS } from "@/lib/content";
import { BookMarked, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";

export function GuidePanel() {
  const [openId, setOpenId] = useState(GUIDE_SECTIONS[0]?.id ?? "");
  const [topicOpen, setTopicOpen] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="glass p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-re-accent/15">
            <BookMarked className="h-5 w-5 text-re-accent" />
          </div>
          <div>
            <h2 className="text-lg font-bold">개념 · 점수 가이드</h2>
            <p className="mt-1 text-sm text-re-muted">용어 구분과 퍼센트 해석 · 낙인 금지</p>
          </div>
        </div>
      </div>

      {GUIDE_SECTIONS.map((sec) => {
        const open = openId === sec.id;
        return (
          <div key={sec.id} className="glass overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenId(open ? "" : sec.id)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <span className="text-2xl">{sec.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{sec.title}</p>
                <p className="text-xs text-re-muted">{sec.subtitle}</p>
              </div>
              {open ? <ChevronUp className="h-5 w-5 text-re-muted" /> : <ChevronDown className="h-5 w-5 text-re-muted" />}
            </button>
            {open && (
              <div className="space-y-3 border-t border-re-border px-3 pb-4 pt-3 sm:px-4">
                {sec.topics.map((t) => {
                  const tid = `${sec.id}:${t.title}`;
                  const tOpen = topicOpen === tid;
                  return (
                    <div key={tid} className="overflow-hidden rounded-xl border border-re-border bg-re-card">
                      <button
                        type="button"
                        onClick={() => setTopicOpen(tOpen ? null : tid)}
                        className="flex w-full items-start gap-2 p-4 text-left"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold">{t.title}</p>
                          <p className="mt-1 text-sm text-re-muted">{t.summary}</p>
                        </div>
                        {tOpen ? <ChevronUp className="h-4 w-4 text-re-muted" /> : <ChevronDown className="h-4 w-4 text-re-muted" />}
                      </button>
                      {tOpen && (
                        <div className="space-y-3 border-t border-re-border px-4 pb-4 pt-3">
                          <p className="text-sm leading-relaxed text-re-muted">{t.detail}</p>
                          <div className="memory-box">
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-bold text-re-accent">
                              <Lightbulb className="h-3.5 w-3.5" /> 한 줄
                            </p>
                            <p className="font-medium text-re-text">{t.memoryTip}</p>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {t.keywords.map((kw) => (
                              <span key={kw} className="rounded-md bg-re-accent/10 px-2 py-0.5 text-xs text-re-accent">
                                #{kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
