"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { apiPost } from "@/lib/client/api-client";
import { setCurrentSessionId } from "@/lib/client/session-storage";
import type { GenerateSessionResponse } from "@/lib/client/types";

export default function NewSessionPage() {
  const router = useRouter();
  const [mood, setMood] = useState("");
  const [availableTime, setAvailableTime] = useState("30");
  const [goal, setGoal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsedAvailableTime = Number.parseInt(availableTime, 10);
    if (!Number.isFinite(parsedAvailableTime) || parsedAvailableTime < 5 || parsedAvailableTime > 240) {
      setError("Available time must be a number between 5 and 240 minutes.");
      return;
    }

    if (!mood.trim()) {
      setError("Mood is required.");
      return;
    }

    setSubmitting(true);
    const result = await apiPost<GenerateSessionResponse>("/api/session/generate", {
      mood: mood.trim(),
      availableTime: parsedAvailableTime,
      goal: goal.trim() ? goal.trim() : undefined,
    });
    setSubmitting(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }

    setCurrentSessionId(result.data.session.id);
    router.push("/session/current");
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Session context</h1>
      <p className="mt-1 text-sm text-zinc-600">Set your state and we will generate your next practice plan.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm text-zinc-700">Mood</span>
          <input
            required
            value={mood}
            onChange={(event) => setMood(event.target.value)}
            placeholder="Focused, tired, energized..."
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm text-zinc-700">Available time (minutes)</span>
          <input
            required
            min={5}
            max={240}
            type="number"
            value={availableTime}
            onChange={(event) => setAvailableTime(event.target.value)}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <span className="text-sm text-zinc-700">Goal / focus (optional)</span>
          <textarea
            value={goal}
            onChange={(event) => setGoal(event.target.value)}
            className="mt-1 min-h-20 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <button
          disabled={submitting}
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {submitting ? "Generating..." : "Generate practice plan"}
        </button>
      </form>

      {error ? <p className="mt-4 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
    </section>
  );
}
