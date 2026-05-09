import Link from "next/link";
import { getButtonClassName } from "@/app/components/ui/app-button";
import { PageHeading } from "@/app/components/ui/page-heading";
import { SurfaceCard } from "@/app/components/ui/surface-card";

export function HistoryEmptyState() {
  return (
    <SurfaceCard>
      <PageHeading title="History" description="No sessions completed yet. Start your first session." />
      <Link href="/session/new" className={`mt-4 inline-block ${getButtonClassName()}`}>
        Create session
      </Link>
    </SurfaceCard>
  );
}
