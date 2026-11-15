// Owl-moth sprite sheet: raw SVG rasterised with sharp (3 frames, 144x112 design, 2x output).
import sharp from "sharp";
import { writeFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "../../../public/art/creatures/owl-moth");
const W = 144, H = 112, S = 2, POSES = ["up", "level", "down"] as const;
// left-wing tip, trailing point, hind tip per pose (body centre 72,56; level span 12..132 = 120)
const wing = {
  up: { t: [22, 4], b: [26, 36], h: [44, 62] },
  level: { t: [12, 46], b: [34, 60], h: [44, 84] },
  down: { t: [24, 102], b: [46, 94], h: [56, 84] },
} as const;

function frame(pose: (typeof POSES)[number]): string {
  const { t, b, h } = wing[pose];
  const fore = `M62 46 L${t} L${b} L${h} L62 70Z`;
  const hind = `M62 60 L${b} L${h} L64 74Z`;
  const side = (m: string, rim: boolean) => `<g ${m}>
<path d="${fore}" fill="#c6d6e6" stroke="#4d607a" stroke-width="1" stroke-linejoin="round"/>
<path d="${hind}" fill="#b0c4d9" stroke="#4d607a" stroke-width=".8" stroke-linejoin="round"/>
<path d="M62 46 L${t} L${b}" fill="none" stroke="#4d607a" stroke-width=".7"/>
${rim ? `<path d="M62 46 L${t} L${b}" fill="none" stroke="#fff1cf" stroke-width="1.5" stroke-linecap="round"/>` : ""}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W * S}" height="${H * S}" viewBox="0 0 ${W} ${H}">
<defs><mask id="m"><rect width="${W}" height="${H}" fill="#fff"/>
<ellipse cx="65" cy="47" rx="4" ry="5" fill="#000"/><ellipse cx="79" cy="47" rx="4" ry="5" fill="#000"/></mask></defs>
${side("", true)}${side('transform="translate(144 0) scale(-1 1)"', false)}
<g mask="url(#m)">
<path d="M64 62 Q72 90 80 62 Q84 40 72 40 Q60 40 64 62Z" fill="#dfe9f2" stroke="#4d607a" stroke-width="1"/>
<path d="M57 46 L59 30 L67 38 Q72 36 77 38 L85 30 L87 46 Q87 58 72 58 Q57 58 57 46Z" fill="#dfe9f2" stroke="#4d607a" stroke-width="1" stroke-linejoin="round"/>
<path d="M57 46 L59 30 L66 37" fill="none" stroke="#fff1cf" stroke-width="1.5" stroke-linecap="round"/>
</g></svg>`;
}

const bufs = await Promise.all(POSES.map((p) => sharp(Buffer.from(frame(p))).png().toBuffer()));
const N = POSES.length;
const sheet = await sharp({ create: { width: W * S * N, height: H * S, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite(bufs.map((input, i) => ({ input, left: i * W * S, top: 0 }))).png().toBuffer();
await sharp(sheet).webp({ quality: 80, alphaQuality: 80, effort: 6 }).toFile(join(out, "sheet.webp"));
const bytes = statSync(join(out, "sheet.webp")).size;
writeFileSync(join(out, "manifest.json"), JSON.stringify({
  src: "/art/creatures/owl-moth/sheet.webp", frame: { w: W * S, h: H * S }, frames: [...POSES], anchor: [W * S / 2, H * S / 2], bytes,
}, null, 2) + "\n");

const row = (bg: string) => sharp({ create: { width: W * S * N, height: H * S, channels: 4, background: bg } }).composite([{ input: sheet }]).png().toBuffer();
const both = await sharp({ create: { width: W * S * N, height: H * S * 2, channels: 4, background: "#000" } })
  .composite([{ input: await row("#0b1420"), top: 0, left: 0 }, { input: await row("#f6c56b"), top: H * S, left: 0 }]).png().toBuffer();
const prev = await sharp(both).resize({ width: W * S * N * 2, kernel: "nearest" }).png().toFile(join(here, "preview.png"));
console.log("sheet bytes", bytes, prev.width + "x" + prev.height);
