"use client";

import { useEffect, useState, type FormEvent } from "react";
import Image from "next/image";
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
    <PageShell
      as="main"
      width="7xl"
      fullHeight
      className="auth-image-shell grid items-center gap-8 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:py-16"
    >
      <section className="page-section-reveal max-w-2xl space-y-8 lg:pl-[6vw]">
        <div className="space-y-5">
          <div className="w-fit rounded-[1.35rem] border border-white/70 bg-white/95 px-4 py-3 shadow-[0_24px_60px_-38px_rgba(2,6,23,0.8),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur">
            <Image
              src="/brand/main-pic.png"
              alt="Practice Arena"
              width={360}
              height={118}
              priority
              className="h-12 w-auto object-contain sm:h-16"
            />
          </div>
          <h1 className="max-w-[10ch] text-5xl font-semibold leading-none tracking-tight text-white md:text-6xl">
            Build a better practice habit.
          </h1>
          <p className="max-w-[58ch] text-base leading-7 text-slate-200">
            Generate focused guitar sessions, track what you actually finished, and keep every exercise readable with
            tabs, chords, tempo, key, and song context.
          </p>
        </div>
        <div className="grid max-w-xl gap-3 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-white/15 bg-white/10 p-5 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur">
            <p className="font-mono text-3xl font-semibold tracking-tight">30</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">minutes can become a structured plan instead of a guess.</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/15 bg-slate-950/70 p-5 text-zinc-50 shadow-[0_24px_50px_-34px_rgba(15,23,42,0.7)] backdrop-blur">
            <p className="text-sm font-semibold tracking-tight">Focus loop</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Context, tasks, feedback, then sharper sessions.</p>
          </div>
        </div>
      </section>

      <SurfaceCard className="page-section-reveal mx-auto w-full max-w-md border-white/70 bg-white/95 p-5 shadow-[0_28px_70px_-40px_rgba(2,6,23,0.8)] backdrop-blur sm:p-7">
        <PageHeading title={mode === "login" ? "Welcome back" : "Create your account"} description="Sign in or create an account to start a session." />

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-full border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setError(null);
            }}
            className={`rounded-full px-3 py-2 text-sm font-semibold transition-[background-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] ${
              mode === "login" ? "bg-white text-zinc-950 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.7)]" : "text-slate-600 hover:text-zinc-950"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError(null);
            }}
            className={`rounded-full px-3 py-2 text-sm font-semibold transition-[background-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] ${
              mode === "signup" ? "bg-white text-zinc-950 shadow-[0_10px_24px_-20px_rgba(15,23,42,0.7)]" : "text-slate-600 hover:text-zinc-950"
            }`}
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
