import { PageHeading } from "@/app/components/ui/page-heading";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import type { SessionHistoryItem } from "@/lib/client/types";

type CurrentSessionSummaryProps = {
  session: SessionHistoryItem;
};

export function CurrentSessionSummary({ session }: CurrentSessionSummaryProps) {
  return (
    <SurfaceCard>
      <PageHeading title="Current practice plan" />
      <p className="mt-1 text-sm text-zinc-600">
        Mood: <span className="font-medium">{session.mood}</span> | Time:{" "}
        <span className="font-medium">{session.availableTime} min</span>
      </p>
      {session.goal ? <p className="mt-2 text-sm text-zinc-700">Goal: {session.goal}</p> : null}
    </SurfaceCard>
  );
}
