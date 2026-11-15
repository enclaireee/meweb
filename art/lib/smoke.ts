// Smoke test: bakes a tiny beat + sprite sheet to public/art/_smoke/. Run: npx tsx art/lib/smoke.ts
import { cut, arch, bakeBeat, bakeSpriteSheet, ellipse, glow, layer, rect, ridge, rng, sheet, type Palette } from "./index.ts";

const pal: Palette = { sky: "#14233a", far: "#1d3552", near: "#0d1626", lamp: "#ffb454" };
const r = rng(42);
const W = 1920, H = 1080;

const sky = layer("sky", 0, sheet(rect(0, 0, W, H), pal.sky!, { shadow: false }));
const far = layer("far", 1, sheet(ridge(r, { x0: -100, x1: W + 100, y: 600, base: H + 50, amp: 300, seed: 7 }), pal.far!, { edge: {} }));
const near = layer("near", 2,
  sheet(ridge(r, { x0: -100, x1: W + 100, y: 850, base: H + 50, amp: 200, seed: 9, peaky: false }), pal.near!, { holes: [arch(r, 900, 1000, 160, 220)], edge: { light: [-1, -1] } }),
  glow(900, 900, 220, pal.lamp!));

// New helpers, one of each.
import { bridge, canopy, cloud, column, crystal, fern, flock, grain, lantern, mist, pine, ruinWall, scatter, shaft, stack, stalactites, strata, tower, vine } from "./index.ts";
const r2 = rng(5), c = { a: "#2b3a55", b: "#41567a", c: "#6a86ad", d: "#a9c0dc", ink: "#10182a" };
const cell = (i: number, j: number) => ({ x: 160 + i * 320, y: 260 + j * 330 });
const showcase = layer("showcase", 3, 
    mist(960, 540, 1600, 300, "#dfe8ff", 0.3),
    shaft(1500, 0, 40, 200, 700, 12, "#fff2c0", 0.5),
    ...stack(cut(ellipse(cell(0, 0).x, cell(0, 0).y, 120, 80, 20), r2, 3, 25), [c.a, c.b, c.c, c.d], 14, { inner: { blur: 5 }, edge: {} }),
    sheet(pine(r2, cell(1, 0).x, cell(1, 0).y + 120, 260), c.ink, { inner: { blur: 4, color: "#fff", opacity: 0.2 } }),
    sheet(fern(r2, cell(2, 0).x, cell(2, 0).y + 120, 220), c.c),
    sheet(vine(r2, cell(3, 0).x, cell(3, 0).y - 120, 240), c.c),
    sheet(crystal(r2, cell(4, 0).x, cell(4, 0).y + 100, 200), c.d, { inner: {} }),
    ...strata(r2, { x0: 80, x1: 500, y: 600, base: 880, bands: 4 }).map((s, i) => sheet(s, [c.a, c.b, c.c, c.d][i]!, { inner: { blur: 6 } })),
    sheet(column(r2, 620, 880, 50, 220), c.c), sheet(column(r2, 720, 880, 50, 220, true), c.c),
    sheet(bridge(r2, 800, 1200, 760, 26, 4), c.b),
    ...(() => { const t = tower(r2, 1300, 880, 90, 280, { windows: 3 }); return [glow(1300, 760, 90, "#ffb454"), sheet(t.body, c.a, { holes: t.holes })]; })(),
    ...(() => { const w = ruinWall(r2, 1420, 880, 220, 120); return [sheet(w.body, c.b, { holes: w.holes })]; })(),
    ...(() => { const l = lantern(1750, 700, 100); return [glow(1750, 700, 90, "#ffb454"), sheet(l.body, c.ink, { holes: l.holes })]; })(),
    sheet(stalactites(r2, 700, 1100, 40, 160, 8), c.ink), sheet(stalactites(r2, 1200, 1500, 1060, 120, 6, -1), c.ink),
    sheet(cloud(r2, 1000, 250, 320, 110), c.d, { inner: { blur: 6 } }),
    sheet(flock(r2, 1300, 200, 140, 5, 14), c.ink, { shadow: false }),
    sheet(canopy(r2, 40, 600, -10, 110), c.ink, { inner: { color: "#fff", opacity: 0.15 } }),
    sheet(scatter(r2, { x0: 1550, y0: 900, x1: 1880, y1: 1040 }, 12, (x, y) => ellipse(x, y, 10, 6, 8), 26), c.c),
);

const m = await bakeBeat("_smoke", [sky, far, near, showcase], {
  desktop: { width: W, height: H },
  portrait: { width: 1080, height: 1920, include: ["sky", "far", "near", "showcase"], place: { sky: { x: 0, y: 0, s: 1.8 }, far: { x: -400, y: 700 }, near: { x: -400, y: 900 } } },
});
const sheetMeta = await bakeSpriteSheet("_smoke", "walker",
  [0, 1, 2].map((i) => sheet(ellipse(32, 40 + i * 4, 10, 18 - i * 2, 8), pal.near!, { shadow: false })), { frameW: 64, frameH: 96 });
console.log(JSON.stringify(m, null, 1));
console.log("sheet", JSON.stringify(sheetMeta));
console.log("total bytes", m.bytes + sheetMeta.bytes);


console.log("grain", await grain());
