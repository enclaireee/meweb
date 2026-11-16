// Ambient idle-loop sprites (transparent WebP) -> public/art/ambient/. Run: npx tsx art/ambient/build.ts
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { ROOT, cut, rng, mix } from "../lib/index.ts";

const OUT = join(ROOT, "public/art/ambient");
mkdirSync(OUT, { recursive: true });
const pd = (p: [number, number][]) => "M" + p.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z";
const svg = (w: number, h: number, body: string) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const rg = (id: string, c: string, o = 1, c2 = c) => `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${o}"/><stop offset=".4" stop-color="${c2}" stop-opacity="${o * 0.45}"/><stop offset="1" stop-color="${c2}" stop-opacity="0"/></radialGradient>`;
const L = (n: number, s: number): [number, number][] => { // leaf lens centred, rotated
  const a = n * 0.9, c = Math.cos(a), si = Math.sin(a);
  return ([[-20, 0], [-8, -11], [6, -12], [20, 0], [6, 12], [-8, 11]] as [number, number][]).map(([x, y]) => [24 + (x * c - y * si) * s, 24 + (x * si + y * c) * s]);
};
const star4 = (cx: number, cy: number, R: number, r: number): [number, number][] => Array.from({ length: 8 }, (_, i) => { const a = (i * Math.PI) / 4 - Math.PI / 2, d = i % 2 ? r : R; return [cx + Math.cos(a) * d, cy + Math.sin(a) * d] as [number, number]; });
const flake = (): string => {
  let s = "";
  for (let i = 0; i < 6; i++) s += `<g transform="rotate(${i * 60} 12 12)"><rect x="11" y="2.5" width="2" height="9.5" rx=".6" fill="#eef6ff"/><path d="M12 5.5L8.8 3.3M12 5.5L15.2 3.3" stroke="#eef6ff" stroke-width="1.4"/></g>`;
  return s + `<circle cx="12" cy="12" r="2.4" fill="#fff"/>`;
};
const flame = (k: number): string => {
  const sw = k ? 4 : -4, tip = k ? 6 : -5;
  const outer = `M24 76C8 70 8 46 ${22 + sw} 30C${24 + sw} 20 ${25 + tip} 10 ${24 + tip} 4C${34 + sw} 18 44 32 40 52C40 64 34 74 24 76Z`;
  const inner = `M24 74C15 70 15 56 ${23 + sw / 2} 44C${24 + sw / 2} 38 ${24 + tip / 2} 32 ${24 + tip / 2} 28C32 38 35 50 32 60C31 68 28 72 24 74Z`;
  return `<defs>${rg("g", "#ffb866", 0.55, "#ff8a3a")}</defs><ellipse cx="24" cy="50" rx="24" ry="30" fill="url(#g)"/>` +
    `<path d="${outer}" fill="#ff9d45"/><path d="${inner}" fill="#ffd98a"/><ellipse cx="24" cy="66" rx="5" ry="7" fill="#fff4d6"/>`;
};
const wisp = (): string => {
  const r = rng(77), pts: [number, number][] = [];
  for (let i = 0; i <= 24; i++) pts.push([16 + (480 * i) / 24, 80 - (22 + 22 * Math.sin((i / 24) * Math.PI)) * (0.8 + r() * 0.35)]);
  for (let i = 24; i >= 0; i--) pts.push([16 + (480 * i) / 24, 80 + (18 + 20 * Math.sin((i / 24) * Math.PI)) * (0.8 + r() * 0.35)]);
  const c = cut(pts, r, 3, 30);
  return `<defs><filter id="b" x="-10%" y="-30%" width="120%" height="160%"><feGaussianBlur stdDeviation="9"/></filter><linearGradient id="f" x1="0" x2="1"><stop offset="0" stop-opacity="0" stop-color="#a7b6d0"/><stop offset=".25" stop-color="#b9c8de" stop-opacity=".8"/><stop offset=".75" stop-color="#b9c8de" stop-opacity=".8"/><stop offset="1" stop-opacity="0" stop-color="#a7b6d0"/></linearGradient></defs>` +
    `<path d="${pd(c)}" fill="url(#f)" filter="url(#b)"/><path d="${pd(c.map(([x, y]) => [x, 80 + (y - 80) * 0.45] as [number, number]))}" fill="url(#f)" opacity=".5" filter="url(#b)"/>`;
};
const green = ["#5d8a4c", "#4f7a45", "#7fa35a"];
const leafSvg = (n: number): string => {
  const f = green[n]!, p = L(n, 1.05);
  return `<path d="${pd(p.map(([x, y]) => [x + 1, y + 2]))}" fill="#06120c" opacity=".35"/><path d="${pd(p)}" fill="${f}"/>` +
    `<path d="M${p[0]![0].toFixed(1)} ${p[0]![1].toFixed(1)}L${p[3]![0].toFixed(1)} ${p[3]![1].toFixed(1)}" stroke="${mix(f, "#e2eaa0", 0.55)}" stroke-width="1.4"/>` +
    `<path d="${pd(p.slice(0, 4))}" fill="none" stroke="${mix(f, "#e2eaa0", 0.6)}" stroke-width="1" opacity=".8"/>`;
};
const sprites: Record<string, [number, number, string]> = {
  "star-glint": [64, 64, `<defs>${rg("g", "#cfe0f0", 0.6)}</defs><circle cx="32" cy="32" r="30" fill="url(#g)"/><path d="${pd(star4(32, 32, 28, 3.4))}" fill="#e8f2ff"/><circle cx="32" cy="32" r="3" fill="#fff"/>`],
  "mist-wisp": [512, 160, wisp()],
  mote: [16, 16, `<defs>${rg("g", "#ffd9a0", 1, "#ffb866")}</defs><circle cx="8" cy="8" r="8" fill="url(#g)"/><circle cx="8" cy="8" r="2.2" fill="#fff1cf"/>`],
  "leaf-1": [48, 48, leafSvg(0)], "leaf-2": [48, 48, leafSvg(1)], "leaf-3": [48, 48, leafSvg(2)],
  snowflake: [24, 24, flake()],
  "flame-1": [48, 80, flame(0)], "flame-2": [48, 80, flame(1)],
  ember: [12, 12, `<defs>${rg("g", "#ffb866", 1, "#f2602c")}</defs><circle cx="6" cy="6" r="6" fill="url(#g)"/><circle cx="6" cy="6" r="1.6" fill="#fff1cf"/>`],
};
const manifest: Record<string, { src: string; w: number; h: number }> = {};
let total = 0;
for (const [name, [w, h, body]] of Object.entries(sprites)) {
  const buf = await sharp(Buffer.from(svg(w, h, body)), { density: 144 }).resize(w * 2 > 128 && w < 100 ? w * 2 : w, undefined).webp({ quality: 80, alphaQuality: 90, effort: 6 }).toBuffer();
  writeFileSync(join(OUT, `${name}.webp`), buf);
  manifest[name] = { src: `/art/ambient/${name}.webp`, w, h };
  total += buf.length;
  console.log(name.padEnd(10), buf.length);
}
writeFileSync(join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log("total", total, "bytes");
