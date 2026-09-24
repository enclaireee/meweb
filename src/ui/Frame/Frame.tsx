import { mulberry32, hashString } from "@/lib/rng";
import styles from "./Frame.module.css";

/**
 * The frame that closes the box (design.md §3), built as paper: an outer frame, a cream mat and a thin
 * pinstripe, stacked, each with a hand-cut inner edge and a shadow on the sheet below, with photo
 * corners holding the view in. Server-rendered; the cut is seeded, so it's the same on every load.
 */

type Layer = { id: string; inset: number; insetMobile: number };

const layers: Layer[] = [
  { id: "outer", inset: 12, insetMobile: 7 },
  { id: "mat", inset: 20, insetMobile: 11 },
  { id: "stripe", inset: 23, insetMobile: 13 },
];

/** A ring: the viewport rect minus a wobbly inner rect `inset` px in (evenodd), as a CSS polygon(). */
function ring(id: string, inset: number, wobble: number): string {
  const r = mulberry32(hashString(`frame:${id}:${inset}`));
  const n = 28;
  const pts: string[] = [];
  const jitter = () => ((r() * 2 - 1) * wobble).toFixed(2);
  const along = (t: number) => `calc(${(t * 100).toFixed(2)}% + ${(inset * (1 - 2 * t)).toFixed(2)}px)`;
  const edge = (fixed: string, t: number, horizontal: boolean) => {
    const j = Number(jitter());
    return horizontal ? `${along(t)} calc(${fixed} ${j >= 0 ? "+" : "-"} ${Math.abs(j)}px)` : `calc(${fixed} ${j >= 0 ? "+" : "-"} ${Math.abs(j)}px) ${along(t)}`;
  };
  for (let i = 0; i < n; i++) pts.push(edge(`${inset}px`, i / n, true)); // top, left → right
  for (let i = 0; i < n; i++) pts.push(edge(`100% - ${inset}px`, i / n, false)); // right, top → bottom
  for (let i = n; i > 0; i--) pts.push(edge(`100% - ${inset}px`, i / n, true)); // bottom, right → left
  for (let i = n; i > 0; i--) pts.push(edge(`${inset}px`, i / n, false)); // left, bottom → top
  return `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${pts.join(", ")}, ${pts[0]})`;
}

export function Frame() {
  const vars: Record<string, string> = {};
  for (const l of layers) {
    vars[`--ring-${l.id}`] = ring(l.id, l.inset, 1.1);
    vars[`--ring-${l.id}-m`] = ring(l.id, l.insetMobile, 0.7);
  }
  return (
    <div className={styles.frame} style={vars} aria-hidden>
      {/* bottom sheet first: the pinstripe, then the mat, then the frame on top */}
      <div className={`${styles.cast} ${styles.shadowSoft}`}>
        <div className={`${styles.layer} ${styles.stripe}`} />
      </div>
      <div className={`${styles.cast} ${styles.shadowSoft}`}>
        <div className={`${styles.layer} ${styles.mat}`} />
      </div>
      <div className={`${styles.cast} ${styles.shadowDeep}`}>
        <div className={`${styles.layer} ${styles.outer}`} />
      </div>
      <div className={`${styles.corners} ${styles.shadowSoft}`}>
        <span className={styles.tl} />
        <span className={styles.tr} />
        <span className={styles.bl} />
        <span className={styles.br} />
      </div>
    </div>
  );
}
