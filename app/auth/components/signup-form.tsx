import type { FormEvent } from "react";
import { AppButton } from "@/app/components/ui/app-button";
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

const levels: UserLevel[] = ["beginner", "intermediate", "advanced"];

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
    <form className="mt-5 space-y-3" onSubmit={onSubmit}>
      <FormField label="Email">
        <input
          required
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          className={fieldControlClassName}
        />
      </FormField>
      <FormField label="Password">
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
        <p className="text-xs text-zinc-500">Instrument</p>
        <p className="text-sm font-medium text-zinc-900">Guitar</p>
      </div>
      <FormField label="Level">
        <select
          value={level}
          onChange={(event) => onLevelChange(event.target.value as UserLevel)}
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
