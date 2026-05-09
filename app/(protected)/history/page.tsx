"use client";

import { HistoryEmptyState } from "@/app/(protected)/history/components/history-empty-state";
import { HistoryList } from "@/app/(protected)/history/components/history-list";
import { HistoryStats } from "@/app/(protected)/history/components/history-stats";
import { useHistoryPageData } from "@/app/(protected)/history/hooks/use-history-page-data";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageShell } from "@/app/components/ui/page-shell";
import { SurfaceCard } from "@/app/components/ui/surface-card";

export default function HistoryPage() {
  const { error, history, loading, stats } = useHistoryPageData();

  if (loading) {
    return (
      <PageShell>
        <InlineStatus message="Loading history..." variant="muted" />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <SurfaceCard>
          <InlineStatus message={error} variant="error" />
        </SurfaceCard>
      </PageShell>
    );
  }

  if (history.length === 0 || !stats) {
    return (
      <PageShell width="2xl">
        <HistoryEmptyState />
      </PageShell>
    );
  }

  return (
    <PageShell className="space-y-6">
      <HistoryStats stats={stats} />
      <HistoryList history={history} />
    </PageShell>
  );
}
