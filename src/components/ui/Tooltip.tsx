/** CSS-only tooltip — appears on hover and keyboard focus. */
export function Tooltip({
  tip,
  children,
}: {
  tip: string;
  children: React.ReactNode;
}) {
  return (
    <span className="group/tt relative inline-block">
      {children}
      <span
        role="tooltip"
        className="label pointer-events-none absolute bottom-full left-1/2 z-10 mb-s1 -translate-x-1/2 border border-border bg-bg-subtle px-s2 py-s1 whitespace-nowrap text-fg opacity-0 transition-opacity dur-fast group-focus-within/tt:opacity-100 group-hover/tt:opacity-100"
      >
        {tip}
      </span>
    </span>
  );
}
