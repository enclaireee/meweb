import { awards, education, person, projects, roles, skills, type Stop } from "@/content/site";
import CopyEmail from "./CopyEmail";
import CvButton from "./CvButton";
import ImageSlot from "./ImageSlot";
import styles from "./CardBody.module.css";

type Props = { stop: Stop; headingId: string; stacked?: boolean };
type Card = Stop["card"];

function Chips({ items, cls = styles.chips }: { items: string[]; cls?: string | undefined }) {
  return (
    <ul className={cls}>
      {items.map((c) => (
        <li key={c}>{c}</li>
      ))}
    </ul>
  );
}

function List({ items, cls = styles.bullets }: { items: string[]; cls?: string | undefined }) {
  return (
    <ul className={cls}>
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

function Facts({ stop }: { stop: Stop }) {
  if (!stop.tag.facts) return null;
  return (
    <dl className={styles.facts}>
      {stop.tag.facts.map(([v, l]) => (
        <div key={l}>
          <dt>{l}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Head({ stop, headingId, hero }: { stop: Stop; headingId: string; hero?: boolean }) {
  const { card, kicker } = stop;
  return (
    <header className={styles.head}>
      <p className={styles.kicker}>{kicker}</p>
      <h2 id={headingId} className={hero ? styles.hero : styles.title}>
        {card.title}
      </h2>
      {card.date && <p className={styles.date}>{card.date}</p>}
      {card.subtitle && <p className={styles.subtitle}>{card.subtitle}</p>}
    </header>
  );
}

/** Pairs step labels with highlight sentences (pipeline steps, poster findings). */
function Steps({ card, cls }: { card: Card; cls: string | undefined }) {
  const steps = card.steps ?? [];
  return (
    <ol className={cls}>
      {(card.highlights ?? []).map((h, i) => (
        <li key={h}>
          <span className={styles.stepNo} aria-hidden="true">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span>
            {steps[i] && <strong className={styles.stepLabel}>{steps[i]}</strong>}
            {h}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Email({ stacked }: { stacked: boolean }) {
  return stacked ? (
    <>
      <span>{person.email}</span>
      {/* Link only without JS: the sr-only copy must hold no focusable elements. */}
      <noscript>
        {" "}
        <a href={`mailto:${person.email}`}>Email me</a>
      </noscript>
    </>
  ) : (
    <>
      <a href={`mailto:${person.email}`}>{person.email}</a>
      <CopyEmail />
    </>
  );
}

const Wave = () => (
  <svg className={styles.wave} viewBox="0 0 320 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <path d="M0 20h40l6-12 6 26 6-30 6 22 6-8 6 4h30l4-6 4 10 4-14 4 18 4-8h40l5-10 5 18 5-22 5 26 5-14 5 2h28l3-4 3 8 3-6h47" />
  </svg>
);

const Sun = () => (
  <svg className={styles.sun} viewBox="0 0 120 70" aria-hidden="true" focusable="false">
    <path className={styles.sunArc} d="M10 64a50 50 0 0 1 100 0" />
    <path className={styles.sunFill} d="M10 64a50 50 0 0 1 86-35" />
    <circle className={styles.sunDot} cx="96" cy="29" r="6" />
    <path className={styles.sunTicks} d="M10 64h8M102 64h8M60 14v8M25 29l6 5M95 29l-6 5" />
  </svg>
);

/** Card content shared by the dialog and the stacked no-JS view. One look per stop (`card.layout`). */
export function CardBody({ stop, headingId, stacked = false }: Props) {
  const { card } = stop;
  const chips = card.chips && <Chips items={card.chips} />;
  const image = card.image && <ImageSlot image={card.image} />;
  const summary = card.summary && <p className={styles.summary}>{card.summary}</p>;

  switch (card.layout) {
    case "cv":
      return (
        <div className={styles.body} data-layout="cv">
          <Head stop={stop} headingId={headingId} hero />
          <p className={styles.contactLine}>{person.email}</p>
          {summary}
          <Facts stop={stop} />
          <section className={styles.edu}>
            <h3 className={styles.h3}>Education</h3>
            <p className={styles.eduLine}>
              <strong>{education.degree}</strong>
              <span>
                {education.school} · {education.dates} · {education.note}
              </span>
            </p>
            <Chips items={education.coursework} />
          </section>
        </div>
      );

    case "stalls":
      return (
        <div className={styles.body} data-layout="stalls">
          <Head stop={stop} headingId={headingId} />
          {summary}
          <ol className={styles.stalls}>
            {projects.map((p) => (
              <li key={p.id}>
                <strong>{p.tag.title}</strong>
                <span>{p.tag.hook}</span>
              </li>
            ))}
          </ol>
        </div>
      );

    case "pipeline":
      return (
        <div className={styles.body} data-layout="pipeline">
          <Head stop={stop} headingId={headingId} />
          {summary}
          <Steps card={card} cls={styles.pipe} />
          {card.spec && (
            <dl className={styles.versus}>
              {card.spec.map(([k, v], i) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                  {i === 0 && (
                    <span className={styles.vs} aria-hidden="true">
                      vs
                    </span>
                  )}
                </div>
              ))}
            </dl>
          )}
          <Facts stop={stop} />
          {chips}
          {image}
        </div>
      );

    case "spec":
      return (
        <div className={styles.body} data-layout="spec">
          <Head stop={stop} headingId={headingId} />
          {summary}
          {card.spec && (
            <dl className={styles.assets}>
              {card.spec.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
          {card.legend && (
            <ul className={styles.legend} aria-label="Asset health tiers">
              {card.legend.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          )}
          <List items={card.highlights ?? []} cls={styles.rows} />
          {chips}
          {image}
        </div>
      );

    case "poster":
      return (
        <div className={styles.body} data-layout="poster">
          <Head stop={stop} headingId={headingId} />
          {card.awards && (
            <div className={styles.rosette}>
              <svg className={styles.medal} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
                <path d="M20 4l4.7 9.6 10.6 1.5-7.7 7.5 1.8 10.5L20 28.1l-9.4 5 1.8-10.5-7.7-7.5 10.6-1.5z" />
              </svg>
              <List items={card.awards} cls={styles.ribbons} />
            </div>
          )}
          {summary}
          <Wave />
          <Steps card={card} cls={styles.findings} />
          <Facts stop={stop} />
          {chips}
          {image}
        </div>
      );

    case "ticket":
      return (
        <div className={styles.body} data-layout="ticket">
          <div className={styles.ticketMain}>
            <Head stop={stop} headingId={headingId} />
            {summary}
            <List items={card.highlights ?? []} />
            {card.chips && <Chips items={card.chips} cls={styles.barcode} />}
          </div>
          {card.spec && (
            <dl className={styles.stub}>
              {card.spec.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      );

    case "datasheet":
      return (
        <div className={styles.body} data-layout="datasheet">
          <Head stop={stop} headingId={headingId} />
          <div className={styles.dsTop}>
            {summary}
            <Sun />
          </div>
          {card.spec && (
            <table className={styles.parts}>
              <caption>Bill of parts</caption>
              <tbody>
                {card.spec.map(([k, v]) => (
                  <tr key={k}>
                    <th scope="row">{k}</th>
                    <td>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <section>
            <h3 className={styles.h4}>Build notes</h3>
            <List items={card.highlights ?? []} cls={styles.notes} />
          </section>
          {chips}
          {image}
        </div>
      );

    case "timeline":
      return (
        <div className={styles.body} data-layout="timeline">
          <Head stop={stop} headingId={headingId} />
          <Facts stop={stop} />
          <div className={styles.tlGrid}>
            <ol className={styles.timeline}>
              {roles.map((r) => (
                <li key={r.role}>
                  <p className={styles.roleHead}>
                    <span className={styles.roleName}>{r.role}</span>
                    <span className={styles.roleMeta}>{r.org}</span>
                    <span className={styles.roleDate}>{r.dates}</span>
                  </p>
                  <List items={r.points} cls={styles.open} />
                </li>
              ))}
            </ol>
            <div className={styles.side}>
              <section>
                <h3 className={styles.h3}>Skills</h3>
                {skills.map((g) => (
                  <div key={g.group}>
                    <h4 className={styles.h4}>{g.group}</h4>
                    <Chips items={g.items} />
                  </div>
                ))}
              </section>
              <section>
                <h3 className={styles.h3}>Awards</h3>
                <List items={awards} cls={styles.awardList} />
              </section>
            </div>
          </div>
        </div>
      );

    case "letter":
      return (
        <div className={styles.body} data-layout="letter">
          <div className={styles.bizcard}>
            <p className={styles.bizName}>{person.name}</p>
            <p className={styles.bizRole}>{person.subtitle}</p>
          </div>
          <Head stop={stop} headingId={headingId} />
          {summary}
          <dl className={styles.contact}>
            <dt>Email</dt>
            <dd>
              <Email stacked={stacked} />
            </dd>
            {person.linkedin && (
              <>
                <dt>LinkedIn</dt>
                <dd>{stacked ? <span>{person.linkedin}</span> : <a href={person.linkedin}>LinkedIn</a>}</dd>
              </>
            )}
            <dt>GitHub</dt>
            <dd>{stacked ? <span>{person.github}</span> : <a href={person.github}>GitHub</a>}</dd>
            <dt>Location</dt>
            <dd>{person.location}</dd>
          </dl>
          {!stacked && <CvButton />}
        </div>
      );
  }
}

export default CardBody;
