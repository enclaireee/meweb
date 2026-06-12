import type { CapabilityGroup } from "./types";

/**
 * Skill lists come from the CV; grouping and blurbs are original copy.
 */
export const capabilities: CapabilityGroup[] = [
  {
    label: "Software",
    blurb: "From scripts to shipped product.",
    items: [
      "Python",
      "TypeScript",
      "JavaScript",
      "C/C++",
      "MATLAB",
      "React",
      "Next.js",
      "Supabase",
      "Node.js",
      "Git",
      "Docker",
    ],
  },
  {
    label: "Hardware & systems",
    blurb: "Where the code touches the physical world.",
    items: [
      "Arduino",
      "Embedded systems",
      "Circuit analysis",
      "Control systems",
      "Signal processing",
      "LTspice",
      "Numerical computation",
    ],
  },
  {
    label: "Leading",
    blurb: "Teams, programs, and event-day chaos.",
    items: [
      "Team leadership",
      "Project management",
      "Data-driven evaluation",
      "Teaching & mentoring",
    ],
  },
];

export const languages = [
  { label: "Bahasa Indonesia", level: "Native" },
  { label: "English", level: "Professional" },
];
