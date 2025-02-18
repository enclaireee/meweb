"use client"
import React, { useEffect, useRef } from "react"
import { motion, useInView, useAnimation } from "motion/react"

interface Props {
  children: React.ReactNode;
  width?: "fit-content" | "100%"
}

export const Reveal = ({ children, width = "fit-content" }: Props) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const isInView = useInView(ref, { 
    once: true,
    amount: 0.5,
  })

  const mainControls = useAnimation();
  const slideControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      slideControls.start("slideOut");
      mainControls.start("visible");
      };
    }, [isInView, mainControls, slideControls])

  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }}>
      <motion.div
        variants={{
          hidden: { left: 0 }, 
          slideOut: { left: "100%" },
        }}
        initial="hidden"
        animate={slideControls}
        transition={{ duration: 0.5, ease: "easeIn" }}
        style={{
          position: "absolute",
          top: 4,
          bottom: 4,
          left: 0,
          right: 0,
          background: "#ffe169",
          zIndex: 20,
        }}
      />

      <motion.div
        variants={{
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 },
        }}
        initial="hidden"
        animate={mainControls}
        transition={{ duration: 0.5, delay: 0.25 }} 
      >
        {children}
      </motion.div>
    </div>
  )
}