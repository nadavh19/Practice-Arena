import type { FormEvent } from "react";
import { AppButton } from "@/app/components/ui/app-button";
import { AppSelect, type AppSelectOption } from "@/app/components/ui/app-select";
import { FormField, fieldControlClassName, readOnlyFieldClassName } from "@/app/components/ui/form-field";
import type { UserLevel } from "@/lib/client/types";

type SignupFormProps = {
  email: string;
  goals: string;
  level: UserLevel;
  onEmailChange: (value: string) => void;
  onGoalsChange: (value: string) => void;
  onLevelChange: (value: UserLevel) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  password: string;
  submitting: boolean;
};

const levelOptions: AppSelectOption<UserLevel>[] = [
  { value: "beginner", label: "Beginner", description: "Foundations and clean timing" },
  { value: "intermediate", label: "Intermediate", description: "Mixed drills and song work" },
  { value: "advanced", label: "Advanced", description: "Advanced technique and lead work" },
];

export function SignupForm({
  email,
  goals,
  level,
  onEmailChange,
  onGoalsChange,
  onLevelChange,
  onPasswordChange,
  onSubmit,
  password,
  submitting,
}: SignupFormProps) {
  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <FormField label="Email" helperText="This becomes your account login.">
        <input
          required
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          className={fieldControlClassName}
        />
      </FormField>
      <FormField label="Password" helperText="Use at least 8 characters.">
        <input
          required
          minLength={8}
          maxLength={100}
          type="password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          className={fieldControlClassName}
        />
      </FormField>
      <div className={readOnlyFieldClassName}>
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Instrument</p>
        <p className="mt-1 text-sm font-semibold text-zinc-950">Guitar</p>
      </div>
      <AppSelect
        label="Level"
        helperText="The generator uses this to pick task difficulty."
        value={level}
        options={levelOptions}
        onChange={onLevelChange}
      />
      <FormField label="Goals" helperText="Name the skill, song, or habit you want to improve.">
        <textarea
          required
          value={goals}
          onChange={(event) => onGoalsChange(event.target.value)}
          className={`${fieldControlClassName} min-h-24`}
        />
      </FormField>
      <AppButton disabled={submitting} type="submit" fullWidth>
        {submitting ? "Creating account..." : "Create account"}
      </AppButton>
    </form>
  );
}
