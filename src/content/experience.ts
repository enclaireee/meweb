import type { Role } from "./types";

/** Reverse chronological (by start), as pinned on the corkboard. */
export const experience = [
  {
    id: "pgncom",
    kind: "work",
    summary: "Automated SCADA and network telemetry and alarms across Wonderware, Reliance and Zabbix, on national gas transmission.",
    title: "SCADA & Automation Engineer Intern",
    org: "PT PGAS Telekomunikasi Nusantara",
    dates: { start: "2026-06", end: "2026-08" },
    lines: [
      "Automated telemetry collection and alarm notification for SCADA and network devices across 3 platforms (Wonderware, Reliance, Zabbix), improving fault visibility on national natural gas transmission infrastructure.",
      "Traced the telemetry path from metering and regulating stations to the control room with operations staff, covering pressure, flow, and temperature acquisition and alarm-threshold configuration.",
    ],
  },
  {
    id: "ime-rnd",
    kind: "leadership",
    summary: "Lead an 11-analyst team advising 12 divisions, with quarterly HRE and gap-analysis reports to 150+ staff.",
    title: "Head of Research and Development",
    org: "IME FTUI 2026",
    dates: { start: "2026-01", end: null },
    lines: [
      "Lead an 11-member analyst team advising 12 student association divisions, publishing quarterly HRE and Gap Analysis e-reports to over 150 staff.",
      "Direct the Blueprint gap-analysis program and present recommendations on division work programs to the division heads (BPH SA).",
    ],
  },
  {
    id: "ftui-ta",
    kind: "work",
    summary: "Two terms co-teaching Computational Thinking (Python) to every FTUI engineering major.",
    title: "Teaching Assistant, Computational Thinking",
    org: "Fakultas Teknik UI",
    dates: { start: "2025-08", end: "2026-06" },
    lines: [
      "Appointed for 2 consecutive terms as Teaching Assistant for a faculty-wide course spanning all FTUI engineering majors, co-delivering weekly lectures with 2 lecturers.",
      "Mentored students in Python algorithmic problem solving and graded weekly assessments with structured feedback.",
    ],
  },
  {
    id: "exertion",
    kind: "leadership",
    summary: "Built the first flagship event's competitions from scratch: 3 competitions, 150+ participants.",
    title: "Director of Events",
    org: "EXERTION UI 2025",
    dates: { start: "2025-04", end: "2025-09" },
    lines: [
      "Built the competition portfolio for the organization's first flagship event from the ground up, running 3 competitions for high school and university students.",
      "Drew over 150 participants, exceeding first-year targets, while owning rules, judging, and event-day operations.",
    ],
  },
  {
    id: "exercise-swe",
    kind: "work",
    summary: "Shipped full-stack client websites in React, Next.js, Node.js and Tailwind CSS.",
    title: "Software Engineer Team",
    org: "EXERCISE FTUI 2025",
    place: "Depok",
    dates: { start: "2025-02", end: "2025-12" },
    lines: [
      "Built and shipped full-stack websites (React, Next.js, Node.js, Tailwind CSS) for clients inside and outside FTUI.",
      "Scoped client requirements into build specifications, then implemented them as responsive, maintainable applications.",
      "Collaborated in a Git-based workflow with designers and project managers, handling code reviews, iterative revisions, and deployment handover to clients.",
    ],
  },
  {
    id: "wsj",
    kind: "leadership",
    summary: "Led a 30-member Indonesian contingent through a heatwave and a typhoon evacuation.",
    title: "Contingent Team Leader",
    org: "25th World Scout Jamboree",
    place: "South Korea",
    dates: { start: "2023-08", end: "2023-08" },
    lines: [
      "Led a 30 member Indonesian contingent at the 25th World Scout Jamboree, a 43,000 participant event drawing 158 national Scout organisations to an 8.8 km² campsite, owning logistics, welfare, and daily operations.",
      "Sustained team welfare and cohesion through an extreme heatwave and the emergency site-wide evacuation ahead of Typhoon Khanun, managing the contingent's relocation to Seoul on short notice.",
    ],
  },
] satisfies Role[];
