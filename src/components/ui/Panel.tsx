/** The Control Room "card": a labeled instrument panel. */
export function Panel({
  tag,
  aside,
  className = "",
  bodyClassName = "",
  children,
}: {
  /** machine tag, e.g. "PROC/01" — rendered in the panel header */
  tag?: string;
  /** right side of the header, e.g. a status or year */
  aside?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`border border-border bg-bg-subtle ${className}`}>
      {(tag || aside) && (
        <header className="flex items-center justify-between gap-s2 border-b border-border px-s3 py-s2">
          <span className="label text-fg-muted">{tag}</span>
          {aside && <span className="label text-fg-muted">{aside}</span>}
        </header>
      )}
      <div className={`p-s3 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
