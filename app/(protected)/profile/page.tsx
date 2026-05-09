"use client";

import { ProfileForm } from "@/app/(protected)/profile/components/profile-form";
import { useProfileForm } from "@/app/(protected)/profile/hooks/use-profile-form";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageShell } from "@/app/components/ui/page-shell";

export default function ProfilePage() {
  const { error, form, handleSubmit, loading, saving, setForm, successMessage } = useProfileForm();

  if (loading) {
    return (
      <PageShell width="2xl">
        <InlineStatus message="Loading profile..." variant="muted" />
      </PageShell>
    );
  }

  return (
    <PageShell width="2xl">
      <ProfileForm
        error={error}
        form={form}
        onChange={(updater) => setForm((current) => updater(current))}
        onSubmit={handleSubmit}
        saving={saving}
        successMessage={successMessage}
      />
    </PageShell>
  );
}
