import { PageHeading } from "@/app/components/ui/page-heading";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import { TaskDetails } from "@/app/components/tasks/task-details";
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
            <li key={item.taskId}>
              <TaskDetails task={item.task} />
              <label className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-800">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleTask(item.taskId)}
                  className="h-4 w-4 rounded border-zinc-300 text-zinc-900"
                />
                <span>{checked ? "Completed" : "Mark as completed"}</span>
              </label>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-zinc-600">{selectedCount} task(s) selected as completed.</p>
    </SurfaceCard>
  );
}
