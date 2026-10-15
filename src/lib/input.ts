// Wheel, touch and keyboard normalised into step/jump intents (motion.md "Inputs").
import { LAST, STOPS } from "./nav";

export type Intent = { step: -1 | 1 } | { jump: number };

/**
 * One wheel gesture = one step. Accumulates deltaX + deltaY, fires at 60. Then stays locked until 700 ms after
 * the move ended and the wheel has been quiet (|delta| < 4) for 120 ms, which swallows trackpad inertia.
 */
export function createWheelGate() {
  let acc = 0;
  let locked = false;
  let moving = false;
  let moveEnd = -Infinity;
  let lastBig = -Infinity;
  let lastT = -Infinity;
  return {
    /** Feed one wheel event. Returns the step to take, or 0. */
    feed(delta: number, t: number): -1 | 0 | 1 {
      const big = Math.abs(delta) >= 4;
      if (locked && !moving && t >= moveEnd + 700 && t - lastBig >= 120) locked = false;
      if (big) lastBig = t;
      if (t - lastT > 300) acc = 0; // a fresh gesture starts from zero
      lastT = t;
      if (locked) return 0;
      acc += delta;
      if (Math.abs(acc) < 60) return 0;
      const dir = acc > 0 ? 1 : -1;
      acc = 0;
      locked = true;
      return dir;
    },
    moveStarted() {
      moving = true;
    },
    moveEnded(t: number) {
      moving = false;
      moveEnd = t;
    },
  };
}

/** Horizontal swipe: 48 px or 0.35 px/ms, more horizontal than vertical. Swipe left = next. */
export function swipeStep(dx: number, dy: number, ms: number): -1 | 0 | 1 {
  if (Math.abs(dx) <= Math.abs(dy) || Math.abs(dx) < 10) return 0;
  if (Math.abs(dx) < 48 && Math.abs(dx) / Math.max(1, ms) < 0.35) return 0;
  return dx < 0 ? 1 : -1;
}

/** Keyboard mapping. `onControl` = focus is on a button/link, where Space/Enter belong to the control. */
export function keyIntent(e: { key: string; shiftKey: boolean }, onControl: boolean): Intent | null {
  switch (e.key) {
    case "ArrowRight":
    case "ArrowDown":
    case "PageDown":
      return { step: 1 };
    case "ArrowLeft":
    case "ArrowUp":
    case "PageUp":
      return { step: -1 };
    case " ":
      return onControl ? null : { step: e.shiftKey ? -1 : 1 };
    case "Home":
      return { jump: 0 };
    case "End":
      return { jump: LAST };
  }
  return /^[1-9]$/.test(e.key) && Number(e.key) <= STOPS ? { jump: Number(e.key) - 1 } : null;
}
