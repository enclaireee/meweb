import type { ReactNode } from "react";

/** A torn paper scrap that lifts when picked up (design.md §6; styles in globals.css). Links only. */
export function ScrapButton({ href, children, external = false }: { href: string; children: ReactNode; external?: boolean }) {
  return (
    <a href={href} className="cast scrap" {...(external ? { target: "_blank", rel: "noopener" } : {})}>
      <span className="scrap-face paper grain">{children}</span>
    </a>
  );
}
