# Engine API (`@/engine`)

Owner: `engine-dev`. Everyone else: read-only. Need a change? Report it, do not edit.

One fixed full-viewport stage, native scroll over a tall spacer. One rAF loop reads `scrollY`
and writes `transform` / `opacity` straight to DOM nodes. Scroll progress is never React state.
Timeline evaluation is a pure function of progress, so everything is reversible.

## Units

- **Screen (`s`)**: scroll position in viewport heights (`100lvh`). Beat `i` owns `[start, start + screens)`.
- **Local `t`**: `(s - start) / screens`. `0` = beat starts, `1` = beat ends. Neighbour beats (current +/-1)
  are mounted and evaluated with `t < 0` (next) or `t > 1` (previous), so keyframes at `-0.2` or `1.2` give enter/exit overlap.
- **Design px**: layer and keyframe `x`/`y` in the manifest's design canvas (1920x1080 desktop, 1080x1920 portrait).
  The canvas is scaled to **cover** the viewport, centred, so design px scale with it.
- **Composition**: `portrait` when viewport height > width, else `desktop`. Re-picked on resize.

## Types

```ts
export type Comp = 'desktop' | 'portrait';
export type Lane = 'main' | 'projects';
export type Quality = 'high' | 'low';

/** Easing used to ARRIVE at the keyframe that declares it (from the previous keyframe of that property). */
export type Ease = 'linear' | 'in' | 'out' | 'inOut' | ((u: number) => number);

/** at: local beat progress. Keyframes must be sorted by `at` ascending. Omitted props are not keyed here. */
export type Keyframe = {
  at: number;
  x?: number;        // design px (layers, canvas overlays, group) or CSS px (viewport overlays)
  y?: number;
  scale?: number;    // default 1
  rotate?: number;   // deg
  rotateY?: number;  // deg, 3D (canvas has perspective)
  opacity?: number;  // default 1
  ease?: Ease;       // default 'linear'
};
export type Track = readonly Keyframe[];
export type Pose = { x: number; y: number; scale: number; rotate: number; rotateY: number; opacity: number };

export type Rect = { x: number; y: number; w: number; h: number };

/** Produced by the art pipeline (public/art/<beat>/manifest.json). depth 0 = farthest. Rects may bleed outside. */
export type ManifestLayer = Rect & { id: string; src: string; depth: number };
export type Manifest = {
  slug: string;
  compositions: Record<Comp, { width: number; height: number; layers: ManifestLayer[] }>;
  bytes: number;
};

export type LayerDef = {
  track?: Track;
  parallax?: number;  // 0..1 pointer/gyro offset strength (max 24 design px at 1)
  origin?: string;    // CSS transform-origin, default '50% 50%'
  highOnly?: boolean; // not rendered on quality 'low'
};

export type OverlayDef = {
  node: ReactNode;    // real HTML: text, buttons (fork = <button>)
  track?: Track;
  /** Set = canvas space: positioned over the art at this design-px rect (e.g. the fork door).
   *  Unset = viewport space: position it yourself with className/style; x/y keyframes are CSS px. */
  rect?: Rect;
  className?: string;
  style?: CSSProperties;
  parallax?: number;
  highOnly?: boolean;
};

export type CompositionDef = {
  /** Track for the whole beat (fade, zoom-through). Without it the beat is visible only while it is
   *  the current beat (hard cut). With it YOU own visibility: add fade-in/out keyframes. */
  group?: Track;
  groupOrigin?: [number, number];        // design px, scale/rotate pivot of `group`, default canvas centre
  layers?: Record<string, LayerDef>;     // keyed by manifest layer id; unlisted layers are static
  overlays?: OverlayDef[];
};

export type FrameCtx = { comp: Comp; reducedMotion: boolean; quality: Quality; s: number; k: number /* CSS px per design px */ };

export type BeatDef = {
  slug: string;
  screens: number;          // scroll length in viewport heights
  manifest: Manifest;
  desktop: CompositionDef;
  portrait: CompositionDef;
  still?: number;           // local t used for transforms under reduced motion, default 0.5
  /** Escape hatch for a hero effect, called every frame while the beat is visible.
   *  el = the beat group element (query `[data-layer="<id>"]`). transform/opacity only. Honour ctx.reducedMotion. */
  onProgress?: (t: number, el: HTMLElement, ctx: FrameCtx) => void;
};

export type Frame = {
  lane: Lane;
  s: number;            // screens (smoothed)
  progress: number;     // 0..1 over the lane
  velocity: number;     // screens per second
  beat: number;         // current beat index
  t: number;            // local t of the current beat
  unit: number;         // CSS px per screen (scroll px = s * unit)
  pointer: { x: number; y: number }; // -1..1, 0 when parallax is off
};

export type SpriteSheet = { src: string; frames: Rect[]; anchor: { x: number; y: number } };
```

## Writing a beat (`src/world/beats/<slug>.tsx`)

```tsx
'use client';
import type { BeatDef } from '@/engine';
import manifest from '../../../public/art/b2-first-fold/manifest.json';

export const firstFold: BeatDef = {
  slug: 'b2-first-fold',
  screens: 2,
  manifest,
  desktop: {
    layers: {
      'panel-left':  { track: [{ at: 0, rotateY: 0 }, { at: 0.6, rotateY: -80, ease: 'inOut' }], origin: '0% 50%' },
      'far-ridge':   { parallax: 0.2 },
    },
    overlays: [
      { node: <h2 className="text-5xl">…</h2>, className: 'left-[8vw] bottom-[12vh]',
        track: [{ at: 0.1, opacity: 0, y: 20 }, { at: 0.25, opacity: 1, y: 0, ease: 'out' }] },
      { node: <ForkButton />, rect: { x: 1400, y: 600, w: 120, h: 220 } },
    ],
  },
  portrait: { /* same layer ids, different keyframes */ },
};
```

Rules: transform/opacity only; keyframes sorted by `at`; beat files are client modules (they hold
functions and JSX). Overlay text must come from `src/content` and react to the language toggle itself.

## Components and functions

| Export | What |
|---|---|
| `<Stage beats projectBeats initialLane? initialFocusId? initialS? smoothing? overlay? children?>` | Client component. Fixed stage + spacer. `beats` = main lane, `projectBeats` = projects lane. `initialLane="projects"` for deep links. `initialS` = start position of the initial lane in screens (lane-local, clamped), e.g. a project's group beat: that beat is server-rendered at its local `t` (no jump at hydration) and the page scrolls there on mount, unless the browser already restored a scroll position (reload). `smoothing` = time constant in seconds (default 0.07, 0 = off; always off under reduced motion). `overlay` = persistent nodes inside the turning stage above the beats (the paper frame). `children` = rendered after the stage, not turned (nav). |
| `subscribeFrame(fn: (f: Frame) => void): () => void` | Per-frame callback (called immediately with the last frame). Write to your own refs; do not set React state per frame. Do not keep the object. |
| `enterLane(lane, { focusId?, s? })` | Flip to a lane. Entering `projects` stores the exact main `scrollY`, turns the stage (rotateY, content swapped edge-on), starts the projects lane at `s` (screens, lane-local, clamped to the lane length; default 0). Returns a Promise. Already in that lane: only `focusId` changes (use `scrollToS` to move). |
| `exitLane()` | Back to `main`, restoring the exact stored `scrollY`. |
| `scrollToS(s, { smooth? })` | Native `window.scrollTo` of the current lane to `s` (screens, clamped). `smooth` is ignored under reduced motion. Safe from effects and handlers. |
| `useLane(): Lane` / `useEngineState()` | `useEngineState()` = `{ lane, focusId?, turning, reducedMotion, quality }` (React state, changes rarely). |
| `useQuality(): Quality` / `useReducedMotion(): boolean` | Drop particles and extras on `'low'`. |
| `evaluate(track, t): Pose` | Pure keyframe interpolation (holds first/last value out of range). |
| `ease(e, u)` | Easing function. |
| `beatRanges(beats)`, `locate(ranges, s)`, `mountWindow(i, n)`, `pickComposition(w, h)`, `coverScale(w, h, W, H)` | Pure helpers. |
| `spriteFrame(sheet, distancePx, stridePx): number` | Frame index from scroll distance (reversible). |
| `spriteTransform(sheet, i): string` | Transform for the sheet `<img>` inside a frame-sized `overflow: clip` box. |

### Sprite sheet (scroll-driven frame cycle, e.g. a creature)

All frames must share one `w`/`h`. Markup: an `overflow-clip` box of `frames[0].w x frames[0].h`, placed with
`left: -anchor.x; top: -anchor.y` relative to the figure point, containing the sheet `<img>`. Each frame:

```ts
useEffect(() => subscribeFrame((f) => {
  img.current!.style.transform = spriteTransform(sheet, spriteFrame(sheet, f.s * f.unit, 40));
}), []);
```

## Behaviour notes

- Mount window: only beats current +/-1 are mounted and updated; the next beat being mounted preloads its images.
- DOM order = paint order: later beats are above earlier ones.
- Elements at opacity 0 also get `visibility: hidden` (not focusable, no clicks). Not animated, toggled at 0.
- Reduced motion: transforms are frozen at `still`, opacity tracks still apply, beats cross-dissolve, no parallax, no smoothing.
- Quality `'low'`: no parallax, `highOnly` layers/overlays not rendered. Set from `hardwareConcurrency`/`deviceMemory`
  at start, and downgraded once if frame time while scrolling averages over 24 ms. Never upgrades.
- SSR: beat 0 of the initial lane is server-rendered in both compositions (CSS picks by orientation) until hydration.
- Gyro parallax works where `deviceorientation` fires without a permission prompt (not iOS).
- The stage is `100lvh` tall (stable on mobile). Anchor bottom text with `svh` units so the URL bar never covers it.
- Do not give a `track` to a layer you also move in `onProgress`; the engine would overwrite it.
- Pass `beats` / `projectBeats` as module-level constant arrays (stable identity).
- Lane flip unmounts the other lane, so focus is lost: the projects lane should focus the window for `focusId`
  after mount, and the main lane fork can re-focus itself when `useLane()` returns to `'main'`.
- One `<Stage>` per page (the loop is a module singleton).
