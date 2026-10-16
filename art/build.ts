// Composes every layer strip from the generators, slices it into tiles, writes public/art/desktop/* + manifest.json.
// Run: npx tsx art/build.ts
import { mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { C, glowIds, rng, sheet, type ArtModule, type Piece } from "./helpers";
import { H, LAYERS, OVERSCAN, PAD, P, TILE, landmarkX, stripLength, type LayerDef } from "./layers";
import far from "./far";
import water from "./water";
import traveller from "./traveller";
import stop0 from "./stops/stop-0";
import stop1 from "./stops/stop-1";
import stop2 from "./stops/stop-2";
import stop3 from "./stops/stop-3";
import stop4 from "./stops/stop-4";
import stop5 from "./stops/stop-5";
import stop6 from "./stops/stop-6";
import stop7 from "./stops/stop-7";
import { buildDeep } from "./deep";

/** One river strip: its stops (with the rng seed each module has always used), where each sits on the 9-stop timeline, and where it is written. */
export type Strip = { name: "main" | "channel"; out: string; stops: { mod: ArtModule; seed: number }[]; tl: readonly number[] };
export const STRIPS: Record<Strip["name"], Strip> = {
  main: { name: "main", out: "public/art/desktop", tl: [2, 3, 7, 9], stops: [{ mod: stop0, seed: 0 }, { mod: stop3, seed: 3 }, { mod: stop6, seed: 6 }, { mod: stop7, seed: 7 }] },
  // ponytail: kept, the live site still loads public/art/channel (River.tsx CHANNEL_TILES, projects cascade) and art/preview.ts renders it; only `main` is rebuilt by main().
  channel: { name: "channel", out: "public/art/channel", tl: [2, 3, 4, 5, 6], stops: [{ mod: stop1, seed: 1 }, { mod: stop2, seed: 2 }, { mod: stop3, seed: 3 }, { mod: stop4, seed: 4 }, { mod: stop5, seed: 5 }] },
};
const SEED = 20261013;

const f = (n: number) => (Math.round(n * 10) / 10).toString();

/** Stop i owns the half-pitch either side of its landmark (first/last stop run to the strip ends). */
export const ownRange = (s: number, i: number, count: number, length: number): [number, number] => [
  i === 0 ? 0 : landmarkX(s, i) - (s * P) / 2,
  i === count - 1 ? length : landmarkX(s, i) + (s * P) / 2,
];

export function piecesFor(L: LayerDef, S: Strip): Piece[] {
  const count = S.stops.length;
  const length = stripLength(L.s, count);
  const seed = SEED + L.id.charCodeAt(0) * 131 + (L.id.charCodeAt(1) || 0) * 17;
  const out: Piece[] = [];
  for (const mod of [far, water]) {
    const g = mod[L.id];
    if (g) out.push(...g({ layer: L, i: -1, x0: 0, x1: length, lx: NaN, length, count, tl: S.tl, rng: rng(seed) }));
  }
  S.stops.forEach(({ mod, seed: n }, i) => {
    const g = mod[L.id];
    if (!g) return;
    const [x0, x1] = ownRange(L.s, i, count, length);
    out.push(...g({ layer: L, i, x0, x1, lx: landmarkX(L.s, i), length, count, tl: S.tl, rng: rng(seed + n * 7919) }));
  });
  return out;
}

export const GLOW_DEF = (id: string) =>
  `<radialGradient id="${id}"><stop offset="0" stop-color="#${id.slice(5)}" stop-opacity=".9"/><stop offset=".35" stop-color="#${id.slice(5)}" stop-opacity=".35"/><stop offset="1" stop-color="#${id.slice(5)}" stop-opacity="0"/></radialGradient>`;

/* ---------- papercut, baked into geometry (no <filter>: filters made Chrome rasterise late = flicker) ---------- */

/** Smooth 2D value noise in [-1, 1], keyed on position so every copy of an edge tears the same way. */
const hash = (x: number, y: number) => {
  let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return (((h ^ (h >>> 16)) >>> 0) / 4294967296) * 2 - 1;
};
const noise = (x: number, y: number) => {
  const xi = Math.floor(x), yi = Math.floor(y);
  const u = x - xi, v = y - yi;
  const sx = u * u * (3 - 2 * u), sy = v * v * (3 - 2 * v);
  const a = hash(xi, yi) + (hash(xi + 1, yi) - hash(xi, yi)) * sx;
  const b = hash(xi, yi + 1) + (hash(xi + 1, yi + 1) - hash(xi, yi + 1)) * sx;
  return a + (b - a) * sy;
};
const STEP = 10; // deckle subdivision, art units (coarser = smaller files)

/**
 * Torn edge: every straight polygon path (`M…L…Z`, what facet()/poly() emit) is subdivided and each vertex pushed by a
 * position-keyed noise field (coarse wander + fine fibre). The same field everywhere, so shared edges stay shared.
 */
export function deckle(markup: string, amp: number): string {
  if (!amp) return markup;
  return markup.replace(/ d="(M[-\d. L]+Z(?:M[-\d. L]+Z)*)"/g, (_, d: string) => {
    const subs = d.split("Z").filter(Boolean).map((sp) => {
      const pts = sp.slice(1).split("L").map((q) => q.split(" ").map(Number) as [number, number]);
      const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]);
      const size = Math.min(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
      const A = amp * Math.min(1, size / 40); // small holes and reeds barely tear
      const out: string[] = [];
      for (let k = 0; k < pts.length; k++) {
        const [ax, ay] = pts[k]!, [bx, by] = pts[(k + 1) % pts.length]!;
        const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / STEP));
        for (let j = 0; j < n; j++) {
          const x = ax + ((bx - ax) * j) / n, y = ay + ((by - ay) * j) / n;
          const dx = noise(x / 22, y / 22) * A + hash(Math.round(x * 3), Math.round(y * 3)) * A * 0.35;
          const dy = noise(x / 22 + 71, y / 22 + 13) * A + hash(Math.round(y * 3), Math.round(x * 3)) * A * 0.35;
          out.push(`${f(x + dx)} ${f(y + dy)}`);
        }
      }
      return "M" + out.join("L") + "Z";
    });
    return ` d="${subs.join("")}"`;
  });
}

/** Paper fibre grain: one 160-unit cell (rotated so the repeat never lines up) of short light/dark strands, drawn as a cheap pattern shader. */
export const GRAIN = (() => {
  const r = rng(SEED + 11);
  let s = "";
  for (let k = 0; k < 180; k++) {
    const x = r.range(0, 160), y = r.range(0, 160), a = r.range(-0.6, 0.6), l = r.range(2, 7);
    const c = k % 2 ? "#FFF6E2" : "#000";
    s += `<path d="M${f(x)} ${f(y)}l${f(Math.cos(a) * l)} ${f(Math.sin(a) * l)}" stroke="${c}" stroke-width="${f(r.range(0.4, 0.9))}" stroke-opacity="${f(r.range(0.2, 0.55))}"/>`;
  }
  return `<pattern id="g" width="160" height="160" patternUnits="userSpaceOnUse" patternTransform="rotate(23)">${s}</pattern>`;
})();

/**
 * One tile's SVG (strip units, so noise lines up across tiles). The art is drawn once as #a; its alpha becomes mask #m,
 * and each papercut pass is a flat rect through that mask: warm backlight rim, ambient + contact shadow under the art,
 * fibre grain over it. Masks and patterns rasterise in one pass, unlike filters. ponytail: no depth blur (CSS blur on the near layers cost ~3x frame time); crisp sheets suit the lightbox look.
 */
export function tileSvg(L: LayerDef, pieces: Piece[], x: number, w: number): string {
  const art = deckle(pieces.filter((p) => !p.top).map((p) => p.svg).join(""), L.deckle ?? 0);
  const top = pieces.filter((p) => p.top).map((p) => p.svg).join("");
  const paper = !!art && L.id !== "00"; // stars stay crisp pin-pricks
  const grain = paper && L.fx !== "haze"; // tissue haze: no fibres
  const box = `x="${x - 120}" y="-120" width="${w + 240}" height="${H + 240}"`;
  const through = (fill: string, op: number, dx = 0, dy = 0) =>
    `<rect ${box} fill="${fill}" opacity="${op}" mask="url(#m)"${dx || dy ? ` transform="translate(${f(dx)} ${f(dy)})"` : ""}/>`;
  let under = "";
  if (paper && L.backlit) for (const [dx, dy] of [[-4, -3], [4, -3], [0, -5]]) under += through("#F2C77A", 0.07, dx, dy);
  if (paper && L.shadow) {
    const [dx, dy, , sa] = L.shadow;
    under += through("#03060C", sa * 0.45, dx, dy) + through("#03060C", Math.min(0.8, sa + 0.2), dx * 0.25 + 1, dy * 0.25 + 1);
  }
  const defs =
    (paper ? `<g id="a">${art}</g><mask id="m" maskUnits="userSpaceOnUse" ${box} style="mask-type:alpha"><use href="#a"/></mask>` : "") +
    (grain ? GRAIN : "") +
    glowIds(top + art).map(GLOW_DEF).join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${H}" viewBox="${x} 0 ${w} ${H}" preserveAspectRatio="none">` +
    (defs ? `<defs>${defs}</defs>` : "") +
    under +
    (paper ? `<use href="#a"/>` : art) +
    (grain ? through("url(#g)", 0.35) : "") +
    top +
    `</svg>`
  );
}

export type TileInfo = { f: string; x: number; w: number };
export type LayerManifest = { id: string; name: string; s: number; fx?: string; length: number; tiles: TileInfo[] };

export function buildLayer(L: LayerDef, S: Strip): { m: LayerManifest; svgs: Map<string, string> } {
  const length = stripLength(L.s, S.stops.length);
  const pieces = piecesFor(L, S);
  const margin = (L.shadow ? L.shadow[0] + L.shadow[2] * 1.5 : 0) + (L.blur ?? 0) * 3 + (L.deckle ?? 0) + 30;
  const tiles: TileInfo[] = [];
  const svgs = new Map<string, string>();
  for (let t = 0; t * TILE < length; t++) {
    const x = t * TILE;
    const w = Math.min(TILE, length - x) + OVERSCAN;
    const mine = pieces.filter((p) => p.x1 >= x - margin && p.x0 <= x + w + margin);
    if (!mine.length) continue;
    const file = `layer-${L.id}-${L.name}.t${String(t).padStart(2, "0")}.svg`;
    svgs.set(file, tileSvg(L, mine, x, w));
    tiles.push({ f: file, x, w });
  }
  return { m: { id: L.id, name: L.name, s: L.s, fx: L.fx, length, tiles }, svgs };
}

/**
 * Torn-edge mask strips for the UI (public/art/ui/deckle-{top,bottom,left,right}.svg): 240×12 (or 12×240), opaque on
 * the paper side, a ragged fibre edge on the other. They tile seamlessly along the edge (both ends at the same depth).
 */
export function deckleMasks(dir = "public/art/ui") {
  const r = rng(SEED + 5);
  const N = 60;
  const depth = Array.from({ length: N + 1 }, (_, k) => (k === 0 || k === N ? 6 : 6 + r.range(-4.5, 4.5) + Math.sin(k * 0.7) * 1.2));
  depth[N] = depth[0]!;
  const step = 240 / N;
  const edge = depth.map((d, k) => [k * step, d] as const);
  const svg = (pts: string, w: number, h: number) =>
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><path d="M${pts}Z" fill="#000"/></svg>`;
  const j = (ps: (readonly [number, number])[]) => ps.map(([x, y]) => `${f(x)} ${f(y)}`).join("L");
  mkdirSync(dir, { recursive: true });
  // bottom edge: paper above, tear below
  writeFileSync(`${dir}/deckle-bottom.svg`, svg(j([[0, 0], [240, 0], ...edge.slice().reverse()]), 240, 12));
  writeFileSync(`${dir}/deckle-top.svg`, svg(j([[0, 12], [240, 12], ...edge.slice().reverse().map(([x, y]) => [x, 12 - y] as const)]), 240, 12));
  writeFileSync(`${dir}/deckle-right.svg`, svg(j([[0, 0], [0, 240], ...edge.slice().reverse().map(([x, y]) => [y, x] as const)]), 12, 240));
  writeFileSync(`${dir}/deckle-left.svg`, svg(j([[12, 0], [12, 240], ...edge.slice().reverse().map(([x, y]) => [12 - y, x] as const)]), 12, 240));
}

/**
 * Reed curtains for the UI (public/art/ui/reeds-{left,right}.svg), 700x1000: four stacked paper sheets, back (lightest) to
 * front (darkest), each solid from the outer edge and ending in long ragged reed blades pointing inward. Opaque; two
 * of them sliding in from both sides overlap into a full cover.
 */
export function reedCurtains(dir = "public/art/ui") {
  const ramp = [C.ramp3, C.ramp2, C.ramp1, C.ramp0];
  const mk = (right: boolean) => {
    const r = rng(SEED + 9);
    const X = (x: number) => (right ? 700 - x : x);
    let svg = "";
    ramp.forEach((fill, k) => {
      const solid = 540 - k * 110;
      const pts: [number, number][] = [[X(0), -20]];
      for (let y = -10; y < 1010; ) {
        const gap = r.range(26, 52) * (1 + k * 0.1);
        const w = r.range(16, 34) + k * 3;
        const len = r.range(70, 150) * (1 - k * 0.1);
        const lift = r.range(-120, 10);
        const e = solid + r.range(-14, 14);
        pts.push([X(e), y], [X(e + len * 0.6), y + w * 0.35 + lift * 0.3], [X(e + len), y + w * 0.5 + lift], [X(e + len * 0.5), y + w * 0.85 + lift * 0.1], [X(e), y + w]);
        y += w + gap * 0.3;
      }
      pts.push([X(0), 1020]);
      svg += sheet(pts, fill, r).svg;
    });
    return `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="1000" viewBox="0 0 700 1000" preserveAspectRatio="none">${svg}</svg>`;
  };
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/reeds-left.svg`, mk(false));
  writeFileSync(`${dir}/reeds-right.svg`, mk(true));
}

function buildStrip(S: Strip) {
  // Overwrite in place, never delete/rename the folder: ~/Documents is iCloud-synced and a fast
  // rm+rename makes iCloud keep a "desktop 2" conflict copy, leaving the site with no art folder.
  mkdirSync(S.out, { recursive: true });
  const layers: LayerManifest[] = [];
  const keep = new Set(["manifest.json"]);
  let total = 0;
  for (const L of LAYERS) {
    const { m, svgs } = buildLayer(L, S);
    layers.push(m);
    let gz = 0;
    for (const [file, svg] of svgs) {
      writeFileSync(`${S.out}/${file}`, svg);
      keep.add(file);
      gz += gzipSync(svg).length;
    }
    total += gz;
    console.log(`${S.name} ${L.id} ${L.name.padEnd(12)} ${m.tiles.length} tiles  ${(gz / 1024).toFixed(0)} KB gz`);
  }
  // Drop tiles no longer produced (old .webp, cache.json), then publish the manifest last.
  for (const f of readdirSync(S.out)) if (!keep.has(f)) rmSync(`${S.out}/${f}`);
  writeFileSync(`${S.out}/manifest.json`, JSON.stringify({ P, PAD, H, seed: SEED, layers }));
  console.log(`${S.name} total ${(total / 1024).toFixed(0)} KB gz`);
}

function main() {
  deckleMasks();
  reedCurtains();
  buildStrip(STRIPS.main);
  buildDeep();
  writeFileSync(
    "src/components/river/traveller.generated.ts",
    `// Generated by art/build.ts from art/traveller.ts. Do not edit.\nexport const TRAVELLER_SVG = ${JSON.stringify(traveller())};\n`,
  );
}

if (process.argv[1]?.endsWith("build.ts")) main();
