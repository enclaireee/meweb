"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { DUR, EASE } from "@/lib/motion";

/** Contact's entrance beat for the form panel: a glide in from the right. */
export function PanelIn({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: DUR.gesture, ease: EASE.outExpo, delay: 0.35 }}
    >
      {children}
    </motion.div>
  );
}
