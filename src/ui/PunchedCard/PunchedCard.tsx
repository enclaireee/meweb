import type { Role } from "@/content/types";
import { formatDates } from "@/lib/dates";
import styles from "./PunchedCard.module.css";

/** One role, pinned to the corkboard through a punched hole (design.md §6). */
export function PunchedCard({ role, tilt }: { role: Role; tilt: number }) {
  return (
    <li className={`cast ${styles.card}`} style={{ rotate: `${tilt}deg` }}>
      <article className={`${styles.face} paper grain`} aria-labelledby={`role-${role.id}`}>
        <p className="text-caption text-ink-soft">
          <time dateTime={role.dates.start}>{formatDates(role.dates)}</time>
        </p>
        <h3 id={`role-${role.id}`} className="text-body font-medium mt-1 leading-snug">
          {role.title}
        </h3>
        <p className="text-caption italic">
          {role.org}
          {role.place ? `, ${role.place}` : ""}
        </p>
        <ul className={styles.lines}>
          {role.lines.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
      </article>
    </li>
  );
}
