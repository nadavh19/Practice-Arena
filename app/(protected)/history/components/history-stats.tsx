import { SurfaceCard } from "@/app/components/ui/surface-card";
import type { SessionStats } from "@/lib/client/types";

type HistoryStatsProps = {
  stats: SessionStats;
};

export function HistoryStats({ stats }: HistoryStatsProps) {
  const items = [
    { label: "Sessions", value: String(stats.sessionCount) },
    { label: "Avg focus", value: stats.avgFocusRating.toFixed(2) },
    { label: "Avg difficulty", value: stats.avgDifficultyRating.toFixed(2) },
    { label: "Completion rate", value: `${Math.round(stats.completionRate * 100)}%` },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <SurfaceCard as="article" key={item.label} className="p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">{item.label}</p>
          <p className="mt-2 text-2xl font-semibold text-zinc-900">{item.value}</p>
        </SurfaceCard>
      ))}
    </div>
  );
}
