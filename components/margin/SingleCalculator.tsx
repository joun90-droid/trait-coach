"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, ArrowDownRight, PiggyBank, Target, TrendingUp } from "lucide-react";
import { calcMargin, formatPct, formatWon } from "@/lib/margin-calc";
import { DEFAULT_MARGIN_INPUTS, type MarginInputs } from "@/lib/margin-types";
import { BreakdownBar, KpiCard, MarginProgressBar } from "./MarginVisuals";

function NumberField({
  label,
  value,
  onChange,
  suffix,
  min = 0,
  step = 1,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  suffix: string;
  min?: number;
  step?: number;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-re-muted">{label}</span>
      <div className="flex items-center overflow-hidden rounded-xl border border-re-border bg-re-card focus-within:border-re-accent">
        <input
          type="number"
          inputMode="decimal"
          className="w-full bg-transparent px-3 py-2.5 text-sm font-semibold tabular-nums outline-none"
          value={Number.isFinite(value) ? value : 0}
          min={min}
          step={step}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        />
        <span className="shrink-0 px-3 text-xs text-re-muted">{suffix}</span>
      </div>
      {hint && <span className="mt-1 block text-[11px] text-re-muted">{hint}</span>}
    </label>
  );
}

export function SingleCalculator() {
  const [inputs, setInputs] = useState<MarginInputs>(DEFAULT_MARGIN_INPUTS);
  const [vatEnabled, setVatEnabled] = useState(true);

  const set = <K extends keyof MarginInputs>(key: K, v: number) =>
    setInputs((prev) => ({ ...prev, [key]: v }));

  const result = useMemo(() => calcMargin({ ...inputs, vatRate: vatEnabled ? inputs.vatRate : 0 }), [inputs, vatEnabled]);

  const hasPrice = inputs.price > 0;

  const segments = [
    { label: "원가", amount: inputs.cost },
    { label: "수수료", amount: result.platformFee },
    { label: "배송비", amount: inputs.shippingCost },
    { label: "기타비용", amount: inputs.etcCost },
    { label: "부가세", amount: result.vatPayable },
    { label: "순이익", amount: result.netProfit },
  ];

  return (
    <div className="space-y-4">
      <div className="glass p-4 sm:p-5">
        <p className="mb-3 text-sm font-semibold">상품 정보 입력</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="판매가 (부가세 포함)" value={inputs.price} onChange={(v) => set("price", v)} suffix="원" step={100} />
          <NumberField label="원가 (부가세 포함 매입가)" value={inputs.cost} onChange={(v) => set("cost", v)} suffix="원" step={100} />
          <NumberField label="플랫폼 수수료율" value={inputs.platformFeeRate} onChange={(v) => set("platformFeeRate", v)} suffix="%" step={0.1} />
          <NumberField label="건당 배송비" value={inputs.shippingCost} onChange={(v) => set("shippingCost", v)} suffix="원" step={100} />
          <NumberField label="포장 · 기타 부대비용" value={inputs.etcCost} onChange={(v) => set("etcCost", v)} suffix="원" step={100} />
          <NumberField label="목표 순이익률" value={inputs.targetMarginRate} onChange={(v) => set("targetMarginRate", v)} suffix="%" step={0.5} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-xl bg-re-card p-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={vatEnabled}
              onChange={(e) => setVatEnabled(e.target.checked)}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            부가세 계산 포함
          </label>
          {vatEnabled && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-re-muted">부가세율</span>
              <input
                type="number"
                className="w-16 rounded-lg border border-re-border bg-re-panel px-2 py-1 text-sm font-semibold tabular-nums outline-none focus:border-re-accent"
                value={inputs.vatRate}
                step={0.5}
                onChange={(e) => set("vatRate", e.target.value === "" ? 0 : Number(e.target.value))}
              />
              <span className="text-xs text-re-muted">%</span>
            </div>
          )}
          <span className="text-[11px] text-re-muted">
            (매출세액-매입세액 방식: (판매가-원가) × 세율/(1+세율))
          </span>
        </div>
      </div>

      {!hasPrice ? (
        <div className="glass flex items-center gap-2 p-4 text-sm text-re-muted">
          <AlertTriangle className="h-4 w-4 shrink-0 text-re-gold" />
          판매가를 입력하면 즉시 계산됩니다.
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2">
            <KpiCard
              label="순이익"
              value={formatWon(result.netProfit)}
              tone={result.isHealthy ? "good" : "bad"}
              icon={<PiggyBank className="h-3.5 w-3.5" />}
            />
            <KpiCard
              label="순이익률"
              value={formatPct(result.netMarginRate)}
              sub={result.targetAchieved ? "목표 달성" : "목표 미달"}
              tone={!result.isHealthy ? "bad" : result.targetAchieved ? "good" : "warn"}
              icon={<TrendingUp className="h-3.5 w-3.5" />}
            />
            <KpiCard
              label="손익분기 판매가"
              value={Number.isFinite(result.breakEvenPrice) ? formatWon(result.breakEvenPrice) : "산출 불가"}
              sub="이 가격 이하면 손해"
              icon={<ArrowDownRight className="h-3.5 w-3.5" />}
            />
            <KpiCard
              label={`목표(${formatPct(inputs.targetMarginRate)}) 달성 필요가`}
              value={result.requiredPriceForTarget !== null ? formatWon(result.requiredPriceForTarget) : "구조상 불가"}
              sub={result.requiredPriceForTarget !== null ? undefined : "수수료+부가세+목표마진 합이 100% 이상"}
              tone={result.requiredPriceForTarget !== null ? "neutral" : "warn"}
              icon={<Target className="h-3.5 w-3.5" />}
            />
          </div>

          <div className="glass p-4 sm:p-5">
            <MarginProgressBar currentPct={result.netMarginRate} targetPct={inputs.targetMarginRate} />
          </div>

          <div className="glass p-4 sm:p-5">
            <p className="mb-3 text-sm font-semibold">판매가 구성 분해 (100% = {formatWon(inputs.price)})</p>
            <BreakdownBar price={inputs.price} segments={segments} />
          </div>
        </>
      )}
    </div>
  );
}
