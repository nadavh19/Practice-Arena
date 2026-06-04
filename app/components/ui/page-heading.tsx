type PageHeadingProps = {
  title: string;
  description?: string;
  titleClassName?: string;
};

export function PageHeading({ title, description, titleClassName }: PageHeadingProps) {
  return (
    <header className="max-w-[65ch]">
      <h1
        className={["text-3xl font-semibold leading-tight tracking-tight text-zinc-950", titleClassName ?? ""]
          .filter(Boolean)
          .join(" ")}
      >
        {title}
      </h1>
      {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
    </header>
  );  
}
