"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowUpDown,
  Download,
  FileSpreadsheet,
  Printer,
  UploadCloud,
} from "lucide-react";
import {
  CSV_TEMPLATE_HEADER,
  CSV_TEMPLATE_SAMPLE_ROWS,
  calcMargin,
  formatPct,
  formatWon,
  mapHeaders,
  parseCsv,
  rowsToMarginRows,
  toCsv,
} from "@/lib/margin-calc";
import { DEFAULT_MARGIN_INPUTS, type MarginInputs, type MarginRowWithResult } from "@/lib/margin-types";
import { KpiCard } from "./MarginVisuals";

function downloadText(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type SortKey = "name" | "netMarginRate" | "netProfit" | "price";

export function BulkCalculator() {
  const [defaults, setDefaults] = useState<MarginInputs>(DEFAULT_MARGIN_INPUTS);
  const [rows, setRows] = useState<MarginRowWithResult[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("netMarginRate");
  const [sortAsc, setSortAsc] = useState(true);
  const [parseError, setParseError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setParseError("CSV 파일만 업로드할 수 있습니다 (엑셀은 '다른 이름으로 저장 → CSV UTF-8'로 변환 후 업로드).");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = String(reader.result ?? "");
          const table = parseCsv(text);
          if (table.length < 2) {
            setParseError("데이터 행이 없습니다. 헤더 + 최소 1개 상품 행이 필요합니다.");
            return;
          }
          const [header, ...dataRows] = table;
          const colMap = mapHeaders(header);
          if (colMap.price === undefined || colMap.cost === undefined) {
            setParseError("'판매가'와 '원가' 열을 찾을 수 없습니다. 템플릿을 참고해 헤더명을 맞춰주세요.");
            return;
          }
          const marginRows = rowsToMarginRows(dataRows, colMap, defaults);
          const withResults: MarginRowWithResult[] = marginRows.map((r) => ({
            ...r,
            result: r.rowError ? null : calcMargin(r),
          }));
          setRows(withResults);
          setFileName(file.name);
          setParseError(null);
        } catch {
          setParseError("CSV 파싱 중 오류가 발생했습니다. 파일 형식을 확인해주세요.");
        }
      };
      reader.readAsText(file, "utf-8");
    },
    [defaults],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const validRows = rows.filter((r) => r.result);
  const summary = useMemo(() => {
    if (validRows.length === 0) return null;
    const totalProfit = validRows.reduce((s, r) => s + (r.result?.netProfit ?? 0), 0);
    const avgMargin = validRows.reduce((s, r) => s + (r.result?.netMarginRate ?? 0), 0) / validRows.length;
    const lossCount = validRows.filter((r) => (r.result?.netProfit ?? 0) < 0).length;
    return { totalProfit, avgMargin, lossCount, count: validRows.length };
  }, [validRows]);

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      let av: number | string = 0;
      let bv: number | string = 0;
      if (sortKey === "name") {
        av = a.name;
        bv = b.name;
      } else if (sortKey === "price") {
        av = a.price;
        bv = b.price;
      } else {
        av = a.result?.[sortKey] ?? -Infinity;
        bv = b.result?.[sortKey] ?? -Infinity;
      }
      if (typeof av === "string" || typeof bv === "string") {
        return sortAsc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      }
      return sortAsc ? av - bv : bv - av;
    });
    return copy;
  }, [rows, sortKey, sortAsc]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((a) => !a);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  const exportCsv = () => {
    const header = [
      "상품명",
      "판매가",
      "원가",
      "수수료율(%)",
      "배송비",
      "기타비용",
      "부가세율(%)",
      "부가세",
      "플랫폼수수료",
      "순이익",
      "순이익률(%)",
      "손익분기가",
      "목표달성필요가",
      "오류",
    ];
    const dataRows = rows.map((r) => [
      r.name,
      r.price,
      r.cost,
      r.platformFeeRate,
      r.shippingCost,
      r.etcCost,
      r.vatRate,
      r.result?.vatPayable ?? "",
      r.result?.platformFee ?? "",
      r.result?.netProfit ?? "",
      r.result?.netMarginRate ?? "",
      r.result && Number.isFinite(r.result.breakEvenPrice) ? r.result.breakEvenPrice : "",
      r.result?.requiredPriceForTarget ?? "",
      r.rowError ?? "",
    ]);
    downloadText(`마진계산결과_${new Date().toISOString().slice(0, 10)}.csv`, toCsv(header, dataRows));
  };

  const downloadTemplate = () => {
    downloadText("마진계산기_템플릿.csv", toCsv(CSV_TEMPLATE_HEADER, CSV_TEMPLATE_SAMPLE_ROWS));
  };

  const printReport = () => window.print();

  return (
    <div className="space-y-4">
      <div className="glass p-4 sm:p-5">
        <p className="mb-3 text-sm font-semibold">공통 기본값 (CSV에 열이 없을 때 사용)</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(
            [
              ["platformFeeRate", "수수료율(%)"],
              ["shippingCost", "배송비(원)"],
              ["etcCost", "기타비용(원)"],
              ["vatRate", "부가세율(%)"],
              ["targetMarginRate", "목표순이익률(%)"],
            ] as [keyof MarginInputs, string][]
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-[11px] text-re-muted">{label}</span>
              <input
                type="number"
                className="w-full rounded-lg border border-re-border bg-re-card px-2 py-1.5 text-sm font-semibold tabular-nums outline-none focus:border-re-accent"
                value={defaults[key]}
                onChange={(e) =>
                  setDefaults((d) => ({ ...d, [key]: e.target.value === "" ? 0 : Number(e.target.value) }))
                }
              />
            </label>
          ))}
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`glass flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed p-8 text-center transition ${
          dragOver ? "border-re-accent bg-re-accent/5" : "border-re-border"
        }`}
      >
        <UploadCloud className="h-8 w-8 text-re-accent" />
        <p className="text-sm font-semibold">CSV 파일을 끌어다 놓거나 클릭해서 업로드</p>
        <p className="text-xs text-re-muted">헤더: 상품명, 판매가, 원가, 수수료율(%), 배송비, 기타비용, 부가세율(%), 목표순이익률(%)</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            downloadTemplate();
          }}
          className="btn-ghost mt-2 text-xs"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" /> 템플릿 CSV 다운로드
        </button>
      </div>

      {parseError && (
        <div className="glass flex items-center gap-2 p-4 text-sm text-re-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {parseError}
        </div>
      )}

      {rows.length > 0 && (
        <>
          {summary && (
            <div className="grid gap-3 sm:grid-cols-4">
              <KpiCard label="계산된 상품 수" value={`${summary.count}개`} />
              <KpiCard label="평균 순이익률" value={formatPct(summary.avgMargin)} tone={summary.avgMargin >= 0 ? "good" : "bad"} />
              <KpiCard label="적자 상품 수" value={`${summary.lossCount}개`} tone={summary.lossCount > 0 ? "bad" : "good"} />
              <KpiCard label="총 순이익 합계" value={formatWon(summary.totalProfit)} tone={summary.totalProfit >= 0 ? "good" : "bad"} />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-re-muted">{fileName} · {rows.length}행 로드됨</p>
            <div className="flex gap-2">
              <button type="button" onClick={exportCsv} className="btn-ghost text-xs">
                <Download className="h-3.5 w-3.5" /> 결과 CSV 다운로드
              </button>
              <button type="button" onClick={printReport} className="btn-primary text-xs">
                <Printer className="h-3.5 w-3.5" /> 인쇄 · PDF로 저장
              </button>
            </div>
          </div>

          <div className="print-area glass overflow-x-auto p-2">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-re-border text-left text-xs text-re-muted">
                  {(
                    [
                      ["name", "상품명"],
                      ["price", "판매가"],
                      ["netProfit", "순이익"],
                      ["netMarginRate", "순이익률"],
                    ] as [SortKey, string][]
                  ).map(([key, label]) => (
                    <th key={key} className="cursor-pointer select-none px-3 py-2" onClick={() => toggleSort(key)}>
                      <span className="inline-flex items-center gap-1">
                        {label} <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </th>
                  ))}
                  <th className="px-3 py-2">손익분기가</th>
                  <th className="px-3 py-2">목표 달성 필요가</th>
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((r) => (
                  <tr key={r.id} className="border-b border-re-border/60 last:border-0">
                    {r.rowError ? (
                      <td colSpan={6} className="px-3 py-2 text-re-danger">
                        <AlertCircle className="mr-1 inline h-3.5 w-3.5" />
                        {r.name}: {r.rowError}
                      </td>
                    ) : (
                      <>
                        <td className="px-3 py-2 font-medium">{r.name}</td>
                        <td className="px-3 py-2 font-mono tabular-nums">{formatWon(r.price)}</td>
                        <td className={`px-3 py-2 font-mono tabular-nums ${(r.result?.netProfit ?? 0) < 0 ? "text-re-danger" : "text-re-success"}`}>
                          {formatWon(r.result?.netProfit ?? 0)}
                        </td>
                        <td className={`px-3 py-2 font-mono tabular-nums ${(r.result?.netMarginRate ?? 0) < 0 ? "text-re-danger" : ""}`}>
                          {formatPct(r.result?.netMarginRate ?? 0)}
                        </td>
                        <td className="px-3 py-2 font-mono tabular-nums text-re-muted">
                          {r.result && Number.isFinite(r.result.breakEvenPrice) ? formatWon(r.result.breakEvenPrice) : "—"}
                        </td>
                        <td className="px-3 py-2 font-mono tabular-nums text-re-muted">
                          {r.result?.requiredPriceForTarget != null ? formatWon(r.result.requiredPriceForTarget) : "불가"}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
