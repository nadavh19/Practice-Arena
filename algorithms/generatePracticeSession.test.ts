import assert from "node:assert/strict";
import test from "node:test";

import { generatePracticeSession } from "./generatePracticeSession";
import type { TaskForSelection } from "./selectTasks";

const baseTasks: TaskForSelection[] = [
  task("beginner-chord-long", "Open Chord Song", "beginner", 10, "song_chords", {
    description: "Practice open chord transitions with relaxed strumming.",
  }),
  task("beginner-scale-long", "Major Scale Map", "beginner", 10, "scale", {
    scale: "major",
  }),
  task("beginner-chord-short", "Chord Switches", "beginner", 5, "chord"),
  task("beginner-rhythm-short", "Easy Rhythm Pulse", "beginner", 5, "rhythm"),
  task("beginner-technique-short", "Finger Speed Drill", "beginner", 5, "technique"),
  task("intermediate-solo-long", "Lead Solo Study", "intermediate", 10, "solo", {
    description: "Lead guitar phrasing.",
  }),
  task("intermediate-riff-short", "Rock Riff Loop", "intermediate", 5, "riff"),
  task("intermediate-scale-short", "Scale Sequencing", "intermediate", 5, "scale"),
  task("advanced-technique-long", "Advanced Speed Builder", "advanced", 10, "technique"),
  task("advanced-solo-short", "Fast Lead Run", "advanced", 5, "solo"),
];

test("selects exactly one long task and fills the rest with 5-minute tasks", () => {
  const session = generatePracticeSession({
    userLevel: "beginner",
    availableTime: 20,
    mood: "fine",
    tasks: baseTasks,
  });

  assert.equal(session.difficulty, "beginner");
  assert.equal(session.totalPlannedMinutes, 20);
  assert.equal(session.selectedTasks.filter((taskItem) => taskItem.duration >= 10).length, 1);
  assert.equal(session.selectedTasks.filter((taskItem) => taskItem.duration === 5).length, 2);
});

test("uses 5-minute tasks only when no long task is available", () => {
  const session = generatePracticeSession({
    userLevel: "beginner",
    availableTime: 15,
    mood: "fine",
    tasks: baseTasks.filter((taskItem) => taskItem.duration === 5),
  });

  assert.equal(session.totalPlannedMinutes, 15);
  assert.deepEqual(
    session.selectedTasks.map((taskItem) => taskItem.duration),
    [5, 5, 5],
  );
});

test("tired mood prefers easier simple categories", () => {
  const session = generatePracticeSession({
    userLevel: "beginner",
    availableTime: 10,
    mood: "tired and stressed",
    tasks: baseTasks,
  });

  assert.equal(session.selectedTasks[0].category, "song_chords");
});

test("session goal beats tired mood when categories conflict", () => {
  const session = generatePracticeSession({
    userLevel: "beginner",
    availableTime: 10,
    mood: "tired and stressed",
    sessionGoal: "practice solos",
    tasks: baseTasks,
  });

  assert.equal(session.selectedTasks[0].category, "solo");
});

test("motivated mood prefers higher-energy categories", () => {
  const session = generatePracticeSession({
    userLevel: "beginner",
    availableTime: 10,
    mood: "focused and motivated",
    tasks: baseTasks,
  });

  assert.equal(session.selectedTasks[0].category, "scale");
});

test("recent feedback nudges difficulty easier when sessions felt too hard", () => {
  const session = generatePracticeSession({
    userLevel: "intermediate",
    availableTime: 10,
    mood: "fine",
    feedbackSummary: {
      averageDifficultyRating: 4.5,
      averageFocusRating: 4,
    },
    tasks: baseTasks,
  });

  assert.equal(session.selectedTasks[0].difficulty, "beginner");
});

test("recent feedback nudges difficulty harder when sessions felt too easy", () => {
  const session = generatePracticeSession({
    userLevel: "intermediate",
    availableTime: 10,
    mood: "fine",
    feedbackSummary: {
      averageDifficultyRating: 1.5,
      averageFocusRating: 4,
    },
    tasks: baseTasks,
  });

  assert.equal(session.selectedTasks[0].difficulty, "advanced");
});

test("session goal overrides profile goals", () => {
  const session = generatePracticeSession({
    userLevel: "beginner",
    availableTime: 10,
    mood: "fine",
    sessionGoal: "work on lead solo",
    profileGoals: "practice chords and strumming",
    tasks: baseTasks,
  });

  assert.equal(session.selectedTasks[0].category, "solo");
});

test("returns deterministic output for identical inputs", () => {
  const params = {
    userLevel: "beginner",
    availableTime: 20,
    mood: "focused",
    sessionGoal: "speed and technique",
    tasks: baseTasks,
  };

  const first = generatePracticeSession(params);
  const second = generatePracticeSession(params);

  assert.deepEqual(
    first.selectedTasks.map((taskItem) => taskItem.id),
    second.selectedTasks.map((taskItem) => taskItem.id),
  );
});

function task(
  id: string,
  name: string,
  difficulty: string,
  duration: number,
  category: string,
  extra: Partial<TaskForSelection> = {},
): TaskForSelection {
  return {
    id,
    name,
    difficulty,
    duration,
    category,
    ...extra,
  };
}
