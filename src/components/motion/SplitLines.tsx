"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, ScrollTrigger, SplitText } from "@/lib/gsap";
import { DUR, GSAP_EASE } from "@/lib/motion";

interface SplitLinesProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Seconds to hold before the first line. */
  delay?: number;
  /** Animate immediately on mount instead of on scroll into view. */
  immediate?: boolean;
}

/**
 * Masked line-by-line text reveal. Splits on lines and slides each up from
 * behind a clip mask. Falls back to a plain fade under reduced motion.
 */
export function SplitLines({
  children,
  as: Tag = "div",
  className,
  delay = 0,
  immediate = false,
}: SplitLinesProps) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.fromTo(
          el,
          { autoAlpha: 0 },
          {
            autoAlpha: 1,
            duration: DUR.gesture,
            delay,
            scrollTrigger: immediate ? undefined : { trigger: el, start: "top 85%" },
          },
        );
        return;
      }

      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.lines, {
            yPercent: 110,
            duration: DUR.signature,
            ease: GSAP_EASE.outExpo,
            stagger: 0.09,
            delay,
            scrollTrigger: immediate
              ? undefined
              : { trigger: el, start: "top 85%", once: true },
          }),
      });

      return () => split.revert();
    },
    { scope: ref, dependencies: [immediate, delay] },
  );

  return (
    // visibility handled by GSAP; start visible so no-JS still reads
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

export { ScrollTrigger };
