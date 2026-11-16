import { describe, expect, it } from 'vitest';
import {
  apply, boxStyle, cutPlan, groupMatrix, layerMatrix, MAX_LIVE, mul, parseOrigin, PERSPECTIVE, rectStyle, rotYProject, tf,
  withParallax, type Step,
} from './geometry';
import { REST } from './timeline';
import type { Pose, Rect } from './types';

// ---------- An independent model of how the browser places the DOM (live layer in the canvas-space box) ----------
// 4x4 row-major matrices acting on column vectors (x, y, z, 1).
type M4 = number[];
const m4 = (rows: number[][]): M4 => rows.flat();
const id4 = () => m4([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
const mm = (a: M4, b: M4): M4 => {
  const o = new Array(16).fill(0);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) for (let k = 0; k < 4; k++) o[r * 4 + c] += a[r * 4 + k]! * b[k * 4 + c]!;
  return o;
};
const tr = (x: number, y: number, z = 0) => m4([[1, 0, 0, x], [0, 1, 0, y], [0, 0, 1, z], [0, 0, 0, 1]]);
const vec = (m: M4, x: number, y: number, z = 0) =>
  [0, 1, 2, 3].map((r) => m[r * 4]! * x + m[r * 4 + 1]! * y + m[r * 4 + 2]! * z + m[r * 4 + 3]!);

/** CSS length: 'n%' of `of`, 'npx', or a bare number. */
const length = (s: string, of: number) => (s.endsWith('%') ? (parseFloat(s) / 100) * of : parseFloat(s));
/** Parses the transform function lists the engine writes (translate, translate3d, rotate, rotateY, scale). */
function cssTransform(str: string, w: number, h: number): M4 {
  let m = id4();
  for (const [, fn, raw] of str.matchAll(/(\w+)\(([^)]*)\)/g)) {
    const a = raw!.split(',').map((x) => x.trim());
    const deg = (parseFloat(a[0]!) * Math.PI) / 180, c = Math.cos(deg), s = Math.sin(deg);
    let n: M4;
    if (fn === 'translate' || fn === 'translate3d') n = tr(length(a[0]!, w), length(a[1]!, h));
    else if (fn === 'rotate') n = m4([[c, -s, 0, 0], [s, c, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
    else if (fn === 'rotateY') n = m4([[c, 0, s, 0], [0, 1, 0, 0], [-s, 0, c, 0], [0, 0, 0, 1]]);
    else if (fn === 'scale') n = m4([[+a[0]!, 0, 0, 0], [0, +a[0]!, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
    else throw new Error(`unexpected transform function ${fn}`);
    m = mm(m, n);
  }
  return m;
}
/** transform-origin with percentages only (what the tests use), resolved against the box. */
const cssOrigin = (s: string, w: number, h: number) => {
  const [a = '50%', b = '50%'] = s.split(/\s+/);
  return [length(a, w), length(b, h)] as const;
};
/** Matrix of an element: position (left, top), then `transform` about `transform-origin`. */
const placed = (left: number, top: number, transform: string, origin: string, w: number, h: number) => {
  const [ox, oy] = cssOrigin(origin, w, h);
  return mm(mm(mm(tr(left, top), tr(ox, oy)), cssTransform(transform, w, h)), tr(-ox, -oy));
};

/**
 * Stage-px position of point (u, v) (layer-local CSS px) of a live layer, as the browser would place it from the
 * styles the engine renders: canvas-space box (boxStyle, left/top 50%, perspective) > live wrapper (rectStyle,
 * origin, tf of the pose).
 */
function domPoint(vw: number, vh: number, W: number, H: number, gOrigin: [number, number], g: Pose, l: Rect, origin: string, p: Pose, u: number, v: number) {
  const box = boxStyle(W, H, gOrigin, g);
  const [, lvh] = /max\(100%, ([\d.]+)lvh\)/.exec(String(box.width))!;
  const [aw, ah] = String(box.aspectRatio).split('/').map(Number);
  const Bw = Math.max(vw, (Number(lvh) / 100) * vh), Bh = (Bw * ah!) / aw!;
  const rs = rectStyle(l, W, H);
  const Lw = length(String(rs.width), Bw), Lh = length(String(rs.height), Bh);
  const layer = placed(length(String(rs.left), Bw), length(String(rs.top), Bh), tf(p, l.w, l.h), origin, Lw, Lh);
  const [X, Y, Z] = vec(layer, u, v);
  // perspective on the box, perspective-origin = box centre
  const f = PERSPECTIVE / (PERSPECTIVE - Z!);
  const px = Bw / 2 + (X! - Bw / 2) * f, py = Bh / 2 + (Y! - Bh / 2) * f;
  const boxM = placed(vw / 2, vh / 2, String(box.transform), String(box.transformOrigin), Bw, Bh);
  const [x, y] = vec(boxM, px, py);
  return { x: x!, y: y!, k: Bw / W };
}

/** Same point via the canvas maths (Stage draw): design-px layer point (U, V). */
function canvasPoint(vw: number, vh: number, W: number, H: number, gOrigin: [number, number], g: Pose, l: Rect, origin: string, p: Pose, U: number, V: number) {
  const [ox, oy] = parseOrigin(origin);
  const base = groupMatrix(vw, vh, W, H, gOrigin, g);
  if (!p.rotateY) {
    const [x, y] = apply(mul(base, layerMatrix(l, ox, oy, p)), U, V);
    return { x, y };
  }
  const k = Math.max(vw / W, vh / H);
  const q = rotYProject(l, ox, oy, p, W, H, PERSPECTIVE / k, U);
  const [x, y] = apply(base, q.x, q.top + ((q.bot - q.top) * V) / l.h);
  return { x, y };
}

const views: [string, number, number, number, number][] = [
  ['desktop 1280x720', 1280, 720, 1920, 1080],
  ['desktop wide 1440x700 (vertical overflow)', 1440, 700, 1920, 1080],
  ['desktop tall 1024x900 (horizontal overflow)', 1024, 900, 1920, 1080],
  ['portrait 390x844', 390, 844, 1080, 1920],
  ['portrait 768x1024', 768, 1024, 1080, 1920],
];
const g: Pose = { ...REST, x: 40, y: -20, rotate: -3, scale: 1.2 };
const l: Rect = { x: 310, y: 120, w: 820, h: 540 };

describe('geometry: canvas maths match the DOM placement of a live layer (< 1 px)', () => {
  const cases: [string, Pose, string][] = [
    ['rest', REST, '50% 50%'],
    ['track pose + parallax, off-centre origin', withParallax({ ...REST, x: 37, y: -12, rotate: 7, scale: 1.15, opacity: 0.8 }, 0.6, 0.5, -1), '30% 80%'],
    ['rotateY (perspective taper) about the left edge', { ...REST, x: 12, rotateY: -50, scale: 1.1 }, '0% 50%'],
    ['rotateY the other way about the centre', { ...REST, y: 30, rotateY: 35 }, '50% 50%'],
  ];
  for (const [name, vw, vh, W, H] of views) {
    for (const [pn, p, origin] of cases) {
      it(`${name}: ${pn}`, () => {
        const gOrigin: [number, number] = [W * 0.36, H * 0.37];
        for (const [fu, fv] of [[0, 0], [1, 0], [0, 1], [1, 1], [0.5, 0.5], [0.25, 0.9]] as const) {
          const d = domPoint(vw, vh, W, H, gOrigin, g, l, origin, p, fu * l.w * Math.max(vw / W, vh / H), fv * l.h * Math.max(vw / W, vh / H));
          const c = canvasPoint(vw, vh, W, H, gOrigin, g, l, origin, p, fu * l.w, fv * l.h);
          expect(Math.abs(d.x - c.x)).toBeLessThan(0.1);
          expect(Math.abs(d.y - c.y)).toBeLessThan(0.1);
        }
      });
    }
  }

  it('the box is the cover scale of the design canvas', () => {
    const d = domPoint(1280, 720, 1920, 1080, [960, 540], REST, { x: 0, y: 0, w: 1920, h: 1080 }, '50% 50%', REST, 0, 0);
    expect(d.k).toBeCloseTo(2 / 3);
    const pd = domPoint(390, 844, 1080, 1920, [540, 960], REST, { x: 0, y: 0, w: 1080, h: 1920 }, '50% 50%', REST, 0, 0);
    expect(pd.k).toBeCloseTo(844 / 1920);
  });
});

describe('parseOrigin', () => {
  it('reads percentages and keywords like CSS, default centre', () => {
    expect(parseOrigin()).toEqual([0.5, 0.5]);
    expect(parseOrigin('0% 50%')).toEqual([0, 0.5]);
    expect(parseOrigin('30%')).toEqual([0.3, 0.5]);
    expect(parseOrigin('left bottom')).toEqual([0, 1]);
    expect(parseOrigin('top right')).toEqual([1, 0]);
    expect(parseOrigin('top')).toEqual([0.5, 0]);
    expect(parseOrigin('center 100%')).toEqual([0.5, 1]);
  });
});

describe('cutPlan (canvas stack cut at live layers and split)', () => {
  const ids = ['sky', 'far', 'mid', 'ridge', 'near', 'fg'];
  const shape = (steps: Step[]) => steps.map((s) => (s.kind === 'canvas' ? s.ids.join('+') : s.kind === 'live' ? `[${s.id}]` : 'BEHIND'));

  it('no live layers, no split: one canvas, as before', () => {
    expect(shape(cutPlan(ids, {}).steps)).toEqual(['sky+far+mid+ridge+near+fg']);
  });

  it('split cuts only when there are behind overlays (just below the split layer)', () => {
    expect(shape(cutPlan(ids, { split: 'ridge', behind: true }).steps)).toEqual(['sky+far+mid', 'BEHIND', 'ridge+near+fg']);
    expect(shape(cutPlan(ids, { split: 'ridge' }).steps)).toEqual(['sky+far+mid+ridge+near+fg']);
  });

  it('cuts at each live layer: below on one canvas, the live element, above on the next', () => {
    expect(shape(cutPlan(ids, { live: ['mid'] }).steps)).toEqual(['sky+far', '[mid]', 'ridge+near+fg']);
  });

  it('two live layers + split with behind: four canvases', () => {
    const { steps } = cutPlan(ids, { live: ['far', 'near'], split: 'ridge', behind: true });
    expect(shape(steps)).toEqual(['sky', '[far]', 'mid', 'BEHIND', 'ridge', '[near]', 'fg']);
  });

  it('a live split layer keeps the behind overlays just below it', () => {
    expect(shape(cutPlan(ids, { live: ['ridge'], split: 'ridge', behind: true }).steps)).toEqual(['sky+far+mid', 'BEHIND', '[ridge]', 'near+fg']);
  });

  it('drops empty canvases (live first / last layer)', () => {
    expect(shape(cutPlan(ids, { live: ['sky', 'fg'] }).steps)).toEqual(['[sky]', 'far+mid+ridge+near', '[fg]']);
  });

  it('at most 2 live layers: extras are demoted into the canvas, by depth order', () => {
    const r = cutPlan(ids, { live: ['fg', 'far', 'mid'] });
    expect(r.demoted).toEqual(['fg']);
    expect(shape(r.steps)).toEqual(['sky', '[far]', '[mid]', 'ridge+near+fg']);
  });

  it('split layer not drawn (highOnly on low): behind overlays go above the art, as before', () => {
    expect(shape(cutPlan(['sky', 'far'], { split: 'ridge', behind: true }).steps)).toEqual(['sky+far', 'BEHIND']);
  });

  it('any input: every layer exactly once in depth order, <= 2 live, <= 4 canvases, one behind box at most', () => {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let n = 0; n < 500; n++) {
      const list = ids.slice(0, 1 + Math.floor(rnd() * ids.length));
      const live = list.filter(() => rnd() < 0.4);
      const split = rnd() < 0.7 ? list[Math.floor(rnd() * list.length)] : undefined;
      const { steps, demoted } = cutPlan(list, { live, split, behind: rnd() < 0.7 });
      const flat = steps.flatMap((s) => (s.kind === 'canvas' ? s.ids : s.kind === 'live' ? [s.id] : []));
      expect(flat).toEqual(list);
      const nLive = steps.filter((s) => s.kind === 'live').length;
      expect(nLive).toBeLessThanOrEqual(MAX_LIVE);
      expect(nLive + demoted.length).toBe(live.length);
      expect(steps.filter((s) => s.kind === 'canvas').length).toBeLessThanOrEqual(4);
      expect(steps.filter((s) => s.kind === 'behind').length).toBeLessThanOrEqual(1);
    }
  });
});
