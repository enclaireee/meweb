import type { ReactNode } from "react";
import styles from "./ScrapButton.module.css";

/** A torn paper scrap that lifts when picked up (design.md §6). Links only: that's all we need. */
export function ScrapButton({ href, children, external = false }: { href: string; children: ReactNode; external?: boolean }) {
  return (
    <a
      href={href}
      className={`cast ${styles.scrap}`}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
    >
      <span className={`${styles.face} paper grain`}>{children}</span>
    </a>
  );
}
