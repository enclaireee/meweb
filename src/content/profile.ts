import type { Dates } from "./types";

export const profile = {
  name: "Muhammad Fatih Zamzami",
  /** The one accent word in the <h1> (portfolio_concept.md §8). */
  accentWord: "Fatih",
  kicker: "Electrical Engineering · Universitas Indonesia",
  role: "Electrical Engineering undergraduate",
  summary:
    "Control systems, full-stack software and industrial monitoring, cut and pinned into eight stations.",
  /** CV summary, used for meta descriptions and the desk plate. */
  about:
    "Electrical Engineering undergraduate at Universitas Indonesia working across control systems, full-stack development, and industrial OT/SCADA monitoring, with experience leading technical and organisational teams.",
  /** the short version for the desk card (the CV summary, trimmed) */
  intro: "An Electrical Engineering student at Universitas Indonesia, working across control systems, full-stack software and industrial OT/SCADA monitoring, and leading technical and organisational teams.",
  /** the three threads of the work, from the CV summary: the tags over the desk */
  focus: ["Control systems", "Full-stack software", "OT / SCADA monitoring"],
  location: "Depok, Jawa Barat",
  education: {
    degree: "S1 Electrical Engineering",
    school: "Universitas Indonesia",
    dates: { start: "2024-08", end: null } satisfies Dates,
    coursework: [
      "Circuit Analysis",
      "Signals & Systems",
      "Power Systems",
      "Numerical Methods",
      "Advanced Programming and Algorithm",
    ],
  },
  languages: ["Bahasa Indonesia (native)", "English (professional)"],
} as const;
