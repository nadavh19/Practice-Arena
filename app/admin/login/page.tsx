"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppButton } from "@/app/components/ui/app-button";
import { FormField, fieldControlClassName } from "@/app/components/ui/form-field";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageHeading } from "@/app/components/ui/page-heading";
import { PageShell } from "@/app/components/ui/page-shell";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import { adminApiPost } from "@/lib/client/admin-api-client";
import { getAdminToken, setAdminToken } from "@/lib/client/admin-auth-storage";
import type { AuthResponse } from "@/lib/client/types";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@local");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (getAdminToken()) {
      router.replace("/admin");
    }
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const result = await adminApiPost<AuthResponse>("/api/admin/auth/login", {
      email,
      password,
    });

    setSubmitting(false);
    if (!result.success) {
      setError(result.error.message);
      return;
    }

    setAdminToken(result.data.token);
    router.push("/admin");
  }

  return (
    <PageShell as="main" width="5xl" fullHeight className="flex items-center justify-center px-4 py-10">
      <SurfaceCard className="w-full max-w-md">
        <PageHeading title="Admin access" description="Sign in with an admin account to manage Practice Arena data." />
        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <FormField label="Admin email">
            <input
              required
              type="text"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={fieldControlClassName}
            />
          </FormField>
          <FormField label="Password">
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={fieldControlClassName}
            />
          </FormField>
          <AppButton disabled={submitting} type="submit" fullWidth>
            {submitting ? "Checking..." : "Enter admin panel"}
          </AppButton>
        </form>
        {error ? <InlineStatus message={error} variant="error" className="mt-5" /> : null}
      </SurfaceCard>
    </PageShell>
  );
}
