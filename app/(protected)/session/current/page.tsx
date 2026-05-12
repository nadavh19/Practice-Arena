"use client";

import { CurrentSessionEmptyState } from "@/app/(protected)/session/current/components/current-session-empty-state";
import { CurrentSessionFeedbackForm } from "@/app/(protected)/session/current/components/current-session-feedback-form";
import { CurrentSessionSummary } from "@/app/(protected)/session/current/components/current-session-summary";
import { CurrentSessionTasks } from "@/app/(protected)/session/current/components/current-session-tasks";
import { useCurrentSession } from "@/app/(protected)/session/current/hooks/use-current-session";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageShell } from "@/app/components/ui/page-shell";

export default function CurrentSessionPage() {
  const {
    difficultyRating,
    error,
    focusRating,
    handleSubmit,
    loading,
    selectedCount,
    selectedTaskIds,
    session,
    setDifficultyRating,
    setFocusRating,
    submitting,
    toggleTask,
  } = useCurrentSession();

  if (loading) {
    return (
      <PageShell width="7xl">
        <InlineStatus message="Loading current session..." variant="muted" />
      </PageShell>
    );
  }

  if (!session) {
    return (
      <PageShell width="7xl">
        <CurrentSessionEmptyState error={error} />
      </PageShell>
    );
  }

  return (
    <PageShell width="7xl" className="page-section-reveal space-y-8">
      <CurrentSessionSummary session={session} />
      <CurrentSessionTasks
        onToggleTask={toggleTask}
        selectedCount={selectedCount}
        selectedTaskIds={selectedTaskIds}
        session={session}
      />
      <CurrentSessionFeedbackForm
        difficultyRating={difficultyRating}
        error={error}
        focusRating={focusRating}
        onDifficultyRatingChange={setDifficultyRating}
        onFocusRatingChange={setFocusRating}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </PageShell>
  );
}
