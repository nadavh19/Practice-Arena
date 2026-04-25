"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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

      if (profileResult.data.nickname) {
        router.replace("/session/new");
      } else {
        router.replace("/profile");
      }
    }

    void routeUser();
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-6 py-10">
      <p className="text-sm text-zinc-600">Redirecting...</p>
    </main>
  );
}
