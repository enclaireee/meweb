"use client";

import { useEffect } from "react";

/**
 * Pointer perturbs the settled type. Spec v3.1 §4.
 *
 * Moving across the greeting nudges the width axis by up to ±3% and it decays
 * back to its resolved value. It can be disturbed; it always returns — which is
 * the whole argument of the concept, not a second mechanism bolted on.
 *
 * Writes a CSS custom property rather than React state: this runs on pointer
 * move, and a re-render per event would be indefensible. The listener only
 * exists while the hero is on screen, and never on touch or low-power devices.
 */
export function AxisNudge({ target }: { target: string }) {
  useEffect(() => {
    const root = document.documentElement;
    if (!root.hasAttribute("data-motion")) return;
    // No hover on touch, and continuous pointer tracking is exactly what costs
    // on a weak device — spec v3.1 §5 cuts this tier, not the resolve.
    if (matchMedia("(pointer: coarse)").matches) return;

    const el = document.querySelector<HTMLElement>(target);
    if (!el) return;

    let nudge = 0;
    let lastX = 0;
    let lastY = 0;
    let have = false;
    let raf = 0;
    let live = false;

    function onMove(e: PointerEvent) {
      if (have) {
        const d = Math.hypot(e.clientX - lastX, e.clientY - lastY);
        nudge = Math.min(3, Math.max(nudge, d / 22));
      }
      lastX = e.clientX;
      lastY = e.clientY;
      have = true;
    }

    function frame() {
      // Decays to rest within ~600ms of the pointer stopping.
      nudge *= 0.9;
      if (nudge < 0.02) nudge = 0;
      el!.style.setProperty("--wdth-nudge", nudge.toFixed(2));
      raf = requestAnimationFrame(frame);
    }

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !live) {
        live = true;
        window.addEventListener("pointermove", onMove, { passive: true });
        raf = requestAnimationFrame(frame);
      } else if (!entry.isIntersecting && live) {
        live = false;
        window.removeEventListener("pointermove", onMove);
        cancelAnimationFrame(raf);
        el!.style.setProperty("--wdth-nudge", "0");
      }
    });
    io.observe(el);

    return () => {
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [target]);

  return null;
}
