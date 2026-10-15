import type { CSSProperties, ReactNode } from "react";
import { awards, copy, person, projects, roles, stops } from "@/content/site";
import CopyEmail from "./CopyEmail";
import styles from "./Landing.module.css";
import paper from "./paper.module.css";

/*
 * The Spring: a paper-cut name over the water and a line of cards on twine, tied from the left bamboo to the tag
 * post's crossbeam and on to the right bamboo (art units, x from the boat, as Notes' spots). The intro is CSS keyed
 * on data-on: the name's letters drop and split into layers, the cards swing in, then the lanterns light in order.
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
// Lanterns sit between the cards; they light left to right.
const LAMPS: Pt[] = [at(0, 0.06), at(0, 0.36), at(0, 0.66), at(0, 0.95), at(1, 0.07), at(1, 0.5), at(1, 0.95)];

const hook = stops[0]!.tag.hook.replace(/\.$/, "");
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);
const NAME = person.shortName.split("");

type Card = { id: string; at: Pt; drop: number; cut: string; body: ReactNode };

export function Landing({ on, flow = false, go }: { on: boolean; flow?: boolean; go: (n: number) => void }) {
  const now = roles[0]!;
  const cards: Card[] = [
    {
      id: "now",
      at: at(0, 0.2),
      drop: 14,
      cut: styles.page!,
      body: (
        <>
          <p className={styles.k}>Now</p>
          <p className={styles.t}>{now.role}</p>
          <p className={styles.m}>{now.org}</p>
        </>
      ),
    },
    {
      id: "made",
      at: at(0, 0.5),
      drop: 6,
      cut: styles.stub!,
      body: (
        <button type="button" className={styles.go} onClick={() => go(1)} aria-label={`${projects.length} projects, go to ${copy.made.toLowerCase()}`}>
          <span className={styles.k}>Made</span>
          <span className={styles.n}>{projects.length}</span>
          <span className={styles.m}>projects</span>
        </button>
      ),
    },
    {
      id: "roles",
      at: at(0, 0.8),
      drop: 22,
      cut: styles.tag!,
      body: (
        <button type="button" className={styles.go} onClick={() => go(2)} aria-label={`${roles.length} roles, go to ${stops[2]!.tag.title.toLowerCase()}`}>
          <span className={styles.k}>Roles</span>
          <span className={styles.n}>{roles.length}</span>
          <span className={styles.m}>teams and posts</span>
        </button>
      ),
    },
    {
      id: "awards",
      at: at(1, 0.2),
      drop: 10,
      cut: styles.ribbon!,
      body: (
        <>
          <p className={styles.k}>Awards</p>
          <p className={styles.n}>{awards.length}</p>
          <p className={styles.m}>{awards[0]!.replace(/ \(.*?\)/, "").split(", ").slice(0, 2).join(", ")}</p>
        </>
      ),
    },
    {
      id: "reach",
      at: at(1, 0.8),
      drop: 18,
      cut: styles.post!,
      body: (
        <>
          <p className={styles.k}>Reach me</p>
          <a className={styles.mail} href={`mailto:${person.email}`}>
            {person.email}
          </a>
          <p className={styles.acts}>
            <CopyEmail />
            {person.linkedin && (
              <a className={styles.mail} href={person.linkedin}>
                LinkedIn
              </a>
            )}
          </p>
        </>
      ),
    },
  ];

  return (
    <section
      className={`${flow ? styles.flow : styles.set} ${paper.skin}`}
      data-on={on}
      data-stop="stop-0"
      inert={!on}
      aria-labelledby="landing-name"
    >
      <div className={styles.name}>
        <h2 id="landing-name" className={styles.word} aria-label={person.shortName}>
          {NAME.map((c, i) => (
            <span key={i} className={styles.ch} style={{ "--i": i } as CSSProperties} aria-hidden="true">
              <span className={styles.lyr} data-l="0">{c}</span>
              <span className={styles.lyr} data-l="1">{c}</span>
              <span className={styles.lyr} data-l="2">{c}</span>
            </span>
          ))}
        </h2>
        <p className={styles.sub}>
          {person.name} · {lower(hook)}
        </p>
      </div>

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

      <ul className={styles.cards}>
        {cards.map((c, i) => (
          <li
            key={c.id}
            className={styles.card}
            data-card={c.id}
            data-note=""
            style={{ "--cx": c.at[0], "--cy": c.at[1], "--drop": c.drop, "--ci": i, "--sw": i % 2 ? -1 : 1 } as CSSProperties}
          >
            <div className={styles.swing}>
              <div className={styles.follow}>
                <span className={styles.cord} aria-hidden="true" />
                <div className={`${styles.mat} ${c.cut}`} data-v={i % 3}>
                  <span className={paper.sheet} aria-hidden="true" />
                  {c.body}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Landing;
