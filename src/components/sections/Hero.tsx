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
    <section id="top" className="bg-grid-paper relative flex min-h-svh flex-col">
      {/* annotation header */}
      <header className="annot flex items-start justify-between gap-4 px-6 pt-6 text-ink-soft sm:px-10">
        <p>
          {profile.name}
          <br />
          {profile.location}
        </p>
        <p className="text-right">
          Portfolio — 2026
          <br />
          {profile.heroKicker}
        </p>
      </header>

      <div className="grid flex-1 grid-cols-12 items-end gap-x-4 px-6 pb-10 pt-16 sm:px-10 lg:pt-8">
        <div className="col-span-12 lg:col-span-8">
          <SplitLines
            as="h1"
            immediate
            delay={0.25}
            className="font-display-wonk text-hero tracking-tight"
          >
            Fatih
            <br />
            <span className="italic">Zamzami</span>
          </SplitLines>

          <Reveal delay={0.7} className="mt-8 max-w-xl">
            <p className="text-title font-display text-ink">{profile.heroLine}</p>
          </Reveal>
        </div>

        {/* portrait, deliberately off-grid to the right */}
        <div className="col-span-8 col-start-4 mt-12 sm:col-span-5 sm:col-start-8 lg:col-span-3 lg:col-start-10 lg:mt-0">
          <ImageReveal from="bottom" delay={0.5} className="aspect-[4/5]">
            <Placeholder id="hero-portrait" />
          </ImageReveal>
          <p className="annot mt-2 text-ink-soft">Fig. 01 — portrait</p>
        </div>
      </div>

      {/* domain marquee along the fold */}
      <div className="border-y border-line py-3">
        <Marquee duration={26}>
          {domains.map((d) => (
            <span key={d} className="annot mx-6 flex items-center gap-6 text-ink">
              {d} <span className="text-signal">●</span>
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
