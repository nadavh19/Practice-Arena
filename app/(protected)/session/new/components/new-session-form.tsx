import type { FormEvent } from "react";
import { AppButton } from "@/app/components/ui/app-button";
import { AppSelect, type AppSelectOption } from "@/app/components/ui/app-select";
import { AutoResizeTextarea } from "@/app/components/ui/auto-resize-textarea";
import { FormField, fieldControlClassName } from "@/app/components/ui/form-field";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageHeading } from "@/app/components/ui/page-heading";
import { SurfaceCard } from "@/app/components/ui/surface-card";

type NewSessionFormProps = {
  availableTime: string;
  error: string | null;
  goal: string;
  mood: string;
  onAvailableTimeChange: (value: string) => void;
  onGoalChange: (value: string) => void;
  onMoodChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
};

const moodOptions: AppSelectOption[] = [
  { value: "focused", label: "Focused", description: "Ready for deliberate practice" },
  { value: "energized", label: "Energized", description: "Up for a lively session" },
  { value: "calm", label: "Calm", description: "Steady and patient" },
  { value: "tired", label: "Tired", description: "Keep the plan lighter" },
  { value: "frustrated", label: "Frustrated", description: "Reset with focused wins" },
  { value: "distracted", label: "Distracted", description: "Short and structured" },
];

export function NewSessionForm({
  availableTime,
  error,
  goal,
  mood,
  onAvailableTimeChange,
  onGoalChange,
  onMoodChange,
  onSubmit,
  submitting,
}: NewSessionFormProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
      <SurfaceCard>
        <PageHeading title="Session context" description="Set your state and we will generate your next practice plan." />

        <form className="mt-7 space-y-5" onSubmit={onSubmit}>
          <AppSelect
            label="Mood"
            helperText="Choose the state that best fits this session."
            value={mood}
            options={moodOptions}
            onChange={onMoodChange}
          />

          <FormField label="Available time (minutes)" helperText="Between 5 and 240 minutes.">
            <input
              required
              min={5}
              max={240}
              type="number"
              value={availableTime}
              onChange={(event) => onAvailableTimeChange(event.target.value)}
              className={fieldControlClassName}
            />
          </FormField>

          <FormField label="Goal / focus (optional)" helperText="Examples: clean barre changes, tighter rhythm, A minor solo ideas.">
            <AutoResizeTextarea
              value={goal}
              onChange={(event) => onGoalChange(event.target.value)}
              className="min-h-28"
            />
          </FormField>

          <AppButton disabled={submitting} type="submit">
            {submitting ? "Generating..." : "Generate practice plan"}
          </AppButton>
        </form>

        {error ? <InlineStatus message={error} variant="error" className="mt-5" /> : null}
      </SurfaceCard>

      <aside className="space-y-4 lg:pt-12">
        <div className="rounded-[1.75rem] border border-slate-200/70 bg-white/90 p-6 shadow-[0_24px_58px_-42px_rgba(15,23,42,0.52)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Preview</p>
          <p className="mt-4 font-mono text-4xl font-semibold tracking-tight text-zinc-950">{availableTime || "0"} min</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {mood.trim() ? `Mood: ${mood}` : "Add a mood to tune the session."}
          </p>
          <div className="mt-5 rounded-2xl border border-slate-200/70 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            {goal.trim() || "Optional focus will appear here before the plan is generated."}
          </div>
        </div>
      </aside>
    </div>
  );
}
