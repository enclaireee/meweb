// Renders the composed scene at a stop to a PNG, no browser needed.
// Run: npx tsx art/preview.ts <stop 0-7 or fractional> [--size=1600x900] [--only=07,09] [--out=art/.preview]
import { mkdirSync } from "node:fs";
import sharp from "sharp";
import { computeLayout, HOOK_Y } from "../src/lib/layout";
import { skyAt } from "../src/lib/sky";
import { layerFx } from "../src/lib/fx";
import { buildLayer } from "./build";
import { LAYERS, PAD, P } from "./layers";
import traveller from "./traveller";

const args = process.argv.slice(2);
const opt = (k: string) => args.find((a) => a.startsWith(`--${k}=`))?.split("=")[1];
const pos = Number(args.find((a) => !a.startsWith("--")) ?? 0);
const [vw, vh] = (opt("size") ?? "1600x900").split("x").map(Number) as [number, number];
const only = opt("only")?.split(",");
const out = opt("out") ?? "art/.preview";

const L = computeLayout(vw, vh);
const { ow, oh, k, anchor, top } = L;
const f = (n: number) => n.toFixed(2);

/** Place a standalone SVG as an <image> at (x, y, w, h), like the runtime's <img> tiles (no id clashes). */
function nest(svg: string, x: number, y: number, w: number, h: number, opacity = 1): string {
  const href = `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
  return `<image href="${href}" x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" preserveAspectRatio="none"${opacity < 1 ? ` opacity="${f(opacity)}"` : ""}/>`;
}

const sky = skyAt(pos);
const h = sky.horizon / 10;
const skyRect =
  `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">` +
  `<stop offset="0" stop-color="${sky.top}"/><stop offset="${(h * 0.6) / 100}" stop-color="${sky.mid}"/><stop offset="${h / 100}" stop-color="${sky.hor}"/><stop offset="1" stop-color="${sky.mid}"/></linearGradient>` +
  `<linearGradient id="glow" x1="0" y1="0" x2="0" y2="1"><stop offset="${(h - 10) / 100}" stop-color="#000" stop-opacity="0"/><stop offset="${h / 100}" stop-color="${sky.glowA}"/><stop offset="${(h + 12) / 100}" stop-color="#000" stop-opacity="0"/></linearGradient></defs>` +
  `<rect x="0" y="${f(top)}" width="${ow}" height="${f(1000 * k)}" fill="url(#sky)"/>` +
  `<rect x="0" y="${f(top)}" width="${ow}" height="${f(1000 * k)}" fill="url(#glow)"/>`;

const parts: string[] = [skyRect];
const DRAW_TRAVELLER_AFTER = "w2";

for (const layer of LAYERS) {
  if (!only || only.includes(layer.id)) {
    const { m, svgs } = buildLayer(layer);
    const fx = layerFx(m.fx, pos);
    for (const t of m.tiles) {
      const x = anchor + (t.x - PAD - layer.s * pos * P) * k;
      const w = t.w * k;
      if (x > ow || x + w < 0) continue;
      parts.push(nest(svgs.get(t.f)!, x, top + fx.ty * k, w, 1000 * k, fx.opacity));
    }
  }
  if (layer.id === DRAW_TRAVELLER_AFTER && (!only || only.includes("t"))) {
    const tsvg = traveller();
    const vb = /viewBox="([^"]+)"/.exec(tsvg)?.[1]?.split(/[ ,]+/).map(Number) ?? [-200, -220, 400, 300];
    const [vx, vy, vwB, vhB] = vb as [number, number, number, number];
    parts.push(nest(tsvg, anchor + vx * k, top + (620 + vy) * k, vwB * k, vhB * k));
  }
}

// Tag stand-in: a paper rectangle hanging from the hook of the current stop.
const hookX = anchor + 260 * k + (Math.round(pos) - pos) * P * k;
parts.push(
  `<rect x="${f(hookX - 1)}" y="${f(top + HOOK_Y * k)}" width="2" height="24" fill="#F1E8D4" opacity=".7"/>` +
    `<rect x="${f(hookX - 90)}" y="${f(top + HOOK_Y * k + 24)}" width="180" height="70" fill="#F1E8D4"/>`,
);

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ow}" height="${oh}" viewBox="0 0 ${ow} ${oh}"><rect width="100%" height="100%" fill="#0A0D14"/>${parts.join("")}</svg>`;
mkdirSync(out, { recursive: true });
const file = `${out}/stop-${pos}-${vw}x${vh}${only ? "-" + only.join("_") : ""}.png`;
void sharp(Buffer.from(svg), { limitInputPixels: false, unlimited: true }).png().toFile(file).then(() => console.log(file));

