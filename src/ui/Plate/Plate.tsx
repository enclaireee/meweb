import type { Project } from "@/content/types";
import { formatDates } from "@/lib/dates";
import { stationNumber } from "@/sections/stations";
import { Ribbon } from "@/ui/Ribbon/Ribbon";
import { Flip } from "./Flip";
import styles from "./Plate.module.css";

/** A specimen plate per project (design.md §6, portfolio_concept.md §5). */
export function Plate({ index, project }: { index: number; project: Project }) {
  const headingId = `${project.slug}-title`;
  const award = project.awards?.[0];
  const links = Object.entries(project.links).filter(([, href]) => href);

  const front = (
    <>
      <p className="text-kicker uppercase text-ink-soft">Plate {stationNumber(index)}</p>
      {award && (
        <div className={styles.ribbon}>
          <Ribbon small label={`${award.title}, ${award.issuer} ${award.year}`} />
        </div>
      )}
      <h2 id={headingId} className="text-plate-title mt-2">
        {project.title}
      </h2>
      <p className="text-caption text-ink-soft mt-1">
        <time dateTime={project.dates.start}>{formatDates(project.dates)}</time>
      </p>
      <p className="text-caption italic mt-3">{project.caption}</p>
      <hr className="perforation my-5" />
      <dl className={styles.facts}>
        {project.facts.map((f) => (
          <div key={f.label} className={styles.fact}>
            <dt className="order-2 text-caption text-ink-soft">{f.label}</dt>
            <dd className="order-1 text-fact tabular-nums lining-nums">{f.value}</dd>
          </div>
        ))}
      </dl>
      <ul className={styles.stack} aria-label="Built with">
        {project.stack.map((s) => (
          <li key={s} className={`${styles.strip} text-kicker uppercase`}>
            {s}
          </li>
        ))}
      </ul>
    </>
  );

  const back = (
    <>
      <p className="text-kicker uppercase text-ink-soft">Plate {stationNumber(index)} · reverse</p>
      <p className="text-caption italic mt-2" aria-hidden>
        {project.title}
      </p>
      <ul className={styles.bullets}>
        {project.bullets.map((b) => (
          <li key={b} className="text-body">
            {b}
          </li>
        ))}
      </ul>
      {links.length > 0 && (
        <ul className={styles.links}>
          {links.map(([kind, href]) => (
            <li key={kind}>
              <a href={href} className="text-caption italic underline underline-offset-4" rel="noopener" target="_blank">
                {kind === "repo" ? "Source" : "Live site"}
              </a>
            </li>
          ))}
        </ul>
      )}
    </>
  );

  return (
    <article aria-labelledby={headingId} className={`cast ${styles.plate}`}>
      <Flip front={front} back={back} title={project.title} />
    </article>
  );
}
