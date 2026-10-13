# Tech architecture

How to wire the design. No code here, only the shape of it. **Before writing any Next.js code, read `node_modules/next/dist/docs/01-app`** (the repo runs Next 16 and React 19; see `AGENTS.md`).

## Stack
- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4 (already scaffolded).
- Rendering: **CSS and SVG/raster images**. No three.js, no WebGL, no canvas for the world.
- Motion: CSS transforms driven by custom properties. One small `requestAnimationFrame` loop while a move runs. No animation library is required.
- State: a tiny store (React state or `useSyncExternalStore`) holding `stop`, `phase`, `reducedMotion`, `profile`.
- Fonts: `next/font` (Fraunces, Figtree).
- Images: static files in `public/`; `sharp` (already installed) for raster export scripts.
- Tests: Vitest for pure logic, Playwright for browser checks (both already in `package.json` at the time of writing; the old `playwright.config.ts` and `e2e/` were removed from the working tree and need recreating when tests start).

### Dependencies that are no longer needed (needs the user's OK before removal)
`three`, `@react-three/fiber`, `@react-three/drei`, `gsap`, `lenis`, `zustand` and any 3D helper types appeared in `package.json` from the older approach. Nothing in this design requires them. Do not remove or install anything until asked.

## Folder structure (target)
```
src/
  app/
    layout.tsx           fonts, metadata, <html data-motion>
    page.tsx             renders <River/>; server component
    globals.css          tokens, base, frame, layer rules
    opengraph-image.*    optional
  components/
    river/
      River.tsx          client: stage, state, input
      Stage.tsx          sets CSS vars, mounts layers
      Layer.tsx          one layer wrapper (reads --s)
      Tile.tsx           one art tile (img or inline svg)
      Water.tsx          the 3 water strips
      Fireflies.tsx      F1 F2 F3
      Traveller.tsx      rig, states
      Creatures.tsx      ambient life per stop
    frame/
      Frame.tsx          rings, ornaments, grain
    ui/
      Tag.tsx  Card.tsx  ImageSlot.tsx  StopDots.tsx  NavButtons.tsx
      TitlePlate.tsx  Footer.tsx  Hint.tsx  MotionToggle.tsx
    stack/
      StackedView.tsx    no-JS and fallback document
  content/
    stops.ts             stop data (see content.md)
    roles.ts  skills.ts  awards.ts
  lib/
    nav.ts               stop/phase state machine
    input.ts             wheel, touch, keyboard normalisation
    layout.ts            k, anchor, profile computation
    layers.ts            manifest reader, tile visibility
    pointer.ts           smoothed pointer
public/
  art/                   see art-pipeline.md
  projects/<slug>/       cover and thumb images
  cv/                    CV PDF
art/                     generators (not shipped)
```

## Rendering structure
```
<main>                                   stacked sections (SEO, no-JS)
  <section id="stop-N"> content          visible in no-JS; used by the card
<div class="stage" data-profile=…>       fixed, overflow hidden
  <div class="opening">                  clipped world
    <div class="layer" style="--s:.14">  one per layer, in draw order
      <img class="tile"> …               only visible tiles mounted
    …
    <Traveller/>, <Tags/>
    <div class="grain">, <div class="inner-shadow">
  <div class="frame">                    rings + ornaments
  <div class="chrome">                   title plate, dots, buttons, footer
<dialog class="card">
```
Details:
- `stage` sets CSS variables `--pos`, `--k`, `--anchor`, `--px`, `--py`, `--pitch`, `--sky-mix` (see `design-tokens.md`).
- Each layer wrapper has `--s`. CSS computes its transform from `--pos`. Updating `--pos` on the stage re-transforms all layers with no React re-render.
- **Nested wrappers** (outer for the stop translate, inner for the pointer offset and ambient drift) so transforms compose without conflicting animations.
- Tags are DOM elements positioned in the action plane; they move with layer 09 (child of the same wrapper) so they keep alignment with their post.

## State machine (`lib/nav.ts`)
- States: `rest(stop)`, `moving(from, to)`, `card(stop)`.
- Events: `step(±1)`, `jump(n)`, `openCard`, `closeCard`, `arrived`.
- Queue: at most one pending step.
- Derived: traveller state, active tag, live region text, hash (`#stop-N` via `history.replaceState`).
- Pure and unit-tested.

## Input (`lib/input.ts`)
Normalises wheel (accumulate, threshold, inertia guard), touch swipe, keyboard into `step` events as specified in `motion.md`. Passive listeners except where the wheel must prevent default on the stage.

## Layers and tiles (`lib/layers.ts`)
- Read `public/art/manifest.json`: layer id, speed, tile list `{ file, x, width, y, height }`.
- Visible tile test: tile's screen interval at the current `--pos` intersects `[-W, 2W]` for width `W` (one viewport of preload each side). Recompute at rest and every 250 ms during a move.
- Unmounted tiles release their image (remove from DOM).
- Preload: stop 0 and 1 tiles at high priority, the rest in idle time by distance from current stop.
- `profile`: `desktop`, `phone` (below 640 px), or `lite` (low performance; see below). Switches the manifest set.

## Performance plan
| Concern | Rule |
|---|---|
| Compositing | `will-change: transform` on layers only during a move |
| Layer count | Desktop 13 plus water/fireflies; phone 7 plus water/fireflies |
| Filters | None live on moving layers |
| Textures | Cap DPR at 2 for art; raster sizes match |
| Fireflies | CSS animation, ≤ 40 total, halved on phone |
| Off-screen | Pause CSS animations of unmounted tiles; pause all on hidden tab |
| Lite profile | Triggered when median move frame time exceeds 20 ms: halves fireflies, drops F3 and pointer parallax, makes haze static |
| JS per frame | One rAF during a move; pointer smoothing only on pointer devices |
| Payload | See `art-pipeline.md` budgets |

## Accessibility
- Structure: `<main>` with one `<h1>`, `<h2>` per stop. The stacked sections are the canonical semantic content; the animated stage is an enhancement.
- Tags are `<button>`, cards are `<dialog>` with `showModal()`.
- Live region (`aria-live="polite"`) announces the current stop on arrival.
- Keyboard: all functions reachable; Tab order Prev, tag, Next, dots, footer; arrow keys step (not inside the open card).
- Focus visible everywhere; ring colours from tokens.
- Reduced motion per `motion.md`; also a visible toggle.
- Colour contrast per `design-tokens.md`. Art is `aria-hidden`.
- Touch targets ≥ 44 px.
- `inert` on tags during a move, on the world when the card is open.

## No-JS and fallback
- Server-render the full stacked document (`StackedView`) inside `<main>`: poster image, then each stop as a `<section>` with its full content, then the footer.
- With JS, the stage mounts and the stacked view is visually replaced (kept in the DOM for SEO/screen readers using the visually-hidden technique, with the visible stage `aria-hidden` for the art parts).
- Low-end or `Save-Data` clients: start in the stacked view with a button "Enter the river".

## SEO and metadata
- Metadata API for title/description/OG, JSON-LD `Person`.
- Canonical URL, sitemap if the domain is set. `robots` allow.
- OG image generated at build from the stop-0 poster.

## Hosting
Vercel is the default (the CV mentions Vercel; zero config for Next 16). **[confirm]** domain. Static assets cached with long max-age and hashed names. Images served as AVIF/WebP with SVG as is.

## Testing
| Layer | Tool | What |
|---|---|---|
| Logic | Vitest | nav state machine, wheel accumulator, layout `k` and anchor, visible tile test, rest-fan formula |
| Browser | Playwright | step by button/key/swipe/wheel reaches the right stop; tag opens the card; Esc returns focus; hash deep links; no horizontal overflow at 320/375/768/1280; reduced motion path |
| Visual | Playwright screenshots | each stop at rest at three viewports, compared by eye |
| Perf | Lighthouse + manual | FCP, CLS 0, long tasks; frame time on a real phone |
| A11y | axe via Playwright | no violations in rest and card states |

## Risks
| Risk | Mitigation |
|---|---|
| GPU memory with many large layers | Validation prototype first; phone merge; tile mounting; DPR cap |
| Wheel/trackpad double-fire | Accumulator with inertia guard; tested with Playwright and by hand |
| Scroll-chaining on mobile browsers | `overscroll-behavior: none`, `touch-action: pan-y pinch-zoom` only if needed; stage is fixed |
| Safari quirks with filters and SVG masks | Bake effects; test Safari early |
| Tag overlap on narrow screens | Compact tag, flip side, tested at 320 px |
| Art volume | Generator helpers; build order with a vertical slice first |
