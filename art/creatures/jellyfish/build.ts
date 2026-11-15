// Lantern jellyfish sheet: 3 drift poses, 320x480 each, raw SVG via sharp.
import sharp from "sharp";
import { writeFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, "../../../public/art/creatures/jellyfish");
const W = 320, H = 480, N = 3, TOP = 120, CX = 160;
const names = ["open", "mid", "closed"];
// per pose: half bell width, bell height, tentacle spread, tentacle length scale
const pose = [{ hw: 130, h: 92, spread: 1, len: 0.82 }, { hw: 118, h: 112, spread: 0.5, len: 0.92 }, { hw: 104, h: 134, spread: 0, len: 1 }];
const lens = [200, 250, 175, 270, 220, 235]; // distinct lengths
const f = (n: number) => n.toFixed(1);

function frame(i: number): string {
  const { hw, h, spread, len } = pose[i]!;
  const bot = TOP + h;
  // dome: apex at TOP, flat-ish scalloped base at bot
  const dome = `M${CX - hw} ${bot} C${CX - hw} ${TOP + 8} ${CX - hw * 0.5} ${TOP} ${CX} ${TOP} C${CX + hw * 0.5} ${TOP} ${CX + hw} ${TOP + 8} ${CX + hw} ${bot} ` +
    `Q${CX + hw * 0.66} ${bot + 14} ${CX + hw * 0.33} ${bot} Q${CX} ${bot + 14} ${CX - hw * 0.33} ${bot} Q${CX - hw * 0.66} ${bot + 14} ${CX - hw} ${bot}Z`;
  // 4 rib curves, apex to base
  const ribs = [-0.7, -0.25, 0.25, 0.7].map(k => {
    const bx = CX + hw * k * 1.2, bx2 = CX + hw * k * 1.4;
    return `<path d="M${CX} ${TOP + 2} C${f(bx2)} ${TOP + h * 0.15} ${f(bx2)} ${TOP + h * 0.7} ${f(bx)} ${bot + 4}" />`;
  }).join("");
  // ribbon tentacles
  const n = 6;
  const tents = lens.slice(0, n).map((L, t) => {
    const u = (t - (n - 1) / 2) / ((n - 1) / 2); // -1..1
    const x0 = CX + u * hw * 0.78;
    const x1 = x0 + u * 38 * spread;
    const ln = Math.min(L * len, H - 8 - bot);
    const wv = 9 * (t % 2 ? 1 : -1), w = 7;
    const y1 = bot + 6, y2 = y1 + ln;
    const mid = (a: number, b: number) => (a + b) / 2;
    const left = `M${f(x0 - w / 2)} ${y1} C${f(x0 + wv)} ${f(y1 + ln * 0.3)} ${f(x1 - wv)} ${f(y1 + ln * 0.65)} ${f(x1 - w / 2 + 1)} ${f(y2)}`;
    const right = `L${f(x1 + w / 2 - 1)} ${f(y2)} C${f(x1 - wv + w)} ${f(y1 + ln * 0.65)} ${f(x0 + wv + w)} ${f(y1 + ln * 0.3)} ${f(x0 + w / 2)} ${y1}Z`;
    void mid;
    return `<path d="${left} ${right}" fill="${t % 2 ? "#ff9f4a" : "#ffb866"}" stroke="#9a4a14" stroke-width="1.4" stroke-linejoin="round"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
<defs>
<linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffb866"/><stop offset="1" stop-color="#ffd9a0"/></linearGradient>
<radialGradient id="g" cx=".5" cy=".6" r=".5"><stop offset="0" stop-color="#fff3d6" stop-opacity=".9"/><stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></radialGradient>
</defs>
${tents}
<path d="${dome}" fill="url(#b)" stroke="#9a4a14" stroke-width="2" stroke-linejoin="round"/>
<ellipse cx="${CX}" cy="${f(TOP + h * 0.62)}" rx="${hw * 0.7}" ry="${f(h * 0.4)}" fill="url(#g)"/>
<g fill="none" stroke="#c9742a" stroke-width="1.8" stroke-linecap="round" opacity=".85">${ribs}</g>
<rect x="${CX - 10}" y="${TOP - 5}" width="20" height="8" rx="2" fill="#7a3f12"/>
</svg>`;
}

const bufs = await Promise.all([...Array(N)].map((_, i) => sharp(Buffer.from(frame(i))).png().toBuffer()));
const sheet = await sharp({ create: { width: W * N, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite(bufs.map((input, i) => ({ input, left: i * W, top: 0 }))).png().toBuffer();
await sharp(sheet).webp({ quality: 70, alphaQuality: 70, smartSubsample: true, effort: 6 }).toFile(join(out, "sheet.webp"));
const bytes = statSync(join(out, "sheet.webp")).size;
writeFileSync(join(out, "manifest.json"), JSON.stringify({ src: "/art/creatures/jellyfish/sheet.webp", frame: { w: W, h: H }, frames: names, anchor: [CX, TOP], bytes }, null, 2) + "\n");

const row = (bg: string) => sharp({ create: { width: W * N, height: H, channels: 4, background: bg } }).composite([{ input: sheet }]).png().toBuffer();
const both = await sharp({ create: { width: W * N, height: H * 2, channels: 4, background: "#000" } })
  .composite([{ input: await row("#0b1420"), top: 0, left: 0 }, { input: await row("#f6c56b"), top: H, left: 0 }]).png().toFile(join(here, "preview.png"));
console.log("sheet bytes", bytes, both.width + "x" + both.height);
