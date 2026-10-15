// Stop 4, The Mangroves (late night): arching roots, thick mist, a dark channel opening to the right.
import { C, darken, ellipse, poly, post, sheet, type ArtModule, type Piece, type Pt } from "../helpers";
import { bank, ground, blade, blob, frame, green, mangrove, mist, quad, ribbon, spray, tone } from "./shared-b";

const I = 5;

const art: ArtModule = {
  // Environment: a maze of mangroves on the left and centre, mudflat with crabs, channel opening right.
  "07": (c) => {
    const { X, u0, u1 } = frame(c);
    const r = c.rng;
    const fill = tone("07", I, 0.5);
    const hi = green("07", I, 0.15);
    const out: Piece[] = [];
    out.push(sheet(bank(X(u0), X(u1), 626, 700, r, 12), tone("07", I, 0.1), r));
    const trees: [number, number][] = [[-250, 270], [-120, 230], [20, 300], [150, 220], [470, 250], [545, 210]];
    for (const [u, h] of trees) out.push(...mangrove(X(u + r.range(-15, 15)), 640, h * r.vary(), r, fill, hi));
    // nested arches between trees: the rhythm of the maze
    for (const [ua, ub, ht] of [[-200, -70, 150], [-60, 80, 170], [60, 190, 120], [-300, -190, 110]] as const) {
      const pts: Pt[] = [];
      const cx = X((ua + ub) / 2);
      const rx = (ub - ua) / 2;
      for (let k = 0; k <= 8; k++) {
        const a = Math.PI + (Math.PI * k) / 8;
        pts.push([cx + Math.cos(a) * rx, 640 + Math.sin(a) * ht]);
      }
      out.push(sheet(ribbon(pts, 12, 6), fill, r));
    }
    for (const u of [260, 330, 395]) {
      const x = X(u);
      out.push(sheet(blob(x, 618, 7, 4, r, 8, 0.6), fill, r, { rim: false }));
      out.push(sheet([[x - 9, 619], [x - 14, 612], [x - 11, 619]], fill, r, { rim: false }), sheet([[x + 9, 619], [x + 14, 612], [x + 11, 619]], fill, r, { rim: false }));
    }
    return out;
  },

  // Far bank: more canopy, a dark channel opening into the distance on the right, low mist.
  "08": (c) => {
    const { X, u0, u1 } = frame(c);
    const r = c.rng;
    const fill = tone("08", I, 0.5);
    const hi = green("08", I, 0.12);
    const out: Piece[] = [];
    out.push(sheet(ground(X(u0), X(u1), 600, r, 8), tone("08", I, 0.1), r));
    for (let u = u0 + 10; u < 330; u += r.range(60, 95)) out.push(...mangrove(X(u), 612, r.range(120, 190), r, fill, hi));
    for (let u = 700; u < u1; u += r.range(70, 110)) out.push(...mangrove(X(u), 612, r.range(110, 170), r, fill, hi));
    for (let u = 330; u < 700; u += r.range(40, 70)) out.push(sheet(blob(X(u), 598, 22, 8, r, 8, 0.5), fill, r, { rim: false }));
    out.push(mist(X(u0), X(u1), 575, 90, 0.28, I, r), mist(X(u0 + 100), X(u1 - 50), 520, 50, 0.22, I, r));
    return out;
  },

  // Action: the tag post, a root arch spanning over the boat and tag, aerial roots, shell, knees, second arch.
  "09": (c) => {
    const { lx, x0, x1 } = c;
    const r = c.rng;
    const fill = tone("09", I, 0.25);
    const out: Piece[] = [];
    out.push(sheet(bank(x0, x1, 636, 720, r, 6), tone("09", I, 0.15), r));
    // the arch: a root rising from the left, peaking above the tag, landing on the post top
    const up: Pt[] = [];
    for (let k = 0; k <= 9; k++) {
      const a = Math.PI + (Math.PI / 2) * (k / 9);
      up.push([lx - 150 + Math.cos(a) * 370, 645 + Math.sin(a) * 440]);
    }
    const centre = [...up, ...quad([lx - 150, 205], [lx + 20, 202], [lx + 152, 240], 6).slice(1)];
    out.push(sheet(ribbon(centre, 26, 13), fill, r));
    // aerial roots hanging off the arch, left of the boat, and short tendrils above the tag
    for (const [dx, dy, tx, ty, b] of [[-455, 330, -520, 640, -22], [-430, 345, -440, 640, 18], [-505, 460, -560, 645, -14]] as const)
      out.push(blade(lx + dx, dy, lx + tx, ty, b, 7, fill, r, true));
    for (const dx of [-300, -230, -160, -90]) out.push(blade(lx + dx, 212 + (dx + 400) * 0.01, lx + dx + r.range(-8, 8), 262 + r.range(0, 24), r.range(-6, 6), 3.5, fill, r));
    // knee roots (pneumatophores) at the water, away from the boat
    for (let x = x0 + 40; x < x1 - 30; x += r.range(28, 60)) {
      const dx = x - lx;
      if (dx > -440 && dx < -100) continue; // boat span
      const h = r.range(14, 42);
      out.push(sheet([[x - 3, 646], [x + 3, 646], [x + 1.5, 636 - h], [x - 1.5, 636 - h]], fill, r, { rim: false }));
    }
    // a nautilus shell on the left root
    const sx = lx - 500;
    const sy = 600;
    const spiral: Pt[] = Array.from({ length: 22 }, (_, k) => {
      const t = k / 21;
      const a = t * Math.PI * 4;
      const rad = 3 + t * 15;
      return [sx + Math.cos(a) * rad, sy + Math.sin(a) * rad] as Pt;
    });
    out.push(sheet(ellipse(sx, sy, 22, 20, 14), darken(C.bamboo, 0.5), r, { holes: [poly(ribbon(spiral, 2.2, 3.4))] }));
    // second, smaller arch on the right, with a lit lantern-free base
    const ex = lx + 420;
    const arch: Pt[] = Array.from({ length: 9 }, (_, k) => {
      const a = Math.PI + (Math.PI * k) / 8;
      return [ex + 130 + Math.cos(a) * 130, 645 + Math.sin(a) * 210] as Pt;
    });
    out.push(sheet(ribbon(arch, 20, 12), fill, r));
    out.push(blade(ex + 20, 560, ex - 20, 645, -10, 6, fill, r), blade(ex + 230, 530, ex + 285, 645, 14, 6, fill, r));
    out.push(...post(lx, r, tone("09", I, 0.25)));
    return out;
  },

  // Near-1: reed beds and mud knees at the bottom, propagules hanging from the top left.
  "10": (c) => {
    const { X, u0, u1 } = frame(c);
    const r = c.rng;
    const fill = tone("10", I, 0.4);
    const out: Piece[] = [];
    out.push(sheet(bank(X(u0), X(u1), 975, 1100, r, 8), fill, r));
    for (let u = -700; u < 1380; u += r.range(120, 190)) {
      if (u > -190 && u < 190) continue;
      out.push(...spray(X(u), 1010, r.int(4, 6), r.range(120, 190), 70, fill, r, -1, 12));
    }
    for (const u of [-690, -600, -470, 880, 1010, 1190]) {
      const len = r.range(120, 220);
      out.push(sheet([[X(u) - 3, -20], [X(u) + 3, -20], [X(u) + 5, len], [X(u), len + 28], [X(u) - 5, len]], fill, r, { rim: false }));
    }
    return out;
  },

  // Near-2: root tangles at both edges with cut gaps, hanging roots from the top, soft mud slab.
  "11": (c) => {
    const { X, u0, u1 } = frame(c);
    const r = c.rng;
    const fill = tone("11", I, 0.5);
    const out: Piece[] = [];
    out.push(sheet(bank(X(-800), X(1500), 945, 1100, r, 14, 60), fill, r));
    for (const [ua, dir] of [[-560, 1], [1180, -1]] as const) {
      for (let k = 0; k < 6; k++) {
        const bx = X(ua + dir * k * 38);
        const h = r.range(320, 540);
        const s = dir * r.range(60, 150);
        out.push(sheet(ribbon(quad([bx, 1010], [bx + s * 0.2, 1010 - h * 0.6], [bx + s, 1010 - h], 9), 36, 10), fill, r));
      }
      // hanging roots from the top
      for (let k = 0; k < 4; k++) {
        const bx = X(ua + dir * (k * 70 - 20));
        out.push(blade(bx, -30, bx + r.range(-30, 30), r.range(160, 330), r.range(-30, 30), 16, fill, r));
      }
    }
    return out;
  },

  // Foreground: leaf clusters curling in at the top corners, a reed spray at the bottom corners.
  "12": (c) => {
    const { X } = frame(c);
    const r = c.rng;
    const fill = tone("12", I);
    const out: Piece[] = [];
    for (const [u, dir] of [[-567, 1], [1321, -1]] as const) {
      out.push(...spray(X(u), -30, 5, 330, 100, fill, r, 1, 54));
      out.push(sheet(blob(X(u + dir * 90), 0, 160, 110, r, 12, 0.5), fill, r, { rim: false }));
    }
    out.push(blade(X(-120), -30, X(-40), 250, 50, 36, fill, r), blade(X(-20), -30, X(60), 170, 30, 28, fill, r));
    for (const u of [-560, 1300]) out.push(...spray(X(u), 1040, 7, 260, 80, fill, r, -1, 26));
    return out;
  },
};

export default art;
