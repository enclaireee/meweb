# Design system — "Schematic Editorial", refined

## The direction

The site reads like a beautifully set engineering document: warm paper (or a
lamp-lit dark studio), hairline rules, annotations in a small tracked voice,
and oversized editorial serif headlines. The refinement pass kept the idea
and removed the noise: **cleaner UI, more expensive UX** — fewer elements,
more polish in how the remaining ones behave.

Rules that keep it coherent:

1. **One focal point per view.** Every viewport has a single thing to look
   at; everything else is annotation.
2. **Semantic color, one accent.** Components only speak `background /
   surface / foreground / muted / border / accent`. Accent is reserved for
   interaction states (active nav, hover, cursor, focus, selection) and live
   markers — never decoration.
3. **Two voices of type.** Newsreader (variable, optical sizing, true
   italics) speaks; Hanken Grotesk carries body and the `annot` label voice
   (uppercase, tracked, tabular numerals). Display italics are rationed to
   two gestures site-wide (hero surname, contact close).
4. **Flat + hairline.** No shadows, no radii. Depth comes from 1px borders
   and surface tints.
5. **Motion is measurement.** UI feedback is quick and interruptible;
   long durations belong only to signature moments.

## Themes

Both designed, neither inverted. `next-themes` sets `.dark` on `<html>`
before paint (no FOUC), defaults to system, persists manual choice. The
toggle flips inside a View Transitions crossfade (skipped under reduced
motion). `color-scheme` is set per theme for native UI.

| Token | Light | Dark |
|---|---|---|
| `--background` | `#f4f1ea` warm paper | `#16130f` warm off-black |
| `--surface` | `#ebe7dc` | `#211d17` |
| `--foreground` | `#1c1a15` | `#ece8dd` |
| `--muted` | `#6c6557` | `#a39c8a` |
| `--border` / `-faint` | ink @ 14% / 6% | bone @ 16% / 7% |
| `--accent` | `#d8430c` | `#ff5c22` |

Defined as CSS vars on `:root` / `.dark`, surfaced through `@theme inline`,
with `@custom-variant dark` for class-based dark utilities.

## Type scale — five steps, nothing else

`--text-hero` (clamp 2.5–7.5rem, w500) · `--text-title` (1.875–4rem, w500) ·
`--text-heading` (1.25–1.75rem, w500) · `--text-lead` (1.06–1.31rem) ·
`--text-caption` (0.69rem, via the `annot` utility). Body is the Tailwind
base. Negative tracking is baked into the hero/title tokens.

## Rhythm

One gutter (`--spacing-gutter`, clamp 1.5–5rem → `px-gutter`) and one
section beat (`--spacing-section`, clamp 6–10rem → `py-section`). Grids are
12-column with `gap-x-4`.

## Motion language

| Token | Value | Use |
|---|---|---|
| `--ease-out-soft` | `0.25,1,0.5,1` | UI feedback |
| `--ease-out-expo` | `0.16,1,0.3,1` | Entrances, reveals |
| `--ease-inout-soft` | `0.65,0,0.35,1` | Layout shifts, theme crossfade |
| `fast` 150ms / `base` 300ms | | hovers, toggles, UI state |
| `gesture` 700ms | | content entrances |
| `signature` 1100ms | | hero type, image wipes, page veils |

Mirrored in JS (`src/lib/motion.ts` for Motion, registered `CustomEase`
names in `src/lib/gsap.ts` for GSAP) — one language across CSS, Motion, and
GSAP. Stack: Lenis (GSAP-ticker-driven) + GSAP/ScrollTrigger/SplitText +
Motion. Every primitive degrades to a calm fade (or nothing) under
`prefers-reduced-motion`.

## Primitives (`src/components/`)

`providers/SmoothScroll` · `providers/Theme` · `motion/Reveal·Stagger` ·
`motion/SplitLines` · `motion/Parallax` · `motion/ImageReveal` ·
`motion/Magnetic` · `motion/Marquee` · `ui/Cursor` (8px dot → 56px labeled
disc over `[data-cursor]`) · `ui/ThemeToggle` · `ui/NavRail` ·
`ui/Placeholder` (spec-driven from `content/placeholders.ts`).
