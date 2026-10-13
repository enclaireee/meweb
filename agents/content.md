# Content: all words on the page

Source of truth is `CV_Muhammad Fatih Zamzami.md`. Voice is warm and wry, short sentences, never boastful. Numbers come straight from the CV. Do not invent claims. Items marked **[confirm]** need Fatih's input.

## Voice guide
- Warm, a little dry. One small joke per card at most. Never at the visitor's expense.
- Short sentences. Active verbs. Plain words. No buzzwords ("passionate", "synergy", "cutting-edge").
- Concrete numbers over adjectives.
- Boats, light and water are fine metaphors, used lightly in kickers and microcopy; keep project bullets literal.
- British/International English spelling matching the CV ("organisation").

## Page metadata
- **Title:** Muhammad Fatih Zamzami · Paper River
- **Description:** Portfolio of Muhammad Fatih Zamzami, electrical engineering student building control systems, full-stack apps and industrial monitoring. A paper-cut night river you drift down.
- **Language:** `en`.

## Global microcopy
| Where | Text |
|---|---|
| Prev button | Previous place |
| Next button | Next place |
| Dots nav label | Places along the river |
| Hint (touch) | Swipe to drift downstream |
| Hint (pointer) | Press → or scroll once |
| Card close | Close |
| Image empty | Image soon |
| Reduce motion toggle | Reduce motion |
| Download CV | Download CV |
| Copy email | Copy email |
| Copied | Copied |
| Footer credit | Made of paper, code and a very slow river. |
| No-JS notice | The river is quieter without JavaScript. Here is everything, in order. |
| 404 | You drifted off the map. Back to the river. |

## Stop 0: The Spring, intro
- **Tag:** Hello, I'm Fatih · "Engineer in training, builder of things that measure and decide."
- **Card title:** Muhammad Fatih Zamzami
- **Subtitle:** Electrical engineering undergraduate · Universitas Indonesia · Depok, Jawa Barat
- **Summary:** I work across control systems, full-stack development and industrial OT/SCADA monitoring, and I have led technical and organisational teams along the way. This river is how I'd show you around: eight stops, one lantern each.
- **How to explore:** Use the arrows, swipe, or press → to float downstream.
- **Alt text for art poster (no-JS):** A paper-cut night river under a misty volcano, a small boat with a lantern.

## Stop 1: The Terraces, DemandX
- **Date:** Sep 2026
- **Title:** DemandX
- **Subtitle:** Demand forecasting & inventory decision support
- **Hook:** Forecasting for distributors whose data is messy.
- **Summary:** A forecasting tool for mid-market distributors that does not assume clean data, and turns forecasts into what to reorder.
- **Highlights (from CV):**
  - Built a schema-agnostic ingestion pipeline (Next.js 16, FastAPI, Docker) that maps arbitrary Indonesian ERP exports to a canonical model.
  - Per-series model selection by ADI/CV² class, with rolling-origin backtests on WAPE/MASE; TiRex-2 and TimesFM-3 compete against Croston, TSB and seasonal baselines.
  - Decision layer turns forecasts into ranked per-branch reorder quantities (safety stock, reorder point, MOQ rounding), and quantifies the policy in rupiah against a baseline on fill rate, stockouts and inventory held.
- **Chips:** Next.js 16 · FastAPI · Docker · Time-series forecasting · WAPE/MASE
- **Image alt (slot):** DemandX dashboard showing forecasts and reorder quantities **[confirm image]**

## Stop 2: The Gorge, OT Observability Lab
- **Date:** Jun – Aug 2026
- **Title:** OT Observability Lab
- **Subtitle:** Catalog-driven OT/ICS monitoring system
- **Hook:** Describe a plant in YAML, get monitoring for it.
- **Summary:** A framework that provisions industrial monitoring from a catalogue, so adding a device is a few lines rather than a morning of clicking.
- **Highlights:**
  - YAML-driven Zabbix 7.0 provisioning across 4 OT/ICS asset classes (PLC, HMI, network, gas instrumentation).
  - A Python engine creates hosts, templates, items and triggers through the Zabbix API.
  - Synthetic SCADA telemetry simulator and a 3-tier asset health model (Good / Underperform / Failed) with correlation-based failure-chain detection across SNMP parameters.
- **Chips:** Zabbix 7.0 · Python · SNMP · SCADA
- **Image alt:** Monitoring dashboard with asset health tiers **[confirm image]**

## Stop 3: The Still Pond, Refocus
- **Date:** Feb – Apr 2025
- **Title:** Refocus
- **Subtitle:** Refocusing ADHD using EEG and a neuro-adaptive video game
- **Hook:** A game that watches your attention and adjusts.
- **Summary:** A closed-loop brain–computer interface that reads EEG while you play and tunes the game's difficulty to your attention, as a non-pharmacological ADHD therapy.
- **Highlights:**
  - Closed-loop BCI neurofeedback system (Python, Godot, NeuroSky Mindwave Mobile 2) streaming real-time EEG into a game that adapts difficulty from the user's Low Beta/Theta ratio.
  - DB-6 Discrete Wavelet Transform feature extraction with a 5-model GMM ensemble for attention-state pattern recognition.
- **Awards (sticker on the card):**
  - 1st Runner-Up (2nd Place), ProtoTech Competition, The Sandbox 2.0, IEEE ITB Student Branch (2025)
  - Best Presentation, ProtoTech Competition, The Sandbox 2.0, IEEE ITB Student Branch (2025)

  **[confirm]** The CV lists these awards separately, not tied to a project. Linking them to Refocus assumes that is the ProtoTech entry. If not, move the sticker to the roles card.
- **Chips:** Python · Godot · EEG · Wavelet transform · GMM
- **Image alt:** The Refocus game and EEG headset **[confirm image]**

## Stop 4: The Mangroves, KOMAT UNPAR 2025
- **Date:** Mar – Aug 2025
- **Title:** KOMAT UNPAR 2025
- **Subtitle:** Competition website for a nationwide mathematics competition
- **Hook:** Registration, payment and an admin desk, all in one site.
- **Summary:** The full-stack site for a nationwide mathematics competition: a participant frontend and an admin dashboard.
- **Highlights:**
  - Built and maintained the full-stack site (Next.js 15, Tailwind CSS v4, Framer Motion), with a fully responsive participant frontend.
  - Admin dashboard with integrated registration and payment systems.
  - Deployed on Vercel with continuous delivery from GitHub.
- **Chips:** Next.js 15 · Tailwind CSS v4 · Framer Motion · Vercel
- **Image alt:** KOMAT UNPAR 2025 website home page **[confirm image]**

## Stop 5: The Estuary, Solar-powered lighting
- **Tag title:** Sunlight Meter (short, friendly name; the formal name is in the card) **[confirm name]**
- **Date:** May – Jun 2026
- **Title:** Solar-Powered Lighting System
- **Subtitle:** With real-time efficiency monitoring · Embedded Systems final project
- **Hook:** A lamp that tells you how well it is being powered.
- **Summary:** A solar-powered LED lighting system that measures its own power and efficiency while the light changes.
- **Highlights:**
  - Designed and built the system around a photovoltaic panel, an Arduino and a 2-sensor array.
  - Programmed real-time power and efficiency monitoring from INA219 and LDR sensors.
  - Live metrics shown on a 0.96" I2C OLED under varying light conditions.
- **Chips:** Arduino · INA219 · LDR · I2C OLED · Photovoltaic
- **Image alt:** The solar lamp prototype with its OLED display **[confirm image]**

## Stop 6: The Stilt Village, roles, skills and awards
- **Tag:** Roles & Craft · "Teams I've led, courses I've taught, sites I've shipped."
- **Card (roles variant):** six roles, newest first. Use an accordion; first open.

| Role | Org | Dates | Highlights |
|---|---|---|---|
| Head of Research and Development | IME FTUI 2026 | Jan 2026 – present | Lead an 11-member analyst team advising 12 student association divisions, publishing quarterly HRE and Gap Analysis e-reports to over 150 staff. Direct the Blueprint gap-analysis program and present recommendations to the division heads (BPH SA). |
| SCADA & Automation Engineer Intern | PT PGAS Telekomunikasi Nusantara | Jun – Aug 2026 | Automated telemetry collection and alarm notification for SCADA and network devices across 3 platforms (Wonderware, Reliance, Zabbix), improving fault visibility on national natural gas transmission infrastructure. Traced the telemetry path from metering and regulating stations to the control room with operations staff, covering pressure, flow and temperature acquisition and alarm-threshold configuration. |
| Teaching Assistant, Computational Thinking | Fakultas Teknik UI | Aug 2025 – Jun 2026 | Appointed for 2 consecutive terms for a faculty-wide course across all FTUI engineering majors, co-delivering weekly lectures with 2 lecturers. Mentored students in Python algorithmic problem solving and graded weekly assessments with structured feedback. |
| Software Engineer Team | EXERCISE FTUI 2025 | Feb – Dec 2025 | Built and shipped full-stack websites (React, Next.js, Node.js, Tailwind CSS) for clients inside and outside FTUI. Scoped client requirements into build specifications. Worked in Git with designers and PMs: code reviews, iterative revisions, deployment handover. |
| Director of Events | EXERTION UI 2025 | Apr – Sep 2025 | Built the competition portfolio for the organisation's first flagship event from the ground up, running 3 competitions for high school and university students. Drew over 150 participants, exceeding first-year targets, while owning rules, judging and event-day operations. |
| Contingent Team Leader | 25th World Scout Jamboree, South Korea | Aug 2023 | Led a 30-member Indonesian contingent at a 43,000-participant event drawing 158 national Scout organisations to an 8.8 km² campsite. Sustained welfare and cohesion through an extreme heatwave and the emergency evacuation ahead of Typhoon Khanun, relocating the contingent to Seoul on short notice. |

- **Education block:** S1 Electrical Engineering, Universitas Indonesia, Aug 2024 – present. 4th semester. Coursework: Circuit Analysis, Signals & Systems, Power Systems, Numerical Methods, Advanced Programming and Algorithm.
- **Skills block:**
  - Programming: Python, TypeScript, JavaScript, C/C++, MATLAB
  - Frameworks & tools: React, Next.js, FastAPI, Tailwind CSS, Supabase, Git, Docker, Arduino
  - Forecasting & data: time-series forecasting (Croston, TSB, seasonal naive), rolling-origin backtesting (WAPE/MASE), pandas, REST API design
  - Languages: Bahasa Indonesia (native), English (professional)
- **Awards block:**
  - 1st Runner-Up (2nd Place), ProtoTech Competition, The Sandbox 2.0, IEEE ITB Student Branch (2025)
  - Best Presentation, ProtoTech Competition, The Sandbox 2.0, IEEE ITB Student Branch (2025)
  - Best BPH (Board of Officers), Research & Development Division, Ikatan Mahasiswa Elektro FTUI (2026)

The CV is a single page, so the roles card may be long. It uses internal scroll. Consider splitting into two tabs ("Roles" and "Skills & awards") on phones.

## Stop 7: The Lighthouse, contact
- **Tag:** Say hello · "Last light before the sea."
- **Card (contact variant):**
  - Heading: Say hello
  - Line: Open to internships, collaborations and good conversations about control, data and web.
  - Email: muhfatihzamzami@gmail.com (mailto + copy button)
  - LinkedIn: **[confirm URL]**
  - CV: Download CV **[confirm PDF file path: `public/cv/Muhammad-Fatih-Zamzami-CV.pdf`]**
  - Location: Depok, Jawa Barat, Indonesia
- **Not shown:** phone number, GitHub (the user chose email, LinkedIn and CV only).

## Alt text rules
- Art layers are decorative (`aria-hidden`), except the no-JS poster, which has alt text.
- Image slots always have alt text describing the project image, not the frame.

## Keyboard and screen reader copy
- Live region announces the stop on arrival: "Stop 3 of 8, The Still Pond, Refocus."
- Tag button label: "Refocus, Feb to Apr 2025. Open details."

## SEO
- One `<h1>` (name), one `<h2>` per stop.
- JSON-LD `Person` with name, job title (student), alumniOf (Universitas Indonesia), and email.
- Open Graph image: a 1200 × 630 render of stop 0 (made during build, see `art-pipeline.md`).
