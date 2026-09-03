/** Typographic container for long-form case-study copy. */
export function Prose({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`longform ${className}`}>{children}</div>;
}
