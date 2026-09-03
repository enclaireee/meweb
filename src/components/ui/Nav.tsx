"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { site } from "@content/meta/site";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/**
 * Sticky, with scroll-spy. Anchors are rooted at "/" so they also work from a
 * case-study page, where no sections exist and nothing is ever marked active.
 *
 * Opaque ground, not a blur: frosted glass is one of the named
 * AI-generated-design tells, and this design's whole depth model is opaque
 * planes lit from above.
 */
export function Nav() {
  const [active, setActive] = useState<string | null>(null);
  const visible = useRef(new Set<string>());

  useEffect(() => {
    const els = site.sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.current.add(e.target.id);
          else visible.current.delete(e.target.id);
        }
        // Document order, not observer order: whichever tracked section is
        // highest on the page wins, so scrolling up and down agree.
        const first = site.sections.find((s) => visible.current.has(s.id));
        setActive(first?.id ?? null);
      },
      // A band across the middle of the viewport. A section counts as "here"
      // when it crosses the reader's eyeline, not when its edge appears.
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-edge-dark bg-base">
      <div className="mx-auto flex max-w-page items-baseline justify-between gap-4 px-gutter pt-7 pb-8 sm:gap-6 sm:pt-9">
        {/* Hidden below 380px: at 320 the wordmark plus four anchors plus the
            toggle measured 299px of content in a 320px viewport and pushed the
            document to 399px wide. The greeting states the name in the first
            screen anyway, so this is the redundant element. */}
        <Link
          href="/"
          className="hidden text-small font-medium tracking-tight min-[380px]:block"
        >
          {site.wordmark}
        </Link>
        <nav className="ml-auto flex items-baseline gap-4 sm:gap-6">
          {site.sections.map((s) => (
            <Link
              key={s.id}
              href={`/#${s.id}`}
              aria-current={active === s.id ? "location" : undefined}
              className={`text-small transition-colors duration-(--dur-micro) hover:text-ink ${
                active === s.id ? "text-ink" : "text-muted"
              }`}
            >
              {s.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
