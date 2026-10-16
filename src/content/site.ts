// All words on the page. Source: agents/content.md (which follows the CV).

/** Every stop's card has its own look (CardBody.tsx). */
export type CardLayout = "cv" | "stalls" | "pipeline" | "spec" | "poster" | "ticket" | "datasheet" | "timeline" | "letter";

/** A paper note's centre in art units: x from the stop's boat, y from the artboard top; then its tilt in degrees. */
export type Spot = [x: number, y: number, deg: number];

export type ImageRef = {
  alt: string;
  /** Path under /public. Unset = "Image soon" placeholder. */
  cover?: string;
  thumb?: string;
};

export type Stop = {
  i: number;
  id: string; // "stop-0" on the main river, "made-1" on the projects river
  place: string; // "The Spring"
  time: string; // "Dusk"
  kicker: string; // "00 · The Spring"
  /** Where this stop's notes lie (desktop/tablet), one per note in noteKinds() order (src/lib/notes.ts). */
  spots: Spot[];
  tag: {
    title: string;
    date?: string;
    hook: string;
    /** Shown on the tag and atop the card: [value, label], all from the CV. */
    facts?: [string, string][];
  };
  card: {
    layout: CardLayout;
    title: string;
    subtitle?: string;
    date?: string;
    summary?: string;
    highlights?: string[];
    chips?: string[];
    awards?: string[];
    image?: ImageRef;
    /** Short labels paired with `highlights`, in order (pipeline steps, poster findings). */
    steps?: string[];
    /** Key/value rows: parts list, ticket stub, asset classes, model line-up. */
    spec?: [string, string][];
    /** Ordered legend, e.g. health tiers. */
    legend?: string[];
  };
};

export const person = {
  name: "Muhammad Fatih Zamzami",
  shortName: "Fatih",
  subtitle: "Electrical engineering · Universitas Indonesia",
  email: "muhfatihzamzami@gmail.com",
  linkedin: "https://www.linkedin.com/in/fatihzamzami" as string | undefined,
  github: "https://github.com/enclaireee",
  /** placeholder: true. Download disabled until the file exists. */
  cv: undefined as string | undefined, // "/cv/Muhammad-Fatih-Zamzami-CV.pdf"
  location: "Depok, Jawa Barat, Indonesia",
};

export const site = {
  // placeholder: true. Replace with the real domain (decisions.md Q8).
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://fatihzamzami.vercel.app",
  title: "Muhammad Fatih Zamzami · Paper River",
  description:
    "Muhammad Fatih Zamzami, electrical engineering student building control systems, full-stack apps and industrial monitoring, told as a paper-cut night river.",
  posterAlt:
    "A paper-cut night river under a misty volcano, a small boat with a lantern.",
};

export const copy = {
  prev: "Previous place",
  next: "Next place",
  dotsLabel: "Places along the river",
  close: "Close",
  imageEmpty: "Image soon",
  downloadCv: "Download CV",
  copyEmail: "Copy email",
  copied: "Copied",
  credit: "Made of paper, code and a very slow river.",
  noJs: "The river is quieter without JavaScript. Here is everything, in order.",
  notFound: "You drifted off the map.",
  notFoundLink: "Back to the river.",
  made: "Things I made",
  dive: "Dive in",
  backToMain: "Back to the river",
  /** The projects section (Projects.tsx). */
  madeKicker: "Under the river",
  sink: "Scroll to sink",
  howItWorks: "How it works",
  /** The landing (Landing.tsx): one statement, no stats. `*decide*` is the lit word. */
  heroKicker: "Muhammad Fatih Zamzami · Electrical Engineering, Universitas Indonesia",
  heroLine: "I build things that measure, and *decide.*",
  heroLede:
    "Hi, I'm Fatih. I work where hardware meets data: control systems, plant monitoring, forecasting, and the web around them.",
  sayHello: "Say hello",
  loading: "Lighting the lantern",
  howToExplore: "Use the arrows, swipe, or press → to float downstream.",
  /** The lighthouse letter (Notes.tsx). `*...*` is lit, as on the landing. */
  contactHead: "Let's build something that measures, *and decides.*",
  signoff: "Fatih",
  contactLine:
    "Open to internships, collaborations and good conversations about control, data and web.",
};

const kick = (i: number, place: string) => `0${i} · ${place}`;
/** The main river: Spring (landing), Market Pier (opens the projects index), Village (skills & experience), Lighthouse (contact). */
export const stops: Stop[] = [
  {
    i: 0,
    id: "stop-0",
    place: "The Spring",
    time: "Night",
    kicker: kick(0, "The Spring"),
    // ponytail: the landing (Landing.tsx) lays out its own name and card line; spots unused.
    spots: [],
    tag: {
      title: "Hello, I'm Fatih",
      hook: "Engineer in training, builder of things that measure and decide.",
    },
    card: {
      layout: "cv",
      title: "Muhammad Fatih Zamzami",
      subtitle:
        "Electrical engineering undergraduate · Universitas Indonesia · Depok, Jawa Barat",
      summary:
        "I work across control systems, full-stack development and industrial OT/SCADA monitoring, and I have led technical and organisational teams along the way. This river is how I'd show you around, with an index of the things I've built.",
    },
  },
  {
    i: 1,
    id: "stop-1",
    place: "The Market Pier",
    time: "Night",
    kicker: kick(1, "The Market Pier"),
    spots: [[365, 358, 0], [595, 258, 0]],
    tag: {
      title: "Dive into my projects",
      hook: "The lanterns only show the surface. The real work is under the river. Hold your breath.",
    },
    card: {
      layout: "stalls",
      title: "Dive into my projects",
      summary: "The lanterns only show the surface. The real work sits under the river.",
    },
  },
  {
    i: 2,
    id: "stop-2",
    place: "The Stilt Village",
    time: "Dawn",
    kicker: kick(2, "The Stilt Village"),
    spots: [[365, 344, 0], [800, 591, 0]],
    tag: {
      title: "Skills & experience",
      date: "2023 to now",
      hook: "Teams I've led, courses I've taught, sites I've shipped.",
      facts: [["11", "analysts led"], ["3", "SCADA platforms"], ["30", "scouts led abroad"]],
    },
    card: {
      layout: "timeline",
      title: "Skills & experience",
      date: "2023 to now",
    },
  },
  {
    i: 3,
    id: "stop-3",
    place: "The Lighthouse",
    time: "Morning",
    kicker: kick(3, "The Lighthouse"),
    spots: [[560, 470, -1.5]],
    tag: { title: "Say hello", hook: "Morning on the sea, and the lamp is still lit." },
    card: { layout: "letter", title: "Say hello", summary: copy.contactLine },
  },
];

/** The projects, under the river (Projects.tsx), opened from the Market Pier. */
export const projects: Stop[] = [
  {
    i: 0,
    id: "made-1",
    place: "The Grain Stall",
    time: "Early night",
    kicker: kick(1, "The Grain Stall"),
    spots: [[365, 335, 0], [706, 417, 0]],
    tag: {
      title: "DemandX",
      date: "Sep 2026",
      hook: "Forecasting for distributors whose data is messy.",
      facts: [["2", "foundation models"], ["3", "classic baselines"], ["Rp", "policy costed in rupiah"]],
    },
    card: {
      layout: "pipeline",
      steps: ["Ingest anything", "Let models compete", "Decide what to reorder"],
      spec: [["Foundation models", "TiRex-2 · TimesFM-3"], ["Classic baselines", "Croston · TSB · seasonal naive"]],
      title: "DemandX",
      subtitle: "Demand forecasting & inventory decision support",
      date: "Sep 2026",
      summary:
        "A forecasting tool for mid-market distributors that does not assume clean data, and turns forecasts into what to reorder.",
      highlights: [
        "Built a schema-agnostic ingestion pipeline (Next.js 16, FastAPI, Docker) that maps arbitrary Indonesian ERP exports to a canonical model.",
        "Per-series model selection by ADI/CV² class, with rolling-origin backtests on WAPE/MASE; TiRex-2 and TimesFM-3 compete against Croston, TSB and seasonal baselines.",
        "Decision layer turns forecasts into ranked per-branch reorder quantities (safety stock, reorder point, MOQ rounding), and quantifies the policy in rupiah against a baseline on fill rate, stockouts and inventory held.",
      ],
      chips: ["Next.js 16", "FastAPI", "Docker", "Time-series forecasting", "WAPE/MASE"],
      image: { alt: "DemandX dashboard showing forecasts and reorder quantities" },
    },
  },
  {
    i: 1,
    id: "made-2",
    place: "The Repair Stall",
    time: "Deep night",
    kicker: kick(2, "The Repair Stall"),
    spots: [[365, 358, 0], [640, 533, 0]],
    tag: {
      title: "OT Observability Lab",
      date: "Jun to Aug 2026",
      hook: "Describe a plant in YAML, get monitoring for it.",
      facts: [["4", "OT asset classes"], ["3", "health tiers"], ["7.0", "Zabbix"]],
    },
    card: {
      layout: "spec",
      spec: [["PLC", "controllers"], ["HMI", "operator panels"], ["Network", "switches and links"], ["Gas", "instrumentation"]],
      legend: ["Good", "Underperform", "Failed"],
      title: "OT Observability Lab",
      subtitle: "Catalog-driven OT/ICS monitoring system",
      date: "Jun to Aug 2026",
      summary:
        "A framework that provisions industrial monitoring from a catalogue, so adding a device is a few lines rather than a morning of clicking.",
      highlights: [
        "YAML-driven Zabbix 7.0 provisioning across 4 OT/ICS asset classes (PLC, HMI, network, gas instrumentation).",
        "A Python engine creates hosts, templates, items and triggers through the Zabbix API.",
        "Synthetic SCADA telemetry simulator and a 3-tier asset health model (Good / Underperform / Failed) with correlation-based failure-chain detection across SNMP parameters.",
      ],
      chips: ["Zabbix 7.0", "Python", "SNMP", "SCADA"],
      image: { alt: "Monitoring dashboard with asset health tiers" },
    },
  },
  {
    i: 2,
    id: "made-3",
    place: "The Game Stall",
    time: "Midnight",
    kicker: kick(3, "The Game Stall"),
    spots: [[365, 344, 0], [650, 156, 0]],
    tag: {
      title: "Refocus",
      date: "Feb to Apr 2025",
      hook: "A game that watches your attention and adjusts.",
      facts: [["DB-6", "wavelet features"], ["5", "model GMM ensemble"]],
    },
    card: {
      layout: "poster",
      steps: ["The loop", "The pattern"],
      title: "Refocus",
      subtitle: "Refocusing ADHD using EEG and a neuro-adaptive video game",
      date: "Feb to Apr 2025",
      summary:
        "A closed-loop brain-computer interface that reads EEG while you play and tunes the game's difficulty to your attention, as a non-pharmacological ADHD therapy.",
      highlights: [
        "Closed-loop BCI neurofeedback system (Python, Godot, NeuroSky Mindwave Mobile 2) streaming real-time EEG into a game that adapts difficulty from the user's Low Beta/Theta ratio.",
        "DB-6 Discrete Wavelet Transform feature extraction with a 5-model GMM ensemble for attention-state pattern recognition.",
      ],
      // placeholder: true. Assumes these awards were the Refocus entry (decisions.md Q5).
      awards: [
        "1st Runner-Up (2nd Place), ProtoTech Competition, The Sandbox 2.0, IEEE ITB Student Branch (2025)",
        "Best Presentation, ProtoTech Competition, The Sandbox 2.0, IEEE ITB Student Branch (2025)",
      ],
      chips: ["Python", "Godot", "EEG", "Wavelet transform", "GMM"],
      image: { alt: "The Refocus game and EEG headset" },
    },
  },
  {
    i: 3,
    id: "made-4",
    place: "The Ticket Booth",
    time: "Late night",
    kicker: kick(4, "The Ticket Booth"),
    spots: [[365, 360, 0], [795, 421, 0]],
    tag: {
      title: "KOMAT UNPAR 2025",
      date: "Mar to Aug 2025",
      hook: "Registration, payment and an admin desk, all in one site.",
      facts: [["Next 15", "with Tailwind v4"], ["CD", "Vercel from GitHub"]],
    },
    card: {
      layout: "ticket",
      spec: [["Event", "KOMAT UNPAR 2025"], ["Reach", "Nationwide"], ["Run", "Mar to Aug 2025"], ["Ships via", "Vercel CD"]],
      title: "KOMAT UNPAR 2025",
      subtitle: "Competition website for a nationwide mathematics competition",
      date: "Mar to Aug 2025",
      summary:
        "The full-stack site for a nationwide mathematics competition: a participant frontend and an admin dashboard.",
      highlights: [
        "Built and maintained the full-stack site (Next.js 15, Tailwind CSS v4, Framer Motion), with a fully responsive participant frontend.",
        "Admin dashboard with integrated registration and payment systems.",
        "Deployed on Vercel with continuous delivery from GitHub.",
      ],
      chips: ["Next.js 15", "Tailwind CSS v4", "Framer Motion", "Vercel"],
      image: { alt: "KOMAT UNPAR 2025 website home page" },
    },
  },
  {
    i: 4,
    id: "made-5",
    place: "The Lamp Seller",
    time: "Pre-dawn",
    kicker: kick(5, "The Lamp Seller"),
    spots: [[365, 344, 0], [834, 584, 0]],
    tag: {
      title: "Sunlight Meter", // placeholder: true (decisions.md Q6)
      date: "May to Jun 2026",
      hook: "A lamp that tells you how well it is being powered.",
      facts: [["2", "sensors: INA219, LDR"], ["0.96\"", "live OLED readout"]],
    },
    card: {
      layout: "datasheet",
      spec: [["Source", "Photovoltaic panel"], ["Controller", "Arduino"], ["Power sensor", "INA219"], ["Light sensor", "LDR"], ["Display", '0.96" I2C OLED']],
      title: "Solar-Powered Lighting System",
      subtitle: "With real-time efficiency monitoring · Embedded Systems final project",
      date: "May to Jun 2026",
      summary:
        "A solar-powered LED lighting system that measures its own power and efficiency while the light changes.",
      highlights: [
        "Designed and built the system around a photovoltaic panel, an Arduino and a 2-sensor array.",
        "Programmed real-time power and efficiency monitoring from INA219 and LDR sensors.",
        'Live metrics shown on a 0.96" I2C OLED under varying light conditions.',
      ],
      chips: ["Arduino", "INA219", "LDR", "I2C OLED", "Photovoltaic"],
      image: { alt: "The solar lamp prototype with its OLED display" },
    },
  },
];

export type Role = { role: string; org: string; dates: string; points: string[] };

export const roles: Role[] = [
  {
    role: "Head of Research and Development",
    org: "IME FTUI 2026",
    dates: "Jan 2026 to present",
    points: [
      "Lead an 11-member analyst team advising 12 student association divisions, publishing quarterly HRE and Gap Analysis e-reports to over 150 staff.",
      "Direct the Blueprint gap-analysis program and present recommendations to the division heads (BPH SA).",
    ],
  },
  {
    role: "SCADA & Automation Engineer Intern",
    org: "PT PGAS Telekomunikasi Nusantara",
    dates: "Jun to Aug 2026",
    points: [
      "Automated telemetry collection and alarm notification for SCADA and network devices across 3 platforms (Wonderware, Reliance, Zabbix), improving fault visibility on national natural gas transmission infrastructure.",
      "Traced the telemetry path from metering and regulating stations to the control room with operations staff, covering pressure, flow and temperature acquisition and alarm-threshold configuration.",
    ],
  },
  {
    role: "Teaching Assistant, Computational Thinking",
    org: "Fakultas Teknik UI",
    dates: "Aug 2025 to Jun 2026",
    points: [
      "Appointed for 2 consecutive terms for a faculty-wide course across all FTUI engineering majors, co-delivering weekly lectures with 2 lecturers.",
      "Mentored students in Python algorithmic problem solving and graded weekly assessments with structured feedback.",
    ],
  },
  {
    role: "Software Engineer Team",
    org: "EXERCISE FTUI 2025",
    dates: "Feb to Dec 2025",
    points: [
      "Built and shipped full-stack websites (React, Next.js, Node.js, Tailwind CSS) for clients inside and outside FTUI.",
      "Scoped client requirements into build specifications.",
      "Worked in Git with designers and PMs: code reviews, iterative revisions, deployment handover.",
    ],
  },
  {
    role: "Director of Events",
    org: "EXERTION UI 2025",
    dates: "Apr to Sep 2025",
    points: [
      "Built the competition portfolio for the organisation's first flagship event from the ground up, running 3 competitions for high school and university students.",
      "Drew over 150 participants, exceeding first-year targets, while owning rules, judging and event-day operations.",
    ],
  },
  {
    role: "Contingent Team Leader",
    org: "25th World Scout Jamboree, South Korea",
    dates: "Aug 2023",
    points: [
      "Led a 30-member Indonesian contingent at a 43,000-participant event drawing 158 national Scout organisations to an 8.8 km² campsite.",
      "Sustained welfare and cohesion through an extreme heatwave and the emergency evacuation ahead of Typhoon Khanun, relocating the contingent to Seoul on short notice.",
    ],
  },
];

export const education = {
  degree: "S1 Electrical Engineering",
  school: "Universitas Indonesia",
  dates: "Aug 2024 to present",
  note: "4th semester",
  coursework: [
    "Circuit Analysis",
    "Signals & Systems",
    "Power Systems",
    "Numerical Methods",
    "Advanced Programming and Algorithm",
  ],
};

export const skills: { group: string; items: string[] }[] = [
  { group: "Programming", items: ["Python", "TypeScript", "JavaScript", "C/C++", "MATLAB"] },
  {
    group: "Frameworks & tools",
    items: ["React", "Next.js", "FastAPI", "Tailwind CSS", "Supabase", "Git", "Docker", "Arduino"],
  },
  {
    group: "Forecasting & data",
    items: [
      "Time-series forecasting (Croston, TSB, seasonal naive)",
      "Rolling-origin backtesting (WAPE/MASE)",
      "pandas",
      "REST API design",
    ],
  },
  { group: "Languages", items: ["Bahasa Indonesia (native)", "English (professional)"] },
];

export const awards = [
  "1st Runner-Up (2nd Place), ProtoTech Competition, The Sandbox 2.0, IEEE ITB Student Branch (2025)",
  "Best Presentation, ProtoTech Competition, The Sandbox 2.0, IEEE ITB Student Branch (2025)",
  "Best BPH (Board of Officers), Research & Development Division, Ikatan Mahasiswa Elektro FTUI (2026)",
];

/** Per-stop dials (design-tokens.md). `cam` is the diorama camera shot for the stop (src/lib/camera.ts). Main river. */
export const dials = [
  { ff: [4, 2, 0], glow: 0.8, haze: 0.6, cam: { yaw: -6.4, pitch: 0, lift: 0, dolly: 0 } },
  { ff: [3, 1, 0], glow: 0.9, haze: 0.5, cam: { yaw: 4, pitch: 0, lift: 0, dolly: 30 } },
  { ff: [2, 0, 0], glow: 0.5, haze: 0.4, cam: { yaw: 8, pitch: 3, lift: 30, dolly: 78 } },
  { ff: [0, 0, 0], glow: 0.6, haze: 0.3, cam: { yaw: 0, pitch: 0, lift: 0, dolly: 26 } },
] as const;

