import { experience } from "@/content/experience";
import { skills } from "@/content/skills";
import { awards } from "@/content/awards";
import { seeded } from "@/lib/rng";
import { StationShell } from "@/ui/StationShell/StationShell";
import { PunchedCard } from "@/ui/PunchedCard/PunchedCard";
import { PegTag } from "@/ui/PegTag/PegTag";
import { Ribbon } from "@/ui/Ribbon/Ribbon";
import styles from "./Section.module.css";

/** Hand-placed: every card and tag sits a little off-true, the same way every build (architecture.md §7.1 #8). */
const tilt = (id: string, max: number) => (seeded(id)() * 2 - 1) * max;

export default function Section() {
  return (
    <StationShell index={6} labelledBy="wall-title" flow>
      <div className={`cast ${styles.board}`}>
        <div className={`${styles.header} paper grain`}>
          <p className="text-kicker uppercase text-ink-soft">Plate 06 · The Wall</p>
          <h2 id="wall-title" className="text-plate-title mt-2">
            Logbook, tools and ribbons
          </h2>
          <p className="text-caption italic mt-2">Everything else that was cut here, pinned where it can be seen.</p>
        </div>
      </div>

      <section aria-labelledby="corkboard-title" className={styles.group}>
        <h3 id="corkboard-title" className={`${styles.label} text-kicker uppercase`}>
          Corkboard · experience
        </h3>
        <ol className={styles.cards}>
          {experience.map((r) => (
            <PunchedCard key={r.id} role={r} tilt={tilt(r.id, 1.2)} />
          ))}
        </ol>
      </section>

      <section aria-labelledby="pegboard-title" className={styles.group}>
        <h3 id="pegboard-title" className={`${styles.label} text-kicker uppercase`}>
          Pegboard · tools
        </h3>
        <div className={styles.pegboard}>
          {skills.map((g) => (
            <div key={g.label} className={styles.row}>
              <h4 className="text-caption italic">{g.label}</h4>
              <ul className={styles.pegs}>
                {g.items.map((s) => (
                  <PegTag key={s} tilt={tilt(s, 3)}>
                    {s}
                  </PegTag>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="ribbons-title" className={styles.group}>
        <h3 id="ribbons-title" className={`${styles.label} text-kicker uppercase`}>
          Ribbons · awards
        </h3>
        <ul className={styles.ribbons}>
          {awards.map((a) => (
            <li key={a.title} className={`cast ${styles.award}`}>
              <div className={`${styles.awardFace} paper grain`}>
                <Ribbon label={a.title} />
                <div>
                  <p className="text-body leading-snug">{a.title}</p>
                  <p className="text-caption italic text-ink-soft">
                    {a.issuer}, {a.year}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </StationShell>
  );
}
