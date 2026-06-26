import { AppButton } from "@/app/components/ui/app-button";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageShell } from "@/app/components/ui/page-shell";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import { THEORY_INTERVAL_BY_ID, type TheoryLevel, type TheoryPhase } from "@/lib/theory-game/definitions";
import type { TheoryLevelProgress } from "@/lib/theory-game/progress";

type PhasesViewProps = {
  level: TheoryLevel;
  levelProgress: TheoryLevelProgress | undefined;
  error: string | null;
  audioLoading: boolean;
  selectedPhaseId: string | null;
  onBackToLevels: () => void;
  onStartPhase: (phase: TheoryPhase) => void;
};

export function PhasesView({
  level,
  levelProgress,
  error,
  audioLoading,
  selectedPhaseId,
  onBackToLevels,
  onStartPhase,
}: PhasesViewProps) {
  return (
    <PageShell width="7xl" className="theory-game-reveal space-y-7">
      <div>
        <button className="text-sm font-semibold text-violet-900 hover:text-violet-700" onClick={onBackToLevels}>
          ← All levels
        </button>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-600">Interval arena</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-violet-950">{level.name}</h1>
            <p className="mt-2 text-violet-700">{level.description}</p>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-white/90 px-5 py-3 text-right">
            <p className="text-xs font-bold uppercase tracking-wider text-violet-500">Level score</p>
            <p className="text-xl font-bold text-violet-950">{levelProgress?.score ?? 0} / {level.maxScore}</p>
          </div>
        </div>
      </div>
      {error ? <InlineStatus message={error} variant="error" /> : null}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {level.phases.map((phase, index) => {
          const phaseProgress = levelProgress?.phases.find((item) => item.id === phase.id);
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
                <AppButton onClick={() => onStartPhase(phase)} disabled={audioLoading}>
                  {audioLoading && selectedPhaseId === phase.id ? "Loading..." : phaseProgress?.attempted ? "Replay" : "Play"}
                </AppButton>
              </div>
            </SurfaceCard>
          );
        })}
      </div>
    </PageShell>
  );
}
