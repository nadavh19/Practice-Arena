"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppButton } from "@/app/components/ui/app-button";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageShell } from "@/app/components/ui/page-shell";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import { PianoSampler } from "@/lib/client/piano-sampler";
import {
  loadTheoryProgress,
  submitTheoryPhaseScore,
  usesLocalTheoryProgress,
} from "@/lib/client/theory-game-progress";
import {
  THEORY_INTERVAL_BY_ID,
  THEORY_LEVELS,
  scoreForCorrectAnswers,
  type IntervalId,
  type TheoryLevel,
  type TheoryPhase,
} from "@/lib/theory-game/definitions";
import type { TheoryGameProgress } from "@/lib/theory-game/progress";
import { generateTheoryRound, type TheoryRound } from "@/lib/theory-game/rounds";

type Screen = "levels" | "phases" | "playing" | "results";

export default function TheoryGamePage() {
  const samplerRef = useRef<PianoSampler | null>(null);
  const [screen, setScreen] = useState<Screen>("levels");
  const [progress, setProgress] = useState<TheoryGameProgress | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<TheoryLevel | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<TheoryPhase | null>(null);
  const [round, setRound] = useState<TheoryRound | null>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<IntervalId | null>(null);
  const [loading, setLoading] = useState(true);
  const [audioLoading, setAudioLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    samplerRef.current = new PianoSampler();
    let active = true;

    loadTheoryProgress()
      .then((data) => {
        if (active) setProgress(data);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : "Could not load game progress.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      samplerRef.current?.close();
    };
  }, []);

  const selectedLevelProgress = useMemo(
    () => progress?.levels.find((level) => level.id === selectedLevel?.id),
    [progress, selectedLevel],
  );

  async function playRoundNotes(nextRound: TheoryRound) {
    try {
      setError(null);
      await samplerRef.current?.play([nextRound.lowerMidi, nextRound.upperMidi]);
    } catch {
      setError("The piano could not play. Check the audio files and try again.");
    }
  }

  function openLevel(level: TheoryLevel) {
    setSelectedLevel(level);
    setScreen("phases");
    setError(null);
  }

  async function startPhase(phase: TheoryPhase) {
    setAudioLoading(true);
    setError(null);
    try {
      await samplerRef.current?.load();
      const firstRound = generateTheoryRound(phase);
      setSelectedPhase(phase);
      setRound(firstRound);
      setRoundIndex(0);
      setCorrectAnswers(0);
      setSelectedAnswer(null);
      setScreen("playing");
      await playRoundNotes(firstRound);
    } catch {
      setError("Piano samples could not be loaded. Please refresh and try again.");
    } finally {
      setAudioLoading(false);
    }
  }

  function chooseAnswer(intervalId: IntervalId) {
    if (!round || selectedAnswer) return;
    setSelectedAnswer(intervalId);
    if (intervalId === round.intervalId) setCorrectAnswers((count) => count + 1);
  }

  async function finishPhase() {
    if (!selectedLevel || !selectedPhase) return;
    setSaving(true);
    setError(null);
    try {
      const nextProgress = await submitTheoryPhaseScore({
        levelId: selectedLevel.id,
        phaseId: selectedPhase.id,
        correctAnswers,
      });
      setProgress(nextProgress);
      setScreen("results");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this score.");
    } finally {
      setSaving(false);
    }
  }

  async function nextRound() {
    if (!selectedPhase || !round) return;
    if (roundIndex + 1 >= selectedPhase.roundCount) {
      await finishPhase();
      return;
    }

    const next = generateTheoryRound(selectedPhase, Math.random, round);
    setRound(next);
    setRoundIndex((index) => index + 1);
    setSelectedAnswer(null);
    await playRoundNotes(next);
  }

  if (loading) {
    return <InlineStatus message="Tuning the theory arena..." variant="muted" />;
  }

  if (screen === "playing" && selectedLevel && selectedPhase && round) {
    const score = scoreForCorrectAnswers(selectedPhase, correctAnswers);
    return (
      <PageShell width="5xl" className="theory-game-reveal space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button className="text-sm font-semibold text-violet-900 hover:text-violet-700" onClick={() => setScreen("phases")}>
            ← Leave phase
          </button>
          <div className="rounded-full border border-violet-200 bg-white/90 px-4 py-2 text-sm font-semibold text-violet-950">
            Round {roundIndex + 1} / {selectedPhase.roundCount} · {score} points
          </div>
        </div>

        <SurfaceCard className="overflow-hidden p-0 sm:p-0">
          <div className="theory-stage px-6 py-9 text-center sm:px-10 sm:py-12">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">{selectedLevel.name}</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{selectedPhase.name}</h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-violet-100">
              Listen to the two hidden notes and identify their interval.
            </p>
            <div className="mx-auto mt-7 h-2 max-w-xl overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-amber-300 transition-[width] duration-500"
                style={{ width: `${((roundIndex + 1) / selectedPhase.roundCount) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-7 px-6 py-7 sm:px-10 sm:py-9">
            <div className="grid gap-3 sm:grid-cols-3">
              <AppButton variant="secondary" onClick={() => void playRoundNotes(round)}>♫ Replay together</AppButton>
              <AppButton variant="secondary" onClick={() => void samplerRef.current?.play([round.lowerMidi])}>Note 1</AppButton>
              <AppButton variant="secondary" onClick={() => void samplerRef.current?.play([round.upperMidi])}>Note 2</AppButton>
            </div>

            <div role="group" aria-label="Interval answers" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {selectedPhase.answerIntervalIds.map((intervalId) => {
                const interval = THEORY_INTERVAL_BY_ID[intervalId];
                const isCorrect = intervalId === round.intervalId;
                const isSelected = intervalId === selectedAnswer;
                const revealedCorrect = Boolean(selectedAnswer && isCorrect);
                const incorrectSelection = Boolean(isSelected && !isCorrect);
                return (
                  <button
                    key={intervalId}
                    type="button"
                    disabled={Boolean(selectedAnswer)}
                    onClick={() => chooseAnswer(intervalId)}
                    className={`theory-answer rounded-2xl border px-4 py-4 text-left transition-all duration-300 disabled:cursor-default disabled:opacity-100 ${
                      revealedCorrect
                        ? "border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200"
                        : incorrectSelection
                          ? "border-red-500 bg-red-50 text-red-950 ring-2 ring-red-200"
                          : "border-violet-200 bg-white text-violet-950 hover:-translate-y-0.5 hover:border-violet-400 hover:shadow-lg"
                    }`}
                  >
                    <span className="block text-xs font-bold uppercase tracking-[0.18em] opacity-60">{interval.shortLabel}</span>
                    <span className="mt-1 block font-semibold">{interval.label}</span>
                  </button>
                );
              })}
            </div>

            {selectedAnswer ? (
              <div className="theory-feedback flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-violet-50 p-4" aria-live="polite">
                <p className={`font-semibold ${selectedAnswer === round.intervalId ? "text-emerald-700" : "text-red-700"}`}>
                  {selectedAnswer === round.intervalId
                    ? `Correct — +${selectedPhase.pointsPerCorrect} points!`
                    : `Not this time. The answer is ${THEORY_INTERVAL_BY_ID[round.intervalId].label}.`}
                </p>
                <AppButton onClick={() => void nextRound()} disabled={saving}>
                  {saving ? "Saving..." : roundIndex + 1 === selectedPhase.roundCount ? "Finish phase" : "Next round"}
                </AppButton>
              </div>
            ) : null}
            {error ? <InlineStatus message={error} variant="error" /> : null}
          </div>
        </SurfaceCard>
      </PageShell>
    );
  }

  if (screen === "results" && selectedLevel && selectedPhase) {
    const score = scoreForCorrectAnswers(selectedPhase, correctAnswers);
    const best = progress?.levels
      .find((level) => level.id === selectedLevel.id)
      ?.phases.find((phase) => phase.id === selectedPhase.id)?.bestScore;
    return (
      <PageShell width="2xl" className="theory-game-reveal">
        <SurfaceCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-300 text-3xl shadow-lg">♪</div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-violet-600">Phase complete</p>
          <h1 className="mt-2 text-3xl font-semibold text-violet-950">{selectedPhase.name}</h1>
          <p className="mt-4 text-5xl font-bold tracking-tight text-violet-900">{score}</p>
          <p className="mt-1 text-sm text-violet-600">points · best {best ?? score} / {selectedPhase.maxScore}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <AppButton onClick={() => void startPhase(selectedPhase)} disabled={audioLoading}>
              {audioLoading ? "Loading piano..." : "Play again"}
            </AppButton>
            <AppButton variant="secondary" onClick={() => setScreen("phases")}>Back to phases</AppButton>
          </div>
        </SurfaceCard>
      </PageShell>
    );
  }

  if (screen === "phases" && selectedLevel) {
    return (
      <PageShell width="7xl" className="theory-game-reveal space-y-7">
        <div>
          <button className="text-sm font-semibold text-violet-900 hover:text-violet-700" onClick={() => setScreen("levels")}>
            ← All levels
          </button>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600">Interval arena</p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight text-violet-950">{selectedLevel.name}</h1>
              <p className="mt-2 text-violet-700">{selectedLevel.description}</p>
            </div>
            <div className="rounded-2xl border border-violet-200 bg-white/90 px-5 py-3 text-right">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-500">Level score</p>
              <p className="text-xl font-bold text-violet-950">{selectedLevelProgress?.score ?? 0} / {selectedLevel.maxScore}</p>
            </div>
          </div>
        </div>
        {error ? <InlineStatus message={error} variant="error" /> : null}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {selectedLevel.phases.map((phase, index) => {
            const phaseProgress = selectedLevelProgress?.phases.find((item) => item.id === phase.id);
            return (
              <SurfaceCard key={phase.id} className="theory-phase-card flex h-full flex-col p-5 sm:p-6" style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-500">Phase {index + 1}</p>
                    <h2 className="mt-2 text-xl font-semibold text-violet-950">{phase.name}</h2>
                  </div>
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900">{phase.roundCount} rounds</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-violet-700">{phase.description}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {phase.answerIntervalIds.map((id) => (
                    <span key={id} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800">
                      {THEORY_INTERVAL_BY_ID[id].shortLabel}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-end justify-between gap-3 pt-6">
                  <div>
                    <p className="text-xs text-violet-500">Best score</p>
                    <p className="font-bold text-violet-950">{phaseProgress?.bestScore ?? 0} / {phase.maxScore}</p>
                  </div>
                  <AppButton onClick={() => void startPhase(phase)} disabled={audioLoading}>
                    {audioLoading && selectedPhase?.id === phase.id ? "Loading..." : phaseProgress?.attempted ? "Replay" : "Play"}
                  </AppButton>
                </div>
              </SurfaceCard>
            );
          })}
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell width="7xl" className="theory-game-reveal space-y-8">
      <section className="theory-hero rounded-[2rem] px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-amber-300">Practice Arena · Ear Training</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Hear the distance. Name the interval.</h1>
        <p className="mt-4 max-w-2xl leading-7 text-violet-100">
          Train with hidden piano notes across four octaves. Every round changes the notes while your phase keeps one focused answer bank.
        </p>
        {usesLocalTheoryProgress ? (
          <p className="mt-5 inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-semibold text-amber-100">
            Local test mode · scores stay in this browser
          </p>
        ) : null}
      </section>

      {error ? <InlineStatus message={error} variant="error" /> : null}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {THEORY_LEVELS.map((level) => {
          const levelProgress = progress?.levels.find((item) => item.id === level.id);
          const percentage = level.maxScore ? ((levelProgress?.score ?? 0) / level.maxScore) * 100 : 0;
          return (
            <SurfaceCard key={level.id} className="theory-level-card flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-900 text-xl font-bold text-white">{level.id}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-violet-500">{level.phases.length} {level.phases.length === 1 ? "phase" : "phases"}</span>
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-violet-950">{level.name}</h2>
              <p className="mt-2 min-h-12 text-sm leading-6 text-violet-700">{level.description}</p>
              <div className="mt-6">
                <div className="flex justify-between text-xs font-semibold text-violet-600">
                  <span>{levelProgress?.score ?? 0} points</span>
                  <span>{level.maxScore} max</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-violet-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-700 to-amber-400 transition-[width] duration-500" style={{ width: `${percentage}%` }} />
                </div>
              </div>
              <div className="mt-auto flex items-center justify-between gap-4 pt-7">
                <p className="text-xs text-violet-500">{levelProgress?.attemptedPhases ?? 0} / {level.phases.length} attempted</p>
                <AppButton onClick={() => openLevel(level)}>Choose phase</AppButton>
              </div>
            </SurfaceCard>
          );
        })}
      </div>
    </PageShell>
  );
}
