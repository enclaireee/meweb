import type { CSSProperties } from 'react';

type Sheet = { src: string; frames: string[] };

/** A creature from a horizontal sprite strip. Fills its box: use it as the node of a canvas overlay
 *  (`rect` with the frame's aspect ratio). Cycles the first `cycle` frames back and forth by stepping the
 *  strip's `translate` (compositor-only; a background-position step repainted on the main thread every frame).
 *  Stops under reduced motion (see .creature in globals.css). Decorative, so aria-hidden. */
export function Creature({ sheet, cycle = sheet.frames.length, ms = 1600, flip = false }: { sheet: Sheet; cycle?: number; ms?: number; flip?: boolean }) {
  const n = sheet.frames.length;
  const strip = {
    width: `${n * 100}%`,
    animationDuration: `${ms}ms`,
    animationTimingFunction: `steps(${cycle}, jump-none)`,
    '--to': `${(-(cycle - 1) / n) * 100}%`,
  } as CSSProperties;
  return (
    <div aria-hidden className="h-full w-full overflow-hidden" style={flip ? { transform: 'scaleX(-1)' } : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={sheet.src} alt="" draggable={false} decoding="async" className="creature block h-full max-w-none select-none" style={strip} />
    </div>
  );
}
