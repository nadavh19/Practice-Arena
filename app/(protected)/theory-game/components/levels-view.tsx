import { AppButton } from "@/app/components/ui/app-button";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageShell } from "@/app/components/ui/page-shell";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import { usesLocalTheoryProgress } from "@/lib/client/theory-game-progress";
import { THEORY_LEVELS, type TheoryLevel } from "@/lib/theory-game/definitions";
import type { TheoryGameProgress } from "@/lib/theory-game/progress";

type LevelsViewProps = {
  progress: TheoryGameProgress | null;
  error: string | null;
  onOpenLevel: (level: TheoryLevel) => void;
};

export function LevelsView({ progress, error, onOpenLevel }: LevelsViewProps) {
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
                <AppButton onClick={() => onOpenLevel(level)}>Choose phase</AppButton>
              </div>
            </SurfaceCard>
          );
        })}
      </div>
    </PageShell>
  );
}
