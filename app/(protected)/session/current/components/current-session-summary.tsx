import { SurfaceCard } from "@/app/components/ui/surface-card";
import type { SessionHistoryItem } from "@/lib/client/types";

type CurrentSessionSummaryProps = {
  session: SessionHistoryItem;
};

export function CurrentSessionSummary({ session }: CurrentSessionSummaryProps) {
  return (
    <SurfaceCard className="music-accent-panel overflow-hidden border-slate-800/70 p-0 shadow-[0_28px_80px_-48px_rgba(2,6,23,0.9)]">
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <header className="max-w-[65ch]">
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-white">Current practice plan</h1>
          <p className="mt-2 text-sm leading-6 text-slate-200">
            {session.goal ? `Goal: ${session.goal}` : "Work through the tasks, mark what you complete, then submit feedback."}
          </p>
        </header>
        <div className="grid gap-3 sm:grid-cols-2 lg:justify-self-end">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">Mood</p>
            <p className="mt-2 text-lg font-semibold tracking-tight">{session.mood}</p>
          </div>
          <div className="rounded-2xl border border-emerald-300/25 bg-emerald-300/15 p-4 text-emerald-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-100">Time</p>
            <p className="mt-2 font-mono text-lg font-semibold tracking-tight">
              {session.availableTime} min
            </p>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
