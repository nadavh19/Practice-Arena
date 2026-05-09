import type { FormEvent } from "react";
import { AppButton } from "@/app/components/ui/app-button";
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
    <SurfaceCard>
      <PageHeading title="Session context" description="Set your state and we will generate your next practice plan." />

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <FormField label="Mood">
          <input
            required
            value={mood}
            onChange={(event) => onMoodChange(event.target.value)}
            placeholder="Focused, tired, energized..."
            className={fieldControlClassName}
          />
        </FormField>

        <FormField label="Available time (minutes)">
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

        <FormField label="Goal / focus (optional)">
          <textarea
            value={goal}
            onChange={(event) => onGoalChange(event.target.value)}
            className={`${fieldControlClassName} min-h-20`}
          />
        </FormField>

        <AppButton disabled={submitting} type="submit">
          {submitting ? "Generating..." : "Generate practice plan"}
        </AppButton>
      </form>

      {error ? <InlineStatus message={error} variant="error" className="mt-4" /> : null}
    </SurfaceCard>
  );
}
