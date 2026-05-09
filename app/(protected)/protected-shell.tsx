"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
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

export function ProtectedShell({ children }: ProtectedShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const token = getToken();

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

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <nav className="flex flex-wrap items-center gap-3">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-1.5 text-sm ${
                    isActive ? "bg-zinc-900 text-white" : "text-zinc-700 hover:bg-zinc-100"
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
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
          >
            Log out
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
