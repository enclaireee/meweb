import type { CSSProperties, ReactNode } from "react";
import { awards, copy, person, projects, roles, skills, type Stop } from "@/content/site";
import { pieceKinds, type PieceKind } from "@/lib/notes";

type Kind = PieceKind | "plank";
import CopyEmail from "./CopyEmail";
import CvButton from "./CvButton";
import styles from "./Notes.module.css";
import paper from "./paper.module.css";

/** First clause of a long sentence: the plank stays short, the full text lives in the CV and the no-JS view. */
export const cut = (s: string) => {
  const t = s.split(/\s\(|;|,? with /)[0]!.replace(/[.,]$/, "");
  return t.length > 44 ? t.split(/(?<=.{22})\s(?:across|through|into|and|from|that|for)\s/)[0]! : t;
};
const short = (s: string) => s.split(", ");

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
function body(stop: Stop, kind: Kind, made: (n: number) => void): ReactNode {
  const { card, tag } = stop;
  switch (kind) {
    case "tickets":
      return (
        <ol className={styles.tickets} aria-label={copy.levelsLabel}>
          {projects.map((p) => (
            <li key={p.id} className={styles.ticket} style={{ "--ti": p.i } as CSSProperties}>
              <button
                type="button"
                className={styles.ticketBtn}
                aria-label={`${p.tag.title}, ${copy.enterStall.charAt(0).toLowerCase()}${copy.enterStall.slice(1)}`}
                onClick={() => made(p.i)}
              >
                <span className={paper.sheet} aria-hidden="true" />
                <span className={styles.tNo} aria-hidden="true">
                  {String(p.i + 1).padStart(2, "0")}
                </span>
                <span className={styles.tMain}>
                  <span className={styles.tName}>{p.tag.title}</span>
                  <span className={styles.tHook}>{cut(p.tag.hook)}</span>
                  {p.tag.date && <span className={styles.tDate}>{p.tag.date}</span>}
                </span>
              </button>
            </li>
          ))}
        </ol>
      );
    case "sign": {
      const line = card.layout === "timeline";
      return (
        <>
          <Title stop={stop} />
          {!line && tag.date && <p className={styles.meta}>{tag.date}</p>}
          <p className={styles.hook}>{tag.hook}</p>
          {!line && tag.facts && <Facts facts={tag.facts} />}
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
    case "namecard":
      return (
        <>
          <p className={styles.bizName}>{person.name}</p>
          <p className={styles.meta}>{person.subtitle}</p>
          <Title stop={stop} />
          <p className={styles.hook}>{tag.hook}</p>
        </>
      );
    case "contact":
      return (
        <>
          <p className={styles.line}>
            <a className={styles.link} href={`mailto:${person.email}`}>
              {person.email}
            </a>
          </p>
          {person.linkedin && (
            <p className={styles.line}>
              <a className={styles.link} href={person.linkedin}>
                LinkedIn
              </a>
            </p>
          )}
          <p className={styles.line}>{person.location}</p>
          <p className={styles.actions}>
            <CopyEmail />
            <CvButton />
          </p>
        </>
      );
  }
}

const noop = () => {};
/** Pieces that hang from a beam or rope by two cords. */
const HANGS = new Set<string>(["sign", "namecard"]);
/** Pieces that are one sheet of paper on a wrapper; the rest (tickets, tags, props) draw their own. */
const SHEET = new Set<string>(["contact"]);

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
  /** A ticket was picked: walk to that project's stall. */
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
      {pieceKinds(stop).map((kind, n) => {
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
                  {body(stop, kind, made)}
                </Mat>
                {kind === "sign" && stop.card.layout !== "stalls" && (
                  <Mat cls={styles.plankMat} v={stop.i + n + 1} sheet eyes>
                    {body(stop, "plank", made)}
                  </Mat>
                )}
              </div>
            ) : (
              <Mat v={stop.i + n} sheet={SHEET.has(kind)}>
                {body(stop, kind, made)}
              </Mat>
            )}
          </div>
        );
      })}
    </section>
  );
}

export default Notes;
