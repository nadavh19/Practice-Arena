import Link from "next/link";
import { getButtonClassName } from "@/app/components/ui/app-button";
import { PageHeading } from "@/app/components/ui/page-heading";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import type { SessionStats, UserProfile } from "@/lib/client/types";

type ProfileSummaryProps = {
  onEdit: () => void;
  profile: UserProfile;
  stats: SessionStats;
  successMessage: string | null;
};

function getDisplayName(profile: UserProfile) {
  const nickname = profile.nickname?.trim();
  if (nickname) {
    return nickname;
  }

  return profile.email.split("@")[0] || "Player";
}

function formatLevel(level: UserProfile["level"]) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export function ProfileSummary({ onEdit, profile, stats, successMessage }: ProfileSummaryProps) {
  const displayName = getDisplayName(profile);
  const statItems = [
    { label: "Sessions", value: String(stats.sessionCount) },
    { label: "Avg focus", value: stats.avgFocusRating.toFixed(2) },
    { label: "Avg difficulty", value: stats.avgDifficultyRating.toFixed(2) },
    { label: "Completion rate", value: `${Math.round(stats.completionRate * 100)}%` },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <aside className="space-y-5 lg:pt-8">
          <PageHeading
            title="Practice profile"
            description="A quick snapshot of the details Practice Arena uses to shape your sessions."
          />

          <div className="flex flex-wrap gap-3">
            <Link href="/session/new" className={getButtonClassName()}>
              Start session
            </Link>
            <Link href="/coach" className={getButtonClassName({ variant: "secondary" })}>
              Ask coach
            </Link>
            <button type="button" onClick={onEdit} className={getButtonClassName({ variant: "secondary" })}>
              Edit profile
            </button>
          </div>

          {successMessage ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
              {successMessage}
            </p>
          ) : null}
        </aside>

        <SurfaceCard>
          <p className="font-mono text-sm text-slate-500">Current setup</p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#171326]">{displayName}</h1>
              <p className="mt-2 text-sm text-slate-600">{profile.email}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800 ring-1 ring-violet-200/70">
                Guitar
              </span>
              <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-200/80">
                {formatLevel(profile.level)}
              </span>
            </div>
          </div>

          <div className="mt-7 rounded-[1.25rem] border border-violet-100 bg-violet-50/60 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-700">Practice goals</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{profile.goals}</p>
          </div>
        </SurfaceCard>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map((item) => (
          <SurfaceCard as="article" key={item.label} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
            <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-[#171326]">{item.value}</p>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}
