"use client";

import { useRef } from "react";
import { experience } from "@/content";
import { gsap, useGSAP } from "@/lib/gsap";
import { Reveal } from "@/components/motion/Reveal";

/**
 * The record as a dossier timeline: a hairline spine draws itself downward
 * as you scroll, entries surfacing beside it. Current roles carry the live
 * accent dot. Static spine under reduced motion.
 */
export function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top 75%",
              end: "bottom 60%",
              scrub: true,
            },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="relative">
      {/* the spine */}
      <span
        ref={lineRef}
        aria-hidden="true"
        className="absolute bottom-0 left-1 top-0 w-px origin-top bg-border"
      />

      <ol className="space-y-14">
        {experience.map((e) => {
          const current = e.end === null;
          return (
            <li key={e.slug} className="relative pl-10">
              {/* node */}
              <span
                aria-hidden="true"
                className={`absolute left-0 top-1.5 h-2 w-2 rounded-full ${
                  current ? "bg-accent" : "border border-muted bg-background"
                }`}
              />
              <Reveal>
                <p className="annot text-muted">
                  {e.start} — {e.end ?? "now"} · {e.location}
                </p>
                <h3 className="font-display text-heading mt-2">{e.role}</h3>
                <p className="annot mt-1 text-muted">{e.org}</p>
                <p className="mt-4 max-w-prose leading-relaxed">{e.summary}</p>
                <ul className="mt-3 max-w-prose space-y-1.5 text-sm leading-relaxed text-muted">
                  {e.highlights.slice(0, 2).map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </Reveal>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
