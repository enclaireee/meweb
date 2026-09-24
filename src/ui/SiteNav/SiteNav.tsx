"use client";

import { useScene } from "@/scene/store";
import { Icon, type IconName } from "@/ui/Icon/Icon";
import styles from "./SiteNav.module.css";

/** The five things you might come for, each pointing at its room. `on` = the stations it covers. */
export const items: { label: string; href: string; on: number[]; icon: IconName }[] = [
  { label: "Who I am", href: "#about", on: [0], icon: "person" },
  { label: "Projects", href: "#demandx", on: [1, 2, 3, 4, 5], icon: "folder" },
  { label: "Experience", href: "#experience", on: [6], icon: "briefcase" },
  { label: "Skills", href: "#experience", on: [], icon: "wrench" },
  { label: "Contact", href: "#contact", on: [7], icon: "mail" },
];

/**
 * The navigation (decisions.md): five paper tokens threaded on a cord pinned at the left of the frame,
 * each with its icon cut through. The room you're in wears the accent washer and shows its label on a
 * slip; the others slip theirs out on hover or focus (the label is always the link's text, so screen
 * readers get it either way). Plain anchors: it works without JS.
 */
export function SiteNav() {
  const station = useScene((s) => s.station);
  return (
    <nav aria-label="Sections" className={styles.nav}>
      <span className={styles.cord} aria-hidden />
      <ol className={styles.list}>
        {items.map((it) => (
          <li key={it.label}>
            <a href={it.href} className={styles.link} aria-current={it.on.includes(station) ? "location" : undefined}>
              <span className={`cast ${styles.token}`}>
                <span className={`${styles.disc} paper grain`}>
                  <Icon name={it.icon} className={styles.icon} />
                </span>
              </span>
              <span className={`cast ${styles.slip}`}>
                <span className={`${styles.label} paper`}>{it.label}</span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
