import { PageHeading } from "@/app/components/ui/page-heading";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import type { SessionHistoryItem } from "@/lib/client/types";

type CurrentSessionTasksProps = {
  onToggleTask: (taskId: string) => void;
  selectedCount: number;
  selectedTaskIds: string[];
  session: SessionHistoryItem;
};

export function CurrentSessionTasks({
  onToggleTask,
  selectedCount,
  selectedTaskIds,
  session,
}: CurrentSessionTasksProps) {
  return (
    <SurfaceCard>
      <PageHeading title="Tasks" description="Mark completed tasks, then submit feedback below." />
      <ul className="mt-4 space-y-3">
        {session.tasks.map((item) => {
          const checked = selectedTaskIds.includes(item.taskId);
          return (
            <li key={item.taskId} className="rounded-lg border border-zinc-200 p-3">
              <label className="flex cursor-pointer gap-3">
                <input type="checkbox" checked={checked} onChange={() => onToggleTask(item.taskId)} />
                <span className="flex-1">
                  <span className="block text-sm font-medium text-zinc-900">{item.task.name}</span>
                  <span className="block text-xs text-zinc-600">
                    {item.task.category} | {item.task.duration} min | {item.task.difficulty}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-zinc-600">{selectedCount} task(s) selected as completed.</p>
    </SurfaceCard>
  );
}
