"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/app/auth/components/login-form";
import { SignupForm } from "@/app/auth/components/signup-form";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageHeading } from "@/app/components/ui/page-heading";
import { PageShell } from "@/app/components/ui/page-shell";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import { apiPost } from "@/lib/client/api-client";
import { getToken, setToken } from "@/lib/client/auth-storage";
import type { AuthResponse, UserLevel } from "@/lib/client/types";

type Mode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [level, setLevel] = useState<UserLevel>("beginner");
  const [goals, setGoals] = useState("");

  useEffect(() => {
    if (getToken()) {
      router.replace("/profile");
    }
  }, [router]);

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await apiPost<AuthResponse>("/api/auth/login", {
      email: loginEmail,
      password: loginPassword,
    });

    setSubmitting(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }

    setToken(result.data.token);
    router.push("/profile");
  }

  async function handleSignupSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await apiPost<AuthResponse>("/api/auth/signup", {
      email: signupEmail,
      goals,
      instrument: "guitar",
      level,
      password: signupPassword,
    });

    setSubmitting(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }

    setToken(result.data.token);
    router.push("/profile");
  }

  return (
    <PageShell as="main" width="md" fullHeight className="flex flex-col justify-center px-6 py-10">
      <SurfaceCard>
        <PageHeading title="Practice Arena" description="Sign in or create an account to start a session." />

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-lg bg-zinc-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`rounded-md px-3 py-2 text-sm ${mode === "login" ? "bg-white shadow" : "text-zinc-600"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`rounded-md px-3 py-2 text-sm ${mode === "signup" ? "bg-white shadow" : "text-zinc-600"}`}
          >
            Sign up
          </button>
        </div>

        {mode === "login" ? (
          <LoginForm
            email={loginEmail}
            onEmailChange={setLoginEmail}
            onPasswordChange={setLoginPassword}
            onSubmit={handleLoginSubmit}
            password={loginPassword}
            submitting={submitting}
          />
        ) : (
          <SignupForm
            email={signupEmail}
            goals={goals}
            level={level}
            onEmailChange={setSignupEmail}
            onGoalsChange={setGoals}
            onLevelChange={setLevel}
            onPasswordChange={setSignupPassword}
            onSubmit={handleSignupSubmit}
            password={signupPassword}
            submitting={submitting}
          />
        )}

        {error ? <InlineStatus message={error} variant="error" className="mt-4" /> : null}
      </SurfaceCard>
    </PageShell>
  );
}
