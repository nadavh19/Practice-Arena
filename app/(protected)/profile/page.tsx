"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { apiGet, apiPost } from "@/lib/client/api-client";
import type { UserLevel, UserProfile } from "@/lib/client/types";

const levels: UserLevel[] = ["beginner", "intermediate", "advanced"];

type FormState = {
  nickname: string;
  level: UserLevel;
  goals: string;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    nickname: "",
    level: "beginner",
    goals: "",
  });

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setError(null);
      const result = await apiGet<UserProfile>("/api/profile");
      setLoading(false);

      if (!result.success) {
        setError(result.error.message);
        return;
      }

      setForm({
        nickname: result.data.nickname ?? "",
        level: result.data.level,
        goals: result.data.goals,
      });
    }

    void loadProfile();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSuccessMessage(null);
    setError(null);

    if (!form.goals.trim()) {
      setError("Goals are required.");
      return;
    }

    const nickname = form.nickname.trim();
    if (nickname.length > 0 && nickname.length < 2) {
      setError("Nickname must be at least 2 characters if provided.");
      return;
    }

    setSaving(true);
    const result = await apiPost<UserProfile>("/api/profile", {
      nickname: nickname.length === 0 ? null : nickname,
      instrument: "guitar",
      level: form.level,
      goals: form.goals.trim(),
    });
    setSaving(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }

    setSuccessMessage("Profile updated.");
  }

  if (loading) {
    return <p className="text-sm text-zinc-600">Loading profile...</p>;
  }

  return (
    <section className="mx-auto w-full max-w-2xl rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Profile setup</h1>
      <p className="mt-1 text-sm text-zinc-600">Keep this updated to personalize practice sessions.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="text-sm text-zinc-700">Nickname (optional)</span>
          <input
            value={form.nickname}
            onChange={(event) => setForm((prev) => ({ ...prev, nickname: event.target.value }))}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2">
          <p className="text-xs text-zinc-500">Instrument</p>
          <p className="text-sm font-medium text-zinc-900">Guitar</p>
        </div>

        <label className="block">
          <span className="text-sm text-zinc-700">Level</span>
          <select
            value={form.level}
            onChange={(event) => setForm((prev) => ({ ...prev, level: event.target.value as UserLevel }))}
            className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            {levels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm text-zinc-700">Goals</span>
          <textarea
            required
            value={form.goals}
            onChange={(event) => setForm((prev) => ({ ...prev, goals: event.target.value }))}
            className="mt-1 min-h-24 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            disabled={saving}
            type="submit"
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
          <Link
            href="/session/new"
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Continue to context
          </Link>
        </div>
      </form>

      {error ? <p className="mt-4 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
      {successMessage ? (
        <p className="mt-4 rounded-md bg-green-50 p-2 text-sm text-green-700">{successMessage}</p>
      ) : null}
    </section>
  );
}
