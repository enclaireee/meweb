// Stop/phase state machine (motion.md). Pure: no timers, no DOM.

export const STOPS = 8;
export const LAST = STOPS - 1;

export type Phase = "rest" | "moving" | "card";

export type Nav = {
  /** Settled stop (rest/card) or the stop being left (moving). */
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
  if (s.phase === "card") return s;
  if (s.phase === "moving") return { ...s, queued: dir }; // latest input wins, max one queued
  const to = clampStop(s.stop + dir);
  return to === s.stop ? s : { ...s, phase: "moving", to };
}

export function jump(s: Nav, n: number): Nav {
  if (s.phase === "card") return s;
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

export const openCard = (s: Nav): Nav => (s.phase === "rest" ? { ...s, phase: "card" } : s);
export const closeCard = (s: Nav): Nav => (s.phase === "card" ? { ...s, phase: "rest" } : s);

/** Parse "#stop-3" into 3. */
export function stopFromHash(hash: string): number | null {
  const m = /^#stop-(\d)$/.exec(hash);
  return m ? clampStop(Number(m[1])) : null;
}

/** Glide easing, cubic-bezier(0.45, 0.05, 0.25, 1), solved for y at time x. */
export function easeGlide(x: number): number {
  const [x1, y1, x2, y2] = [0.45, 0.05, 0.25, 1];
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bx = (t: number) => 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3;
  const by = (t: number) => 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (bx(mid) < x) lo = mid;
    else hi = mid;
  }
  return by((lo + hi) / 2);
}
