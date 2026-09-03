"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Smooth scroll, desktop only. Spec v4 §5.
 *
 * `syncTouch` stays off, which is Lenis's own default: phones keep native
 * momentum, and no library matches the physics people already have muscle
 * memory for. Wheel and trackpad are where the cohesion between parallax
 * layers actually shows, so that is where this runs.
 *
 * The instance is module-scoped because things outside React need it — the
 * expand overlay has to stop the page scrolling while it is open, and calling
 * `lenis.stop()` is not the same as setting overflow: hidden once a smooth
 * scroller owns the scroll position.
 */
let instance: Lenis | null = null;

/** Null under reduced motion, on touch, or before mount. Always null-check. */
export function getLenis() {
  return instance;
}

export function SmoothScroll() {
  useEffect(() => {
    // Same gate as every other motion primitive: if the inline script decided
    // this visitor does not get motion, they do not get a smooth scroller
    // either — overriding native scroll velocity is the most intrusive thing
    // on the page, so it is the first thing reduced motion should lose.
    if (!document.documentElement.hasAttribute("data-motion")) return;
    if (matchMedia("(pointer: coarse)").matches) return;

    const lenis = new Lenis({
      // Lenis handles in-page anchors itself, which matters here: the nav is
      // built entirely on #hash links with scroll-spy, and a smooth scroller
      // that does not own anchor jumps fights the browser over them.
      anchors: true,
      duration: 1.1,
    });
    instance = lenis;

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      instance = null;
    };
  }, []);

  return null;
}
