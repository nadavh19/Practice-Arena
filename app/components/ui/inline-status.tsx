type InlineStatusVariant = "info" | "error" | "success" | "muted";

type InlineStatusProps = {
  message: string;
  variant?: InlineStatusVariant;
  className?: string;
};

const variantClasses: Record<InlineStatusVariant, string> = {
  info: "rounded-2xl border border-violet-200/70 bg-white px-4 py-3 text-sm text-violet-900 shadow-[0_14px_34px_-30px_rgba(76,29,149,0.35)]",
  error: "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800",
  success: "rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900",
  muted: "rounded-2xl border border-violet-200/70 bg-violet-50 px-4 py-3 text-sm text-violet-800",
};

export function InlineStatus({ message, variant = "info", className }: InlineStatusProps) {
  const classes = [variantClasses[variant], className ?? ""].filter(Boolean).join(" ");

  return <p className={classes}>{message}</p>;
}
