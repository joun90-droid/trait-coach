import type { Metadata } from "next";
import { MarginTool } from "@/components/margin/MarginTool";

export const metadata: Metadata = {
  title: "이커머스 마진 역산 계산기 | 영재의 성향 코치",
  description:
    "판매가 대비 플랫폼 수수료·배송비·부가세·원가를 반영해 순이익률을 즉시 역산하고, CSV 업로드로 여러 상품을 한번에 계산합니다. 외부 API 호출 없이 브라우저에서만 동작합니다.",
};

export default function MarginCalculatorPage() {
  return <MarginTool />;
}
