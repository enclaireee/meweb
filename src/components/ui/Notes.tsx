import { useEffect, type CSSProperties, type ReactNode } from "react";
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
/** The lighthouse pier's posts, art units from the boat: hero, contact, email, LinkedIn, GitHub. Mirrored in art/stops/stop-7.ts (PIER). */
const PIER = [272, 490, 632, 750, 868];
const POP = "pier-mail";
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
      // ponytail: scenery, not a list; a pulled lantern still dives to its project, the sign's button is the real way down
      return (
        <div aria-hidden="true">
          <svg className={styles.twine} viewBox={`0 0 ${END[0]} ${MID}`} focusable="false">
            <path d={TWINE} />
            <circle r="4" />
          </svg>
          {projects.map((p) => {
            const [x, y, drop] = LANTERNS[p.i % LANTERNS.length]!;
            return (
              <span key={p.id} className={styles.lantern} style={{ "--lx": x, "--ly": y, "--drop": drop, "--li": p.i } as CSSProperties}>
                <span className={styles.lanternBtn} onClick={() => made(p.i)}>
                  <span className={styles.lamp}>
                    <i className={styles.halo} />
                    <i className={styles.lit} />
                  </span>
                </span>
              </span>
            );
          })}
        </div>
      );
    case "sign": {
      const line = card.layout === "timeline";
      return (
        <>
          <Title stop={stop} />
          {!line && tag.date && <p className={styles.meta}>{tag.date}</p>}
          <p className={styles.hook}>{tag.hook}</p>
          {!line && tag.facts && <Facts facts={tag.facts} />}
          {card.layout === "stalls" && (
            <p>
              <button type="button" className={paper.btn} onClick={() => made(0)}>
                {copy.dive} <span aria-hidden="true">↓</span>
              </button>
            </p>
          )}
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
    case "pier": {
      // ponytail: boards sit on the art's posts by the same numbers (PIER); phones stack them instead (CSS)
      const at = (n: number, w: number) => ({ "--px": PIER[n], "--pw": w, "--pi": n }) as CSSProperties;
      const sheet = <span className={`${paper.sheet} ${paper.eyes}`} aria-hidden="true" />;
      return (
        <div className={styles.pier}>
          <div className={`${styles.post} ${styles.hero}`} style={at(0, 264)}>
            <div className={styles.board} data-v={0}>
              {sheet}
              <span className={styles.stamp} aria-hidden="true">
                <svg viewBox="0 0 40 48" focusable="false">
                  <path className={styles.stampSky} d="M0 0h40v48H0z" />
                  <path className={styles.stampSun} d="M6 33a9 9 0 0 1 18 0z" />
                  <path className={styles.stampTower} d="M24 40l2.5-24h5L34 40zM25.5 12h9v4h-9zM27 8l3-3 3 3z" />
                  <path className={styles.stampSea} d="M0 38q5-3 10 0t10 0 10 0 10 0v10H0z" />
                </svg>
              </span>
              <p className={styles.kicker}>{stop.kicker}</p>
              <h2 id={`note-${stop.id}-title`} className={styles.head}>
                {copy.contactHead.split("*").map((t, n) => (n % 2 ? <em key={n}>{t}</em> : t))}
              </h2>
              {flow && <p className={styles.lede}>{copy.contactLine}</p>}
            </div>
            <p className={styles.nameplate} data-v={2}>
              <span className={paper.sheet} aria-hidden="true" />
              <span aria-hidden="true">— </span>
              {copy.signoff}
            </p>
          </div>
          {!flow && (
            <div className={styles.post} style={at(1, 150)}>
              <div className={styles.board} data-v={1}>
                {sheet}
                <p className={styles.lede}>{copy.contactLine}</p>
              </div>
            </div>
          )}
          <div className={styles.post} style={at(2, 96)}>
            <button type="button" className={`${styles.board} ${styles.link} ${styles.mail}`} data-v={2} popoverTarget={POP}>
              {sheet}
              <Glyph d={ENVELOPE} />
              Email
            </button>
            <div id={POP} popover="auto" role="dialog" aria-label="Email" className={styles.pop}>
              <span className={paper.sheet} aria-hidden="true" />
              <a className={styles.send} href={`mailto:${person.email}`}>
                <Glyph d={ENVELOPE} />
                <span>{person.email}</span>
              </a>
              <CopyEmail />
            </div>
          </div>
          {person.linkedin && (
            <div className={styles.post} style={at(3, 96)}>
              <a className={`${styles.board} ${styles.link}`} data-v={0} href={person.linkedin} target="_blank" rel="noopener noreferrer">
                {sheet}
                <Glyph d={LINKEDIN} fill />
                LinkedIn
              </a>
            </div>
          )}
          <div className={styles.post} style={at(4, 96)}>
            <a className={`${styles.board} ${styles.link}`} data-v={1} href={person.github} target="_blank" rel="noopener noreferrer">
              {sheet}
              <Glyph d={GITHUB} fill />
              GitHub
            </a>
          </div>
        </div>
      );
    }
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
  // a popover lives in the top layer, past `inert`: close the email card when the boat leaves the pier
  const pier = stop.card.layout === "letter";
  useEffect(() => {
    if (pier && !on) document.getElementById(POP)?.hidePopover();
  }, [pier, on]);
  return (
    <section
      className={`${flow ? styles.strip : styles.set} ${paper.skin}`}
      data-on={on}
      data-stop={stop.id}
      inert={!on}
      aria-labelledby={`note-${stop.id}-title`}
    >
      {/* the lighthouse's beam, come to rest on the hero board (desktop: it needs the scene's lamp) */}
      {!flow && pier && <i className={styles.beam} aria-hidden="true" />}
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
              <Mat v={stop.i + n} sheet={false}>
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
