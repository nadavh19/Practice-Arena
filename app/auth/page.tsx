"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/client/api-client";
import { getToken, setToken } from "@/lib/client/auth-storage";
import type { AuthResponse, UserLevel } from "@/lib/client/types";

type Mode = "login" | "signup";

const levels: UserLevel[] = ["beginner", "intermediate", "advanced"];

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
      password: signupPassword,
      instrument: "guitar",
      level,
      goals,
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
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-10">
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Practice Arena</h1>
        <p className="mt-1 text-sm text-zinc-600">Sign in or create an account to start a session.</p>

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
          <form className="mt-5 space-y-3" onSubmit={handleLoginSubmit}>
            <label className="block">
              <span className="text-sm text-zinc-700">Email</span>
              <input
                required
                type="email"
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm text-zinc-700">Password</span>
              <input
                required
                minLength={8}
                maxLength={100}
                type="password"
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </label>
            <button
              disabled={submitting}
              type="submit"
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form className="mt-5 space-y-3" onSubmit={handleSignupSubmit}>
            <label className="block">
              <span className="text-sm text-zinc-700">Email</span>
              <input
                required
                type="email"
                value={signupEmail}
                onChange={(event) => setSignupEmail(event.target.value)}
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-sm text-zinc-700">Password</span>
              <input
                required
                minLength={8}
                maxLength={100}
                type="password"
                value={signupPassword}
                onChange={(event) => setSignupPassword(event.target.value)}
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
                value={level}
                onChange={(event) => setLevel(event.target.value as UserLevel)}
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
                value={goals}
                onChange={(event) => setGoals(event.target.value)}
                className="mt-1 min-h-24 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
              />
            </label>
            <button
              disabled={submitting}
              type="submit"
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>
        )}

        {error ? <p className="mt-4 rounded-md bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
      </div>
    </main>
  );
}
