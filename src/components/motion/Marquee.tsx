import type { ReactNode } from "react";

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  /** Seconds per full loop. */
  duration?: number;
}

/**
 * Infinite horizontal marquee. Content is duplicated once; the track
 * translates -50% and loops. CSS-only, so reduced-motion handling lives
 * in the .marquee-track utility (animation: none).
 */
export function Marquee({ children, className, duration = 30 }: MarqueeProps) {
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className ?? ""}`}>
      <div
        className="marquee-track inline-flex w-max items-center"
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
        aria-hidden={undefined}
      >
        <div className="inline-flex shrink-0 items-center">{children}</div>
        <div className="inline-flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
