import type { CSSProperties } from "react";
import { experience } from "@/content/experience";
import { skills } from "@/content/skills";
import { awards } from "@/content/awards";
import { formatDates } from "@/lib/dates";
import { papers, rooms } from "@/design/tokens";
import { StationShell } from "@/ui/StationShell/StationShell";
import { Board, BoardRow, boardItem } from "@/ui/Board/Board";
import { Icon, type IconName } from "@/ui/Icon/Icon";
import { Ribbon } from "@/ui/Ribbon/Ribbon";
import styles from "./Section.module.css";

const skillIcons: IconName[] = ["code", "layers", "chart"];

/**
 * The Wall: two slim, even boards, one down each side, so the room stays in view between them.
 * Experience on the left, one line a role (tap for the story); skills and ribbons on the right.
 */
export default function Section() {
  let n = 0;
  // every piece is also a card on the phone clothesline, lowered in turn
  const item = (extra = "", tag = false) => ({
    className: `${boardItem} ${extra}`,
    style: { "--n": n++ } as CSSProperties,
    ...(tag ? { "data-tag": "" } : {}),
  });
  const tone = { "--tone": papers[rooms[6]!.wall], "--ink-tone": papers[rooms[6]!.ceiling] } as CSSProperties;

  return (
    <StationShell index={6} labelledBy="wall-title">
      <div style={tone} className={styles.set}>
        <BoardRow>
          <Board i={0} flat>
            <header {...item(styles.head)}>
              <p className="text-kicker uppercase text-ink-soft">Plate 06 · The Wall</p>
              <h2 id="wall-title" className={styles.title}>
                Experience and skills
              </h2>
            </header>
            <section aria-labelledby="experience-title" className={styles.part}>
              <h3 id="experience-title" {...item(styles.label, true)}>
                <Icon name="briefcase" badge className={styles.badge} />
                Experience
              </h3>
              <ol className={`${styles.list} ${styles.part}`}>
                {experience.map((r) => (
                  <li key={r.id} {...item(styles.role)}>
                    <details name="roles" className={styles.details}>
                      <summary className={styles.summaryRow}>
                        <Icon name={r.kind === "work" ? "briefcase" : "flag"} className={styles.kind} />
                        <span className={styles.roleText}>
                          <span id={`role-${r.id}`} className={styles.roleTitle}>
                            {r.title}
                          </span>
                          <span className={styles.org}>
                            {r.org} · <time dateTime={r.dates.start}>{formatDates(r.dates)}</time>
                          </span>
                        </span>
                        <span className={styles.plus} aria-hidden />
                      </summary>
                      <p className={styles.summary}>{r.summary}</p>
                    </details>
                  </li>
                ))}
              </ol>
            </section>
          </Board>

          <Board i={1} flat>
            <section id="skills" aria-labelledby="skills-title" className={styles.part}>
              <h3 id="skills-title" {...item(styles.label, true)}>
                <Icon name="wrench" badge className={styles.badge} />
                Skills
              </h3>
              {skills.map((g, k) => (
                <div key={g.label} {...item(styles.group)}>
                  <h4 className={styles.groupTitle}>
                    <Icon name={skillIcons[k] ?? "chip"} /> {g.label}
                  </h4>
                  <ul className={styles.chips}>
                    {g.items.map((s) => (
                      <li key={s} className={`${styles.chip} text-kicker uppercase`}>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </section>
            <section aria-labelledby="awards-title" className={`${styles.part} ${styles.ribbons}`}>
              <h3 id="awards-title" {...item(styles.label, true)}>
                <span aria-hidden className={styles.rosette}>
                  <Ribbon small label="Ribbons" />
                </span>
                Ribbons
              </h3>
              <ul className={`${styles.list} ${styles.part}`}>
                {awards.map((a) => (
                  <li key={a.title} {...item(styles.award)}>
                    <p className={styles.awardTitle}>{a.title}</p>
                    <p className={styles.org}>
                      {a.issuer}, {a.year}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </Board>
        </BoardRow>
      </div>
    </StationShell>
  );
}
