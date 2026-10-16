import { useState, type CSSProperties } from "react";
import { copy } from "@/content/site";
import styles from "./Landing.module.css";
import paper from "./paper.module.css";

/*
 * The Spring: a title page over the water. A paper-cut statement, one line about me, two ways in, and a string of
 * lanterns tied across the grove (art units, x from the boat, as Notes' spots). The intro is CSS keyed on data-on:
 * the words drop and split into layers, the rest rises, then the lanterns light in order.
 */

type Pt = [x: number, y: number];
// Twine spans: tie, tie, sag. Ties match stop-0's art (left grove, the post's crossbeam ends, right grove).
const SPANS: [Pt, Pt, number][] = [
  [[-390, 262], [238, 246], 56],
  [[492, 246], [880, 318], 48],
];
/** Point on span s at t (a quadratic with its control over the middle, so x is linear in t). */
const at = (s: number, t: number): Pt => {
  const [[x0, y0], [x1, y1], sag] = SPANS[s]!;
  const yc = (y0 + y1) / 2 + 2 * sag;
  return [x0 + t * (x1 - x0), (1 - t) ** 2 * y0 + 2 * t * (1 - t) * yc + t * t * y1];
};
const path = SPANS.map(([[x0, y0], [x1, y1], sag]) => `M${x0} ${y0}Q${(x0 + x1) / 2} ${(y0 + y1) / 2 + 2 * sag} ${x1} ${y1}`).join("");
const LAMPS: Pt[] = [0.06, 0.22, 0.38, 0.54, 0.7, 0.86].map((t) => at(0, t)).concat([0.1, 0.3, 0.5, 0.7, 0.9].map((t) => at(1, t)));

// "*word*" marks the lit word.
const WORDS = copy.heroLine.split(" ").map((w) => ({ w: w.replace(/\*/g, ""), lit: w.startsWith("*") }));
const LINE = WORDS.map((x) => x.w).join(" ");

export function Landing({ on, flow = false, go, made }: { on: boolean; flow?: boolean; go: (n: number) => void; made: () => void }) {
  // Once you've left the title page, coming back is a quiet rise, not the whole intro again.
  const [wasOn, setWasOn] = useState(on);
  const [again, setAgain] = useState(false);
  if (on !== wasOn) {
    setWasOn(on);
    if (!on) setAgain(true);
  }
  return (
    <section
      className={`${flow ? styles.flow : styles.set} ${paper.skin}`}
      data-on={on}
      data-again={again || undefined}
      data-stop="stop-0"
      inert={!on}
      aria-labelledby="landing-line"
    >
      {!flow && (
        <svg className={styles.line} viewBox="-400 0 1300 1000" aria-hidden="true" focusable="false">
          <path className={styles.twine} d={path} />
          {LAMPS.map(([x, y], i) => (
            <g key={i} className={styles.lamp} style={{ "--li": i } as CSSProperties}>
              <circle cx={x} cy={y + 12} r="24" className={styles.halo} />
              <rect x={x - 6} y={y + 2} width="12" height="17" rx="5" className={styles.shell} />
              <rect x={x - 6} y={y + 2} width="12" height="17" rx="5" className={styles.lit} />
            </g>
          ))}
        </svg>
      )}

      <div className={styles.hero}>
        <p className={styles.kicker}>{copy.heroKicker}</p>
        <h2 id="landing-line" className={styles.word} aria-label={LINE}>
          {WORDS.map(({ w, lit }, i) => (
            <span key={i} className={styles.ch} data-lit={lit || undefined} style={{ "--i": i } as CSSProperties} aria-hidden="true">
              <span className={styles.lyr} data-l="0">{w}</span>
              <span className={styles.lyr} data-l="1">{w}</span>
              <span className={styles.lyr} data-l="2">{w}</span>
            </span>
          ))}
        </h2>
        <p className={styles.lede}>{copy.heroLede}</p>
        <p className={styles.acts}>
          <button type="button" className={paper.btnPaper} onClick={() => made()}>
            {copy.made} <span aria-hidden="true">→</span>
          </button>
          <button type="button" className={styles.ghost} onClick={() => go(3)}>
            {copy.sayHello}
          </button>
        </p>
        <p className={styles.hint}>{copy.howToExplore}</p>
      </div>
    </section>
  );
}

export default Landing;
