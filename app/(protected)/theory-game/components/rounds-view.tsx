import { AppButton } from "@/app/components/ui/app-button";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageShell } from "@/app/components/ui/page-shell";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import { THEORY_INTERVAL_BY_ID, type IntervalId, type TheoryLevel, type TheoryPhase } from "@/lib/theory-game/definitions";
import type { TheoryRound } from "@/lib/theory-game/rounds";

type RoundsViewProps = {
  screen: "playing" | "results";
  level: TheoryLevel;
  phase: TheoryPhase;
  round: TheoryRound | null;
  roundIndex: number;
  score: number;
  bestScore: number | undefined;
  selectedAnswer: IntervalId | null;
  saving: boolean;
  audioLoading: boolean;
  error: string | null;
  onLeavePhase: () => void;
  onPlayRoundNotes: (round: TheoryRound) => void;
  onPlayNote: (midi: number) => void;
  onChooseAnswer: (intervalId: IntervalId) => void;
  onNextRound: () => void;
  onReplayPhase: () => void;
  onBackToPhases: () => void;
};

export function RoundsView({
  screen,
  level,
  phase,
  round,
  roundIndex,
  score,
  bestScore,
  selectedAnswer,
  saving,
  audioLoading,
  error,
  onLeavePhase,
  onPlayRoundNotes,
  onPlayNote,
  onChooseAnswer,
  onNextRound,
  onReplayPhase,
  onBackToPhases,
}: RoundsViewProps) {
  if (screen === "results") {
    return (
      <PageShell width="2xl" className="theory-game-reveal">
        <SurfaceCard className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-300 text-3xl shadow-lg">♪</div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.22em] text-violet-600">Phase complete</p>
          <h1 className="mt-2 text-3xl font-semibold text-violet-950">{phase.name}</h1>
          <p className="mt-4 text-5xl font-bold tracking-tight text-violet-900">{score}</p>
          <p className="mt-1 text-sm text-violet-600">points · best {bestScore ?? score} / {phase.maxScore}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <AppButton onClick={onReplayPhase} disabled={audioLoading}>
              {audioLoading ? "Loading piano..." : "Play again"}
            </AppButton>
            <AppButton variant="secondary" onClick={onBackToPhases}>Back to phases</AppButton>
          </div>
        </SurfaceCard>
      </PageShell>
    );
  }

  if (!round) return null;

  return (
    <PageShell width="5xl" className="theory-game-reveal space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button className="text-sm font-semibold text-violet-900 hover:text-violet-700" onClick={onLeavePhase}>
          ← Leave phase
        </button>
        <div className="rounded-full border border-violet-200 bg-white/90 px-4 py-2 text-sm font-semibold text-violet-950">
          Round {roundIndex + 1} / {phase.roundCount} · {score} points
        </div>
      </div>

      <SurfaceCard className="overflow-hidden p-0 sm:p-0">
        <div className="theory-stage px-6 py-9 text-center sm:px-10 sm:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">{level.name}</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{phase.name}</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-violet-100">
            Listen to the two hidden notes and identify their interval.
          </p>
          <div className="mx-auto mt-7 h-2 max-w-xl overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-amber-300 transition-[width] duration-500"
              style={{ width: `${((roundIndex + 1) / phase.roundCount) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-7 px-6 py-7 sm:px-10 sm:py-9">
          <div className="grid gap-3 sm:grid-cols-3">
            <AppButton variant="secondary" onClick={() => onPlayRoundNotes(round)}>♫ Replay together</AppButton>
            <AppButton variant="secondary" onClick={() => onPlayNote(round.lowerMidi)}>Note 1</AppButton>
            <AppButton variant="secondary" onClick={() => onPlayNote(round.upperMidi)}>Note 2</AppButton>
          </div>

          {selectedAnswer ? (
            <div className="flex justify-center">
              <AppButton className="w-full sm:w-auto sm:min-w-44" onClick={onNextRound} disabled={saving}>
                {saving ? "Saving..." : roundIndex + 1 === phase.roundCount ? "Finish phase" : "Next round"}
              </AppButton>
            </div>
          ) : null}

          <div role="group" aria-label="Interval answers" className="grid grid-cols-3 gap-2 sm:gap-3">
            {phase.answerIntervalIds.map((intervalId) => {
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
                  onClick={() => onChooseAnswer(intervalId)}
                  className={`theory-answer min-w-0 rounded-2xl border px-2 py-3 text-center transition-all duration-300 disabled:cursor-default disabled:opacity-100 sm:px-4 sm:py-4 sm:text-left ${
                    revealedCorrect
                      ? "border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-200"
                      : incorrectSelection
                        ? "border-red-500 bg-red-50 text-red-950 ring-2 ring-red-200"
                        : "border-violet-200 bg-white text-violet-950 hover:-translate-y-0.5 hover:border-violet-400 hover:shadow-lg"
                  }`}
                >
                  <span className="block text-[0.68rem] font-bold uppercase leading-none tracking-[0.12em] opacity-60 sm:text-xs sm:tracking-[0.18em]">{interval.shortLabel}</span>
                  <span className="mt-1 block break-words text-xs font-semibold leading-tight sm:text-base">{interval.label}</span>
                </button>
              );
            })}
          </div>

          {selectedAnswer ? (
            <div className="theory-feedback rounded-2xl bg-violet-50 p-4 text-center sm:text-left" aria-live="polite">
              <p className={`font-semibold ${selectedAnswer === round.intervalId ? "text-emerald-700" : "text-red-700"}`}>
                {selectedAnswer === round.intervalId
                  ? `Correct — +${phase.pointsPerCorrect} points!`
                  : `Not this time. The answer is ${THEORY_INTERVAL_BY_ID[round.intervalId].label}.`}
              </p>
            </div>
          ) : null}
          {error ? <InlineStatus message={error} variant="error" /> : null}
        </div>
      </SurfaceCard>
    </PageShell>
  );
}
