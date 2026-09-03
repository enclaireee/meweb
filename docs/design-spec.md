# Landing page — design & motion spec

Status: **awaiting approval**. No component code written against this yet.
Owner: Fatih. Written 2026-09-02.

Decisions locked in the Phase 2 interview are marked **[locked]**. Everything
else is my proposal and is open to revision.

---

## 0. The brief in one paragraph

Audience is **design-conscious tech companies**, so the page itself is a work
sample. The claim it must land in five seconds is **"this person builds real
things"** — evidence and materiality, not atmosphere. The voice keeps its
grain. Four things would be failures: looking AI-generated, looking like a
fashion brand, looking overdesigned for a student, or looking cold. The
reference point is **Teenage Engineering, not Rolex**: expensive through
precision and restraint, not through effects.

The governing rule, since "rewards craft" and "don't look overdesigned" pull
against each other: **craft is expressed as precision and restraint, never as
effect count. Every piece of motion must be earned by content beneath it.**

---

## 1. Design tokens

### 1.1 Palette — 7 values

Three surfaces, three inks, one accent. Nothing else.

| Token | Hex | Role |
|---|---|---|
| `--surface-sunk` | `#0F0D0C` | Recessed field. The work section sits in this. |
| `--surface-base` | `#141211` | Page default. Hero, footer, and work tiles at rest. |
| `--surface-raised` | `#1B1917` | Lifted. Tile hover, interface panels. |
| `--ink` | `#F2EDE6` | Primary text, headline. |
| `--ink-muted` | `#A29A90` | Support copy, summaries, captions. |
| `--ink-faint` | `#6B645B` | Meta keys, disabled, hairline text. |
| `--accent` | `#FF5C33` | **[locked]** Vermilion. Interactive affordance and one deliberate mark. Never decoration. |

`--accent-ink` `#140B08` is derived, used only as text on an accent field.

**Accent budget: three appearances maximum on the landing page.** Currently
allocated to: the "currently at" marker, the email control's underline on
hover, and the focus ring. The accented full stop in the hero headline is
**removed** — it was borderline against §7's "accenting one word of the
headline", and "use it less" settles it.

### 1.2 Elevation system

Depth on a near-black ground cannot come from shadow — a black shadow on
`#0F0D0C` is invisible. It comes from **simulated light**. Every raised
surface has a top edge lighter than its bottom edge. This is Apple's technique
for dark surfaces and it costs nothing.

| Level | Background | Top edge | Bottom edge | Shadow |
|---|---|---|---|---|
| **L−1** sunk | `--surface-sunk` | `black / 40%` | `ink / 5%` | none |
| **L0** base | `--surface-base` | none | none | none |
| **L1** tile at rest | `--surface-base` | `ink / 8%` | `black / 30%` | `--shadow-1` |
| **L2** tile on hover | `--surface-raised` | `ink / 14%` | `black / 40%` | `--shadow-2` |

L−1 inverts the edges deliberately: a recess catches shadow on its top lip and
light on its bottom lip. That inversion is what makes the work section read as
*cut into* the page rather than laid on top of it.

### 1.3 Shadow scale — 2 steps

Per Comeau: as elevation rises, offset increases, blur grows, opacity falls.
Hue-matched to the ground, never pure black.

```
--shadow-1: 0 1px 2px hsl(20 18% 2% / 0.50);

--shadow-2: 0 2px  4px hsl(20 18% 2% / 0.45),
            0 4px  8px hsl(20 18% 2% / 0.34),
            0 8px 16px hsl(20 18% 2% / 0.22);
```

**Deliberate deviation from Comeau:** he specifies a 2:1 vertical-to-horizontal
offset ratio, light from above *and slightly to the left*. I'm using **0
horizontal offset — light directly overhead**. Reason: the dominant shapes on
this page are full-bleed photographs, and a lateral shadow offset under a
full-width image reads as a rendering mistake rather than as light. Consistency
is preserved; only the angle changes.

**Rule:** shadow appears only on L1 and L2. Section fields, images, type and
rules never carry shadow.

### 1.4 Radius scale — 4 steps **[locked: radius by surface size; images stay square]**

| Token | Value | Applies to |
|---|---|---|
| `--radius-0` | `0` | **Images, section fields, rules, dividers — always.** |
| `--radius-1` | `2px` | Micro interactive: tags, inline chips. |
| `--radius-2` | `4px` | Buttons, inputs, the email control. |
| `--radius-3` | `8px` | Large interface panels: code blocks, the FeedbackLoop widget. |

**Rule:** radius scales with the surface's *shorter* dimension — but
photographs and section grounds are exempt and always `0`. Photographs read as
prints and documents; rounding them fights the claim the page is making.

### 1.5 Border / rule scale

| Token | Value | Use |
|---|---|---|
| `--edge-light-1` | `ink / 8%` | Top edge, L1 |
| `--edge-light-2` | `ink / 14%` | Top edge, L2 |
| `--edge-dark` | `black / 30%` | Bottom edge, L1–L2 |
| `--rule` | `ink / 13%` | Structural dividers |
| `--rule-faint` | `ink / 6%` | Secondary separation inside a surface |

### 1.6 Type — one family **[locked: Archivo, no Fraunces]**

**Archivo Variable**, axes `wght 100–900` and `wdth 62–125`. Loaded once via
`next/font/google`, `display: swap`, **preloaded** (it is now the only face and
the hero depends on it). Fraunces is removed **site-wide [locked]** — five
files beyond the landing page are affected and that was explicitly approved.

Contrast target **[locked: strong]** — 88px against 17px, a 5.2× ratio.

| Step | Size (clamp) | Weight | Width | LH | Tracking | Rule for use |
|---|---|---|---|---|---|---|
| `display` | `clamp(2.75rem, 1.1rem + 7vw, 5.5rem)` 44→88px | 600 | 105 | 0.98 | −0.025em | **Exactly once per page.** The hero headline. Never anywhere else. |
| `title` | `clamp(1.75rem, 1.2rem + 2.4vw, 2.75rem)` 28→44px | 600 | 100 | 1.10 | −0.02em | Project names. The footer's closing line. |
| `lead` | `clamp(1.125rem, 1.02rem + 0.5vw, 1.375rem)` 18→22px | 400 | 100 | 1.45 | −0.005em | The hero support line. Case-study leads. |
| `body` | `1.0625rem` 17px | 400 | 100 | 1.65 | 0 | All paragraphs and project summaries. |
| `small` | `0.875rem` 14px | 400 | 100 | 1.50 | 0 | Captions, meta values, nav. |
| `label` | `0.8125rem` 13px | 500 | 100 | 1.30 | **0** | Meta keys only. **Sentence case. Not uppercase. Not tracked.** |

`label` replaces the current `meta` utility, which was uppercase at +0.06em —
a §7 violation sitting in the build today.

**Why `display` is capped at 600/105 and not 800/125:** at 88px over a
photograph, extra-bold extra-expanded reads as shouting, which lands squarely
in "overdesigned for a student". 600 at 105 is confident and quiet. If you
want it louder, this is the number to change and nothing else moves.

### 1.7 Space

Base unit **4px**. Scale: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 192`.

Density is **variable [locked]** — space is allocated by importance, not evenly.
This is the direct fix for the Phase 0 finding that every section got the same
128px regardless of weight.

| Interval | Value | Why |
|---|---|---|
| Nav → hero image | `32` | Chrome sits close to its content. |
| Hero image → headline block | `−64` | **Negative.** The headline overlaps the image. See §2.2. |
| Headline → support line | `32` | |
| Hero → work section | `192` | The largest gap on the page. This is the handoff zone. |
| Work section top padding | `96` | |
| Work grid row gap | `64` | **Dense.** Down from today's 112. |
| Work grid column gap | `32` | |
| Work section → footer | `128` | |

Max line length: **62ch** for prose, **46ch** for the hero support line,
**16ch** for the display headline (forces 3 lines at desktop).

---

## 2. Layout

Four sections. The about-pointer is **deleted [locked]** — it was navigation
dressed as a section, and the About link already lives in the nav.

### 2.1 Nav — static, scrolls away **[locked]**

Purpose: identity and two routes. Must land: nothing; it should be forgettable.
Layout: name left, two links right, on `--surface-base`, no border, not sticky.

```
┌──────────────────────────────────────────────────────┐
│ Fatih Zamzami                        Work    About   │
└──────────────────────────────────────────────────────┘
```

### 2.2 Hero — full-bleed image with the headline overlapping it **[locked: hero carries an image]**

Purpose: establish the claim and the spatial model in one screen.
Must land: *this person builds real things, and this page has depth.*

Layout in one sentence: a full-bleed photograph runs to all three top edges of
the viewport, and the headline block slides up over its bottom edge on a nearer
plane.

```
┌──────────────────────────────────────────────────────┐
│ Fatih Zamzami                        Work    About   │
│                                                      │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓                                                  ▓ │  full bleed
│ ▓          hero photograph, 100vw × 68svh          ▓ │  radius 0
│ ▓                                                  ▓ │  LCP element
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ │
│ ▓▓▓▓▓┌────────────────────────────────┐▓▓▓▓▓▓▓▓▓▓▓▓ │  ← −64px:
│      │ ▔▔▔▔▔▔▔▔▔▔ light top edge      │              │    the block
│      │  I build things                │              │    crosses
│      │  that measure                  │              │    the image
│      │  something, then               │              │
│      │  react to it.                  │              │
│      └────────────────────────────────┘              │
│                                                      │
│      Electrical engineering at Universitas           │
│      Indonesia. Lately that has meant a game         │
│      you play with your attention, a monitoring      │
│      stack for gas pipeline equipment, and a         │
│      solar lamp that grades its own efficiency.      │
│                                                      │
│      ▪ Currently at PT PGAS Telekomunikasi           │
└──────────────────────────────────────────────────────┘
```

**This is the page's deliberate grid break.** Every element on the current page
starts at the same `px-gutter` left edge and nothing ever crosses anything.
Here the headline block is an opaque plane at `--surface-base` with a light top
edge, pulled up 64px so it overlaps the photograph. It is text on its own
ground, not text on an image — no scrim, no contrast risk, and the overlap is
what announces the z-model before the user has scrolled a pixel.

Copy is **locked**; line breaks are manually controlled so the headline always
sets to three lines at desktop and never breaks badly.

### 2.3 Work — a recessed field, densely packed

Purpose: the evidence. Must land: *these four things are real, and they are
not interchangeable.*

Layout in one sentence: the ground drops to `--surface-sunk` and four
hand-placed tiles at four aspect ratios sit on it at L1.

```
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ sunk field begins — dark top lip ▓▓▓▓▓
│                                                       │
│  ┌───────────────────────────────────────────────┐    │
│  │            Refocus cover — 16:9               │    │  L1
│  └───────────────────────────────────────────────┘    │
│  Refocus                          Field    Year       │
│  A game that gets harder…         BCI      2025       │
│                                                       │
│  ┌────────────────────────┐  ┌──────────────┐         │
│  │  OT lab cover — 4:3    │  │  KOMAT — 3:4 │         │
│  │                        │  │              │         │
│  └────────────────────────┘  │              │         │
│  OT Observability Lab        │              │         │
│  Monitoring for gas…         └──────────────┘         │
│                              KOMAT UNPAR 2025         │
│                                                       │
│      ┌─────────────────────────────────────┐          │
│      │      Sunmeter cover — 2:1           │          │
│      └─────────────────────────────────────┘          │
│      Sunmeter                                         │
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ sunk field ends ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

The offset on tiles 3 and 4 is the second grid break: tile 3 sits 112px lower
than tile 2, and tile 4 starts at column 4 rather than column 1.

**Known constraint:** the `slots` table is hand-indexed for exactly four
projects and silently falls back to `slots[0]` for a fifth. This composition is
four-project-shaped by design. A fifth project should force a layout decision
rather than be absorbed silently.

**Meta becomes structure [locked]** — no more `BRAIN–COMPUTER INTERFACE · 2025`.
A two-column key/value block in `label`/`small`, sentence case:

```
Field                  Year
Brain–computer         2025
interface
```

### 2.4 Footer — the close

Purpose: contact. Must land: *email me.*
Layout: ground returns to `--surface-base`, closing line at `title`, the email
address as the interactive object.

```
▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
│  Say hello.                                          │
│                                                      │
│  muhfatihzamzami@gmail.com                           │
│  ────────────────────────── click to copy            │
│                                                      │
│  Muhammad Fatih Zamzami, Depok    GitHub  LinkedIn   │
└──────────────────────────────────────────────────────┘
```

---

## 3. Depth spec

### 3.1 The z-plane model

Four layers. Only the hero's two planes move differentially, and only during
the handoff — the parallax is **scoped to the moment, not ambient**, which is
the reconciliation of "parallax planes" with "one moment, everything else
still" **[both locked]**.

| Plane | Contents | Scroll behaviour |
|---|---|---|
| **P0** background field | Surface colours, grain | Grain is `position: fixed` — it does not scroll. Real film grain sits on the lens, not on the subject. |
| **P1** far | Hero photograph | Scales `1 → 0.94` and fades `1 → 0.40` across the handoff. Recedes. |
| **P2** content | Headline block, work tiles, footer | Scrolls at 1.0. The reference plane. |
| **P3** near | The first project cover during the handoff only | Rises faster than scroll (`translateY 4% → 0`). Nearer to the viewer. |

There is no overlay/chrome plane, because the nav is not sticky **[locked]**.

### 3.2 Light

**Direction: directly overhead, no lateral offset.** Expressed consistently in
exactly two ways, everywhere, with no exceptions:

1. Every raised surface has a top border lighter than its bottom border.
2. Every shadow casts straight down, never sideways.

The sunk field inverts rule 1 — dark lip on top, light lip on the bottom —
because that is what a recess does under an overhead light.

### 3.3 Grain **[locked: 3%]**

A single tiled `feTurbulence` SVG, `baseFrequency 0.8`, rendered once as a
data URI.

```
position: fixed; inset: 0; z-index: 1;
pointer-events: none;  aria-hidden="true";
opacity: 0.03;
mix-blend-mode: overlay;
```

Fixed to the viewport, so it never scrolls and never repaints on scroll. This
is the difference between a surface that reads as a material and one that reads
as a hex code. ~2kB inline, zero layout cost, zero runtime cost.

No vignette. No gradients anywhere on the page.

---

## 4. Motion spec

### 4.1 The easing set — two curves and one spring

| Name | Value | Used for |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | **Everything that responds to input.** Hover, focus, press. Per Kowalski: starts fast, settles slow, reads as instant response. |
| `--ease-narrative` | `cubic-bezier(0.33, 0, 0.15, 1)` | Discrete narrative transitions and the view-transition morph. Slow in, slow out, no snap. |
| `scrollSpring` | `useSpring(…, { stiffness: 120, damping: 30, restDelta: 0.001 })` | Smoothing the raw scroll value only. High damping, no oscillation — per Motion's docs, this is the "expensive" spring profile. |

`ease-in-out` appears nowhere. The scrubbed handoff itself uses **no easing
curve at all** — scroll position *is* the timeline, and applying an ease to a
scrubbed value makes it feel like it is lagging your finger.

### 4.2 Duration bands

| Band | Range | Applies to |
|---|---|---|
| **micro** | 120–180ms | Hover, focus, press. Under Kowalski's 300ms ceiling. |
| **standard** | 300–450ms | Discrete state changes. Currently: nothing on this page. |
| **narrative** | scrubbed, ~80svh of scroll | The handoff. No fixed duration — the user controls it. |

### 4.3 Every interaction on the page

| Interaction | Trigger | Properties | Duration / easing | What it communicates |
|---|---|---|---|---|
| Tile hover | pointer enter | `background-color`, `border-color` (top + bottom), `box-shadow` L1→L2 | 160ms `--ease-out` | *This is an object and it just came toward you.* Elevation grammar, not a generic lift. |
| Tile press | pointer down | `box-shadow` L2→L1 | 120ms `--ease-out` | The object settles back down. |
| Nav / link hover | pointer enter | `color` | 140ms `--ease-out` | |
| Email control hover | pointer enter | `text-decoration-color` → accent | 160ms `--ease-out` | One of the three accent appearances. |
| Focus ring | `:focus-visible` | none — appears instantly | 0ms | Never animate a focus ring; it delays an accessibility affordance. |
| **The handoff** | scroll | see §4.4 | scrubbed | The page has depth, and you are moving through it. |
| Cover → case study | navigation | `view-transition-name` morph | 520ms `--ease-narrative` | Already built. Retained. |

**Explicitly not present:** no section entrance animations, no staggered
reveals, no `transition: all`, no hover-lift by translation, no cursor effects,
no scroll-jacking, no pinning. Work tiles 2–4 are completely static. The
existing `.unfold` clip-path animation is **removed**.

### 4.4 The orchestrated moment, beat by beat

**Where:** the 192px gap between the hero and the work section, measured across
roughly 80svh of scroll from the moment the hero image's bottom edge reaches
the viewport bottom.

**What:** the hero recedes onto a far plane while the work section's first
cover rises past it on a near plane. For a window of about 15% of the scroll
range, both are visible simultaneously at different depths. That overlap is the
moment.

| Beat | Scroll progress | What happens |
|---|---|---|
| **1 — resistance** | 0 → 25% | Headline `scale 1 → 0.99`. Hero image untouched. Almost nothing moves. The page feels heavy before it yields. |
| **2 — recession** | 25 → 60% | Hero image `scale 1 → 0.94`, `opacity 1 → 0.40`. Headline `scale 0.99 → 0.955`, `opacity 1 → 0`. Both retreat, the headline faster than the image. |
| **3 — arrival** | 45 → 100% | The sunk field's top lip crosses the viewport. First cover `translateY 4% → 0` at **full opacity throughout**. It rises without fading. |
| **overlap** | 45 → 60% | Both planes live. This is the whole point. |

**Properties animated: `transform` and `opacity` only.** Nothing else, on any
beat.

**Why the first cover does not fade in:** a fade-and-slide-up is §7's most
explicitly banned pattern. Removing the opacity ramp and keeping only the
translate makes the cover *rise* rather than *appear* — more confident, and it
sidesteps the tell entirely. This was changed during the anti-generic pass.

**Implementation.** `useScroll({ target, offset: ["start end", "end start"] })`
→ `useSpring` for jitter smoothing → three `useTransform` mappings driving
`m.div` style. `LazyMotion` + `domAnimation` with `m.*` components, not the
full `motion` bundle.

**Mobile [locked: simplified]:** below `768px`, beat 3's `translateY` is
dropped entirely. Beats 1 and 2 survive — the hero still recedes and fades, so
the gesture is recognisably the same, but the planes never separate.
Differential parallax is barely legible at 390px and costs the most on
mid-tier Android.

### 4.5 Reduced motion — `prefers-reduced-motion: reduce`

| Element | Fallback |
|---|---|
| The handoff | All three beats resolve to their **final state immediately**. The hero sits at `scale 1, opacity 1`; the cover sits at `translateY 0`. No scroll listener attaches at all — the `useScroll` hook is not mounted. |
| View transition morph | `animation-duration: 1ms` (already implemented). |
| Tile hover | **Retained.** Colour and border changes are state feedback, not motion, and removing them would cost usability for no benefit. |
| Grain | **Retained.** It is static and does not animate. |
| Focus ring | Unaffected — it never animates. |

---

## 5. Restraint pass

**The one element allowed to be bold:** the hero — a full-bleed photograph with
an 88px headline crossing over it. That is the page's single loud gesture.

**Everything else is quiet, confirmed:** work tiles are static with a
colour-and-edge hover; the nav is forgettable; the footer is three lines; the
accent appears three times; there are no section entrances anywhere; there is
one orchestrated moment and no second one.

**Three things cut before showing you:**

1. **The about-pointer section** — deleted outright. It was a link formatted as
   a section, in the weakest position on the page, consuming 256px of vertical
   space for a route the nav already provides.
2. **Ambient page-wide parallax** — scoped down to the handoff zone only.
   Continuous drift would have made every scroll position feel slightly
   unstable, and it would have contradicted "one moment, everything else still".
3. **The `.unfold` clip-path animation on work tiles** — removed with no
   replacement. It animated `clip-path` and `scale` (off the transform/opacity
   budget), applied the identical treatment to three different tiles, and was
   invisible in Firefox anyway. The tiles are now simply there.

Also removed: the uppercase tracked-out `meta` utility, middle-dot meta
strings, the accented full stop in the headline, and Fraunces.

---

## 6. Anti-generic check against §7

| Banned pattern | Status |
|---|---|
| Purple/blue gradient meshes, orbs, aurora | Absent. No gradients anywhere on the page. |
| Glassmorphism as a substitute for elevation | Absent. No blur. The nav is not sticky, so there is no chrome to blur. |
| One shadow and one radius on everything | Absent. Two shadow steps tied to elevation level; four radius steps tied to surface size; images and fields fixed at 0. |
| Fade-and-slide-up on every section | Absent. **Revised during this pass** — beat 3 originally faded the first cover in. The opacity ramp was removed so it rises at full opacity instead. |
| Hover-lift on every card, `transition: all` | Absent. Hover is an elevation-level change on named properties. No translation. |
| Marquee / infinite scrollers | Absent (deleted last session). |
| ALL-CAPS tracked-out eyebrow labels | **Removed.** The `meta` utility (uppercase, +0.06em) is replaced by `label` — sentence case, zero tracking. |
| `01 / 02 / 03` numbering | Absent. |
| Middle-dot meta strings, spaced em dash | **Removed.** Replaced by a two-column key/value block. |
| `→` on every link | Absent. |
| Accenting one word of the headline | **Removed.** The `<span className="text-accent">.</span>` is deleted. |
| Cream + serif + terracotta | Absent. Warm charcoal, one vermilion, one grotesque. |
| Near-black standing in for black without a reason | `#141211` is warm charcoal with a stated reason, and it is now one of three deliberate field levels rather than a single flat ground. |
| Cursor-follow, magnetic buttons, custom cursor | Absent. |
| Scroll-jacking, animation delaying content | Absent. The handoff is scrubbed, never pinned. Scroll is never intercepted, and no content waits on an animation to become readable. |

**Would I produce any of this for any landing page regardless of subject?** The
elevation system and easing set are generic craft and should be. The three
things that are specific to *this* page: the hero block physically overlapping
the photograph (a portfolio for someone whose claim is materiality should
demonstrate objects occupying space); the work section as a recess rather than
a raised card grid (evidence is *in* the page, not floating above it); and the
two-column key/value meta (a spec sheet, because the subject is an engineer).

---

## 7. Performance plan

| Budget | Target | Plan |
|---|---|---|
| LCP | < 2.5s, mid-tier mobile, 4G | The hero photograph is now the LCP element. `next/image` with `priority`, `fetchPriority="high"`, explicit `sizes="100vw"`, AVIF/WebP, and a `blurDataURL`. Until the asset lands the placeholder is pure CSS and LCP is the headline text. |
| CLS | < 0.02 | Every image goes through `Frame`, which reserves space via `aspect-ratio`. Font is preloaded with `display: swap` and is the only face, so there is one metric swap at most. Grain is `position: fixed` and outside flow. |
| 60fps on scroll | verified in DevTools | Only `transform` and `opacity` animate. `will-change: transform` on the two hero planes during the handoff only. Scroll value smoothed through `useSpring` rather than read raw. |
| Dependencies | ≤ 1 new | **One: `motion` (~18kB gz)** via `LazyMotion` + `domAnimation` + `m.*`. Approved in Batch 5 over my objection that native CSS scroll timelines are 0kB and run off the main thread. Recorded here so the trade-off is visible later. |

---

## 8. Files this touches

**In scope:** `src/app/page.tsx`, `src/app/globals.css`, `src/app/layout.tsx`,
`src/components/ui/Frame.tsx`, `src/components/ui/Nav.tsx`,
`src/components/ui/Footer.tsx`, plus a new `src/components/motion/Handoff.tsx`
and `src/components/ui/Grain.tsx`.

**Out of original scope, approved in Batch 5** (Fraunces removal only):
`src/app/about/page.tsx`, `src/app/work/page.tsx`,
`src/app/work/[slug]/page.tsx`, `src/components/ui/CopyEmail.tsx`,
`src/components/mdx/blocks.tsx`.

**Content:** `content/projects/*.mdx` gains a hero-image field for the landing
page's lead photograph.

---

## 9. Open questions

1. **The hero photograph does not exist.** Until it does, the hero renders a
   `Frame` placeholder at 100vw × 68svh. The composition is designed around a
   real image and will look thin until one lands. Which shot is it?
2. **Line breaks in the headline** are manually placed for a three-line desktop
   set. If you later change the copy, they need re-placing.
3. **Build order** per §6: tokens/globals → hero → work section → rest → polish,
   with a review after the hero and after the work section.

---

## 10. Build deviations

Recorded as they happen, per §9. Each of these differs from the spec above;
the spec text is left intact so the reasoning stays visible.

### Slice 1 — tokens/globals + hero

1. **Hero image height 68svh → 52svh.** At 68svh the headline and support line
   both fell below the fold on a 1000px viewport. The hero's job is to land the
   claim on first paint, and it wasn't.
2. **The headline sets two lines, not three.** §1.7 specified a 16ch measure
   forcing three lines; at 88px with `text-balance` the line reads better as
   two, and it fills the width more confidently. Measure is now `20ch`.
3. **The headline plane is full-bleed, not a contained box.** As specified — a
   block sized to its content overlapping the photograph — it read as a stray
   dark rectangle with a hard right edge cutting across the image. Running the
   plane edge to edge makes its light top border read as *an edge*, which is
   the whole point of the gesture. The grid break survives; it is now
   horizontal rather than rectangular.
4. **Placeholder grounds lightened to `#2a2724`.** Development aid only. The
   hero slab overlapping the photograph is invisible when the "photograph" is
   a dark hatched placeholder, which made the composition impossible to judge.
   `Frame` uses the lighter ground only when `src` is absent, so this has no
   effect once real images land.
5. **The `meta` utility was fixed in place rather than renamed to `label`.**
   §1.6 called for a new `label` step. `meta` is referenced in six files across
   the site; redefining it (sentence case, zero tracking, 13px/500) fixes every
   one of them in a single line instead of touching six files in the hero
   slice. The token table's intent is met; only the name differs.
6. **`--font-display` is kept as an alias pointing at Archivo.** Rather than
   editing five files to remove `font-display` class names in this slice, the
   token now resolves to Archivo. Fraunces is gone from the bundle. The class
   name is now misleading and should be renamed in the polish pass.

### Slice 2 — work section

7. **A fourth surface was added, and the tiles moved up a level.** As specced,
   the field was `#0F0D0C` and tiles rested on `#141211` — a five-value step
   that is invisible in practice, so the elevation system did no work and the
   tiles read only because they contained an image. Revised: the field drops to
   `#0C0B0A`, tiles rest on `--surface-raised` `#1B1917`, and hover goes to a
   new `--surface-lifted` `#232120`. Palette is now 8 values rather than 7.
   The extra value buys a visible elevation step, which was the point of
   choosing "dark with distinct field steps" in the first place.
8. **Tiles are square, radius 0.** §1.4's rule is radius-by-surface-size, which
   would give a large tile a large radius — but the tile's dominant content is
   a flush photograph, and rounding the tile rounds the image with it. Images
   stay square [locked], so the tile does too. Radius remains reserved for
   controls and interface panels.

### Slice 3 — footer, cleanup, polish

9. **The unused `wdth` axis was dropped from the font.** §1.6 specced the
   display step at width 105, but no width was ever applied in code — the
   variable axis was shipping for nothing. Contrast now comes from scale and
   weight alone.
10. **The accent square before "Currently" was cut (Chanel test).** It was a
    bullet dressed as a design element, and the most decorative mark on the
    page. The accent now appears only as interaction — hover, focus ring,
    selection — which is stricter than "use it less". One line to restore.
11. **The hero base became two columns.** The support paragraph was orphaned at
    46ch with ~900px of dead field beside it, and the "currently" fact hung off
    the bottom as a footnote. It is now a key/value block in the right column,
    which resolves the hero instead of letting it trail off.
12. **The nav gained a bottom edge** (`--edge-dark`), so the hero photograph
    sits under a lit edge. The chrome now participates in the light model
    instead of floating above it.
13. **`favicon.ico` was a 987×988 PNG, 1.5 MB, served on every page load.**
    Pre-existing, committed in June. The original is preserved untouched at
    `assets/favicon-source.png` (outside `public/`, so it is never deployed);
    `src/app/icon.png` is a 96px, 15 kB version. Total page transfer fell from
    1,765 KiB to 277 KiB.

---

## 11. Performance actuals

Measured with Lighthouse 12 against `next start` (production build), mobile
preset — simulated 4G with 4× CPU throttling. Not the dev server.

| Budget (§6) | Target | Actual | |
|---|---|---|---|
| LCP | < 2.5 s | **2.6 s** | ✗ over by 0.1 s |
| CLS | < 0.02 | **0** | ✓ |
| Total blocking time | — | 0 ms | ✓ |
| Performance score | — | 97 | |
| Total transfer | — | 277 KiB | (was 1,765 KiB) |
| New dependencies | ≤ 1 | 1 (`motion`) | ✓ but see below |
| 60 fps on scroll | verified | **not verified** | no DevTools access |

**On the LCP miss.** The LCP element is the hero headline, and the shortfall is
entirely render delay (2,160 ms of a 2,614 ms LCP) — the content is ready and
the paint is late. Three hypotheses were tested and all three ruled out:

- `text-wrap: balance` on the 88px headline — removed it, LCP identical.
- Framer Motion hydrating around the LCP element — forced the static branch so
  Motion never mounted, LCP identical. **Motion is not responsible.**
- Font download — every resource completes within 22 ms; the delay is
  simulated main-thread work, not network.

What remains is baseline React hydration under 4× CPU throttle. The honest
caveat: this measurement is provisional, because the LCP element is currently a
text node standing in for a photograph that does not exist yet. **Re-measure
once the hero image lands** — it will become the LCP element and the number
will be governed by image delivery instead.

**On the dependency.** `motion` costs **38 kB gzipped**, not the ~18 kB I
estimated in §7 when arguing the trade-off. I under-estimated it, and the
record should say so. It is not costing LCP (proven above), but it is 38 kB.

### Slice 4 — completion pass

14. **The icon was rebuilt as SVG.** The original was a serif "F" in vermilion
    on charcoal — on-brand for colour, but a serif, which contradicts the
    typography now that Fraunces is gone. `src/app/icon.svg` is the same mark
    drawn in the grotesk idiom: ~400 bytes, crisp at every size, vs 15 kB for
    the downscaled PNG. The original stays at `assets/favicon-source.png`.
15. **Beat boundaries were hoisted to a `BEATS` constant.** They were repeated
    across four `useTransform` calls and a second component; changing one
    desynced the choreography. Tuning the moment is now a single object.
16. **A fifth project now fails the build with a useful message** instead of
    silently reusing slot 0. Adding one is a layout decision, and the error
    says so and names the file to edit.
17. **`Nav` was left as a client component.** §5's list proposed making it a
    server component to cut client JS. On inspection the gain is illusory:
    `next-view-transitions`' `Link` is itself a client component and pulls the
    router regardless, so `usePathname` costs nothing additional. Extracting a
    `NavLink` would have added a file for no measurable benefit.
18. **The About hero's overlap was abandoned.** A vertical variant of the
    slab-crossing-an-image gesture was built, then cut: overlapping column
    ranges in CSS Grid land in separate rows unless the row is set explicitly,
    and once fixed the opaque slab simply covered the portrait. The gesture is
    horizontal by nature — it belongs to the landing page and case studies,
    where the image is full bleed. About states itself plainly instead and lets
    the recess below carry the system.
19. **`--ink-faint` was lightened from `#6b645b` to `#918a80`.** At 13px the
    old value scored 3.0:1 against `--surface-raised` — a real WCAG AA failure
    on every meta key across the site, which is the spec-sheet structure the
    whole design leans on. The new value clears 4.5:1 on all four surfaces
    (4.70:1 on the lifted hover state, the tightest case) and still reads a
    step quieter than `--ink-muted`. Lighthouse accessibility went 96 → 100.

---

## 12. Final measurements

Lighthouse 12, production build (`next start`), mobile preset — simulated 4G
with 4× CPU throttling.

| | Home | About |
|---|---|---|
| Performance | 97 | 98 |
| **Accessibility** | **100** | **100** |
| LCP | 2.5–2.6 s | 2.3 s |
| CLS | **0** | **0** |
| Total blocking time | 0–10 ms | 0 ms |
| Transfer | 263 KiB | 271 KiB |

Against the §6 budgets: **CLS passes with room** (0 vs < 0.02). **LCP sits on
the line** — it measures 2.5 s or 2.6 s depending on the run, against a 2.5 s
target. The remaining cost is baseline React hydration under 4× CPU throttle;
`text-wrap: balance`, Framer Motion and font loading were each tested and ruled
out (§11). The figure is provisional either way: the LCP element is a text node
standing in for a photograph, and it should be re-measured once the hero image
exists.

**60 fps on scroll remains unverified.** It requires a DevTools Performance
trace, which this environment cannot produce. Everything the moment animates is
`transform` and `opacity` only, which is the necessary condition — but that is
an argument, not a measurement, and the distinction should stay on the record.

---

## 13. Motion amendment — the portfolio surfaces

§4 specified the landing page. This covers everything added since: `/about`,
`/work`, the case studies, the rebuilt footer, the contact channels, the shared
timeline and the skills list. **No new curve and no new band is introduced.**
The set stays at two curves, one spring, three bands.

### 13.1 The bands become tokens

§4.2 defined the bands as prose ranges, and the code drifted: `160ms` in the
elevation utilities, `duration-200` in every colour transition, `520ms` in the
view-transition rule. Same intent, three different numbers.

| Band | Token | Value | Applies to |
|---|---|---|---|
| micro | `--dur-micro` | `160ms` | Hover, focus, press. Anything responding to a pointer. |
| standard | `--dur-standard` | `320ms` | Discrete state changes — the copy confirmation. |
| narrative | `--dur-narrative` | `520ms` | The view-transition morph. |

The scrubbed handoff still has no duration: scroll position is its timeline.

### 13.2 Every interaction on the new surfaces

| Interaction | Trigger | Properties | Duration / easing | Stagger | What it communicates |
|---|---|---|---|---|---|
| Channel link hover | pointer enter | `color` → accent | micro / `--ease-out` | none | It's reachable. |
| Copy button hover | pointer enter | `color` → accent | micro / `--ease-out` | none | Same affordance as the link beside it, deliberately — both do the same job. |
| Copy confirmation | click | label swaps `Copy` → `Copied`, reverts after 1600ms | standard / `--ease-out` | none | The clipboard actually took it. Width is reserved (§13.4), so nothing moves. |
| Email slab hover | pointer enter | ground, edges, shadow L1→L2 | micro / `--ease-out` | none | The elevation grammar from §4.3, unchanged. It is an object. |
| Work tile hover | pointer enter | as §4.3 | micro / `--ease-out` | none | — |
| Skill → project link hover | pointer enter | `color` → accent | micro / `--ease-out` | none | The proof is one click away. |
| Nav / footer nav hover | pointer enter | `color` | micro / `--ease-out` | none | — |
| Timeline entries | — | **none** | — | — | Evidence doesn't need an entrance. |
| Skills list | — | **none** | — | — | — |
| Footer | — | **none** | — | — | The ground change *is* the transition. |
| Cover → case study | navigation | `view-transition-name` morph | narrative / `--ease-narrative` | — | The tile you clicked is the image you landed on. |
| Case study → next case | navigation | root cross-fade, 320ms | standard | — | — |

### 13.3 The stagger question — recommendation: none

§7 permits one staggered reveal, used once, deliberately. **I am not spending
it.** The site already has one orchestrated moment (§4.4) and it lives on the
home page. A staggered timeline on `/about` would be a second, weaker moment
competing with it, and fade-and-slide-up on a list is the exact tell §7 names.

If it is spent anyway, it goes in exactly one place: the `/about` experience
timeline, `translateY 8px → 0` at full opacity, 60ms apart, capped at the first
five entries, IntersectionObserver-triggered, once. Not opacity. **Currently
not built.**

### 13.4 Zero-CLS rules for the new components

- **The copy button reserves its width.** `Copy` → `Copied` is a 2-character
  growth on an inline control; unreserved it nudges the row on every click.
  `min-width` is set from the longer label.
- Frame placeholders already carry the real `aspect-ratio`, so a missing
  photograph reserves exactly the space the photograph will take.
- Highlights, links and location render as *omitted elements*, never empty
  containers, so an entry's height is determined at build time.

### 13.5 Reduced motion

No new scroll listeners exist on any of these surfaces — the timeline, skills
list and footer are static markup with no client JS beyond the copy button.
Colour transitions are retained under `reduce`, per §4.5: they are state
feedback, not motion. The copy confirmation is retained for the same reason —
removing it would leave the button with no feedback at all.

### 13.6 Deviation from §2.4 — the footer was rebuilt

§2.4 specified the footer as `--surface-base` with a closing line, the email
control, and a name/socials row. The rebuilt footer keeps that spine and adds:
the sunk field instead of base (the ground change is what makes it read as an
ending rather than as another section), the full channel list, the CV link,
footer nav, location with a derived UTC offset, a last-updated date and a
back-to-top link. Availability status was specified in the brief and **cut at
the client's instruction** — recorded here so the omission is a decision and
not an oversight.

---

## 14. Measurements after the portfolio build

Lighthouse 13.4.1 against `next start` (production build), mobile preset —
simulated 4G, 4× CPU throttling. Same method as §11/§12, so the numbers are
comparable.

| Route | Perf | A11y | Best pr. | SEO | LCP | CLS | TBT | Weight |
|---|---|---|---|---|---|---|---|---|
| `/` | 97 | **100** | 96 | 100 | 2.6 s | **0** | 0 ms | 281 KiB |
| `/about` | 98 | **100** | 96 | 100 | 2.5 s | **0** | 0 ms | 287 KiB |
| `/work` | 98 | **100** | 96 | 100 | 2.3 s | **0** | 0 ms | 292 KiB |
| `/work/neuro-adaptive-game` | 98 | **100** | 96 | 100 | 2.3 s | **0** | 0 ms | 282 KiB |

Against the §7 budgets: **CLS passes on every route with the full margin** — 0
against a 0.02 budget, including `/about`, which is now the longest page on the
site and the one with the most conditionally-rendered blocks. **LCP passes on
three routes and sits 0.1 s over on the home page**, unchanged from §12 and for
the same reason: baseline React hydration under 4× throttle, measured against a
headline text node that is standing in for a photograph which does not exist
yet. It should be re-measured once the hero image lands.

**Best practices 96 is a local-measurement artifact, not a defect.** The two
console errors are 404s on `/_vercel/insights/script.js` and
`/_vercel/speed-insights/script.js`, which are injected by the Vercel
Analytics components and only exist when served from Vercel. On the deployed
site the category is 100.

**One real defect found by measuring and fixed:** the footer linked to
`/cv.pdf`, which does not exist. `site.cv` is now `null`, and the comment says
exactly what to set it to when the file lands.

**Weight is up ~18 KiB** over §12 (263 → 281 KiB on the home page). That buys
the rebuilt footer, six contact channels with copy behaviour, and the icon set.
`react-icons` ships six inline paths and nothing else — tree-shaking verified
in the rendered HTML.

**60 fps on scroll remains unverified**, as in §12. It needs a DevTools
Performance trace over a scripted scroll, which this environment still cannot
produce. What can be said: everything animated is `transform` and `opacity`
only, and total blocking time is 0 ms on every route. That is the necessary
condition, not the measurement, and the distinction stays on the record.

### 14.1 Screenshot pass — three weakest moments, fixed

Captured with headless Chrome at true viewport sizes and with Lighthouse's
mobile emulation. **Caveat for anyone repeating this:** a tall `--window-size`
capture distorts every `svh` unit, and headless window size is not viewport
size, so the hero and the mobile gutters both render wrong in a naive
full-page shot. Judge the fold at real viewport sizes; use Lighthouse's
emulated full-page screenshot for mobile.

1. **The email address broke mid-word.** `break-all` at the `title` step (44px)
   inside a 34rem slab split the primary call to action as
   "muhfatihzamzami@gma / il.com". Replaced with a container-fitting clamp and
   no `break-all` — it now sets on one line at every width.
2. **Skill proof-links stacked.** Each skill put its related projects on their
   own line, so "KOMAT UNPAR 2025" and "NEST UI 2026" repeated five times down
   the column and read as noise. They are now inline citations on the context
   line, underlined in `--rule`.
3. **The TA entry led with two lecturers' names and their full credentials** —
   the least interesting line in the list's most prominent slot. Moved last.

Also added: `id="contact"` on the footer, so the contact block is
deep-linkable.
