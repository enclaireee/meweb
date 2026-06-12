"use client";

import { usePathname } from "next/navigation";
import { Link } from "next-view-transitions";

const pages = [
  { href: "/", index: "01", label: "index" },
  { href: "/work", index: "02", label: "work" },
  { href: "/about", index: "03", label: "about" },
  { href: "/contact", index: "04", label: "contact" },
];

/**
 * The navigation paradigm: a fixed index rail (a document's table of
 * contents) pinned to the left edge on desktop, a bottom strip on mobile.
 * Routes crossfade via View Transitions; links are prefetched by Next.
 */
export function NavRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Pages"
      className="annot fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/90 backdrop-blur-sm lg:inset-x-auto lg:left-0 lg:top-1/2 lg:w-auto lg:-translate-y-1/2 lg:border-0 lg:bg-transparent lg:backdrop-blur-none"
    >
      <ul className="flex justify-between px-4 py-3 lg:flex-col lg:gap-3 lg:px-3 lg:py-0">
        {pages.map((p) => {
          const isActive =
            p.href === "/" ? pathname === "/" : pathname.startsWith(p.href);
          return (
            <li key={p.href}>
              <Link
                href={p.href}
                aria-current={isActive ? "page" : undefined}
                className={`group flex items-center gap-2 transition-colors duration-300 ${
                  isActive ? "text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                <span>{p.index}</span>
                <span
                  className={`hidden overflow-hidden whitespace-nowrap transition-all duration-300 lg:inline-block ${
                    isActive
                      ? "max-w-24"
                      : "max-w-0 group-hover:max-w-24 group-focus-visible:max-w-24"
                  }`}
                >
                  — {p.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
