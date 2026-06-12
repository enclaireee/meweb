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
 * Content softens gradually beneath it via a masked progressive blur — a
 * falloff, not a frosted slab. Routes crossfade via View Transitions.
 */
export function NavRail() {
  const pathname = usePathname();

  return (
    <>
      {/* progressive blur fields behind the rail (decorative, non-blocking) */}
      <div aria-hidden="true" className="blur-edge-b fixed inset-x-0 bottom-0 z-20 h-20 lg:hidden" />
      <div aria-hidden="true" className="blur-edge-l fixed bottom-0 left-0 top-0 z-20 hidden w-28 lg:block" />

      <nav
        aria-label="Pages"
        className="annot fixed inset-x-0 bottom-0 z-30 lg:inset-x-auto lg:left-3 lg:top-1/2 lg:w-auto lg:-translate-y-1/2"
      >
        <ul className="flex justify-between px-4 py-3 lg:flex-col lg:gap-2 lg:px-2.5 lg:py-0">
          {pages.map((p) => {
            const isActive =
              p.href === "/" ? pathname === "/" : pathname.startsWith(p.href);
            return (
              <li key={p.href}>
                <Link
                  href={p.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group flex items-center gap-2 py-1 transition-colors duration-300 ${
                    isActive ? "text-accent" : "text-muted hover:text-foreground"
                  }`}
                >
                  <span className="relative">
                    {p.index}
                    {/* active tick under the index */}
                    <span
                      className={`absolute -bottom-0.5 left-0 h-px bg-accent transition-all duration-300 ease-(--ease-out-expo) ${
                        isActive ? "w-full" : "w-0"
                      }`}
                    />
                  </span>
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
    </>
  );
}
