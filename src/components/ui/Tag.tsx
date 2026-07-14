export function Tag({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      className={`label inline-block border px-s1 py-0.5 ${
        accent ? "border-accent text-accent" : "border-border text-fg-muted"
      }`}
    >
      {children}
    </span>
  );
}
