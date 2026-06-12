"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { DUR, EASE } from "@/lib/motion";

interface RevealProps {
  children: ReactNode;
  /** Seconds to wait once in view. */
  delay?: number;
  /** Initial vertical offset in px. */
  y?: number;
  className?: string;
  once?: boolean;
}

/** Fade-and-rise into view on scroll. The workhorse entrance. */
export function Reveal({ children, delay = 0, y = 28, className, once = true }: RevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-12% 0px" }}
      transition={{ duration: DUR.gesture, delay, ease: EASE.outExpo }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Seconds between each child. */
  gap?: number;
}

/** Parent that staggers any <StaggerItem> children as they enter view. */
export function Stagger({ children, className, gap = 0.08 }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ staggerChildren: gap }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={{
        hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 24 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: DUR.gesture, ease: EASE.outExpo },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
