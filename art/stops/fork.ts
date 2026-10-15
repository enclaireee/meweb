// The lit PIER of the Market Pier stop (stop 3, layer 09 only): a short jetty from the market bank into the water,
// mooring posts, a string of bulbs across two tall poles, a hint of the night market on the bank (lit tarp roofs, a small far
// bianglala). Called from stop-3.ts.
import { C, darken, glow, lantern, mix, poly, rect, sheet, type Piece, type Pt, type Rng } from "../helpers";
import { bianglala } from "../market/scene";
import { M } from "../market/types";
import { scr } from "./shared-a";

/** Positions are screen units u (boat at 0, art units right of it at rest). */
export const GATE_GAP_U = 760; // jetty runs alongside it, the market bank starts just right of it (clear of the tag tree at u~410)

const DECK = 578; // jetty deck top, a little above the waterline (620)

export function gate(lx: number, r: Rng): Piece[] {
  const out: Piece[] = [];
  const X = (u: number) => scr(1, lx, u);
  const wood = mix(C.ramp2, darken(C.bamboo, 0.55), 0.18);
  const g = GATE_GAP_U;
  // the market bank on the right: earth with a warm lit lip, the wheel far behind, lit tarp roofs
  out.push(...bianglala(X(g + 420), 452, 72, r));
  const earth = mix(C.ramp2, M.woodDk, 0.45);
  out.push(sheet([[X(g + 180), 660], [X(g + 210), 600], [X(g + 300), 566], [X(g + 820), 560], [X(g + 820), 660]], earth, r));
  out.push(sheet(poly([[X(g + 230), 592], [X(g + 300), 566], [X(g + 820), 560], [X(g + 820), 566], [X(g + 300), 572], [X(g + 236), 598]]), mix(earth, C.lantern, 0.3), r, { rim: false }));
  ([[280, M.tarpRed, 96], [390, M.tarpTeal, 84], [490, M.tarpYellow, 104], [600, M.tarpRedDk, 90]] as const).forEach(([u, col, ww], k) => {
    const x = X(g + u), by = 568 - k * 1.5, h = ww * 0.62;
    out.push(sheet(poly([[x - ww / 2, by], [x + ww / 2, by], [x + ww / 2, by - h * 0.6], [x - ww / 2, by - h * 0.6]]), darken(M.wood, 0.3), r));
    out.push(sheet(poly([[x - ww * 0.38, by - 4], [x + ww * 0.38, by - 4], [x + ww * 0.38, by - h * 0.55], [x - ww * 0.38, by - h * 0.55]]), C.lantern, r, { rim: false, opacity: 0.92 }));
    out.push(sheet(poly([[x - ww * 0.62, by - h * 0.55], [x - ww * 0.14, by - h * 1.1], [x + ww * 0.14, by - h * 1.1], [x + ww * 0.62, by - h * 0.55]]), col, r));
    out.push(glow(x, by - h * 0.3, ww * 1.3, C.lantern, 0.32));
  });
  // jetty: piles with braces, deck, plank gaps, a warm lit top edge
  const a = g - 190, b = g + 240;
  for (let u = a + 20; u <= b - 30; u += 110) {
    out.push(sheet(rect(X(u) - 7, DECK + 12, 14, 84), M.woodDk, r));
    if (u + 110 <= b - 30) out.push(sheet(poly([[X(u) + 6, DECK + 30], [X(u) + 12, DECK + 30], [X(u + 110) - 6, DECK + 70], [X(u + 110) - 12, DECK + 70]]), M.woodDk, r, { rim: false }));
  }
  out.push(sheet(rect(X(a), DECK, b - a, 16), M.wood, r));
  out.push(sheet(rect(X(a), DECK, b - a, 4), mix(M.woodLt, C.lantern, 0.4), r, { rim: false }));
  for (let u = a + 40; u < b; u += 46) out.push(sheet(rect(X(u), DECK + 4, 2, 12), M.woodDk, r, { rim: false }));
  out.push(sheet(rect(X(a), DECK + 16, b - a, 6), M.woodDk, r, { rim: false }));
  // mooring posts with rope coils, a lamp on the left one
  for (const u of [a + 14, g + 170]) {
    out.push(sheet([[X(u) - 10, DECK - 54], [X(u) + 10, DECK - 60], [X(u) + 10, DECK + 2], [X(u) - 10, DECK + 2]], M.wood, r));
    for (const y of [DECK - 38, DECK - 26]) out.push(sheet(poly([[X(u) - 15, y], [X(u), y - 5], [X(u) + 15, y], [X(u), y + 5]]), darken(M.sack, 0.35), r));
  }
  out.push(...lantern(X(a + 14), DECK - 56, r, 0.6));
  // two tall poles carrying a string of bulbs, dipping over the boat's berth
  const p0 = X(a + 6), p1 = X(g + 190);
  for (const x of [p0, p1]) out.push(sheet(rect(x - 7, 196, 14, 400), wood, r), sheet([[x - 12, 196], [x, 178], [x + 12, 196]], wood, r));
  const wy = (t: number) => 204 + 60 * 4 * t * (1 - t);
  const wire: Pt[] = Array.from({ length: 21 }, (_, k) => [p0 + ((p1 - p0) * k) / 20, wy(k / 20)] as Pt);
  out.push(sheet(poly([...wire.map(([x, y]) => [x, y - 1.5] as Pt), ...wire.map(([x, y]) => [x, y + 1.5] as Pt).reverse()]), C.ramp1, r, { rim: false }));
  for (let k = 1; k <= 11; k++) {
    const t = k / 12, x = p0 + (p1 - p0) * t, y = wy(t) + 16;
    out.push(sheet(rect(x - 1, wy(t), 2, 12), C.ramp1, r, { rim: false }), sheet(poly([[x - 6, y - 2], [x + 6, y - 2], [x + 8, y + 10], [x, y + 18], [x - 8, y + 10]]), C.lantern, r), sheet(poly([[x - 3, y + 2], [x + 3, y + 2], [x + 3, y + 10], [x - 3, y + 10]]), C.lanternCore, r, { rim: false }), glow(x, y + 8, 40, C.lantern, 0.5));
  }
  return out;
}
