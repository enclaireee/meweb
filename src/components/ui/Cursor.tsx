"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const noopSubscribe = () => () => {};
const isFinePointer = () =>
  window.matchMedia("(pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Custom cursor: a small signal-orange crosshair dot that grows and shows a
 * label over elements carrying [data-cursor="<label>"]. Mouse-only — renders
 * nothing on touch devices or under reduced motion. The native cursor stays
 * visible (augmentation, not replacement).
 */
export function Cursor() {
  const enabled = useSyncExternalStore(noopSubscribe, isFinePointer, () => false);
  const [label, setLabel] = useState<string | null>(null);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.5 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.5 });

  useEffect(() => {
    if (!enabled) return;

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
      setLabel(target?.dataset.cursor ?? null);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-50 flex items-center justify-center"
      style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
    >
      <motion.div
        className="flex items-center justify-center rounded-full bg-signal"
        animate={{ width: label ? 72 : 10, height: label ? 72 : 10 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {label && (
          <span className="annot px-2 text-center text-paper" style={{ fontSize: "0.5625rem" }}>
            {label}
          </span>
        )}
      </motion.div>
    </motion.div>
  );
}
