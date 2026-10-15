// Stop 5, The Estuary (pre-dawn): banks fall away, sandbars, a fishing pier with a solar panel post, open horizon.
import { C, darken, lighten, palm, poly, post, sheet, type ArtModule, type Piece, type Pt } from "../helpers";
import { bank, blob, frame, spray, tone } from "./shared-b";

const I = 6;

/** Sandbar: a low lens that tapers to the water at both ends. */
const bar = (xa: number, xb: number, y: number, r: Parameters<typeof bank>[4]): Pt[] => {
  const mid = bank(xa + 70, xb - 70, y, y + 60, r, 4, 40).slice(0, -2);
  return [[xa, y + 50], ...mid, [xb, y + 50]];
};

const art: ArtModule = {
  // Sandbars, a long fishing pier with a small hut.
  "07": (c) => {
    const { X, u1 } = frame(c);
    const r = c.rng;
    const fill = tone("07", I, 0.1);
    const out: Piece[] = [];
    for (const [ua, ub, y] of [[-290, -40, 596], [70, 300, 606], [380, 560, 600]] as const) out.push(sheet([...bar(X(ua), X(ub), y, r), [X(ub), 660], [X(ua), 660]], fill, r));
    // pier: deck, piles, rail, hut
    const dx0 = X(150);
    const dx1 = X(u1 + 120);
    out.push(sheet([[dx0, 566], [dx1, 566], [dx1, 576], [dx0, 576]], fill, r));
    for (let x = dx0 + 12; x < dx1; x += r.range(34, 46)) out.push(sheet([[x - 3, 576], [x + 3, 576], [x + 3, 650], [x - 3, 650]], fill, r, { rim: false }));
    for (let x = dx0; x < dx1; x += 70) out.push(sheet([[x - 1.5, 548], [x + 1.5, 548], [x + 1.5, 566], [x - 1.5, 566]], fill, r, { rim: false }));
    out.push(sheet([[dx0, 548], [dx1, 548], [dx1, 551], [dx0, 551]], fill, r, { rim: false }));
    const hx = X(430);
    out.push(sheet([[hx, 566], [hx + 70, 566], [hx + 70, 520], [hx + 35, 500], [hx, 520]], darken(fill, 0.15), r));
    out.push(sheet([[hx + 22, 546], [hx + 34, 546], [hx + 34, 534], [hx + 22, 534]], C.window, r, { rim: false }));
    return out;
  },

  // Low far shore with palm silhouettes; the sea opens to the right, with one far sail.
  "08": (c) => {
    const { X, u0 } = frame(c);
    const r = c.rng;
    const fill = tone("08", I, 0.15);
    const out: Piece[] = [];
    const ua = u0 + 5;
    const ub = 250;
    out.push(sheet([...bar(X(ua), X(ub), 520, r), [X(ub), 660], [X(ua), 660]], fill, r));
    for (let u = ua + 30; u < ub - 20; u += r.range(55, 120)) out.push(...palm(X(u), 524, r.range(80, 150), r, fill));
    for (let u = ua + 60; u < ub; u += r.range(70, 130)) out.push(sheet(blob(X(u), 520, 40, 16, r, 10, 0.4), fill, r, { rim: false }));
    out.push(sheet([...bar(X(ub - 40), X(ub + 170), 530, r), [X(ub + 170), 650], [X(ub - 40), 650]], fill, r));
    const sx = X(560);
    out.push(sheet([[sx - 26, 560], [sx + 30, 562], [sx + 24, 570], [sx - 20, 570]], fill, r), sheet([[sx, 468], [sx + 22, 556], [sx - 2, 556]], lighten(fill, 0.25), r, { rim: false }));
    return out;
  },

  // Action: the tag post with a hinged solar panel, fishing pier deck with piles, crates, a moored skiff.
  "09": (c) => {
    const { lx, x1 } = c;
    const r = c.rng;
    const fill = tone("09", I);
    const out: Piece[] = [];
    const dxa = lx + 40;
    const dxb = x1 - 10;
    for (let x = dxa + 14; x < dxb; x += r.range(52, 70)) out.push(sheet([[x - 5, 602], [x + 5, 602], [x + 5, 665], [x - 5, 665]], fill, r));
    out.push(sheet([[dxa, 588], [dxb, 588], [dxb, 604], [dxa, 604]], fill, r));
    for (let x = dxa + 280; x < dxb; x += 90) out.push(sheet([[x - 2, 556], [x + 2, 556], [x + 2, 588], [x - 2, 588]], fill, r, { rim: false }));
    out.push(sheet([[dxa + 280, 556], [dxb, 556], [dxb, 560], [dxa + 280, 560]], fill, r, { rim: false }));
    for (const [dx, w, h] of [[330, 46, 34], [372, 38, 26], [610, 52, 40]] as const)
      out.push(sheet([[lx + dx, 588], [lx + dx + w, 588], [lx + dx + w, 588 - h], [lx + dx, 588 - h]], darken(fill, 0.1), r, { holes: [poly([[lx + dx + 8, 574], [lx + dx + w - 8, 574], [lx + dx + w - 8, 578], [lx + dx + 8, 578]])] }));
    const bx = lx + 700;
    out.push(sheet([[bx - 70, 596], [bx + 70, 592], [bx + 52, 626], [bx - 52, 626]], fill, r), sheet([[bx - 2, 500], [bx + 2, 500], [bx + 2, 594], [bx - 2, 594]], fill, r, { rim: false }));
    // the post, solar panel on a hinge arm, tilted toward the pale horizon on the right
    out.push(...post(lx, r, fill));
    const px = lx + 150;
    out.push(sheet([[px - 4, 232], [px + 6, 232], [px + 6, 214], [px - 4, 214]], C.ramp1, r, { rim: false }));
    const cells = [0.18, 0.4, 0.62, 0.84].map((t) => {
      const x = px - 80 + 172 * t;
      const y = 200 - 36 * t;
      return poly([[x, y + 3], [x + 5, y + 2], [x + 6, y + 14], [x + 1, y + 15]]);
    });
    out.push(sheet([[px - 80, 200], [px + 92, 164], [px + 98, 186], [px - 74, 224]], lighten(fill, 0.1), r, { holes: cells }));
    return out;
  },

  // Near-1: beach grass at the bottom edge, a stranded driftwood log lower right.
  "10": (c) => {
    const { X, u0, u1 } = frame(c);
    const r = c.rng;
    const fill = tone("10", I, 0.35);
    const out: Piece[] = [sheet(bank(X(u0), X(u1), 985, 1100, r, 6), fill, r)];
    for (let u = -700; u < 1380; u += r.range(150, 260)) {
      if (u > -190 && u < 190) continue;
      out.push(...spray(X(u), 1005, r.int(4, 6), r.range(90, 150), 60, fill, r, -1, 9));
    }
    const l = X(760);
    out.push(sheet([[l, 950], [l + 330, 936], [l + 338, 962], [l + 6, 982]], fill, r), sheet([[l + 250, 940], [l + 300, 880], [l + 310, 884], [l + 280, 945]], fill, r, { rim: false }));
    return out;
  },

  // Near-2: sparse dune grass at both bottom corners.
  "11": (c) => {
    const { X } = frame(c);
    const r = c.rng;
    const fill = tone("11", I, 0.4);
    const out: Piece[] = [sheet(bank(X(-800), X(1500), 965, 1100, r, 10, 60), fill, r)];
    for (const u of [-560, -450, 1120, 1250]) out.push(...spray(X(u), 1010, 6, r.range(200, 300), 80, fill, r, -1, 18));
    return out;
  },

  // Foreground: one palm frond curling into the top left, grass at the bottom right.
  "12": (c) => {
    const { X } = frame(c);
    const r = c.rng;
    const fill = tone("12", I);
    return [...spray(X(-567), -30, 4, 300, 90, fill, r, 1, 44), ...spray(X(1300), 1040, 6, 240, 80, fill, r, -1, 24)];
  },
};

export default art;
