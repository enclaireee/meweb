"use client";

import { useEffect, useState } from "react";

const sections = [
  { id: "top", index: "01", label: "intro" },
  { id: "about", index: "02", label: "theory" },
  { id: "work", index: "03", label: "work" },
  { id: "capabilities", index: "04", label: "toolkit" },
  { id: "experience", index: "05", label: "record" },
  { id: "contact", index: "06", label: "hello" },
];

/**
 * The navigation paradigm: a fixed index rail (a document's table of
 * contents) pinned to the left edge on desktop, a bottom strip on mobile.
 * Plain anchors — Lenis (anchors: true) smooth-scrolls them; native jump is
 * the no-JS / reduced-motion fallback. Active section tracked by observer.
 */
export function NavRail() {
  const [active, setActive] = useState("top");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Sections"
      className="annot fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/90 backdrop-blur-sm lg:inset-x-auto lg:left-0 lg:top-1/2 lg:w-auto lg:-translate-y-1/2 lg:border-0 lg:bg-transparent lg:backdrop-blur-none"
    >
      <ul className="flex justify-between px-4 py-3 lg:flex-col lg:gap-3 lg:px-3 lg:py-0">
        {sections.map((s) => {
          const isActive = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={isActive ? "true" : undefined}
                className={`group flex items-center gap-2 transition-colors duration-300 ${
                  isActive ? "text-signal" : "text-ink-soft hover:text-ink"
                }`}
              >
                <span>{s.index}</span>
                <span
                  className={`hidden overflow-hidden whitespace-nowrap transition-all duration-300 lg:inline-block ${
                    isActive ? "max-w-24" : "max-w-0 group-hover:max-w-24 group-focus-visible:max-w-24"
                  }`}
                >
                  — {s.label}
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
