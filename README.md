# fatihweb — portfolio 2026

Personal portfolio of Muhammad Fatih Zamzami. Next.js 16 · React 19 ·
Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · Motion · next-themes ·
next-view-transitions.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## Pages — one system, distinct identities

Every page shares the DNA (tokens, Newsreader + Hanken Grotesk, the `annot`
voice, hairlines, easings/durations, the index rail) but has its own
concept and signature interaction:

| Route | Concept | Signature |
|---|---|---|
| `/` | The index — hero, pinned manifesto scrub, horizontal work shelf, closing CTA | First-load calibration counter; pinned word-by-word statement |
| `/work` | List-to-preview browser: oversized title rows | Cursor-following preview crossfade (inline images on touch/reduced-motion) |
| `/work/[slug]` | Scroll-told case study | Full-viewport intro beat with looming drifting numeral + reading meter |
| `/about` | Editorial dossier: file header, drop-cap narrative, sticky figure | The record as a scroll-drawn timeline |
| `/contact` | Transmission sheet on graph paper; the email *is* the headline | Premium form: floating labels, inline validation, designed success state |
| 404 | "Signal lost" | Magnetic drifting numeral |

**Navigation** is a fixed index rail (left on desktop, bottom strip on
mobile) with a **progressive edge blur**: two masked `backdrop-filter`
layers (`blur-edge-l` / `blur-edge-b` utilities) so content softens
gradually under the nav instead of hitting a frosted slab. Theme-aware via
`--background-translucent`. Routes crossfade with the View Transitions API
(same crossfade the theme toggle uses).

## Where things live

- **Copy & facts** — everything you'd ever edit lives in
  [src/content/](src/content/): `profile.ts`, `projects.ts`,
  `experience.ts`, `capabilities.ts`. No prose is hard-coded in components.
  Items marked `[NEEDS REVIEW]` are original copy awaiting sign-off.
- **Images** — every image slot is a spec-driven `<Placeholder>`; the full
  shopping list is in [PLACEHOLDERS.md](PLACEHOLDERS.md). To swap one in,
  add the asset to `public/` and replace the `<Placeholder>` with a
  `next/image` inside the same `<ImageReveal>` wrapper.
- **Home sections** — [src/components/sections/](src/components/sections/);
  page-specific pieces in `src/components/about|work|contact/`.
- **Primitives** — reveal/parallax/split-text/marquee/magnetic/cursor in
  [src/components/motion/](src/components/motion/) and
  [src/components/ui/](src/components/ui/).
- **Contact form** — UI, validation, and success state are fully wired;
  the send is simulated. `[NEEDS REVIEW]` point `submitMessage()` in
  [ContactForm.tsx](src/components/contact/ContactForm.tsx) at a real
  endpoint (API route, Resend, Formspree…).

## Theming

Both themes are designed, not inverted: warm paper light, lamp-lit dark.
Semantic tokens (`background / surface / foreground / muted / border /
accent`) live as CSS vars on `:root` / `.dark` in
[globals.css](src/app/globals.css), surfaced through `@theme inline`, with
`@custom-variant dark`. `next-themes` resolves the theme before first paint
(system default, manual choice persisted, no flash); the toggle flips
inside a View Transitions crossfade.

## Design system in one paragraph

The direction is **"Schematic Editorial," refined**: warm paper (or warm
off-black), hairline rules over shadows, annotations in a small tracked
voice (`annot`), oversized Newsreader display type with rationed italics,
Hanken Grotesk for body and UI, and exactly one accent reserved for
interaction states and live markers. Five type steps, one gutter, one
section beat. Three easings and four durations defined in `@theme` and
mirrored in [src/lib/motion.ts](src/lib/motion.ts) /
[src/lib/gsap.ts](src/lib/gsap.ts) so CSS, Motion, and GSAP speak one
motion language. Every animation has a calm `prefers-reduced-motion`
fallback. Full rationale in [DESIGN.md](DESIGN.md).
