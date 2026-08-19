import type { CheckIn, StreakInfo } from "./types";

function toKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dayBefore(key: string, n: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - n);
  return toKey(dt);
}

/** 체크인 목록에서 현재/최고 스트릭과 최근 7일 상태를 계산합니다. */
export function computeStreak(checkins: CheckIn[]): StreakInfo {
  const byDate = new Map(checkins.map((c) => [c.date, c]));
  const today = toKey(new Date());

  // 현재 스트릭: 오늘부터(없으면 어제부터) 거슬러 올라가며 연속 기록 카운트
  let current = 0;
  const hasToday = byDate.has(today);
  let cursor = hasToday ? today : dayBefore(today, 1);
  while (byDate.has(cursor)) {
    current += 1;
    cursor = dayBefore(cursor, 1);
  }

  // 최고 스트릭: 전체 기록을 날짜순으로 훑으며 연속 구간 최대값
  const dates = [...byDate.keys()].sort();
  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const dt of dates) {
    if (prev && dayBefore(dt, 1) === prev) {
      run += 1;
    } else {
      run = 1;
    }
    best = Math.max(best, run);
    prev = dt;
  }
  best = Math.max(best, current);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const key = dayBefore(today, 6 - i);
    const c = byDate.get(key);
    return { date: key, state: (c ? (c.success ? "success" : "miss") : "none") as "success" | "miss" | "none" };
  });

  return { current, best, todayDone: hasToday, last7 };
}
