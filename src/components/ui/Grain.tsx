/**
 * Film grain. Spec §3.3.
 *
 * Fixed to the viewport, not to the document — real grain sits on the lens,
 * not on the subject, so it must not scroll. That also means it never
 * repaints during scroll. One inline SVG turbulence, ~1kB, no runtime cost.
 *
 * This is what stops a flat colour field from reading as a hex code.
 */
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E\")";

export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[1] mix-blend-overlay"
      style={{ backgroundImage: NOISE, opacity: "var(--grain-opacity)" }}
    />
  );
}
