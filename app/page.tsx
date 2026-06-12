"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageShell } from "@/app/components/ui/page-shell";
import { apiGet } from "@/lib/client/api-client";
import { getToken } from "@/lib/client/auth-storage";
import type { UserProfile } from "@/lib/client/types";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    async function routeUser() {
      const token = getToken();
      if (!token) {
        router.replace("/auth");
        return;
      }

      const profileResult = await apiGet<UserProfile>("/api/profile");
      if (!profileResult.success) {
        router.replace("/auth");
        return;
      }

      router.replace(profileResult.data.goals.trim() ? "/session/new" : "/profile");
    }

    void routeUser();
  }, [router]);

  return (
    <PageShell as="main" width="2xl" fullHeight className="flex items-center justify-center px-6 py-10">
      <InlineStatus message="Redirecting..." variant="muted" />
    </PageShell>
  );
}
