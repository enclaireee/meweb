/** Page section with the machine-tag header rule: TAG ———————— aside */
export function Section({
  id,
  tag,
  title,
  aside,
  className = "",
  children,
}: {
  id?: string;
  tag: string;
  title?: string;
  aside?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`scroll-mt-s5 ${className}`}>
      <div className="flex items-center gap-s2">
        <h2 className="label text-accent">{tag}</h2>
        <span className="h-px flex-1 bg-border" aria-hidden />
        {aside && <span className="label text-fg-muted">{aside}</span>}
      </div>
      {title && (
        <p className="mt-s4 font-mono text-h font-medium text-fg">{title}</p>
      )}
      <div className="mt-s5">{children}</div>
    </section>
  );
}
