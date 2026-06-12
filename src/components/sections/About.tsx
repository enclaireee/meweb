"use client";

import { useRef } from "react";
import { profile } from "@/content";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Placeholder } from "@/components/ui/Placeholder";

/**
 * Pinned manifesto: the statement sits full-screen while scroll scrubs each
 * word from faint to full ink — reading speed is literally in the reader's
 * hands. Falls back to static text under reduced motion.
 */
export function About() {
  const pinRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(textRef.current, { type: "words" });
        gsap.from(split.words, {
          opacity: 0.14,
          stagger: 0.5,
          ease: "none",
          scrollTrigger: {
            trigger: pinRef.current,
            start: "top top",
            end: "+=130%",
            pin: true,
            scrub: true,
          },
        });
        return () => split.revert();
      });
    },
    { scope: pinRef },
  );

  return (
    <section id="about">
      <div ref={pinRef} className="flex min-h-svh flex-col justify-center px-gutter">
        <p className="annot mb-8 text-muted">02 — a working theory</p>
        <p ref={textRef} className="font-display text-title max-w-5xl">
          {profile.statement}
        </p>
      </div>

      <div className="grid grid-cols-12 gap-x-4 gap-y-12 border-t border-border px-gutter py-section">
        <div className="col-span-12 space-y-6 lg:col-span-6">
          {profile.about.map((para, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p className="max-w-prose text-lead text-foreground">{para}</p>
            </Reveal>
          ))}
        </div>
        <div className="col-span-10 col-start-2 lg:col-span-4 lg:col-start-9">
          <Parallax amount={-10}>
            <ImageReveal from="right" className="aspect-[4/3]">
              <Placeholder id="about-candid" />
            </ImageReveal>
            <p className="annot mt-2 text-muted">Fig. 02 — field conditions</p>
          </Parallax>
        </div>
      </div>
    </section>
  );
}
