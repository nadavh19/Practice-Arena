import type { PracticeTask } from "@/lib/client/types";

type TaskDetailsProps = {
  completionLabel?: string;
  completionVariant?: "done" | "pending";
  task: PracticeTask;
};

type TaskMetaBadgeProps = {
  label: string;
  value: string;
};

type TaskTextSectionProps = {
  children: string;
  label: string;
  monospace?: boolean;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function hasText(value: string | null | undefined): value is string {
  return Boolean(value?.trim());
}

function TaskMetaBadge({ label, value }: TaskMetaBadgeProps) {
  return (
    <span className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700">
      <span className="text-zinc-500">{label}:</span> {value}
    </span>
  );
}

function TaskTextSection({ children, label, monospace = false }: TaskTextSectionProps) {
  return (
    <section className="space-y-1">
      <h4 className="text-xs font-semibold uppercase text-zinc-500">{label}</h4>
      {monospace ? (
        <pre className="overflow-x-auto whitespace-pre rounded-lg border border-zinc-200 bg-zinc-950 p-3 font-mono text-xs leading-relaxed text-zinc-50">
          {children.trim()}
        </pre>
      ) : (
        <p className="rounded-lg border border-zinc-200 bg-white p-3 text-sm leading-6 text-zinc-700">{children}</p>
      )}
    </section>
  );
}

export function TaskDetails({ completionLabel, completionVariant = "done", task }: TaskDetailsProps) {
  const metaItems = [
    { label: "Category", value: formatLabel(task.category) },
    { label: "Difficulty", value: formatLabel(task.difficulty) },
    { label: "Duration", value: `${task.duration} min` },
    hasText(task.instrument) ? { label: "Instrument", value: task.instrument } : null,
    hasText(task.key) ? { label: "Key", value: task.key } : null,
    task.bpm ? { label: "BPM", value: String(task.bpm) } : null,
  ].filter((item): item is TaskMetaBadgeProps => Boolean(item));

  const hasSongInfo = hasText(task.songName) || hasText(task.artistName);

  return (
    <article className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-zinc-950">{task.name}</h3>
          {hasSongInfo ? (
            <p className="mt-1 text-sm text-zinc-600">
              {hasText(task.songName) ? task.songName : "Untitled song"}
              {hasText(task.artistName) ? ` by ${task.artistName}` : ""}
            </p>
          ) : null}
        </div>
        {completionLabel ? (
          <span
            className={`rounded-md px-2.5 py-1 text-xs font-medium ${
              completionVariant === "done" ? "bg-emerald-50 text-emerald-800" : "bg-zinc-100 text-zinc-700"
            }`}
          >
            {completionLabel}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {metaItems.map((item) => (
          <TaskMetaBadge key={item.label} label={item.label} value={item.value} />
        ))}
      </div>

      <div className="space-y-3">
        {hasText(task.description) ? <TaskTextSection label="Description">{task.description}</TaskTextSection> : null}
        {hasText(task.chords) ? <TaskTextSection label="Chords">{task.chords}</TaskTextSection> : null}
        {hasText(task.scale) ? <TaskTextSection label="Scale">{task.scale}</TaskTextSection> : null}
        {hasText(task.tab) ? (
          <TaskTextSection label="Tab" monospace>
            {task.tab}
          </TaskTextSection>
        ) : null}
      </div>
    </article>
  );
}
