type InlineStatusVariant = "info" | "error" | "success" | "muted";

type InlineStatusProps = {
  message: string;
  variant?: InlineStatusVariant;
  className?: string;
};

const variantClasses: Record<InlineStatusVariant, string> = {
  info: "text-sm text-zinc-700",
  error: "rounded-md bg-red-50 p-2 text-sm text-red-700",
  success: "rounded-md bg-green-50 p-2 text-sm text-green-700",
  muted: "text-sm text-zinc-600",
};

export function InlineStatus({ message, variant = "info", className }: InlineStatusProps) {
  const classes = [variantClasses[variant], className ?? ""].filter(Boolean).join(" ");

  return <p className={classes}>{message}</p>;
}
