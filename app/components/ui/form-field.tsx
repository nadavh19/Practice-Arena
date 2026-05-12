import type { ReactNode } from "react";

type FormFieldProps = {
  helperText?: string;
  label: string;
  children: ReactNode;
};

export const fieldControlClassName =
  "mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-zinc-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] transition-[border-color,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] placeholder:text-slate-400 focus:border-emerald-700/50 focus:outline-none focus:ring-2 focus:ring-emerald-700/15";
export const readOnlyFieldClassName =
  "rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]";

export function FormField({ helperText, label, children }: FormFieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      {helperText ? <span className="block text-xs leading-5 text-slate-500">{helperText}</span> : null}
      {children}
    </label>
  );
}
