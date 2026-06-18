export type TheoryLevelId = 1 | 2 | 3 | 4 | 5;

export type IntervalId =
  | "p1"
  | "m2"
  | "M2"
  | "m3"
  | "M3"
  | "p4"
  | "tt"
  | "p5"
  | "m6"
  | "M6"
  | "m7"
  | "M7"
  | "p8";

export type IntervalFamilyId =
  | "unison"
  | "seconds"
  | "thirds"
  | "fourth"
  | "fifth"
  | "sixths"
  | "sevenths"
  | "octave";

export type TheoryInterval = {
  id: IntervalId;
  label: string;
  shortLabel: string;
  semitones: number;
};

export type TheoryPhase = {
  id: string;
  levelId: TheoryLevelId;
  name: string;
  description: string;
  familyIds: IntervalFamilyId[];
  answerIntervalIds: IntervalId[];
  roundCount: number;
  pointsPerCorrect: number;
  maxScore: number;
};

export type TheoryLevel = {
  id: TheoryLevelId;
  name: string;
  description: string;
  phases: TheoryPhase[];
  maxScore: number;
};

export const THEORY_INTERVALS: TheoryInterval[] = [
  { id: "p1", label: "Unison", shortLabel: "P1", semitones: 0 },
  { id: "m2", label: "Minor 2nd", shortLabel: "m2", semitones: 1 },
  { id: "M2", label: "Major 2nd", shortLabel: "M2", semitones: 2 },
  { id: "m3", label: "Minor 3rd", shortLabel: "m3", semitones: 3 },
  { id: "M3", label: "Major 3rd", shortLabel: "M3", semitones: 4 },
  { id: "p4", label: "Perfect 4th", shortLabel: "P4", semitones: 5 },
  { id: "tt", label: "Tritone", shortLabel: "TT", semitones: 6 },
  { id: "p5", label: "Perfect 5th", shortLabel: "P5", semitones: 7 },
  { id: "m6", label: "Minor 6th", shortLabel: "m6", semitones: 8 },
  { id: "M6", label: "Major 6th", shortLabel: "M6", semitones: 9 },
  { id: "m7", label: "Minor 7th", shortLabel: "m7", semitones: 10 },
  { id: "M7", label: "Major 7th", shortLabel: "M7", semitones: 11 },
  { id: "p8", label: "Octave", shortLabel: "P8", semitones: 12 },
];

export const THEORY_INTERVAL_BY_ID = Object.fromEntries(
  THEORY_INTERVALS.map((interval) => [interval.id, interval]),
) as Record<IntervalId, TheoryInterval>;

const FAMILY_DEFINITIONS: Record<
  IntervalFamilyId,
  { label: string; intervalIds: IntervalId[] }
> = {
  unison: { label: "Unison", intervalIds: ["p1"] },
  seconds: { label: "2nds", intervalIds: ["m2", "M2"] },
  thirds: { label: "3rds", intervalIds: ["m3", "M3"] },
  fourth: { label: "4th", intervalIds: ["p4"] },
  fifth: { label: "5th", intervalIds: ["p5"] },
  sixths: { label: "6ths", intervalIds: ["m6", "M6"] },
  sevenths: { label: "7ths", intervalIds: ["m7", "M7"] },
  octave: { label: "Octave", intervalIds: ["p8"] },
};

export const THEORY_FAMILY_IDS = Object.keys(FAMILY_DEFINITIONS) as IntervalFamilyId[];

export const FORBIDDEN_FAMILY_PAIRS: ReadonlyArray<readonly [IntervalFamilyId, IntervalFamilyId]> = [
  ["unison", "octave"],
  ["seconds", "sevenths"],
  ["thirds", "sixths"],
  ["fourth", "fifth"],
];

function pairKey(a: IntervalFamilyId, b: IntervalFamilyId) {
  return [a, b].sort().join("--");
}

const forbiddenPairKeys = new Set(FORBIDDEN_FAMILY_PAIRS.map(([a, b]) => pairKey(a, b)));

export function isForbiddenFamilyPair(a: IntervalFamilyId, b: IntervalFamilyId) {
  return forbiddenPairKeys.has(pairKey(a, b));
}

function combinations<T>(items: T[], size: number): T[][] {
  if (size === 0) return [[]];
  if (items.length < size) return [];

  return items.flatMap((item, index) =>
    combinations(items.slice(index + 1), size - 1).map((tail) => [item, ...tail]),
  );
}

function familyName(familyId: IntervalFamilyId) {
  return FAMILY_DEFINITIONS[familyId].label;
}

function intervalsForFamilies(familyIds: IntervalFamilyId[], includeTritone: boolean) {
  const selected = new Set<IntervalId>();
  familyIds.forEach((familyId) => {
    FAMILY_DEFINITIONS[familyId].intervalIds.forEach((intervalId) => selected.add(intervalId));
  });
  if (includeTritone) selected.add("tt");
  return THEORY_INTERVALS.map(({ id }) => id).filter((id) => selected.has(id));
}

function makePhase(options: {
  id: string;
  levelId: TheoryLevelId;
  name: string;
  description: string;
  familyIds: IntervalFamilyId[];
  answerIntervalIds: IntervalId[];
  roundCount?: number;
  pointsPerCorrect?: number;
}): TheoryPhase {
  const roundCount = options.roundCount ?? 12;
  const pointsPerCorrect = options.pointsPerCorrect ?? 5;
  return {
    ...options,
    roundCount,
    pointsPerCorrect,
    maxScore: roundCount * pointsPerCorrect,
  };
}

const levelOnePhases: TheoryPhase[] = [
  makePhase({ id: "l1-seconds", levelId: 1, name: "2nds", description: "Minor or major 2nd", familyIds: ["seconds"], answerIntervalIds: ["m2", "M2"] }),
  makePhase({ id: "l1-thirds", levelId: 1, name: "3rds", description: "Minor or major 3rd", familyIds: ["thirds"], answerIntervalIds: ["m3", "M3"] }),
  makePhase({ id: "l1-fourth-tritone", levelId: 1, name: "4th & Tritone", description: "Perfect 4th or tritone", familyIds: ["fourth"], answerIntervalIds: ["p4", "tt"] }),
  makePhase({ id: "l1-tritone-fifth", levelId: 1, name: "Tritone & 5th", description: "Tritone or perfect 5th", familyIds: ["fifth"], answerIntervalIds: ["tt", "p5"] }),
  makePhase({ id: "l1-sixths", levelId: 1, name: "6ths", description: "Minor or major 6th", familyIds: ["sixths"], answerIntervalIds: ["m6", "M6"] }),
  makePhase({ id: "l1-sevenths", levelId: 1, name: "7ths", description: "Minor or major 7th", familyIds: ["sevenths"], answerIntervalIds: ["m7", "M7"] }),
  makePhase({ id: "l1-unison-octave", levelId: 1, name: "Unison & Octave", description: "Same note or one octave apart", familyIds: ["unison", "octave"], answerIntervalIds: ["p1", "p8"] }),
];

const levelTwoPhases = combinations(THEORY_FAMILY_IDS, 2)
  .filter(([a, b]) => !isForbiddenFamilyPair(a, b))
  .map(([a, b]) =>
    makePhase({
      id: `l2-${a}-${b}`,
      levelId: 2,
      name: `${familyName(a)} + ${familyName(b)}`,
      description: "Two related interval families, plus a tritone wildcard",
      familyIds: [a, b],
      answerIntervalIds: intervalsForFamilies([a, b], true),
    }),
  );

const levelThreePhases = FORBIDDEN_FAMILY_PAIRS.flatMap(([a, b]) =>
  THEORY_FAMILY_IDS.filter((familyId) => familyId !== a && familyId !== b).map((extra) =>
    makePhase({
      id: `l3-${a}-${b}-${extra}`,
      levelId: 3,
      name: `${familyName(a)} + ${familyName(b)} + ${familyName(extra)}`,
      description: "One opposite pair, one additional family, and a tritone wildcard",
      familyIds: [a, b, extra],
      answerIntervalIds: intervalsForFamilies([a, b, extra], true),
    }),
  ),
);

const levelFourPhases = FORBIDDEN_FAMILY_PAIRS.flatMap(([a, b]) => {
  const remaining = THEORY_FAMILY_IDS.filter((familyId) => familyId !== a && familyId !== b);
  return combinations(remaining, 2)
    .filter(([extraA, extraB]) => !isForbiddenFamilyPair(extraA, extraB))
    .map(([extraA, extraB]) => {
      const familyIds: IntervalFamilyId[] = [a, b, extraA, extraB];
      return makePhase({
        id: `l4-${familyIds.join("-")}`,
        levelId: 4,
        name: familyIds.map(familyName).join(" + "),
        description: "Four families with exactly one opposite pair, plus a tritone wildcard",
        familyIds,
        answerIntervalIds: intervalsForFamilies(familyIds, true),
      });
    });
});

const levelFivePhases = [
  makePhase({
    id: "l5-all-intervals",
    levelId: 5,
    name: "All Intervals",
    description: "Every interval from unison through octave",
    familyIds: [...THEORY_FAMILY_IDS],
    answerIntervalIds: THEORY_INTERVALS.map(({ id }) => id),
    roundCount: 15,
    pointsPerCorrect: 100,
  }),
];

function makeLevel(id: TheoryLevelId, description: string, phases: TheoryPhase[]): TheoryLevel {
  return {
    id,
    name: `Level ${id}`,
    description,
    phases,
    maxScore: phases.reduce((sum, phase) => sum + phase.maxScore, 0),
  };
}

export const THEORY_LEVELS: TheoryLevel[] = [
  makeLevel(1, "Train one focused interval contrast at a time.", levelOnePhases),
  makeLevel(2, "Compare two compatible interval families.", levelTwoPhases),
  makeLevel(3, "Hear an opposite pair inside a wider answer bank.", levelThreePhases),
  makeLevel(4, "Separate four families with one opposite relationship.", levelFourPhases),
  makeLevel(5, "The full chromatic interval challenge.", levelFivePhases),
];

export const THEORY_LEVEL_BY_ID = Object.fromEntries(
  THEORY_LEVELS.map((level) => [level.id, level]),
) as Record<TheoryLevelId, TheoryLevel>;

export const THEORY_PHASE_BY_ID = Object.fromEntries(
  THEORY_LEVELS.flatMap((level) => level.phases.map((phase) => [phase.id, phase])),
) as Record<string, TheoryPhase>;

export function scoreForCorrectAnswers(phase: TheoryPhase, correctAnswers: number) {
  return correctAnswers * phase.pointsPerCorrect;
}
