# v3.1 — Hero showpiece: the width-axis settle

Expands §5 of the v4 motion spec. Everything else in v1–v4 stands: data layer,
expand contract, footer, contact, banned clichés, performance budgets,
reduced-motion rules, the two-curve/three-band motion system.

From 6 interview batches / 24 answered questions, after a direction change from
a domain-led (control systems) flex to a designer-led one.

---

## 1. The idea

**"Hi, I'm Fatih." doesn't move into place. It resolves into shape.**

Each character rises through a mask *and* travels Archivo's width axis from
condensed 82 to normal 100, left to right, 30ms apart. The type reads as
something being cut rather than something being animated. The full stop after
the name lands in the accent colour and cools to ink — one accent appearance,
on the smallest element, marking the instant the line is finished.

**Why it is not generic:** it only exists because the site already runs a
variable typeface with a real width axis. Lift it onto a portfolio set in Inter
and there is nothing to animate. That is the generic check, answered.

---

## 2. Beat sheet

| Beat | t | What | Easing |
|---|---|---|---|
| 0 — paint | 0ms | Whole page painted. Greeting at full opacity, final position, `wdth: 82`, masked. Curtain over it. | — |
| 1 — release | 400ms | `H` begins: `translateY 105% → 0`, `wdth 82 → 100`. Each subsequent character +30ms. | `--ease-out` |
| 2 — name | 550ms | `Fatih.` begins the identical motion, offset +150ms from line one. | `--ease-out` |
| 3 — curtain | 600ms | Curtain lifts upward, overlapping beat 1–2 by ~200ms. One gesture, one direction. | `--ease-narrative` |
| 4 — lock | ~1070ms | The full stop settles last. It lands `--accent`, holds 120ms, fades to `--ink` over 400ms. | `--ease-out` |
| 5 — beats | 520 / 640 / 780ms | Second beat, support line, Currently — the v4 `.arrive` cascade, unchanged. | `--ease-out` |

Character duration `520ms` (`--dur-narrative`). Stagger `30ms`
(`listStaggerMs × 0.75`, the existing rule). **Nothing new enters the motion
system** — same two curves, same three bands, same stagger base.

### 2.1 The axis is monotonic

`wdth` travels 82 → 100 and stops. **No overshoot.** Overshooting means passing
100 into expanded and returning, which visibly bulges the letterforms — the
distortion named in Batch A as the thing that would embarrass you. Weight does
not travel at all: one property doing something exact.

---

## 3. Scroll map

The hero owns **less than one viewport** and never pins.

| Scroll progress | Greeting (far plane) | Work (near plane) |
|---|---|---|
| 0% | `scale 1`, `opacity 1`, `wdth 100` | below fold |
| 25% | `scale 0.99` | — |
| 50% | `scale 0.97`, `opacity 0.5` | risen ~70% |
| 75% | `scale 0.96`, `opacity 0.1` | risen ~95% |
| 100% | `opacity 0` | in place |

**The axis holds at 100 throughout the exit.** The type stays finished once it
is finished; un-resolving it would mean the last thing a visitor sees of your
name is it becoming less resolved.

Both planes are live from 45–60%: the greeting receding while the first work
element rises past it. That overlap is the handoff.

Driven by `useScroll`/`useTransform`. `transform` and `opacity` only.

### 3.1 Z-planes

Unchanged from v4 §1.4 — far `0.85×`, mid `1.00×`, near `1.06×`, compressed
toward 1.0 below 768px. The greeting is **far**; the work section is **near**.

---

## 4. Interaction

Pointer movement over the hero perturbs the axis by **±3%** and it decays back
to 100 within ~600ms of the pointer stopping. It can be disturbed; it always
returns. The listener attaches only while the hero is on screen and detaches
when it leaves.

No pointer on touch, which is correct: touch gets the scroll behaviour instead.

---

## 5. Fallback tiers, each a designed state

| Tier | State |
|---|---|
| **Reduced motion** | The resolved composition, instantly. `wdth: 100`, no mask offset, no curtain. Identical to the static slice — which is why the static slice is built first. |
| **JS disabled** | Same. The hidden start state lives under `html[data-motion]`, which is only set by script, so no-JS never has anything to un-hide. |
| **Low power** (`deviceMemory ≤ 4`, `saveData`) | Resolve plays — it is a CSS transition on 11 spans and costs nothing. **Pointer nudge disabled**, because continuous tracking is what actually costs. |
| **Font fails to load** | Curtain exits on its 600ms cap regardless; type resolves in the fallback stack with no axis travel. Legible, just not choreographed. |
| **Axis unsupported** | `@supports (font-variation-settings: 'wdth' 100)`. Without it the characters mask-reveal only. |

---

## 6. Dependencies and cost

**No new dependency.** No canvas, no WebGL, no library.

| Item | Cost |
|---|---|
| Component code | ~1 kB — `SplitText` already exists; this adds a CSS custom property and a pointer hook |
| Archivo `wdth` axis | **Unknown until measured.** v3 dropped this axis because it cost LCP on the headline |
| **Removed:** `SignalTrace.tsx` | −150 lines, −1 canvas, −1 rAF loop |

### 6.1 The kill condition

v3 removed the width axis for a measured reason. This spec brings it back with a
stated exit: **measure LCP three runs with the axis and three without. If the
delta exceeds 0.1s, the axis is cut** and the choreography falls back to the
mask reveal alone — same beats, one less property. The concept is allowed to
lose to the number.

---

## 7. Restraint pass

**The one idea: type resolving on the width axis.** Everything else in the hero
supports it — the mask is how the characters enter, the stagger is reading
order, the accent is a full stop.

**Three things cut:**

1. **The signal trace** — the v3 hero. It is the tech flex, and this is the
   designer flex; keeping both is two ideas in one viewport. Deleted, not hidden.
2. **Axis overshoot.** A physical settle past 100 and back is satisfying and is
   also literally distortion at 144px.
3. **Weight-axis travel.** Light→semibold alongside width would be richer and is
   also a fade-in substitute, which the site bans everywhere else.

## 8. Generic check

Would this hero work unchanged on someone else's portfolio? **Only if they also
run a variable typeface with a width axis, at display scale, with a
two-line greeting.** The animation has no content of its own to lift — it is a
property of this typeface at this size.

**What changed because of this check:** the first draft had the characters fade
as they widened. That made it portable — a fade works on any face — and it was
the banned opacity ramp besides. The fade came out; the axis carries it alone.

---

## 9. Build order

1. **Static composition** — the resolved end state, no motion. Must stand alone;
   it is also the reduced-motion and no-JS state.
2. Axis wiring + LCP measurement against the kill condition.
3. Entry sequence — mask + axis + accent full stop.
4. Scroll choreography — far/near planes.
5. Pointer nudge + tier gating.
6. Delete `SignalTrace`, measure, verify.

Gates every slice: **CLS 0**, 60fps at 4× CPU, LCP ≤ 2.8s, and time-to-content
on a hard scroll **under 1 second**, measured and reported.

---

## 10. Build log

### The kill condition fired, twice, before it passed

| Approach | LCP | Δ vs baseline | Weight | Verdict |
|---|---|---|---|---|
| Baseline, no axis | 2.76s | — | 309 KiB | — |
| `axes: ["wdth"]` on the primary font | 3.16s | **+0.396s** | 362 KiB | **CUT** |
| Axis as a separate non-preloaded face | 3.31s | **+0.547s** | 397 KiB | **CUT** — ships two font files |
| **4.7 KB subset, preloaded** | **2.76s** | **−0.004s** | 313 KiB | **KEEP** |

Three runs each. The subset is `pyftsubset` over the full variable font, eleven
glyphs, both axes intact: **90,096 → 4,732 bytes, a 95% reduction.** Preloading
it mattered: discovered through CSS it still cost +0.143s, because the LCP
element depends on it.

Regenerate with `scripts/build-greeting-font.sh` — **required if the greeting
copy ever changes**, because the subset contains only those glyphs and anything
else silently falls back to the axis-less primary face.

### Two defects the spec did not anticipate

1. **The width axis is a layout change, not a transform.** Animating glyph
   advances reflows the line, and it measured **CLS 0.002** — the first non-zero
   CLS this project has recorded. Fixed by freezing each mask at its settled
   width before the axis moves, so a character widens inside its own box and
   never displaces its neighbours. One forced layout, once, while the curtain is
   still up. Back to **CLS 0**.
2. **A second CSS rule silently killed the animation.** The v4
   `[data-play] .split-char { transition: transform … }` rule survived and came
   later in the cascade, and a `transition` declaration *replaces* rather than
   extends — so `--wdth` was dropped from the list and the axis jumped from 82
   to 100 with no interpolation. The transform still animated, which is what
   made it look like it was working. Merged into one rule; the same trap applies
   to `.split-final`, which repeats all three properties for that one character.

### Measured

| | Result |
|---|---|
| Axis travel | 82 → 100, verified mid-flight at **95.29** at 150ms |
| Accent full stop | lands `rgb(255,106,68)`, cooling at 1050ms, ink by 1750ms |
| Mask widths pinned | 13/13 |
| LCP | **2.8s, −0.004s vs the pre-hero baseline** |
| CLS | **0** |
| Weight added | **+4 KiB** (313 vs 309 KiB) |
| a11y | **100** |
| Scroll framerate | 59.9 fps, 0 frames over 20ms, at 1× and 4× |
| Expand contract | intact — scroll 1579 → 1579, focus returned |
| Removed | `SignalTrace.tsx`, its canvas, its rAF loop, its config entry |

### Scroll exit: JS wrapper → native scroll timeline

Built first with Framer Motion `useScroll`, per the spec. Wrapping the LCP
element in a client motion component measured **+0.147s LCP** — more than the
curtain, the character reveal, the width axis, the accent and the pointer nudge
put together.

Diagnosis took four eliminations, all measured: type scale (144 vs 168px:
+0.002s, not it), removing the support paragraph (2.91s either way, not it),
`will-change` (2.91s either way, not it), and finally the wrapper itself.

Replaced with a native CSS scroll-driven animation — `animation-timeline: view()`
with `animation-range: exit`. This is precisely the case the Phase 1 research
identified for native timelines: purely scrubbed, no fire-once semantics, no
coordination with anything else. It runs off the main thread and ships zero
JavaScript.

| | LCP | Weight |
|---|---|---|
| `useScroll` wrapper | 2.91s | 317 KiB |
| **Native scroll timeline** | **2.76s** | **313 KiB** |

Verified scrubbing at 0/25/50/75/100%: `scale 1 → 0.966`, `opacity 1 → 0.14`.

### Art-director pass

**Is it precise or loud?** Precise — it was quiet to a fault at 1440px.

**Three weakest beats, fixed:**
1. The greeting occupied the left third of the screen despite being specced to
   fill the fold. 144 → 168px (measured free: +0.002s).
2. "Currently" floated in the far-right column with a void between it and
   everything else. Now baseline-aligned with the beat it belongs to.
3. The nav overflowed at 320px — wordmark plus four anchors plus the toggle was
   299px of content in a 320px viewport, pushing the document to 399px wide. The
   wordmark hides below 380px; the greeting states the name anyway.

**Removed: the third line.** The support paragraph restated the About section
almost verbatim and was the quietest element in the loudest position. Cutting it
lets the greeting hold the fold alone. **This reverses a v4 Batch I choice** —
it is one block in `page.tsx` to restore if you disagree.

### Phase 5 actuals

| | Result |
|---|---|
| **Time to content**, one hard scroll | **~400ms** (target: under 1s) |
| Hero height | 628px = **0.70 viewports** |
| LCP | **2.76s, −0.002s vs the pre-hero baseline** |
| CLS | **0** |
| Weight added by the entire hero | **+4 KiB** |
| a11y / perf | **100** / 96 |
| Scroll framerate | 59.9 fps, 0 frames over 20ms, 1× and 4× |
| Viewports 320 / 768 / 1440 / ultrawide | No overflow, line breaks hold, 56 → 168px |
| Greeting selection | copies **"Hi, I'm Fatih."** once |
| Greeting accessible name | **"Hi, I'm Fatih."** — one string, not per character |
| Fallback: reduced motion | Resolved composition, 0 stranded elements, no curtain |
| Fallback: subset font blocked | Greeting resolves at `wdth 100` in the primary face |
| Fallback: JS disabled | Full page renders |
| Expand contract | intact — scroll 1522 → 1522, focus returned |
