import type { FormEvent } from "react";
import { AppButton } from "@/app/components/ui/app-button";
import { FormField, fieldControlClassName } from "@/app/components/ui/form-field";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageHeading } from "@/app/components/ui/page-heading";
import { SurfaceCard } from "@/app/components/ui/surface-card";

type CurrentSessionFeedbackFormProps = {
  difficultyRating: string;
  error: string | null;
  focusRating: string;
  onDifficultyRatingChange: (value: string) => void;
  onFocusRatingChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitting: boolean;
};

export function CurrentSessionFeedbackForm({
  difficultyRating,
  error,
  focusRating,
  onDifficultyRatingChange,
  onFocusRatingChange,
  onSubmit,
  submitting,
}: CurrentSessionFeedbackFormProps) {
  return (
    <SurfaceCard className="rounded-[2rem]">
      <form onSubmit={onSubmit}>
        <PageHeading title="Session feedback" description="Rate difficulty and focus from 1 to 5." />

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <FormField label="Difficulty rating" helperText="1 felt easy, 5 felt heavy.">
            <input
              type="number"
              min={1}
              max={5}
              value={difficultyRating}
              onChange={(event) => onDifficultyRatingChange(event.target.value)}
              className={fieldControlClassName}
            />
          </FormField>
          <FormField label="Focus rating" helperText="1 felt distracted, 5 felt locked in.">
            <input
              type="number"
              min={1}
              max={5}
              value={focusRating}
              onChange={(event) => onFocusRatingChange(event.target.value)}
              className={fieldControlClassName}
            />
          </FormField>
        </div>

        <AppButton disabled={submitting} type="submit" className="mt-6">
          {submitting ? "Submitting..." : "Submit feedback and finish"}
        </AppButton>

        {error ? <InlineStatus message={error} variant="error" className="mt-4" /> : null}
      </form>
    </SurfaceCard>
  );
}
