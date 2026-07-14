/**
 * Pure-CSS marquee (keyframes in globals @theme). Content is duplicated once;
 * reduced-motion users get the static first copy via motion-safe.
 */
export function Marquee({
  duration = "40s",
  className = "",
  children,
}: {
  duration?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div
        className="flex w-max motion-safe:animate-marquee"
        style={{ "--marquee-dur": duration } as React.CSSProperties}
      >
        <div className="flex shrink-0">{children}</div>
        <div className="flex shrink-0" aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
