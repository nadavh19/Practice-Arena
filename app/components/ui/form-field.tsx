import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  children: ReactNode;
};

export const fieldControlClassName = "mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm";
export const readOnlyFieldClassName = "rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2";

export function FormField({ label, children }: FormFieldProps) {
  return (
    <label className="block">
      <span className="text-sm text-zinc-700">{label}</span>
      {children}
    </label>
  );
}
