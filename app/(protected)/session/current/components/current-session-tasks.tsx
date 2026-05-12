import { PageHeading } from "@/app/components/ui/page-heading";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import { TaskDetails } from "@/app/components/tasks/task-details";
import type { SessionHistoryItem } from "@/lib/client/types";
import type { CSSProperties } from "react";

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
    <SurfaceCard className="rounded-[2rem] border-slate-200/70 p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.35)] sm:p-8">
      <PageHeading title="Tasks" description="Mark completed tasks, then submit feedback below." />
      <ul className="mt-7 space-y-6">
        {session.tasks.map((item, index) => {
          const checked = selectedTaskIds.includes(item.taskId);
          return (
            <li
              key={item.taskId}
              className="practice-task-reveal"
              style={{ "--task-index": index } as CSSProperties}
            >
              <TaskDetails task={item.task} />
              <label className="mt-3 flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-slate-300 hover:bg-white active:scale-[0.98]">
                <span>{checked ? "Completed" : "Mark as completed"}</span>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggleTask(item.taskId)}
                  className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-2 focus:ring-emerald-700/20"
                />
              </label>
            </li>
          );
        })}
      </ul>
      <div className="music-accent-panel mt-6 rounded-[1.5rem] border border-slate-800/70 p-5 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.7)]">
        <p className="text-sm font-semibold text-white">{selectedCount} task(s) selected as completed.</p>
        <p className="mt-1 text-sm leading-6 text-slate-200">
          Finish the pass, then send feedback so the next plan can adjust.
        </p>
      </div>
    </SurfaceCard>
  );
}
