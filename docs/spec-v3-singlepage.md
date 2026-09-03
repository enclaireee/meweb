# v3 — Single page, expandable work, signal hero

Supersedes the **layout** direction of `docs/design-spec.md` (§2 layout, §4.4 the
orchestrated moment). Everything else in that document still governs: the token
system (§1), the depth model (§3), the easing set and duration bands (§4.1–4.2,
§13.1), the contact rules, the footer, and the performance budgets.

Written from 11 interview batches / 44 answered questions. Every decision below
traces to one of them; where I decided something myself it is marked **[mine]**.

---

## 0. What this page is for

| | |
|---|---|
| **Audience** | Internship and entry-level recruiters, Indonesian tech and engineering companies. They scan fast and have the CV open in another tab. |
| **30-second goal** | They scroll the whole page. Scroll is the primary experience; expand is depth, not discovery. |
| **The one memory** | "Hardware and software, same person." |
| **Failure modes named by the client** | Looking like a template; looking AI-generated. |

That third row is a design constraint, not a vibe. §9 audits the spec against a
researched list of AI-generation tells.

---

## 1. Tokens

### 1.1 Two themes, one light source

Dark is canonical; light is a faithful translation. `prefers-color-scheme`
decides, a toggle overrides, choice persists in `localStorage`.

The depth model does **not** invert mechanically. A lit top edge is invisible on
white; a shadow is invisible on `#0F0D0C`. So the *light source stays overhead
in both themes* and only the visible cue changes:

```
DARK                              LIGHT
┌──────────────┐ ← lighter edge   ┌──────────────┐ ← no visible edge
│    card      │   (lit)          │    card      │
└──────────────┘ ← darker edge    └──────────────┘
                                    ░░░░░░░░░░░░   ← soft shadow below
  depth = edge lighting              depth = cast shadow
```

| Role | Dark (existing) | Light (new) |
|---|---|---|
| `--surface-sunk` | `#0c0b0a` | `#e8e3db` |
| `--surface-base` | `#141211` | `#f5f1ea` |
| `--surface-raised` | `#1b1917` | `#fffdf9` |
| `--surface-lifted` | `#232120` | `#ffffff` |
| `--ink` | `#f2ede6` | `#171512` |
| `--ink-muted` | `#a29a90` | `#5c554c` |
| `--ink-faint` | `#918a80` | `#6f675d` |
| `--accent` | `#ff5c33` | `#d9401a` (darkened for AA on light ground) |

Every light value is provisional until contrast-checked; the build slice
verifies 4.5:1 on all four surfaces, the same audit that fixed `--ink-faint`
in v1. Raised surfaces in light mode carry `box-shadow` and **no** light edge;
the sunk field becomes a tint with an inset top shadow.

### 1.2 Type — one family, width axis activated

Archivo throughout. The thesis line uses Archivo's **width axis**, which the v1
spec specced and never applied. Contrast comes from width and scale, not from a
second typeface — no second font request, no new licence.

**Known risk, on the record:** v1 dropped the width axis because shipping the
extra variable axis measurably cost LCP on the headline, which is the LCP
element. This slice re-measures before and after. If it costs more than 0.1s,
the width axis is cut and the thesis line falls back to weight and scale alone.

Scale, spacing, radius and shadow scales are unchanged from `design-spec.md` §1.

---

## 2. Page architecture

```
┌────────────────────────────────────────────────────┐
│ Fatih Zamzami          Work  About  Experience  ●  │ ← sticky, scroll-spy
├────────────────────────────────────────────────────┤
│                                                    │
│   ──╱╲────╱╲╱╲──────╱╲──────────  ← live trace     │  1 HERO
│                                                    │    base surface
│   Hi, I'm                                          │
│   Fatih.                       [superseded by v4]  │
│                                                    │
│   Electrical engineering at UI.   Currently        │
│   Lately that has meant…          Head of R&D      │
│                                                    │
├════════════════════════════════════════════════════┤ ← ground change
│  Work                                              │  2 WORK
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │    sunk field
│  │  image   │ │  image   │ │  image   │            │
│  │ Refocus  │ │ OT Lab   │ │ NEST UI  │            │    featured 3
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                    │
│  01  Refocus              BCI · 2025            →  │    full index
│      Signal pipeline + game integration            │    every project
│  02  OT Observability Lab SCADA · 2026          →  │
│      Simulator + asset health model                │
│  03  KOMAT UNPAR 2025     Full-stack web · 2025 →  │
│  …                                                 │
├════════════════════════════════════════════════════┤
│  About        ┌────────┐  I'm an electrical…       │  3 ABOUT
│               │portrait│  …                        │    base surface
│               └────────┘                           │
├════════════════════════════════════════════════════┤
│  Experience                                        │  4 EXPERIENCE
│  Jan 2026 – now   Head of Research & Development   │    sunk field
│  Depok            Ikatan Mahasiswa Elektro FTUI    │    8 entries,
│                   Running an 11-person…            │    reverse-chron
│  ───────────────────────────────────────────────   │
├════════════════════════════════════════════════════┤
│  What I work with                                  │  5 SKILLS
│  Software     TypeScript — Every Next.js build…    │    base surface
│               KOMAT UNPAR · NEST UI                │
├════════════════════════════════════════════════════┤
│  EDUCATION      AWARDS            LANGUAGES        │  6 CREDENTIALS
│  S1 EE, UI      Best BPH · 2026   Bahasa Indonesia │    one low band
├════════════════════════════════════════════════════┤
│  Say hello.                WhatsApp   Copy         │  7 CONTACT
│  muhfatihzamzami@…         LINE       Copy         │    sunk field
│                            GitHub     Copy         │    (existing footer)
└────────────────────────────────────────────────────┘
```

**Rhythm:** continuous flow. Sections are as tall as their content; separation
is a change of ground (`--surface-base` ↔ `field-sunk`), which is the system
already built. No scroll-snap, no forced viewport heights, no section entrance
animations.

**Wayfinding:** sticky header, four anchors (Work / About / Experience /
Contact), scroll-spy via one `IntersectionObserver` on the section elements.
`aria-current="location"` on the active link. Skills and credentials are
reachable by scroll and by the Experience anchor being adjacent — **[mine]**:
four items stay on one line at 412px, five wrap.

---

## 3. The hero

### 3.1 What it is

The thesis line over a **live signal trace**: a 2D canvas plotting real input —
cursor velocity and scroll velocity, sampled and drawn. Move fast, amplitude
rises. Stop, it decays to a baseline. The page measures something and reacts to
it; the thesis is executed, not illustrated.

No photograph. No intro sequence. Single hairline in `--ink` at ~25% opacity,
1px. Vermilion is not used here — the spec allows the accent three appearances
and the trace is not one of them.

### 3.2 Beat by beat

| Beat | When | What |
|---|---|---|
| **0 — paint** | first paint, no JS | `<h1>` thesis line, support paragraph, current role. Full contrast, final position. **This is the LCP element and nothing gates it.** |
| **1 — arrival** | canvas mounts (after paint) | The trace draws in from left to right across ~700ms at a flat baseline. `--ease-narrative`. No type movement. |
| **2 — idle** | continuous | Baseline breathes: amplitude ~2px, period ~4s. Enough to read as live, not enough to distract. |
| **3 — response** | pointermove / scroll | Sampled velocity drives amplitude, spring-smoothed (stiffness 120, damping 30 — the existing `SCROLL_SPRING`). Decays back to idle over ~1.2s. |
| **4 — exit** | hero leaves viewport | `IntersectionObserver` unobserves and the rAF loop **stops**. Zero cost for the rest of the page. |

### 3.3 Fallbacks — each a defined state, not an absence

| Condition | State |
|---|---|
| `prefers-reduced-motion` | One frozen trace, rendered once, no rAF loop, no listeners. Looks deliberate — it is a plotted line. |
| No JS | No canvas. Type only, at full contrast. The hero still reads as designed. |
| Mobile (<768px) | Scroll-velocity only (no cursor exists), half sample rate, capped DPR at 2. |
| Low power / `saveData` | Idle breathing disabled; responds to input only. **[mine]** |
| Tab hidden | rAF paused on `visibilitychange`. |

### 3.4 Cost

~2 kB of hand-written 2D canvas. **No new dependency.** No assets. The canvas is
`aria-hidden`, positioned behind the type, and never affects layout — CLS
contribution is structurally zero.

---

## 4. The expand interaction

### 4.1 Mechanism

**Next.js intercepting route + `layoutId` shared element.**

```
state          URL                what renders
─────────────────────────────────────────────────────────────
closed         /                  page, work index
click card  →  /work/refocus      page + overlay, card morphs in
back / Esc  →  /                  overlay morphs back to card
paste URL   →  /work/refocus      full standalone page, no overlay
crawler     →  /work/refocus      full standalone page, indexed
```

`app/@modal/(.)work/[slug]/page.tsx` intercepts the click; `app/work/[slug]/page.tsx`
serves the cold load. Both read the same MDX. Nothing about the existing case
studies changes — figures, code blocks and the Refocus `FeedbackLoop` widget all
keep working.

**Risk, stated up front:** `layoutId` across a route boundary requires the card
and the overlay to live in the same `AnimatePresence` tree. With parallel routes
both are children of the same layout, so this works — but it is the fiddliest
part of this build and I expect to spend real time on it. If it cannot be made
reliable, the fallback is an opacity+scale transition on the overlay with the
card staying put, and I will tell you rather than ship a janky morph.

### 4.2 Requirements checklist (§4 of the brief)

| Requirement | How |
|---|---|
| Addressable | Real route `/work/<slug>`, not a query param |
| Back closes | Native history — `router.back()`, no `popstate` wiring |
| Escape closes | `onKeyDown` on the dialog |
| Scroll restored exactly | Next preserves scroll on `back()`; verified in Phase 4 |
| Focus returns to the card | `data-project-card={slug}` refocused on close |
| Dialog semantics | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → project title, focus trap |
| Background locked, no shift | `overflow:hidden` + `scrollbar-gutter: stable` on `html` |
| One at a time | The route *is* the state; a second slug replaces the first |
| Code-split | Overlay content is a route segment — split by the framework, not by hand |
| Works without JS | Cold load renders the full page. Index rows are real `<a href>` |
| Reduced motion | Instant state change; overlay appears at final position, never `opacity: 0` |

### 4.3 Behind the overlay

Page dims to 60% and locks. Still visible — you can see you are on his site.
Overlay scrolls internally.

---

## 5. The work list

**Dual register.** Two visual languages so it never reads as a wall of identical
cards — which is both a density fix and an anti-AI-tell measure (§9).

```
FEATURED — 3, one per domain, large, image-led
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   image     │ │   image     │ │   image     │
│  Refocus    │ │  OT Lab     │ │  NEST UI    │
│  BCI · 2025 │ │ SCADA ·2026 │ │  Web · 2026 │
└─────────────┘ └─────────────┘ └─────────────┘

ALL WORK — every project, compact, type-led
01  Refocus                                        →
    Brain–computer interface · 2025
    Signal pipeline + game integration
────────────────────────────────────────────────────
02  OT Observability Lab                           →
    SCADA / OT monitoring · 2026
    Simulator + asset health model
```

**Row anatomy:** number (derived from position, not stored), title, domain · year,
role. All five fields already exist in the schema.

**Scaling.** Featured is capped at 3 by the component; the index is unbounded.
At 3 projects the featured tier is the whole list and the index is redundant —
**[mine]**: below 4 projects the index hides. At 30 it still reads as an index,
because a row is three lines. **Where it breaks: ~40 rows**, where scanning
without grouping or filtering gets hard. Filters land at ~15 projects (§6),
not now — a filter UI over six rows advertises a problem you don't have.

**Empty states.** No visible projects → the section is omitted entirely, not
left as an empty heading. **[mine]**

---

## 6. Motion system

No new curves, no new bands. From `design-spec.md` §4.1 and §13.1:
`--ease-out` `cubic-bezier(.16,1,.3,1)`, `--ease-narrative` `cubic-bezier(.33,0,.15,1)`,
`SCROLL_SPRING`; bands `--dur-micro` 160ms, `--dur-standard` 320ms,
`--dur-narrative` 520ms.

**Two orchestrated moments only.** The hero trace, and the card → case study
morph. Everything else is hover and focus feedback.

| Interaction | Trigger | Properties | Band / easing | Communicates |
|---|---|---|---|---|
| Hero trace | pointermove, scroll | canvas repaint (no DOM) | spring, no duration | The page is measuring you |
| Card → detail | click | `layoutId` morph, transform + opacity | narrative / `--ease-narrative` | The card became the page |
| Detail → card | back / Esc | reverse of above | narrative | You are where you were |
| Index row hover | pointer enter | `color`, arrow `translateX 0→3px` | micro / `--ease-out` | This row is a door |
| Featured card hover | pointer enter | ground, edges, shadow L1→L2 | micro / `--ease-out` | Existing elevation grammar |
| Nav scroll-spy | scroll | `color` on active link | micro / `--ease-out` | Where you are |
| Copy confirmation | click | label swap, width reserved | standard | The clipboard took it |
| Theme toggle | click | `color`/`background` on tokens | standard / `--ease-out` | — |
| Section entrances | — | **none** | — | — |

No staggered reveals anywhere. That decision stands from §13.3.

---

## 7. Schema and data changes

Small — the data layer built in the previous phase already carries almost
everything.

| Change | Where | Why |
|---|---|---|
| `site.nav` becomes anchors | `content/meta/site.ts` | `/#work`, `/#about`, `/#experience`, `/#contact` |
| `site.sections` added | `content/meta/site.ts` | id + label per section, so scroll-spy and nav derive from one list |
| Light-theme tokens | `globals.css` | §1.1 |
| `cover` set on 3 projects | `content/projects/*.mdx` | Real screenshots of KOMAT, NEST UI, Dyvia |
| NEST UI + Dyvia bodies | `content/projects/*.mdx` | Written from Batch K answers |
| **No new fields** | — | Index rows use `order`, `title`, `domain`, `year`, `role` — all present |

Adding a project is still one `.mdx` file. `featured: true` puts it in the top
tier; the index picks it up either way.

**Deleted:** `src/components/motion/Handoff.tsx` (186 lines), `/work` and
`/about` page routes → 301 to `/#work` and `/#about`.

---

## 8. Restraint pass

**The one bold element: the hero signal trace.** It is the arrival moment, it is
the thesis made literal, and it is the only thing on the page that moves without
being asked to.

Everything else is quiet, and here is the check: the work index is type on a
ruled ground; the timeline is dates and text; skills are a definition list;
credentials are three columns of small type; the footer is the existing one. The
accent appears three times per screen, maximum, and not in the hero. No section
animates on entry. No gradients, no glows, no glass.

**Three things cut:**

1. **Filtering and sorting.** Six projects. Revisit at fifteen.
2. **The layered-plane hero handoff** — 186 lines of tuned scroll code, and the
   photograph it depended on. Superseded.
3. **Expand on experience and skills.** One expandable thing on the page, so the
   interaction means one thing.

---

## 9. Anti-generic pass

Checked against a researched list of AI-generation tells (Developers Digest's 16
patterns; 925studios' signal guide).

| Tell | Status |
|---|---|
| Inter / Space Grotesk / Geist / Instrument Serif | Clear — Archivo, one family, width axis |
| Purple-blue gradients, coloured glows | Clear — none in the palette |
| Uniform 16px radius, uniform 24px padding | Clear — 2/4/8px tied to surface size |
| All-caps eyebrow labels | Clear — removed in v1 |
| Centred hero, badge above H1 | Clear — left-aligned, no badge |
| Vague aspirational headline | Clear — the thesis line is specific and odd |
| Uniform fade-in-up on every section | Clear — no section entrances at all |
| Barely-passing dark body contrast | Clear — a11y 100, re-verified for light |
| **Permanent dark mode** | **Fixed this revision** — light theme added |
| **Identical feature cards in a grid** | **Fixed by design** — dual register, two visual languages |
| Stat banner rows | **Live risk** — the `<Metrics>` MDX component is this shape. Kept, because the numbers in it are real and specific; revisit if it starts reading as decoration |
| Stock / placeholder imagery | **Live risk** — 3 of 6 covers stay placeholders until the hardware is photographed. Real screenshots ship for the other 3; no stock, no generated images, ever |

**What changed because of this pass:** light mode (was going to be dark-only),
and the featured tier stopped being "four identical cards" and became two
registers.

---

## 10. Build order

Each slice leaves the site deployable.

1. Light theme tokens + toggle — verify AA on both themes
2. Page shell: single-page composition, sticky nav, scroll-spy, 301s
3. Work list: featured tier + index, collapsed state only
4. Expand: intercepting route, `layoutId`, focus/scroll/a11y
5. Remaining sections: about, timeline, skills, credentials
6. Hero: canvas trace + all five fallback states
7. Footer integration + `#contact`
8. Motion polish, then Phase 4 verification

Performance gate on every slice: **LCP no worse than 2.6s, CLS stays 0.**

---

## 11. Build log

### Slice 1 — light theme + toggle ✅

Shipped. Deviations from §1.1 as specced, and why:

- **`--ink-faint` and `--accent` both failed AA as drafted.** Measured, not
  eyeballed: faint `#6f675d` scored **4.36** on the sunk field and the accent
  `#d9401a` scored **3.97** on base. Corrected to `#6b6359` (4.63 on sunk, the
  tightest surface in this theme) and `#b82f0c` (4.77 on sunk, 5.41 on base).
  `--accent-ink` flipped to near-white — near-black on the darkened accent is
  3.19 and fails.
- **One selector, not two.** The spec implied a `@media (prefers-color-scheme)`
  block *and* a `[data-theme]` block. That states the palette twice and lets the
  copies drift, so instead an inline script in `<head>` resolves stored choice ??
  system preference before first paint and stamps `data-theme`. **Consequence,
  accepted:** with JavaScript off the visitor gets dark regardless of their
  system preference. Dark is canonical, so that path is a design, not a break.
- **Two hardcoded values became tokens because light mode exposed them.**
  `Frame`'s "image pending" ground was a literal `#2a2724` and rendered as a
  black slab on cream; it is now `--surface-placeholder`. Film grain at 3%
  overlay reads as dirt on a near-white ground; it is now `--grain-opacity`
  (0.03 dark / 0.018 light).
- **The recess and the elevation utilities were re-lit, not rewritten.**
  `field-sunk`'s lips moved into `--lip-top` / `--lip-bottom` and
  `surface-lift`'s bottom border into `--edge-dark-strong`, so one set of
  utilities serves both themes. In light mode the lit edges resolve to
  `transparent` and depth comes from `--shadow-rest` / `--shadow-lift`.

**Verification method, for repeating it:** headless Chrome ignores
`--force-prefers-color-scheme` (not a real flag) and the inline resolver
overwrites a hand-set `data-theme`, so a light-mode screenshot requires
stripping the resolver from a copy of the built HTML and rewriting `/_next/`
asset paths to absolute. The script is in the scratchpad; the short version is
that you cannot screenshot this theme by asking Chrome nicely.

### Slice 2 — page shell + wayfinding ✅

The site is now one page plus the case studies. Route table: `/` and
`/work/[slug]`. Nothing else.

- **`/work` and `/about` are gone as routes** and redirect to `/#work` and
  `/#about`. Note: Next emits **308**, not 301, for `permanent: true` — both are
  permanent and both pass link equity; 308 additionally preserves the request
  method. The spec said 301; the reality is 308 and that is fine.
- **`site.sections` is now the single list** driving the header nav, the
  scroll-spy and the footer nav. Adding a section to that array adds it to all
  three. `site.nav` is gone.
- **The sitemap stopped advertising redirects** — it listed `/work` and
  `/about`, which now 308. It lists the page and the six case studies.
- **Scroll-spy** is one `IntersectionObserver` with a `-45% / -50%` root margin
  (a band across the reader's eyeline) and resolves ties in document order, so
  scrolling up and scrolling down agree on the active section.
- **The nav ground is opaque, not blurred.** Frosted glass is a named
  AI-generation tell and this design's depth model is opaque planes.
- **Deleted:** `src/components/motion/Handoff.tsx` (186 lines), the hero
  photograph and its parallax handoff, `src/app/about/page.tsx`,
  `src/app/work/page.tsx`.

**Not verified by observation:** the scroll-spy's active state. Headless Chrome
returns a blank frame for fragment-anchored screenshots (three attempts), so the
observer is verified by reading it, not by watching it. Confirm in a real
browser.

**Known transitional ugliness:** the work section is still the old wide-strip
layout, so each row has ~200px of dead space between the summary and its meta
row. Slice 3 replaces it with the dual register and that space goes.

### Slice 3 — the work list ✅

Dual register shipped: three featured cards over a numbered index of all six.

- **NEST UI and Dyvia now have case studies**, written from the Batch K answers
  and nothing else. NEST UI's is about permissions (who can see which team's
  submission) because that is what you said the hard part was, and it says
  plainly that nothing broke on launch rather than manufacturing a crisis.
  Dyvia's is short on purpose — "some client work is a puzzle; this one was a
  delivery" — because inventing complexity there would be inventing content.
  The only figure published is "more than fifty teams", which is true anywhere
  inside the 50–150 bracket you picked. No invented precision.
- **Featured is now Refocus / OT Lab / NEST UI** — one per domain, so the
  hardware-and-software range is visible in the first screen of work.
- **`order` collisions now fail the build.** Setting the featured trio put two
  projects at `order: 3`; `order` is both the editorial sequence and the index
  numbering, so a duplicate makes the numbering arbitrary and the sort unstable
  between builds. `getProjects()` throws and names both files.
- **The cap lives in the component, not the data** (`FEATURED_SLOTS = 3`), so
  promoting a project stays a one-word change in one `.mdx`.
- **The index hides below four projects** — at three it would just be the
  featured tier again.

**Known and accepted:** the featured trio also occupies index rows 01–03, so
those three titles appear twice within one screen. The "All work" label is doing
the work of explaining why, and an index that omitted the featured items would
not be an index. Same pattern as spragadheeshraj.com.

**A number worth knowing:** the page is now **12,447px tall on a 412px phone** —
roughly fifteen viewport heights. That is the cost of putting everything on one
page, and it is why the sticky nav with scroll-spy is load-bearing rather than
decorative.

### Slice 4 — the expand interaction ✅

Working, and **proven by driving a real browser** rather than by assertion. The
verification script (`cdp.mjs`, Chrome DevTools Protocol over Node's built-in
WebSocket) clicks a card, reads the DOM, presses Escape and checks the result.

| §4 requirement | Measured |
|---|---|
| Addressable | click → `/work/komat-unpar` |
| Dialog semantics | `role="dialog"` + `aria-modal="true"` present; `aria-labelledby` resolves to "KOMAT UNPAR 2025" |
| Background locked | `document.documentElement` overflow `hidden` while open, `visible` after |
| Page behind kept | `#work` still in the DOM while the overlay is open |
| Focus moves in | `activeElement` inside the dialog |
| Escape closes | URL back to `/`, dialog gone |
| **Scroll restored exactly** | 1490 → 1490 |
| **Focus returns to the card** | `activeElement` is `[data-project-card="komat-unpar"]` |
| Back button closes | `/work/nest-ui` → back → `/`, dialog gone |
| Cold load = full page | `/work/nest-ui` fetched directly: real `<h1>`, no dialog, 1,446 words of prose |
| Crawlable | the page carries real `<a href>` to all six projects and 3,766 words |

**`next-view-transitions` was silently breaking interception.** The first run of
the proof showed a real navigation instead of an overlay: the page unmounted and
scroll was lost. That library patches the router, and its patched navigation
never reaches the interception. Removing it fixed every failing row above at
once. It is now uninstalled — `layoutId` does the job it was there for, and
keeping a router-patching dependency next to a shared-element morph is asking
for exactly this class of bug.

**Two other corrections to the spec as written:**

- **`domMax`, not `domAnimation`.** The smaller feature bundle has no layout
  animations at all, so `layoutId` silently does nothing with it. About 10 kB
  more, and it is the price of the morph.
- **`Work` had to become a client component** to be the morph's source half. It
  therefore takes a narrow projection of `Project`, not `Project` — `body` holds
  the entire case study and shipping six of those to the client to render six
  card titles would be indefensible.

**Hand-rolled focus trap, not `<dialog>`.** Native `<dialog>` gives a trap and
Escape for free, but `showModal()` promotes the element to the top layer, which
fights a layout morph that needs to measure real positions. Twenty lines beat
the risk.

**Still unverified: the morph itself.** Every behaviour above is measured; how
the card-to-panel animation *looks* is not something a screenshot can show. That
needs your eyes in a real browser.

### Slice 6 — the hero signal trace ✅ (with a missed budget, attributed)

The trace is live: a 2D canvas plotting pointer velocity and scroll velocity
through a scrolling buffer. No dependency, no assets, ~150 lines.

**Verified over CDP:** canvas present and `aria-hidden`; DPR capped at 2
(1440×596 backing on a 1× display); 3,212 non-blank pixels drawn after a
pointer sweep; and under emulated `prefers-reduced-motion: reduce` the trace is
drawn **once** and is byte-identical 1.2s later — frozen, not blank.

**Two deviations from §3, both for composition:**

- **Baseline moved from 0.3 to 0.74** of the hero height. At 0.3 it ran through
  the headline's descenders; at 0.74 it sits in the empty band under the support
  paragraph and reads as an instrument baseline. It still spans the full width
  and still sits behind the type, just lower.
- **`pointer: coarse` skips the pointermove listener entirely** rather than
  registering one that can never fire.

**The performance gate was missed and here is the attribution, not an excuse.**

| Build | LCP | Weight |
|---|---|---|
| Old three-route site (§14) | 2.6 s | 281 KiB |
| v3 single page, **canvas removed** | 2.7–2.8 s | 297 KiB |
| v3 single page, canvas in | **2.8 s** | 298 KiB |

Three consecutive runs, not one. **The hero costs ~0.05s.** The 2.6 → 2.8 shift
is the single-page architecture itself: one document now carries 3,766 words,
12,447px of height and the hydration that comes with it. CLS is still 0 and
accessibility is still 100.

**Two fixes were tried and both are recorded because both failed:**

1. *Shrinking the client boundary.* Slice 4 had made all of `Work` a client
   component for one `layoutId`. Replaced with `MorphCard`, a wrapper around
   just the card box, so the index markup went back to the server. Correct
   change on its own merits — **no LCP improvement.**
2. *Lazy-loading motion's features.* `LazyMotion` with a dynamic import instead
   of static `domMax`. **Measured worse**: LCP 2.8 → 2.9s, weight 298 → 333 KiB,
   because the split chunk gets fetched anyway and costs an extra request.
   Reverted, and the code now says why so nobody retries it.

**The remaining lever is architectural, and it is yours to pull.** Motion sits
on the home page's critical path only because the featured cards must be
registered as morph sources before a click. Dropping the shared-element morph
for a plain overlay transition would take motion off the home page entirely —
but §4 of your brief names shared-element as non-negotiable, so I am not making
that trade unilaterally.

### Slices 7–8 — footer integration + motion polish ✅

Footer needed almost nothing: it already carried `id="contact"` and read
`site.sections`. Two additions:

- **Theme change is a transition, not a jump cut** — `--dur-standard` on the
  body's colours. Surfaces transition at the micro band via `surface-rest`, so
  the grounds arrive slightly ahead of the page. Deliberate, not drift.
- **The overlay animates out.** `AnimatePresence` now sits above the modal slot
  inside the motion provider, so closing reverses the morph instead of the
  overlay vanishing. Verified that the whole §4 contract still passes with it in
  place — scroll 1490 → 1490, focus back on the card.

---

## 12. Phase 4 — verification

### 12.1 Data proof ✅

One dummy project, skill and experience added; **zero component changes**.

- Dummy experience took over the hero's "Currently" block (newest, no end date)
- Dummy project appeared in the index, got its own route (200), and **expanded**
  with the dialog labelled "Dummy Project ZZPROOF"
- Dummy skill rendered with a working link to the dummy project
- Degradation held: no Links block, placeholder named `public/work/zz-proof/cover.jpg`
- All removed; `grep ZZPROOF content/` is clean

### 12.2 Expand proof ✅

Measured over CDP — see slice 4. Addressable, back and Escape close, scroll
restored exactly (1490 → 1490), focus returned to the originating card, cold
load renders the standalone page, page fully crawlable.

### 12.3 Scale proof ✅ — and a corrected breaking point

Duplicated to **31 projects**. All 31 reachable from the page. Mobile height
12,447 → 15,780px (~133px per extra row). The index still reads as an index:
consistent rows, numbering intact, and rows with no `role` leave the column
empty without changing row shape.

**I was wrong about where it breaks.** The spec said ~40 rows. Looking at 31, it
stays *tidy* well past that but stops being *usable* around **20–25**: there is
no way to find "the SCADA ones" without reading every row. The limit is
findability, not layout. Filtering should arrive at ~15–20, earlier than the
spec's ~15 guess implied and for a different reason.

### 12.4 Degradation ✅

| Condition | Result |
|---|---|
| `prefers-reduced-motion` | Trace drawn once, byte-identical 1.2s later. Frozen, not blank. `layoutId` dropped so the overlay is an instant state change |
| **JavaScript disabled** | Whole page renders: every section, all six projects, real `<a href>`. No canvas. Dark theme (canonical) |
| Cold load of a case URL | Full standalone page, real `<h1>`, 1,446 words |
| Simulated 4G + 4× CPU | Lighthouse mobile preset — the numbers in §12.6 |
| `saveData` | Idle breathing disabled, input response retained |
| Tab hidden / hero off screen | rAF stops entirely |

### 12.5 Keyboard-only pass ✅

Tab order: skip link → wordmark → 4 nav anchors → theme toggle → 3 featured
cards → index rows, in document order. Focus ring visible throughout.

**Enter opens the expand. Focus moves inside. Tab stays trapped. Escape closes
and returns focus to the exact card.** All measured, not assumed.

One real defect found and fixed: the Frame placeholder's author notes were
leaking into every card link's accessible name — it read "Image pending,
public/work/…" before reaching the project title. `aria-hidden` on the two
author-facing lines; the alt text stays exposed. Confirmed against the
accessibility tree, which now reports the cover description followed by the
title.

### 12.6 Measured actuals

| | Perf | A11y | Best pr. | SEO | LCP | CLS | TBT | Weight |
|---|---|---|---|---|---|---|---|---|
| `/` | 96 | **100** | 96 | 100 | 2.8 s | **0** | 0 ms | 300 KiB |
| `/work/neuro-adaptive-game` | 97 | **100** | 96 | 100 | 2.6 s | **0** | 0 ms | 290 KiB |

**Scroll framerate, finally measured** (CDP `synthesizeScrollGesture`, rAF
timestamps, hero on screen with the canvas running):

| | Median | p95 | Frames over 20ms |
|---|---|---|---|
| 1× CPU | **59.9 fps** (16.7ms) | 16.7ms | **0 of 282** |
| 4× CPU throttle | **59.9 fps** (16.7ms) | — | **0 of 300** |

This item was "unverified" from v1 through §14. It is now measured, and the
canvas holds 60fps even under 4× throttle. **LCP remains 0.2s over budget** —
attributed in slice 6 to the single-page architecture, not the hero.

### 12.7 Three weakest moments, fixed

1. **The hero read as empty until you moved the mouse.** The trace idled at 2px,
   which is invisible, so the page's one bold element did nothing on arrival.
   Idle amplitude to 5px and the hero's bottom padding tightened.
2. **The About portrait placeholder was the largest empty rectangle on the
   page** — a 4:5 "image pending" block where a face should be. The section now
   renders prose-only at a wider measure until `profile.portrait` is set, and
   the two-column layout returns automatically when it is.
3. **The index's role column sat at the far right on wide screens**, so the eye
   travelled the width of the page from title to role. Columns capped at 24rem
   and 26rem so the two sit together.

### 12.8 One defect the maintenance review found

**Focus returned to the wrong element.** `data-project-card` was on the featured
cards and on unfeatured index rows only, and the overlay found its focus target
by querying the slug. Click index row 01 (a featured project), close, and focus
landed on the card higher up the page rather than the row you clicked.

Fixed by capturing whatever project link was focused when the overlay mounted,
before moving focus into it, with the slug query as the cold-load fallback. The
first attempt regressed the automated proof — a programmatic `.click()` does not
focus an anchor, so `activeElement` was `<body>` and the overlay dutifully
focused that. The check now requires the element to carry `data-project-card`.
Both paths verified: real keyboard focus returns to the exact row; a synthetic
click falls back to the project's link.

### 12.9 The verification scripts are now in the repo

`scripts/verify-expand.mjs` and `scripts/verify-a11y-and-fps.mjs`. They drive
Chrome over the DevTools Protocol using Node's built-in WebSocket — no
dependency, nothing to install.

```
npm run build && npx next start -p 3211 &
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --remote-debugging-port=9222 --user-data-dir=/tmp/cdp about:blank &
node scripts/verify-expand.mjs
node scripts/verify-a11y-and-fps.mjs
```

They exist because the expand contract has no type safety behind it: rename a
route folder and interception stops silently, with a full navigation and no
error. These scripts are what catch that.

---

## 13. What will be hard to maintain

Ordered by how likely it is to bite you.

### 13.1 The intercepting route has no type safety — highest risk

Four files have to agree, and nothing checks them: `app/@modal/default.tsx`,
`app/@modal/(.)work/[slug]/page.tsx`, `app/work/[slug]/page.tsx`, and
`MorphCard`'s `layoutId`. Rename the `work` folder and the overlay silently
stops intercepting — you get a full page navigation, no error, no failed build.
**Mitigation:** `scripts/verify-expand.mjs`. Run it after touching anything in
`app/`. **To simplify:** drop interception, make the overlay a `?project=` query
param on one route. You lose the free back-button and scroll restore, and you
would have to hand-roll both.

### 13.2 Router-patching dependencies are now a hazard

`next-view-transitions` broke interception silently and cost an hour to find.
Anything that wraps or patches the Next router — smooth-scroll libraries,
page-transition libraries, most "add animations to Next" packages — can do the
same. **Mitigation:** run the proof script after adding any navigation-adjacent
dependency.

### 13.3 Two theme palettes, one design

Every colour decision now exists twice, and the light values were wrong on the
first attempt (two failed AA). **Mitigation:** the contrast script pattern in the
slice 1 log; re-run it whenever a colour changes. **To simplify:** drop light
mode. It is the single largest source of ongoing double-work here.

### 13.4 Two spec documents

`design-spec.md` governs tokens, depth and motion; `spec-v3-singlepage.md`
governs layout and supersedes parts of the first. That split is honest but it
means two places to look. **To simplify:** fold §1–4 of the old spec into the v3
document and delete the rest once the v3 build settles.

### 13.5 Things that are genuinely easy now

- Adding a project is one `.mdx` file. Featuring it is one word. Duplicate
  `order` fails the build with both filenames.
- Adding a section is one entry in `site.sections` — nav, scroll-spy and footer
  nav all follow.
- Adding a contact channel is one object; the icon map is exhaustive by
  `satisfies`, so a new icon key fails the build rather than rendering a hole.
- Every optional field degrades to omission, proven with dummy entries.
- Skill → project links are validated at build time against real files.
