import type { PracticeTask } from "@/lib/client/types";

type TaskDetailsProps = {
  className?: string;
  completionLabel?: string;
  completionVariant?: "done" | "pending";
  task: PracticeTask;
};

type TaskMetaBadgeProps = {
  accent?: boolean;
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

function TaskMetaBadge({ accent = false, value }: TaskMetaBadgeProps) {
  return (
    <span
      className={[
        "rounded-full px-3 py-1 text-xs font-medium tracking-tight",
        accent
          ? "bg-amber-50 text-amber-900 ring-1 ring-amber-200/80"
          : "bg-violet-50 text-violet-800 ring-1 ring-violet-200/70",
      ].join(" ")}
    >
      {value}
    </span>
  );
}

function TaskTextSection({ children, label, monospace = false }: TaskTextSectionProps) {
  return (
    <section className="space-y-2">
      <h4 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</h4>
      {monospace ? (
        <pre className="overflow-x-auto whitespace-pre rounded-2xl border border-violet-950 bg-[#171326] p-4 font-mono text-xs leading-relaxed text-zinc-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          {children.trim()}
        </pre>
      ) : (
        <p className="max-w-[65ch] text-sm leading-6 text-slate-700">{children}</p>
      )}
    </section>
  );
}

export function TaskDetails({ className, completionLabel, completionVariant = "done", task }: TaskDetailsProps) {
  const metaItems = [
    { value: `${task.duration} min` },
    { value: formatLabel(task.difficulty) },
    hasText(task.instrument) ? { value: task.instrument } : null,
    hasText(task.key) ? { value: task.key } : null,
    task.bpm ? { value: `${task.bpm} BPM` } : null,
  ].filter((item): item is TaskMetaBadgeProps => Boolean(item));

  const hasSongInfo = hasText(task.songName) || hasText(task.artistName);
  const hasPracticeContent = hasText(task.description) || hasText(task.chords) || hasText(task.scale) || hasText(task.tab);

  return (
    <article
      className={[
        "group overflow-hidden rounded-[1.75rem] border border-violet-200/70 bg-white shadow-[0_20px_45px_-30px_rgba(76,29,149,0.28)] transition-[border-color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-[0_24px_55px_-34px_rgba(76,29,149,0.34)]",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-[minmax(0,1.35fr)_minmax(12rem,0.65fr)] md:items-start">
        <div className="min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <TaskMetaBadge value={formatLabel(task.category)} accent />
            {completionLabel ? (
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium tracking-tight ring-1 ${
                  completionVariant === "done"
                    ? "bg-amber-50 text-amber-900 ring-amber-200/80"
                    : "bg-violet-50 text-violet-800 ring-violet-200/70"
                }`}
              >
                {completionLabel}
              </span>
            ) : null}
          </div>
          <h3 className="max-w-[18ch] text-2xl font-semibold leading-tight tracking-tight text-[#171326] sm:max-w-[22ch]">
            {task.name}
          </h3>
          {hasSongInfo ? (
            <p className="max-w-[52ch] text-sm leading-6 text-slate-600">
              {hasText(task.songName) ? task.songName : "Untitled song"}
              {hasText(task.artistName) ? ` by ${task.artistName}` : ""}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2 md:justify-end">
          {metaItems.map((item) => (
            <TaskMetaBadge key={item.value} value={item.value} />
          ))}
        </div>
      </div>

      {hasPracticeContent ? (
        <div className="grid gap-5 border-t border-violet-200/70 bg-violet-50/60 p-5 sm:p-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          {hasText(task.description) ? (
            <div className="lg:col-span-2">
              <TaskTextSection label="Practice note">{task.description}</TaskTextSection>
            </div>
          ) : null}
          {hasText(task.chords) ? <TaskTextSection label="Chords">{task.chords}</TaskTextSection> : null}
          {hasText(task.scale) ? <TaskTextSection label="Scale">{task.scale}</TaskTextSection> : null}
          {hasText(task.tab) ? (
            <div className="lg:col-span-2">
              <TaskTextSection label="Tab" monospace>
                {task.tab}
              </TaskTextSection>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
