import type { CSSProperties } from "react";
import type { CutFile, CutPiece } from "@/scene/paper/cut";
import { stockColor, type Stock } from "@/design/tokens";
import cut from "@/scene/worker/art/worker.cut.json";
import styles from "./Deck.module.css";

const file = cut as unknown as CutFile;

/** Parts that move together, turning on their root's pin (the only motion paper allows: concept.md §2.8). */
const groups: Record<string, string> = {
  head: "head",
  eye: "head",
  hat: "head",
  headlamp: "head",
  "arm-front-upper": "arm",
  "arm-front-lower": "arm",
  clipboard: "arm",
};
const pins: Record<string, [number, number]> = Object.fromEntries(file.sheets.map((s) => [s.id, s.pivot ?? [0, 0]]));

/** a cut piece as an SVG path (y flipped: the cut file is y up), holes cut through with evenodd */
const d = (p: CutPiece) =>
  [p.outer, ...p.holes]
    .map((ring) => {
      let s = "";
      for (let i = 0; i < ring.length; i += 2) s += `${i ? "L" : "M"}${ring[i]!.toFixed(3)} ${(-ring[i + 1]!).toFixed(3)}`;
      return s + "Z";
    })
    .join("");

// the puppet's extent, for the viewBox
const xs = file.sheets.flatMap((s) => s.pieces.flatMap((p) => p.outer.filter((_, i) => i % 2 === 0)));
const ys = file.sheets.flatMap((s) => s.pieces.flatMap((p) => p.outer.filter((_, i) => i % 2 === 1)));
const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
const pad = 0.12;
const viewBox = `${(x0 - pad).toFixed(2)} ${(-y1 - pad).toFixed(2)} ${(x1 - x0 + 2 * pad).toFixed(2)} ${(y1 - y0 + 2 * pad).toFixed(2)}`;

/**
 * The storyteller (mobile_concept.md §4.4): the same worker as in the 3D box, cut from the same shapes
 * (worker.cut.json), flat on the lip of the phone stage. Rendered on the server: no client JS for his
 * paper. The head and the arm turn on their pins (CSS).
 */
export function Storyteller() {
  return (
    <svg className={styles.puppet} viewBox={viewBox} aria-hidden>
      {file.sheets.map((s) => {
        const g = groups[s.id];
        const [px, py] = pins[g === "head" ? "head" : g === "arm" ? "arm-front-upper" : s.id]!;
        const style = { transformOrigin: `${px}px ${-py}px` } as CSSProperties;
        return (
          <g key={s.id} className={g ? styles[g] : undefined} style={g ? style : undefined}>
            {s.pieces.map((p, k) => (
              <path key={k} d={d(p)} fill={stockColor(s.stock as Stock, "morning")} fillRule="evenodd" />
            ))}
          </g>
        );
      })}
    </svg>
  );
}
