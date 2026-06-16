import { PageHeading } from "@/app/components/ui/page-heading";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import { formatLabel } from "@/app/admin/components/admin-page-helpers";
import type { AdminPracticeTask } from "@/lib/client/types";

type TaskInventoryPanelProps = {
  active: boolean;
  tasks: AdminPracticeTask[];
};

function TaskPreview({ task }: { task: AdminPracticeTask }) {
  return (
    <li className="rounded-2xl border border-violet-200/70 bg-white px-4 py-3 shadow-[0_12px_28px_-26px_rgba(76,29,149,0.28)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[#171326]">{task.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {formatLabel(task.category)} / {task.difficulty} / {task.duration} min
          </p>
        </div>
        <p className="font-mono text-xs text-slate-500">{task.bpm ? `${task.bpm} BPM` : "No BPM"}</p>
      </div>
    </li>
  );
}

export function TaskInventoryPanel({ active, tasks }: TaskInventoryPanelProps) {
  return (
    <section
      id="taskInventory-panel"
      role="tabpanel"
      aria-labelledby="taskInventory-tab"
      hidden={!active}
    >
      <SurfaceCard className="rounded-[1.5rem] p-5">
        <PageHeading title="Task inventory" description="Reusable tasks available to session generation." />
        <ul className="mt-5 max-h-[42rem] space-y-2 overflow-y-auto pr-1">
          {tasks.map((task) => (
            <TaskPreview key={task.id} task={task} />
          ))}
        </ul>
      </SurfaceCard>
    </section>
  );
}
