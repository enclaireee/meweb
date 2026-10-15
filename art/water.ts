// Water strips W1-W3 across the whole journey: scalloped paper edges, lens-shaped ribbons and highlight slivers.
import { C, darken, mix, tlAt, poly, raw, type ArtModule, type Piece, type Pt, type Rng } from "./helpers";
import { LANTERN_DX, POST_DX } from "./helpers";
import { HANG, P, PAD, WATERLINE } from "./layers";

const f = (n: number) => (Math.round(n * 10) / 10).toString();
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
/** Smooth deterministic value noise 0..1 (a function of x only, so chunks join seamlessly). */
const sm = (x: number, sc: number, seed = 0) => {
  const t = x / sc;
  const i = Math.floor(t);
  const u = (1 - Math.cos((t - i) * Math.PI)) / 2;
  return hash(i + seed * 13.7) * (1 - u) + hash(i + 1 + seed * 13.7) * u;
};

/** Thin crescent (wave dash / ripple arc): w wide, bulging up by t, bottom nearly flat. */
const crescent = (cx: number, cy: number, w: number, t: number): string => {
  const n = 6;
  const top: Pt[] = [];
  const bot: Pt[] = [];
  for (let k = 0; k <= n; k++) {
    const x = cx - w / 2 + (w * k) / n;
    const s = Math.sin((Math.PI * k) / n);
    top.push([x, cy - t * s]);
    bot.push([x, cy + t * 0.3 * s]);
  }
  return poly([...top, ...bot.reverse().slice(1, -1)]);
};
/** Elliptical arc band (front arcs of a ripple ring), thickness th. */
const ring = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, th: number): string => {
  const o: Pt[] = [];
  const i: Pt[] = [];
  const n = 7;
  for (let k = 0; k <= n; k++) {
    const a = a0 + ((a1 - a0) * k) / n;
    o.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    i.push([cx + Math.cos(a) * (rx - th * 1.4), cy + Math.sin(a) * (ry - th)]);
  }
  return poly([...o, ...i.reverse()]);
};

type Strip = { top: number; per: number; amp: number; bottom: number; body: string; lip: string; lipT: number };

/** Chunked body: scalloped top edge (cusps at `top`, arcs bulging up), light lip then body shifted down. */
function body(S: Strip, length: number, sun: (x: number) => number = () => 0): Piece[] {
  const chunk = S.per * 5;
  const step = S.per / 5;
  const out: Piece[] = [];
  const edge = (x: number) => S.top - S.amp * (0.7 + 0.6 * sm(x, 420)) * Math.sin(Math.PI * ((x / S.per) % 1));
  for (let x = 0; x < length; x += chunk) {
    const pts: Pt[] = [];
    for (let xx = x; xx <= x + chunk + step * 1.01; xx += step) pts.push([xx, edge(xx)]);
    const xe = pts[pts.length - 1]![0];
    const d = (dy: number) => poly([...pts.map((p) => [p[0], p[1] + dy] as Pt), [xe, S.bottom], [x, S.bottom]]);
    // lip is a thin band only, so abutting chunks never show a lighter seam
    const band = poly([...pts, ...pts.map((p) => [p[0], p[1] + S.lipT + 8] as Pt).reverse()]);
    const k = sun(x);
    const warm = (c: string) => (k ? mix(c, "#9CC3D6", k) : c);
    out.push(raw(x, xe, `<path d="${band}" fill="${warm(S.lip)}"/><path d="${d(S.lipT)}" fill="${warm(S.body)}"/>`));
  }
  return out;
}

function ribbons(length: number, r: Rng, y0: number, y1: number, perTile: number, wr: [number, number], th: number, fill: string, op: number, bias = 1): Piece[] {
  const out: Piece[] = [];
  const n = Math.round((length / 1700) * perTile);
  for (let k = 0; k < n; k++) {
    const w = r.range(wr[0], wr[1]);
    const cx = r.range(0, length);
    const cy = y0 + (y1 - y0) * Math.pow(r(), bias);
    out.push(raw(cx - w / 2, cx + w / 2, `<path d="${crescent(cx, cy, w, th * r.range(0.8, 1.2))}" fill="${fill}" opacity="${f(op * r.range(0.7, 1))}"/>`));
  }
  return out;
}

/** 2-3 concentric thin arcs (cut ripple arcs). */
function rippleSets(length: number, r: Rng, y0: number, y1: number, perTile: number, w: number, fill: string, op: number): Piece[] {
  const out: Piece[] = [];
  const n = Math.round((length / 1700) * perTile);
  for (let k = 0; k < n; k++) {
    const cx = r.range(60, length - 60);
    const cy = r.range(y0, y1);
    const rx0 = w * r.range(0.8, 1.2) * 0.5;
    let svg = "";
    const rings = r.int(2, 3);
    for (let j = 0; j < rings; j++) svg += `<path d="${ring(cx, cy, rx0 * (1 + j * 0.55), rx0 * 0.13 * (1 + j * 0.55), 0.35, Math.PI - 0.35, 3)}" fill="${fill}" opacity="${f(op * (1 - j * 0.25))}"/>`;
    out.push(raw(cx - rx0 * 2.1, cx + rx0 * 2.1, svg));
  }
  return out;
}

/** Morning lift: 0 until the dawn stop (timeline 7), up to 0.45 at 9, so the water around the lighthouse reads sunlit. */
const morning = (s: number, tl: readonly number[]) => (x: number) => Math.max(0, Math.min(1, (tlAt(tl, (x - PAD) / (s * P)) - 7) / 2)) * 0.45;

const hi = (t: number) => mix(C.water2, C.waterHi, t);

const art: ArtModule = {
  w1: ({ length, tl, rng: r }) => [
    ...body({ top: 590, per: 64, amp: 4, bottom: 650, body: C.water1, lip: mix(C.water1, C.waterHi, 0.35), lipT: 2.5 }, length, morning(0.85, tl)),
    ...rippleSets(length, r, 600, 616, 7, 90, C.waterHi, 0.55),
    ...ribbons(length, r, 598, 614, 6, [120, 260], 3.2, C.waterHi, 0.3),
    ...ribbons(length, r, 600, 618, 5, [90, 220], 3.5, darken(C.water1, 0.4), 0.55),
  ],
  w2: ({ length, count, tl, rng: r }) => {
    const out: Piece[] = body({ top: WATERLINE + 1, per: 72, amp: 3.5, bottom: 1000, body: C.water2, lip: mix(C.water2, C.waterHi, 0.4), lipT: 2.5 }, length, morning(1, tl));
    out.push(...ribbons(length, r, 640, 990, 11, [160, 520], 9, darken(C.water2, 0.3), 0.8, 1.5));
    out.push(...ribbons(length, r, 640, 980, 10, [140, 460], 7, hi(0.12), 0.9, 1.4));
    out.push(...rippleSets(length, r, 640, 760, 6, 120, C.waterHi, 0.45));
    out.push(...ribbons(length, r, 630, 800, 14, [30, 110], 3.4, C.waterHi, 0.5, 1.6));
    for (let i = 0; i < count; i++) {
      // rings the boat leaves at its rest position (boat sits at strip x = PAD + i*P)
      const bx = PAD + i * P;
      let svg = "";
      [[96, 9], [150, 14], [214, 19]].forEach(([rx, ry], j) => (svg += `<path d="${ring(bx, 636 + j * 4, rx!, ry!, 0.25, Math.PI - 0.25, 3)}" fill="${C.waterHi}" opacity="${f(0.5 - j * 0.12)}"/>`));
      out.push(raw(bx - 220, bx + 220, svg));
      // reflection of the tag-post lantern: stacked warm slivers fading downwards
      const lx = PAD + i * P + HANG + POST_DX + LANTERN_DX - POST_DX;
      let rf = "";
      for (let k = 0; k < 7; k++) {
        const y = 630 + k * k * 2.6 + k * 6;
        const w = 46 - k * 4.5 + r.range(-4, 4);
        rf += `<path d="${crescent(lx + r.range(-5, 5), y, w, 3.4)}" fill="${k < 2 ? C.lanternCore : C.lantern}" opacity="${f(0.7 - k * 0.09)}"/>`;
      }
      out.push(raw(lx - 60, lx + 60, rf));
    }
    return out;
  },
  w3: ({ length, tl, rng: r }) => [
    ...body({ top: 872, per: 140, amp: 9, bottom: 1000, body: C.water3, lip: mix(C.water3, C.waterHi, 0.3), lipT: 4 }, length, morning(1.4, tl)),
    ...ribbons(length, r, 900, 990, 8, [220, 520], 10, darken(C.water3, 0.35), 0.8),
    ...rippleSets(length, r, 905, 975, 4, 260, C.waterHi, 0.4),
    ...ribbons(length, r, 890, 985, 8, [90, 260], 4.5, C.waterHi, 0.4),
  ],
};
export default art;
