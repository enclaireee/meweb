/**
 * npm run rooms [url]: the phone theatre's rooms (mobile_concept.md §4.2), rendered by the real scene
 * from a running production build, five depth bands per room and light, encoded as AVIF.
 *   public/rooms/<slug>-<night|morning>-b<0..4>.avif   b0 opaque (the haze), b1–b4 transparent
 * Usage: npm run build && npm start (port 3000) in another shell, then npm run rooms.
 */
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { join } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";
import { stations } from "../src/sections/stations.ts";

const url = new URL(process.argv[2] ?? "http://localhost:3000/");
url.searchParams.set("bake", "");
const out = join(import.meta.dirname, "..", "public", "rooms");
mkdirSync(out, { recursive: true });

// the phone stage window's shape (4:5), at 2× (ui/Deck crops it to cover)
const viewport = { width: 400, height: 500 };
const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });

for (const light of ["night", "morning"] as const) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2, reducedMotion: "reduce" });
  await ctx.addInitScript((l) => localStorage.setItem("nw-light", l), light);
  const page = await ctx.newPage();
  await page.goto(url.href, { waitUntil: "networkidle" });
  await page.waitForSelector("html[data-scene='live']", { timeout: 60_000 });
  for (const [i, st] of stations.entries()) {
    await page.evaluate((n) => (window as unknown as { __bakeGo: (n: number) => void }).__bakeGo(n), i);
    await page.waitForTimeout(4000); // the room is cut and built, the camera and the shadows settle
    for (let band = 0; band < 5; band++) {
      const data = await page.evaluate(([n, b]: readonly [number, number]) => (window as unknown as { __bake: (n: number, b: number) => string }).__bake(n, b), [i, band] as const);
      const png = Buffer.from(data.split(",")[1]!, "base64");
      const file = join(out, `${st.slug}-${light}-b${band}.avif`);
      const avif = await sharp(png).avif({ quality: 52, effort: 9 }).toBuffer();
      writeFileSync(file, avif);
      console.log(`${file.slice(out.length + 1)}  ${(avif.length / 1024).toFixed(1)} kB`);
    }
  }
  await ctx.close();
}
await browser.close();
