import { clampS, restoreY } from './timeline';
import type { Frame, IntroPhase, Lane, Quality } from './types';

// Tiny external store. No window access at module scope (SSR-safe).

export type EngineState = {
  lane: Lane | null; // null until <Stage> mounts; render falls back to Stage's initialLane
  focusId?: string;
  turning: boolean;
  reducedMotion: boolean;
  quality: Quality;
  /** Opening sequence: 'pending' until the first client frames decide, then 'play' or straight to 'done' (skipped / not played). */
  intro: IntroPhase;
};

export const SERVER_STATE: EngineState = { lane: null, turning: false, reducedMotion: false, quality: 'high', intro: 'pending' };
let state = SERVER_STATE;
const subs = new Set<() => void>();

export const getState = () => state;
export function setState(patch: Partial<EngineState>) {
  state = { ...state, ...patch };
  subs.forEach((f) => f());
}
export function subscribe(f: () => void) {
  subs.add(f);
  return () => void subs.delete(f);
}

// Per-frame channel (not React state).
let lastFrame: Frame | null = null;
const frameSubs = new Set<(f: Frame) => void>();
export function subscribeFrame(fn: (f: Frame) => void) {
  frameSubs.add(fn);
  if (lastFrame) fn(lastFrame);
  return () => void frameSubs.delete(fn);
}
export function emitFrame(f: Frame) {
  lastFrame = f;
  frameSubs.forEach((fn) => fn(f));
}

/** @internal Side effects of a lane change. <Stage> replaces these with the animated, flushSync'd versions; tests stub them. */
export const laneIO = {
  getY: () => window.scrollY,
  setY: (y: number) => window.scrollTo(0, y),
  getUnit: () => window.innerHeight,
  /** Length in screens of the lane currently rendered (read after commit, so it is the new lane). */
  getLength: () => Infinity,
  scrollTo: (y: number, smooth: boolean) => window.scrollTo({ top: y, behavior: smooth ? 'smooth' : 'instant' }),
  turn: async (swap: () => void) => swap(),
  commit: (fn: () => void) => fn(),
};

/** @internal <Stage> replaces `skip` while mounted. */
export const introIO = { skip: () => {} };

/** Jump the opening sequence to its end state (no-op when it is not playing). */
export const skipIntro = () => introIO.skip();

let saved = { y: 0, unit: 1 };

/** s = lane-local start position in screens (clamped to the lane); default: 0 for projects, the stored scrollY for main. */
export async function enterLane(lane: Lane, opts: { focusId?: string; s?: number } = {}) {
  if (state.lane === null || state.turning) return;
  if (state.lane === lane) return setState({ focusId: opts.focusId });
  if (state.lane === 'main') saved = { y: laneIO.getY(), unit: laneIO.getUnit() };
  setState({ turning: true });
  try {
    await laneIO.turn(() => {
      laneIO.commit(() => setState({ lane, focusId: opts.focusId }));
      const unit = laneIO.getUnit();
      laneIO.setY(
        opts.s !== undefined ? clampS(opts.s, laneIO.getLength()) * unit
          : lane === 'main' ? restoreY(saved, unit) : 0,
      );
    });
  } finally {
    setState({ turning: false });
  }
}

export const exitLane = () => enterLane('main');

/** Native scroll of the current lane to s (screens, clamped). Smooth is ignored under reduced motion. */
export function scrollToS(s: number, opts: { smooth?: boolean } = {}) {
  laneIO.scrollTo(clampS(s, laneIO.getLength()) * laneIO.getUnit(), !!opts.smooth && !state.reducedMotion);
}

/** @internal Stage mount/unmount. A deep link starting in projects has no saved main position: exit goes to the top. */
export function initLane(lane: Lane | null, focusId?: string) {
  saved = { y: 0, unit: 1 };
  setState({ lane, focusId, turning: false });
}
