/**
 * npm run poster [url]: the still of the composed desk (architecture.md §2.1), rendered by the real
 * scene from a running production build, then encoded as AVIF. The poster is the LCP and the whole
 * backdrop when there's no WebGL, so it must match the live first frame.
 *   public/poster/desk-{night,morning}.avif            landscape
 *   public/poster/desk-{night,morning}-portrait.avif   phones
 *   src/app/opengraph-image.png                         the share card (title tag visible)
 * Usage: npm run build && npm start (port 3000) in another shell, then npm run poster.
 */
import { chromium, type Page } from "@playwright/test";
import sharp from "sharp";
import { join } from "node:path";
import { writeFileSync } from "node:fs";

const url = process.argv[2] ?? "http://localhost:3000/";
const root = join(import.meta.dirname, "..");
const HIDE_ALL = `main, nav, [data-worker], button, .frame-mat, .skip-link, p[aria-hidden] { visibility: hidden !important; }`;
const HIDE_UI = `nav, [data-worker], button, .frame-mat, .skip-link, p[aria-hidden], #about .cast + .cast { visibility: hidden !important; }`;

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });

async function shoot(light: "night" | "morning", width: number, height: number, css: string): Promise<Buffer> {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  await ctx.addInitScript((l) => localStorage.setItem("nw-light", l), light);
  const page: Page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForSelector("html[data-scene='live']", { timeout: 60_000 });
  await page.addStyleTag({ content: css });
  await page.waitForTimeout(3000); // shadows, fog and the relight settle
  const png = await page.screenshot({ type: "png" });
  await ctx.close();
  return png;
}

for (const light of ["night", "morning"] as const) {
  for (const [suffix, w, h] of [
    ["", 1600, 1000],
    ["-portrait", 780, 1560],
  ] as const) {
    const png = await shoot(light, w, h, HIDE_ALL);
    const out = join(root, "public/poster", `desk-${light}${suffix}.avif`);
    await sharp(png).avif({ quality: 48, effort: 6 }).toFile(out);
    console.log(`poster → ${out}`);
  }
}

const og = await shoot("night", 1200, 630, HIDE_UI);
await sharp(og).png({ compressionLevel: 9, palette: false }).toFile(join(root, "src/app/opengraph-image.png"));
writeFileSync(join(root, "src/app/opengraph-image.alt.txt"), "A paper-cut diorama of a workshop at night: a desk under a lamp, a small paper worker by a cable, and a hung paper tag reading Muhammad Fatih Zamzami.\n");
console.log("og → src/app/opengraph-image.png");

await browser.close();
