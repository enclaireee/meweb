// Stop 7, The Lighthouse (morning): open sea, a rocky point, a banded tower with its lamp still lit.
import { C, arc, darken, lighten, mix, poly, post, raw, sheet, lantern, type ArtModule, type Piece, type Pt } from "../helpers";
import { bank, blob, frame, quad, ribbon, tone } from "./shared-b";

const I = 9;
/** Morning tint baked in: the night ramp warmed toward sunlit paper (no runtime filter). */
const morn = (id: string, k = 0) => lighten(mix(tone(id, I, k), "#E8C79E", 0.16), 0.05);
const TOWER_U = 640; // screen u of the tower axis on layer 07

/** Pale cut-paper foam: a curl of a ribbon, slightly translucent. */
const foam = (x: number, y: number, w: number, r: Parameters<typeof bank>[4]): Piece =>
  sheet(ribbon(quad([x, y], [x + w / 2, y - r.range(10, 22)], [x + w, y + r.range(-4, 4)], 6), r.range(7, 11), 2), lighten(C.ramp6, 0.45), r, { rim: false, opacity: 0.85 });

const art: ArtModule = {
  // Environment: the rocky point with the lighthouse (520 tall), beam wedges, a distant skerry.
  "07": (c) => {
    const { X, u0, u1 } = frame(c);
    const r = c.rng;
    const fill = darken(morn("07", 0.1), 0.12);
    const out: Piece[] = [];
    out.push(sheet([...bank(X(-100), X(0), 0, 0, r, 0).slice(0, 0), [X(-200), 640], [X(-120), 590], [X(-60), 584], [X(10), 596], [X(40), 640]], fill, r)); // skerry
    // the point: a ridge of rock rising to the tower, stepping down to the sea on both sides
    const px = X(TOWER_U);
    const point: Pt[] = [[px - 330, 650], [px - 250, 606], [px - 170, 590], [px - 100, 556], [px - 40, 540], [px + 50, 540], [px + 120, 560], [px + 200, 580], [px + 290, 598], [px + 380, 650]];
    out.push(sheet(point, fill, r));
    for (const [dx, rx, ry] of [[-190, 50, 26], [-90, 42, 24], [150, 55, 28], [260, 44, 22]] as const) out.push(sheet(blob(px + dx, 600, rx, ry, r, 10, 0.5), darken(fill, 0.08), r, { rim: true }));
    // tower: four tapering bands, gallery, lamp room, roof
    const bw = (y: number) => 40 - ((y - 120) / 440) * 18; // half width, 22 at the base
    const bands: [number, number, boolean][] = [[552, 450, false], [450, 340, true], [340, 230, false], [230, 140, true]];
    for (const [yb, yt, pale] of bands)
      out.push(sheet([[px - bw(yb), yb], [px + bw(yb), yb], [px + bw(yt), yt], [px - bw(yt), yt]], pale ? lighten(fill, 0.34) : lighten(fill, 0.1), r));
    out.push(sheet([[px - 38, 142], [px + 38, 142], [px + 38, 130], [px - 38, 130]], darken(fill, 0.1), r));
    out.push(sheet([[px - 28, 130], [px + 28, 130], [px + 28, 84], [px - 28, 84]], C.lanternCore, r, { rim: false }));
    out.push(sheet([[px - 12, 130], [px - 8, 130], [px - 8, 86], [px - 12, 86]], darken(fill, 0.1), r, { rim: false }), sheet([[px + 8, 130], [px + 12, 130], [px + 12, 86], [px + 8, 86]], darken(fill, 0.1), r, { rim: false }));
    out.push(sheet([[px - 36, 86], [px, 46], [px + 36, 86]], darken(fill, 0.1), r), sheet([[px - 2, 48], [px + 2, 48], [px + 2, 24], [px - 2, 24]], darken(fill, 0.1), r, { rim: false }));
    // keeper's window and door
    out.push(sheet([[px - 6, 470], [px + 6, 470], [px + 6, 490], [px - 6, 490]], C.window, r, { rim: false }));
    out.push(sheet([[px - 10, 552], [px + 10, 552], [px + 10, 520], [px, 512], [px - 10, 520]], darken(fill, 0.25), r, { rim: false }));
    // beam wedges and lamp glow (above the filter)
    const lampY = 108;
    // baked tissue wedges: warm at the lamp, fading to nothing so they never end in a hard edge
    const wedge = (id: string, to: number, y0: number, y1: number, op: number) =>
      raw(
        Math.min(px, to),
        Math.max(px, to),
        `<defs><linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${px}" y1="0" x2="${to}" y2="0"><stop offset="0" stop-color="${C.dawnGold}" stop-opacity="${op}"/><stop offset="1" stop-color="${C.dawnGold}" stop-opacity="0"/></linearGradient></defs>` +
          `<path d="${poly([[px, lampY - 3], [to, y0], [to, y1], [px, lampY + 3]])}" fill="url(#${id})"/>`,
        true,
      );
    out.push(wedge("beamL", X(-170), 30, 220, 0.42), wedge("beamR", X(u1 - 10), 55, 160, 0.4));
    out.push({ x0: px - 150, x1: px + 150, top: true, svg: `<circle cx="${px}" cy="${lampY}" r="150" fill="url(#glow-F2C77A)" opacity=".6"/><circle cx="${px}" cy="${lampY}" r="70" fill="url(#glow-FFE2A8)" opacity=".7"/>` });
    void u0;
    return out;
  },

  // Action: the dock with the tag post, a second big lantern post, the keeper's base, bollards, ropes.
  "09": (c) => {
    const { lx, x1 } = c;
    const r = c.rng;
    const fill = morn("09");
    const out: Piece[] = [];
    const dxa = lx + 40;
    const dxb = Math.min(x1 - 10, lx + 960);
    for (let x = dxa + 14; x < dxb; x += r.range(46, 62)) out.push(sheet([[x - 5, 602], [x + 5, 602], [x + 5, 670], [x - 5, 670]], fill, r));
    out.push(sheet([[dxa, 586], [dxb, 586], [dxb, 604], [dxa, 604]], fill, r));
    // keeper's stone base under the tower, with a door and a lit window (the traveller waves at it)
    const bx = lx + 380;
    out.push(sheet([[bx - 84, 588], [bx + 84, 588], [bx + 66, 500], [bx - 66, 500]], lighten(fill, 0.05), r, { holes: [poly([[bx - 10, 588], [bx + 10, 588], [bx + 10, 546], [bx, 538], [bx - 10, 546]])] }));
    out.push(sheet([[bx - 74, 500], [bx + 74, 500], [bx + 74, 492], [bx - 74, 492]], darken(fill, 0.1), r));
    out.push(sheet([[bx + 30, 524], [bx + 44, 524], [bx + 44, 542], [bx + 30, 542]], C.window, r, { rim: false }));
    out.push({ x0: bx, x1: bx + 120, top: true, svg: `<circle cx="${bx + 37}" cy="533" r="30" fill="url(#glow-FFB454)" opacity=".5"/>` });
    // second post carrying the big final lantern
    const gx = lx + 740;
    out.push(sheet([[gx - 5, 360], [gx + 5, 360], [gx + 5, 588], [gx - 5, 588]], fill, r), sheet([[gx - 5, 360], [gx + 46, 360], [gx + 46, 366], [gx - 5, 366]], fill, r));
    out.push(...lantern(gx + 40, 366, r, 1.5));
    // bollards and rope coil
    for (const dx of [560, 620, 880]) out.push(sheet([[lx + dx - 9, 586], [lx + dx + 9, 586], [lx + dx + 6, 558], [lx + dx - 6, 558]], darken(fill, 0.12), r));
    out.push(sheet(arc(lx + 930, 556, 70, 28, 0, Math.PI, 5), darken(fill, 0.1), r, { rim: false }));
    out.push(...post(lx, r, fill));
    return out;
  },

  // Near-1: rocks with tide pools at the bottom corners, a few tufts of weed.
  "10": (c) => {
    const { X, u0, u1 } = frame(c);
    const r = c.rng;
    const fill = morn("10", 0.25);
    const out: Piece[] = [];
    out.push(sheet(bank(X(u0), X(u1), 990, 1100, r, 6), fill, r));
    for (const [u, rx, ry] of [[-540, 130, 90], [-380, 90, 60], [980, 140, 80], [1180, 100, 64], [800, 70, 44]] as const) {
      const x = X(u);
      out.push(sheet(blob(x, 1000, rx, ry, r, 12, 0.3), fill, r, { holes: [poly([[x - rx * 0.4, 960 - ry * 0.3], [x + rx * 0.1, 955 - ry * 0.3], [x + rx * 0.25, 966 - ry * 0.3], [x - rx * 0.25, 972 - ry * 0.3]])] }));
    }
    for (let u = -700; u < 1380; u += r.range(120, 200)) if (u < -180 || u > 180) out.push(foam(X(u), 988 + r.range(-6, 6), r.range(60, 110), r));
    return out;
  },

  // Near-2: big dark rocks at both lower corners wreathed in foam.
  "11": (c) => {
    const { X } = frame(c);
    const r = c.rng;
    const fill = morn("11", 0.3);
    const out: Piece[] = [sheet(bank(X(-800), X(1500), 975, 1100, r, 10, 60), fill, r)];
    for (const [u, rx, ry] of [[-520, 210, 190], [1230, 230, 210]] as const) {
      out.push(sheet(blob(X(u), 1020, rx, ry, r, 12, 0.3), fill, r));
      for (let k = 0; k < 4; k++) out.push(foam(X(u + (k - 2) * rx * 0.55), 1000 - ry * 0.55 + k * 8, rx * 0.5, r));
    }
    return out;
  },

  // Foreground: a dark rock edge at the lower left with a curl of spray; a single spray streak at the right.
  "12": (c) => {
    const { X } = frame(c);
    const r = c.rng;
    const fill = morn("12");
    return [
      sheet(blob(X(-580), 1060, 230, 180, r, 12, 0.3), fill, r),
      sheet(ribbon(quad([X(1180), 1030], [X(1250), 930], [X(1330), 960], 7), 20, 3), fill, r, { rim: false }),
    ];
  },
};

export default art;
