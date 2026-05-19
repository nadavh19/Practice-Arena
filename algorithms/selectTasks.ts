import type { Difficulty } from "@/algorithms/computeDifficulty";

export type TaskForSelection = {
  id: string;
  name: string;
  difficulty: string;
  duration: number;
  category: string;
  description?: string | null;
  instrument?: string | null;
  key?: string | null;
  bpm?: number | null;
  tab?: string | null;
  chords?: string | null;
  scale?: string | null;
  songName?: string | null;
  artistName?: string | null;
};

export type FeedbackSummary = {
  averageDifficultyRating: number | null;
  averageFocusRating: number | null;
};

export type SelectionContext = {
  mood?: string | null;
  sessionGoal?: string | null;
  profileGoals?: string | null;
  feedbackSummary?: FeedbackSummary;
};

const DIFFICULTY_ORDER: Difficulty[] = ["beginner", "intermediate", "advanced"];
const SIMPLE_CATEGORIES = new Set(["chord", "song_chords", "rhythm"]);
const HIGH_ENERGY_CATEGORIES = new Set(["technique", "scale", "solo", "riff"]);

const LOW_ENERGY_MOOD_WORDS = [
  "tired",
  "stress",
  "stressed",
  "anxious",
  "low",
  "unfocused",
  "exhausted",
  "overwhelmed",
  "sad",
];

const HIGH_ENERGY_MOOD_WORDS = [
  "focused",
  "motivated",
  "energetic",
  "excited",
  "confident",
  "happy",
  "ready",
];

const GOAL_CATEGORY_KEYWORDS: Record<string, string[]> = {
  chord: ["chord"],
  song_chords: ["strum", "song"],
  rhythm: ["rhythm", "strum"],
  scale: ["scale"],
  solo: ["solo", "lead"],
  riff: ["riff"],
  technique: ["speed", "technique", "finger"],
};

export function selectTasks(
  tasks: TaskForSelection[],
  targetDifficulty: Difficulty,
  maxMinutes: number,
  context: SelectionContext = {},
) {
  const effectiveDifficulty = getFeedbackAdjustedDifficulty(
    targetDifficulty,
    context.feedbackSummary?.averageDifficultyRating ?? null,
  );

  const selected: TaskForSelection[] = [];
  const usedTaskIds = new Set<string>();
  let remainingMinutes = maxMinutes;

  if (remainingMinutes >= 10) {
    const longTask = selectBestTask(
      tasks,
      effectiveDifficulty,
      remainingMinutes,
      context,
      usedTaskIds,
      null,
      (task) => task.duration >= 10,
    );

    if (longTask) {
      selected.push(longTask);
      usedTaskIds.add(longTask.id);
      remainingMinutes -= longTask.duration;
    }
  }

  let lastCategory: string | null = null;
  if (selected.length > 0) {
    lastCategory = selected[selected.length - 1].category;
  }

  while (remainingMinutes >= 5) {
    const nextTask = selectBestTask(
      tasks,
      effectiveDifficulty,
      remainingMinutes,
      context,
      usedTaskIds,
      lastCategory,
      (task) => task.duration === 5,
    );

    if (!nextTask) {
      break;
    }

    selected.push(nextTask);
    usedTaskIds.add(nextTask.id);
    remainingMinutes -= nextTask.duration;
    lastCategory = nextTask.category;
  }

  return selected;
}

function selectBestTask(
  tasks: TaskForSelection[],
  targetDifficulty: Difficulty,
  remainingMinutes: number,
  context: SelectionContext,
  usedTaskIds: Set<string>,
  lastCategory: string | null,
  durationFilter: (task: TaskForSelection) => boolean,
) {
  const candidates = tasks.filter(
    (task) => !usedTaskIds.has(task.id) && task.duration <= remainingMinutes && durationFilter(task),
  );

  if (candidates.length === 0) {
    return null;
  }

  return candidates
    .map((task) => ({
      task,
      score: scoreTask(task, targetDifficulty, context, lastCategory),
    }))
    .sort((a, b) => compareScoredTasks(a, b, lastCategory))[0].task;
}

function scoreTask(
  task: TaskForSelection,
  targetDifficulty: Difficulty,
  context: SelectionContext,
  lastCategory: string | null,
) {
  let score = 0;

  score += scoreDifficulty(task.difficulty, targetDifficulty);
  score += scoreMood(task, context.mood);
  score += scoreGoal(task, context.sessionGoal?.trim() ? context.sessionGoal : context.profileGoals, {
    isSessionGoal: Boolean(context.sessionGoal?.trim()),
  });

  if ((context.feedbackSummary?.averageFocusRating ?? 5) <= 2.5 && SIMPLE_CATEGORIES.has(task.category)) {
    score += 20;
  }

  if (lastCategory && task.category !== lastCategory) {
    score += 5;
  }

  return score;
}

function compareScoredTasks(
  a: { task: TaskForSelection; score: number },
  b: { task: TaskForSelection; score: number },
  lastCategory: string | null,
) {
  if (b.score !== a.score) {
    return b.score - a.score;
  }

  const aVariesCategory = lastCategory !== null && a.task.category !== lastCategory;
  const bVariesCategory = lastCategory !== null && b.task.category !== lastCategory;
  if (aVariesCategory !== bVariesCategory) {
    return aVariesCategory ? -1 : 1;
  }

  if (a.task.duration !== b.task.duration) {
    return a.task.duration - b.task.duration;
  }

  const nameComparison = a.task.name.localeCompare(b.task.name);
  if (nameComparison !== 0) {
    return nameComparison;
  }

  return a.task.id.localeCompare(b.task.id);
}

function scoreDifficulty(taskDifficulty: string, targetDifficulty: Difficulty) {
  const taskIndex = DIFFICULTY_ORDER.indexOf(taskDifficulty as Difficulty);
  const targetIndex = DIFFICULTY_ORDER.indexOf(targetDifficulty);

  if (taskIndex === -1) {
    return 0;
  }

  const distance = Math.abs(taskIndex - targetIndex);
  if (distance === 0) {
    return 60;
  }

  if (distance === 1) {
    return 25;
  }

  return -20;
}

function scoreMood(task: TaskForSelection, mood?: string | null) {
  const normalizedMood = normalizeText(mood);

  if (!normalizedMood) {
    return 0;
  }

  if (LOW_ENERGY_MOOD_WORDS.some((word) => normalizedMood.includes(word))) {
    return SIMPLE_CATEGORIES.has(task.category) ? 25 : -10;
  }

  if (HIGH_ENERGY_MOOD_WORDS.some((word) => normalizedMood.includes(word))) {
    return HIGH_ENERGY_CATEGORIES.has(task.category) ? 25 : 0;
  }

  return 0;
}

function scoreGoal(
  task: TaskForSelection,
  goal: string | null | undefined,
  options: { isSessionGoal: boolean },
) {
  const normalizedGoal = normalizeText(goal);

  if (!normalizedGoal) {
    return 0;
  }

  let score = 0;
  const matchedCategories = getGoalCategories(normalizedGoal);

  if (matchedCategories.has(task.category)) {
    score += options.isSessionGoal ? 85 : 35;
  }

  const taskText = normalizeText([
    task.name,
    task.description,
    task.category,
    task.key,
    task.chords,
    task.scale,
    task.songName,
    task.artistName,
  ].filter(Boolean).join(" "));

  for (const word of normalizedGoal.split(/\s+/)) {
    if (word.length >= 3 && taskText.includes(word)) {
      score += 4;
    }
  }

  return score;
}

function getGoalCategories(normalizedGoal: string) {
  const categories = new Set<string>();

  for (const [category, keywords] of Object.entries(GOAL_CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => normalizedGoal.includes(keyword))) {
      categories.add(category);
    }
  }

  return categories;
}

function getFeedbackAdjustedDifficulty(
  targetDifficulty: Difficulty,
  averageDifficultyRating: number | null,
) {
  if (averageDifficultyRating === null) {
    return targetDifficulty;
  }

  if (averageDifficultyRating >= 4) {
    return shiftDifficulty(targetDifficulty, -1);
  }

  if (averageDifficultyRating <= 2) {
    return shiftDifficulty(targetDifficulty, 1);
  }

  return targetDifficulty;
}

function shiftDifficulty(difficulty: Difficulty, direction: -1 | 1) {
  const index = DIFFICULTY_ORDER.indexOf(difficulty);
  const nextIndex = Math.min(Math.max(index + direction, 0), DIFFICULTY_ORDER.length - 1);
  return DIFFICULTY_ORDER[nextIndex];
}

function normalizeText(value?: string | null) {
  return (value ?? "").trim().toLowerCase();
}
