export type Difficulty = "beginner" | "intermediate" | "advanced";

export function computeDifficulty(level: string): Difficulty {
  if (level === "advanced") {
    return "advanced";
  }

  if (level === "intermediate") {
    return "intermediate";
  }

  return "beginner";
}
