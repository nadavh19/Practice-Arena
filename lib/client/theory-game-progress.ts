import { apiGet, apiPost } from "@/lib/client/api-client";
import { THEORY_PHASE_BY_ID, scoreForCorrectAnswers } from "@/lib/theory-game/definitions";
import {
  buildTheoryGameProgress,
  type StoredPhaseScore,
  type TheoryGameProgress,
} from "@/lib/theory-game/progress";

const LOCAL_PROGRESS_KEY = "practiceArenaTheoryGameScores";

export const usesLocalTheoryProgress =
  process.env.NEXT_PUBLIC_THEORY_GAME_LOCAL_PROGRESS === "true";

function readLocalScores(): StoredPhaseScore[] {
  if (typeof window === "undefined") return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(LOCAL_PROGRESS_KEY) ?? "[]");
    return Array.isArray(value) ? (value as StoredPhaseScore[]) : [];
  } catch {
    return [];
  }
}

export async function loadTheoryProgress(): Promise<TheoryGameProgress> {
  if (usesLocalTheoryProgress) return buildTheoryGameProgress(readLocalScores());

  const result = await apiGet<TheoryGameProgress>("/api/theory-game/progress");
  if (!result.success) throw new Error(result.error.message);
  return result.data;
}

export async function submitTheoryPhaseScore(options: {
  levelId: number;
  phaseId: string;
  correctAnswers: number;
}): Promise<TheoryGameProgress> {
  if (!usesLocalTheoryProgress) {
    const result = await apiPost<TheoryGameProgress>("/api/theory-game/scores", options);
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  }

  const phase = THEORY_PHASE_BY_ID[options.phaseId];
  if (!phase || phase.levelId !== options.levelId || options.correctAnswers > phase.roundCount) {
    throw new Error("Invalid local phase score");
  }

  const nextScore = scoreForCorrectAnswers(phase, options.correctAnswers);
  const scores = readLocalScores();
  const existing = scores.find((score) => score.phaseId === options.phaseId);
  if (existing) {
    existing.bestScore = Math.max(existing.bestScore, nextScore);
  } else {
    scores.push({ level: options.levelId, phaseId: options.phaseId, bestScore: nextScore });
  }

  window.localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(scores));
  return buildTheoryGameProgress(scores);
}
