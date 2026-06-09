import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonClassNameOptions = {
  fullWidth?: boolean;
  variant?: ButtonVariant;
};

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonClassNameOptions;

export function getButtonClassName({ fullWidth = false, variant = "primary" }: ButtonClassNameOptions = {}) {
  const baseClassName =
    "inline-flex cursor-pointer items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-2 focus:ring-violet-700/20 active:scale-[0.98] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50";

  const variantClassName =
    variant === "primary"
      ? "bg-violet-900 text-white shadow-[0_16px_35px_-24px_rgba(76,29,149,0.9)] hover:bg-violet-800"
      : "border border-violet-200 bg-white text-violet-950 shadow-[0_12px_30px_-26px_rgba(76,29,149,0.45)] hover:border-violet-300 hover:bg-violet-50";

  return [baseClassName, variantClassName, fullWidth ? "w-full" : ""].filter(Boolean).join(" ");
}

export function AppButton({ className, fullWidth = false, variant = "primary", ...props }: AppButtonProps) {
  const classes = [getButtonClassName({ fullWidth, variant }), className ?? ""].filter(Boolean).join(" ");

  return <button className={classes} {...props} />;
}
