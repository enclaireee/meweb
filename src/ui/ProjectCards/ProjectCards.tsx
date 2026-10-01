import type { CSSProperties } from "react";
import type { Project } from "@/content/types";
import { formatDates } from "@/lib/dates";
import { papers, rooms } from "@/design/tokens";
import { stationNumber, stations } from "@/sections/stations";
import { Ribbon } from "@/ui/Ribbon/Ribbon";
import { Icon, type IconName } from "@/ui/Icon/Icon";
import styles from "./ProjectCards.module.css";

/**
 * A project specimen plate (design.md §6):
 * A single, unified, uncluttered archival dossier docked in the right column.
 * Holds the title, key facts, three-beat narrative, and stack chips without scattering
 * or colliding on zoom.
 */
export function ProjectCards({ index, project }: { index: number; project: Project }) {
  const headingId = `${project.slug}-title`;
  const award = project.awards?.[0];
  const links = Object.entries(project.links).filter(([, href]) => href);
  const room = rooms[index]!;
  const tone = { "--tone": papers[room.wall], "--ink-tone": papers[room.ceiling] } as CSSProperties;

  const story: [string, string, string, IconName][] = [
    ["The problem", project.story.problem, project.brief.problem, "search"],
    ["What I built", project.story.built, project.brief.built, "hammer"],
    ["What it changed", project.story.result, project.brief.result, "trend"],
  ];

  return (
    <div className={styles.set} style={tone}>
      <div className={styles.dossierHang}>
        <span className={`${styles.string} ${styles.stringLeft}`} aria-hidden />
        <span className={`${styles.string} ${styles.stringRight}`} aria-hidden />
        <div className={styles.parallax}>
          <div className="cast">
            <article aria-labelledby={headingId} className={`${styles.plate} paper grain`}>
              <span className={styles.tab} aria-hidden />
              <span className={`${styles.pin} ${styles.pinL}`} aria-hidden />
              <span className={`${styles.pin} ${styles.pinR}`} aria-hidden />

              <header className={styles.header}>
                <div className={styles.metaRow}>
                  <p className="text-kicker uppercase text-ink-soft">
                    Plate {stationNumber(index)} · {stations[index]!.label}
                  </p>
                  <time dateTime={project.dates.start} className="text-caption text-ink-soft">
                    <Icon name="calendar" /> {formatDates(project.dates)}
                  </time>
                </div>

                {award && (
                  <div className={styles.ribbon}>
                    <Ribbon small label={`${award.title}, ${award.issuer} ${award.year}`} />
                  </div>
                )}

                <h2 id={headingId} className={styles.name}>
                  {project.title}
                </h2>
                <p className={styles.hook}>{project.caption}</p>
              </header>

              {/* Key numbers as a clean, compact metrics strip */}
              {project.facts.length > 0 && (
                <div className={styles.factsBar} aria-label="Key metrics">
                  {project.facts.slice(0, 3).map((f) => (
                    <div key={f.label} className={styles.factItem}>
                      <span className={styles.factValue}>{f.value}</span>
                      <span className={styles.factLabel}>{f.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* The Narrative: 3 clean, concise beats */}
              <div className={styles.storySection}>
                {story.map(([heading, text, brief, icon]) => (
                  <div key={heading} className={styles.beatItem}>
                    <h3 className={`${styles.beatHead} text-kicker uppercase`}>
                      <Icon name={icon} badge />
                      {heading}
                    </h3>
                    <p className={styles.beatText}>
                      <span className="long">{text}</span>
                      <span className="brief">{brief}</span>
                    </p>
                  </div>
                ))}
              </div>

              {/* Tech Stack Chips & Links */}
              <div className={styles.footerSection}>
                <div className={styles.stackRow}>
                  <span className="text-kicker uppercase text-ink-soft">Built with:</span>
                  <ul className={styles.stack} aria-label="Built with">
                    {project.stack.map((s) => (
                      <li key={s} className={`${styles.chip} text-kicker uppercase`}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>

                {links.length > 0 && (
                  <ul className={styles.links}>
                    {links.map(([kind, href]) => (
                      <li key={kind}>
                        <a href={href} className={styles.linkButton} rel="noopener" target="_blank">
                          <Icon name={kind === "repo" ? "code" : "globe"} />
                          <span>{kind === "repo" ? "Source" : "Live site"}</span>
                          <span className={styles.linkArrow} aria-hidden>
                            ↗
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
}
