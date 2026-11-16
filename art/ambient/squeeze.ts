// Shared byte-squeeze pass for beat builds I own: re-encode baked WebP layers (smaller pixel size, lossy alpha).
// Rects in the manifest are design units, so shrinking pixels never changes layout.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { ROOT } from "../lib/index.ts";

export type Squeeze = [k: number, quality: number, alphaQuality: number];
/** Re-encode public/art/<slug>/<id>.webp for each baked layer; updates b.bytes in place. table keys ignore a trailing "-p". */
export async function squeeze(slug: string, baked: Map<string, { id: string; bytes: number }>, table: Record<string, Squeeze>, def: Squeeze | null = [1, 40, 70]) {
  if (process.env.NOSQ) return;
  for (const [id, b] of baked) {
    const t = table[id] ?? table[id.replace(/-p$/, "")] ?? def;
    if (!t) continue;
    const [k, q, aq] = t;
    const f = join(ROOT, "public/art", slug, `${id}.webp`);
    const src = readFileSync(f), m = await sharp(src).metadata();
    let s = sharp(src);
    if (k < 1) s = s.resize(Math.max(1, Math.round(m.width! * k)));
    const out = await s.webp({ quality: q, alphaQuality: aq, effort: 6, smartSubsample: true }).toBuffer();
    if (out.length < src.length) { writeFileSync(f, out); b.bytes = out.length; }
  }
}
