"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiGet, apiPost } from "@/lib/client/api-client";
import type { SessionStats, UserLevel, UserProfile } from "@/lib/client/types";

type ProfileFormState = {
  goals: string;
  level: UserLevel;
  nickname: string;
};

type ProfileMode = "edit" | "view";

function getProfileFormState(profile: UserProfile): ProfileFormState {
  return {
    goals: profile.goals,
    level: profile.level,
    nickname: profile.nickname ?? "",
  };
}

function isProfileComplete(profile: UserProfile) {
  return profile.goals.trim().length > 0;
}

export function useProfileForm() {
  const [form, setForm] = useState<ProfileFormState>({
    goals: "",
    level: "beginner",
    nickname: "",
  });
  const [mode, setMode] = useState<ProfileMode>("view");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError(null);
      const [profileResult, statsResult] = await Promise.all([
        apiGet<UserProfile>("/api/profile"),
        apiGet<SessionStats>("/api/session/stats"),
      ]);

      if (!active) {
        return;
      }

      setLoading(false);

      if (!profileResult.success) {
        setError(profileResult.error.message);
        return;
      }

      if (!statsResult.success) {
        setError(statsResult.error.message);
        return;
      }

      setProfile(profileResult.data);
      setStats(statsResult.data);
      setForm(getProfileFormState(profileResult.data));
      setMode(isProfileComplete(profileResult.data) ? "view" : "edit");
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

    setProfile(result.data);
    setForm(getProfileFormState(result.data));
    setMode("view");
    setSuccessMessage("Profile updated.");
  }

  function startEditing() {
    if (profile) {
      setForm(getProfileFormState(profile));
    }

    setSuccessMessage(null);
    setError(null);
    setMode("edit");
  }

  function cancelEditing() {
    if (!profile || !isProfileComplete(profile)) {
      return;
    }

    setForm(getProfileFormState(profile));
    setSuccessMessage(null);
    setError(null);
    setMode("view");
  }

  return {
    cancelEditing,
    error,
    form,
    handleSubmit,
    loading,
    mode,
    profile,
    saving,
    setForm,
    startEditing,
    stats,
    successMessage,
  };
}
