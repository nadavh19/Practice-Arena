import type { CSSProperties } from "react";
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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <SurfaceCard
          as="article"
          key={item.label}
          className="practice-task-reveal p-5"
          style={{ "--task-index": index } as CSSProperties}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{item.label}</p>
          <p className="mt-3 font-mono text-3xl font-semibold tracking-tight text-[#171326]">{item.value}</p>
        </SurfaceCard>
      ))}
    </div>
  );
}
