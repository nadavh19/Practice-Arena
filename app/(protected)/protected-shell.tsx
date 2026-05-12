"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useSyncExternalStore, type ReactNode } from "react";
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

  return (
    <div className={`${backgroundClassName} min-h-[100dvh]`}>
      <header className="border-b border-slate-200/70 bg-white/85 backdrop-blur">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:px-8">
          <Link href="/session/new" className="group w-fit">
            <p className="text-sm font-semibold tracking-tight text-zinc-950">Practice Arena</p>
            <p className="text-xs text-slate-500">Focused guitar sessions</p>
          </Link>
          <nav className="flex flex-wrap items-center gap-2 lg:justify-center">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-[background-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] active:scale-[0.98] ${
                    isActive
                      ? "bg-zinc-950 text-white shadow-[0_14px_30px_-24px_rgba(15,23,42,0.9)]"
                      : "text-slate-700 hover:bg-slate-100 hover:text-zinc-950"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <button
            type="button"
            onClick={() => {
              clearToken();
              clearCurrentSessionId();
              router.replace("/auth");
            }}
            className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-[0_12px_28px_-24px_rgba(15,23,42,0.7)] transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98] lg:justify-self-end"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">{children}</main>
    </div>
  );
}
