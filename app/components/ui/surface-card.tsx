import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type SurfaceCardOwnProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
};

type SurfaceCardProps<T extends ElementType> = SurfaceCardOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof SurfaceCardOwnProps | "as">;

export function SurfaceCard<T extends ElementType = "section">({
  as: Component = "section",
  children,
  className,
  ...props
}: SurfaceCardProps<T>) {
  const classes = ["rounded-xl border border-zinc-200 bg-white p-6 shadow-sm", className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
