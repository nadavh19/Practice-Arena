"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageShell } from "@/app/components/ui/page-shell";
import { clearToken, getToken } from "@/lib/client/auth-storage";
import { clearCurrentSessionId } from "@/lib/client/session-storage";

type ProtectedShellProps = {
  children: ReactNode;
};

const links = [
  { href: "/profile", label: "Profile" },
  { href: "/session/new", label: "New Session" },
  { href: "/session/current", label: "Current Session" },
  { href: "/history", label: "History" },
  { href: "/coach", label: "Coach" },
  { href: "/song-learner", label: "Song Learner" },
];

function getPageBackgroundClass(pathname: string) {
  if (pathname === "/profile") {
    return "profile-page-background";
  }

  if (pathname === "/session/new") {
    return "new-session-page-background";
  }

  if (pathname === "/session/current") {
    return "current-session-page-background";
  }

  if (pathname === "/history") {
    return "history-page-background";
  }

  if (pathname === "/coach") {
    return "coach-page-background";
  }

  if (pathname === "/song-learner") {
    return "song-learner-page-background";
  }

  return "protected-image-shell";
}

function subscribeToTokenChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export function ProtectedShell({ children }: ProtectedShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const token = useSyncExternalStore(subscribeToTokenChanges, getToken, () => null);

  useEffect(() => {
    if (!token) {
      router.replace("/auth");
    }
  }, [router, token]);

  if (!token) {
    return (
      <PageShell as="main" width="5xl" fullHeight className="flex items-center justify-center px-6 py-10">
        <InlineStatus message="Checking access..." variant="muted" />
      </PageShell>
    );
  }

  const backgroundClassName = getPageBackgroundClass(pathname);

  function handleLogout() {
    clearToken();
    clearCurrentSessionId();
    router.replace("/auth");
  }

  return (
    <div className={`${backgroundClassName} min-h-[100dvh]`}>
      <header className="border-b border-violet-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto w-full max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-4">
            <Link
              href="/session/new"
              aria-label="Practice Arena"
              className="group block h-12 w-44 shrink-0 bg-[url('/brand/main-pic.png')] bg-contain bg-left bg-no-repeat transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.98] sm:h-16 sm:w-64 lg:h-20 lg:w-80"
            >
              <span className="sr-only">Practice Arena</span>
            </Link>

            <nav className="hidden flex-wrap items-center gap-1.5 lg:flex lg:justify-center">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-full px-3 py-2 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] sm:px-3.5 ${
                      isActive
                        ? "bg-violet-900 text-white shadow-[0_14px_30px_-24px_rgba(76,29,149,0.9)]"
                        : "text-violet-900 hover:bg-violet-50 hover:text-violet-950"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setMenuOpen((isOpen) => !isOpen)}
                aria-expanded={menuOpen}
                aria-controls="protected-mobile-menu"
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-violet-200 bg-white text-violet-950 shadow-[0_12px_28px_-24px_rgba(76,29,149,0.55)] transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-violet-300 hover:bg-violet-50 active:scale-[0.98] lg:hidden"
              >
                <span className="sr-only">Toggle navigation menu</span>
                <span className="flex flex-col gap-1.5" aria-hidden="true">
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                  <span className="block h-0.5 w-5 rounded-full bg-current" />
                </span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="hidden w-fit rounded-full border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-950 shadow-[0_12px_28px_-24px_rgba(76,29,149,0.45)] transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-violet-300 hover:bg-violet-50 active:scale-[0.98] lg:inline-flex lg:justify-self-end"
              >
                Log out
              </button>
            </div>
          </div>

          {menuOpen ? (
            <div
              id="protected-mobile-menu"
              className="mt-3 rounded-[1.5rem] border border-violet-200/80 bg-white p-3 shadow-[0_20px_50px_-36px_rgba(76,29,149,0.48)] lg:hidden"
            >
              <nav className="grid gap-1">
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className={`rounded-2xl px-4 py-3 text-sm font-medium transition-[background-color,color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.99] ${
                      isActive ? "bg-violet-900 text-white" : "text-violet-900 hover:bg-violet-50 hover:text-violet-950"
                    }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 w-full rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-left text-sm font-semibold text-violet-950 transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-violet-300 hover:bg-white active:scale-[0.99]"
              >
                Log out
              </button>
            </div>
          ) : null}
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}
