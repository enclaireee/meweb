import type { CSSProperties } from "react";
import { papers, rooms, type Room } from "@/design/tokens";
import { seeded } from "@/lib/rng";
import styles from "./Decor.module.css";

type Shape = "star" | "moon" | "disc" | "diamond" | "leaf" | "crane";

/** width : height of each cut (clips.svg), and where its string meets it (% of the box, from the back) */
const cut: Record<Shape, { aspect: number; hook: [number, number] }> = {
  star: { aspect: 1, hook: [50, 40] },
  moon: { aspect: 1, hook: [26, 30] },
  disc: { aspect: 1, hook: [50, 40] },
  diamond: { aspect: 1, hook: [50, 40] },
  leaf: { aspect: 0.7, hook: [50, 35] },
  crane: { aspect: 1.3, hook: [57, 45] },
};
const shapes = Object.keys(cut) as Shape[];

/**
 * Where decorations may hang on desktop, as [left, right] vw × [top, bottom] vh for the top of the piece:
 * the ceiling band over the left half, the room's left side beside the nav, and two gaps behind the card
 * cluster on the right. The doorway, the worker and the cards' faces stay clear.
 */
const zones: [number, number, number, number][] = [
  [3, 11, 3, 16],
  [11, 19, 6, 20],
  [19, 27, 2, 14],
  [27, 35, 5, 18],
  [35, 43, 2, 12],
  [43, 50, 6, 20],
  [16, 24, 25, 36],
  [14, 21, 38, 48],
  [3, 10, 24, 32],
  [64, 70, 29, 38],
  [88, 95, 26, 36],
];

const between = (r: () => number, a: number, b: number) => a + (b - a) * r();

/** the papers of this room's pack, never the accent (it belongs to the worker) */
const stocks = (room: Room) => [papers[room.stripe], papers[room.rug], papers[room.rugBorder], papers[room.trim], papers.cream];

/**
 * Paper decorations hung around a room (desktop only): cut stars, moons, discs, leaves and cranes on
 * strings, and a bunting garland, all from the room's own paper pack. Lowered in with the room's cards,
 * each at its own depth, swaying slowly on its string (concept.md §4.8). Purely decorative.
 */
export function Decor({ index }: { index: number }) {
  const room = rooms[index]!;
  const colours = stocks(room);
  const r = seeded(`decor:${index}`);
  const pick = <T,>(a: readonly T[]) => a[Math.floor(r() * a.length)]!;

  const pieces = zones.map(([x0, x1, y0, y1], k) => {
    const shape = pick(shapes);
    const { aspect, hook } = cut[shape];
    const vars = {
      "--x": `${between(r, x0, x1).toFixed(2)}vw`,
      "--y": `${between(r, y0, y1).toFixed(2)}vh`,
      "--s": between(r, 0.75, 1.35).toFixed(2),
      "--aspect": aspect,
      "--hook-x": `${hook[0]}%`,
      "--hook-y": `${hook[1]}%`,
      "--tilt": `${between(r, -9, 9).toFixed(1)}deg`,
      "--amp": `${between(r, 1.5, 3.5).toFixed(1)}deg`,
      "--dur": `${between(r, 5, 7).toFixed(2)}s`,
      "--phase": `${(-between(r, 0, 7)).toFixed(2)}s`,
      "--depth": between(r, 0.4, 1.5).toFixed(2),
      "--k": k,
    } as CSSProperties;
    return (
      <span key={k} className={styles.piece} style={vars}>
        <span className={styles.parallax}>
          <span className={styles.string} />
          <span className={styles.swing}>
            <span className="cast">
              <span className={`${styles.shape} paper grain`} style={{ backgroundColor: pick(colours), clipPath: `var(--clip-${shape})` }} />
            </span>
          </span>
        </span>
      </span>
    );
  });

  return (
    <div className={styles.decor} aria-hidden>
      {index !== 6 && <Garland r={r} colours={colours} />}
      {pieces}
    </div>
  );
}

/**
 * A bunting garland over part of the ceiling band: a sagging twine with pennants hung along it, each
 * cut a touch differently (the Wall has its own, in the scene).
 */
function Garland({ r, colours }: { r: () => number; colours: string[] }) {
  const n = 7 + Math.floor(r() * 3);
  const sag = between(r, 9, 15);
  const y = (x: number) => 1 + (4 * sag * x * (100 - x)) / 10000;
  const w = (100 / n) * 0.78;
  const jig = () => between(r, -0.5, 0.5);
  const flags = Array.from({ length: n }, (_, i) => {
    const cx = ((i + 0.5) * 100) / n;
    const a = cx - w / 2;
    const b = cx + w / 2;
    const pts = [
      [a + jig(), y(a)],
      [b + jig(), y(b)],
      [cx + jig() * 2, y(cx) + between(r, 11, 14)],
    ];
    return <polygon key={i} points={pts.map(([px, py]) => `${px!.toFixed(2)},${py!.toFixed(2)}`).join(" ")} fill={colours[i % colours.length]} />;
  });
  const vars = {
    "--x": `${between(r, 5, 22).toFixed(2)}vw`,
    "--y": `${between(r, 2, 5).toFixed(2)}vh`,
    "--w": `${between(r, 20, 27).toFixed(2)}vw`,
    "--depth": "0.5",
    "--k": 0,
    "--tilt": "0deg",
    "--amp": "0.5deg",
    "--dur": "6.4s",
    "--phase": "-2s",
  } as CSSProperties;
  return (
    <span className={`${styles.piece} ${styles.garland}`} style={vars}>
      <span className={styles.parallax}>
        <span className={`${styles.string} ${styles.left}`} />
        <span className={`${styles.string} ${styles.right}`} />
        <span className={styles.swing}>
          <svg className="cast" viewBox={`0 0 100 ${Math.ceil(1 + sag + 16)}`} width="100%">
            <path d={`M0 1 Q50 ${1 + 2 * sag} 100 1`} fill="none" stroke="var(--twine, currentColor)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            {flags}
          </svg>
        </span>
      </span>
    </span>
  );
}
