"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Case-study reading meter: an accent hairline along the top edge that
 * tracks scroll progress. Scroll-driven (user-paced), so it stays on under
 * reduced motion.
 */
export function ReadProgress() {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    gsap.fromTo(
      ref.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.body,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      },
    );
  });

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-30 h-0.5 origin-left bg-accent"
    />
  );
}
