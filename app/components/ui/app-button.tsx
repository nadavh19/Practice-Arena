import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary";

type ButtonClassNameOptions = {
  fullWidth?: boolean;
  variant?: ButtonVariant;
};

type AppButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonClassNameOptions;

export function getButtonClassName({ fullWidth = false, variant = "primary" }: ButtonClassNameOptions = {}) {
  const baseClassName = "rounded-md px-4 py-2 text-sm font-medium disabled:opacity-50";

  const variantClassName =
    variant === "primary"
      ? "bg-zinc-900 text-white"
      : "border border-zinc-300 text-zinc-700 hover:bg-zinc-100";

  return [baseClassName, variantClassName, fullWidth ? "w-full" : ""].filter(Boolean).join(" ");
}

export function AppButton({ className, fullWidth = false, variant = "primary", ...props }: AppButtonProps) {
  const classes = [getButtonClassName({ fullWidth, variant }), className ?? ""].filter(Boolean).join(" ");

  return <button className={classes} {...props} />;
}
