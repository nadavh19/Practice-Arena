"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LevelsView } from "@/app/(protected)/theory-game/components/levels-view";
import { PhasesView } from "@/app/(protected)/theory-game/components/phases-view";
import { RoundsView } from "@/app/(protected)/theory-game/components/rounds-view";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PianoSampler } from "@/lib/client/piano-sampler";
import { loadTheoryProgress, submitTheoryPhaseScore } from "@/lib/client/theory-game-progress";
import {
  THEORY_LEVEL_BY_ID,
  THEORY_PHASE_BY_ID,
  scoreForCorrectAnswers,
  type IntervalId,
  type TheoryLevel,
  type TheoryLevelId,
  type TheoryPhase,
} from "@/lib/theory-game/definitions";
import type { TheoryGameProgress } from "@/lib/theory-game/progress";
import { generateTheoryRound, type TheoryRound } from "@/lib/theory-game/rounds";

type Screen = "levels" | "phases" | "playing" | "results";
type TheoryHistoryAction = "push" | "replace";
type TheoryHistoryDestination =
  | { screen: "levels" }
  | { screen: "phases"; level: TheoryLevel }
  | { screen: "playing" | "results"; level: TheoryLevel; phase: TheoryPhase };

const THEORY_GAME_PATH = "/theory-game";

function getLevelFromParam(value: string | null) {
  const levelId = Number(value);
  if (![1, 2, 3, 4, 5].includes(levelId)) return null;

  return THEORY_LEVEL_BY_ID[levelId as TheoryLevelId];
}

function buildTheoryGameUrl(destination: TheoryHistoryDestination) {
  const params = new URLSearchParams();

  if (destination.screen !== "levels") {
    params.set("level", String(destination.level.id));
  }

  if (destination.screen === "playing" || destination.screen === "results") {
    params.set("phase", destination.phase.id);
    params.set("mode", destination.screen);
  }

  const queryString = params.toString();
  return queryString ? `${THEORY_GAME_PATH}?${queryString}` : THEORY_GAME_PATH;
}

function readTheoryDestinationFromUrl(url: URL): TheoryHistoryDestination {
  const level = getLevelFromParam(url.searchParams.get("level"));
  if (!level) return { screen: "levels" };

  const phaseId = url.searchParams.get("phase");
  const phase = phaseId ? THEORY_PHASE_BY_ID[phaseId] : null;
  const hasMatchingPhase = phase && phase.levelId === level.id;
  const mode = url.searchParams.get("mode");

  if (hasMatchingPhase && (mode === "playing" || mode === "results")) {
    return { screen: mode, level, phase };
  }

  return { screen: "phases", level };
}

export default function TheoryGamePage() {
  const samplerRef = useRef<PianoSampler | null>(null);
  const screenRef = useRef<Screen>("levels");
  const selectedLevelRef = useRef<TheoryLevel | null>(null);
  const selectedPhaseRef = useRef<TheoryPhase | null>(null);
  const roundRef = useRef<TheoryRound | null>(null);
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

  screenRef.current = screen;
  selectedLevelRef.current = selectedLevel;
  selectedPhaseRef.current = selectedPhase;
  roundRef.current = round;

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

  useEffect(() => {
    function applyDestinationFromUrl(action: Extract<TheoryHistoryAction, "replace"> | null = null) {
      const destination = readTheoryDestinationFromUrl(new URL(window.location.href));
      const currentLevel = selectedLevelRef.current;
      const currentPhase = selectedPhaseRef.current;
      const destinationNeedsActiveSession = destination.screen === "playing" || destination.screen === "results";
      const hasActiveSession =
        destinationNeedsActiveSession &&
        currentLevel?.id === destination.level.id &&
        currentPhase?.id === destination.phase.id &&
        (destination.screen === "results" || Boolean(roundRef.current));

      if (destinationNeedsActiveSession && !hasActiveSession) {
        setSelectedLevel(destination.level);
        setSelectedPhase(null);
        setRound(null);
        setSelectedAnswer(null);
        setScreen("phases");
        window.history.replaceState(null, "", buildTheoryGameUrl({ screen: "phases", level: destination.level }));
        return;
      }

      setScreen(destination.screen);
      setError(null);

      if (destination.screen === "levels") {
        setSelectedLevel(null);
        setSelectedPhase(null);
        setRound(null);
        setSelectedAnswer(null);
      } else {
        setSelectedLevel(destination.level);
      }

      if (destination.screen === "playing" || destination.screen === "results") {
        setSelectedPhase(destination.phase);
      } else {
        setSelectedPhase(null);
        setRound(null);
        setSelectedAnswer(null);
      }

      if (action === "replace") {
        window.history.replaceState(null, "", buildTheoryGameUrl(destination));
      }
    }

    const handlePopState = () => applyDestinationFromUrl();

    applyDestinationFromUrl("replace");
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const selectedLevelProgress = useMemo(
    () => progress?.levels.find((level) => level.id === selectedLevel?.id),
    [progress, selectedLevel],
  );

  function navigateTheory(destination: TheoryHistoryDestination, action: TheoryHistoryAction = "push") {
    setScreen(destination.screen);
    setError(null);

    if (destination.screen === "levels") {
      setSelectedLevel(null);
      setSelectedPhase(null);
      setRound(null);
      setSelectedAnswer(null);
    } else {
      setSelectedLevel(destination.level);
    }

    if (destination.screen === "playing" || destination.screen === "results") {
      setSelectedPhase(destination.phase);
    } else {
      setSelectedPhase(null);
      setRound(null);
      setSelectedAnswer(null);
    }

    const url = buildTheoryGameUrl(destination);
    if (action === "push") {
      window.history.pushState(null, "", url);
    } else {
      window.history.replaceState(null, "", url);
    }
  }

  async function playRoundNotes(nextRound: TheoryRound) {
    try {
      setError(null);
      await samplerRef.current?.play([nextRound.lowerMidi, nextRound.upperMidi]);
    } catch {
      setError("The piano could not play. Check the audio files and try again.");
    }
  }

  function openLevel(level: TheoryLevel) {
    navigateTheory({ screen: "phases", level });
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
      navigateTheory(
        { screen: "playing", level: THEORY_LEVEL_BY_ID[phase.levelId], phase },
        screenRef.current === "results" ? "replace" : "push",
      );
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
      navigateTheory({ screen: "results", level: selectedLevel, phase: selectedPhase }, "replace");
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

  if ((screen === "playing" || screen === "results") && selectedLevel && selectedPhase) {
    const score = scoreForCorrectAnswers(selectedPhase, correctAnswers);
    const bestScore = progress?.levels
      .find((level) => level.id === selectedLevel.id)
      ?.phases.find((phase) => phase.id === selectedPhase.id)?.bestScore;

    return (
      <RoundsView
        screen={screen}
        level={selectedLevel}
        phase={selectedPhase}
        round={round}
        roundIndex={roundIndex}
        score={score}
        bestScore={bestScore}
        selectedAnswer={selectedAnswer}
        saving={saving}
        audioLoading={audioLoading}
        error={error}
        onLeavePhase={() => navigateTheory({ screen: "phases", level: selectedLevel }, "replace")}
        onPlayRoundNotes={(nextRound) => void playRoundNotes(nextRound)}
        onPlayNote={(midi) => void samplerRef.current?.play([midi])}
        onChooseAnswer={chooseAnswer}
        onNextRound={() => void nextRound()}
        onReplayPhase={() => void startPhase(selectedPhase)}
        onBackToPhases={() => navigateTheory({ screen: "phases", level: selectedLevel }, "replace")}
      />
    );
  }

  if (screen === "phases" && selectedLevel) {
    return (
      <PhasesView
        level={selectedLevel}
        levelProgress={selectedLevelProgress}
        error={error}
        audioLoading={audioLoading}
        selectedPhaseId={selectedPhase?.id ?? null}
        onBackToLevels={() => navigateTheory({ screen: "levels" }, "replace")}
        onStartPhase={(phase) => void startPhase(phase)}
      />
    );
  }

  return <LevelsView progress={progress} error={error} onOpenLevel={openLevel} />;
}
