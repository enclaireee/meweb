# v4 — Motion revamp

Replaces the **motion** direction of `design-spec.md` §4/§13 and `spec-v3-singlepage.md`
§3/§6. Everything else in both stands: tokens, depth model, the single-page
architecture, the expand contract, contact, footer, performance budgets, and
the banned-cliché list.

From 9 interview batches / 36 answered questions.

---

## 1. The motion system

### 1.1 Two curves, and why not three

| Name | Value | Used for |
|---|---|---|
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Everything that responds to input, and every mask reveal. Fast start, long settle — content arrives decisively and stops gently. |
| `--ease-narrative` | `cubic-bezier(0.33, 0, 0.15, 1)` | The curtain, and the scrubbed hero recession. Slow in, slow out. |

The brief allows three. Two is what the site needs, and sashamartynchuk —
measured in Phase 1 — ships the same `(.16,1,.3,1)` as its workhorse.
`ease-in-out` appears nowhere. The scrubbed recession uses **no curve at all**:
scroll position is its timeline.

### 1.2 Three duration bands

| Band | Value | Applies to |
|---|---|---|
| micro | `160ms` | Hover, focus, press |
| standard | `320ms` | Reveals, expands, theme change |
| narrative | `520ms` | The greeting characters, the hero recession |
| *(curtain cap)* | `600ms` | Its own number, because it is a ceiling not a duration — see §2 |

### 1.3 Stagger rhythm — one base, one rule

**Base = 40ms.** Lists step at base. Characters step at `base × 0.75 = 30ms`,
because there are more of them and each is smaller, so the same rhythm at the
same delay would read as a queue rather than a phrase.

**Lists cap at 6 items.** At 40ms an uncapped 15-item skills group takes 600ms
to finish and its tail arrives long after you started reading its head. Items
past the sixth arrive with the sixth.

### 1.4 Z-plane model

Three planes, one overhead light — the same light the elevation system uses.

| Plane | Rate | Contents |
|---|---|---|
| **Far** | `0.85 ×` scroll | Signal trace, section grounds |
| **Mid** | `1.00 ×` scroll | All text content |
| **Near** | `1.06 ×` scroll | Project covers, the expand overlay |

Rates compress toward `1.0` below 768px (far → 0.95, near → 1.02): differential
motion is close to illegible at 412px and costs most on the devices least able
to pay it. **Every far/near layer is overscanned by `(rate − 1) × viewport`** so
no gap can open at the ends of the range — checked at 320px and ultrawide.

### 1.5 Motion budget

**12 elements animating at once, maximum.** The 6-item stagger cap makes that
comfortable: one section's heading plus six rows is seven.

Degradation order when the budget or the device says no:

1. **Parallax** drops first (rates → 1.0). Depth is the least load-bearing.
2. **Trace idle breathing** stops; input response stays.
3. **Stagger collapses** — a list reveals as one block.
4. **Reveals are last.** Losing them makes content look broken rather than calm.

Triggered by `prefers-reduced-motion`, `navigator.connection.saveData`, or
`navigator.deviceMemory ≤ 4`.

---

## 2. The curtain

**Not a loading screen. An overlay over a finished page.** The measured
distinction from Phase 1: sokolovski.pro has 22,321 words rendered behind its
curtain at 400ms; cipher.tv has 76. This is the first pattern.

| Property | Value |
|---|---|
| What it is | One opaque plane in `--surface-base`. No type, no mark, no counter. |
| Waits on | `document.fonts.ready` — a real signal, and one the greeting needs anyway (§5 forbids animating a fallback face and swapping mid-motion) |
| Exits at | `min(fonts.ready, 600ms)` |
| Shown | First visit per session (`sessionStorage`). Never on back-navigation, never on expand-close, never on in-page route change |
| Skippable | Any pointerdown, keydown, wheel or touchstart dismisses it immediately |
| Reduced motion | Never rendered at all |
| Behind it | The entire page, in the DOM, painted. Crawlers and screen readers never see it — it is `aria-hidden` and `inert` |
| LCP | Structurally unaffected: the greeting is painted at full opacity beneath it. The delta gets measured and reported either way |

### 2.1 The handoff

Everything moves **up**. One direction, so the curtain and the greeting read as
one gesture rather than two animations meeting.

```
t=0ms     page painted. curtain covers. characters sit at y=100% inside masks
t=400ms   characters begin rising (30ms apart)
t=600ms   curtain lifts upward — overlapping the character reveal by ~200ms
t=900ms   characters settled. curtain gone.
```

The overlap is the point. A curtain that finishes before the greeting starts is
a cut with extra steps.

---

## 3. The hero

### 3.1 Copy

**`heroLine` is deleted from the data layer and every component.** Phase 4
confirms it appears nowhere in the repo.

Three beats, descending loudness:

```
Hi, I'm
Fatih.                                    ← display scale, fills the fold
                                            "Hi, I'm" lighter weight,
                                            "Fatih" full weight

I work where the hardware and the
software are the same problem.            ← lead

Electrical engineering at Universitas
Indonesia. Lately that has meant a game
you play with your attention, a monitoring
stack for gas pipeline equipment, and a
solar lamp that grades its own efficiency. ← small, muted

                        Currently          ← quietest, arrives last
                        Head of R&D
```

The second beat is near-verbatim from the existing About copy — it was already
the sharpest sentence on the site.

### 3.2 The greeting — per-character mask reveal

Eleven characters. Each sits in an `overflow: hidden` wrapper and translates
from `y: 100%` to `0`, 30ms apart, `520ms`, `--ease-out`. **No fade.**

Accessibility, per §5:

- The wrapper carries the full string as `aria-label`; every character span is
  `aria-hidden`. A screen reader hears "Hi, I'm Fatih", not eleven letters.
- Text stays selectable and copyable — the spans are inline, not replaced content.
- **Zero CLS**: the wrapper reserves final size before the spans mount, because
  the string is known at build time and rendered server-side. Nothing reflows.
- The reveal awaits `document.fonts.ready` — which is also what the curtain
  waits on, so they are the same gate.
- **Resize does not re-trigger.** Splitting is done once at mount; resize only
  re-flows the existing spans. The animation has a `hasPlayed` flag.
- Reduced motion: final state, instantly, fully legible.
- `transform` only. No per-character `filter`.

### 3.3 Scroll-out — the one scrubbed moment

The greeting recedes on the **far** plane while the work section rises on the
**near** plane. Measured across the hero's exit from the viewport:

| Beat | Progress | Output |
|---|---|---|
| Resistance | 0 → 25% | greeting `scale 1 → 0.99`. Almost nothing. |
| Recession | 25 → 60% | greeting `scale 0.99 → 0.955`, `opacity 1 → 0` |
| Arrival | 45 → 100% | first work element `translateY 4% → 0`, **full opacity throughout** |
| Overlap | 45 → 60% | both planes live — this is the moment |

`transform` and `opacity` only, on every beat. Below 768px beat 3's translate is
dropped; beats 1–2 survive so the gesture is recognisably the same.

### 3.4 The trace, demoted

The greeting is now the bold element, so the trace stops competing: it keeps its
input response and its resting line, and its idle breathing amplitude drops from
5px to 3px. It moves on the **far** plane. It still measures real input, which
is the one thing that made it worth having.

---

## 4. Section-by-section scroll behaviour

| Section | Entry | Scroll |
|---|---|---|
| Hero | §2–3 sequence | recession, far plane |
| Work | heading mask-reveals; featured cards stagger (3 × 40ms); index rows stagger, cap 6 | covers on near plane |
| About | heading reveals; prose appears plainly | mid |
| Experience | heading reveals; 8 entries stagger, **cap 6** | mid |
| Skills | heading reveals; 3 groups stagger; items inside appear with their group | mid |
| Credentials | heading reveals; three columns arrive together | mid |
| Footer | heading reveals; channel rows stagger, cap 6 | mid |

**Reveal**: `translateY 24px → 0`, `opacity: 1` throughout, `overflow: hidden`
wrapper, `320ms`, `--ease-out`, **fires once ever**. Observers disconnect after
firing.

**No pinning anywhere.** No progress indicator — the nav scroll-spy already
answers "where am I" in words. **Covers do not drift within their crop.**

---

## 5. Implementation

| Concern | Choice |
|---|---|
| Smooth scroll | **Lenis, desktop only.** `smoothTouch` off — phones keep native momentum, which no library matches |
| Reveals | Native CSS `animation-timeline: view()` behind `@supports`, IntersectionObserver fallback |
| Scrubbed hero | Framer Motion `useScroll`/`useTransform` — already installed, zero additional cost |
| Split text | Hand-written. Eleven characters is a few lines; GSAP SplitText would mean ~70 kB of GSAP for one plugin |
| Added weight | **~14 kB gz** total (Lenis ~10 kB + own code) |
| Browser floor | Modern evergreen; ~84% get native timelines, 100% get working content |

**Lenis is a risk I flagged and you overruled, so here is the mitigation rather
than the argument again:** anchor navigation and the expand's scroll restoration
must go *through* Lenis, not around it. `next-view-transitions` silently broke
the intercepting-route expand in v2 by patching the router; Lenis patches
scroll, and the expand contract depends on exact scroll restoration.
`scripts/verify-expand.mjs` is the check, and it runs in the same slice.

### 5.1 One file holds every number

`content/meta/motion.ts` — durations, easings, stagger, caps, parallax rates,
the curtain cap, the character delay. No component holds a literal. Change a
number, rebuild, see it.

---

## 6. Restraint pass

**The one bold element: the greeting's arrival.** Curtain, character reveal,
three descending beats. It is allowed to be more than it needs to be. Everything
else on the page is a 24px translate under a mask, in one direction, at one
duration.

**Three things cut:**

1. **Pinning.** Every candidate — the featured trio, the greeting, the timeline
   — competes with the one scrubbed moment, and pinning is the effect most often
   experienced as scroll-jacking.
2. **The progress indicator.** The scroll-spy nav already answers the question
   it would answer, using words.
3. **Cover drift within crop.** The richest parallax treatment, and the one that
   opens gaps at extreme viewports — for images that are currently placeholders.

## 7. Anti-generic pass

| Clichéd default | What this spec does instead |
|---|---|
| Fade-and-slide-up on every section | **No fade anywhere.** Content rises at full opacity behind a mask |
| Hover-lift by translation on cards | Elevation grammar — ground, edges and shadow move together; nothing translates |
| `transition: all 0.3s ease` | Two named curves, three named bands, named properties only |
| Uniform entrance on everything | Headings and lists only; prose and credentials appear plainly |
| A progress bar | Cut |
| Preloader with a fake counter | No counter. Waits on `document.fonts.ready` or 600ms, whichever is first |
| Blur-to-focus per character | Forbidden by §5 and not used |

**What changed because of this pass:** the entry gesture lost its opacity ramp
(it was fade-and-slide-up in the first draft), and the reveal scope narrowed
from "every section" to "headings and lists".

---

## 8. Build order

1. Motion primitives — `motion.ts`, reduced-motion + low-power hook, `Reveal`, `SplitText`
2. Scroll infrastructure — Lenis (desktop only), z-plane provider, **re-run `verify-expand.mjs`**
3. Hero + greeting, and the `heroLine` deletion
4. The curtain
5. Section-by-section reveals
6. Polish, then Phase 4

Gate on every slice: **CLS 0, 60fps at 4× CPU throttle, LCP no worse than the
2.8s it is now** — and the curtain's LCP delta reported separately.

---

## 9. Build log

### Slices 1–5 ✅

**Motion primitives.** `content/meta/motion.ts` holds every number — curtain cap,
character stagger, list stagger and cap, parallax rates, reveal distance, the
concurrency budget. No component holds a motion literal.

**Everything is opt-IN.** The inline script in `layout.tsx` sets
`html[data-motion]` before first paint, and only when JavaScript is running,
reduced motion is off, and the device is not low-power (`deviceMemory ≤ 4` or
`saveData`). Every hidden start state is scoped under that attribute, so with JS
disabled or reduced motion on, **nothing is ever in a hidden state to begin
with**. The animation is the enhancement; content never waits for it.

**`SplitText` is a server component.** The string is known at build time, so
spans and per-character `transition-delay` are rendered on the server. The
stagger costs zero JavaScript — CSS does it.

### Corrections to this spec, made while building

1. **Native `animation-timeline: view()` cannot do "fires once".** §5 specced it
   for reveals. View timelines are *scrubbed* to scroll position, so they replay
   every time an element re-enters — there is no play-once-and-stay. Reveals use
   IntersectionObserver. Native timelines remain correct for genuinely scrubbed
   work only.
2. **`aria-label` on a bare `<span>` is prohibited ARIA.** The first `SplitText`
   labelled the wrapper, which dropped accessibility 100 → 96. Replaced with a
   real visually-hidden copy of the string plus `aria-hidden` on the animated
   spans. Back to 100.
3. **The reveal observer stranded content.** Measured: after one instant jump to
   the bottom, **22 of 28 reveals stayed at `translateY(24px)` forever** — a
   plain observer never fires for elements you skip past, which is what an
   anchor jump, a hash deep-link or restored scroll all do. Fixed with a
   100000px top `rootMargin`, so "already scrolled past" counts as intersecting.
   Now 28 of 28, nothing stranded, nothing stuck mid-transform.

### Verified

| | Result |
|---|---|
| **Curtain LCP delta** | **0.0s** — 2.8s with it, 2.8s without, two runs each. The greeting is painted beneath it, so the LCP element never waits |
| Content behind the curtain | **1,449 words** rendered at 150ms |
| Curtain semantics | `aria-hidden` + `inert`, removed from the DOM after lifting |
| Second visit, same session | Not shown |
| Reduced motion | No `data-motion`, no curtain, characters at `transform: none`, greeting readable |
| Character reveal | Mid-animation at 120ms (90.7px), settled to `none` |
| Reveals | 28 of 28 fire, 0 stranded, 0 stuck, do not replay on scroll-back |
| **Lenis active on desktop** | `html.lenis` present, `pointer: coarse` false |
| **Lenis inactive on touch** | Confirmed under device emulation — native momentum kept |
| **Expand contract with Lenis live** | Scroll restored 1579 → 1579, focus returned to the exact card |
| Keyboard | Enter opens, focus traps, Escape closes and returns focus |
| Scroll framerate | **59.9 fps median, 0 frames over 20ms** — at 1× and at 4× CPU throttle |
| Lighthouse | perf 96, **a11y 100**, best-practices 96, SEO 100, **CLS 0**, TBT 0ms, 308 KiB |
| Deleted line | `"I build things that measure something, then react to it."` — gone from source **and** docs |

**Weight added by this revamp: 8 KiB** (300 → 308 KiB), against a ~14 kB budget.
LCP unchanged at 2.8s.

### The opening sequence, extended

The greeting animated on arrival but the beats under it did not — the hero was a
headline animation followed by static content. All four beats now arrive in
sequence, driven by the same `data-play` attribute and CSS `transition-delay`,
so it costs no extra JavaScript and no observer (they are above the fold by
definition; the trigger is the page being ready, not scroll position).

Delays live in `motion.ts`: `heroBeatDelayMs` 520, `heroSupportDelayMs` 640,
`heroCurrentlyDelayMs` 780.

**Measured, frame by frame** (CDP, transform sampled over one load):

| t | Curtain | Greeting chars | Second beat | Support | Currently |
|---|---|---|---|---|---|
| 120ms | on | `y=45.7` | `y=24` | `y=24` | `y=24` |
| 400ms | on | `y=0.57` | `y=24` | `y=24` | `y=24` |
| 700ms | **gone** | settled | `y=0.94` | `y=13.7` | `y=24` |
| 1100ms | gone | settled | settled | settled | `y=0.003` |
| 2000ms | gone | settled | settled | settled | settled |

Reveal scope also widened past headings-and-lists: the About block reveals as
one unit (`mask={false}` — it contains a portrait frame), and the three
credentials columns stagger. Prose inside About still appears plainly, so the
rule is still "structure animates, body copy does not".

**Reduced motion, re-verified after all of it:** no curtain, **0** transformed
`.arrive`, **0** transformed `.reveal`, **0** shifted characters, Lenis not
running, and **0** elements hidden at the page bottom. Nothing to get stuck in.

Final: perf 96, a11y **100**, LCP 2.8s, **CLS 0**, TBT 0ms, 309 KiB,
**59.9 fps at 1× and 4×**, expand contract intact (scroll 1579 → 1579).

### Contrast pass

The four dark surfaces were seven hex steps apart (`#0c0b0a` → `#141211` →
`#1b1917` → `#232120`), so a recessed section read as the same ground as the one
above it and the entire depth model was working invisibly. Secondary text was
also sitting near the AA floor and reading as washed out rather than as quiet.

Recomputed, not eyeballed:

| | Before | After |
|---|---|---|
| Dark, worst ink ratio | 4.70 | **5.18** |
| Dark, `--ink-muted` on base | 6.72 | **9.02** |
| Dark, `--ink-faint` on base | 5.47 | **7.00** |
| Dark, adjacent surface steps (ΔL%) | 0.28 / 0.37 / 0.56 | **0.41 / 0.95 / 1.03** |
| Light, worst ink ratio | 4.63 | **5.24** |
| Light, `--ink-muted` on base | 6.52 | **8.33** |
| Light, sunk→base step (ΔL%) | 11.06 | **19.21** |

Rules, edges and lips were raised to match — a stronger palette with the old
hairlines would have left the structure looking weaker than the type. Accent
moved to `#ff6a44` (dark) and `#b02a08` (light), both still clearing 4.5:1 on
all four surfaces.

**Verification note:** the light-theme screenshot harness broke silently — its
regex for stripping the inline resolver no longer matched after the script grew
the motion gate, so the resolver ran and overrode the forced attribute, and the
"light" capture came out dark. Captures now go through the real path: set
`localStorage.theme`, reload, screenshot. Slower, and it cannot drift out of
sync with the code.

---

## 15. The z-plane model, honestly accounted

§1.4 specified three planes — far `0.85×`, mid `1.00×`, near `1.06×` — and a
general parallax layer was on the build list. **It was not built, and it should
not be**, because the decisions taken after that spec removed everything that
would have moved in it:

- **Project covers explicitly do not drift** (v4 Batch E: "mask reveal on entry,
  no scroll drift"), which was the main near-plane content.
- **The signal trace is deleted** (v3.1 Batch C), which was the main far-plane
  content.
- **Section grounds are full-bleed backgrounds.** Offsetting them at 0.85×
  either exposes a gap at the ends of the range or requires overscan on a
  surface that has no texture to reveal.

What survives implements the model with two elements rather than a system: the
**hero receding on the far plane** (native scroll timeline, `scale 1 → 0.966`,
`opacity 1 → 0.14`, verified at five scroll positions) and the **work section
rising on the near plane** as its reveals fire. The overlap between them is the
handoff §3.1 describes.

Building a parallax layer with nothing left to put in it would have been
decoration, which is the thing every brief in this project has asked me to cut.

## 16. Reduced-motion pass, all seven sections

| Section | Animated elements | Mid-transform | Faded |
|---|---|---|---|
| hero | 15 | **0** | **0** |
| work | 10 | **0** | **0** |
| about | 2 | **0** | **0** |
| experience | 7 | **0** | **0** |
| skills | 4 | **0** | **0** |
| credentials | 3 | **0** | **0** |
| contact | 6 | **0** | **0** |

47 elements that animate under normal conditions; under `reduce` none of them
is transformed, none is faded, the curtain never renders, the hero's recede
resolves to `transform: none`, and Lenis does not start.

## 17. Load filmstrip (simulated 4G, 4× CPU)

| Frame | State |
|---|---|
| **375ms** | Greeting mid-reveal; **second beat and "Currently" already readable** |
| 750ms | Greeting resolved, full stop in accent |
| 1125ms | Full stop still accent |
| **1500ms** | Full stop cooled to ink — sequence complete |

FCP 905ms · Speed Index 911 · LCP 2774ms · TBT 8ms · **CLS 0**

The frame that matters is the first: content is legible while the animation is
still running, which is the whole "content is never hostage" requirement stated
as a picture instead of a claim.
