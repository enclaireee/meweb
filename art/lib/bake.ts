// Internals: rasterise layers/sprite sheets with sharp, write manifests, composite previews.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import sharp, { type OverlayOptions } from "sharp";
import { rng, type Frag } from "./shapes.ts";

export const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const outDir = (slug: string) => join(ROOT, "public/art", slug);

export type Layer = { id: string; depth: number; frags: Frag[] };
/** A layer: painter-ordered fragments (first = behind) in design coordinates. depth 0 = farthest. */
export const layer = (id: string, depth: number, ...frags: (Frag | Frag[])[]): Layer => ({ id, depth, frags: frags.flat() });

export type Placement = { x?: number; y?: number; s?: number };
export type Composition = {
  width: number;
  height: number;
  /** Layer ids shown in this composition; default all. */
  include?: string[];
  /** Per-layer offset (design units) and scale applied on top of the sprite's own rect. */
  place?: Record<string, Placement>;
};
export type BakeOpts = { quality?: number; /** pixels per design unit, default 1 */ scale?: number };

const svgDoc = (frags: Frag[], x: number, y: number, w: number, h: number, scale: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w * scale}" height="${h * scale}">${frags.map((g) => g.svg).join("")}</svg>`;

/** Rasterise one layer to WebP trimmed to its alpha bounding box. Returns the file bytes and the sprite rect in design units. */
// Sharpness pass: the per-beat tables baked sheets at 0.4-0.75 px per design unit, which read soft on 2x
// screens. Every layer gets DENSITY more pixels (capped at 1) and at least MIN_Q quality.
const DENSITY = 1.45, MIN_Q = 40;

export async function bakeLayer(slug: string, l: Layer, o: BakeOpts = {}) {
  const scale = Math.max(o.scale ?? 1, Math.min(1, (o.scale ?? 1) * DENSITY));
  const x0 = Math.floor(Math.min(...l.frags.map((g) => g.x0)));
  const y0 = Math.floor(Math.min(...l.frags.map((g) => g.y0)));
  const w = Math.ceil(Math.max(...l.frags.map((g) => g.x1))) - x0;
  const h = Math.ceil(Math.max(...l.frags.map((g) => g.y1))) - y0;
  const { data, info } = await sharp(Buffer.from(svgDoc(l.frags, x0, y0, w, h, scale))).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let [minX, minY, maxX, maxY] = [info.width, info.height, -1, -1];
  for (let y = 0; y < info.height; y++)
    for (let x = 0; x < info.width; x++)
      if (data[(y * info.width + x) * 4 + 3]! > 0) {
        if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
  if (maxX < 0) return null; // fully transparent
  const tw = maxX - minX + 1, th = maxY - minY + 1;
  const buf = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract({ left: minX, top: minY, width: tw, height: th })
    .webp({ quality: Math.max(MIN_Q, o.quality ?? 82), alphaQuality: 100 })
    .toBuffer();
  mkdirSync(outDir(slug), { recursive: true });
  writeFileSync(join(outDir(slug), `${l.id}.webp`), buf);
  return { id: l.id, depth: l.depth, bytes: buf.length, x: x0 + minX / scale, y: y0 + minY / scale, w: tw / scale, h: th / scale };
}

/**
 * Bake all layers, write public/art/<slug>/<id>.webp + manifest.json (contract in index.ts) and, unless
 * `preview` is false, art/<slug>/preview-<name>.png for every composition.
 */
export async function bakeBeat(slug: string, layers: Layer[], comps: { desktop: Composition; portrait: Composition }, o: BakeOpts & { preview?: boolean } = {}) {
  const baked = new Map<string, NonNullable<Awaited<ReturnType<typeof bakeLayer>>>>();
  for (const l of layers) {
    const b = await bakeLayer(slug, l, o);
    if (b) baked.set(l.id, b);
    else console.warn(`[art] layer ${slug}/${l.id} is empty, skipped`);
  }
  const compose = (c: Composition) => ({
    width: c.width,
    height: c.height,
    layers: [...baked.values()]
      .filter((b) => !c.include || c.include.includes(b.id))
      .sort((a, b) => a.depth - b.depth)
      .map((b) => {
        const p = c.place?.[b.id] ?? {};
        const s = p.s ?? 1;
        return { id: b.id, src: `/art/${slug}/${b.id}.webp`, x: r1(b.x * s + (p.x ?? 0)), y: r1(b.y * s + (p.y ?? 0)), w: r1(b.w * s), h: r1(b.h * s), depth: b.depth };
      }),
  });
  const manifest = {
    slug,
    compositions: { desktop: compose(comps.desktop), portrait: compose(comps.portrait) },
    bytes: [...baked.values()].reduce((n, b) => n + b.bytes, 0),
  };
  writeFileSync(join(outDir(slug), "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  if (o.preview !== false) for (const k of ["desktop", "portrait"] as const) await composite(slug, k);
  return manifest;
}
const r1 = (n: number) => Math.round(n * 10) / 10;

/** Flatten a baked composition (reads public/art/<slug>/manifest.json) to art/<slug>/preview-<which>.png. Returns the png path. */
export async function composite(slug: string, which: "desktop" | "portrait", bg = "#101018") {
  const m = JSON.parse(readFileSync(join(outDir(slug), "manifest.json"), "utf8"));
  const c = m.compositions[which] as { width: number; height: number; layers: { id: string; x: number; y: number; w: number; h: number }[] };
  const ops: OverlayOptions[] = [];
  for (const l of c.layers) {
    const w = Math.round(l.w), h = Math.round(l.h), x = Math.round(l.x), y = Math.round(l.y);
    const sx = Math.max(0, -x), sy = Math.max(0, -y);
    const cw = Math.min(w, c.width - x) - sx, ch = Math.min(h, c.height - y) - sy;
    if (cw <= 0 || ch <= 0) continue;
    const input = await sharp(join(outDir(slug), `${l.id}.webp`)).resize(w, h).extract({ left: sx, top: sy, width: cw, height: ch }).png().toBuffer();
    ops.push({ input, left: x + sx, top: y + sy });
  }
  const out = join(ROOT, "art", slug, `preview-${which}.png`);
  mkdirSync(join(ROOT, "art", slug), { recursive: true });
  await sharp({ create: { width: c.width, height: c.height, channels: 4, background: bg } }).composite(ops).png().toFile(out);
  return out;
}

/**
 * Frames laid out in one row (each cell frameW x frameH, untrimmed so pivots stay aligned) -> public/art/<slug>/<id>.webp
 * + <id>.json { id, src, scale, frameW, frameH, anchor, frames:[{x,y,w,h}], bytes }. Frames are drawn in frame-local
 * coordinates (0,0 = top-left of the cell). anchor = pivot in frame px (default bottom centre), in sheet pixels.
 */
export async function bakeSpriteSheet(slug: string, id: string, frames: (Frag | Frag[])[], o: BakeOpts & { frameW: number; frameH: number; anchor?: [number, number] }) {
  const scale = o.scale ?? 1;
  const w = Math.round(o.frameW * scale), h = Math.round(o.frameH * scale);
  const cells = await Promise.all(frames.map((fr) => sharp(Buffer.from(svgDoc([fr].flat(), 0, 0, o.frameW, o.frameH, scale))).png().toBuffer()));
  const buf = await sharp({ create: { width: w * cells.length, height: h, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(cells.map((input, i) => ({ input, left: i * w, top: 0 })))
    .webp({ quality: o.quality ?? 82, alphaQuality: 100 })
    .toBuffer();
  mkdirSync(outDir(slug), { recursive: true });
  writeFileSync(join(outDir(slug), `${id}.webp`), buf);
  const meta = {
    id, src: `/art/${slug}/${id}.webp`, scale, frameW: w, frameH: h,
    anchor: o.anchor ?? [w / 2, h],
    frames: cells.map((_, i) => ({ x: i * w, y: 0, w, h })),
    bytes: buf.length,
  };
  writeFileSync(join(outDir(slug), `${id}.json`), JSON.stringify(meta, null, 2) + "\n");
  return meta;
}

/** Tileable 256x256 mid-grey paper-fibre noise -> public/art/_grain.webp (use with mix-blend-mode: overlay). Deterministic. */
export async function grain(amp = 22, quality = 60) {
  const N = 256, r = rng(7), v = new Float32Array(N * N);
  const at = (x: number, y: number) => ((y + N) % N) * N + ((x + N) % N);
  for (let i = 0; i < v.length; i++) v[i] = r() - 0.5;
  // wrap-around 3x3 blur keeps the tile seamless
  const b = new Float32Array(v.length);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    let s = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += v[at(x + dx, y + dy)]! * (dx || dy ? 1 : 2);
    b[at(x, y)] = s / 10;
  }
  for (let i = 0; i < 700; i++) { // fibres: short faint streaks, wrapped
    const a = r.range(0, Math.PI), len = r.range(8, 30), sg = r() < 0.5 ? 0.08 : -0.08;
    const x = r.range(0, N), y = r.range(0, N);
    for (let t = 0; t < len; t++) b[at(Math.round(x + Math.cos(a) * t), Math.round(y + Math.sin(a) * t))]! += sg;
  }
  const px = Buffer.alloc(N * N);
  for (let i = 0; i < px.length; i++) px[i] = Math.max(0, Math.min(255, Math.round(128 + b[i]! * amp * 4)));
  const buf = await sharp(px, { raw: { width: N, height: N, channels: 1 } }).webp({ quality }).toBuffer();
  const out = join(ROOT, "public/art/_grain.webp");
  mkdirSync(join(ROOT, "public/art"), { recursive: true });
  writeFileSync(out, buf);
  return out;
}
