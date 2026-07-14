import type { Project } from "./types";

/**
 * Project facts (names, dates, tech, what was built) come from the CV.
 * Titles, taglines, and descriptions are original site copy.
 */
export const projects: Project[] = [
  {
    slug: "neuro-adaptive-game",
    title: "Refocus",
    cvName: "Refocusing ADHD using EEG and Neuro-Adaptive Video Game System",
    year: "2025",
    timeframe: "Feb – Apr 2025",
    domain: "Brain–computer interface",
    status: "shipped",
    // [NEEDS REVIEW] Original tagline.
    tagline: "A video game that gets harder when you focus — and easier when you drift.",
    description: [
      "A closed-loop neurofeedback system built as a non-pharmacological approach to ADHD therapy. A NeuroSky MindWave Mobile 2 headset streams raw brainwave data into a Python pipeline, where a DB-6 discrete wavelet transform and a five-model GMM ensemble turn noise into a live read on the player's attention.",
      "That attention signal — the low-beta/theta ratio — drives a space shooter built in Godot. Difficulty scales with focus in real time, so staying locked in is the gameplay. The whole loop, from scalp to screen, runs live.",
    ],
    details: [
      "NeuroSky MindWave Mobile 2 headset streaming raw EEG in real time",
      "DB-6 discrete wavelet transform for feature extraction",
      "Five-model GMM ensemble recognizing attention patterns",
      "Godot space shooter whose difficulty tracks the live low-beta/theta ratio",
    ],
    stack: ["Python", "Godot", "NeuroSky EEG", "DWT", "GMM"],
  },
  {
    slug: "ot-observability-lab",
    title: "OT Observability Lab",
    cvName: "OT Observability Lab, Catalog-Driven OT/ICS Monitoring & Simulation System",
    year: "2026",
    timeframe: "Jun 2026 – present",
    domain: "SCADA / OT monitoring",
    status: "in-progress",
    tagline: "A monitoring stack for gas infrastructure, defined entirely in YAML.",
    description: [
      "A catalog-driven provisioning framework for Zabbix 7.0, built during my SCADA engineering internship at PT PGAS Telekomunikasi Nusantara. One YAML catalog is the single source of truth for four OT/ICS asset classes — PLCs, HMIs, network devices, and gas process instrumentation — and a Python engine turns it into Zabbix hosts, templates, items, and triggers through the API.",
      "Because you can't rehearse alerting on a live gas pipeline, the lab includes a telemetry simulator that generates synthetic SCADA sensor data to validate dashboards and alert logic before anything touches production. On top sits a three-tier asset health model (Good / Underperform / Failed) with correlation-based failure-chain detection across SNMP-monitored parameters.",
    ],
    details: [
      "YAML catalog as single source of truth across 4 OT/ICS asset classes",
      "Python provisioning engine driving the Zabbix API — hosts, templates, items, triggers",
      "Synthetic SCADA telemetry simulator for pre-deployment validation",
      "3-tier health classification with correlation-based failure-chain detection",
    ],
    stack: ["Zabbix 7.0", "Python", "YAML", "SNMP"],
  },
  {
    slug: "komat-unpar",
    title: "KOMAT UNPAR 2025",
    cvName: "KOMAT UNPAR 2025 Competition Website",
    year: "2025",
    timeframe: "Mar – Aug 2025",
    domain: "Full-stack web",
    status: "shipped",
    // [NEEDS REVIEW] Original tagline.
    tagline: "The digital front door for a nationwide mathematics competition.",
    description: [
      "The full-stack platform for KOMAT UNPAR, a national mathematics competition hosted by Universitas Katolik Parahyangan. Built end-to-end: an animated, fully responsive participant-facing site, plus an admin dashboard handling registration and payments for participants across the country.",
      "Shipped on Next.js 15 with Tailwind v4 and Framer Motion, deployed to Vercel with continuous delivery — maintained in production through the full competition cycle.",
    ],
    details: [
      "Participant-facing frontend with interactive animation, fully responsive",
      "Admin dashboard with integrated registration and payment flows",
      "Continuous delivery to Vercel via GitHub through the live competition cycle",
    ],
    stack: ["Next.js 15", "Tailwind CSS v4", "Framer Motion", "Vercel"],
    // [NEEDS REVIEW] Add the live URL if the site is still up.
  },
  {
    slug: "solar-monitor",
    title: "Sunmeter",
    cvName: "Solar-Powered Lighting System with Real-Time Efficiency Monitoring",
    year: "2026",
    timeframe: "May – Jul 2026",
    domain: "Embedded systems",
    status: "in-progress",
    // [NEEDS REVIEW] Original tagline + project nickname ("Sunmeter") — rename if you prefer the formal title.
    tagline: "A solar lamp that knows exactly how efficient it's being.",
    description: [
      "A solar-powered LED lighting system that measures itself. An INA219 current/voltage sensor and an LDR track panel output under changing light, while an Arduino crunches the numbers and reports live efficiency on a 0.96\" OLED.",
      "Built as the final project for Embedded Systems — photovoltaic panel, microcontroller, and sensor array integrated into one self-reporting unit.",
    ],
    details: [
      "INA219 current/voltage sensing with an LDR light reference",
      "Arduino firmware computing live efficiency under changing light",
      "Photovoltaic panel, LED load, and sensor array integrated into one unit",
      "Live metrics on a 0.96″ I2C OLED readout",
    ],
    stack: ["Arduino", "INA219", "C/C++", "OLED (I2C)"],
  },
];
