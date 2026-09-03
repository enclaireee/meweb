"use client";

import { useEffect, useRef } from "react";
import { motion as m } from "@content/meta/motion";

/**
 * Mask reveal. Spec v4 §4: content rises 24px into place at full opacity,
 * behind a clipping edge. No fade — the absence of the opacity ramp is what
 * keeps this out of fade-and-slide-up territory.
 *
 * Fires **once, ever**. The observer disconnects on first intersection, so
 * scrolling back up a 12,000px page never restages anything you have read.
 *
 * Sets a DOM attribute directly rather than React state: the element's
 * appearance is CSS's job from that point on, and a re-render here would buy
 * nothing. That also keeps it clear of the set-state-in-effect rule.
 *
 * Native `animation-timeline: view()` was specced for this and does not fit:
 * view() timelines are scrubbed to scroll position, so they replay every time
 * the element re-enters. There is no "play once and stay" with them.
 */
export function Reveal({
  children,
  /** Position in a staggered list. Capped so a long list's tail is not late. */
  index = 0,
  /** Clip while animating. Off for anything with a shadow that would be cut. */
  mask = true,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  index?: number;
  mask?: boolean;
  className?: string;
  as?: "div" | "li" | "section" | "h2" | "p";
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // No data-motion means JS-off, reduced motion, or a low-power device: the
    // content is already in its final position and there is nothing to do.
    if (!document.documentElement.hasAttribute("data-motion")) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-revealed", "");
          io.disconnect();
        }
      },
      // The bottom margin fires the reveal a little before the element is
      // fully in view, so the motion has finished by the time it is readable.
      //
      // The enormous TOP margin is load-bearing, not a hack: a plain observer
      // only fires for elements that actually intersect, so anything skipped
      // over — an anchor jump, a deep link with a hash, restored scroll on
      // back-navigation — stayed stranded at translateY(24px) forever. Measured:
      // 22 of 28 reveals stuck after one jump to the bottom. Expanding the root
      // upward makes "already passed" count as intersecting, so content above
      // you is always revealed and content below you still waits its turn.
      { rootMargin: "100000px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const delay = Math.min(index, m.listStaggerCap) * m.listStaggerMs;

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${mask ? "reveal-mask" : ""} ${className}`}
      style={index ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
