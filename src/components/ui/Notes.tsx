import type { CSSProperties, ReactNode } from "react";
import { awards, copy, person, projects, roles, skills, type Stop } from "@/content/site";
import { pieceKinds, type PieceKind } from "@/lib/notes";

type Kind = PieceKind | "plank";
import CopyEmail from "./CopyEmail";
import styles from "./Notes.module.css";
import paper from "./paper.module.css";

/** First clause of a long sentence: the plank stays short, the full text lives in the CV and the no-JS view. */
export const cut = (s: string) => {
  const t = s.split(/\s\(|;|,? with /)[0]!.replace(/[.,]$/, "");
  return t.length > 44 ? t.split(/(?<=.{22})\s(?:across|through|into|and|from|that|for)\s/)[0]! : t;
};
const short = (s: string) => s.split(", ");

type Pt = [x: number, y: number];
/** The pier's string of lanterns, in art units from its spot (the post arm's end): it sags across the pier and out of frame. */
const END: Pt = [525, 72];
const MID = END[1] / 2 + 2 * 50; // the quadratic's control y: a 50-unit sag
const TWINE = `M0 0Q${END[0] / 2} ${MID} ${END[0]} ${END[1]}`;
/** Where each cord meets the twine (x), and how far it drops: two tiers, the low one below the high tags, so a tag never meets its neighbours'.
 * ponytail: x is fitted to 1024px, the narrowest desktop frame (clear of the sign, inside the frame's right edge). */
const LANTERNS = ([[41, 18], [95, 196], [185, 14], [275, 206], [329, 20]] as const).map(([x, drop]) => {
  const t = x / END[0];
  return [x, 2 * t * (1 - t) * MID + t * t * END[1], drop] as const;
});

const Facts = ({ facts }: { facts: [string, string][] }) => (
  <dl className={styles.facts}>
    {facts.map(([v, l]) => (
      <div key={l}>
        <dt>{l}</dt>
        <dd>{v}</dd>
      </div>
    ))}
  </dl>
);

const Chips = ({ items }: { items: string[] }) => (
  <ul className={styles.chips}>
    {items.map((c) => (
      <li key={c}>{c}</li>
    ))}
  </ul>
);

const Bullets = ({ items }: { items: string[] }) => (
  <ul className={styles.bullets}>
    {items.map((t) => (
      <li key={t}>{t}</li>
    ))}
  </ul>
);

const Title = ({ stop, children }: { stop: Stop; children?: ReactNode }) => (
  <h2 id={`note-${stop.id}-title`} className={styles.title}>
    {stop.tag.title}
    {children}
  </h2>
);

/** One piece's content. Every word comes from site.ts, trimmed; the CV and the stacked view hold the rest. */
function body(stop: Stop, kind: Kind, made: (n: number) => void, flow = false): ReactNode {
  const { card, tag } = stop;
  switch (kind) {
    case "lanterns":
      return (
        <>
          {flow ? (
            <Title stop={stop} />
          ) : (
            <svg className={styles.twine} viewBox={`0 0 ${END[0]} ${MID}`} aria-hidden="true" focusable="false">
              <path d={TWINE} />
              <circle r="4" />
            </svg>
          )}
          <ol className={styles.lanterns} aria-label={copy.made}>
            {projects.map((p) => {
              const [x, y, drop] = LANTERNS[p.i % LANTERNS.length]!;
              return (
                <li key={p.id} className={styles.lantern} style={{ "--lx": x, "--ly": y, "--drop": drop, "--li": p.i } as CSSProperties}>
                  <button type="button" className={styles.lanternBtn} onClick={() => made(p.i)}>
                    <span className={styles.lamp} aria-hidden="true">
                      <i className={styles.halo} />
                      <i className={styles.lit} />
                      <span className={styles.lNo}>{String(p.i + 1).padStart(2, "0")}</span>
                    </span>
                    <span className={styles.lTag}>
                      <span className={`${paper.sheet} ${paper.eyes}`} aria-hidden="true" />
                      <span className={styles.lName}>{p.tag.title}</span>
                      <span className={styles.lMore}>
                        <span className={paper.sheet} aria-hidden="true" />
                        <span className={styles.lHook}>{cut(p.tag.hook)}</span>
                        {p.tag.date && <span className={styles.lDate}>{p.tag.date}</span>}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </>
      );
    case "sign": {
      const line = card.layout === "timeline";
      return (
        <>
          <Title stop={stop} />
          {!line && tag.date && <p className={styles.meta}>{tag.date}</p>}
          <p className={styles.hook}>{tag.hook}</p>
          {!line && tag.facts && <Facts facts={tag.facts} />}
          {/* phones: the sign stands in for the role tags */}
          {flow && line && <Bullets items={roles.map((r) => `${r.role} · ${r.org}`)} />}
        </>
      );
    }
    case "plank":
      if (card.layout === "timeline")
        return (
          <>
            <Chips items={skills.slice(0, 2).flatMap((g) => g.items)} />
            <Bullets items={awards.map((a) => short(a)[0]!)} />
          </>
        );
      return (
        <>
          {card.summary && <p className={styles.summary}>{card.summary}</p>}
          <Bullets items={(card.highlights ?? []).slice(0, 3).map(cut)} />
        </>
      );
    case "crates":
      return (
        <ol className={styles.crates} aria-label="Pipeline steps">
          {(card.steps ?? []).slice(0, 3).map((s, n) => (
            <li key={s} className={styles.crate} style={{ "--ci": n } as CSSProperties}>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      );
    case "gauge":
      return (
        <div className={styles.gauge}>
          <div className={styles.arc} aria-hidden="true">
            <span className={styles.needle} />
            <span className={styles.hub} />
          </div>
          <ul className={styles.legend} aria-label="Asset health tiers">
            {(card.legend ?? []).map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      );
    case "medal": {
      const venue = short(card.awards![0]!)[1];
      return (
        <>
          <span className={styles.tie} style={{ "--tie-in": "-34px" } as CSSProperties} aria-hidden="true" />
          <svg className={styles.coin} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
            <circle cx="20" cy="20" r="18" className={styles.coinRim} />
            <path d="M20 8l3.4 7 7.6 1.1-5.5 5.4 1.3 7.6L20 25.4l-6.8 3.7 1.3-7.6L9 16.1 16.6 15z" />
          </svg>
          <div className={styles.caption}>
            <ul className={styles.bullets}>
              {card.awards!.map((a) => (
                <li key={a}>{short(a)[0]}</li>
              ))}
            </ul>
            {venue && <p className={styles.meta}>{venue}</p>}
          </div>
        </>
      );
    }
    case "stub": {
      const rows = (card.spec ?? []).slice(0, 3);
      return (
        <>
          <span className={styles.tie} aria-hidden="true" />
          <dl className={styles.stub}>
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </>
      );
    }
    case "led":
      return (
        <dl className={styles.led}>
          {(card.spec ?? []).slice(1, 4).map(([k, v], n) => (
            <div key={k} style={{ "--li": n } as CSSProperties}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      );
    case "windows":
      return (
        <ul className={styles.tags} aria-label="Roles">
          {roles.map((r, n) => (
            <li key={r.role} className={styles.tagLi} style={{ "--wi": n } as CSSProperties}>
              <span className={styles.string} aria-hidden="true" />
              <div className={styles.tag}>
                <span className={`${paper.sheet} ${paper.eyes}`} aria-hidden="true" />
                <span className={styles.wRole}>{r.role}</span>
                <span className={styles.wDates}>{r.dates}</span>
              </div>
            </li>
          ))}
        </ul>
      );
    case "letter":
      return (
        <>
          <span className={styles.stamp} aria-hidden="true">
            <svg viewBox="0 0 40 48" focusable="false">
              <path className={styles.stampSky} d="M0 0h40v48H0z" />
              <path className={styles.stampSun} d="M6 33a9 9 0 0 1 18 0z" />
              <path className={styles.stampTower} d="M24 40l2.5-24h5L34 40zM25.5 12h9v4h-9zM27 8l3-3 3 3z" />
              <path className={styles.stampSea} d="M0 38q5-3 10 0t10 0 10 0 10 0v10H0z" />
            </svg>
          </span>
          <p className={styles.postmark}>
            <span>{person.location.split(", ").slice(0, 2).join(" · ")}</span>
          </p>
          <p className={styles.kicker}>{stop.kicker}</p>
          <h2 id={`note-${stop.id}-title`} className={styles.letterHead}>
            {copy.contactHead.split("*").map((t, n) => (n % 2 ? <em key={n}>{t}</em> : t))}
          </h2>
          <p className={styles.lede}>{copy.contactLine}</p>
          <div className={styles.cta}>
            <a className={styles.send} href={`mailto:${person.email}`}>
              <Glyph d={ENVELOPE} />
              <span>{person.email}</span>
            </a>
          </div>
          <ul className={styles.elsewhere}>
            <li>
              <CopyEmail />
            </li>
            {person.linkedin && (
              <li>
                <a className={styles.ext} href={person.linkedin} target="_blank" rel="noopener noreferrer">
                  <Glyph d={LINKEDIN} fill />
                  LinkedIn
                </a>
              </li>
            )}
            <li>
              <a className={styles.ext} href={person.github} target="_blank" rel="noopener noreferrer">
                <Glyph d={GITHUB} fill />
                GitHub
              </a>
            </li>
          </ul>
          <p className={styles.sign}>
            <span aria-hidden="true">— </span>
            {copy.signoff}
          </p>
        </>
      );
  }
}

const ENVELOPE = "M3 6h18v12H3zM3 6l9 7 9-7";
const LINKEDIN =
  "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4V21H3zM9.5 9.75h3.8v1.6c.55-1 1.9-1.95 3.9-1.95 4 0 4.8 2.6 4.8 6V21h-4v-4.9c0-1.2 0-2.75-1.7-2.75s-1.95 1.3-1.95 2.65V21H9.5z";
const GITHUB =
  "M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.3 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2z";
const Glyph = ({ d, fill = false }: { d: string; fill?: boolean }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
    <path d={d} fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"} strokeWidth="1.8" strokeLinejoin="round" />
  </svg>
);

const noop = () => {};
/** Pieces that hang from a beam or rope by two cords. */
const HANGS = new Set<string>(["sign"]);
/** Pieces that are one sheet of paper on a wrapper; the rest (lanterns, tags, props) draw their own. */
const SHEET = new Set<string>(["letter"]);

function Mat({ cls, v, sheet, eyes, children }: { cls?: string; v: number; sheet: boolean; eyes?: boolean; children: ReactNode }) {
  return (
    <div className={cls ? `${styles.mat} ${cls}` : styles.mat} data-v={v % 3}>
      {sheet && <span className={eyes ? `${paper.sheet} ${paper.eyes}` : paper.sheet} aria-hidden="true" />}
      {children}
    </div>
  );
}

/**
 * A stop's diegetic pieces: signs, planks, crates and so on. Each sits at its stop's spot (art units, parent sets --k);
 * `flow`: phones stack them in a scrolling strip instead. Always mounted; `on` only drives CSS.
 */
export function Notes({
  stop,
  on,
  flow = false,
  made = noop,
}: {
  stop: Stop;
  on: boolean;
  flow?: boolean;
  /** A lantern was picked: dive to that project. */
  made?: (n: number) => void;
}) {
  return (
    <section
      className={`${flow ? styles.strip : styles.set} ${paper.skin}`}
      data-on={on}
      data-stop={stop.id}
      inert={!on}
      aria-labelledby={`note-${stop.id}-title`}
    >
      {/* the lighthouse's beam, laid across the letter (desktop: it needs the scene's lamp) */}
      {!flow && stop.card.layout === "letter" && <i className={styles.beam} aria-hidden="true" />}
      {pieceKinds(stop, flow).map((kind, n) => {
        const [x, y, r] = stop.spots[n] ?? [0, 0, 0];
        return (
          <div
            key={kind}
            className={styles.piece}
            data-kind={kind}
            data-note=""
            style={{ "--nx": x, "--ny": y, "--r": `${r}deg`, "--n": n } as CSSProperties}
          >
            {HANGS.has(kind) ? (
              <div className={styles.hang}>
                <Mat cls={styles.signMat} v={stop.i + n} sheet eyes>
                  {body(stop, kind, made, flow)}
                </Mat>
                {kind === "sign" && stop.card.layout !== "stalls" && !flow && (
                  <Mat cls={styles.plankMat} v={stop.i + n + 1} sheet eyes>
                    {body(stop, "plank", made)}
                  </Mat>
                )}
              </div>
            ) : (
              <Mat v={stop.i + n} sheet={SHEET.has(kind) || (flow && kind === "lanterns")}>
                {body(stop, kind, made, flow)}
              </Mat>
            )}
          </div>
        );
      })}
    </section>
  );
}

export default Notes;
