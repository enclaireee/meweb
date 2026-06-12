# Design system — "Schematic Editorial"

## The direction

The site reads like a beautiful engineering document: the warm paper and
hairline grids of a lab notebook, annotated in monospace like a technical
drawing, headlined in an oversized editorial serif. It maps directly to who
Fatih is — an engineer who moves between volts and pixels — and it commits to
one voice instead of borrowing the dark-gradient template look.

Three rules keep it coherent:

1. **Paper, ink, one signal.** Everything is warm off-white and near-black.
   Signal orange (`--color-signal`) is reserved for the few things that
   matter: the cursor, live markers, key interactions. If everything is
   orange, nothing is.
2. **Two voices of type.** Fraunces (display serif, optical-size + WONK axes)
   speaks; IBM Plex Mono annotates — captions, figure numbers, measurements,
   micro-copy. Archivo carries body text quietly. The `annot` utility is the
   monospace voice; use it for every label.
3. **Motion is measurement.** Things slide along axes, wipe behind masks, and
   scrub with scroll — like instruments responding. No bounce, no random
   springs on layout, no effect that couldn't belong to the same machine.

## Tokens (globals.css `@theme`)

| Token | Value | Use |
|---|---|---|
| `--color-paper` / `paper-deep` | `#f2eee5` / `#e7e2d4` | Backgrounds, raised panels |
| `--color-ink` / `ink-soft` | `#1a1813` / `#5f5a4c` | Text, secondary text |
| `--color-signal` | `#e8490f` | Accent — sparingly |
| `--color-line` / `line-faint` | ink @ 16% / 7% | Hairlines, paper grid |
| `--text-hero` / `display` / `title` / `annot` | fluid clamps | Type scale |
| `--ease-out-expo` | `0.16,1,0.3,1` | Entrances, reveals (default) |
| `--ease-inout-soft` | `0.65,0,0.35,1` | Position/layout shifts |
| `--ease-snap` | `0.83,0,0.17,1` | Small UI state changes |
| `--duration-fast/base/slow/drama` | 300/600/1000/1400ms | Tempo scale |

The same curves/durations exist as JS in `src/lib/motion.ts` (for Motion) and
as registered `CustomEase` names in `src/lib/gsap.ts` (for GSAP) — one motion
language across all three layers.

## Stack

- **Lenis** smooth scroll, driven by the GSAP ticker (`SmoothScroll` provider)
  so ScrollTrigger stays in sync. Disabled under `prefers-reduced-motion`.
- **GSAP 3.15 + ScrollTrigger + SplitText + CustomEase** for scrubbed,
  pinned, and split-text work.
- **Motion (motion/react)** for in-view entrances, springs, magnetic hover.

## Primitives (`src/components/`)

| Component | What it does |
|---|---|
| `providers/SmoothScroll` | Lenis + GSAP ticker integration, reduced-motion aware |
| `motion/Reveal`, `Stagger`/`StaggerItem` | Fade-rise entrances, staggered groups |
| `motion/SplitLines` | Masked line-by-line heading reveal (SplitText) |
| `motion/Parallax` | Scroll-scrubbed vertical drift |
| `motion/ImageReveal` | Clip-mask wipe + de-scale for any media |
| `motion/Magnetic` | Pointer-magnetic wrapper (mouse only) |
| `motion/Marquee` | CSS-only infinite marquee |
| `ui/Cursor` | Crosshair dot cursor, grows + labels on `[data-cursor]` |
| `ui/Placeholder` | Schematic-styled image stand-in, spec-driven from `content/placeholders.ts` |

Every primitive degrades to a calm fade (or nothing) under
`prefers-reduced-motion` — that's non-negotiable in this system.

## Utilities

`annot` (mono label voice) · `bg-grid-paper` (engineering grid) ·
`font-display-wonk` (Fraunces with wonk forms at display sizes) ·
`no-scrollbar` · `marquee-track`.
