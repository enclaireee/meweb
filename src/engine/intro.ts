import { evaluate } from './timeline';
import type { Lane, Pose, Track } from './types';

// Opening sequence: pure helpers (no window access). The runtime lives in Stage.tsx.

export const INTRO_MAX_MS = 2500;

/** Intro length in ms, clamped to (0, INTRO_MAX_MS]; 0 = no intro. */
export const introMs = (intro: { ms: number } | undefined) =>
  intro && intro.ms > 0 ? Math.min(intro.ms, INTRO_MAX_MS) : 0;

/** Intro progress u = elapsed / ms, clamped to [0, 1]. */
export const introProgress = (elapsed: number, ms: number) => (ms > 0 ? Math.min(1, Math.max(0, elapsed / ms)) : 1);

/**
 * Scroll pose blended with the intro pose at intro progress u: x, y, rotate, rotateY add; scale and opacity multiply.
 * u = null (no intro playing) or u >= 1 (done): the intro track is ignored, the scroll pose is returned as is.
 * Pure: never mutates `p`.
 */
export function introBlend(p: Pose, track: Track | undefined, u: number | null): Pose {
  if (u === null || u >= 1 || !track?.length) return p;
  const q = evaluate(track, Math.max(0, u));
  return {
    x: p.x + q.x, y: p.y + q.y, rotate: p.rotate + q.rotate, rotateY: p.rotateY + q.rotateY,
    scale: p.scale * q.scale, opacity: p.opacity * q.opacity,
  };
}

export type IntroEnv = {
  /** Stage props. */
  initialLane: Lane;
  initialS?: number;
  initialFocusId?: string;
  /** Lane currently rendered. */
  lane: Lane;
  scrollY: number;
  hash: string;
  reducedMotion: boolean;
  /** <html> has the class `intro-wait` (added by the inline head script). */
  introWait: boolean;
  /** introMs(beats[0].intro) */
  ms: number;
};

/** Whether the opening sequence may play. Checked at the first client frame and again one rAF later. */
export const introPlays = (e: IntroEnv) =>
  e.initialLane === 'main' && e.lane === 'main' && e.initialS === undefined && e.initialFocusId === undefined &&
  e.scrollY < 2 && !e.hash && !e.reducedMotion && e.introWait && e.ms > 0;
