import type { FormEvent } from "react";
import Link from "next/link";
import { AppButton, getButtonClassName } from "@/app/components/ui/app-button";
import { AppSelect, type AppSelectOption } from "@/app/components/ui/app-select";
import { AutoResizeTextarea } from "@/app/components/ui/auto-resize-textarea";
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

const levelOptions: AppSelectOption<UserLevel>[] = [
  { value: "beginner", label: "Beginner", description: "Foundations and clean timing" },
  { value: "intermediate", label: "Intermediate", description: "Mixed drills and song work" },
  { value: "advanced", label: "Advanced", description: "Advanced technique and lead work" },
];

export function ProfileForm({ error, form, onChange, onSubmit, saving, successMessage }: ProfileFormProps) {
  return (
    <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
      <aside className="space-y-5 lg:pt-8">
        <PageHeading
          title="Shape your practice profile"
          description="The generator uses these details to choose practice material that matches your current level and intent."
        />
        <div className="rounded-[1.75rem] border border-violet-200/70 bg-white/90 p-6 shadow-[0_24px_55px_-40px_rgba(76,29,149,0.35)] backdrop-blur">
          <p className="font-mono text-sm text-slate-500">Current setup</p>
          <p className="mt-4 text-2xl font-semibold tracking-tight text-[#171326]">{form.nickname || "Unnamed player"}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800 ring-1 ring-violet-200/70">Guitar</span>
            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 ring-1 ring-amber-200/80">
              {form.level}
            </span>
          </div>
          <p className="mt-6 max-w-[32ch] text-sm leading-6 text-slate-600">
            Your profile sets the tuning fork for every generated session.
          </p>
        </div>
      </aside>

      <SurfaceCard>
        <form className="space-y-5" onSubmit={onSubmit}>
          <FormField label="Nickname (optional)" helperText="Shown only inside the app.">
            <input
              value={form.nickname}
              onChange={(event) => onChange((current) => ({ ...current, nickname: event.target.value }))}
              className={fieldControlClassName}
              placeholder="Stage name, short name, or leave blank"
            />
          </FormField>

          <div className={readOnlyFieldClassName}>
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-violet-500">Instrument</p>
            <p className="mt-1 text-sm font-semibold text-[#171326]">Guitar</p>
          </div>

          <AppSelect
            label="Level"
            helperText="Used to tune the difficulty of generated tasks."
            value={form.level}
            options={levelOptions}
            onChange={(nextLevel) => onChange((current) => ({ ...current, level: nextLevel }))}
          />

          <FormField label="Goals" helperText="Be specific: timing, barre chords, riffs, improvisation, or a song target.">
            <AutoResizeTextarea
              required
              value={form.goals}
              onChange={(event) => onChange((current) => ({ ...current, goals: event.target.value }))}
              className="min-h-32"
            />
          </FormField>

          <div className="flex flex-wrap gap-3 pt-2">
            <AppButton disabled={saving} type="submit">
              {saving ? "Saving..." : "Save profile"}
            </AppButton>
            <Link href="/session/new" className={getButtonClassName({ variant: "secondary" })}>
              Continue to context
            </Link>
          </div>
        </form>

        {error ? <InlineStatus message={error} variant="error" className="mt-5" /> : null}
        {successMessage ? <InlineStatus message={successMessage} variant="success" className="mt-5" /> : null}
      </SurfaceCard>
    </div>
  );
}
