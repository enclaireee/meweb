// Shut-gate frame check: place the gate sprites at their closed shift and report how flat the frame is.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { ROOT } from "../lib/index.ts";

/** Returns { top: share of the canvas in the single most common colour bucket, clear: share left transparent, bytes png }. */
export async function shutCheck(slug: string, which: "desktop" | "portrait", shifts: { l: number; r: number }, out?: string, bg = "#00000000") {
  const m = JSON.parse(readFileSync(join(ROOT, "public/art", slug, "manifest.json"), "utf8"));
  const c = m.compositions[which] as { width: number; height: number; layers: { id: string; x: number; y: number; w: number; h: number }[] };
  const ops: sharp.OverlayOptions[] = [];
  for (const l of c.layers.filter((q) => /^gate-[lr]/.test(q.id))) {
    const dx = l.id.startsWith("gate-l") ? shifts.l : -shifts.r;
    const x = Math.round(l.x + dx), y = Math.round(l.y), w = Math.round(l.w), h = Math.round(l.h);
    const sx = Math.max(0, -x), sy = Math.max(0, -y), cw = Math.min(w, c.width - x) - sx, ch = Math.min(h, c.height - y) - sy;
    if (cw <= 0 || ch <= 0) continue;
    ops.push({ input: await sharp(join(ROOT, "public/art", slug, `${l.id}.webp`)).resize(w, h).extract({ left: sx, top: sy, width: cw, height: ch }).png().toBuffer(), left: x + sx, top: y + sy });
  }
  const img = sharp({ create: { width: c.width, height: c.height, channels: 4, background: bg } }).composite(ops);
  if (out) await img.clone().flatten({ background: "#ff00ff" }).png().toFile(out);
  const { data } = await img.raw().toBuffer({ resolveWithObject: true });
  const cnt = new Map<number, number>();
  let clear = 0;
  const n = c.width * c.height;
  for (let i = 0; i < n; i++) {
    if (data[i * 4 + 3]! < 200) { clear++; continue; }
    const k = ((data[i * 4]! >> 5) << 6) | ((data[i * 4 + 1]! >> 5) << 3) | (data[i * 4 + 2]! >> 5);
    cnt.set(k, (cnt.get(k) ?? 0) + 1);
  }
  const top = Math.max(0, ...cnt.values());
  return { top: top / n, clear: clear / n };
}
