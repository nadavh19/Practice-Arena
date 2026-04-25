"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/client/api-client";
import type { SessionHistoryItem, SessionStats } from "@/lib/client/types";

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SessionHistoryItem[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      const [historyResult, statsResult] = await Promise.all([
        apiGet<SessionHistoryItem[]>("/api/session/history"),
        apiGet<SessionStats>("/api/session/stats"),
      ]);

      setLoading(false);

      if (!historyResult.success) {
        setError(historyResult.error.message);
        return;
      }

      if (!statsResult.success) {
        setError(statsResult.error.message);
        return;
      }

      setHistory(historyResult.data);
      setStats(statsResult.data);
    }

    void loadData();
  }, []);

  const completionRatePercentage = useMemo(() => {
    if (!stats) {
      return 0;
    }

    return Math.round(stats.completionRate * 100);
  }, [stats]);

  if (loading) {
    return <p className="text-sm text-zinc-600">Loading history...</p>;
  }

  if (error) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-red-700">{error}</p>
      </section>
    );
  }

  if (history.length === 0 || !stats) {
    return (
      <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="mt-2 text-sm text-zinc-600">No sessions completed yet. Start your first session.</p>
        <Link
          href="/session/new"
          className="mt-4 inline-block rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white"
        >
          Create session
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sessions" value={String(stats.sessionCount)} />
        <StatCard label="Avg focus" value={stats.avgFocusRating.toFixed(2)} />
        <StatCard label="Avg difficulty" value={stats.avgDifficultyRating.toFixed(2)} />
        <StatCard label="Completion rate" value={`${completionRatePercentage}%`} />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Session history</h1>
        <ul className="mt-5 space-y-4">
          {history.map((session) => {
            const completedCount = session.tasks.filter((task) => task.completed).length;
            return (
              <li key={session.id} className="rounded-lg border border-zinc-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">
                      {new Date(session.createdAt).toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-600">
                      Mood: {session.mood} • Time: {session.availableTime} min
                    </p>
                    {session.goal ? <p className="mt-1 text-xs text-zinc-600">Goal: {session.goal}</p> : null}
                  </div>
                  <p className="text-xs font-medium text-zinc-700">
                    {completedCount}/{session.tasks.length} tasks completed
                  </p>
                </div>
                {session.feedback ? (
                  <p className="mt-2 text-xs text-zinc-700">
                    Feedback: difficulty {session.feedback.difficultyRating}/5, focus{" "}
                    {session.feedback.focusRating}/5
                  </p>
                ) : (
                  <p className="mt-2 text-xs text-zinc-500">No feedback submitted.</p>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-900">{value}</p>
    </article>
  );
}
