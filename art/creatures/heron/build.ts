// Heron sprite sheet: raw SVG rasterised with sharp (2 frames, 560x720 design px, 1x output).
import sharp from "sharp";
import { writeFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "../../../public/art/creatures/heron");
const W = 560, H = 720, N = 2, G = 716;
const RIM = "#ffd9a0", BODY = "#5a2b16", WING = "#7a3d1c", DARK = "#40200f";

// Each part is [svg-with-{c}-colour]; drawn twice: rim copy shifted toward upper right, then the part.
const rim = (s: string) => `<g transform="translate(3.5 -3.5)">${s.replaceAll("{c}", RIM)}</g>`;
const part = (s: string, c: string) => rim(s) + s.replaceAll("{c}", c);

function frame(bow: boolean): string {
  // neck: base at the chest, S in "stand", dropped toward the ground in "bow"
  const neck = bow
    ? "M222 345 C150 320 80 360 92 470 C100 540 120 580 112 640"
    : "M222 345 C130 330 120 255 200 225 C275 195 250 130 196 92";
  const head = bow ? { x: 110, y: 648, a: 90 } : { x: 190, y: 82, a: -8 };
  const tw = (w: number) => `stroke="{c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  const leg = (x1: number, kx: number, fx: number) =>
    `<path d="M${x1} 430 L${kx} 580 L${fx} ${G - 6}" ${tw(11)}/>` +
    `<path d="M${fx - 24} ${G} L${fx + 2} ${G - 8} L${fx + 26} ${G} L${fx + 2} ${G - 3}Z M${fx + 2} ${G - 8} L${fx - 6} ${G - 22}" stroke="{c}" stroke-width="6" fill="{c}"/>`;
  const feather = (x: number, y: number, l: number) => `<path d="M${x} ${y} l${-l} ${l * 0.35}" stroke="${DARK}" stroke-width="2" opacity=".5"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><mask id="m"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="${head.x + (bow ? 7 : 7)}" cy="${head.y - (bow ? 4 : 2)}" r="4.5" fill="#000"/></mask></defs>
<g mask="url(#m)">
${part(leg(268, 258, 262), DARK)}${part(leg(298, 312, 298), DARK)}
${part(`<path d="${neck}" ${tw(22)}/>`, BODY)}
${part(`<path d="M214 350 C250 318 360 318 430 360 C470 385 500 420 524 462 C440 440 400 468 330 462 C250 458 200 420 214 350Z" fill="{c}"/>`, BODY)}
${part(`<ellipse cx="${head.x}" cy="${head.y}" rx="17" ry="12" transform="rotate(${head.a} ${head.x} ${head.y})" fill="{c}"/>`, BODY)}
${part(bow
    ? `<path d="M${head.x - 8} ${head.y + 6} L${head.x - 14} 714 L${head.x + 8} ${head.y + 14}Z" fill="{c}"/>`
    : `<path d="M${head.x - 12} ${head.y - 2} L50 100 L${head.x - 8} ${head.y + 12}Z" fill="{c}"/>`, "#b8742a")}
${part(`<path d="M250 345 C330 335 420 360 500 450 C440 470 380 480 300 440 C250 420 236 380 250 345Z" fill="{c}"/>`, WING)}
${([[300, 410, 40], [340, 425, 44], [380, 435, 40]] as const).map(([x, y, l]) => feather(x, y, l)).join("")}
</g></svg>`;
}

const bufs = await Promise.all([false, true].map((b) => sharp(Buffer.from(frame(b))).png().toBuffer()));
const sheet = await sharp({ create: { width: W * N, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite(bufs.map((input, i) => ({ input, left: i * W, top: 0 }))).png().toBuffer();
await sharp(sheet).webp({ quality: 80, alphaQuality: 80, effort: 6 }).toFile(join(out, "sheet.webp"));
const bytes = statSync(join(out, "sheet.webp")).size;
writeFileSync(join(out, "manifest.json"), JSON.stringify({
  src: "/art/creatures/heron/sheet.webp", frame: { w: W, h: H }, frames: ["stand", "bow"], anchor: [W / 2, H], bytes,
}, null, 2) + "\n");

const row = (bg: string) => sharp({ create: { width: W * N, height: H, channels: 4, background: bg } }).composite([{ input: sheet }]).png().toBuffer();
const both = sharp({ create: { width: W * N, height: H * 2, channels: 4, background: "#000" } })
  .composite([{ input: await row("#0b1420"), top: 0, left: 0 }, { input: await row("#f6c56b"), top: H, left: 0 }]);
await both.png().toFile(join(here, "preview.png"));
console.log("sheet bytes", bytes);
