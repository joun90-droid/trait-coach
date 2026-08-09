import type { TraitScores } from "./types";

const KEY = "trait-coach";

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
}

export function clearTest() {
  set("answers", {});
  set("scores", null);
}
