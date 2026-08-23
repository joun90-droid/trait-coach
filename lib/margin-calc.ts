/**
 * 이커머스 마진 역산 계산 엔진 — 100% 순수 함수, 외부 API 호출 없음.
 *
 * 부가세는 "매출세액 - 매입세액" 방식으로 계산합니다.
 * 판매가·원가가 모두 부가세 포함가라고 가정하면:
 *   공급가액 = 금액 / (1 + 세율)
 *   세액 = 금액 - 공급가액 = 금액 * 세율/(1+세율)
 *   납부세액 = (판매가-원가) * 세율/(1+세율)
 */
import type { MarginInputs, MarginResult, MarginRow } from "./margin-types";

export const round2 = (n: number) => Math.round(n * 100) / 100;

/** 부가세율(%) → (판매가-원가)에 곱해 납부세액을 구하는 계수 */
function vatCoefficient(vatRatePct: number): number {
  if (!Number.isFinite(vatRatePct) || vatRatePct <= 0) return 0;
  const r = vatRatePct / 100;
  return r / (1 + r);
}

export function calcMargin(input: MarginInputs): MarginResult {
  const price = safeNum(input.price);
  const cost = safeNum(input.cost);
  const feeRate = safeNum(input.platformFeeRate) / 100;
  const shipping = safeNum(input.shippingCost);
  const etc = safeNum(input.etcCost);
  const v = vatCoefficient(safeNum(input.vatRate));
  const m = safeNum(input.targetMarginRate) / 100;

  const vatPayable = round2((price - cost) * v);
  const platformFee = round2(price * feeRate);
  const totalDeductions = round2(cost + platformFee + shipping + etc + vatPayable);
  const netProfit = round2(price - totalDeductions);
  const netMarginRate = price > 0 ? round2((netProfit / price) * 100) : 0;

  // 손익분기 판매가: netProfit(price) = 0 을 price에 대해 풀면
  // price * (1 - feeRate - v) = cost*(1-v) + shipping + etc
  const breakEvenDenom = 1 - feeRate - v;
  const breakEvenPrice =
    breakEvenDenom > 0 ? round2((cost * (1 - v) + shipping + etc) / breakEvenDenom) : NaN;

  // 목표 순이익률 달성 필요 판매가: netProfit = price*m 을 동일하게 풀면
  const targetDenom = 1 - feeRate - v - m;
  const requiredPriceForTarget =
    targetDenom > 0 ? round2((cost * (1 - v) + shipping + etc) / targetDenom) : null;

  return {
    vatPayable,
    platformFee,
    totalDeductions,
    netProfit,
    netMarginRate,
    breakEvenPrice,
    requiredPriceForTarget,
    isHealthy: netMarginRate >= 0,
    targetAchieved: netMarginRate >= safeNum(input.targetMarginRate),
  };
}

function safeNum(n: number): number {
  return Number.isFinite(n) ? n : 0;
}

export function formatWon(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `₩${Math.round(n).toLocaleString("ko-KR")}`;
}

export function formatPct(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return `${n.toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// CSV 파싱/생성 (RFC4180 간이 구현, 외부 라이브러리 없음)
// ---------------------------------------------------------------------------

export function parseCsv(text: string): string[][] {
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c === "\r") {
      // skip, \n(또는 \r\n의 \n)에서 줄을 닫음
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ""));
}

function csvEscape(v: string | number): string {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCsv(header: string[], rows: (string | number)[][]): string {
  const lines = [header.map(csvEscape).join(",")];
  for (const r of rows) lines.push(r.map(csvEscape).join(","));
  return "﻿" + lines.join("\r\n");
}

// ---------------------------------------------------------------------------
// 헤더 매핑 (한글/영문 별칭을 자동 인식)
// ---------------------------------------------------------------------------

type MarginKey = keyof MarginInputs | "name";

const HEADER_ALIASES: Record<MarginKey, string[]> = {
  name: ["상품명", "제품명", "품명", "name", "product"],
  price: ["판매가", "판매가격", "가격", "price"],
  cost: ["원가", "매입가", "원가매입가", "cost"],
  platformFeeRate: ["수수료율", "플랫폼수수료율", "수수료", "platformfeerate", "fee"],
  shippingCost: ["배송비", "배송비용", "shipping", "shippingcost"],
  etcCost: ["기타비용", "포장비", "기타", "etc", "etccost"],
  vatRate: ["부가세율", "부가세", "vat", "vatrate"],
  targetMarginRate: ["목표순이익률", "목표마진율", "목표수익률", "target", "targetmarginrate"],
};

function normalizeHeader(h: string): string {
  return h.trim().toLowerCase().replace(/[\s()%]/g, "");
}

export function mapHeaders(headerRow: string[]): Partial<Record<MarginKey, number>> {
  const map: Partial<Record<MarginKey, number>> = {};
  headerRow.forEach((raw, idx) => {
    const norm = normalizeHeader(raw);
    (Object.keys(HEADER_ALIASES) as MarginKey[]).forEach((key) => {
      if (map[key] !== undefined) return;
      if (HEADER_ALIASES[key].some((alias) => normalizeHeader(alias) === norm)) {
        map[key] = idx;
      }
    });
  });
  return map;
}

function toNumber(v: string | undefined): number | undefined {
  if (v === undefined) return undefined;
  const cleaned = v.replace(/[,₩%원\s]/g, "").trim();
  if (cleaned === "") return undefined;
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

/** CSV 데이터 행들을 MarginRow[]로 변환. 열이 없으면 defaults 값을 사용. */
export function rowsToMarginRows(
  dataRows: string[][],
  colMap: Partial<Record<MarginKey, number>>,
  defaults: MarginInputs,
): MarginRow[] {
  return dataRows.map((cells, i) => {
    const get = (key: MarginKey) => {
      const idx = colMap[key];
      return idx !== undefined ? cells[idx] : undefined;
    };

    const name = get("name")?.trim() || `상품 ${i + 1}`;
    const price = toNumber(get("price"));
    const cost = toNumber(get("cost"));
    const platformFeeRate = toNumber(get("platformFeeRate")) ?? defaults.platformFeeRate;
    const shippingCost = toNumber(get("shippingCost")) ?? defaults.shippingCost;
    const etcCost = toNumber(get("etcCost")) ?? defaults.etcCost;
    const vatRate = toNumber(get("vatRate")) ?? defaults.vatRate;
    const targetMarginRate = toNumber(get("targetMarginRate")) ?? defaults.targetMarginRate;

    let rowError: string | undefined;
    if (price === undefined || price <= 0) rowError = "판매가가 없거나 0 이하입니다";
    else if (cost === undefined || cost < 0) rowError = "원가가 없거나 음수입니다";

    return {
      id: `row-${i}-${Date.now()}`,
      name,
      price: price ?? 0,
      cost: cost ?? 0,
      platformFeeRate,
      shippingCost,
      etcCost,
      vatRate,
      targetMarginRate,
      rowError,
    };
  });
}

export const CSV_TEMPLATE_HEADER = [
  "상품명",
  "판매가",
  "원가",
  "수수료율(%)",
  "배송비",
  "기타비용",
  "부가세율(%)",
  "목표순이익률(%)",
];

export const CSV_TEMPLATE_SAMPLE_ROWS: (string | number)[][] = [
  ["샘플 상품 A", 25000, 12000, 10, 3000, 500, 10, 15],
  ["샘플 상품 B", 15900, 9000, 13, 0, 0, 10, 12],
];
