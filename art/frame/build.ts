// Paper-frame alpha masks: 4 nested torn sheets, desktop + portrait. Spec: agents/art-beats/frame.md
// Run: npx tsx art/frame/build.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import { rng, noise, cut, rect, difference, union, type Poly, type Pt } from "../lib/index.ts";
import { ROOT } from "../lib/bake.ts";

const OUT = join(ROOT, "public/art/frame");
const SCALE = 1; // 0.5 looked soft when stretched to the viewport
// bolder band (lead override): [min, max] inner-edge distance, design px
const DIST: [number, number][] = [[70, 86], [52, 64], [36, 46], [18, 28]];
const TORN: [number, number][] = [[5, 18], [4, 14], [3.5, 12], [3, 10]];
const TINTS: Record<string, string[]> = {
  "b0-outside": ["#22384f", "#16263a", "#0b1420", "#05090f"],
  "b1-approach": ["#22384f", "#16263a", "#0b1420", "#05090f"],
  "b2-first-fold": ["#6a5a55", "#1f3550", "#0f1a2a", "#05090f"],
  "b3-scale-flip": ["#7a3d1c", "#4a2413", "#26120b", "#140904"],
  "b4-inner-sun": ["#7a3d1c", "#4a2413", "#26120b", "#140904"],
  "b5-understory": ["#2f5637", "#1d3a2b", "#0f2019", "#07120d"],
  "b6-lantern-vault": ["#24364f", "#0f1a2b", "#070b14", "#030508"],
  "b7-second-fold": ["#54507f", "#332f55", "#1b1a33", "#120f24"],
  "b8-seam": ["#e3d3bb", "#c9b8a6", "#6f5f6b", "#382e3c"],
  "b9-window": ["#4a3634", "#3a2a2a", "#241a1c", "#1a1214"],
  shell: ["#34486c", "#1e2b45", "#0a1120", "#04070e"],
  "p-web": ["#452617", "#2c180e", "#180c06", "#0e0703"],
  "p-data": ["#183440", "#10242d", "#07131a", "#040b0f"],
  "p-hardware": ["#3c1d2a", "#28121d", "#150910", "#0b0509"],
};

const path = (shape: Poly[]) => shape.map((p) => "M" + p.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z").join("");

/** Rounded rect ring, corner radius 30-60 jittered, then scissor-cut. */
function roundedRect(x: number, y: number, w: number, h: number, r: ReturnType<typeof rng>, jitter: number, seg: number): Poly {
  const pts: Pt[] = [];
  const corners: [number, number, number][] = [[x + w, y, -90], [x + w, y + h, 0], [x, y + h, 90], [x, y, 180]];
  corners.forEach(([cx, cy, a0], i) => {
    const R = r.range(30, 60);
    const sx = i === 0 || i === 1 ? -1 : 1, sy = i === 1 || i === 2 ? -1 : 1;
    for (let k = 0; k <= 8; k++) {
      const a = ((a0 + (k / 8) * 90) * Math.PI) / 180;
      pts.push([cx + sx * R + Math.cos(a) * R, cy + sy * R + Math.sin(a) * R]);
    }
  });
  return cut(pts, r, jitter, seg);
}

function sheetShape(W: number, H: number, i: number, portrait: boolean, taken: Map<string, number[]>): { shape: Poly[]; fold?: Poly } {
  const seed = (portrait ? 9011 : 9001) + i, bseed = (portrait ? 9110 : 9100) + i + 1;
  const [lo, hi] = DIST[i]!, d = (lo + hi) / 2, half = (hi - lo) / 2;
  const [jit, seg] = TORN[i]!;
  const r = rng(seed), br = rng(bseed), nz = noise(seed);
  const hole0 = roundedRect(d, d, W - 2 * d, H - 2 * d, r, jit, seg);
  // low-frequency wobble across the distance range: breaks every straight run
  const [cx, cy] = [W / 2, H / 2];
  const hole = hole0.map(([x, y]): Pt => {
    const w = nz(x / 110, y / 110) * half, L = Math.hypot(cx - x, cy - y);
    return [x + ((cx - x) / L) * w, y + ((cy - y) / L) * w];
  });
  // bites: notches 8-14 deep, 20-60 wide, every 180-320 along each edge, >=60 from other sheets' bites
  const bites: Poly[] = [];
  const edges = [
    { len: W, map: (u: number, v: number): Pt => [u, v] },
    { len: H, map: (u: number, v: number): Pt => [W - v, u] },
    { len: W, map: (u: number, v: number): Pt => [W - u, H - v] },
    { len: H, map: (u: number, v: number): Pt => [v, H - u] },
  ];
  edges.forEach((e, ei) => {
    const key = String(ei), used = taken.get(key) ?? [];
    let u = 110 + br.range(0, 150);
    while (u < e.len - 110) {
      let c = u;
      for (let t = 0; t < 20 && used.some((q) => Math.abs(q - c) < 60 + 40); t++) c += 25;
      const w = br.range(20, 60), dp = br.range(8, 14);
      const q = cut(rect(0, 0, w, dp + 6), br, 1.5, 8).map(([a, b]) => e.map(c - w / 2 + a, d - dp + b));
      bites.push(q);
      used.push(c);
      u = c + br.range(180, 320);
    }
    taken.set(key, used);
  });
  const full = rect(0, 0, W, H);
  const holeU = union(hole, ...bites);
  const shape = difference(full, ...holeU);
  // folded corner: sheet 2 bottom right, sheet 3 top left (40 px triangle, drawn at alpha .85)
  let fold: Poly | undefined;
  if (i === 1) fold = [[W - d, H - d], [W - d - 40, H - d], [W - d, H - d - 40]];
  if (i === 2) fold = [[d, d], [d + 40, d], [d, d + 40]];
  return { shape, fold };
}

const manifest: { desktop: string[]; portrait: string[]; tints: typeof TINTS } = { desktop: [], portrait: [], tints: TINTS };
mkdirSync(OUT, { recursive: true });
let total = 0;
for (const [kind, W, H, portrait] of [["d", 1920, 1080, false], ["p", 1080, 1920, true]] as const) {
  const taken = new Map<string, number[]>();
  const rasters: Buffer[] = [];
  for (let i = 0; i < 4; i++) {
    const { shape, fold } = sheetShape(W, H, i, portrait, taken);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * SCALE}" height="${H * SCALE}"><path fill="#fff" fill-rule="evenodd" d="${path(shape)}"/>${fold ? `<path fill="#fff" fill-opacity=".85" d="${path([fold])}"/>` : ""}</svg>`;
    const buf = await sharp(Buffer.from(svg)).ensureAlpha().webp({ lossless: true, effort: 6 }).toBuffer();
    const name = `frame-${kind}-${i + 1}.webp`;
    writeFileSync(join(OUT, name), buf);
    (portrait ? manifest.portrait : manifest.desktop).push(name);
    total += buf.length;
    rasters.push(buf);
    console.log(name, buf.length, "bytes");
  }
  // preview: b0-outside tints, paint order, drop shadow, grey bg
  const ops: OverlayOptions[] = [];
  for (let i = 0; i < 4; i++) {
    const mask = await sharp(rasters[i]).resize(W, H).png().toBuffer();
    const solid = (c: string | { r: number; g: number; b: number; alpha: number }) => sharp({ create: { width: W, height: H, channels: 4, background: c } });
    const shadow = await solid("#000").composite([{ input: mask, blend: "dest-in" }]).blur(3).linear([1, 1, 1, 0.45], [0, 0, 0, 0]).png().toBuffer();
    const tint = await solid(TINTS["b0-outside"]![i]!).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
    ops.push({ input: shadow, left: 0, top: 2 }, { input: tint, left: 0, top: 0 });
  }
  await solid_bg(W, H).composite(ops).png().toFile(join(ROOT, "art/frame", `preview-${portrait ? "portrait" : "desktop"}.png`));
}
function solid_bg(W: number, H: number) {
  return sharp({ create: { width: W, height: H, channels: 4, background: "#808080" } });
}
const mj = JSON.stringify(manifest, null, 2) + "\n";
writeFileSync(join(OUT, "manifest.json"), mj);
console.log("total", total + mj.length, "bytes");
