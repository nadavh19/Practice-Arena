import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

type PageShellWidth = "md" | "lg" | "2xl" | "5xl";

type PageShellOwnProps = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  fullHeight?: boolean;
  width?: PageShellWidth;
};

type PageShellProps<T extends ElementType> = PageShellOwnProps &
  Omit<ComponentPropsWithoutRef<T>, keyof PageShellOwnProps | "as">;

const widthClasses: Record<PageShellWidth, string> = {
  md: "max-w-md",
  lg: "max-w-lg",
  "2xl": "max-w-2xl",
  "5xl": "max-w-5xl",
};

export function PageShell<T extends ElementType = "section">({
  as: Component = "section",
  children,
  className,
  fullHeight = false,
  width = "5xl",
  ...props
}: PageShellProps<T>) {
  const classes = [
    "mx-auto w-full px-4 py-8",
    widthClasses[width],
    fullHeight ? "min-h-screen" : "",
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
