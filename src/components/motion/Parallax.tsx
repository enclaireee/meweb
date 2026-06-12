"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /** Total vertical drift as a % of element height. Negative drifts up. */
  amount?: number;
}

/** Scroll-scrubbed vertical drift. No-op under reduced motion. */
export function Parallax({ children, className, amount = -12 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.fromTo(
        ref.current,
        { yPercent: -amount / 2 },
        {
          yPercent: amount / 2,
          ease: "none",
          scrollTrigger: {
            trigger: ref.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    },
    { scope: ref, dependencies: [amount] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
