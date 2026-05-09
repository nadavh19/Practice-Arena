import { PageHeading } from "@/app/components/ui/page-heading";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import type { SessionHistoryItem } from "@/lib/client/types";
import { HistoryListItem } from "./history-list-item";

type HistoryListProps = {
  history: SessionHistoryItem[];
};

export function HistoryList({ history }: HistoryListProps) {
  return (
    <SurfaceCard>
      <PageHeading title="Session history" />
      <ul className="mt-5 space-y-4">
        {history.map((session) => (
          <HistoryListItem key={session.id} session={session} />
        ))}
      </ul>
    </SurfaceCard>
  );
}
