"use client";

import { profile } from "@/content";
import { SplitLines } from "@/components/motion/SplitLines";
import { Reveal } from "@/components/motion/Reveal";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Marquee } from "@/components/motion/Marquee";
import { Placeholder } from "@/components/ui/Placeholder";

const domains = [
  "Control systems",
  "Embedded",
  "Full-stack web",
  "Signal processing",
  "Brain–computer interfaces",
];

export function Hero() {
  return (
    <section id="top" className="relative flex min-h-svh flex-col">
      <header className="annot flex items-start justify-between gap-4 px-gutter pt-6 text-muted">
        <p>{profile.name} — {profile.location}</p>
        <p className="pr-28 sm:pr-32">Portfolio 2026</p>
      </header>

      <div className="grid flex-1 grid-cols-12 items-end gap-x-4 px-gutter pb-12 pt-16 lg:pt-8">
        <div className="col-span-12 lg:col-span-8">
          <SplitLines
            as="h1"
            immediate
            delay={0.25}
            className="font-display text-hero"
          >
            Fatih
            <br />
            <span className="italic">Zamzami</span>
          </SplitLines>

          <Reveal delay={0.7} className="mt-10 max-w-xl">
            <p className="font-display text-lead text-muted">{profile.heroLine}</p>
          </Reveal>
        </div>

        {/* portrait, deliberately off-grid to the right */}
        <div className="col-span-8 col-start-4 mt-12 sm:col-span-5 sm:col-start-8 lg:col-span-3 lg:col-start-10 lg:mt-0">
          <ImageReveal from="bottom" delay={0.5} className="aspect-[4/5]">
            <Placeholder id="hero-portrait" />
          </ImageReveal>
          <p className="annot mt-2 text-muted">Fig. 01 — portrait</p>
        </div>
      </div>

      {/* the fold: one quiet kinetic line */}
      <div className="border-y border-border py-3">
        <Marquee duration={32}>
          {domains.map((d) => (
            <span key={d} className="annot mx-8 text-muted">
              {d}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
