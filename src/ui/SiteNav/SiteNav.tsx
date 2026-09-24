"use client";

import { useScene } from "@/scene/store";
import { Icon, type IconName } from "@/ui/Icon/Icon";
import styles from "./SiteNav.module.css";

/** The five things you might come for, each pointing at its room. `on` = the stations it covers. */
const items: { label: string; href: string; on: number[]; icon: IconName }[] = [
  { label: "Who I am", href: "#about", on: [0], icon: "person" },
  { label: "Projects", href: "#demandx", on: [1, 2, 3, 4, 5], icon: "folder" },
  { label: "Experience", href: "#experience", on: [6], icon: "briefcase" },
  { label: "Skills", href: "#experience", on: [], icon: "wrench" },
  { label: "Contact", href: "#contact", on: [7], icon: "mail" },
];

/**
 * The navigation (decisions.md): a compact paper strip at the left middle of the frame. Plain anchors
 * (works without JS); the room you're in gets the punched washer.
 */
export function SiteNav() {
  const station = useScene((s) => s.station);
  return (
    <nav aria-label="Sections" className={`cast ${styles.nav}`}>
      <div className={`${styles.strip} paper grain`}>
        <p className={styles.who}>
          Fatih <span className="text-ink-soft">Zamzami</span>
        </p>
        <ol className={styles.list}>
          {items.map((it) => {
            const here = it.on.includes(station);
            return (
              <li key={it.label}>
                <a href={it.href} className={styles.link} aria-current={here ? "location" : undefined}>
                  <span className={styles.punch} aria-hidden />
                  <Icon name={it.icon} className={styles.icon} />
                  {it.label}
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
