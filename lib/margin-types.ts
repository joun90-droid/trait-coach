/** 이커머스 마진 계산기 — 순수 로직 타입 (외부 API 호출 없음) */

export interface MarginInputs {
  /** 판매가 (부가세 포함, 원) */
  price: number;
  /** 원가 (부가세 포함 매입가, 원) */
  cost: number;
  /** 플랫폼 판매 수수료율 (%) */
  platformFeeRate: number;
  /** 건당 배송비 (원) */
  shippingCost: number;
  /** 포장·기타 부대비용 (원) */
  etcCost: number;
  /** 부가세율 (%). 0이면 부가세 계산 제외(면세·간이과세 등) */
  vatRate: number;
  /** 목표 순이익률 (%) — 필요 판매가 역산용 */
  targetMarginRate: number;
}

export const DEFAULT_MARGIN_INPUTS: MarginInputs = {
  price: 0,
  cost: 0,
  platformFeeRate: 10,
  shippingCost: 3000,
  etcCost: 0,
  vatRate: 10,
  targetMarginRate: 15,
};

export interface MarginResult {
  /** 매출세액-매입세액 방식으로 역산한 납부 부가세 (원) */
  vatPayable: number;
  /** 플랫폼 수수료 (원) */
  platformFee: number;
  /** 원가+수수료+배송비+기타비용+부가세 합계 (원) */
  totalDeductions: number;
  /** 순이익 (원) */
  netProfit: number;
  /** 순이익률 (%) */
  netMarginRate: number;
  /** 순이익이 0이 되는 손익분기 판매가. 구조상 불가능하면 NaN */
  breakEvenPrice: number;
  /** 목표 순이익률 달성에 필요한 최소 판매가. 구조상 불가능하면 null */
  requiredPriceForTarget: number | null;
  /** 순이익률 >= 0 */
  isHealthy: boolean;
  /** 순이익률 >= 목표 순이익률 */
  targetAchieved: boolean;
}

export interface MarginRow extends MarginInputs {
  id: string;
  name: string;
  /** 파싱/검증 단계에서 발생한 오류 메시지. 있으면 계산에서 제외 */
  rowError?: string;
}

export interface MarginRowWithResult extends MarginRow {
  result: MarginResult | null;
}
