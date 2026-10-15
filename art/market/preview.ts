// Renders the market at camera depth z to a PNG with the runtime's depth rule, no browser needed.
// Run: npx tsx art/market/preview.ts [z] [--size=1600x900] [--out=art/.preview]
import { mkdirSync, readFileSync } from "node:fs";
import sharp from "sharp";
import type { MarketManifest } from "./types";

const args = process.argv.slice(2);
const opt = (k: string) => args.find((a) => a.startsWith(`--${k}=`))?.split("=")[1];
const z = Number(args.find((a) => !a.startsWith("--")) ?? 0);
const [vw, vh] = (opt("size") ?? "1600x900").split("x").map(Number) as [number, number];
const out = opt("out") ?? "art/.preview";

const DIR = "public/art/market";
const M: MarketManifest = JSON.parse(readFileSync(`${DIR}/manifest.json`, "utf8"));
const k = vw / M.W;
const oy = (vh - M.H * k) / 2;
const n1 = (v: number) => v.toFixed(2);

/** Place a standalone SVG file as an <image> at frame units (x, y, w, h). */
function put(file: string, x: number, y: number, w: number, h: number): string {
  const href = `data:image/svg+xml;base64,${readFileSync(`${DIR}/${file}`).toString("base64")}`;
  return `<image href="${href}" x="${n1(x * k)}" y="${n1(oy + y * k)}" width="${n1(w * k)}" height="${n1(h * k)}" preserveAspectRatio="none"/>`;
}

// --play=N: a contact sheet of project N's four scenes on the lit screen, plus the gunungan standing on a bare one.
const playN = Number(opt("play") ?? 0);
if (playN) {
  const P = M.play;
  const [cx, cy, cw, ch] = P.screen.cloth;
  const img = (f: string, x: number, y: number, w: number, h: number) =>
    `<image href="data:image/svg+xml;base64,${readFileSync(`${DIR}/${f}`).toString("base64")}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none"/>`;
  const step = P.screen.w + 20;
  const parts = [0, 1, 2, 3, 4].map((i) => img(P.screen.f, i * step, 0, P.screen.w, P.screen.h));
  P.scenes[playN - 1]!.forEach((s, i) => parts.push(img(s.set, i * step + cx, cy, cw, ch), img(s.cast, i * step + cx, cy, cw, ch)));
  const gh = ch * 1.1;
  const gw = (gh * P.gunungan.w) / P.gunungan.h;
  parts.push(img(P.gunungan.f, 4 * step + cx + (cw - gw) / 2, cy + ch - gh * 0.82, gw, gh));
  const sw = 5 * step;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sw}" height="${P.screen.h}"><rect width="100%" height="100%" fill="#0A0D14"/>${parts.join("")}</svg>`;
  mkdirSync(out, { recursive: true });
  const file = `${out}/play-${playN}.png`;
  void sharp(Buffer.from(svg), { limitInputPixels: false, unlimited: true }).resize(Math.round(sw * Number(opt("scale") ?? 0.5))).png().toFile(file).then(() => console.log(file));
}

const [vx, vy] = M.VP;
type Item = { n: number; files: string[]; w: number; h: number; ax: number; ay: number; top?: boolean };
const items: Item[] = [
  { n: -0.5, files: [M.gate.f], w: M.gate.w, h: M.gate.h, ax: 800, ay: 1000 },
  ...[-0.5, 0.5, 1.5, 2.5, 3.5, 4.5].map((n) => ({ n, files: [M.string.f, M.string.lit], w: M.string.w, h: M.string.h, ax: 800, ay: 0, top: true })),
  ...M.stalls.map((s, i) => ({ n: i, files: [s.f], w: s.w, h: s.h, ax: s.side === "L" ? 380 : 1220, ay: 990 })),
  { n: 5, files: [M.pier.f], w: M.pier.w, h: M.pier.h, ax: 800, ay: 1000 },
];

const parts = [put(M.sky.f, -M.OVER, 0, M.sky.w, M.sky.h), put(M.floor.f, -M.OVER, 0, M.floor.w, M.floor.h), put(M.far.f, -M.OVER, 0, M.far.w, M.far.h)];
for (const it of items.sort((a, b) => b.n - a.n)) {
  const d = it.n - z;
  if (d < -0.6 || d > 6) continue;
  const s = 1 / (1 + 0.9 * Math.max(d, 0));
  const px = vx + (it.ax - vx) * s, py = vy + (it.ay - vy) * s;
  for (const f of it.files) parts.push(put(f, px - (it.w / 2) * s, it.top ? py : py - it.h * s, it.w * s, it.h * s));
}
parts.push(put(M.walker.f, 800 - M.walker.w * 0.45, 1000 - M.walker.h * 0.9, M.walker.w * 0.9, M.walker.h * 0.9));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" viewBox="0 0 ${vw} ${vh}"><rect width="100%" height="100%" fill="#0A0D14"/>${parts.join("")}</svg>`;
if (!playN) {
  mkdirSync(out, { recursive: true });
  const file = `${out}/market-z${z}-${vw}x${vh}.png`;
  void sharp(Buffer.from(svg), { limitInputPixels: false, unlimited: true }).png().toFile(file).then(() => console.log(file));
}
