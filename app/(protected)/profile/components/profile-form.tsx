import type { FormEvent } from "react";
import Link from "next/link";
import { AppButton, getButtonClassName } from "@/app/components/ui/app-button";
import { FormField, fieldControlClassName, readOnlyFieldClassName } from "@/app/components/ui/form-field";
import { InlineStatus } from "@/app/components/ui/inline-status";
import { PageHeading } from "@/app/components/ui/page-heading";
import { SurfaceCard } from "@/app/components/ui/surface-card";
import type { UserLevel } from "@/lib/client/types";

type ProfileFormState = {
  goals: string;
  level: UserLevel;
  nickname: string;
};

type ProfileFormProps = {
  error: string | null;
  form: ProfileFormState;
  onChange: (updater: (current: ProfileFormState) => ProfileFormState) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  saving: boolean;
  successMessage: string | null;
};

const levels: UserLevel[] = ["beginner", "intermediate", "advanced"];

export function ProfileForm({ error, form, onChange, onSubmit, saving, successMessage }: ProfileFormProps) {
  return (
    <SurfaceCard>
      <PageHeading title="Profile setup" description="Keep this updated to personalize practice sessions." />

      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <FormField label="Nickname (optional)">
          <input
            value={form.nickname}
            onChange={(event) => onChange((current) => ({ ...current, nickname: event.target.value }))}
            className={fieldControlClassName}
          />
        </FormField>

        <div className={readOnlyFieldClassName}>
          <p className="text-xs text-zinc-500">Instrument</p>
          <p className="text-sm font-medium text-zinc-900">Guitar</p>
        </div>

        <FormField label="Level">
          <select
            value={form.level}
            onChange={(event) => onChange((current) => ({ ...current, level: event.target.value as UserLevel }))}
            className={fieldControlClassName}
          >
            {levels.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Goals">
          <textarea
            required
            value={form.goals}
            onChange={(event) => onChange((current) => ({ ...current, goals: event.target.value }))}
            className={`${fieldControlClassName} min-h-24`}
          />
        </FormField>

        <div className="flex flex-wrap gap-3">
          <AppButton disabled={saving} type="submit">
            {saving ? "Saving..." : "Save profile"}
          </AppButton>
          <Link href="/session/new" className={getButtonClassName({ variant: "secondary" })}>
            Continue to context
          </Link>
        </div>
      </form>

      {error ? <InlineStatus message={error} variant="error" className="mt-4" /> : null}
      {successMessage ? <InlineStatus message={successMessage} variant="success" className="mt-4" /> : null}
    </SurfaceCard>
  );
}
