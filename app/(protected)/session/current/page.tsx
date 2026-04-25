"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { apiGet, apiPost } from "@/lib/client/api-client";
import { clearCurrentSessionId, getCurrentSessionId } from "@/lib/client/session-storage";
import type { SessionHistoryItem } from "@/lib/client/types";

export default function CurrentSessionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<SessionHistoryItem | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [difficultyRating, setDifficultyRating] = useState("3");
  const [focusRating, setFocusRating] = useState("3");

  useEffect(() => {
    async function loadSession() {
      setLoading(true);
      setError(null);

      const currentSessionId = getCurrentSessionId();
      if (!currentSessionId) {
        router.replace("/session/new");
        return;
      }

      const historyResult = await apiGet<SessionHistoryItem[]>("/api/session/history");
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
  }, [router]);

  const selectedCount = useMemo(() => selectedTaskIds.length, [selectedTaskIds]);

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
    const completeResult = await apiPost<unknown>("/api/session/complete", {
      sessionId: session.id,
      difficultyRating: parsedDifficulty,
      focusRating: parsedFocus,
      completedTaskIds: selectedTaskIds,
    });
    setSubmitting(false);

    if (!completeResult.success) {
      setError(completeResult.error.message);
      return;
    }

    clearCurrentSessionId();
    router.push("/history");
  }

  if (loading) {
    return <p className="text-sm text-zinc-600">Loading current session...</p>;
  }

  if (!session) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-zinc-700">{error ?? "No current session found."}</p>
        <Link
          href="/session/new"
          className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Generate session
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Current practice plan</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Mood: <span className="font-medium">{session.mood}</span> • Time:{" "}
          <span className="font-medium">{session.availableTime} min</span>
        </p>
        {session.goal ? <p className="mt-2 text-sm text-zinc-700">Goal: {session.goal}</p> : null}
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <p className="mt-1 text-sm text-zinc-600">Mark completed tasks, then submit feedback below.</p>
        <ul className="mt-4 space-y-3">
          {session.tasks.map((item) => {
            const checked = selectedTaskIds.includes(item.taskId);
            return (
              <li key={item.taskId} className="rounded-lg border border-zinc-200 p-3">
                <label className="flex cursor-pointer gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      setSelectedTaskIds((prev) =>
                        prev.includes(item.taskId)
                          ? prev.filter((taskId) => taskId !== item.taskId)
                          : [...prev, item.taskId],
                      );
                    }}
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-medium text-zinc-900">{item.task.name}</span>
                    <span className="block text-xs text-zinc-600">
                      {item.task.category} • {item.task.duration} min • {item.task.difficulty}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 text-xs text-zinc-600">{selectedCount} task(s) selected as completed.</p>
      </div>

      <form className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm" onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold">Session feedback</h2>
        <p className="mt-1 text-sm text-zinc-600">Rate difficulty and focus from 1 to 5.</p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm text-zinc-700">Difficulty rating</span>
            <input
              type="number"
              min={1}
              max={5}
              value={difficultyRating}
              onChange={(event) => setDifficultyRating(event.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm text-zinc-700">Focus rating</span>
            <input
              type="number"
              min={1}
              max={5}
              value={focusRating}
              onChange={(event) => setFocusRating(event.target.value)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <button
          disabled={submitting}
          type="submit"
          className="mt-5 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit feedback and finish"}
        </button>

        {error ? <p className="mt-4 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
      </form>
    </section>
  );
}
