"use client";

import { useRef } from "react";
import { Link } from "next-view-transitions";
import { profile } from "@/content";
import { gsap, useGSAP, SplitText } from "@/lib/gsap";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Pinned manifesto: the statement sits full-screen while scroll scrubs each
 * word from faint to full ink — reading speed is literally in the reader's
 * hands. Falls back to static text under reduced motion. The fuller
 * narrative lives at /about; home keeps one paragraph and a pointer.
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
        <p className="annot mb-8 text-muted">a working theory</p>
        <p ref={textRef} className="font-display text-title max-w-5xl">
          {profile.statement}
        </p>
      </div>

      <div className="grid grid-cols-12 gap-x-4 border-t border-border px-gutter py-section">
        <Reveal className="col-span-12 lg:col-span-6 lg:col-start-4">
          <p className="max-w-prose text-lead">{profile.about[0]}</p>
          <Link
            href="/about"
            data-cursor="read"
            className="annot mt-8 inline-block text-muted underline decoration-border underline-offset-4 transition-colors duration-300 hover:text-foreground"
          >
            More about me →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
