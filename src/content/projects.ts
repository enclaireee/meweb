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
      { value: "2", label: "foundation models racing classical baselines" },
      { value: "Per SKU", label: "model chosen by ADI/CV² class" },
      { value: "Rp", label: "reorder policy measured in rupiah" },
    ],
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
      { value: "4", label: "OT/ICS asset classes: PLC, HMI, network, gas instrumentation" },
      { value: "3", label: "health tiers: Good, Underperform, Failed" },
      { value: "7.0", label: "Zabbix, provisioned from YAML" },
    ],
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
      { value: "DB-6", label: "wavelet feature extraction from live EEG" },
      { value: "5", label: "GMM models in the attention ensemble" },
      { value: "2nd", label: "place, ProtoTech, IEEE ITB 2025" },
    ],
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
      { value: "Nationwide", label: "mathematics competition website" },
      { value: "1", label: "admin dashboard with registration and payments" },
    ],
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
      { value: "2", label: "sensor array: INA219 power + LDR light" },
      { value: "0.96″", label: "I²C OLED showing live efficiency" },
    ],
    stack: ["Arduino", "C/C++", "INA219", "LDR", "I²C OLED"],
    bullets: [
      "Designed and built a solar-powered LED lighting system (photovoltaic panel, Arduino, 2-sensor array) as the Embedded Systems final project.",
      "Programmed real-time power and efficiency monitoring from INA219 and LDR sensors, displaying live metrics on a 0.96\" I2C OLED under varying light conditions.",
    ],
    links: {},
  },
} satisfies Record<string, Project>;

export type ProjectId = keyof typeof projects;
