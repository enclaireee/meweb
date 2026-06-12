# fatihweb — portfolio 2026

Personal portfolio of Muhammad Fatih Zamzami. Next.js 16 · React 19 ·
Tailwind CSS v4 · GSAP + ScrollTrigger · Lenis · Motion.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production build
npm run lint
```

## Where things live

- **Copy & facts** — everything you'd ever edit lives in
  [src/content/](src/content/): `profile.ts`, `projects.ts`,
  `experience.ts`, `capabilities.ts`. No prose is hard-coded in components.
  Items marked `[NEEDS REVIEW]` are original copy awaiting your sign-off.
- **Images** — every image slot is a spec-driven `<Placeholder>`; the full
  shopping list is in [PLACEHOLDERS.md](PLACEHOLDERS.md). To swap one in,
  add the asset to `public/` and replace the `<Placeholder>` with a
  `next/image` inside the same `<ImageReveal>` wrapper.
- **Sections** — [src/components/sections/](src/components/sections/), one
  file per section, assembled in [src/app/page.tsx](src/app/page.tsx).
- **Primitives** — reveal/parallax/split-text/marquee/magnetic/cursor in
  [src/components/motion/](src/components/motion/) and
  [src/components/ui/](src/components/ui/).

## Design system in one paragraph

The direction is **"Schematic Editorial"**: warm paper and hairline grids of
an engineer's lab notebook, annotated in IBM Plex Mono (the `annot` utility),
headlined in oversized Fraunces with its wonky optical-size forms, body in
Archivo, and exactly one accent — signal orange — reserved for the things
that matter. All tokens (palette, fluid type scale, named easing curves and
durations) are defined in `@theme` in
[src/app/globals.css](src/app/globals.css) and mirrored for JS in
[src/lib/motion.ts](src/lib/motion.ts) / [src/lib/gsap.ts](src/lib/gsap.ts),
so CSS, Motion, and GSAP all speak one motion language. Every animation has
a calm `prefers-reduced-motion` fallback. Full rationale in
[DESIGN.md](DESIGN.md).
