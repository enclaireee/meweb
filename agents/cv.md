# CV: Muhammad Fatih Zamzami

> Source: the owner's CV PDF (3 pages), transcribed faithfully. This is the **raw content** the world must hold. Mapping to the world is in `content-inventory.md`. The phone number and email are the owner's own; check before making the repo public.

**Contact:** +62 813 8078 1970 | muhfatihzamzami@gmail.com | LinkedIn | GitHub | Depok, Jawa Barat
(The LinkedIn and GitHub URLs are links in the PDF and were not visible as text. **Needed from owner.**)

**Summary:** Electrical Engineering undergraduate at Universitas Indonesia working across control systems, full-stack development, and industrial automation, with experience leading technical and organisational teams.

## Education
**S1 Electrical Engineering, Universitas Indonesia** (Aug 2024 to Present)
- 4th semester. Relevant coursework: Circuit Analysis, Signals & Systems, Power Systems, Numerical Methods, Advanced Programming and Algorithm.

## Experience
**Head of Research and Development | IME FTUI 2026** (Jan 2026 to Present)
- Lead an 11-member analyst team advising 12 student association divisions, publishing quarterly HRE and Gap Analysis e-reports to over 150 staff.
- Direct the Blueprint gap-analysis program and present recommendations on division work programs to the division heads (BPH SA).

**Teaching Assistant, Advanced Mathematics 2 | Fakultas Teknik UI** (Aug 2026 to Present)
- Support 50 students in a course on Laplace, Fourier, and z-transform analysis and on solving ordinary and partial differential equations (ODE and PDE).
- Held weekly practice sessions on transform and differential-equation problems, answered student questions, and graded assignments.

**SCADA & Automation Engineer Intern | PT PGAS Telekomunikasi Nusantara** (Jun 2026 to Aug 2026)
- Automated telemetry collection and alarm notification for SCADA and network devices across 3 platforms (Wonderware, Reliance, Zabbix), improving fault visibility on national natural gas transmission infrastructure.
- Traced the telemetry path from metering and regulating stations to the control room with operations staff, covering pressure, flow, and temperature acquisition and alarm-threshold configuration.

**Teaching Assistant, Computational Thinking | Fakultas Teknik UI** (Aug 2025 to Jun 2026)
- Appointed for 2 consecutive terms as Teaching Assistant for a faculty-wide course spanning all FTUI engineering majors, co-delivering weekly lectures with 2 lecturers.
- Mentored students in Python algorithmic problem solving and graded weekly assessments with structured feedback.

**Software Engineer Team | EXERCISE FTUI 2025, Depok** (Feb 2025 to Dec 2025)
- Built and shipped full-stack websites (React, Next.js, Node.js, Tailwind CSS) for clients inside and outside FTUI.
- Scoped client requirements into build specifications, then implemented them as responsive, maintainable applications.
- Collaborated in a Git-based workflow with designers and project managers, handling code reviews, iterative revisions, and deployment handover to clients.

**Director of Events | EXERTION UI 2025** (Apr 2025 to Sep 2025)
- Built the competition portfolio for the organization's first flagship event from the ground up, running 3 competitions for high school and university students.
- Drew over 150 participants, exceeding first-year targets, while owning rules, judging, and event-day operations.

**Contingent Team Leader | 25th World Scout Jamboree, South Korea** (Aug 2023)
- Led a 30 member Indonesian contingent at the 25th World Scout Jamboree, a 43,000 participant event drawing 158 national Scout organisations to an 8.8 km² campsite, owning logistics, welfare, and daily operations.
- Sustained team welfare and cohesion through an extreme heatwave and the emergency site-wide evacuation ahead of Typhoon Khanun, managing the contingent's relocation to Seoul on short notice.

## Projects
**IME FTUI 2026 Official Website & Transparency Dashboard** (Jan 2026 to Present)
- Maintained the official website of IME FTUI for a full year, covering the landing page, quarterly event recaps, highlights, and profile pages for 12 divisions with leadership, vision, and mission.
- Kept the public dashboard (cashflow, agenda timeline, event satisfaction scores) and IME Hub, a directory of division resources, current, alongside a contact form and partnership channel.

**Teater Musikal AKM, Ticketing & Seat Reservation Platform** (Oct 2026)
- Built a mobile-first ticketing site (Next.js, TypeScript, Tailwind CSS, HTTP) with a 750-seat interactive map, 4 ticket tiers, and PDF receipts.
- Engineered race-safe checkout in Postgres with atomic 10-minute seat holds and quotas enforced under lock, so two buyers never get the same seat, plus an admin panel for payment review.

**DemandX, Demand Forecasting & Inventory Decision Support** (Sep 2026)
- Implemented a schema-agnostic ingestion pipeline (Next.js 16, FastAPI, Docker) that maps arbitrary Indonesian ERP exports to a canonical model, removing the clean-data barrier to forecasting for mid-market distributors.
- Engineered per-series model selection by ADI/CV² class with rolling-origin backtests (WAPE/MASE), pitting TiRex-2 and TimesFM-3 against Croston, TSB, and seasonal baselines so each SKU gets its measured best model.
- Shipped a decision layer that turns forecasts into ranked per-branch reorder quantities (safety stock, reorder point, MOQ) and quantifies the policy in rupiah on fill rate, stockouts, and inventory held.

**NEST UI 2026, National Competition Registration Platform** (Jun 2026 to Sep 2026)
- Led development of the registration platform (Next.js, Supabase Auth, Tailwind CSS, Framer Motion) with multi-step team registration, per-competition team-size rules, and Postgres-enforced duplicate prevention and collision-free registration codes.
- Extended it with semifinalist submissions, a finalist mode, and an admin dashboard (verification, data export, login lockout), plus transactional email via Resend.

**OT Observability Lab, Catalog-Driven OT/ICS Monitoring System** (Jun 2026 to Aug 2026)
- Designed a YAML-driven Zabbix 7.0 provisioning framework for 4 OT/ICS asset classes (PLC, HMI, network, gas instrumentation), with a Python engine automating host, template, item, and trigger creation via the Zabbix API.
- Built a synthetic SCADA telemetry simulator plus a 3-tier asset health model (Good/Underperform/Failed) with correlation-based failure-chain detection across SNMP parameters.

**Solar-Powered Lighting System with Real-Time Efficiency Monitoring** (May 2026 to Jun 2026)
- Designed and built a solar-powered LED lighting system (photovoltaic panel, Arduino, 2-sensor array) as the Embedded Systems final project.
- Programmed real-time power and efficiency monitoring from INA219 and LDR sensors, with live metrics on a 0.96" I2C OLED.

**KOMAT UNPAR 2025 Competition Website** (Mar 2025 to Aug 2025)
- Built and maintained the full-stack site (Next.js 15, Tailwind CSS v4, Framer Motion) for a nationwide mathematics competition, with a fully responsive participant frontend.
- Implemented an admin dashboard with registration and payment systems, deployed on Vercel with continuous delivery from GitHub.

**Refocusing ADHD using EEG and Neuro-Adaptive Video Game System** (Feb 2025 to Apr 2025)
- Built a closed-loop BCI neurofeedback game (Python, Godot, NeuroSky Mindwave) for non-pharmacological ADHD therapy, adapting difficulty in real time from the user's Low Beta/Theta ratio.
- Implemented DB-6 Discrete Wavelet Transform feature extraction with a 5-model GMM ensemble for attention-state pattern recognition.

## Skills
- **Programming:** Python, TypeScript, JavaScript, C/C++, MATLAB
- **Frameworks & Tools:** React, Next.js, FastAPI, Tailwind CSS, Supabase, Git, Docker, Arduino
- **Forecasting & Data:** time-series forecasting (Croston, TSB, seasonal naive), rolling-origin backtesting (WAPE/MASE), pandas, REST API design
- **Languages:** Bahasa Indonesia (Native), English (Professional)

## Certifications & Awards
- 1st Runner-Up (2nd Place), ProtoTech Competition, The Sandbox 2.0 | IEEE ITB Student Branch (2025)
- Best Presentation, ProtoTech Competition, The Sandbox 2.0 | IEEE ITB Student Branch (2025)
- Best BPH (Board of Officers), Research & Development Division | Ikatan Mahasiswa Elektro FTUI (2026)
- Finalist, UI Hackathon 2026, Securing the Digital Frontier & Automating the Future Supply Chain | Universitas Indonesia (2026)
