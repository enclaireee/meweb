/**
 * npm run grain: the paper fibre tiles (design.md §5.1): a 512² seamless normal map and roughness map.
 * Seamless by sampling 4D simplex noise on a torus. Fibres are two stretched noise layers crossed at
 * different scales, over a fine tooth. Deterministic (fixed seed); output is committed.
 */
import sharp from "sharp";
import { createNoise4D } from "simplex-noise";
import { join } from "node:path";
import { mulberry32 } from "../src/lib/rng.ts";

const N = 512;
const TAU = Math.PI * 2;
const out = join(import.meta.dirname, "../public/textures");
const noise = createNoise4D(mulberry32(0x9a9e2));

/** torus sample: rx, ry = cycles across the tile in x and y (unequal = stretched fibres) */
const torus = (u: number, v: number, rx: number, ry: number, o = 0) =>
  noise(Math.cos(TAU * u) * rx + o, Math.sin(TAU * u) * rx, Math.cos(TAU * v) * ry, Math.sin(TAU * v) * ry + o);

const h = new Float32Array(N * N);
for (let y = 0; y < N; y++)
  for (let x = 0; x < N; x++) {
    const u = x / N;
    const v = y / N;
    const cloud = 0.5 * torus(u, v, 1.5, 1.5) + 0.25 * torus(u, v, 4, 4, 7);
    // sparse fibres: stretched layers at several angles and scales, gated so most of the sheet is plain
    const gate = Math.max(0, torus(u, v, 6, 6, 61));
    const fibres = gate * (0.1 * torus(u, v, 14, 3, 13) + 0.08 * torus(u, v, 3.5, 17, 29) + 0.06 * torus(u, v, 9, 5, 37));
    const tooth = 0.14 * torus(u, v, 56, 56, 41) + 0.07 * torus(u, v, 128, 128, 53);
    h[y * N + x] = cloud + fibres + tooth;
  }

const at = (x: number, y: number) => h[((y + N) % N) * N + ((x + N) % N)]!;
const normal = Buffer.alloc(N * N * 3);
const rough = Buffer.alloc(N * N);
const strength = 2.2;
for (let y = 0; y < N; y++)
  for (let x = 0; x < N; x++) {
    // Sobel, wrapping at the edges so the tile stays seamless
    const dx = at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x - 1, y) - at(x - 1, y + 1);
    const dy = at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1) - at(x - 1, y - 1) - 2 * at(x, y - 1) - at(x + 1, y - 1);
    let nx = -dx * strength;
    let ny = dy * strength; // OpenGL convention (green up)
    let nz = 1;
    const l = Math.hypot(nx, ny, nz);
    nx /= l;
    ny /= l;
    nz /= l;
    const i = (y * N + x) * 3;
    normal[i] = Math.round((nx * 0.5 + 0.5) * 255);
    normal[i + 1] = Math.round((ny * 0.5 + 0.5) * 255);
    normal[i + 2] = Math.round((nz * 0.5 + 0.5) * 255);
    // matte paper: 0.8–1.0, fibres slightly glossier (lower)
    rough[y * N + x] = Math.round((0.9 + 0.1 * Math.tanh(at(x, y) * 1.5)) * 255);
  }

await sharp(normal, { raw: { width: N, height: N, channels: 3 } }).webp({ quality: 72 }).toFile(join(out, "grain-normal.webp"));
await sharp(rough, { raw: { width: N, height: N, channels: 1 } }).webp({ quality: 80 }).toFile(join(out, "grain-rough.webp"));
console.log("grain → public/textures/grain-normal.webp, grain-rough.webp");
