// Layers 00-06 (stars, moon/clouds, volcano, far range, haze, hills, ridge, mid haze) across the whole journey.
// Strip x of stop i's landmark on layer s is PAD + s*(i*P + HANG); the screen shows ~[x-565, x+1320] around the boat.
import { C, arc, darken, diamond, ellipse, hazed, lighten, mix, palm, poly, raw, sheet, tlAt, type ArtModule, type Piece, type Pt, type Rng } from "./helpers";
import { HANG, P, PAD } from "./layers";

const f = (n: number) => (Math.round(n * 10) / 10).toString();
const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
/** Smooth value noise 0..1. */
const sm = (x: number, sc: number, seed = 0) => {
  const t = x / sc;
  const i = Math.floor(t);
  const u = (1 - Math.cos((t - i) * Math.PI)) / 2;
  return hash(i + seed * 13.7) * (1 - u) + hash(i + 1 + seed * 13.7) * u;
};
/** Linear (angular) value noise 0..1: sharp peaks and valleys. */
const jag = (x: number, sc: number, seed = 0) => {
  const t = x / sc;
  const i = Math.floor(t);
  const u = t - i;
  return hash(i + seed * 13.7) * (1 - u) + hash(i + 1 + seed * 13.7) * u;
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const gauss = (x: number, c: number, s: number) => Math.exp(-(((x - c) / s) ** 2));

/* ---------- 00 stars ---------- */
function stars(length: number, r: Rng): Piece[] {
  const out: Piece[] = [];
  const n = Math.round(length / 24);
  for (let k = 0; k < n; k++) {
    const x = r.range(20, length - 20);
    const y = 18 + 345 * Math.pow(r(), 1.45); // thinner towards the horizon
    const s = r() < 0.12 ? r.range(7, 11) : r.range(3, 6.5);
    const col = r() < 0.2 ? C.moon : C.ramp7;
    const op = f(r.range(0.45, 1));
    const body = s > 6.5 ? `<path d="${poly([[x, y - s], [x + s * 0.2, y - s * 0.2], [x + s, y], [x + s * 0.2, y + s * 0.2], [x, y + s], [x - s * 0.2, y + s * 0.2], [x - s, y], [x - s * 0.2, y - s * 0.2]])}"/>` : `<path d="${diamond(x, y, s)}"/>`;
    out.push(raw(x - s, x + s, `<g fill="${col}" opacity="${op}">${body}</g>`));
  }
  return out;
}

/* ---------- 01 moon and clouds ---------- */
const MOON_X0 = 1080;
const MOON_Y = 140;

function cloud(cx: number, cy: number, w: number, h: number, fill: string, r: Rng, op = 1): Piece {
  const humps = r.int(3, 4);
  const pts: Pt[] = [[cx - w / 2, cy]];
  let x = cx - w / 2;
  for (let k = 0; k < humps; k++) {
    const hw = (w / humps) * r.range(0.8, 1.2);
    const hh = h * r.range(0.45, 1) * (k === 0 || k === humps - 1 ? 0.55 : 1);
    pts.push(...arc(x + hw / 2, cy, hw / 2, hh, Math.PI, Math.PI * 2, 3).slice(0, -1));
    x += hw;
  }
  pts.push([x, cy], [x - w * 0.08, cy + 4], [cx - w * 0.4, cy + 5]);
  return sheet(pts, fill, r, { opacity: op });
}

function moonClouds(length: number, r: Rng, dx: number): Piece[] {
  const MOON_X = MOON_X0 + dx; // keeps the moon where it sat on the 9-stop timeline at this strip's first stop
  const out: Piece[] = [];
  out.push({ x0: MOON_X - 140, x1: MOON_X + 140, top: true, svg: `<circle cx="${MOON_X}" cy="${MOON_Y}" r="140" fill="url(#glow-F4EFD8)" opacity=".28"/>` });
  const ring = sheet(ellipse(MOON_X, MOON_Y, 61, 61, 30), "#FBF8EA", r, { rim: false });
  const disc = sheet(ellipse(MOON_X, MOON_Y, 57.5, 57.5, 30), C.moon, r, { rim: false });
  const craters = [[-18, -14, 15], [16, 6, 11], [-4, 28, 9]].map(([dx, dy, rad]) => sheet(ellipse(MOON_X + dx!, MOON_Y + dy!, rad!, rad! * 0.9, 9), C.moonShade, r, { rim: false }));
  out.push(ring, disc, ...craters);
  const cloudCol = mix(C.ramp7, C.ramp6, 0.25);
  // wisp across the moon's lower edge, two thin strips drifting past along the strip
  out.push(cloud(MOON_X + 20, MOON_Y + 62, 300, 12, mix(C.ramp7, C.ramp6, 0.45), r, 0.9));
  for (let x = 160; x < length - 200; x += r.range(330, 520)) {
    if (Math.abs(x - MOON_X) < 260) continue;
    const row = r() < 0.5;
    const y = row ? r.range(70, 130) : r.range(190, 280);
    out.push(cloud(x, y, r.range(260, 520), r.range(14, 26), row ? cloudCol : darken(cloudCol, 0.2), r, row ? 0.95 : 0.8));
    if (r() < 0.5) out.push(cloud(x + r.range(-120, 120), y + r.range(24, 40), r.range(150, 300), r.range(10, 16), mix(cloudCol, C.ramp5, 0.5), r, 0.75));
  }
  return out;
}

/* ---------- 02 volcano, 02b far range ---------- */
function volcano(r: Rng, dx: number): Piece[] {
  const col = hazed(C.ramp6, 0.3);
  const pk = 1360 + dx;
  const top = 150;
  const base = 690;
  const slope = (xb: number, xt: number, yt: number, yb: number, p: number, n: number): Pt[] =>
    Array.from({ length: n + 1 }, (_, k) => {
      const t = k / n;
      return [lerp(xb, xt, t), lerp(yb, yt, Math.pow(t, p))] as Pt;
    });
  const left = slope(pk - 610, pk - 32, top + 4, base, 1.7, 9);
  const right: Pt[] = slope(pk + 570, pk + 32, top + 4, base, 1.7, 9).reverse(); // crater lip down to the right base
  const crater: Pt[] = [[pk - 32, top + 4], [pk - 14, top + 20], [pk + 14, top + 20], [pk + 32, top + 4]];
  // right side: cone slope to a shoulder, then up to the companion peak and down
  const sx = pk + 370;
  const coneR = right.filter((p) => p[0] <= sx);
  const comp: Pt[] = [[sx + 60, 500], [sx + 200, 420], [sx + 320, 345], [sx + 400, 352], [sx + 520, 440], [sx + 660, 540], [sx + 850, base]];
  const outline: Pt[] = [...left, ...crater, ...coneR, ...comp];
  const out: Piece[] = [sheet(outline, col, r)];
  // facet planes: shaded right face of the cone and of the companion peak
  const dark = darken(col, 0.2);
  out.push(sheet([[pk + 10, top + 24], ...coneR, [sx, base], [pk + 106, base]], dark, r, { rim: false }));
  out.push(sheet([[sx + 320, 345], [sx + 400, 352], [sx + 520, 440], [sx + 660, 540], [sx + 850, base], [sx + 380, base]], dark, r, { rim: false }));
  out.push(sheet([[sx + 310, 350], [sx + 260, 420], [sx + 200, 470], [sx + 260, base], [sx + 350, base], [sx + 330, 470]], darken(col, 0.08), r, { rim: false }));
  // a thread of smoke, cut as one wavering paper ribbon
  const L: Pt[] = [];
  const R: Pt[] = [];
  for (let k = 0; k <= 12; k++) {
    const y = top + 16 - k * 14;
    const cx = pk + 20 * Math.sin(k * 0.7) + k * 3;
    const w = 4 + k * 1.8;
    L.push([cx - w, y]);
    R.push([cx + w * 0.8, y]);
  }
  out.push(sheet([...L, ...R.reverse()], mix(C.ramp7, C.ramp6, 0.3), r, { rim: false, opacity: 0.55 }));
  return out;
}

function farRange(length: number, r: Rng, dx: number): Piece[] {
  const out: Piece[] = [];
  const x0 = 700;
  /** Irregular range: peaks of varied height/width with broken shoulders; settles lower towards the sea. */
  const mk = (hTop: number) => {
    const pts: Pt[] = [[x0, 600]];
    const peaks: [Pt, Pt][] = [];
    let x = x0;
    while (x < length + 200) {
      const fall = Math.min(1, Math.max(0, (x + dx - 1585) / 1400));
      const tall = r() < 0.22 ? r.range(-45, -15) : r.range(0, 55);
      const peak: Pt = [x + r.range(40, 120), hTop + tall + fall * 85];
      const valley: Pt = [peak[0] + r.range(50, 170), hTop + 70 + r.range(0, 40) + fall * 75];
      const sh1: Pt = [lerp(x, peak[0], 0.55) + r.range(-6, 6), lerp(pts[pts.length - 1]![1], peak[1], 0.55) + r.range(6, 22)];
      const sh2: Pt = [lerp(peak[0], valley[0], 0.5), lerp(peak[1], valley[1], 0.5) - r.range(0, 12)];
      pts.push(sh1, peak, sh2, valley);
      peaks.push([peak, valley]);
      x = valley[0];
    }
    return { pts, peaks };
  };
  const back = mk(335);
  const front = mk(360);
  const bcol = hazed(C.ramp6, 0.5);
  const fcol = hazed(C.ramp6, 0.3);
  out.push(sheet([[x0, 700], ...back.pts.map((p) => [p[0], p[1] - 24] as Pt), [length, 700]], bcol, r));
  out.push(sheet([[x0, 700], ...front.pts, [length, 700]], fcol, r));
  // shaded right facet on most peaks (flat stacked sheet cut along the ridge)
  for (const [a, v] of front.peaks) if (r() < 0.65) out.push(sheet([a, [lerp(a[0], v[0], 0.5), lerp(a[1], v[1], 0.5)], v, [v[0], 700], [a[0] + (v[0] - a[0]) * 0.1, 700]], darken(fcol, 0.14), r, { rim: false }));
  return out;
}

/* ---------- haze (03, 06) ---------- */
let hid = 0;
function band(tag: string, cx: number, cy: number, rx: number, ry: number, col: string, op: number): Piece {
  const id = `${tag}-${hid++}`;
  return raw(
    cx - rx,
    cx + rx,
    `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${col}" stop-opacity="${f(op)}"/><stop offset=".55" stop-color="${col}" stop-opacity="${f(op * 0.6)}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs><ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#${id})"/>`,
  );
}
const DIAL = [0.6, 0.6, 0.6, 1, 0.7, 1, 0.3, 0.4, 0.3, 0.3];
const dialAt = (u: number) => {
  const i = Math.max(0, Math.min(8, Math.floor(u)));
  return lerp(DIAL[i]!, DIAL[i + 1]!, Math.min(1, Math.max(0, u - i)));
};
/** Dawn warmth 0..1 from stop 4.5 onward (haze turns pearly pink/gold). */
const warmAt = (u: number) => Math.max(0, Math.min(1, (u - 5.5) / 2.5));

function hazeFar(length: number, r: Rng, tl: readonly number[]): Piece[] {
  const out: Piece[] = [];
  for (const row of [0, 1]) {
    for (let x = 100 + row * 330; x < length; x += r.range(560, 760)) {
      const u = tlAt(tl, (x - PAD) / (0.08 * P));
      const col = mix(C.haze, C.dawnRose, warmAt(u) * 0.35);
      out.push(band("h3", x, 410 + row * 70 + r.range(-25, 25), r.range(420, 620), r.range(46, 72), col, 0.34 - row * 0.06));
    }
  }
  return out;
}

function hazeMid(length: number, r: Rng, tl: readonly number[]): Piece[] {
  const out: Piece[] = [];
  for (let x = 40; x < length; x += r.range(300, 420)) {
    const u = tlAt(tl, (x - PAD) / (0.3 * P));
    const d = dialAt(u);
    const col = mix(lighten(C.haze, 0.1), C.dawnGold, warmAt(u) * 0.3);
    out.push(band("h6", x, r.range(560, 610), r.range(380, 560), 55 + 90 * d + r.range(0, 25), col, 0.3 + 0.2 * d));
    if (r() < 0.55) out.push(band("h6", x + r.range(-150, 150), r.range(450, 520), r.range(300, 460), 36 + 50 * d, col, 0.16 + 0.1 * d));
  }
  return out;
}

/* ---------- hills (04) and ridge (05): skyline blended from one profile per stop ---------- */
type Prof = (x: number) => number;
type RidgeCfg = { s: number; z0: number; fill: string; back: string; base: number; spread: number; profs: Prof[]; fine: boolean[]; dip?: number };

function ridge(L: number, c: RidgeCfg, r: Rng) {
  const lm0 = PAD + c.s * HANG;
  const step = c.s * P;
  const z0 = c.z0; // zone i is centred where stop i's focus sits on screen, right of the boat
  const weights = (x: number) => {
    const u = Math.max(0, Math.min(c.profs.length - 1, (x - z0) / step));
    const w = c.profs.map((_, i) => Math.max(0, 1 - Math.abs(u - i) / 1.5));
    const t = w.reduce((a, b) => a + b, 0);
    return w.map((v) => v / t);
  };
  const yAt = (x: number) => {
    const w = weights(x);
    let y = 0;
    for (let i = 0; i < w.length; i++) if (w[i]! > 0.001) y += w[i]! * c.profs[i]!(x);
    if (c.dip) for (let i = 0; i < c.profs.length; i++) y += c.dip * gauss(x, lm0 + i * step, step * 0.17);
    return y;
  };
  const pts: Pt[] = [];
  const backPts: Pt[] = [];
  for (let x = 0; x <= L; ) {
    const w = weights(x);
    const fine = w.reduce((a, v, i) => a + (c.fine[i] ? v : 0), 0);
    pts.push([x, yAt(x)]);
    backPts.push([x, yAt(x * 1.07 + 311) - 26 - 14 * sm(x, 190, 4)]);
    x += 32 - 22 * Math.min(1, fine * 1.6);
  }
  const sheets: Piece[] = [
    sheet([[0, c.base], ...backPts, [L, c.base]], c.back, r),
    sheet([[0, c.base], ...pts, [L, c.base]], c.fill, r),
  ];
  return { yAt, sheets, lm0: z0, step };
}

const mossy = (b: number): Prof => (x) => b + 38 * sm(x, 170) + 14 * sm(x, 62, 2);
const terraced = (b: number, q: number): Prof => (x) => b + Math.round((90 * sm(x, 300, 5)) / q) * q - 18 * sm(x, 70, 6);
const jungle = (b: number, a: number): Prof => (x) => b + a * (0.65 - jag(x, 44, 7)) * 1.2 - a * 0.5 * jag(x, 17, 8) + 14 * sm(x, 400, 9);
const lowRound = (b: number, a: number): Prof => (x) => b + a * sm(x, 210, 10);
/** The fork: a low, open skyline between the spring cliff and the terraces. */
const forkHill = (b: number): Prof => (x) => b + 22 * sm(x, 240, 17) + 6 * sm(x, 70, 18);
const canopy = (b: number, a: number, l: number): Prof => (x) => b + 18 * sm(x, 260, 11) - a * Math.sin(Math.PI * ((x / l) % 1));
const shore = (b: number): Prof => (x) => b + 12 * sm(x, 210, 12) + 3 * sm(x, 30, 13);
const roofs = (b: number, w: number): Prof => (x) => {
  const i = Math.floor(x / w);
  const fr = (x % w) / w;
  return b - 18 * hash(i + 77) - 20 * (1 - Math.abs(2 * fr - 1)) + 6 * sm(x, 300, 14);
};

/** Local stop index of timeline stop t on this strip (fractional t allowed), or null when the strip has no stop that near. */
const localOf = (tl: readonly number[], t: number): number | null => {
  const k = tl.findIndex((v) => Math.abs(v - t) < 1.5);
  return k < 0 ? null : k + (t - tl[k]!);
};

function hills(length: number, r: Rng, tl: readonly number[]): Piece[] {
  const col = hazed(C.ramp5, 0.1);
  const lm0 = 1400;
  const step = 0.14 * P;
  const headland: Prof = (x) => 508 + 3 * sm(x, 120, 15) - 52 * gauss(x, lm0 + step * ((localOf(tl, 9) ?? 0) + 0.15), 170) - 18 * gauss(x, lm0 + step * ((localOf(tl, 9) ?? 0) + 0.9), 120);
  const g = ridge(length, { s: 0.14, z0: 1400, fill: col, back: hazed(C.ramp5, 0.45), base: 700, spread: 1.5, profs: tl.map((t) => [mossy(440), forkHill(450), terraced(392, 14), jungle(392, 105), lowRound(470, 40), canopy(446, 20, 36), shore(492), roofs(500, 44), headland, headland][t]!), fine: tl.map((t) => t === 2 || t === 7 || t === 9) }, r);
  const out = [...g.sheets];
  // shore palms (stops 4.6-5.6) and a handful of warm windows on the village rooftops
  const palmFill = darken(col, 0.18);
  const shoreAt = tl.includes(6) ? localOf(tl, 6) : null;
  for (let k = 0; k < 5; k++) {
    const x = g.lm0 + g.step * ((shoreAt ?? 0) - 0.1 + k * 0.2) + r.range(-6, 6);
    if (shoreAt !== null) out.push(...palm(x, g.yAt(x) + 6, r.range(42, 60), r, palmFill));
  }
  // warm windows in the middle of the village houses (house width 44)
  const village = tl.includes(7) ? localOf(tl, 6.7) : null;
  for (let k = 0; village !== null && k < 7; k++) {
    const x = (Math.floor((g.lm0 + g.step * village) / 44) + k * 2 + 0.5) * 44 - 2;
    const y = g.yAt(x) + 16;
    out.push(sheet([[x, y], [x + 4, y], [x + 4, y + 5], [x, y + 5]], mix(C.window, col, 0.2), r, { rim: false }));
  }
  return out;
}

function ridge05(length: number, r: Rng, tl: readonly number[]): Piece[] {
  const col = hazed(C.ramp4, 0.04);
  const lm0 = 1400;
  const step = 0.22 * P;
  const lowSea: Prof = (x) => 565 + 4 * sm(x, 100, 16) - 20 * gauss(x, lm0 + step * ((localOf(tl, 9) ?? 0) + 0.2), 160);
  const g = ridge(length, { s: 0.22, z0: 1400, fill: col, back: hazed(C.ramp4, 0.35), base: 720, spread: 1.5, dip: 42, profs: tl.map((t) => [mossy(480), forkHill(492), terraced(448, 16), jungle(440, 115), lowRound(505, 34), canopy(486, 26, 44), shore(540), roofs(548, 48), lowSea, lowSea][t]!), fine: tl.map((t) => t === 2 || t === 7 || t === 9) }, r);
  const out = [...g.sheets];
  const palmFill = darken(col, 0.2);
  const shoreAt = tl.includes(6) ? localOf(tl, 6) : null;
  for (let k = 0; k < 6; k++) {
    const x = g.lm0 + g.step * ((shoreAt ?? 0) - 0.3 + k * 0.3) + r.range(-8, 8);
    if (shoreAt !== null) out.push(...palm(x, g.yAt(x) + 8, r.range(70, 100), r, palmFill));
  }
  return out;
}

/** How far (strip units) a slow layer's first stop sits from where the 9-stop timeline had it. */
const lead = (tl: readonly number[], sp: number) => sp * P * tl[0]!;

const art: ArtModule = {
  "00": ({ length, rng }) => stars(length, rng),
  "01": ({ length, tl, rng }) => moonClouds(length, rng, lead(tl, 0.03)),
  "02": ({ tl, rng }) => volcano(rng, lead(tl, 0.05)),
  "02b": ({ length, tl, rng }) => farRange(length, rng, lead(tl, 0.05)),
  "03": ({ length, tl, rng }) => hazeFar(length, rng, tl),
  "04": ({ length, tl, rng }) => hills(length, rng, tl),
  "05": ({ length, tl, rng }) => ridge05(length, rng, tl),
  "06": ({ length, tl, rng }) => hazeMid(length, rng, tl),
};

export default art;
