"use client";

import { useRef } from "react";
import { projects } from "@/content";
import type { Project } from "@/content";
import { gsap, useGSAP } from "@/lib/gsap";
import { Reveal } from "@/components/motion/Reveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Placeholder } from "@/components/ui/Placeholder";

const placeholderByProject: Record<string, string> = {
  "neuro-adaptive-game": "project-neuro",
  "komat-unpar": "project-komat",
  "solar-monitor": "project-solar",
};

/**
 * Selected work. Desktop: the section pins and the track scrolls
 * horizontally, one oversized panel per project. Mobile and reduced-motion:
 * a vertical editorial stack — designed, not just unpinned.
 */
export function Work() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 64rem) and (prefers-reduced-motion: no-preference)", () => {
        const track = trackRef.current!;
        const distance = () => track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });
    },
    { scope: sectionRef },
  );

  return (
    <section id="work" ref={sectionRef} className="border-t border-line lg:h-svh lg:overflow-hidden">
      <div
        ref={trackRef}
        className="flex flex-col lg:h-full lg:w-max lg:flex-row lg:items-stretch"
      >
        {/* section title panel */}
        <div className="flex flex-col justify-between px-6 py-16 sm:px-10 lg:h-full lg:w-[38vw] lg:shrink-0 lg:py-10">
          <p className="annot text-ink-soft">03 — selected work</p>
          <div>
            <h2 className="font-display-wonk text-display">
              Three builds,
              <br />
              <span className="italic">three stacks.</span>
            </h2>
            <p className="annot mt-6 hidden text-ink-soft lg:block">scroll → the shelf slides</p>
          </div>
        </div>

        {projects.map((p, i) => (
          <WorkPanel key={p.slug} project={p} index={i} />
        ))}
      </div>
    </section>
  );
}

function WorkPanel({ project, index }: { project: Project; index: number }) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <article className="grid grid-cols-12 gap-x-4 border-t border-line px-6 py-16 sm:px-10 lg:h-full lg:w-[78vw] lg:shrink-0 lg:border-l lg:border-t-0 lg:content-center lg:py-10">
      <div className="col-span-12 flex items-baseline justify-between lg:col-span-12">
        <span className="font-display-wonk text-display text-ink-soft/40">{num}</span>
        <div className="annot text-right text-ink-soft">
          <p>{project.domain}</p>
          <p>
            {project.timeframe}
            {project.status === "in-progress" && (
              <span className="ml-2 text-signal">● in progress</span>
            )}
          </p>
        </div>
      </div>

      <div className="col-span-12 mt-6 lg:col-span-6 lg:mt-10">
        <ImageReveal from="left" className="aspect-[4/3]">
          <Placeholder id={placeholderByProject[project.slug]} />
        </ImageReveal>
        <p className="annot mt-2 text-ink-soft">
          Fig. {num} — {project.cvName}
        </p>
      </div>

      <div className="col-span-12 mt-8 flex flex-col justify-center lg:col-span-5 lg:col-start-8 lg:mt-10">
        <Reveal>
          <h3 className="font-display text-title">{project.title}</h3>
          <p className="mt-3 font-display text-xl italic text-ink-soft">{project.tagline}</p>
          <p className="mt-5 max-w-prose leading-relaxed text-ink">{project.description[0]}</p>
          <ul className="annot mt-6 flex flex-wrap gap-x-4 gap-y-2 text-ink-soft">
            {project.stack.map((s) => (
              <li key={s} className="border border-line px-2 py-1">
                {s}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </article>
  );
}
