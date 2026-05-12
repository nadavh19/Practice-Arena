import type { FormEvent } from "react";
import { AppButton } from "@/app/components/ui/app-button";
import { FormField, fieldControlClassName } from "@/app/components/ui/form-field";

type LoginFormProps = {
  email: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  password: string;
  submitting: boolean;
};

export function LoginForm({
  email,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  password,
  submitting,
}: LoginFormProps) {
  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <FormField label="Email" helperText="Use the email you registered with.">
        <input
          required
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          className={fieldControlClassName}
        />
      </FormField>
      <FormField label="Password" helperText="Minimum 8 characters.">
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
      <AppButton disabled={submitting} type="submit" fullWidth>
        {submitting ? "Logging in..." : "Log in"}
      </AppButton>
    </form>
  );
}
