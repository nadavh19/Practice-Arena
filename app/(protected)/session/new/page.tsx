"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { NewSessionForm } from "@/app/(protected)/session/new/components/new-session-form";
import { PageShell } from "@/app/components/ui/page-shell";
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
      availableTime: parsedAvailableTime,
      goal: goal.trim() ? goal.trim() : undefined,
      mood: mood.trim(),
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
    <PageShell width="2xl">
      <NewSessionForm
        availableTime={availableTime}
        error={error}
        goal={goal}
        mood={mood}
        onAvailableTimeChange={setAvailableTime}
        onGoalChange={setGoal}
        onMoodChange={setMood}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </PageShell>
  );
}
