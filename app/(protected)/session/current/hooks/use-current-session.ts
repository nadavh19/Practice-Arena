"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/client/api-client";
import { clearCurrentSessionId, getCurrentSessionId } from "@/lib/client/session-storage";
import type { SessionHistoryItem } from "@/lib/client/types";

export function useCurrentSession() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionHistoryItem | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [difficultyRating, setDifficultyRating] = useState("3");
  const [focusRating, setFocusRating] = useState("3");

  useEffect(() => {
    let active = true;

    async function loadSession() {
      setLoading(true);
      setError(null);

      const currentSessionId = getCurrentSessionId();
      if (!currentSessionId) {
        router.replace("/session/new");
        return;
      }

      const historyResult = await apiGet<SessionHistoryItem[]>("/api/session/history");

      if (!active) {
        return;
      }

      setLoading(false);

      if (!historyResult.success) {
        setError(historyResult.error.message);
        return;
      }

      const current = historyResult.data.find((item) => item.id === currentSessionId);
      if (!current) {
        setError("Current session was not found. Generate a new one.");
        return;
      }

      setSession(current);
    }

    void loadSession();

    return () => {
      active = false;
    };
  }, [router]);

  function toggleTask(taskId: string) {
    setSelectedTaskIds((current) =>
      current.includes(taskId) ? current.filter((item) => item !== taskId) : [...current, taskId],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!session) {
      setError("No session loaded.");
      return;
    }

    const parsedDifficulty = Number.parseInt(difficultyRating, 10);
    const parsedFocus = Number.parseInt(focusRating, 10);

    if (parsedDifficulty < 1 || parsedDifficulty > 5 || parsedFocus < 1 || parsedFocus > 5) {
      setError("Ratings must be between 1 and 5.");
      return;
    }

    setSubmitting(true);
    const result = await apiPost<unknown>("/api/session/complete", {
      completedTaskIds: selectedTaskIds,
      difficultyRating: parsedDifficulty,
      focusRating: parsedFocus,
      sessionId: session.id,
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }

    clearCurrentSessionId();
    router.push("/history");
  }

  return {
    difficultyRating,
    error,
    focusRating,
    handleSubmit,
    loading,
    selectedCount: selectedTaskIds.length,
    selectedTaskIds,
    session,
    setDifficultyRating,
    setFocusRating,
    submitting,
    toggleTask,
  };
}
