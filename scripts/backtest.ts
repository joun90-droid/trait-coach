/**
 * 3-pass backtest for trait-coach
 * Run: npx tsx scripts/backtest.ts
 */
import { TRAIT_ITEMS, computeScores, scoreAxis, TOTAL_ITEMS } from "../lib/trait-test";
import { COPE_CARDS, GUIDE_SECTIONS } from "../lib/content";
import { DISCLAIMER } from "../lib/types";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

// ── Pass 1: 진단 아님 · 용어 정확성 ──
{
  const guide = GUIDE_SECTIONS.flatMap((s) =>
    s.topics.flatMap((t) => [t.summary, t.detail, t.memoryTip])
  ).join("\n");
  assert(guide.includes("DSM") || guide.includes("공식 진단명"), "P1 DSM/공식");
  assert(guide.includes("동일하지 않습니다") || guide.includes("동일하지 않"), "P1 not identical");
  assert(guide.includes("PCL-R") || guide.includes("PCL"), "P1 PCL");
  assert(guide.includes("일상") || guide.includes("대중"), "P1 sociopathy colloquial");
  assert(DISCLAIMER.title.includes("진단"), "P1 disclaimer title");
  assert(DISCLAIMER.lines.some((l) => l.includes("1577-0199")), "P1 helpline");
  assert(DISCLAIMER.lines.some((l) => l.includes("112")), "P1 112");
  assert(!guide.includes("공식 진단=ASPD"), "P1 no oversimplify");
  assert(!guide.includes("ASPD의 다른 이름"), "P1 no rename claim");
  console.log("✓ Pass1 terminology + disclaimer");
}

// ── Pass 2: 채점 로직 · 문항 구성 ──
{
  assert(TOTAL_ITEMS === TRAIT_ITEMS.length, "P2 count");
  assert(TRAIT_ITEMS.filter((i) => i.axis === "cold").length === 8, "P2 cold 8");
  assert(TRAIT_ITEMS.filter((i) => i.axis === "impulse").length === 8, "P2 impulse 8");
  assert(TRAIT_ITEMS.filter((i) => i.axis === "prosocial").length === 6, "P2 prosocial 6");
  assert(new Set(TRAIT_ITEMS.map((i) => i.id)).size === TOTAL_ITEMS, "P2 unique ids");

  const maxAns: Record<string, number> = {};
  const zeroAns: Record<string, number> = {};
  for (const i of TRAIT_ITEMS) {
    maxAns[i.id] = 4;
    zeroAns[i.id] = 0;
  }
  const maxS = computeScores(maxAns);
  const zeroS = computeScores(zeroAns);
  assert(maxS.coldPct === 100 && maxS.impulsePct === 100 && maxS.prosocialPct === 100, "P2 max 100");
  assert(zeroS.coldPct === 0 && zeroS.impulsePct === 0 && zeroS.prosocialPct === 0, "P2 zero 0");

  const mid: Record<string, number> = {};
  for (const i of TRAIT_ITEMS) mid[i.id] = 2;
  const midS = computeScores(mid);
  assert(midS.coldPct === 50 && midS.impulsePct === 50 && midS.prosocialPct === 50, "P2 mid 50");

  const partial = scoreAxis({ c1: 4 }, "cold");
  assert(partial.pct === 100, "P2 partial cold only answered item");
  console.log("✓ Pass2 scoring math", TOTAL_ITEMS);
}

// ── Pass 3: 파훼법 윤리 · 금지 문구 ──
{
  const cope = COPE_CARDS.flatMap((c) => [c.title, c.forWhen, c.caution, ...c.steps]).join("\n");
  const all = cope + GUIDE_SECTIONS.flatMap((s) => s.topics.map((t) => t.detail)).join("\n");

  assert(cope.includes("1577-0199") || cope.includes("109"), "P3 help numbers");
  assert(cope.includes("관점") || cope.includes("공감"), "P3 perspective");
  assert(cope.includes("사과") || cope.includes("수습"), "P3 repair");
  assert(all.includes("들키지 않") === false || cope.includes("들키지 않는 법은 파훼법이 아닙니다"), "P3 anti-hide");

  const banned = [
    "상대를 조종하는 기술",
    "사이코패스를 찾는 법",
    "확정 진단합니다",
    "가스라이팅 하는 법",
    "들키지 않고 이용하는 법",
    "PCL-R 자가채점 완료",
    "당신은 사이코패스입니다",
  ];
  for (const b of banned) assert(!all.includes(b), `P3 banned: ${b}`);

  assert(COPE_CARDS.length >= 5, "P3 enough cope cards");
  console.log("✓ Pass3 ethics + banned phrases", COPE_CARDS.length);
}

console.log("\nALL 3 BACKTESTS PASSED\n");
