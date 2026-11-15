import type { CSSProperties } from 'react';

type Sheet = { src: string; frames: string[] };

/** A creature from a horizontal sprite strip. Fills its box: use it as the node of a canvas overlay
 *  (`rect` with the frame's aspect ratio). Cycles the first `cycle` frames with CSS steps, back and
 *  forth; stops under reduced motion (see .creature in globals.css). Decorative, so aria-hidden. */
export function Creature({ sheet, cycle = sheet.frames.length, ms = 1600, flip = false }: { sheet: Sheet; cycle?: number; ms?: number; flip?: boolean }) {
  const n = sheet.frames.length;
  const style = {
    backgroundImage: `url(${sheet.src})`,
    backgroundSize: `${n * 100}% 100%`,
    transform: flip ? 'scaleX(-1)' : undefined,
    animationDuration: `${ms}ms`,
    animationTimingFunction: `steps(${cycle}, jump-none)`,
    '--to': n > 1 ? `${((cycle - 1) / (n - 1)) * 100}%` : '0%',
  } as CSSProperties;
  return <div aria-hidden className="creature h-full w-full" style={style} />;
}
