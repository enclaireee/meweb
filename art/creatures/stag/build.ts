// Giant stag sprite sheet (b5): 2 poses, 560x540 design px at 1x. Raw SVG rasterised with sharp.
import sharp from "sharp";
import { writeFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "../../../public/art/creatures/stag");
const W = 560, H = 540, G = 538, N = 2;
const BODY = "#1d3a2b", FAR = "#16302a", RIM = "#f3e6a6";
const f = (n: number) => n.toFixed(1);

// antler tree: branches as strokes, leaf lobes at the tips. c = colour of this pass.
function branch(x: number, y: number, a: number, len: number, w: number, d: number, c: string): string {
  const r = (a * Math.PI) / 180;
  const ex = x + Math.cos(r) * len, ey = y + Math.sin(r) * len;
  const cx = (x + ex) / 2 + Math.sin(r) * len * 0.12, cy = (y + ey) / 2 - Math.cos(r) * len * 0.12;
  let s = `<path d="M${f(x)} ${f(y)} Q${f(cx)} ${f(cy)} ${f(ex)} ${f(ey)}" stroke="${c}" stroke-width="${f(w)}" stroke-linecap="round" fill="none"/>`;
  if (d === 0) {
    const L = 26;
    return s + `<path d="M0 0 Q${L * 0.45} ${-L * 0.4} ${L} 0 Q${L * 0.45} ${L * 0.4} 0 0Z" fill="${c}" transform="translate(${f(ex)} ${f(ey)}) rotate(${f(a)})"/>`;
  }
  const mx = x + (ex - x) * 0.55, my = y + (ey - y) * 0.55;
  s += branch(mx, my, a - 40, len * 0.62, w * 0.7, d - 1, c);
  s += branch(ex, ey, a + 26, len * 0.6, w * 0.7, d - 1, c);
  return s;
}

const leg = (x: number, hind: boolean, c: string) =>
  hind
    ? `<path d="M${x - 20} 300 C${x - 24} 380 ${x - 2} 410 ${x + 1} 446 L${x - 3} ${G} h15 L${x + 14} 452 C${x + 24} 410 ${x + 26} 360 ${x + 24} 300Z" fill="${c}"/>`
    : `<path d="M${x - 14} 310 C${x - 12} 380 ${x - 8} 420 ${x - 8} 440 L${x - 7} ${G} h13 L${x + 7} 440 C${x + 8} 410 ${x + 14} 360 ${x + 15} 310Z" fill="${c}"/>`;

const body = `<path d="M205 275 C260 252 400 248 462 272 C490 290 484 342 455 356 C400 372 280 372 215 352 C190 330 188 295 205 275Z M462 276 l16 -18 l8 30Z"/>`;
const ear = (x: number, y: number, a: number) => `<path d="M0 0 Q12 -9 30 -2 Q12 8 0 0Z" transform="translate(${x} ${y}) rotate(${a})"/>`;

const POSES = {
  stand: {
    // neck + head (eye hole is an evenodd subpath)
    head: `<path fill-rule="evenodd" d="M256 275 C228 232 205 200 178 172 L152 160 C136 166 110 190 98 206 Q92 215 101 221 C118 224 142 213 162 202 C188 228 208 272 218 332 L256 332Z M150 184 a4.5 4.5 0 1 0 0.1 0Z"/>${ear(176, 168, -30)}`,
    antlers: (c: string) => branch(176, 166, -84, 74, 9, 3, c) + branch(168, 168, -118, 52, 7, 2, c),
    far: (c: string) => branch(190, 164, -64, 72, 8, 3, c),
  },
  graze: {
    head: `<path fill-rule="evenodd" d="M262 278 C228 320 188 385 160 440 L142 464 C128 490 116 512 108 530 Q110 539 122 536 C140 522 160 500 172 474 C196 430 226 384 256 340 L262 340Z M150 478 a4.5 4.5 0 1 0 0.1 0Z"/>${ear(164, 446, -60)}`,
    antlers: (c: string) => branch(172, 440, -112, 100, 9, 3, c),
    far: (c: string) => branch(182, 436, -86, 100, 8, 3, c),
  },
} as const;

function frame(k: keyof typeof POSES): string {
  const p = POSES[k];
  const layer = (c: string, far: string) =>
    `<g fill="${far}">${leg(224, false, far)}${leg(414, true, far)}${p.far(far)}</g>` +
    `<g fill="${c}">${body}${leg(256, false, c)}${leg(454, true, c)}${p.head}${p.antlers(c)}</g>`;
  // pale copy shifted up 4px under the dark copy = rim light on every top edge
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<g transform="translate(0 -4)">${layer(RIM, RIM)}</g>${layer(BODY, FAR)}</svg>`;
}

const bufs = await Promise.all((["stand", "graze"] as const).map((k) => sharp(Buffer.from(frame(k))).png().toBuffer()));
const sheet = await sharp({ create: { width: W * N, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite(bufs.map((input, i) => ({ input, left: i * W, top: 0 }))).png().toBuffer();
await sharp(sheet).webp({ quality: 80, alphaQuality: 80, effort: 6 }).toFile(join(out, "sheet.webp"));
const bytes = statSync(join(out, "sheet.webp")).size;
writeFileSync(join(out, "manifest.json"), JSON.stringify({
  src: "/art/creatures/stag/sheet.webp", frame: { w: W, h: H }, frames: ["stand", "graze"], anchor: [W / 2, H], bytes,
}, null, 2) + "\n");

const row = (bg: string) => sharp({ create: { width: W * N, height: H, channels: 4, background: bg } }).composite([{ input: sheet }]).png().toBuffer();
await sharp({ create: { width: W * N, height: H * 2, channels: 4, background: "#000" } })
  .composite([{ input: await row("#1f3d2e"), top: 0, left: 0 }, { input: await row("#dfe09a"), top: H, left: 0 }])
  .png().toFile(join(here, "preview.png"));
const t = await sharp(bufs[0]).trim().toBuffer({ resolveWithObject: true });
console.log("sheet bytes", bytes, "stand trim", t.info.width, "x", t.info.height, "offset", t.info.trimOffsetTop);
