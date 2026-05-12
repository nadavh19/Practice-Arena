import { PageHeading } from "@/app/components/ui/page-heading";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import type { SessionHistoryItem } from "@/lib/client/types";

type CurrentSessionSummaryProps = {
  session: SessionHistoryItem;
};

export function CurrentSessionSummary({ session }: CurrentSessionSummaryProps) {
  return (
    <SurfaceCard className="overflow-hidden p-0">
      <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <PageHeading
          title="Current practice plan"
          description={session.goal ? `Goal: ${session.goal}` : "Work through the tasks, mark what you complete, then submit feedback."}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:justify-self-end">
          <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200/70">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Mood</p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-zinc-950">{session.mood}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4 ring-1 ring-emerald-200/70">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Time</p>
            <p className="mt-2 font-mono text-lg font-semibold tracking-tight text-emerald-950">
              {session.availableTime} min
            </p>
          </div>
        </div>
      </div>
    </SurfaceCard>
  );
}
