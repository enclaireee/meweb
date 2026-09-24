import type { Project } from "./types";

/** Route order is set in src/sections/stations.ts; this is just the data. */
export const projects = {
  demandx: {
    id: "demandx",
    slug: "demandx",
    title: "DemandX",
    short: "Storeroom",
    dates: { start: "2026-09", end: "2026-09" },
    caption: "Every product gets the forecast that actually won.",
    facts: [
      { value: "2", label: "foundation models" },
      { value: "Per SKU", label: "model selection" },
      { value: "Rp", label: "policy, costed" },
    ],
    story: {
      problem: "Forecasting tools assume clean data. Mid-market distributors have arbitrary ERP exports, so they never get to use them.",
      built: "A schema-agnostic ingestion pipeline that maps any Indonesian ERP export to one canonical model, then a model race per series: TiRex-2 and TimesFM-3 against Croston, TSB and seasonal baselines, judged by rolling-origin backtests on WAPE and MASE.",
      result: "Every SKU is served by the model that measurably won, and forecasts become ranked reorder quantities per branch, priced in rupiah against a baseline on fill rate, stockouts and inventory held.",
    },
    brief: {
      problem: "Messy ERP exports keep distributors from forecasting at all.",
      built: "Any ERP export in, then foundation models race classic baselines for every product.",
      result: "Each SKU gets the model that won, turned into reorder quantities priced in rupiah.",
    },
    stack: ["Next.js 16", "FastAPI", "Docker", "TiRex-2", "TimesFM-3"],
    bullets: [
      "Implemented a schema-agnostic ingestion pipeline (Next.js 16, FastAPI, Docker) that maps arbitrary Indonesian ERP exports to a canonical model, removing the clean-data assumption that blocks mid-market distributors from adopting forecasting tools.",
      "Engineered per-series model selection by ADI/CV² class with rolling-origin backtests on WAPE/MASE, letting TiRex-2 and TimesFM-3 foundation models compete against Croston, TSB, and seasonal baselines so each SKU is served by the model that measurably won.",
      "Shipped the decision layer converting forecasts into ranked per-branch reorder quantities (safety stock, reorder point, MOQ rounding) and quantified the policy in rupiah against a baseline on fill rate, stockouts, and inventory held.",
    ],
    links: {},
  },
  "ot-lab": {
    id: "ot-lab",
    slug: "ot-observability-lab",
    title: "OT Observability Lab",
    short: "Control Room",
    dates: { start: "2026-06", end: "2026-08" },
    caption: "Four kinds of plant equipment, one catalog. The alarms write themselves.",
    facts: [
      { value: "4", label: "asset classes" },
      { value: "3", label: "health tiers" },
      { value: "7.0", label: "Zabbix API" },
    ],
    story: {
      problem: "Monitoring plant equipment in Zabbix means hosts, templates, items and triggers for every asset: PLCs, HMIs, network gear and gas instrumentation.",
      built: "A YAML catalog of those four asset classes and a Python engine that provisions all of it through the Zabbix 7.0 API, fed by a synthetic SCADA telemetry simulator.",
      result: "A three-tier health model (Good, Underperform, Failed) with correlation-based failure-chain detection across SNMP parameters.",
    },
    brief: {
      problem: "Every plant asset needs its own hosts, templates, items and triggers in Zabbix.",
      built: "A YAML catalog and a Python engine that provision it all through the Zabbix API.",
      result: "A three-tier health model that catches failure chains across SNMP data.",
    },
    stack: ["Python", "Zabbix 7.0", "Zabbix API", "YAML", "SNMP"],
    bullets: [
      "Designed a YAML-driven Zabbix 7.0 provisioning framework across 4 OT/ICS asset classes (PLC, HMI, network, gas instrumentation), with a Python engine automating host, template, item, and trigger creation via the Zabbix API.",
      "Built a synthetic SCADA telemetry simulator plus a 3-tier asset health model (Good/Underperform/Failed) with correlation-based failure-chain detection across SNMP parameters.",
    ],
    links: {},
  },
  refocus: {
    id: "refocus",
    slug: "refocus",
    title: "Refocus",
    short: "Arcade Corner",
    dates: { start: "2025-02", end: "2025-04" },
    caption: "A game that listens to your attention, and meets it halfway.",
    facts: [
      { value: "DB-6", label: "wavelet features" },
      { value: "5", label: "GMM ensemble" },
      { value: "2nd", label: "ProtoTech 2025" },
    ],
    story: {
      problem: "A nonpharmacological therapy for ADHD: training attention with a closed loop between the brain and a game.",
      built: "Live EEG from a NeuroSky Mindwave Mobile 2 streams through Python into a Godot game. DB-6 wavelet features feed a five-model GMM ensemble that recognises attention states.",
      result: "The game adapts its difficulty from the Low Beta/Theta ratio in real time. It took 2nd place and Best Presentation at ProtoTech, IEEE ITB 2025.",
    },
    brief: {
      problem: "Attention training for ADHD, without medication.",
      built: "Live EEG into a Godot game, read by wavelet features and a GMM ensemble.",
      result: "Difficulty adapts in real time. 2nd place and Best Presentation, ProtoTech 2025.",
    },
    stack: ["Python", "Godot", "NeuroSky Mindwave Mobile 2"],
    bullets: [
      "Built a closed-loop BCI neurofeedback system (Python, Godot, NeuroSky Mindwave Mobile 2) as nonpharmacological ADHD therapy, streaming real-time EEG into a game that adapts difficulty from the user's Low Beta/Theta ratio.",
      "Implemented DB-6 Discrete Wavelet Transform feature extraction with a 5-model GMM ensemble for attention-state pattern recognition.",
    ],
    links: {},
    awards: [
      { title: "1st Runner-Up (2nd Place), ProtoTech Competition", issuer: "The Sandbox 2.0, IEEE ITB Student Branch", year: 2025 },
      { title: "Best Presentation, ProtoTech Competition", issuer: "The Sandbox 2.0, IEEE ITB Student Branch", year: 2025 },
    ],
  },
  komat: {
    id: "komat",
    slug: "komat-unpar",
    title: "KOMAT UNPAR 2025",
    short: "Drafting Table",
    dates: { start: "2025-03", end: "2025-08" },
    caption: "A nationwide maths competition, drafted, built and kept running.",
    facts: [
      { value: "Next 15", label: "full-stack" },
      { value: "1", label: "admin dashboard" },
      { value: "CD", label: "Vercel + GitHub" },
    ],
    story: {
      problem: "A nationwide mathematics competition needed a site participants could register and pay on, and a way for the organisers to run it.",
      built: "The full-stack site in Next.js 15, Tailwind CSS v4 and Framer Motion, fully responsive, with an admin dashboard for registration and payments.",
      result: "Deployed on Vercel with continuous delivery from GitHub, and maintained from March to August 2025.",
    },
    brief: {
      problem: "A national maths competition needed registration and payments online.",
      built: "A responsive Next.js 15 site with an admin dashboard.",
      result: "Shipped on Vercel and kept running from March to August 2025.",
    },
    stack: ["Next.js 15", "Tailwind CSS v4", "Framer Motion", "Vercel"],
    bullets: [
      "Built and maintained the full-stack site (Next.js 15, Tailwind CSS v4, Framer Motion) for a nationwide mathematics competition, delivering a fully responsive participant frontend.",
      "Implemented an admin dashboard with integrated registration and payment systems, deployed on Vercel with continuous delivery from GitHub.",
    ],
    links: {},
  },
  solar: {
    id: "solar",
    slug: "solar-lighting",
    title: "Solar-Powered Lighting",
    short: "Sill",
    dates: { start: "2026-05", end: "2026-06" },
    caption: "Sunlight in, lamplight out, and a small screen keeping count.",
    facts: [
      { value: "2", label: "sensors" },
      { value: "0.96″", label: "OLED readout" },
      { value: "PV", label: "self-powered" },
    ],
    story: {
      problem: "The Embedded Systems final project: a light that powers itself, and shows how well it's doing it.",
      built: "A photovoltaic panel, an Arduino and a two-sensor array (INA219 for power, an LDR for light) driving an LED lighting system.",
      result: "Real-time power and efficiency, live on a 0.96″ I²C OLED, under changing light.",
    },
    brief: {
      problem: "A light that powers itself, and shows how well.",
      built: "A solar panel, an Arduino and two sensors driving LEDs.",
      result: "Live power and efficiency on a small OLED screen.",
    },
    stack: ["Arduino", "C/C++", "INA219", "LDR", "I²C OLED"],
    bullets: [
      "Designed and built a solar-powered LED lighting system (photovoltaic panel, Arduino, 2-sensor array) as the Embedded Systems final project.",
      "Programmed real-time power and efficiency monitoring from INA219 and LDR sensors, displaying live metrics on a 0.96\" I2C OLED under varying light conditions.",
    ],
    links: {},
  },
} satisfies Record<string, Project>;

export type ProjectId = keyof typeof projects;
