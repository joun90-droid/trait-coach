import type { TraitItem, TraitScores, TraitAxis } from "./types";

/** 교육용 자기보고 문항 — PCL-R/진단 척도 복제가 아님 */
export const TRAIT_ITEMS: TraitItem[] = [
  // cold (psychopathy-leaning educational cluster: callous / shallow affect — self-reflect)
  { id: "c1", axis: "cold", text: "다른 사람의 슬픔을 들어도 마음이 거의 움직이지 않는다." },
  { id: "c2", axis: "cold", text: "약속을 깨도 미안함보다 ‘어쩔 수 없다’는 생각이 먼저 든다." },
  { id: "c3", axis: "cold", text: "칭찬·관심으로 사람을 원하는 방향으로 이끄는 편이 편하다." },
  { id: "c4", axis: "cold", text: "갈등 후 상대 감정을 떠올리기보다 ‘이득·손해’만 계산한다." },
  { id: "c5", axis: "cold", text: "가까운 사람에게도 깊은 애착을 느끼기 어렵다." },
  { id: "c6", axis: "cold", text: "잘못을 지적받으면 반성보다 변명·정당화가 먼저 나온다." },
  { id: "c7", axis: "cold", text: "다른 사람이 울거나 다쳐도 관찰하듯 담담하다." },
  { id: "c8", axis: "cold", text: "관계를 ‘쓰는 것’처럼 느낄 때가 있다." },

  // impulse (sociopathy-leaning colloquial cluster: reactive, rule-breaking, short fuse)
  { id: "i1", axis: "impulse", text: "화가 나면 말·행동을 참기 어렵다." },
  { id: "i2", axis: "impulse", text: "규칙·절차가 답답해 자주 어기고 싶어 진다." },
  { id: "i3", axis: "impulse", text: "계획 없이 즉흥적으로 큰 결정을 자주 한다." },
  { id: "i4", axis: "impulse", text: "지루하면 자극적인 일(위험·다툼·일탈)을 찾는다." },
  { id: "i5", axis: "impulse", text: "작은 무시에도 강하게 반발한다." },
  { id: "i6", axis: "impulse", text: "술·도박·과소비 등 충동을 조절하기 어렵다." },
  { id: "i7", axis: "impulse", text: "결과가 나빠도 ‘그때는 어쩔 수 없었다’고 넘긴다." },
  { id: "i8", axis: "impulse", text: "같은 문제로 주변과 갈등이 반복된다." },

  // prosocial protective / adaptive resources
  { id: "p1", axis: "prosocial", text: "상대 입장을 일부러 떠올려 보려 한다.", reverse: false },
  { id: "p2", axis: "prosocial", text: "화날 때 10초·한 발짝 물러서는 습관이 있다.", reverse: false },
  { id: "p3", axis: "prosocial", text: "직장·학교 규칙을 지키려 의식적으로 노력한다.", reverse: false },
  { id: "p4", axis: "prosocial", text: "상처 준 뒤 사과·수습을 하려고 한다.", reverse: false },
  { id: "p5", axis: "prosocial", text: "장기 목표를 위해 단기 충동을 미룰 수 있다.", reverse: false },
  { id: "p6", axis: "prosocial", text: "믿을 수 있는 사람에게 피드백을 받을 수 있다.", reverse: false },
];

const MAX = 4;

function axisItems(axis: TraitAxis) {
  return TRAIT_ITEMS.filter((i) => i.axis === axis);
}

export function scoreAxis(
  answers: Record<string, number>,
  axis: TraitAxis
): { raw: number; max: number; pct: number } {
  const items = axisItems(axis);
  let raw = 0;
  let max = 0;
  for (const item of items) {
    const v = answers[item.id];
    if (v === undefined || Number.isNaN(v)) continue;
    const clamped = Math.max(0, Math.min(MAX, v));
    const scored = item.reverse ? MAX - clamped : clamped;
    raw += scored;
    max += MAX;
  }
  const pct = max === 0 ? 0 : Math.round((raw / max) * 100);
  return { raw, max, pct };
}

export function computeScores(answers: Record<string, number>): TraitScores {
  const cold = scoreAxis(answers, "cold");
  const impulse = scoreAxis(answers, "impulse");
  const prosocial = scoreAxis(answers, "prosocial");
  return {
    coldPct: cold.pct,
    impulsePct: impulse.pct,
    prosocialPct: prosocial.pct,
    coldRaw: cold.raw,
    impulseRaw: impulse.raw,
    prosocialRaw: prosocial.raw,
    answeredAt: new Date().toISOString(),
  };
}

export function bandLabel(pct: number): { label: string; tone: "low" | "mid" | "high" } {
  if (pct < 35) return { label: "낮음", tone: "low" };
  if (pct < 65) return { label: "중간", tone: "mid" };
  return { label: "높음(자기보고)", tone: "high" };
}

export function interpret(scores: TraitScores): string {
  const parts: string[] = [];
  if (scores.coldPct >= 65) {
    parts.push("냉정·공감 둔감 쪽 자기보고가 높게 나왔습니다. ‘진단’이 아니라, 관계에서 감정 신호 연습이 도움이 될 수 있습니다.");
  } else if (scores.coldPct >= 35) {
    parts.push("냉정 기질은 중간 구간입니다. 상황에 따라 차갑게 느껴질 수 있으니 피드백을 점검해 보세요.");
  } else {
    parts.push("냉정 기질 자기보고는 낮은 편입니다.");
  }

  if (scores.impulsePct >= 65) {
    parts.push("충동·규칙 이탈 쪽 점수가 높습니다. 분노·즉흥 행동을 늦추는 루틴이 사회 적응에 특히 중요합니다.");
  } else if (scores.impulsePct >= 35) {
    parts.push("충동 기질은 중간입니다. 스트레스 때 폭발하지 않도록 미리 규칙을 정해 두면 좋습니다.");
  } else {
    parts.push("충동 기질 자기보고는 낮은 편입니다.");
  }

  if (scores.prosocialPct >= 65) {
    parts.push("사회 적응·조절 자원이 비교적 있습니다. 이 자원을 파훼법 탭의 루틴과 연결해 보세요.");
  } else if (scores.prosocialPct >= 35) {
    parts.push("조절 자원은 중간입니다. 사과·규칙·피드백 습관을 의도적으로 키우면 도움이 됩니다.");
  } else {
    parts.push("조절 자원 점수가 낮습니다. 혼자 버티기보다 상담·신뢰할 사람·구조화된 루틴을 권합니다.");
  }

  parts.push("이 결과는 교육용 자기점검이며 임상 평가를 대체하지 않습니다.");
  return parts.join(" ");
}

export const TOTAL_ITEMS = TRAIT_ITEMS.length;
