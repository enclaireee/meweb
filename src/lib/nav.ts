// Stop/phase state machine (motion.md). Pure: no timers, no DOM.

export const STOPS = 4; // the main river: Spring, Market Pier, Village, Lighthouse
export const LAST = STOPS - 1;
/** Pools down the projects cascade (src/content/site.ts `projects`). */
export const LEVELS = 5;

export type Phase = "rest" | "moving";

export type Nav = {
  /** Settled stop (rest) or the stop being left (moving). */
  stop: number;
  phase: Phase;
  /** Destination while moving; equals stop otherwise. */
  to: number;
  /** One queued step direction while moving, or 0. */
  queued: -1 | 0 | 1;
};

export const clampStop = (n: number) => Math.max(0, Math.min(LAST, Math.round(n)));

export const initial = (stop = 0): Nav => ({ stop: clampStop(stop), phase: "rest", to: clampStop(stop), queued: 0 });

/** Move duration in ms for a jump of `d` stops. */
export const moveDuration = (d: number) => Math.min(2200, 1200 + 150 * (Math.max(1, Math.abs(d)) - 1));

export function step(s: Nav, dir: -1 | 1): Nav {
  if (s.phase === "moving") return { ...s, queued: dir }; // latest input wins, max one queued
  const to = clampStop(s.stop + dir);
  return to === s.stop ? s : { ...s, phase: "moving", to };
}

export function jump(s: Nav, n: number): Nav {
  const to = clampStop(n);
  if (s.phase === "moving") return to === s.to ? s : { ...s, to, queued: 0 };
  return to === s.stop ? s : { ...s, phase: "moving", to, queued: 0 };
}

/** The current move finished. Starts the queued step if there is one. */
export function arrived(s: Nav): Nav {
  if (s.phase !== "moving") return s;
  const rest: Nav = { stop: s.to, phase: "rest", to: s.to, queued: 0 };
  return s.queued ? step(rest, s.queued) : rest;
}

/** Parse "#stop-2" (main river) or "#made-3" (projects cascade, 1-based) into a place. */
export function placeFromHash(hash: string): { route: "main" | "channel"; n: number } | null {
  const m = /^#(stop|made)-(\d)$/.exec(hash);
  if (!m) return null;
  return m[1] === "stop"
    ? { route: "main", n: clampStop(Number(m[2])) }
    : { route: "channel", n: Math.max(0, Math.min(LEVELS - 1, Number(m[2]) - 1)) };
}

export const hashFor = (route: "main" | "channel", n: number) => (route === "main" ? `#stop-${n}` : `#made-${n + 1}`);

const [X1, Y1, X2, Y2] = [0.45, 0.05, 0.25, 1];
const bx = (t: number) => 3 * X1 * t * (1 - t) ** 2 + 3 * X2 * t * t * (1 - t) + t ** 3;
const by = (t: number) => 3 * Y1 * t * (1 - t) ** 2 + 3 * Y2 * t * t * (1 - t) + t ** 3;

/** Glide easing, cubic-bezier(0.45, 0.05, 0.25, 1), solved for y at time x. */
export function easeGlide(x: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (bx(mid) < x) lo = mid;
    else hi = mid;
  }
  return by((lo + hi) / 2);
}
