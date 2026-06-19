import assert from "node:assert/strict";
import test from "node:test";
import {
  FORBIDDEN_FAMILY_PAIRS,
  THEORY_INTERVAL_BY_ID,
  THEORY_LEVELS,
  THEORY_PHASE_BY_ID,
  isForbiddenFamilyPair,
  scoreForCorrectAnswers,
} from "../lib/theory-game/definitions";
import {
  PIANO_MAX_MIDI,
  PIANO_MIN_MIDI,
  chooseIntervalForPhase,
  generateTheoryRound,
} from "../lib/theory-game/rounds";

test("builds every level with the expected phase and score totals", () => {
  assert.deepEqual(THEORY_LEVELS.map((level) => level.phases.length), [7, 24, 24, 48, 1]);
  assert.deepEqual(THEORY_LEVELS.map((level) => level.maxScore), [420, 1440, 1440, 2880, 1500]);
});

test("level two excludes all four opposite family pairs", () => {
  const levelTwo = THEORY_LEVELS[1];
  for (const phase of levelTwo.phases) {
    assert.equal(phase.familyIds.length, 2);
    assert.equal(isForbiddenFamilyPair(phase.familyIds[0], phase.familyIds[1]), false);
  }
  assert.equal(FORBIDDEN_FAMILY_PAIRS.length, 4);
});

test("level four phases contain exactly one forbidden relationship", () => {
  for (const phase of THEORY_LEVELS[3].phases) {
    let forbiddenCount = 0;
    phase.familyIds.forEach((family, index) => {
      phase.familyIds.slice(index + 1).forEach((other) => {
        if (isForbiddenFamilyPair(family, other)) forbiddenCount += 1;
      });
    });
    assert.equal(forbiddenCount, 1, phase.id);
  }
});

test("maps all thirteen intervals from unison through octave", () => {
  const semitones = Object.values(THEORY_INTERVAL_BY_ID).map((interval) => interval.semitones);
  assert.deepEqual(semitones, Array.from({ length: 13 }, (_, index) => index));
});

test("uses a twenty percent tritone gate in levels two through four", () => {
  const phase = THEORY_LEVELS[1].phases[0];
  assert.equal(chooseIntervalForPhase(phase, () => 0.19), "tt");

  const values = [0.2, 0];
  assert.notEqual(chooseIntervalForPhase(phase, () => values.shift() ?? 0), "tt");
});

test("keeps every generated piano note inside C3 through C7", () => {
  for (const phase of THEORY_LEVELS.flatMap((level) => level.phases)) {
    const round = generateTheoryRound(phase, () => 0.999999);
    assert.ok(round.lowerMidi >= PIANO_MIN_MIDI);
    assert.ok(round.upperMidi <= PIANO_MAX_MIDI);
    assert.equal(
      round.upperMidi - round.lowerMidi,
      THEORY_INTERVAL_BY_ID[round.intervalId].semitones,
    );
  }
});

test("does not repeat the same note pair on consecutive rounds", () => {
  const phase = THEORY_PHASE_BY_ID["l1-seconds"];
  const first = generateTheoryRound(phase, () => 0);
  const second = generateTheoryRound(phase, () => 0, first);
  assert.notDeepEqual([second.lowerMidi, second.upperMidi], [first.lowerMidi, first.upperMidi]);
});

test("awards one hundred points per correct level five answer", () => {
  const phase = THEORY_LEVELS[4].phases[0];
  assert.equal(scoreForCorrectAnswers(phase, 15), 1500);
  assert.equal(phase.answerIntervalIds.length, 13);
});
