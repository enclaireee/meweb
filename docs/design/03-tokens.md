# Phase 3 — Design System (Control Room)

Token layer lives in `src/app/globals.css` (CSS custom properties + Tailwind v4
`@theme inline`); the JS mirror for Motion is `src/lib/motion.ts`. Rendered
live at **`/dev/tokens`** — both themes, every token.

## Color — semantic, dark-default

The console is dark; `.light` ("daylight ops") is a *designed print* of the
same panel, not an inversion — that's why light-mode accent is a different hue
family (ink-amber) instead of raw amber, which fails contrast on paper.
Signal amber was chosen over phosphor green deliberately: green terminal =
hacker costume; amber = industrial instrumentation (annunciator panels, HMIs).

WCAG ratios (computed, script in repo history / scratchpad):

| Pair | Dark | Light | AA (≥4.5) |
|---|---|---|---|
| fg / bg | #E8ECEF · 16.06:1 | #16191C · 16.45:1 | ✓ |
| fg / bg-subtle | 14.87:1 | 14.87:1 | ✓ |
| fg-muted / bg | #9AA6B0 · 7.68:1 | #566069 · 5.98:1 | ✓ |
| fg-muted / bg-subtle | 7.11:1 | 5.41:1 | ✓ |
| accent / bg (as text) | #FFB000 · 10.41:1 | #8A5800 · 5.63:1 | ✓ |
| accent-fg / accent | #14171A · 9.82:1 | #FFFFFF · 6.04:1 | ✓ |
| ok / bg | #4CC38A · 8.61:1 | #1A7F37 · 4.73:1 | ✓ |
| fail / bg | #FF6369 · 6.58:1 | #C43C35 · 4.84:1 | ✓ |

`ok`/`fail` exist because the concept renders *real* status (build state,
uptime-style readouts) — they are banned for decoration. `--ring` = accent.
Theme switching: `:root` = dark (default), `.light` class overrides; a `light:`
variant exists for the rare component that needs it.

## Type — IBM Plex Mono (display + data) / IBM Plex Sans (body)

One superfamily designed together → shared metrics, zero pairing risk. The
personality move: **mono at poster scale** for display/headings — instrument,
not IDE. Sans carries reading text because mono body copy over four case
studies is punishment. Self-hosted via `next/font`, weights 400/500/600 (sans)
and 400/500/700 (mono), `display: swap`.

Six steps, fluid 360→1440px, leading/tracking per step (see `@theme`):
`label` (11px mono caps, +0.08em — the machine-tag voice, exposed as the
`label` utility) · `body-s` (13) · `body` (15→16) · `lead` (17→21) ·
`h` (26→40) · `display` (44→104, lh 0.95, −0.02em).

## Space — base 8px, ratio 1.5

`s1…s9` = 8, 12, 18, 28, 40, 60, 92, 136, 204. One geometric scale; s8/s9 are
the section beats. Rule: layout spacing uses `s*` (+ `gutter`, fluid 18→40px);
Tailwind's numeric scale only for sub-8px optical nudges.

## Radius, border, elevation

Radius **0** everywhere (`--radius-*: initial` — rounded utilities are dead).
Elevation is **never a shadow**: raised = `bg-subtle` + `border`, that's the
whole z-language. Instruments have edges, not glows. Hairlines: `border`
(14–16% fg) and `border-faint` (6–7%) for internal grid lines.

## Motion — 3 easings, 4 durations, 2 springs

Durations: fast 120 / base 240 / slow 400 / page 600ms (page transitions are
the only exemption from the 400ms cap). Easings: `out-expo` (entrances),
`out-quart` (hovers), `mech` (panel travel), plus `--ease-step: steps(3, end)`
for discrete readout changes (plain var — Tailwind's `@theme` drops comma'd
values). Springs (`snappy`, `gentle`) live in `src/lib/motion.ts`; a duration
or easing not in the vocabulary doesn't exist.

**Reduced motion is a token-layer concern:** the media query collapses all
duration tokens to 1ms (not 0, so `transitionend` still fires). JS animations
must gate via Motion's `useReducedMotion`.

## Grid

`max-w-console` = 1536px full console width; fluid `gutter` padding; Tailwind
default breakpoints (640/768/1024/1280); 12-col grid composed per-layout with
`grid-cols-*` — no bespoke column tokens until a layout proves the need.

## Base layer

Global `:focus-visible` = 2px accent outline, offset 2 (never removed).
`::selection` = accent/accent-fg. `color-scheme` set per theme.
