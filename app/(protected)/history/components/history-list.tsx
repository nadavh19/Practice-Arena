import { PageHeading } from "@/app/components/ui/page-heading";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import type { SessionHistoryItem } from "@/lib/client/types";
import { HistoryListItem } from "./history-list-item";

type HistoryListProps = {
  history: SessionHistoryItem[];
};

export function HistoryList({ history }: HistoryListProps) {
  return (
    <SurfaceCard className="rounded-[2rem]">
      <PageHeading title="Session history" description="Open any session to revisit the full task list and feedback." />
      <ul className="mt-7 space-y-4">
        {history.map((session) => (
          <HistoryListItem key={session.id} session={session} />
        ))}
      </ul>
    </SurfaceCard>
  );
}
