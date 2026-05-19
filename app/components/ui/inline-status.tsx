type InlineStatusVariant = "info" | "error" | "success" | "muted";

type InlineStatusProps = {
  message: string;
  variant?: InlineStatusVariant;
  className?: string;
};

const variantClasses: Record<InlineStatusVariant, string> = {
  info: "rounded-2xl border border-slate-200/70 bg-white px-4 py-3 text-sm text-slate-700 shadow-[0_14px_34px_-30px_rgba(15,23,42,0.45)]",
  error: "rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800",
  success: "rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800",
  muted: "rounded-2xl border border-slate-200/70 bg-slate-50 px-4 py-3 text-sm text-slate-600",
};

export function InlineStatus({ message, variant = "info", className }: InlineStatusProps) {
  const classes = [variantClasses[variant], className ?? ""].filter(Boolean).join(" ");

  return <p className={classes}>{message}</p>;
}
