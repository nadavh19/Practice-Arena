"use client";

import { ProfileForm } from "@/app/(protected)/profile/components/profile-form";
import { ProfileSummary } from "@/app/(protected)/profile/components/profile-summary";
import { useProfileForm } from "@/app/(protected)/profile/hooks/use-profile-form";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageShell } from "@/app/components/ui/page-shell";
import { SurfaceCard } from "@/app/components/ui/surface-card";

export default function ProfilePage() {
  const {
    cancelEditing,
    error,
    form,
    handleSubmit,
    loading,
    mode,
    profile,
    saving,
    setForm,
    startEditing,
    stats,
    successMessage,
  } = useProfileForm();

  if (loading) {
    return (
      <PageShell width="7xl">
        <InlineStatus message="Loading profile..." variant="muted" />
      </PageShell>
    );
  }

  if (!profile || !stats) {
    return (
      <PageShell width="7xl">
        <SurfaceCard>
          <InlineStatus message={error ?? "Profile is unavailable."} variant="error" />
        </SurfaceCard>
      </PageShell>
    );
  }

  if (mode === "view") {
    return (
      <PageShell width="7xl" className="page-section-reveal">
        <ProfileSummary profile={profile} stats={stats} successMessage={successMessage} onEdit={startEditing} />
      </PageShell>
    );
  }

  return (
    <PageShell width="7xl" className="page-section-reveal">
      <ProfileForm
        canCancel={profile.goals.trim().length > 0}
        error={error}
        form={form}
        isSetupMode={profile.goals.trim().length === 0}
        onCancel={cancelEditing}
        onChange={(updater) => setForm((current) => updater(current))}
        onSubmit={handleSubmit}
        saving={saving}
      />
    </PageShell>
  );
}
