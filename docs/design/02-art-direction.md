# Phase 2 — Art Direction

Constraint from the mandate: none of these may read as a variant of v1
"Schematic Editorial" (warm paper, hairline rules, serif display with rationed
italics, tracked annotation voice). All three deliberately leave that territory.

## Reference study — mechanism, not vibe

| Site | The transferable mechanic |
|---|---|
| **rauno.me** | Craft-as-content: ONE primitive (his hover/focus treatment) tuned obsessively and reused everywhere. Perceived quality comes from repetition of a perfect detail, not variety. Transfer: whichever concept wins, pick one interaction and spend a disproportionate budget on it. |
| **emilkowal.ski** | Motion literacy: every animation has a pedagogical job — origin tells you where a thing came from, easing tells you its weight. Nothing moves "to be nice." Transfer: a written motion vocabulary (origins + easings) enforced across the site, defined once in tokens. |
| **paco.me / linear.app** | Hierarchy without size: one text size, hierarchy from weight and color alone; ⌘K as identity — keyboard affordances *visible in the UI* (kbd hints), which reads "engineer" instantly. Transfer: monochrome + one signal color; show shortcuts, don't hide them. |
| **brittanychiang.com** | Persistent orientation: scroll-linked nav means you always know where you are and how much remains. Transfer: an always-visible position indicator, whatever form the concept dictates. |
| **bruno-simon.com / lusion.co** | Contrast reference. The mechanic worth stealing is *concentration*: one enormous bet dominating the experience, zero energy spent elsewhere. We can't afford WebGL — but we can afford the lesson: one bet, fully funded, instead of eight half-funded gimmicks. |
| **maximeheckel.com / joshwcomeau.com** | The interactive artifact as proof: a working widget demonstrating the thing the prose claims. One live demo out-argues ten screenshots. Transfer: flagship case study ships a working artifact. |
| **berkeleygraphics.com** (my add) | Fixed-width austerity as brand: engineering-document density, everything labeled, zero decoration — and it reads as supreme confidence. Transfer (Concept A): spec-sheet layout patterns; density done with discipline reads senior, not cluttered. |
| **henryheffernan.com** (my add) | Total commitment to an OS metaphor — and the reason it works is the escape hatch (you can always just *see the content*). Transfer (Concept C): novelty must never hold content hostage. |

---

## Concept A — CONTROL ROOM

**Thesis:** the portfolio is itself a monitored system — an operator's console
where the projects are processes and the visitor is reading live instrumentation.
The site doesn't *say* "control systems engineer"; it *is* a control surface.

- **Type pairing:** IBM Plex Mono (display AND data — pushed to poster sizes
  for headings, which is where the personality lives) + IBM Plex Sans (body).
  One superfamily, designed together, self-hostable. Mono-at-160px reads
  instrument, not IDE.
- **Color strategy:** dark-primary. Graphite near-black base (cool, not v1's
  warm off-black), a single **signal amber** (#FFB000 territory — deliberately
  not phosphor-green, which is hacker costume) for live values, links, focus.
  Honest status semantics (ok/warn/fail hues) used only where status is real.
  Light mode = "daylight ops": paper-white print of the same console, ink
  lines, same amber.
- **Layout philosophy:** labeled panels on a strict grid. Every region carries
  a machine tag (`PROC/01 — NEURO-ADAPTIVE GAME`, `SYS/UPTIME`). Density is
  the aesthetic — recruiter scan is served by the labeling itself (everything
  is captioned, nothing needs discovering).
- **Signature interaction:** **live telemetry.** A persistent readout strip —
  Depok local time, last GitHub commit, scroll position rendered as a process
  variable — plus the flagship: an interactive feedback-loop widget inside the
  BCI case study (set a setpoint, watch the loop respond). Claims become
  instruments.
- **Who this alienates:** anyone wanting warmth or whimsy — it is cold by
  design. The terminal-adjacent genre is crowded; executed at 90% it reads
  costume, so it demands the rauno-grade detail budget. Density can slow a
  skimmer who expects a conventional hero.

## Concept B — KINETIC POSTER

**Thesis:** every screen is a poster and scroll is the projector — the site is
a sequence of full-bleed typographic posters where motion, not decoration,
carries the personality.

- **Type pairing:** Archivo Variable as the only display voice, pushed across
  its width/weight axes (Expanded-Black at poster scale down to regular text)
  + IBM Plex Mono strictly for small data (dates, stacks). One family
  stretched to extremes IS the identity.
- **Color strategy:** flat and fearless: paper white, ink black, one electric
  cobalt (#2B32FF territory). No grays, no gradients, no shadows — color
  blocks with hard edges. Dark mode inverts ink and paper, cobalt stays.
- **Layout philosophy:** full-bleed horizontal bands, one idea per band. Type
  is the image — headlines crop off-canvas deliberately, project titles are
  set at viewport-filling scale. Photography/screenshots appear as flat
  blocks, never floating cards.
- **Signature interaction:** **scroll-driven type.** Headline weight/width
  interpolate with scroll via `animation-timeline: scroll()` on the variable
  axes — near-zero JS — plus View Transitions shared-element morphs: the
  giant title on `/work` IS the title of the case study you land on.
- **Who this alienates:** conservative recruiters (reads design-studio before
  engineer); readers on small screens get less payoff (poster scale needs
  room); anyone who finds kinetic type exhausting. Risk: without the
  engineering-flavored data layer it becomes a design-student site — the mono
  data voice is the counterweight, not garnish.

## Concept C — WORKBENCH OS

**Thesis:** the portfolio as a tiny operating system — projects are apps in
windows, the CV is a file on the desktop, and the visitor plays with a
machine Fatih built.

- **Type pairing:** Geist Sans for window content and UI + Silkscreen (bitmap)
  for chrome only — titlebars, dock labels, menu bar. The pixel voice is
  chrome-only; content stays crisply readable.
- **Color strategy:** monochrome desktop chrome over a designed wallpaper;
  the **accent is user-selectable** (a working Settings app with 4–5 accent
  choices, persisted) — theming as a feature demo instead of a toggle.
- **Layout philosophy:** spatial, not scrolled. Desktop with icons + dock on
  wide screens; each project opens as a draggable, resizable window. Mobile
  gets a honest "phone OS" reduction: full-screen apps, a dock sheet.
- **Signature interaction:** the OS itself — window management, a Spotlight-style
  ⌘K, a working `terminal` app (`ls projects`, `open neuro-game`, `cat cv`).
  **Mandatory escape hatch:** a "list view" (plain document mode) one click
  away, which is also the reduced-motion, no-JS, and crawler experience.
- **Who this alienates:** the 30-second recruiter unless the escape hatch is
  genuinely first-class; screen-reader users if window management is sloppy
  (the a11y budget here is the biggest of the three); and me-in-Phase-8 —
  this is roughly 2× the build cost of A or B. Highest memorability, highest
  risk of the toy overshadowing the work.

---

## My recommendation

**A — Control Room**, because it's the only one where the aesthetic *argues
the positioning*: a control-systems engineer whose site is a control surface
is a closed loop of its own. B is the strongest pure-craft direction and
hybridizes into A (scroll-driven type works on a console too). C is the most
memorable and the most expensive; choose it only if you accept the build cost.

⛔ GATE — Fatih picks one (or directs a hybrid).
