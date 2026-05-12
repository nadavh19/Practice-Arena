import Link from "next/link";
import { getButtonClassName } from "@/app/components/ui/app-button";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { SurfaceCard } from "@/app/components/ui/surface-card";

type CurrentSessionEmptyStateProps = {
  error: string | null;
};

export function CurrentSessionEmptyState({ error }: CurrentSessionEmptyStateProps) {
  return (
    <SurfaceCard className="page-section-reveal max-w-2xl">
      <InlineStatus message={error ?? "No current session found."} variant="info" />
      <Link href="/session/new" className={`mt-5 ${getButtonClassName()}`}>
        Generate session
      </Link>
    </SurfaceCard>
  );
}
