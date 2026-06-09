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
  const classes = [
    "rounded-[1.75rem] border border-violet-200/70 bg-white/95 p-6 shadow-[0_22px_55px_-42px_rgba(76,29,149,0.35)] sm:p-8",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
