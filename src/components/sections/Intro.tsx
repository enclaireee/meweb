"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DUR, EASE } from "@/lib/motion";

const noopSubscribe = () => () => {};
const shouldSkip = () =>
  sessionStorage.getItem("intro-seen") === "1" ||
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * First-load "calibration" overlay: a counter runs 0→100 alongside mono
 * status lines, then the sheet wipes upward to reveal the hero. Runs once
 * per session; skipped entirely under reduced motion.
 */
export function Intro() {
  const skip = useSyncExternalStore(noopSubscribe, shouldSkip, () => false);
  const [done, setDone] = useState(false);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (skip || done) return;
    const state = { n: 0 };
    const start = performance.now();
    const total = 1300;
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min((now - start) / total, 1);
      state.n = Math.round(100 * (1 - Math.pow(1 - t, 3)));
      if (counterRef.current) counterRef.current.textContent = String(state.n).padStart(3, "0");
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        sessionStorage.setItem("intro-seen", "1");
        setDone(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [skip, done]);

  return (
    <AnimatePresence>
      {!skip && !done && (
        <motion.div
          className="fixed inset-0 z-40 flex items-end bg-ink"
          exit={{ y: "-100%" }}
          transition={{ duration: DUR.slow, ease: EASE.outExpo }}
          aria-hidden="true"
        >
          <div className="flex w-full items-end justify-between p-6 sm:p-10">
            <div className="annot space-y-1 text-paper/60">
              <p>fatih zamzami — portfolio 2026</p>
              <p>calibrating type / grid / signal</p>
            </div>
            <span
              ref={counterRef}
              className="font-display-wonk text-paper"
              style={{ fontSize: "clamp(4rem, 14vw, 11rem)", lineHeight: 0.85 }}
            >
              000
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
