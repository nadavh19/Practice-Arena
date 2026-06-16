import type { FormEvent } from "react";
import { AppButton } from "@/app/components/ui/app-button";
import { AppSelect, type AppSelectOption } from "@/app/components/ui/app-select";
import { AutoResizeTextarea } from "@/app/components/ui/auto-resize-textarea";
import { FormField, fieldControlClassName } from "@/app/components/ui/form-field";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageHeading } from "@/app/components/ui/page-heading";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import type { TaskFormState } from "@/app/admin/components/admin-page-helpers";
import type { TaskCategory, UserLevel } from "@/lib/client/types";

const difficultyOptions: AppSelectOption<UserLevel>[] = [
  { value: "beginner", label: "Beginner", description: "Simple and approachable" },
  { value: "intermediate", label: "Intermediate", description: "More moving parts" },
  { value: "advanced", label: "Advanced", description: "Demanding practice material" },
];

const categoryOptions: AppSelectOption<TaskCategory>[] = [
  { value: "exercise", label: "Exercise", description: "General practice drill" },
  { value: "scale", label: "Scale", description: "Scale or mode study" },
  { value: "chord", label: "Chord", description: "Single chord or voicing work" },
  { value: "song_chords", label: "Song chords", description: "Progression or song harmony" },
  { value: "riff", label: "Riff", description: "Short repeated musical idea" },
  { value: "solo", label: "Solo", description: "Lead guitar phrase" },
  { value: "rhythm", label: "Rhythm", description: "Timing and strumming work" },
  { value: "technique", label: "Technique", description: "Coordination and control" },
];

type AddTaskPanelProps = {
  active: boolean;
  form: TaskFormState;
  message: string | null;
  onChange: (updater: (current: TaskFormState) => TaskFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  saving: boolean;
};

export function AddTaskPanel({ active, form, message, onChange, onSubmit, saving }: AddTaskPanelProps) {
  return (
    <section id="addTask-panel" role="tabpanel" aria-labelledby="addTask-tab" hidden={!active}>
      <SurfaceCard className="rounded-[1.5rem] p-5">
        <PageHeading title="Add task" description="Create a reusable task for future generated sessions." />
        <form className="mt-5 space-y-4" onSubmit={onSubmit}>
          <FormField label="Name" helperText="Short, specific task title.">
            <input
              required
              value={form.name}
              onChange={(event) => onChange((current) => ({ ...current, name: event.target.value }))}
              className={fieldControlClassName}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-3">
            <AppSelect
              label="Difficulty"
              value={form.difficulty}
              options={difficultyOptions}
              onChange={(difficulty) => onChange((current) => ({ ...current, difficulty }))}
            />
            <AppSelect
              label="Category"
              value={form.category}
              options={categoryOptions}
              onChange={(category) => onChange((current) => ({ ...current, category }))}
            />
            <FormField label="Duration" helperText="Minutes.">
              <input
                required
                min={1}
                max={240}
                type="number"
                value={form.duration}
                onChange={(event) => onChange((current) => ({ ...current, duration: event.target.value }))}
                className={fieldControlClassName}
              />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField label="Instrument" helperText="Defaults to guitar.">
              <input
                value={form.instrument}
                onChange={(event) => onChange((current) => ({ ...current, instrument: event.target.value }))}
                className={fieldControlClassName}
              />
            </FormField>
            <FormField label="Key" helperText="Optional.">
              <input
                value={form.key}
                onChange={(event) => onChange((current) => ({ ...current, key: event.target.value }))}
                className={fieldControlClassName}
              />
            </FormField>
            <FormField label="BPM" helperText="Optional.">
              <input
                min={1}
                max={300}
                type="number"
                value={form.bpm}
                onChange={(event) => onChange((current) => ({ ...current, bpm: event.target.value }))}
                className={fieldControlClassName}
              />
            </FormField>
          </div>
          <FormField label="Description" helperText="Practice instructions.">
            <AutoResizeTextarea
              value={form.description}
              onChange={(event) => onChange((current) => ({ ...current, description: event.target.value }))}
              className="min-h-24"
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Chords" helperText="Optional.">
              <AutoResizeTextarea
                value={form.chords}
                onChange={(event) => onChange((current) => ({ ...current, chords: event.target.value }))}
                className="min-h-20"
              />
            </FormField>
            <FormField label="Scale" helperText="Optional.">
              <AutoResizeTextarea
                value={form.scale}
                onChange={(event) => onChange((current) => ({ ...current, scale: event.target.value }))}
                className="min-h-20"
              />
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Song name" helperText="Optional.">
              <input
                value={form.songName}
                onChange={(event) => onChange((current) => ({ ...current, songName: event.target.value }))}
                className={fieldControlClassName}
              />
            </FormField>
            <FormField label="Artist name" helperText="Optional.">
              <input
                value={form.artistName}
                onChange={(event) => onChange((current) => ({ ...current, artistName: event.target.value }))}
                className={fieldControlClassName}
              />
            </FormField>
          </div>
          <FormField label="Tab" helperText="Optional plain-text tablature.">
            <AutoResizeTextarea
              value={form.tab}
              onChange={(event) => onChange((current) => ({ ...current, tab: event.target.value }))}
              className="min-h-28 font-mono"
            />
          </FormField>
          <AppButton disabled={saving} type="submit">
            {saving ? "Adding task..." : "Add task"}
          </AppButton>
        </form>
        {message ? <InlineStatus message={message} variant="success" className="mt-5" /> : null}
      </SurfaceCard>
    </section>
  );
}
