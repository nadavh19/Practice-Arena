"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiGet, apiPost } from "@/lib/client/api-client";
import type { UserLevel, UserProfile } from "@/lib/client/types";

type ProfileFormState = {
  goals: string;
  level: UserLevel;
  nickname: string;
};

export function useProfileForm() {
  const [form, setForm] = useState<ProfileFormState>({
    goals: "",
    level: "beginner",
    nickname: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError(null);
      const result = await apiGet<UserProfile>("/api/profile");

      if (!active) {
        return;
      }

      setLoading(false);

      if (!result.success) {
        setError(result.error.message);
        return;
      }

      setForm({
        goals: result.data.goals,
        level: result.data.level,
        nickname: result.data.nickname ?? "",
      });
    }

    void loadProfile();

    return () => {
      active = false;
    };
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
      goals: form.goals.trim(),
      instrument: "guitar",
      level: form.level,
      nickname: nickname.length === 0 ? null : nickname,
    });
    setSaving(false);

    if (!result.success) {
      setError(result.error.message);
      return;
    }

    setSuccessMessage("Profile updated.");
  }

  return {
    error,
    form,
    handleSubmit,
    loading,
    saving,
    setForm,
    successMessage,
  };
}
