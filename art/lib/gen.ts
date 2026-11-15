// Internals: procedural papercut generators (jittered, deterministic from an Rng). Documented in index.ts.
import { arch, cut, difference, ellipse, rect, union, type Poly, type Pt, type Rng, type Shape } from "./shapes.ts";

type Parts = { body: Shape; holes: Poly[] };
const J = (r: Rng, p: Poly, j = 1, seg = 22) => cut(p, r, j, seg);

/** Jagged paper pine: stacked drooping tiers, small trunk. h = total height. */
export function pine(r: Rng, cx: number, baseY: number, h: number): Shape {
  const n = r.int(4, 6), tw = h * 0.035;
  const parts: Poly[] = [J(r, [[cx - tw, baseY], [cx - tw * 0.7, baseY - h * 0.25], [cx + tw * 0.7, baseY - h * 0.25], [cx + tw, baseY]], 0.4, 20)];
  const top = baseY - h, tier = (h * 0.8) / n;
  for (let k = 0; k < n; k++) {
    const yt = top + k * tier * 0.9 + (k ? 0 : 0), yb = yt + tier * 1.7 * r.vary(0.12);
    const w = (h * 0.24 * (k + 1.2)) / (n + 0.2) * r.vary(0.12);
    const droop = tier * 0.25;
    parts.push(J(r, [[cx, yt], [cx + w * 0.55, yt + (yb - yt) * 0.55], [cx + w, yb - droop * 0.2], [cx + w * 0.45, yb - droop], [cx, yb], [cx - w * 0.45, yb - droop], [cx - w, yb - droop * 0.2], [cx - w * 0.55, yt + (yb - yt) * 0.55]], h * 0.008, h * 0.06));
  }
  return union(...parts);
}

/** Fern frond: curved spine with paired tapering leaflets. `lean` in [-1,1] bends it sideways. */
export function fern(r: Rng, cx: number, baseY: number, h: number, lean = 0.3): Shape {
  const parts: Poly[] = [];
  const N = 12, sp = (t: number): Pt => [cx + lean * h * 0.5 * t * t, baseY - h * t];
  const wd = Math.max(1.2, h * 0.012);
  const L: Pt[] = [], R: Pt[] = [];
  for (let k = 0; k <= N; k++) { const [x, y] = sp(k / N); const w = wd * (1 - k / N * 0.8); L.push([x - w, y]); R.push([x + w, y]); }
  parts.push([...L, ...R.reverse()]);
  for (let k = 2; k < N; k++) {
    const t = k / N, [x, y] = sp(t), [x2, y2] = sp(t + 0.04);
    const ang = Math.atan2(y2 - y, x2 - x);
    for (const side of [-1, 1]) {
      const len = h * 0.3 * Math.sin(Math.PI * (0.15 + 0.85 * (1 - t))) * r.vary(0.15) * (1 - t * 0.5);
      const a = ang + side * r.range(0.7, 1.0) - (side > 0 ? 0 : 0);
      const ux = Math.cos(a), uy = Math.sin(a), px = -uy, py = ux, wl = len * 0.16;
      parts.push([[x, y], [x + ux * len * 0.5 + px * wl, y + uy * len * 0.5 + py * wl], [x + ux * len, y + uy * len + h * 0.03], [x + ux * len * 0.5 - px * wl, y + uy * len * 0.5 - py * wl]]);
    }
  }
  return union(...parts);
}

/** Hanging strand from (x, y) down `len`, swaying; alternating leaves. */
export function vine(r: Rng, x: number, y: number, len: number, sway = 14): Shape {
  const ph = r.range(0, 6), N = 14, parts: Poly[] = [];
  const at = (t: number): Pt => [x + Math.sin(t * 3 + ph) * sway * t, y + len * t];
  const L: Pt[] = [], R: Pt[] = [];
  for (let k = 0; k <= N; k++) { const [px, py] = at(k / N); const w = 1.6 - k / N * 0.8; L.push([px - w, py]); R.push([px + w, py]); }
  parts.push([...L, ...R.reverse()]);
  const ls = Math.max(8, len / 12);
  for (let k = 1; k < N; k++) {
    if (r() < 0.2) continue;
    const [px, py] = at(k / N), side = k % 2 ? 1 : -1, s = ls * r.range(0.7, 1.3), a = r.range(0.15, 0.6);
    const tx = px + side * Math.cos(a) * s, ty = py + Math.sin(a) * s;
    parts.push([[px, py], [px + side * s * 0.45, py - s * 0.22 + s * 0.1], [tx, ty], [px + side * s * 0.4, py + s * 0.35]]);
  }
  return union(...parts);
}

/** Cliff bands for layered fills (index 0 = back/top band). Each is a stepped-ledge polygon closed down to `base`; draw in order. */
export function strata(r: Rng, o: { x0: number; x1: number; y: number; base: number; bands: number }): Shape[] {
  const out: Shape[] = [];
  for (let b = 0; b < o.bands; b++) {
    const yb = o.y + ((o.base - o.y) * b) / o.bands * 0.9;
    const pts: Poly = [];
    let x = o.x0, y = yb + r.range(-10, 10);
    pts.push([x, y]);
    while (x < o.x1) {
      x = Math.min(o.x1, x + r.range(40, 160));
      pts.push([x + r.range(-4, 4), y], [x + r.range(-6, 6), (y = yb + r.range(-18, 18) * (1 + b * 0.2))]);
    }
    out.push(union(J(r, [...pts, [o.x1, o.base], [o.x0, o.base]], 1.2, 40)));
  }
  return out;
}

/** Classical column; broken = jagged snapped top, no capital. w = shaft width at base. */
export function column(r: Rng, cx: number, baseY: number, w: number, h: number, broken = false): Shape {
  const hw = w / 2, ph = h * 0.06, top = broken ? h * r.range(0.55, 0.8) : h - ph * 1.3;
  const shaftTopW = hw * 0.82;
  const parts: Poly[] = [rect(cx - hw * 1.35, baseY - ph, w * 1.35, ph)];
  const sh: Poly = [[cx - hw, baseY - ph], [cx - shaftTopW, baseY - top], ...(broken ? ([[cx - shaftTopW * 0.4, baseY - top - r.range(8, 22)], [cx + shaftTopW * 0.1, baseY - top + r.range(0, 10)], [cx + shaftTopW * 0.6, baseY - top - r.range(14, 34)]] as Poly) : []), [cx + shaftTopW, baseY - top], [cx + hw, baseY - ph]];
  parts.push(J(r, sh, 0.8, 40));
  if (!broken) parts.push(rect(cx - hw * 1.3, baseY - h, w * 1.3, ph * 0.7), rect(cx - hw * 1.1, baseY - h + ph * 0.7, w * 1.1, ph * 0.6));
  return union(...parts);
}

/** Arched bridge: deck + parapet, with `arches` arch holes cut under it. Deck top at y. */
export function bridge(r: Rng, x0: number, x1: number, y: number, thickness: number, arches: number): Shape {
  const w = (x1 - x0) / arches, aw = w * 0.8, ah = Math.min(aw * 0.6, w * 0.7), bodyH = thickness + ah;
  const holes = Array.from({ length: arches }, (_, i) => arch(r, x0 + w * (i + 0.5), y + bodyH, aw, ah, 1));
  const body = difference(J(r, rect(x0, y, x1 - x0, bodyH), 0.8, 40), ...holes);
  const par = rect(x0, y - thickness * 0.45, x1 - x0, thickness * 0.5);
  const cren = Array.from({ length: Math.floor((x1 - x0) / 26) }, (_, i) => rect(x0 + i * 26 + 6, y - thickness * 0.75, 12, thickness * 0.35));
  return union(body, par, ...cren);
}

/** Tower: tapered shaft, crenellated cap, conical roof; `windows` arched slits. */
export function tower(r: Rng, cx: number, baseY: number, w: number, h: number, o: { windows?: number } = {}): Parts {
  const hw = w / 2, shaftH = h * 0.72, capY = baseY - shaftH, tw = hw * 0.85;
  const parts: Poly[] = [J(r, [[cx - hw, baseY], [cx - tw, capY], [cx + tw, capY], [cx + hw, baseY]], 0.8, 40)];
  parts.push(rect(cx - hw * 1.1, capY - h * 0.04, w * 1.1, h * 0.04));
  const m = 5, mw = (w * 1.1) / (m * 2 - 1);
  for (let i = 0; i < m; i++) parts.push(rect(cx - hw * 1.1 + i * 2 * mw, capY - h * 0.08, mw, h * 0.04));
  parts.push(J(r, [[cx - hw * 0.95, capY - h * 0.08], [cx + hw * 0.95, capY - h * 0.08], [cx + 1, baseY - h], [cx - 1, baseY - h]], 0.6, 30).map(([x, y]) => [x, y] as Pt));
  const n = o.windows ?? 3, ww = w * 0.16;
  const holes = Array.from({ length: n }, (_, i) => arch(r, cx, baseY - shaftH * (0.12 + (0.8 * i) / Math.max(1, n)), ww, ww * 1.8, 0.4));
  return { body: union(...parts), holes };
}

/** Crenellated broken wall segment with arch openings. Left edge x, spans w. */
export function ruinWall(r: Rng, x: number, baseY: number, w: number, h: number): Parts {
  const n = Math.max(4, Math.round(w / 38)), step = w / n, pts: Poly = [[x, baseY]];
  for (let i = 0; i < n; i++) {
    const up = i % 2 === 0, broken = r() < 0.3, top = baseY - h * (up ? 1 : 0.88) * (broken ? r.range(0.7, 0.9) : 1);
    pts.push([x + i * step, top], [x + (i + 1) * step - (up ? 0 : 0), top + (broken ? r.range(-6, 8) : 0)]);
  }
  pts.push([x + w, baseY]);
  const na = Math.max(1, Math.floor(w / 150)), aw = Math.min(70, (w / na) * 0.5);
  const holes = Array.from({ length: na }, (_, i) => arch(r, x + (w / na) * (i + 0.5), baseY, aw, h * 0.55, 0.6));
  holes.push(rect(x + w * r.range(0.1, 0.9) - 5, baseY - h * 0.8, 10, h * 0.16));
  return { body: union(J(r, pts, 0.8, 30)), holes };
}

/** Spikes from y over x0..x1, `n` of them, up to maxLen long. dir 1 hangs down (stalactites), -1 rises. */
export function stalactites(r: Rng, x0: number, x1: number, y: number, maxLen: number, n: number, dir: 1 | -1 = 1): Shape {
  const parts: Poly[] = [rect(x0, dir === 1 ? y - 30 : y, x1 - x0, 30)];
  for (let i = 0; i < n; i++) {
    const x = x0 + ((i + r.range(0.1, 0.9)) / n) * (x1 - x0), L = maxLen * r.range(0.25, 1) ** 1.3, hw = Math.max(6, L * r.range(0.12, 0.25));
    const tx = x + r.range(-hw, hw) * 0.4;
    parts.push([[x - hw, y - dir * 4], [x - hw * 0.4, y + dir * L * 0.55], [tx, y + dir * L], [x + hw * 0.5, y + dir * L * 0.5], [x + hw, y - dir * 4]]);
  }
  return union(...parts);
}

/** Hanging lantern: cap, ring handle, glass body (holes = 3 panes to glow through), foot. s = total height. */
export function lantern(cx: number, cy: number, s: number): Parts {
  const hw = s * 0.26, gy0 = cy - s * 0.24, gy1 = cy + s * 0.24;
  const body = union(
    [[cx - hw * 0.7, gy0 - s * 0.1], [cx + hw * 0.7, gy0 - s * 0.1], [cx + hw * 1.1, gy0], [cx - hw * 1.1, gy0]],
    rect(cx - hw, gy0, hw * 2, gy1 - gy0),
    [[cx - hw * 1.1, gy1], [cx + hw * 1.1, gy1], [cx + hw * 0.6, gy1 + s * 0.1], [cx - hw * 0.6, gy1 + s * 0.1]],
    difference(ellipse(cx, gy0 - s * 0.2, hw * 0.45, s * 0.12, 14), ellipse(cx, gy0 - s * 0.2, hw * 0.45 - s * 0.03, s * 0.12 - s * 0.03, 14)),
  );
  const pw = hw * 0.5, gap = (hw * 2 - pw * 3) / 4;
  const holes = [0, 1, 2].map((i) => rect(cx - hw + gap + i * (pw + gap), gy0 + s * 0.05, pw, gy1 - gy0 - s * 0.1));
  return { body, holes };
}

/** Crystal cluster of 3-5 leaning prisms. */
export function crystal(r: Rng, cx: number, baseY: number, h: number): Shape {
  const n = r.int(3, 5), parts: Poly[] = [];
  for (let i = 0; i < n; i++) {
    const c = i - (n - 1) / 2, mid = 1 - Math.abs(c) / n, ch = h * mid * r.range(0.6, 1), w = h * r.range(0.1, 0.16), lean = c * h * 0.12 + r.range(-0.05, 0.05) * h;
    const x = cx + c * w * 0.8, tipx = x + lean;
    parts.push([[x - w / 2, baseY], [tipx - w * 0.45, baseY - ch * 0.78], [tipx, baseY - ch], [tipx + w * 0.45, baseY - ch * 0.8], [x + w / 2, baseY]]);
  }
  return union(...parts);
}

/** Flat-bottomed paper cloud with a scalloped top. */
export function cloud(r: Rng, cx: number, cy: number, w: number, h: number): Shape {
  const parts: Poly[] = [J(r, ellipse(cx, cy + h * 0.15, w / 2, h * 0.28, 24), 1.5, 40)];
  const n = Math.max(3, Math.round(w / (h * 0.9)));
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n, bump = Math.sin(Math.PI * t) ** 0.7, rad = h * 0.42 * (0.5 + 0.5 * bump) * r.range(0.8, 1.1);
    parts.push(ellipse(cx + (t - 0.5) * w * 0.85, cy - rad * 0.2 + h * 0.1 - bump * h * 0.15, rad * 1.15, rad, 14));
  }
  const u = union(...parts);
  return difference(u, rect(cx - w, cy + h * 0.3, w * 2, h)); // flat base
}

/** Small gull silhouettes scattered around (cx, cy). Birds overlap-merge when dense; use spread >= size * 3. */
export function flock(r: Rng, cx: number, cy: number, spread: number, n: number, size: number): Shape {
  const parts: Poly[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1), x = cx + (t - 0.5) * 2 * spread + r.range(-0.2, 0.2) * spread, y = cy + Math.abs(t - 0.5) * spread * 0.6 + r.range(-0.15, 0.15) * spread * 0.5;
    const s = size * r.range(0.6, 1.1), f = r.range(-0.2, 0.3);
    const P = (a: number, b: number): Pt => [x + a * s, y + b * s];
    parts.push([P(-1, -0.1 + f), P(-0.5, -0.5), P(0, -0.05), P(0.5, -0.5), P(1, -0.1 - f), P(0.5, -0.22), P(0, 0.18), P(-0.5, -0.22)]);
  }
  return union(...parts);
}

/** Leaf-mass edge: flat top at y (bleed it off-canvas), scalloped leafy lower edge hanging `depth` below. */
export function canopy(r: Rng, x0: number, x1: number, y: number, depth: number): Poly {
  const pts: Poly = [[x0, y], [x1, y]];
  let x = x1;
  while (x > x0) {
    const w = Math.min(x - x0, depth * r.range(0.45, 0.9)), d = depth * r.range(0.55, 1);
    for (let k = 0; k <= 6; k++) { const a = (k / 6) * Math.PI; pts.push([x - w / 2 + Math.cos(a) * w / 2, y + depth * 0.3 + Math.sin(a) * (d - depth * 0.3) * (k === 3 ? 1.15 : 1)]); }
    x -= w;
  }
  return union(J(r, pts, depth * 0.03, depth * 0.3))[0]!;
}

/** Place up to n items at random points in region (min spacing minDist, best-effort); fn builds each. Returns their union. */
export function scatter(r: Rng, region: { x0: number; y0: number; x1: number; y1: number }, n: number, fn: (x: number, y: number, i: number) => Poly | Shape, minDist = 0): Shape {
  const at: Pt[] = [], parts: (Poly | Shape)[] = [];
  for (let tries = 0; at.length < n && tries < n * 30; tries++) {
    const x = r.range(region.x0, region.x1), y = r.range(region.y0, region.y1);
    if (minDist && at.some(([a, b]) => Math.hypot(a - x, b - y) < minDist)) continue;
    parts.push(fn(x, y, at.length));
    at.push([x, y]);
  }
  return union(...parts);
}
