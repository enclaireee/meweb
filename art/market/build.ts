// Writes public/art/market/*.svg + manifest.json (the MarketManifest in types.ts): scene art from scene.ts, stalls from stall-1..5.ts.
// Same papercut as the river tiles (art/build.ts): alpha mask, baked shadow under the sheets, warm backlight, fibre grain, deckle, glow defs.
// Run through art/build.ts (npx tsx art/build.ts). Imports art/build.ts only for functions, used at call time, so the import cycle is harmless.
import { mkdirSync, writeFileSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { glowIds, rng } from "../helpers";
import { GLOW_DEF, GRAIN, deckle } from "../build";
import { H, OVER, SH, SW, VP, W, sideOf, type MarketManifest } from "./types";
import { floor, far, gate, pier, sky, string, walker, WALKER, STRING_H, type Group } from "./scene";
import stall1 from "./stall-1";
import stall2 from "./stall-2";
import stall3 from "./stall-3";
import stall4 from "./stall-4";
import stall5 from "./stall-5";
import { CAPTION, CLOTH, GUN, LAMP, SCREEN, gunungan, pen, screen, shadowSvg, type Play } from "./play";
import play1 from "./play-1";
import play2 from "./play-2";
import play3 from "./play-3";
import play4 from "./play-4";
import play5 from "./play-5";

const OUT = "public/art/market";
const SEED = 20261015;

/** One standalone papercut SVG: viewBox from x = vx, size w x h. Each group is its own sheet stack (shadow lands on what is below it). */
export function paperSvg(groups: Group[], vx: number, w: number, h: number): string {
  const box = `x="${vx - 120}" y="-120" width="${w + 240}" height="${h + 240}"`;
  const through = (i: number, fill: string, op: number, dx = 0, dy = 0) =>
    `<rect ${box} fill="${fill}" opacity="${op}" mask="url(#m${i})"${dx || dy ? ` transform="translate(${dx} ${dy})"` : ""}/>`;
  let defs = "", body = "", tops = "", all = "", grain = false;
  groups.forEach((g, i) => {
    const art = deckle(g.pieces.filter((p) => !p.top).map((p) => p.svg).join(""), g.deckle ?? 0);
    const top = g.pieces.filter((p) => p.top).map((p) => p.svg).join("");
    tops += top;
    all += art + top;
    if (!g.shadow && !g.back && !g.grain) return void (body += art);
    defs += `<g id="a${i}">${art}</g><mask id="m${i}" maskUnits="userSpaceOnUse" ${box} style="mask-type:alpha"><use href="#a${i}"/></mask>`;
    if (g.back) for (const [dx, dy] of [[-4, -3], [4, -3], [0, -5]] as const) body += through(i, "#F2C77A", 0.07, dx, dy);
    if (g.shadow) {
      const [dx, dy, o] = g.shadow;
      body += through(i, "#03060C", o * 0.45, dx, dy) + through(i, "#03060C", Math.min(0.8, o + 0.2), dx * 0.25 + 1, dy * 0.25 + 1);
    }
    body += `<use href="#a${i}"/>`;
    if (g.grain) (grain = true), (body += through(i, "url(#g)", 0.35));
  });
  const d = (grain ? GRAIN : "") + defs + glowIds(all).map(GLOW_DEF).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${vx} 0 ${w} ${h}" preserveAspectRatio="none">${d ? `<defs>${d}</defs>` : ""}${body}${tops}</svg>`;
}

export function buildMarket() {
  // Overwrite in place, never delete/rename the folder (iCloud conflict copies, see buildStrip in art/build.ts).
  mkdirSync(OUT, { recursive: true });
  let total = 0;
  const put = (name: string, svg: string) => {
    writeFileSync(`${OUT}/${name}.svg`, svg);
    const gz = gzipSync(svg).length;
    total += gz;
    console.log(`market ${name.padEnd(16)} ${(gz / 1024).toFixed(0)} KB gz`);
    return name + ".svg";
  };
  const wide = W + 2 * OVER;
  const g = gate(rng(SEED + 3));
  const s = string(rng(SEED + 4));
  const stalls = [stall1, stall2, stall3, stall4, stall5].map((gen, n) => {
    const side = sideOf(n);
    const art = gen(rng(SEED + 100 + n * 131), side);
    return { f: put(`stall-${n + 1}`, paperSvg([{ pieces: art.pieces, shadow: [7, 12, 0.5], back: true, grain: true, deckle: 1.6 }], 0, SW, SH)), w: SW, h: SH, side, slots: art.slots, glows: art.glows ?? [], steam: art.steam ?? [] };
  });
  const plays: Play[] = [play1, play2, play3, play4, play5];
  const play: MarketManifest["play"] = {
    screen: { f: put("play-screen", paperSvg(screen(rng(SEED + 8)), 0, SCREEN.w, SCREEN.h)), ...SCREEN, cloth: CLOTH, caption: CAPTION, lamp: LAMP },
    gunungan: { f: put("gunungan", shadowSvg(gunungan(), "cast", GUN.w, GUN.h)), ...GUN },
    scenes: plays.map((scenes, n) =>
      scenes.map((scene, j) => {
        const st = { set: pen(), cast: pen(), r: rng(SEED + 500 + n * 37 + j) };
        scene(st);
        const id = `play-${n + 1}-s${j + 1}`;
        return { set: put(`${id}-set`, shadowSvg(st.set.L, "set")), cast: put(`${id}-cast`, shadowSvg(st.cast.L, "cast")) };
      }),
    ),
  };
  const manifest: MarketManifest = {
    W,
    H,
    VP,
    OVER,
    sky: { f: put("sky", paperSvg(sky(rng(SEED + 1)), -OVER, wide, H)), w: wide, h: H },
    far: { f: put("far", paperSvg(far(rng(SEED + 2)), -OVER, wide, H)), w: wide, h: H },
    floor: { f: put("floor", paperSvg(floor(rng(SEED + 5)), -OVER, wide, H)), w: wide, h: H },
    gate: { f: put("gate", paperSvg(g.groups, 0, W, H)), w: W, h: H, banner: g.banner, steam: g.steam },
    string: { f: put("string", paperSvg(s.dark, 0, W, STRING_H)), w: W, h: STRING_H, lit: put("string-lit", paperSvg(s.lit, 0, W, STRING_H)) },
    pier: { f: put("pier", paperSvg(pier(rng(SEED + 6)), 0, W, H)), w: W, h: H },
    walker: { f: put("walker", paperSvg(walker(rng(SEED + 7)), 0, WALKER.w, WALKER.h)), w: WALKER.w, h: WALKER.h },
    stalls,
    play,
  };
  writeFileSync(`${OUT}/manifest.json`, JSON.stringify(manifest));
  console.log(`market total ${(total / 1024).toFixed(0)} KB gz`);
}
