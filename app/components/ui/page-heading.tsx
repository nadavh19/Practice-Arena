type PageHeadingProps = {
  title: string;
  description?: string;
  titleClassName?: string;
};

export function PageHeading({ title, description, titleClassName }: PageHeadingProps) {
  return (
    <header>
      <h1 className={["text-2xl font-semibold", titleClassName ?? ""].filter(Boolean).join(" ")}>{title}</h1>
      {description ? <p className="mt-1 text-sm text-zinc-600">{description}</p> : null}
    </header>
  );
}
