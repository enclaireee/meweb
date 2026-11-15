// Whale sprite sheet: raw SVG (1200x560 design frame) rasterised at 0.5 with sharp, 2 frames in a strip.
import sharp from "sharp";
import { writeFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "../../../public/art/creatures/whale");
const DW = 1200, DH = 560, S = 0.5, W = DW * S, H = DH * S, N = 2;
const RIM = "#ffd9a0", BODY = "#3d3a78", FIN = "#524d92", FACET = "#33316a", BELLY = "#8f89bd", PLEAT = "#6f6aa3";

function frame(up: boolean): string {
  const d = up ? -75 : 75; // tail-end offset; body centre (600,280) fixed
  const ty = 255 + d * 1.5 / 1.5 * 1; // peduncle end y
  const body = `M1150 305 C1150 205 1000 150 800 150 C600 150 400 185 250 ${230 + d * 0.6} C200 ${236 + d * 0.9} 170 ${ty - 12} 160 ${ty - 10} L160 ${ty + 22} C200 ${ty + 24} 250 ${290 + d * 0.5} 330 ${315 + d * 0.3} C500 380 650 415 850 415 C1050 415 1150 375 1150 305Z`;
  const topEdge = `M1150 305 C1150 205 1000 150 800 150 C600 150 400 185 250 ${230 + d * 0.6} C200 ${236 + d * 0.9} 170 ${ty - 12} 160 ${ty - 10}`;
  const fa = up ? -22 : 22; // fluke tilt
  const flukes = `<g transform="rotate(${fa} 165 ${ty})"><path d="M185 ${ty - 4} L70 ${ty - 118} Q120 ${ty - 50} 112 ${ty} Q120 ${ty + 50} 70 ${ty + 118} L185 ${ty + 4}Z" fill="${FIN}"/><path d="M185 ${ty} L112 ${ty}" stroke="${FACET}" stroke-width="3"/></g>`;
  const dorsal = `<path d="M420 190 L500 100 L520 186Z" fill="${FIN}"/>`;
  const pect = up
    ? `<path d="M900 345 C870 380 850 450 830 505 C900 470 960 410 975 350Z" fill="${FIN}"/><path d="M905 350 L835 500" stroke="${FACET}" stroke-width="3"/>`
    : `<path d="M900 345 C830 370 740 400 650 430 C750 450 880 430 975 360Z" fill="${FIN}"/><path d="M905 352 L660 430" stroke="${FACET}" stroke-width="3"/>`;
  const pleats = [0, 1, 2, 3, 4].map((i) => `<path d="M${1120 - i * 4} ${322 + i * 15} C950 ${335 + i * 15} 750 ${340 + i * 13} ${520 - i * 25} ${350 + i * 12}" stroke="${PLEAT}" stroke-width="3" fill="none"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${DW} ${DH}">
<defs><clipPath id="b"><path d="${body}"/></clipPath>
<mask id="m"><rect width="${DW}" height="${DH}" fill="#fff"/><circle cx="1055" cy="285" r="10" fill="#000"/></mask></defs>
<g mask="url(#m)">
${dorsal}${flukes}
<path d="${body}" fill="${BODY}"/>
<g clip-path="url(#b)">
<path d="M330 150 L640 150 L560 300 L330 260Z" fill="${FACET}" opacity=".6"/>
<path d="M800 150 L1050 170 L900 290 L700 250Z" fill="${FACET}" opacity=".45"/>
<path d="M1160 330 C1000 300 800 330 560 330 C400 330 330 300 300 330 L300 440 L1160 440Z" fill="${BELLY}"/>
${pleats}
<path d="${topEdge}" stroke="${RIM}" stroke-width="16" fill="none"/>
</g>
${pect}
</g></svg>`;
}

const bufs = await Promise.all([true, false].map((u) => sharp(Buffer.from(frame(u))).png().toBuffer()));
const sheet = await sharp({ create: { width: W * N, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite(bufs.map((input, i) => ({ input, left: i * W, top: 0 }))).png().toBuffer();
await sharp(sheet).webp({ quality: 80, alphaQuality: 80, effort: 6 }).toFile(join(out, "sheet.webp"));
const bytes = statSync(join(out, "sheet.webp")).size;
writeFileSync(join(out, "manifest.json"), JSON.stringify({
  src: "/art/creatures/whale/sheet.webp", frame: { w: W, h: H }, frames: ["up", "down"], anchor: [W / 2, H / 2], scale: S, bytes,
}, null, 2) + "\n");

const row = (bg: string) => sharp({ create: { width: W * N, height: H, channels: 4, background: bg } }).composite([{ input: sheet }]).png().toBuffer();
await sharp({ create: { width: W * N, height: H * 2, channels: 4, background: "#000" } })
  .composite([{ input: await row("#0b1420"), top: 0, left: 0 }, { input: await row("#f3c9a0"), top: H, left: 0 }])
  .png().toFile(join(here, "preview.png"));
console.log("sheet bytes", bytes);
