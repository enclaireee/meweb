"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { DUR, GSAP_EASE } from "@/lib/motion";

interface ImageRevealProps {
  children: ReactNode;
  className?: string;
  /** Direction the clip mask opens from. */
  from?: "bottom" | "left" | "right";
  delay?: number;
}

/**
 * Clip-mask image entrance: the frame wipes open while the content eases
 * out of a slight overscale — images never just "pop". Plain fade under
 * reduced motion.
 */
export function ImageReveal({ children, className, from = "bottom", delay = 0 }: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  const clips: Record<string, string> = {
    bottom: "inset(100% 0 0 0)",
    left: "inset(0 100% 0 0)",
    right: "inset(0 0 0 100%)",
  };

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const inner = el.firstElementChild;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.from(el, {
          autoAlpha: 0,
          duration: DUR.base,
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
        return;
      }

      const tl = gsap.timeline({
        delay,
        scrollTrigger: { trigger: el, start: "top 82%", once: true },
      });
      tl.fromTo(
        el,
        { clipPath: clips[from] },
        { clipPath: "inset(0% 0 0 0)", duration: DUR.drama, ease: GSAP_EASE.outExpo },
      );
      if (inner) {
        tl.from(inner, { scale: 1.18, duration: DUR.drama, ease: GSAP_EASE.outExpo }, 0);
      }
    },
    { scope: ref, dependencies: [from, delay] },
  );

  return (
    <div ref={ref} className={`overflow-hidden ${className ?? ""}`}>
      {children}
    </div>
  );
}
