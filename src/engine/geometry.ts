import type { CSSProperties } from 'react';
import type { Pose, Rect } from './types';

// Shared geometry: the canvas maths (Stage draw) and the DOM placement (SSR <img>, live layers, overlays) are
// built from these, and geometry.test.ts checks that the two agree to well under 1 px.

export const PARALLAX_MAX = 24; // design px (CSS px for viewport overlays) at parallax 1
export const PERSPECTIVE = 2000; // CSS px, on the canvas-space box (perspective-origin = box centre)

/** 2D affine in canvas `setTransform` order: x' = a x + c y + e, y' = b x + d y + f. */
export type Aff = readonly [a: number, b: number, c: number, d: number, e: number, f: number];

export const I: Aff = [1, 0, 0, 1, 0, 0];
/** m · n (n is applied first). */
export const mul = (m: Aff, n: Aff): Aff => [
  m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
];
export const T = (x: number, y: number): Aff => [1, 0, 0, 1, x, y];
export const S = (s: number): Aff => [s, 0, 0, s, 0, 0];
/** Clockwise on screen (y down), like CSS rotate() and canvas rotate(). */
export function R(deg: number): Aff {
  const r = (deg * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  return [c, s, -s, c, 0, 0];
}
export const chain = (...ms: Aff[]) => ms.reduce(mul, I);
export const apply = (m: Aff, x: number, y: number): [number, number] => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];

/** CSS transform-origin (percentages or keywords) -> fractions of the box. Default centre. Lengths in px are not supported. */
export function parseOrigin(origin?: string): [number, number] {
  const KW: Record<string, number> = { left: 0, center: 0.5, right: 1, top: 0, bottom: 1 };
  let [a = 'center', b = 'center'] = (origin ?? '').trim().split(/\s+/).filter(Boolean);
  if (a === 'top' || a === 'bottom' || b === 'left' || b === 'right') [a, b] = [b, a];
  const v = (s: string) => {
    const n = s in KW ? KW[s]! : parseFloat(s) / 100;
    return Number.isFinite(n) ? n : 0.5;
  };
  return [v(a), v(b)];
}

export function withParallax(p: Pose, parallax: number, px: number, py: number): Pose {
  if (!parallax) return p;
  return { ...p, x: p.x + px * parallax * PARALLAX_MAX, y: p.y + py * parallax * PARALLAX_MAX };
}

/**
 * Design px -> CSS px of the stage, for a W x H design canvas covering a w x h viewport, centred, with the group
 * pose g about the group origin (design px). Same as the canvas-space box: left/top 50% + `groupTf`.
 * (Group rotateY is not drawn on canvas.)
 */
export function groupMatrix(w: number, h: number, W: number, H: number, origin: readonly [number, number], g: Pose): Aff {
  const k = Math.max(w / W, h / H);
  const [ox, oy] = origin;
  return chain(T(w / 2, h / 2), S(k), T(ox - W / 2 + g.x, oy - H / 2 + g.y), R(g.rotate), S(g.scale), T(-ox, -oy));
}

/** Layer box (design px, 0..l.w x 0..l.h) -> design canvas, with pose p about origin (ox, oy fractions). No rotateY. */
export function layerMatrix(l: Rect, ox: number, oy: number, p: Pose): Aff {
  const Ox = ox * l.w, Oy = oy * l.h;
  return chain(T(l.x + Ox + p.x, l.y + Oy + p.y), R(p.rotate), S(p.scale), T(-Ox, -Oy));
}

/**
 * rotateY: projected x and top/bottom edge (design px) of the layer's vertical line at u (0..l.w), as CSS
 * `perspective: PERSPECTIVE` on the canvas-space box does (P = PERSPECTIVE / k in design px). rotate is ignored.
 */
export function rotYProject(l: Rect, ox: number, oy: number, p: Pose, W: number, H: number, P: number, u: number) {
  const Ox = ox * l.w, Oy = oy * l.h;
  const ax = l.x + Ox + p.x, ay = l.y + Oy + p.y;
  const th = (p.rotateY * Math.PI) / 180;
  const r = (u - Ox) * p.scale;
  const f = P / (P + r * Math.sin(th)); // z = -r sin(th)
  return {
    x: W / 2 + (ax + r * Math.cos(th) - W / 2) * f,
    top: H / 2 + (ay - Oy * p.scale - H / 2) * f,
    bot: H / 2 + (ay + (l.h - Oy) * p.scale - H / 2) * f,
  };
}

// ---- CSS strings (DOM placement) ----

export const r3 = (v: number) => Math.round(v * 1000) / 1000;
const len = (v: number, size: number) => (size ? `${r3((v / size) * 100)}%` : `${r3(v)}px`);
export const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/** Pose -> CSS transform. w/h = the element's own size in design px (x/y become %), 0 = x/y are CSS px. */
export function tf(p: Pose, w: number, h: number) {
  return `translate3d(${len(p.x, w)},${len(p.y, h)},0)` +
    (p.rotate ? ` rotate(${r3(p.rotate)}deg)` : '') +
    (p.rotateY ? ` rotateY(${r3(p.rotateY)}deg)` : '') +
    (p.scale !== 1 ? ` scale(${r3(p.scale)})` : '');
}
export const groupTf = (g: Pose, W: number, H: number) => `translate(-50%,-50%) ${tf(g, W, H)}`;

/** Canvas-space box: the W x H design canvas covering the stage (place it at left/top 50%). */
export const boxStyle = (W: number, H: number, origin: readonly [number, number], g: Pose): CSSProperties => ({
  width: `max(100%, ${(W / H) * 100}lvh)`, aspectRatio: `${W} / ${H}`,
  transformOrigin: `${pct(origin[0], W)} ${pct(origin[1], H)}`, transform: groupTf(g, W, H), willChange: 'transform',
});

/** A layer's rect inside the canvas-space box, as percentages of the design canvas. */
export const rectStyle = (l: Rect, W: number, H: number): CSSProperties => ({
  position: 'absolute', left: pct(l.x, W), top: pct(l.y, H), width: pct(l.w, W), height: pct(l.h, H),
});

// ---- Canvas cut plan (live layers + split) ----

export type Step =
  | { kind: 'canvas'; ids: string[] } // one <canvas>, layers drawn far to near
  | { kind: 'live'; id: string } // one DOM live layer
  | { kind: 'behind' }; // the box of `behind` overlays
export const MAX_LIVE = 2;

/**
 * Paint order (far to near) of one composition after hydration. ids = drawn layer ids sorted by depth.
 * The stack is cut at each live layer (at most MAX_LIVE; extras are `demoted` back into the canvas) and, when
 * there are `behind` overlays, just below the `split` layer. Empty canvases are dropped, so at most 4 canvases.
 */
export function cutPlan(
  ids: readonly string[], o: { live?: readonly string[]; split?: string; behind?: boolean },
): { steps: Step[]; demoted: string[] } {
  const want = ids.filter((id) => o.live?.includes(id));
  const live = new Set(want.slice(0, MAX_LIVE));
  const at = o.behind && o.split ? ids.indexOf(o.split) : -1;
  const steps: Step[] = [];
  let cur: string[] = [];
  const flush = () => {
    if (cur.length) steps.push({ kind: 'canvas', ids: cur });
    cur = [];
  };
  ids.forEach((id, i) => {
    if (i === at) {
      flush();
      steps.push({ kind: 'behind' });
    }
    if (live.has(id)) {
      flush();
      steps.push({ kind: 'live', id });
    } else cur.push(id);
  });
  flush();
  // Split layer not drawn (e.g. highOnly on 'low'): behind overlays end up above the art, as before.
  if (o.behind && at < 0) steps.push({ kind: 'behind' });
  return { steps, demoted: want.slice(MAX_LIVE) };
}
