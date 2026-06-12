"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase);

// Register the shared motion-language curves (see globals.css @theme)
// under the names exported from lib/motion.ts.
if (!CustomEase.get("outExpo")) {
  CustomEase.create("outSoft", "0.25, 1, 0.5, 1");
  CustomEase.create("outExpo", "0.16, 1, 0.3, 1");
  CustomEase.create("inOutSoft", "0.65, 0, 0.35, 1");
}

export { gsap, useGSAP, ScrollTrigger, SplitText };
