import type { ExperienceEntry, EducationEntry, Award } from "./types";

/**
 * Roles, orgs, and dates come straight from the CV. Summaries and
 * highlights are rewritten as original site copy.
 */

export const experience: ExperienceEntry[] = [
  {
    slug: "pgncom",
    org: "PT PGAS Telekomunikasi Nusantara (PGNCOM)",
    role: "Automation & SCADA System Engineer Intern",
    start: "Jun 2026",
    end: null,
    location: "Jakarta, Indonesia",
    summary:
      "Inside the OT stack that keeps natural gas moving — monitoring, automating, and simulating SCADA infrastructure.",
    highlights: [
      "Automated telemetry collection and alerting for SCADA and network devices across live gas transmission infrastructure.",
      "Configured and operated Wonderware, Reliance, and Zabbix; analyzed industrial OT architecture in real energy operations.",
      "Engineered the OT Observability Lab — see the case study.",
    ],
  },
  {
    slug: "ime-rnd",
    org: "Ikatan Mahasiswa Elektro FTUI",
    role: "Head of Research & Development",
    start: "Jan 2026",
    end: null,
    location: "Depok, Indonesia",
    summary:
      "Running an 11-person internal consulting team that treats a 12-division student association like a client portfolio.",
    highlights: [
      "Quarterly HR evaluations and gap analyses across 150+ staff, delivered as e-reports that name root causes, not symptoms.",
      "Blueprint program: data-driven recommendations on division work plans, presented directly to division heads.",
      "Designed the IKW constituent survey that feeds next cycle's planning.",
    ],
  },
  {
    slug: "ftui-ta",
    org: "Faculty of Engineering, Universitas Indonesia",
    role: "Teaching Assistant — Computational Thinking",
    start: "Aug 2025",
    end: null,
    location: "Depok, Indonesia",
    summary:
      "Selected for two consecutive terms to help teach a faculty-wide course taken by every engineering major.",
    highlights: [
      "Supported weekly lectures and graded assessments under I Gde Dharma Nugraha, S.T., M.T., Ph.D. and Andre Fahriz Perdana Hrp, M.T.",
      "Mentored students through algorithmic problem-solving in Python.",
      "Graded weekly assignments with structured, individual feedback.",
    ],
  },
  {
    slug: "exercise-swe",
    org: "EXERCISE FTUI",
    role: "Software Engineer",
    start: "Feb 2025",
    end: "Dec 2025",
    location: "Depok, Indonesia",
    summary:
      "Client web development inside the faculty's software engineering team — real clients, real deadlines, real production.",
    highlights: [
      "Built websites end-to-end — frontend, backend, deployment — on React, Next.js, Node.js, and Tailwind.",
      "Translated client requirements into responsive, maintainable apps alongside cross-functional teams.",
    ],
  },
  {
    slug: "exertion-events",
    org: "EXERTION UI 2025",
    role: "Director of Events",
    start: "Apr 2025",
    end: "Sep 2025",
    location: "Universitas Indonesia",
    summary:
      "Built the competition arm of a first-ever flagship event from nothing — format, rules, judging, event day.",
    highlights: [
      "Designed and ran three competitions spanning high school and university students.",
      "Drew 150+ participants, past target for a debut event.",
    ],
  },
  {
    slug: "wsj-leader",
    org: "25th World Scout Jamboree, South Korea",
    role: "Contingent Team Leader",
    start: "Aug 2023",
    end: "Aug 2023",
    location: "SaeManGeum, South Korea",
    summary:
      "Led a 30-member Indonesian contingent through a global event — logistics, welfare, and real-time contingency management.",
    highlights: [],
  },
];

export const education: EducationEntry[] = [
  {
    school: "Universitas Indonesia",
    program: "S1 Electrical Engineering",
    start: "Aug 2024",
    end: null,
    note: "Coursework: circuit analysis, signals & systems, power systems, numerical methods, advanced programming & algorithms.",
  },
  {
    school: "SMAIT Nurul Fikri Depok",
    program: "Science major (MIPA)",
    start: "Aug 2021",
    end: "May 2024",
    note: "Mathematics and physics focus.",
  },
];

export const awards: Award[] = [
  {
    title: "1st Runner-Up, ProtoTech Competition — The Sandbox 2.0",
    issuer: "IEEE ITB Student Branch",
    year: "2025",
  },
  {
    title: "Best BPH, Research & Development Division",
    issuer: "Ikatan Mahasiswa Elektro FTUI",
    year: "2026",
  },
];
