"use client";

import { useState } from "react";
import Link from "next/link";
import { Calculator, ChevronLeft, FileSpreadsheet, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SingleCalculator } from "./SingleCalculator";
import { BulkCalculator } from "./BulkCalculator";

type Mode = "single" | "bulk";

export function MarginTool() {
  const [mode, setMode] = useState<Mode>("single");

  return (
    <div className="relative z-10 mx-auto min-h-dvh max-w-3xl px-4 pb-16 pt-6 sm:px-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

      <header className="mb-6 flex items-start justify-between gap-3">
        <div>
          <Link href="/" className="mb-1 flex items-center gap-1 text-xs font-semibold text-re-muted hover:text-re-accent">
            <ChevronLeft className="h-3.5 w-3.5" /> 홈으로
          </Link>
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-re-accent">
            <Sparkles className="h-3.5 w-3.5" /> Zero-API Tools
          </p>
          <h1 className="gradient-text mt-1 text-2xl font-bold sm:text-3xl">이커머스 마진 역산 계산기</h1>
          <p className="mt-1 text-sm text-re-muted">판매가 · 수수료 · 배송비 · 부가세를 반영해 즉시 순이익을 역산합니다</p>
        </div>
        <ThemeToggle />
      </header>

      <div className="mb-4 flex gap-2 rounded-2xl border border-re-border bg-re-panel p-1.5">
        {(
          [
            ["single", "단일 상품 계산", Calculator],
            ["bulk", "CSV 일괄 계산", FileSpreadsheet],
          ] as [Mode, string, typeof Calculator][]
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition ${
              mode === id ? "bg-re-accent text-white shadow-sm" : "text-re-muted hover:text-re-text"
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </div>

      <div key={mode} className="animate-tab-in">
        {mode === "single" ? <SingleCalculator /> : <BulkCalculator />}
      </div>

      <p className="mt-8 text-center text-[11px] leading-relaxed text-re-muted">
        모든 계산은 브라우저 안에서 즉시 처리되며 외부 서버로 데이터가 전송되지 않습니다 · 세무 신고용 정식 자료가 아닌 참고용 계산입니다
      </p>
    </div>
  );
}
