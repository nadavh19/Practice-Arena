import type { Difficulty } from "@/algorithms/computeDifficulty";

export type TaskForSelection = {
  id: string;
  name: string;
  difficulty: string;
  duration: number;
  category: string;
};

export function selectTasks(
  tasks: TaskForSelection[],
  targetDifficulty: Difficulty,
  maxMinutes: number,
) {
  const matchingDifficulty = tasks.filter((task) => task.difficulty === targetDifficulty);
  const pool = matchingDifficulty.length > 0 ? matchingDifficulty : tasks;

  const sortedPool = [...pool].sort((a, b) => a.duration - b.duration);

  const selected: TaskForSelection[] = [];
  const usedTaskIds = new Set<string>();

  let remainingMinutes = maxMinutes;
  let lastCategory: string | null = null;

  while (remainingMinutes >= 5) {
    const candidates = sortedPool.filter(
      (task) => !usedTaskIds.has(task.id) && task.duration <= remainingMinutes,
    );

    if (candidates.length === 0) {
      break;
    }

    const categoryPreferred = candidates.find((task) => task.category !== lastCategory);
    const nextTask = categoryPreferred ?? candidates[0];

    selected.push(nextTask);
    usedTaskIds.add(nextTask.id);
    remainingMinutes -= nextTask.duration;
    lastCategory = nextTask.category;
  }

  return selected;
}
