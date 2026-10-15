// Stop 6, The Stilt Village (dawn): houses on stilts, lit windows, nets, a dock with a mast and a rack of hats.
import { C, boat, darken, ellipse, lighten, palm, poly, post, sheet, raw, type ArtModule, type Piece, type Pt, type Rng } from "../helpers";
import { bank, ground, blade, blob, frame, lit, mist, quad, ribbon, spray, tone } from "./shared-b";

const I = 7;

/** Stilt house: piles, deck, body, hip roof, ladder. Lit windows at the given relative x positions. */
function house(x: number, yDeck: number, w: number, h: number, r: Rng, fill: string, roof: string, win: number[] = [], pile = 660): Piece[] {
  const out: Piece[] = [];
  for (let px = x + 4; px < x + w; px += w / 3) out.push(sheet([[px - 3, yDeck], [px + 3, yDeck], [px + 3, pile], [px - 3, pile]], fill, r, { rim: false }));
  out.push(sheet([[x - 10, yDeck], [x + w + 10, yDeck], [x + w + 10, yDeck + 7], [x - 10, yDeck + 7]], fill, r));
  out.push(sheet([[x, yDeck], [x + w, yDeck], [x + w, yDeck - h], [x, yDeck - h]], fill, r));
  out.push(sheet([[x - 14, yDeck - h + 3], [x + w / 2 + r.range(-6, 6), yDeck - h - w * 0.28], [x + w + 14, yDeck - h + 3]], roof, r));
  for (const wx of win) out.push(...lit(x + wx, yDeck - h * 0.72, 11, 12, r, 22));
  const lx = x + w + 2;
  out.push(sheet(ribbon([[lx, yDeck + 4], [lx + 26, yDeck + 56]], 3, 3), fill, r, { rim: false }), sheet(ribbon([[lx + 8, yDeck + 2], [lx + 34, yDeck + 54]], 3, 3), fill, r, { rim: false }));
  return out;
}

/** Drying net: a hanging triangle of cord with square gaps, between two poles. */
function net(x: number, y: number, w: number, h: number, r: Rng, fill: string): Piece[] {
  const holes: string[] = [];
  const cell = 14;
  for (let yy = y + 12; yy < y + h - 8; yy += cell)
    for (let xx = x + 8; xx < x + w - 8; xx += cell) {
      const t = (yy - y) / h;
      if (xx > x + 8 + (w - 16) * (1 - t) * 0 && xx < x + w - 8 - (w * 0.5) * t) holes.push(poly([[xx, yy], [xx + cell - 4, yy], [xx + cell - 4, yy + cell - 4], [xx, yy + cell - 4]]));
    }
  return [
    sheet([[x - 3, y - 10], [x + 3, y - 10], [x + 3, y + h + 30], [x - 3, y + h + 30]], fill, r, { rim: false }),
    sheet([[x + w - 3, y - 10], [x + w + 3, y - 10], [x + w + 3, y + h + 30], [x + w - 3, y + h + 30]], fill, r, { rim: false }),
    sheet([[x, y], [x + w, y + 4], [x + w * 0.45, y + h]], fill, r, { holes }),
  ];
}

/** Curling smoke: a tapering pale ribbon, above the filter. */
const smoke = (x: number, y: number, h: number, r: Rng): Piece => {
  const pts = quad([x, y], [x + r.range(-30, 30), y - h * 0.5], [x + r.range(-10, 40), y - h], 9);
  const o = ribbon(pts, 6, 26);
  return raw(Math.min(...o.map((p) => p[0])), Math.max(...o.map((p) => p[0])), `<path d="${poly(o)}" fill="${lighten(C.haze, 0.3)}" opacity=".3"/>`, true);
};

const art: ArtModule = {
  // Environment: a village of houses on stilts over the water, six windows lit in a row, nets, moored boats.
  "07": (c) => {
    const { X } = frame(c);
    const r = c.rng;
    const fill = tone("07", I, 0.05);
    const roof = darken(fill, 0.3);
    const out: Piece[] = [];
    const spec: [number, number, number, number[]][] = [[-250, 96, 58, [20]], [-120, 78, 50, [16, 46]], [20, 104, 62, [22]], [330, 90, 56, [18]], [445, 80, 52, [14, 48]]];
    for (const [u, w, h, win] of spec) out.push(...house(X(u), 566 + r.range(-4, 4), w * r.vary(), h * r.vary(), r, fill, roof, win));
    out.push(...net(X(150), 520, 90, 62, r, fill));
    out.push(...boat(X(-60), 640, 80, r, fill), ...boat(X(300), 642, 70, r, fill));
    out.push(mist(X(-290), X(550), 610, 40, 0.22, I, r));
    return out;
  },

  // Far bank: a shoreline with smaller houses, a generic tiered-roof hall, palms, kitchen smoke.
  "08": (c) => {
    const { X, u0, u1 } = frame(c);
    const r = c.rng;
    const fill = tone("08", I, 0.1);
    const roof = darken(fill, 0.25);
    const out: Piece[] = [];
    out.push(sheet(ground(X(u0), X(u1), 548, r, 6), fill, r));
    for (let u = u0 + 30; u < u1 - 40; u += r.range(65, 110)) {
      if (u > 270 && u < 380) continue;
      const w = r.range(44, 64);
      const h = r.range(28, 40);
      out.push(sheet([[X(u), 552], [X(u) + w, 552], [X(u) + w, 552 - h], [X(u), 552 - h]], fill, r), sheet([[X(u) - 8, 553 - h], [X(u) + w / 2, 520 - h], [X(u) + w + 8, 553 - h]], roof, r));
      if (r() < 0.55) out.push(...lit(X(u) + w * 0.4, 552 - h * 0.7, 7, 8, r, 14));
    }
    for (const u of [-120, 560]) out.push(...palm(X(u), 552, r.range(110, 150), r, fill));
    // generic tiered hall
    const hx = X(325);
    out.push(sheet([[hx - 36, 552], [hx + 36, 552], [hx + 36, 500], [hx - 36, 500]], fill, r));
    for (const [w, y] of [[58, 500], [44, 474], [30, 452]] as const) out.push(sheet([[hx - w, y], [hx, y - 22], [hx + w, y]], roof, r));
    out.push(sheet([[hx - 1.5, 430], [hx + 1.5, 430], [hx + 1.5, 452], [hx - 1.5, 452]], roof, r, { rim: false }));
    out.push(smoke(X(40), 520, 120, r), smoke(X(610), 515, 100, r));
    return out;
  },

  // Action: wooden dock with the tag post, a moored boat with a mast, a rack of conical hats, barrels.
  "09": (c) => {
    const { lx, x1 } = c;
    const r = c.rng;
    const fill = tone("09", I);
    const out: Piece[] = [];
    const dxa = lx + 40;
    const dxb = x1 - 10;
    for (let x = dxa + 14; x < dxb; x += r.range(48, 64)) out.push(sheet([[x - 5, 602], [x + 5, 602], [x + 5, 668], [x - 5, 668]], fill, r));
    out.push(sheet([[dxa, 586], [dxb, 586], [dxb, 604], [dxa, 604]], fill, r, { holes: Array.from({ length: Math.floor((dxb - dxa) / 38) }, (_, k) => poly([[dxa + 30 + k * 38, 592], [dxa + 33 + k * 38, 592], [dxa + 33 + k * 38, 600], [dxa + 30 + k * 38, 600]])) }));
    // moored boat with mast and furled sail
    const bx = lx + 330;
    out.push(...boat(bx, 606, 150, r, fill));
    out.push(sheet([[bx - 2.5, 330], [bx + 2.5, 330], [bx + 2.5, 618], [bx - 2.5, 618]], fill, r), sheet([[bx + 3, 390], [bx + 36, 548], [bx + 3, 548]], lighten(fill, 0.18), r, { rim: false }));
    out.push(...lit(bx - 6, 326, 12, 12, r, 26).slice(0, 1));
    // hat rack
    const rx = lx + 600;
    out.push(sheet([[rx - 4, 420], [rx + 4, 420], [rx + 4, 588], [rx - 4, 588]], fill, r), sheet([[rx - 90, 420], [rx + 90, 420], [rx + 90, 428], [rx - 90, 428]], fill, r));
    for (let k = 0; k < 6; k++) out.push(cone(rx - 80 + k * 32, 432, 34 * r.vary(), 24 * r.vary(), darken(C.bamboo, 0.5), r));
    // barrels
    for (const dx of [180, 215, 760]) out.push(sheet([[lx + dx, 586], [lx + dx + 28, 586], [lx + dx + 32, 556], [lx + dx - 4, 556]], darken(fill, 0.1), r, { holes: [poly([[lx + dx - 2, 566], [lx + dx + 30, 566], [lx + dx + 30, 569], [lx + dx - 2, 569]])] }));
    out.push(...post(lx, r, fill));
    return out;
  },

  // Near-1: buoys and rope at the bottom left, a cat on a barrel at the right, a drying net on poles.
  "10": (c) => {
    const { X, u0, u1 } = frame(c);
    const r = c.rng;
    const fill = tone("10", I, 0.1);
    const out: Piece[] = [sheet(bank(X(u0), X(u1), 985, 1100, r, 5), fill, r)];
    for (const [u, rad] of [[-480, 26], [-430, 20], [-380, 24]] as const) out.push(sheet(ellipse(X(u), 960, rad, rad, 14), darken(C.ember, 0.62), r, { holes: [poly([[X(u) - rad, 958], [X(u) + rad, 958], [X(u) + rad, 962], [X(u) - rad, 962]])] }));
    out.push(...net(X(-300), 700, 150, 190, r, fill));
    // barrel with a cat
    const bx = X(980);
    out.push(sheet([[bx - 46, 1010], [bx + 46, 1010], [bx + 52, 880], [bx - 52, 880]], fill, r, { holes: [poly([[bx - 50, 920], [bx + 50, 920], [bx + 50, 926], [bx - 50, 926]]), poly([[bx - 48, 968], [bx + 48, 968], [bx + 48, 974], [bx - 48, 974]])] }));
    out.push(sheet(blob(bx, 850, 34, 34, r, 12, 0.5), fill, r), sheet([[bx - 22, 828], [bx - 26, 796], [bx - 8, 818]], fill, r, { rim: false }), sheet([[bx + 6, 818], [bx + 24, 796], [bx + 24, 832]], fill, r, { rim: false }));
    out.push(sheet(ribbon(quad([bx + 30, 860], [bx + 90, 850], [bx + 80, 790], 6), 9, 4), fill, r, { rim: false }));
    return out;
  },

  // Near-2: bamboo poles with rope at the left edge, a dark gunwale along the bottom.
  "11": (c) => {
    const { X } = frame(c);
    const r = c.rng;
    const fill = tone("11", I, 0.2);
    const out: Piece[] = [sheet(bank(X(-800), X(1500), 955, 1100, r, 12, 70), fill, r)];
    for (const [u, top] of [[-540, 160], [-470, 300], [1250, 240]] as const) out.push(sheet([[X(u) - 12, 1020], [X(u) + 12, 1020], [X(u) + 9, top], [X(u) - 9, top]], fill, r));
    out.push(sheet(ribbon(quad([X(-540), 330], [X(-505), 420], [X(-470), 470], 6), 5, 5), fill, r, { rim: false }));
    return out;
  },

  // Foreground: a banana leaf drooping into the top left and a bamboo tip at the top right.
  "12": (c) => {
    const { X } = frame(c);
    const r = c.rng;
    const fill = tone("12", I);
    return [...spray(X(-567), -30, 4, 300, 90, fill, r, 1, 46), blade(X(1250), -20, X(1180), 330, -30, 26, fill, r), blade(X(1310), -20, X(1290), 240, 20, 20, fill, r)];
  },
};

function cone(x: number, y: number, w: number, h: number, fill: string, r: Rng): Piece {
  return sheet([[x - w / 2, y + h], [x, y], [x + w / 2, y + h]], fill, r);
}

export default art;
export type { Pt };
