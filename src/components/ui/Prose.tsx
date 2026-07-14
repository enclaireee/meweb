/** Typographic container for long-form case-study copy. */
export function Prose({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={`prose-console max-w-[65ch] ${className}`}>{children}</div>;
}
