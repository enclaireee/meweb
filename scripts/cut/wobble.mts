/**
 * The hand-cut edge (architecture.md §7.2): low-frequency blade drift, faint chatter, crisp corners,
 * and scissor facets. Everything is seeded by the sheet id, so the same shape always cuts the same way.
 */
import { createNoise2D } from "simplex-noise";
import { mulberry32, hashString } from "../../src/lib/rng.ts";
import type { Poly } from "./parse.mts";

export type WobbleParams = {
  step: number;
  driftFrac: number;
  driftMin: number;
  driftMax: number;
  driftWave: [number, number];
  chatterAmp: [number, number];
  chatterWave: [number, number];
  cornerDeg: number;
  cornerWindow: number;
  cornerFalloff: number;
  facetEvery: [number, number];
  facetKinkDeg: number;
  simplify: number;
  blunt: number;
};

/** scene sheets, world units (1 ≈ 1 cm) */
export const SCENE: WobbleParams = {
  step: 0.5,
  driftFrac: 0.0015,
  driftMin: 0.03,
  driftMax: 0.25,
  driftWave: [8, 15],
  chatterAmp: [0.015, 0.03],
  chatterWave: [1.5, 3],
  cornerDeg: 35,
  cornerWindow: 0.2,
  cornerFalloff: 0.6,
  facetEvery: [6, 12],
  facetKinkDeg: 1.5,
  simplify: 0.01,
  blunt: 0.05,
};

/** HTML clip-paths, percent units of the element box */
export const UI: WobbleParams = {
  step: 0.8,
  driftFrac: 0.0022,
  driftMin: 0.12,
  driftMax: 0.3,
  driftWave: [14, 26],
  chatterAmp: [0.03, 0.06],
  chatterWave: [2.5, 4.5],
  cornerDeg: 35,
  cornerWindow: 0.6,
  cornerFalloff: 1.6,
  facetEvery: [9, 18],
  facetKinkDeg: 1.2,
  simplify: 0.03,
  blunt: 0.2,
};

const TAU = Math.PI * 2;
const range = (r: () => number, [a, b]: [number, number]) => a + (b - a) * r();

/** Vertices where the outline turns sharply, measured over a small window so sampled arcs don't count. */
function findCorners(p: Poly, params: WobbleParams): number[] {
  const n = p.length;
  const walk = (i: number, dir: 1 | -1) => {
    let d = 0;
    let j = i;
    for (let k = 0; k < n; k++) {
      const nj = (j + dir + n) % n;
      d += Math.hypot(p[nj]!.x - p[j]!.x, p[nj]!.y - p[j]!.y);
      j = nj;
      if (d >= params.cornerWindow) break;
    }
    return p[j]!;
  };
  const angles = p.map((c, i) => {
    const a = walk(i, -1);
    const b = walk(i, 1);
    const inx = c.x - a.x;
    const iny = c.y - a.y;
    const outx = b.x - c.x;
    const outy = b.y - c.y;
    const cos = (inx * outx + iny * outy) / (Math.hypot(inx, iny) * Math.hypot(outx, outy) || 1);
    return Math.acos(Math.max(-1, Math.min(1, cos))) * (180 / Math.PI);
  });
  // non-maximum suppression over the window
  const corners: number[] = [];
  for (let i = 0; i < n; i++) {
    if (angles[i]! < params.cornerDeg) continue;
    let isMax = true;
    let d = 0;
    for (let k = 1; k < n && d < params.cornerWindow * 2; k++) {
      const j = (i + k) % n;
      const jm = (i + k - 1) % n;
      d += Math.hypot(p[j]!.x - p[jm]!.x, p[j]!.y - p[jm]!.y);
      if (angles[j]! > angles[i]!) isMax = false;
    }
    d = 0;
    for (let k = 1; k < n && d < params.cornerWindow * 2; k++) {
      const j = (i - k + n) % n;
      const jp = (i - k + 1 + n) % n;
      d += Math.hypot(p[j]!.x - p[jp]!.x, p[j]!.y - p[jp]!.y);
      if (angles[j]! >= angles[i]!) isMax = false;
    }
    if (isMax) corners.push(i);
  }
  return corners;
}

/** Resample a chain of points (open polyline) uniformly, keeping both ends. */
function resampleChain(chain: Poly, step: number): Poly {
  const lens = [0];
  for (let i = 1; i < chain.length; i++) lens.push(lens[i - 1]! + Math.hypot(chain[i]!.x - chain[i - 1]!.x, chain[i]!.y - chain[i - 1]!.y));
  const L = lens[lens.length - 1]!;
  if (L === 0) return [chain[0]!];
  const s = Math.min(step, Math.max(0.1 * (step / 0.5), L / 24));
  const count = Math.max(1, Math.ceil(L / s));
  const out: Poly = [];
  let j = 0;
  for (let k = 0; k < count; k++) {
    const target = (k / count) * L;
    while (j < lens.length - 2 && lens[j + 1]! < target) j++;
    const seg = lens[j + 1]! - lens[j]! || 1;
    const t = (target - lens[j]!) / seg;
    out.push({ x: chain[j]!.x + (chain[j + 1]!.x - chain[j]!.x) * t, y: chain[j]!.y + (chain[j + 1]!.y - chain[j]!.y) * t });
  }
  return out; // the chain's last point is the next chain's first
}

export type WobbleResult = { poly: Poly; corners: number };

export function wobble(p: Poly, seedKey: string, bboxMax: number, cut: "knife" | "scissors", params: WobbleParams): WobbleResult {
  const rng = mulberry32(hashString(seedKey));
  const cornersIdx = findCorners(p, params);

  // 1. resample between corners, corners kept exactly
  let pts: Poly = [];
  const isCorner: boolean[] = [];
  if (cornersIdx.length === 0) {
    const closed = [...p, p[0]!];
    pts = resampleChain(closed, params.step);
    pts.forEach(() => isCorner.push(false));
  } else {
    for (let c = 0; c < cornersIdx.length; c++) {
      const a = cornersIdx[c]!;
      const b = cornersIdx[(c + 1) % cornersIdx.length]!;
      const chain: Poly = [];
      for (let i = a; ; i = (i + 1) % p.length) {
        chain.push(p[i]!);
        if (i === b && chain.length > 1) break;
        if (chain.length > p.length + 1) break;
      }
      const r = resampleChain(chain, params.step);
      r.forEach((q, k) => {
        pts.push(q);
        isCorner.push(k === 0);
      });
    }
  }
  const n = pts.length;
  if (n < 3) return { poly: p, corners: cornersIdx.length };

  // 2. arc positions and distance to the nearest corner (wrapping)
  const s: number[] = [0];
  for (let i = 1; i < n; i++) s.push(s[i - 1]! + Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y));
  const L = s[n - 1]! + Math.hypot(pts[0]!.x - pts[n - 1]!.x, pts[0]!.y - pts[n - 1]!.y);
  const cornerS = s.filter((_, i) => isCorner[i]);
  const distToCorner = (si: number) => {
    let d = Infinity;
    for (const c of cornerS) {
      const dd = Math.abs(si - c);
      d = Math.min(d, dd, L - dd);
    }
    return d;
  };

  // 3. noise: periodic along the loop (sampled on a circle in noise space) so the seam is invisible
  const drift = createNoise2D(mulberry32(hashString(seedKey + ":drift")));
  const chatter = createNoise2D(mulberry32(hashString(seedKey + ":chatter")));
  const driftWave = range(rng, params.driftWave);
  const chatterWave = range(rng, params.chatterWave);
  const driftAmp = Math.min(params.driftMax, Math.max(params.driftMin, bboxMax * params.driftFrac));
  const chatterAmp = range(rng, params.chatterAmp);
  const loop = (noise: (x: number, y: number) => number, si: number, wave: number) => {
    const R = L / (TAU * wave);
    const th = (TAU * si) / L;
    return noise(R * Math.cos(th), R * Math.sin(th));
  };

  // 4. scissor facets: piecewise-linear drift whose slope changes where the scissors restarted
  const facet = new Float64Array(n);
  if (cut === "scissors" && L > params.facetEvery[0] * 2) {
    const maxSlope = Math.tan((params.facetKinkDeg * Math.PI) / 180) / 2;
    const breaks: number[] = [];
    for (let b = range(rng, params.facetEvery); b < L - params.facetEvery[0]; b += range(rng, params.facetEvery)) breaks.push(b);
    breaks.push(L);
    let seg = 0;
    let start = 0;
    let f0 = 0;
    let slope = 0;
    const pick = (f: number, remaining: number, last: boolean) =>
      last ? -f / Math.max(remaining, 1e-6) : -Math.sign(f || rng() - 0.5) * maxSlope * (0.3 + 0.7 * rng());
    slope = pick(0, breaks[0]!, breaks.length === 1);
    for (let i = 0; i < n; i++) {
      while (s[i]! > breaks[seg]!) {
        f0 += slope * (breaks[seg]! - start);
        start = breaks[seg]!;
        seg++;
        slope = pick(f0, breaks[seg]! - start, seg === breaks.length - 1);
      }
      facet[i] = f0 + slope * (s[i]! - start);
    }
  }

  // 5. displace along the normal, fading to zero at corners
  const out: Poly = pts.map((q, i) => {
    const prev = pts[(i - 1 + n) % n]!;
    const next = pts[(i + 1) % n]!;
    let tx = next.x - prev.x;
    let ty = next.y - prev.y;
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const fall = smooth(0, params.cornerFalloff, distToCorner(s[i]!));
    const disp = fall * (driftAmp * loop(drift, s[i]!, driftWave) + chatterAmp * loop(chatter, s[i]!, chatterWave) + facet[i]!);
    return { x: q.x + ty * disp, y: q.y - tx * disp };
  });
  return { poly: out, corners: cornerS.length };
}

function smooth(e0: number, e1: number, x: number) {
  const t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}
