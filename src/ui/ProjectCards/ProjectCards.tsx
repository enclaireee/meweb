import type { CSSProperties } from "react";
import type { Project } from "@/content/types";
import { formatDates } from "@/lib/dates";
import { papers, rooms } from "@/design/tokens";
import { stationNumber, stations } from "@/sections/stations";
import { Hang, type Slot } from "@/ui/Hang/Hang";
import { Ribbon } from "@/ui/Ribbon/Ribbon";
import { Icon, type IconName } from "@/ui/Icon/Icon";
import styles from "./ProjectCards.module.css";

const statSlots: Slot[] = ["t1", "t2", "t3"];

/**
 * A project as a set of small papers hung around the room (decisions.md): a title tag, three numbers
 * hanging from the ceiling, the story in three cards, and the stack along the floor. None of them is
 * big enough to cover the room.
 */
export function ProjectCards({ index, project }: { index: number; project: Project }) {
  const headingId = `${project.slug}-title`;
  const award = project.awards?.[0];
  const links = Object.entries(project.links).filter(([, href]) => href);
  const room = rooms[index]!;
  const tone = { "--tone": papers[room.wall], "--ink-tone": papers[room.ceiling] } as CSSProperties;
  const story: [Slot, string, string, IconName][] = [
    ["ml", "The problem", project.story.problem, "search"],
    ["mr", "What I built", project.story.built, "hammer"],
    ["bc", "What it changed", project.story.result, "trend"],
  ];

  return (
    <div className={styles.set} style={tone}>
      <Hang slot="tr" i={0} depth={1.3} tilt={-1.2} as="header" className={styles.title}>
        <span className={styles.tab} aria-hidden />
        <div className={styles.meta}>
          <p className="text-kicker uppercase text-ink-soft">
            Plate {stationNumber(index)} · {stations[index]!.label}
          </p>
          <time dateTime={project.dates.start} className="text-caption text-ink-soft">
            <Icon name="calendar" />{" "}
            {formatDates(project.dates)}
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
      </Hang>

      {project.facts.slice(0, 3).map((f, k) => (
        <Hang key={f.label} slot={statSlots[k]!} i={1 + k} depth={0.6 + k * 0.15} tilt={[2, -2.5, 1.5][k]!} className={styles.stat}>
          <span className={styles.value}>{f.value}</span>
          <span className={styles.label}>{f.label}</span>
        </Hang>
      ))}

      {story.map(([slot, heading, text, icon], k) => (
        <Hang key={heading} slot={slot} i={4 + k} depth={1 + k * 0.2} tilt={[1.4, -1, 0.8][k]!} className={styles.beat}>
          <h3 className={`${styles.beatHead} text-kicker uppercase`}>
            <Icon name={icon} badge />
            {heading}
          </h3>
          <p className={styles.beatText}>{text}</p>
        </Hang>
      ))}

      <Hang slot="br" i={7} depth={1.5} tilt={-0.8} className={styles.stackCard}>
        <p className="text-kicker uppercase text-ink-soft">
          <Icon name="layers" /> Built with
        </p>
        <ul className={styles.stack}>
          {project.stack.map((s) => (
            <li key={s} className={`${styles.chip} text-kicker uppercase`}>
              {s}
            </li>
          ))}
        </ul>
        {links.length > 0 && (
          <ul className={styles.links}>
            {links.map(([kind, href]) => (
              <li key={kind}>
                <a href={href} className="text-caption italic underline underline-offset-4" rel="noopener" target="_blank">
                  <Icon name={kind === "repo" ? "code" : "globe"} /> {kind === "repo" ? "Source" : "Live site"}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Hang>
    </div>
  );
}
