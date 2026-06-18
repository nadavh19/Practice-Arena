import { THEORY_LEVELS } from "@/lib/theory-game/definitions";

export type TheoryPhaseProgress = {
  id: string;
  bestScore: number;
  maxScore: number;
  attempted: boolean;
};

export type TheoryLevelProgress = {
  id: number;
  score: number;
  maxScore: number;
  attemptedPhases: number;
  totalPhases: number;
  phases: TheoryPhaseProgress[];
};

export type TheoryGameProgress = {
  levels: TheoryLevelProgress[];
};

export type StoredPhaseScore = {
  level: number;
  phaseId: string;
  bestScore: number;
};

export function buildTheoryGameProgress(scores: StoredPhaseScore[]): TheoryGameProgress {
  const scoreByPhase = new Map(scores.map((score) => [score.phaseId, score]));

  return {
    levels: THEORY_LEVELS.map((level) => {
      const phases = level.phases.map((phase) => {
        const stored = scoreByPhase.get(phase.id);
        return {
          id: phase.id,
          bestScore: stored?.bestScore ?? 0,
          maxScore: phase.maxScore,
          attempted: Boolean(stored),
        };
      });

      return {
        id: level.id,
        score: phases.reduce((sum, phase) => sum + phase.bestScore, 0),
        maxScore: level.maxScore,
        attemptedPhases: phases.filter((phase) => phase.attempted).length,
        totalPhases: phases.length,
        phases,
      };
    }),
  };
}
