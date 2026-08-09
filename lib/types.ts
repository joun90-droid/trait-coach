export type TabId = "home" | "test" | "cope" | "guide";

/** 자기보고 성향 축 (진단명 아님) */
export type TraitAxis = "cold" | "impulse" | "prosocial";

export interface TraitItem {
  id: string;
  axis: TraitAxis;
  text: string;
  /** true면 점수 반전 (높을수록 건강) */
  reverse?: boolean;
}

export interface TraitScores {
  coldPct: number;
  impulsePct: number;
  prosocialPct: number;
  coldRaw: number;
  impulseRaw: number;
  prosocialRaw: number;
  answeredAt: string;
}

export interface CopeCard {
  id: string;
  title: string;
  forWhen: string;
  steps: string[];
  caution: string;
}

export interface GuideTopic {
  title: string;
  summary: string;
  detail: string;
  memoryTip: string;
  keywords: string[];
}

export interface GuideSection {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  topics: GuideTopic[];
}

export const AXIS_LABELS: Record<TraitAxis, string> = {
  cold: "냉정·공감 둔감 기질",
  impulse: "충동·규칙 이탈 기질",
  prosocial: "사회 적응·조절 자원",
};

export const LIKERT = [
  { value: 0, label: "전혀 아님" },
  { value: 1, label: "거의 아님" },
  { value: 2, label: "가끔" },
  { value: 3, label: "자주" },
  { value: 4, label: "매우 그렇다" },
] as const;

export const DISCLAIMER = {
  title: "이 검사는 진단이 아닙니다",
  lines: [
    "점수는 자기보고 성향 퍼센트일 뿐, 사이코패스·소시오패스·ASPD 확정이 아닙니다.",
    "사이코패스는 DSM 공식 진단명이 아니고, 소시오패스는 일상·대중 용어에 가깝습니다.",
    "PCL-R 등 임상 도구는 전문가가 사용합니다. 온라인 테스트로 타인·자신을 낙인하지 마세요.",
    "위험·학대: 112 · 응급: 119 · 정신건강: 1577-0199 · 자살예방: 109",
  ],
};
