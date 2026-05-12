import Link from "next/link";
import { getButtonClassName } from "@/app/components/ui/app-button";
import { PageHeading } from "@/app/components/ui/page-heading";
import { SurfaceCard } from "@/app/components/ui/surface-card";

export function HistoryEmptyState() {
  return (
    <SurfaceCard className="page-section-reveal max-w-2xl">
      <PageHeading title="History" description="No sessions completed yet. Start your first session." />
      <Link href="/session/new" className={`mt-5 ${getButtonClassName()}`}>
        Create session
      </Link>
    </SurfaceCard>
  );
}
