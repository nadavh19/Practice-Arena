import {
  THEORY_INTERVAL_BY_ID,
  type IntervalId,
  type TheoryPhase,
} from "@/lib/theory-game/definitions";

export const PIANO_MIN_MIDI = 48;
export const PIANO_MAX_MIDI = 96;

export type TheoryRound = {
  intervalId: IntervalId;
  lowerMidi: number;
  upperMidi: number;
};

type RandomSource = () => number;

function randomItem<T>(items: T[], random: RandomSource) {
  return items[Math.min(items.length - 1, Math.floor(random() * items.length))];
}

export function chooseIntervalForPhase(phase: TheoryPhase, random: RandomSource = Math.random) {
  if (phase.levelId >= 2 && phase.levelId <= 4) {
    if (random() < 0.2) return "tt" as const;
    const withoutTritone = phase.answerIntervalIds.filter((id) => id !== "tt");
    return randomItem(withoutTritone, random);
  }

  return randomItem(phase.answerIntervalIds, random);
}

function createCandidate(phase: TheoryPhase, random: RandomSource): TheoryRound {
  const intervalId = chooseIntervalForPhase(phase, random);
  const semitones = THEORY_INTERVAL_BY_ID[intervalId].semitones;
  const availableRoots = PIANO_MAX_MIDI - semitones - PIANO_MIN_MIDI + 1;
  const lowerMidi = PIANO_MIN_MIDI + Math.min(availableRoots - 1, Math.floor(random() * availableRoots));
  return { intervalId, lowerMidi, upperMidi: lowerMidi + semitones };
}

function isSamePair(a: TheoryRound, b: TheoryRound) {
  return a.lowerMidi === b.lowerMidi && a.upperMidi === b.upperMidi;
}

export function generateTheoryRound(
  phase: TheoryPhase,
  random: RandomSource = Math.random,
  previousRound?: TheoryRound,
): TheoryRound {
  let candidate = createCandidate(phase, random);

  for (let attempt = 0; previousRound && isSamePair(candidate, previousRound) && attempt < 8; attempt += 1) {
    candidate = createCandidate(phase, random);
  }

  if (previousRound && isSamePair(candidate, previousRound)) {
    const semitones = THEORY_INTERVAL_BY_ID[candidate.intervalId].semitones;
    const lastRoot = PIANO_MAX_MIDI - semitones;
    const lowerMidi = candidate.lowerMidi < lastRoot ? candidate.lowerMidi + 1 : PIANO_MIN_MIDI;
    candidate = { ...candidate, lowerMidi, upperMidi: lowerMidi + semitones };
  }

  return candidate;
}

export function midiSamplePath(midi: number) {
  return `/audio/piano/${midi}.mp3`;
}
