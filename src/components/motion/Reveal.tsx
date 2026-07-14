"use client";

import { motion, useReducedMotion } from "motion/react";
import { dur, ease } from "@/lib/motion";

/** Scroll-in wrapper. Reduced motion ⇒ children render statically. */
export function Reveal({
  delay = 0,
  y = 14,
  className,
  children,
}: {
  delay?: number;
  y?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: dur.slow, ease: ease.outExpo, delay }}
    >
      {children}
    </motion.div>
  );
}
