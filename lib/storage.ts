import type { CheckIn, TraitScores } from "./types";

const KEY = "trait-coach";
const MAX_HISTORY = 30;

function get<T>(k: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`${KEY}:${k}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(k: string, v: T) {
  localStorage.setItem(`${KEY}:${k}`, JSON.stringify(v));
}

export function loadAnswers(): Record<string, number> {
  return get<Record<string, number>>("answers", {});
}

export function saveAnswers(answers: Record<string, number>) {
  set("answers", answers);
}

export function loadScores(): TraitScores | null {
  return get<TraitScores | null>("scores", null);
}

export function saveScores(scores: TraitScores) {
  set("scores", scores);
  const history = get<TraitScores[]>("history", []);
  const next = [...history, scores].slice(-MAX_HISTORY);
  set("history", next);
}

export function loadHistory(): TraitScores[] {
  return get<TraitScores[]>("history", []);
}

export function clearTest() {
  set("answers", {});
  set("scores", null);
}

// ---- 실천 체크인 (스트릭) ----

export function loadCheckins(): CheckIn[] {
  return get<CheckIn[]>("checkins", []);
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function todayCheckIn(): CheckIn | undefined {
  const t = todayKey();
  return loadCheckins().find((c) => c.date === t);
}

export function addCheckIn(success: boolean, cardId?: string): CheckIn[] {
  const t = todayKey();
  const list = loadCheckins().filter((c) => c.date !== t);
  const next = [...list, { date: t, success, cardId }].sort((a, b) => a.date.localeCompare(b.date));
  set("checkins", next);
  return next;
}
