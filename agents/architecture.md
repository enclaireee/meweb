# Architecture: how the Night Workshop is built

The engineering rulebook. The docs rank like this: `concept.md` (design language) → `portfolio_concept.md` (the experience) → `design.md` (the numbers) → **this file (how to build it)**. When code and this file disagree, fix one of them in the same PR; never leave them drifting. Research date: 2026-09-24. Versions are listed in `tech-research.md`.

---

## 0. Ten rules that override everything

1. **Readable first, 3D second.** The HTML page is complete and useful with the canvas missing. The 3D layer adds to it and never gates it.
2. **One source of truth per thing.** Content comes from `src/content`, colour and space from `src/design/tokens.ts` (mirrored into `globals.css`), shape from the SVG art, and navigation position from the scroll position.
3. **One loop.** The GSAP ticker is the only `requestAnimationFrame`. Lenis, ScrollTrigger and R3F rendering all ride it (§6.7).
4. **One paper material.** Every sheet in the scene uses the same shader program. Nothing compiles mid-journey (§6.3).
5. **Nothing allocates per frame.** No `new Vector3()`, no arrays or closures, and no React state in `useFrame` or ticker callbacks. Mutate refs, and use `delta`.
6. **Work moves to build time.** Edge wobble, outline resampling, polygon cleanup, clip-paths and the poster are baked by scripts. The browser only extrudes and draws.
7. **Paper rules are code rules.** No gradients inside a sheet, no scaling or morphing, rotation only on hinges or pivots, and every depth change moves its shadow (`concept.md` §2, §4).
8. **Budgets are tests.** The bundle, draw-call and frame-time budgets (§9) are checked, not hoped for.
9. **Reduced motion and no-WebGL are first-class paths**, designed and tested like the main one.
10. **Every folder earns its place.** No empty scaffolding and no abstraction with one user. A station folder only gets a file when it has something to put in it.

---

## 1. Folder structure

Organised **by section (station)**. Everything one station needs lives in its folder. The shared engine lives in `scene/`, the shared HTML objects in `ui/`.

```
agents/                         ← all context docs (only README.md stays at root)
public/
  textures/                     ← grain-normal.webp, grain-rough.webp (512², tiling)
  poster/                       ← desk-night.avif, desk-morning.avif (built by scripts/poster)
scripts/
  cut/                          ← art pipeline (§7.4), run with tsx
    index.ts                    ← CLI: src/**/art/*.svg → *.cut.json + clip-paths
    parse.ts  resample.ts  wobble.ts  clean.ts  lint.ts  emit.ts
    cut.test.ts                 ← determinism + lint self-check
  poster.ts                     ← Playwright screenshot → sharp → AVIF
src/
  app/                          ← routing only: thin files
    layout.tsx                  ← fonts, <html data-light>, metadata, skip link
    page.tsx                    ← composes sections in order + <SceneMount/>
    not-found.tsx               ← "This sheet was never cut."
    globals.css                 ← Tailwind v4 + @theme tokens (design.md §11)
    opengraph-image.tsx  icon.svg  robots.ts  sitemap.ts
    dev/                        ← /dev/art, /dev/tokens, /dev/worker: notFound() in production
  content/                      ← typed content from the CV (§3)
    types.ts  profile.ts  projects.ts  experience.ts  skills.ts  awards.ts  contact.ts
  design/
    tokens.ts                   ← colours, ramps, depths, motion, worker params (design.md)
  sections/                     ← one folder per station
    stations.ts                 ← ordered manifest: id, slug, label, z, lazy art import
    00-desk/
      Section.tsx               ← Server Component: the HTML (title tag)
      Station.tsx               ← Client: this station's 3D group
      art/desk.svg              ← source art (§7.3)
      art/desk.cut.json         ← generated, committed
    01-storeroom/  02-control-room/  03-arcade/  04-drafting/  05-sill/  06-wall/  07-window/
  scene/                        ← the shared 3D engine (client only, lazy chunk)
    SceneMount.tsx              ← 'use client'; decides tier; next/dynamic(ssr:false) → Scene
    Scene.tsx                   ← <Canvas> + providers + stations
    loop.ts                     ← the single ticker (§6.7)
    store.ts                    ← zustand: station, light, tier, progress (§6.8)
    paper/                      ← material.ts (one shader), sheet.ts (cut.json → geometry), merge.ts
    camera/                     ← rig.ts (dolly + pointer + tilt + drift)
    light/                      ← lamp.ts, daylight.ts, relight.ts (timeline)
    worker/                     ← Worker.tsx, rig.ts, walk.ts, path.ts, art/worker.svg
    motion/                     ← spring.ts (damped string/pin spring), noise.ts
    quality/                    ← tier.ts (initial guess), monitor.tsx (PerformanceMonitor policy)
  ui/                           ← HTML paper objects (design.md §6)
    Frame/  TitleTag/  Plate/  DepthTag/  ScrapButton/  RelightDial/  HintStrip/
    PunchedCard/  PegTag/  Ribbon/  Stitch.css
    clips.generated.ts          ← hand-cut clip-path polygons (from scripts/cut)
  lib/                          ← pure, framework-free helpers
    rng.ts (mulberry32)  math.ts (damp, clamp, smoothstep)  media.ts (reduced motion, saveData)
```

**Folder rules**
- **Station folders are `NN-slug`.** Their order is the route order. `stations.ts` is the only place order is declared.
- **The server/client boundary is visible in the filename:** `Section.tsx` is always a Server Component, `Station.tsx` always a Client Component that is only imported by the scene chunk. No server file imports from `scene/`.
- **Generated files are committed** (`*.cut.json`, `clips.generated.ts`). The build must not depend on running the pipeline, and diffs show art changes. CI checks they're fresh (§12).
- **No barrel `index.ts` files.** Import the file directly; barrels defeat tree-shaking.
- **`app/` stays thin.** Routes compose; logic lives in `sections/`, `ui/` and `scene/`. `app/dev/*` pages call `notFound()` when `process.env.NODE_ENV === 'production'`.
- The alias is `@/` → `src/` (already set in `tsconfig.json`).

---

## 2. Rendering architecture

### 2.1 Three layers, one page

| Layer | What | Rendered by | Present when |
|---|---|---|---|
| **HTML shell** | Frame, depth tag, title tag, plates, Wall, Window card | Server Components, static at build | Always |
| **Poster** | A still of the composed desk (night/morning AVIF) | `next/image` with `priority`, behind the HTML | Until the canvas's first frame, and permanently in fallback |
| **Canvas** | The 3D workshop | R3F, `position: fixed`, `z-index` below the HTML, `aria-hidden` | Only when the tier allows it (§6.10) |

### 2.2 Load sequence

1. Static HTML + critical CSS + fonts (preloaded by `next/font`) arrive. The poster is the LCP element.
2. `SceneMount` (a tiny client component) checks: WebGL2 available? `saveData`? reduced-data? tier? If it's allowed, it waits for `requestIdleCallback` (with a 2 s timeout fallback) and then `import()`s the scene chunk (three, R3F, drei bits, GSAP, Lenis, zustand).
3. The scene creates the renderer, **pre-compiles the paper material** (`gl.compile(scene, camera)`), loads station 00's `cut.json` and the grain textures, and renders frame 1 invisibly.
4. When frame 1 is ready, the poster cross-fades out and the entrance plays (`design.md` §7.2).
5. Stations 01–03 art loads in the background. Each later station loads when the camera is 2 stations away.

### 2.3 Chunking

- The **initial route bundle** has no three, R3F, GSAP or Lenis. It's React + the HTML shell + `SceneMount` only. Verify with `npx next experimental-analyze`.
- The **scene chunk** is one dynamic import. Station art is **separate JSON imports** (`import('./art/desk.cut.json')`), fetched per station.
- **Dev tools** (r3f-perf, leva) load only when `process.env.NODE_ENV !== 'production' && location.search.includes('debug')`, via dynamic import, so they're tree-shaken from production.

---

## 3. Content layer

- The CV becomes **typed TS modules** in `src/content/` (no MDX: every entry is short). Types live in `types.ts`, and every module exports a `const` checked with `satisfies`.
- **One source for both layers:** plates render from `projects.ts`, and the depth tag and station labels come from `stations.ts`, which references content ids. Never hard-code a project name in a component or scene.
- Each project: `id`, `slug`, `title`, `dates {start,end}`, `caption` (italic voice line), `facts [{value,label}]` (2–3), `stack []`, `bullets []` (the back of the plate), `links {repo?, live?}`, `awards?` (Refocus → ProtoTech).
- Dates are ISO strings in data and formatted on render (`Intl.DateTimeFormat('en', {month:'short', year:'numeric'})`).
- The copy voice follows `portfolio_concept.md` §8. Contact: email, GitHub and LinkedIn only (no phone).

---

## 4. HTML, styling and paper UI

- **Tailwind v4** (installed) for layout and utilities. Tokens are declared in `globals.css` under `@theme`, mirrored from `tokens.ts`. **The light states are attributes**: `<html data-light="night|morning">` switches the CSS vars. No `dark:` variants scattered around.
- **Component CSS** (`*.module.css` next to the component) only where Tailwind is awkward: clip-path + pseudo-elements + filters on the paper objects.
- **Hand-cut edges:** the wrapper gets `filter: drop-shadow(...)` from the light vars (`design.md` §5.4), and the inner element gets `clip-path: polygon(...)` from `clips.generated.ts`. Never put the shadow and the clip on the same element (the clip would cut off the shadow).
- **Paper edge highlight (2D):** the classic digital papercut recipe: a 1px lighter inset on the side facing the light, the shape itself, then a soft cast shadow behind. In HTML this is `box-shadow: inset` on the lit side plus the wrapper's `drop-shadow`, both driven by `--light-x/y`.
- **Grain** is one tile in `background-image` with `mix-blend-mode: multiply`, `opacity .08`, on a pseudo-element (so the text stays crisp).
- **Semantic HTML first:** `<header>` title tag, `<nav>` depth tag, `<article>` per plate, `<section id={slug}>` per station, `<button>` for flips, dial and worker, `<ul>` for roles and skills. Styling never replaces a semantic element.
- **Theme boot:** a tiny inline script in `layout.tsx` sets `data-light` from `localStorage` (or `prefers-color-scheme`) **before paint**, so there's no flash. Wrap it in try/catch (private mode).
- **Fonts:** `next/font/google` Newsreader, variable, `subsets: ['latin']`, `display: 'swap'`, with italic and the `opsz` axis. Remove the Geist fonts from the scaffold.
- **Layout stability:** the plates reserve their size (no CLS when the flip or scene mounts). The canvas is `position: fixed` so it never shifts the layout.

---

## 5. Motion engineering (HTML side)

- **CSS for UI micro-motion** (hover lift, stitch focus, hint fade) using the `design.md` §7.1 tokens as CSS vars. **GSAP for choreography** (entrance, relight roll, plate flip sequencing, the dolly) because it needs timelines and scrub.
- **Plate flip:** a CSS 3D transform (`transform-style: preserve-3d`, `backface-visibility: hidden`) on a left-edge hinge. The hidden face gets `inert`. The button toggles `aria-expanded`.
- **The spring for hung tags** is `scene/motion/spring.ts` (semi-implicit Euler, fixed 1/120 s substeps). It's shared by the HTML title tag (driving a CSS transform through a ref) and the 3D hung objects.
- **Reduced motion** is read once from `matchMedia` and **live-subscribed**, then exposed from the store. Every animation checks it. Lenis disables smoothing itself under reduced motion.

---

## 6. The 3D engine

### 6.1 Canvas configuration (exact)

```tsx
<Canvas
  flat                       // NoToneMapping: tokens render as specified (default ACES shifts colours)
  shadows="percentage"       // PCFShadowMap. `true` = PCFSoft, deprecated in three r186
  dpr={[1, 1.75]}            // then PerformanceMonitor steps it down
  frameloop="never"          // we drive frames from the GSAP ticker (§6.7)
  gl={{ antialias: true, alpha: false, stencil: false, powerPreference: 'high-performance' }}
  camera={{ fov: 32, near: 0.5, far: 600 }}
  eventSource={document.documentElement} eventPrefix="client"
/>
```

- Colour: keep three's colour management on (the default). Token hex values are sRGB and `new Color('#hex')` converts them. **Never** use `linear`.
- `alpha: false` with a scene background (fog colour) is cheaper than a transparent canvas, and the poster is only needed until the first frame.
- Canvas CSS: `touch-action: pan-y` so vertical scrolling stays native on touch.

### 6.2 Geometry: from cut.json to GPU

- `cut.json` contains flattened, wobbled, cleaned outlines (§7.4). At runtime: `new Shape(outer)` + `holes` → `ExtrudeGeometry({ depth: 0.15, bevelEnabled: false, steps: 1 })`. No curves are evaluated at runtime.
- **UVs:** use ExtrudeGeometry's default world-space UV generator, so the grain has the **same physical scale on every sheet**. Offset the UV per sheet by its seed so the tiles never visibly line up.
- **Merge static sheets per station** with `mergeGeometries` from `three/addons/utils/BufferGeometryUtils.js`: one draw call per station for everything that doesn't move.
- **Animated pieces** (hinged, hung and pivoting parts, the worker) stay separate meshes that share the same material.
- The station 00 desk is built from individual meshes because the pop-up entrance hinges each sheet. It's the only exception to merging, and fine at ~15 draw calls.
- Static meshes get `matrixAutoUpdate = false` after placement, and `computeBoundingSphere()` runs after merging so frustum culling works.
- Build geometry inside `useMemo` keyed by the station id. If a station's extrusion ever takes more than 8 ms (measure), move it to a Web Worker or bake it to a meshopt GLB with `@gltf-transform/cli`. Not before.

### 6.3 One paper material (the key optimisation)

A single `MeshStandardMaterial` (`roughness 0.92`, `metalness 0`, `vertexColors: true`, grain `normalMap` + `roughnessMap`) extended with `onBeforeCompile` (with a stable `customProgramCacheKey`):

- **Per-vertex attributes**, written when geometry is built: `colorNight` (vec3), `colorMorning` (vec3), `aOrder` (float 0–1, the sheet's position in the relight roll: its distance from the window, normalised).
- **Uniform `uRelight`** (0 = night, 1 = morning). The fragment colour is `mix(colorNight, colorMorning, smoothstep(aOrder*0.6, aOrder*0.6+0.4, uRelight))`. **The whole relight roll (§7.2) is one tween on one uniform**, staggered per sheet for free and still merged into one draw call.
- **Glow** (small lights) uses a second material: `MeshBasicMaterial` with an `uGlow` uniform, fog off. It's the only other program.
- **The worker** uses the same paper material with his own vertex colours.
- `gl.compile()` runs at scene start, so both programs are compiled before the first frame. Never create a material in a component body. Materials live in `paper/material.ts` as app-lifetime singletons.

### 6.4 Stations lifecycle

- **Load lazily, then keep mounted.** A station's art is fetched when the camera comes within 2 stations. After that it stays mounted and is toggled with `visible` (`visible = |station − current| ≤ 3`). React Three Fiber's docs warn that mount/unmount is expensive (it triggers compilation and upload), so with one material and small merged geometries, keeping everything mounted costs little memory and avoids any hitch. **This supersedes the `design.md` §4.2 note on mounting.**
- Fog (`near 40, far 260`) hides stations beyond the visible window, and the `visible` toggle culls them from the draw list.

### 6.5 Light and shadow

- **One key light at a time.** Night: a `SpotLight` on the camera rig, aimed by the pointer (its target object is updated in the loop). Morning: a `DirectionalLight` from the window. Swap them by tweening their intensities inside the relight timeline. **Only one casts shadows at any moment**, and the other's `castShadow` is off.
- **Shadow map:** 1024 (low tier 512), a tight frustum around the current station, updated every time the camera moves to a new station. `shadow.autoUpdate = false`. Set `needsUpdate = true` only on frames where the light, the camera, the worker or an animated caster moved.
- **Casters:** arches, stage objects, hung objects, the worker, animated parts. **Receivers:** floor, middle, far and backdrop. The merged static station mesh both casts and receives (it's one mesh).
- `HemisphereLight` (per `design.md` §5.2) tints the shadows. Never use a grey ambient.

### 6.6 Camera rig

- The dolly z comes from scroll progress through `stations.ts` rest positions and the dwell zones (`design.md` §3). The mapping is a **pure function** (`progress → z`), unit-tested.
- The pointer offset, box tilt and idle drift are layered in `rig.ts` with `damp` (maath), frame-rate independent via `delta`. The box tilt rotates the **world group**, not the camera, so the light stays consistent with the box.
- The portrait FOV and target shift are chosen from the aspect ratio on resize, not every frame.

### 6.7 The single loop

```ts
// scene/loop.ts
const lenis = new Lenis({ autoRaf: false, anchors: true })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time, deltaMs) => {
  lenis.raf(time * 1000)
  if (needsFrame()) advance(time * 1000)   // R3F frameloop="never"
})
gsap.ticker.lagSmoothing(0)
```

- `needsFrame()` is true when anything moved this tick: scroll velocity ≠ 0, the pointer moved, a tween is active, a spring hasn't settled, the worker is walking, or idle drift is on. Otherwise **no frame is rendered**. That's on-demand rendering without R3F's `invalidate` bookkeeping.
- Pause everything when `document.hidden` or when the canvas is off-screen (IntersectionObserver): `gsap.ticker.sleep()` / `wake()`.
- **All per-frame work is mutation on refs.** Scratch vectors and quaternions are module-level constants and get reused.

### 6.8 State

- **zustand** store (`scene/store.ts`) shared by the HTML UI and the canvas: `station`, `light`, `tier`, `reducedMotion`.
- **Fast values never trigger React renders:** scroll progress, pointer and light aim are read with `store.getState()` inside the loop (transient reads). React only re-renders on slow changes (the station index, light mode, tier).
- The light aim is published to CSS as `--light-x/y` on `<html>` **at most once per rendered frame**, and only when it changed by more than 0.005 (`design.md` §5.4).

### 6.9 Input

- Pointer: `pointermove` on the document (passive), normalised to −1..1 and damped in the loop.
- Touch: a horizontal drag tilts the box (vertical stays scroll).
- Device tilt: behind the paper "tilt to look" toggle, because iOS requires `DeviceOrientationEvent.requestPermission()` from a user gesture. Low-pass filtered, clamped to the same ±3°/±2° as the pointer.
- The worker `<button>` is HTML, positioned over his projected screen position (updated at most at 30 Hz), so it's keyboard- and screen-reader-accessible. Canvas raycasting is only used for hover cursor feedback.

### 6.10 Quality tiers

| Tier | Chosen when | DPR | Shadow map | Idle drift | Hung sway | Stations visible |
|---|---|---|---|---|---|---|
| **high** | default | ≤ 1.75 | 1024 | on | on | ±3 |
| **mid** | PerformanceMonitor decline, or `hardwareConcurrency ≤ 4` | ≤ 1.25 | 512 | on | on | ±2 |
| **low** | a second decline, or `deviceMemory ≤ 4` | 1 | 512, static only | off | off | ±1 |
| **none** | no WebGL2, `saveData`, a failed context, or a third decline | (no canvas) | | | | poster + HTML |

- Tiers only step down during a session, never back up (no oscillation). `webglcontextlost` → go to **none** gracefully.
- The tier is logged to the console in dev only.

### 6.11 Disposal and memory

- Geometries and materials are app-lifetime. The page is one route, so dispose only on `Canvas` unmount (HMR, and navigating to `/dev/*`).
- Textures: two grain maps, `colorSpace = NoColorSpace` (they're data, not colour), `anisotropy = 4`, `RepeatWrapping`, mipmaps on.
- Target GPU memory under 48 MB, checked with `gl.info.memory`.

---

## 7. SVG art: handmade, but polished

The art is drawn in code, but it has to look like a patient human cut it. That means **confident curves with human drift**, not noise.

### 7.1 Craft principles (researched references: toy theatres, Lotte Reiniger's jointed silhouette puppets, Robert Sabuda's pop-ups, Hari & Deepti's backlit paper-cut boxes, museum specimen plates)

1. **Silhouette first.** Every object must be identifiable filled solid black at 64 px. Design the silhouette, then cut the detail as holes.
2. **Big masses, small crisp details, few mid-sized shapes.** The contrast of scale reads as craft. Mid-size clutter reads as noise.
3. **Detail is cut, never drawn.** No strokes and no lines: detail is holes through a sheet (crate handles, gauge ticks, window panes) or a smaller sheet stacked on top.
4. **A blade makes long, confident strokes.** Few nodes, smooth curves, and **low-frequency drift**, never high-frequency jitter (jitter looks like a vibrating vector, not paper).
5. **Corners tell the tool.** Convex corners are barely blunted (radius 0.05 units). Knife-cut concave corners stay sharp, and scissor-cut concave corners show a tiny facet where the scissors restarted.
6. **Paper has physics.** No strip thinner than 0.2 units (2 mm) and no hole smaller than 0.3 units. **No floating islands:** anything inside a hole is either bridged to the sheet (stencil-style) or cut as its own sheet in front.
7. **No tangents.** Overlapping sheets overlap clearly or separate clearly. Edges that just kiss read as mistakes.
8. **Break symmetry and grids.** Mirrored shapes get independent wobble seeds. Repeated items (crates, jars, tools) come in 2–3 sizes, rotated ±1.5°, and are never evenly spaced.
9. **Slight misregistration.** Stacked detail sheets sit offset by 0.05–0.15 units and rotated ±0.4° from their "perfect" spot, like hand placement.
10. **Complexity follows depth** (`concept.md` §3): far sheets are simple, broad and pale; front sheets are busy-edged. The arch trims can carry decorative cuts (scallops, hanging cable loops, a leaf).
11. **Scale cues.** Include known-size objects (a mug, screws, a pencil) so the tabletop scale reads instantly.
12. **Proportion is toy-like.** Slightly chunky and exaggerated, never realistic. The worker is 5.5 heads tall (`design.md` §8).
13. **One hidden reward per station** (`concept.md` §4.7): a detail only visible when you move and look around the arch (a paper crane on a top shelf, initials cut into a crate, a sticky note behind the rack).
14. **Torn is different from cut.** Only the UI "scraps" are torn: a higher-frequency edge with a slightly fuzzed outline. Everything in the scene is cut.

### 7.2 Style constants (in `scripts/cut/wobble.ts`, all seeded by sheet id)

| Param | Value |
|---|---|
| Resample step | 0.5 units along the arc length. Corners (turn > 35°) are always kept as vertices |
| Drift (blade wander) | Simplex octave 1, wavelength 8–15 units, amplitude 0.15% of the sheet's larger dimension (clamped 0.03–0.25) |
| Chatter | Octave 2, wavelength 1.5–3 units, amplitude 0.015–0.03 units |
| Corner falloff | Wobble × `smoothstep(0, 0.6, distanceToCorner)`: corners stay crisp |
| Scissor facets | Every 6–12 units along curves: a tangent kink of ≤1.5° (off for knife-cut sheets: `data-cut="knife"`) |
| Simplify | Ramer–Douglas–Peucker, tolerance 0.01 |
| Output precision | 3 decimals |

### 7.3 Authoring format

- **One SVG per station**, drawn as a front elevation in world units: `viewBox="-32 0 64 40"` (x centred on the aisle, y up to 40). **y is flipped by the pipeline**, so author in normal SVG y-down.
- **One `<path>` per sheet**, with fills only and `fill-rule="evenodd"` for holes. Required attributes:
  - `id`: a unique, meaningful kebab-case name (`crate-large-2`, `gauge-needle`)
  - `data-z`: the local depth (`design.md` §4.2)
  - `data-stock`: `R0`–`R7` | `accent` | `paper` | `ink` | `glow`
  - optional `data-hinge="bottom|left|right|x,y"` (pop-up/hinged), `data-pivot="x,y"` (rotating parts), `data-hang="x,y"` (the string anchor), `data-cut="knife|scissors"` (default scissors), `data-cast="false"`
- **Forbidden:** `stroke`, `transform`, gradients, filters, `<text>`, `<image>`, `<use>`, nested groups deeper than one level, and any colour in `fill` (colour comes from `data-stock`; `fill` in the file is just for previewing).
- **The worker** gets his own file (`scene/worker/art/worker.svg`), one path per part, with `data-pivot` at each split pin and `data-parent` naming the part it hangs from.
- **UI shapes** (title tag, plate, scrap, depth tag) are in `ui/art/*.svg`, in percentage space, and go through the same pipeline into `clips.generated.ts`.

### 7.4 The cut pipeline (`npm run cut`)

1. **Parse**: read the SVGs (`@xmldom/xmldom`), normalise each `d` with `svgpath` (absolute, arcs → cubics).
2. **Lint**: check the attribute schema and forbidden features. **Min-feature check by morphological opening**: shrink the sheet by 0.1 units, grow it back by 0.1 (clipper2 `inflatePaths`), and flag any sheet losing more than 0.5% of its area (a thin strip). Also: holes ≥ 0.3, no floating islands, nodes per sheet ≤ 400, no hole touching the outer edge. **Lint failures fail the build.**
3. **Resample**: `svg-path-properties` samples at a fixed arc length, keeping corners (§7.2).
4. **Wobble**: two-octave seeded noise along the normal, corner falloff, scissor facets.
5. **Clean**: clipper2 union (fixes self-intersections the wobble might introduce), normalise winding (outer CCW, holes CW, y-up), RDP simplify.
6. **Emit**: `<name>.cut.json` (sheets with id, stock, z, hinge/pivot/hang, outer, holes), plus `clips.generated.ts` for the UI.
7. **Deterministic**: the same input produces byte-identical output. `cut.test.ts` asserts it, plus one known-bad fixture that must fail the lint.

Candidate packages (check them at install): `svgpath` 2.6, `svg-path-properties` 2.1, `clipper2-ts` (published only as a prerelease, 2.0.1-18: if unstable, fall back to `clipper-lib`), `simplex-noise` 4, `@xmldom/xmldom` 0.9, `tsx` to run it, `svgo` 4 for lint-only checks.

### 7.5 Visual review loop (mandatory for every station)

1. Draft 3 thumbnail silhouettes per station in `/dev/art` → pick one → detail it.
2. `/dev/art` shows each station SVG flat, with toggles for **silhouette** (all ink), **squint** (4px blur), night/morning stocks, wobble on/off, holes highlighted, and lint overlays.
3. Claude screenshots `/dev/art` and the live station with Playwright and **looks at the images** before calling a station done: silhouette test, squint test, tangents, rhythm, and whether the value ramp reads.
4. The user sees the screenshots at each station gate.

### 7.6 Polish checklist (per station)

- [ ] Reads as the right object in silhouette at 64 px
- [ ] Value ramp correct back → front, in both lights
- [ ] ≤ 3 accent uses in the whole scene; station props never use accent
- [ ] No tangents, no strips under 2 mm, no floating islands
- [ ] Repeated items vary in size, rotation and spacing
- [ ] One hidden reward
- [ ] Aisle clear (|x| < 8) for the cable and the worker
- [ ] Hung and hinged parts have their anchors authored, and their shadows move when they swing
- [ ] Looks good with idle drift and at the pointer extremes (no gaps visible at the frame edges)

---

## 8. The worker (engineering)

- **The rig is a scene graph:** a group per part, positioned at its `data-pivot`, parented by `data-parent`. Joints only rotate about Z (the paper plane), plus one yaw pivot for turning about.
- **The walk is procedural** (`walk.ts`): a phase accumulator advanced by `delta × speed`, and the joint angles are pure functions of phase (`design.md` §8 table). Pure means unit-testable: the foot doesn't slide at the contact phase (±0.05 units).
- **The path** (`path.ts`): a `CatmullRomCurve3` through the cable points. He's placed by arc length (`getPointAt`) so his speed is uniform. The heading yaw is clamped to within ±55° of camera-facing.
- **Guide logic:** his target arc length follows the camera's station and leads it by one station. Speed goes from slow to brisk when the gap is larger than 1.5 stations. He never teleports, except under reduced motion.
- **Fidgets:** a seeded scheduler (4–7 s). Fidgets pause while he walks.
- **The backing sheet** is a clipper2 offset of his union silhouette (+0.12 units), generated by the pipeline, not drawn by hand.

---

## 9. Performance budgets (checked in CI or before each merge)

| Budget | Limit |
|---|---|
| Initial JS (route, gz) | ≤ 90 kB |
| Scene chunk (gz) | ≤ 300 kB |
| Station art (`cut.json`, gz) | ≤ 40 kB each |
| Textures total | ≤ 400 kB transferred, ≤ 48 MB GPU |
| LCP (4G, mid phone) | ≤ 1.8 s (the poster) |
| CLS / INP | 0 / ≤ 150 ms |
| Draw calls per frame | ≤ 60 (desk ≤ 80 during the entrance) |
| Triangles per frame | ≤ 150k |
| Frame time | 16.7 ms desktop; ≤ 22 ms on a mid Android (steady, no jank during the dolly) |
| Shader programs | 2 (paper, glow), plus depth variants |

**How to measure:** `npx next experimental-analyze` (bundle), Lighthouse on `next build && next start`, `gl.info.render.calls` and `gl.info.memory` logged under `?debug`, `r3f-perf` / `stats-gl` under `?debug`, and a real device via Chrome remote debugging.

---

## 10. Accessibility and fallbacks

- The canvas is `aria-hidden`. All meaning is in HTML. The worker, dial, flips and depth tag are real buttons and links with visible **stitch focus**.
- **Skip link** to the first plate. Tab order follows the route.
- The **depth tag uses anchors** (`#demandx`) so it works without JS. With JS, Lenis `anchors: true` scrolls smoothly (and instantly under reduced motion).
- **Reduced motion:** per `design.md` §10. It's tested as its own path (§12).
- **No WebGL / Save-Data / tier none:** the poster + HTML plates on paper. **The scene chunk is never downloaded.**
- Contrast was verified in `design.md` §1.3. Re-run the check whenever a token changes.
- `lang="en"`, and heading order: `h1` on the title tag, `h2` per station.

---

## 11. SEO and metadata

- `metadata` in `layout.tsx`: title "Muhammad Fatih Zamzami: Electrical Engineering, UI", a description from the summary, canonical, and `openGraph` + `twitter` using `opengraph-image.tsx` (built from the poster).
- **JSON-LD `Person`** (name, alumniOf UI, sameAs GitHub/LinkedIn, jobTitle), inline in the layout.
- `robots.ts` and `sitemap.ts`. `/dev/*` is excluded and returns 404 in production.
- All content is static HTML, so it's indexable without JS.

---

## 12. Testing and verification

Small and pointed: one check per piece of logic that can silently break.

| What | How |
|---|---|
| Cut pipeline | `vitest`: determinism, a lint fixture that must fail, winding normalised |
| Scroll → camera mapping | `vitest`: rests hit exactly, dwell zones flat, monotonic |
| Walk cycle | `vitest`: angles are periodic, the foot has no slip at contact |
| Spring | `vitest`: settles within 3 s, no NaN at a large delta |
| Content | `tsc` via `satisfies` (a typo in content fails the build) |
| Generated files fresh | CI runs `npm run cut` then `git diff --exit-code` |
| Smoke | Playwright: page renders **with JS disabled**, with **reduced motion**, and with WebGL disabled (`--disable-webgl`); the depth-tag anchors navigate; the flip toggles `aria-expanded` |
| Visual | Playwright screenshots of `/dev/art` and each station rest (night + morning), reviewed by eye at gates (§7.5). Not pixel-diffed (the wobble is deterministic, but the GPU output isn't) |
| Perf | Lighthouse + the budgets in §9 before merging each phase |

---

## 13. Conventions and workflow

- **TypeScript strict** (already on). Add `noUncheckedIndexedAccess`. No `any`; use `unknown` + narrowing.
- **React Compiler** on (`reactCompiler: true` + `babel-plugin-react-compiler` 1.0). Don't hand-add `useMemo`/`useCallback` except for three objects (geometry, material), where identity matters for the GPU.
- **`next.config.ts`:** `reactCompiler: true`; `images.formats: ['image/avif','image/webp']`; `headers()` with `Cache-Control: public, max-age=31536000, immutable` for `/textures/*` and `/poster/*`, and security basics (`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: accelerometer=(self), gyroscope=(self)`). `experimental.inlineCss` only if Lighthouse shows it helps.
- **Naming:** components are `PascalCase.tsx`, modules `camelCase.ts`, station folders `NN-slug`, SVG sheet ids kebab-case.
- **Imports** go through `@/`. Three addons come from `three/addons/...`. drei is imported per component.
- **Comments:** explain *why* (paper rules, perf reasons). Deliberate simplifications get a `ponytail:` comment naming their limit and the upgrade path.
- **Git:** one branch per phase (`v3/phase-N-name`), commits `feat(v3-N): …` / `fix(v3-N): …`, and a PR per phase. `main` stays deployable.
- **Scripts:** `dev`, `build`, `start`, `lint`, `test` (vitest), `cut`, `poster`, `e2e` (Playwright).

---

## 14. Build phases (each ends at a user gate with screenshots)

| Phase | Deliverable | Gate |
|---|---|---|
| 1 | `globals.css` + `tokens.ts` + fonts + frame mat + `/dev/tokens` | The tokens look right in both lights |
| 2 | Content modules + HTML shell: every section, plate, flip, depth tag, dial. **No 3D.** | The site is complete and readable without the canvas |
| 3 | Cut pipeline + lint + `/dev/art` + UI clip-paths | Handmade edges look right in 2D |
| 4 | Scene core: canvas, loop, paper material, lamp and shadows, grain, the desk station, entrance | The desk "feels like paper" |
| 5 | The worker: rig, walk, fidgets, click-to-walk | The walk reads as a slow puppet walk |
| 6 | Journey: stations 01–07 art, dolly, dwell, guide logic, fog | The full walk-through |
| 7 | Relight (morning), hung objects, hidden rewards, tilt input | Both lights, all interactions |
| 8 | Performance pass, tiers, fallbacks, poster, SEO, tests, Lighthouse | Budgets met, all paths tested |

---

## 15. Anti-patterns (don't)

- `setState` or allocation inside `useFrame` or ticker callbacks
- A new material per mesh, or a material created in a component body
- Mount/unmount stations while scrolling (toggle `visible` instead)
- Default `shadows` / default tone mapping (use `shadows="percentage"`, `flat`)
- A second `requestAnimationFrame` loop anywhere
- Post-processing passes for grain or vignette (grain goes in the material)
- Runtime SVG parsing or noise for edges (bake it)
- Scaling, squashing or morphing any paper (hinges and pivots only)
- Text rendered in WebGL (all text is HTML)
- Accent colour on anything beyond the worker + 3 details + the one `<h1>` word
- Barrel files, dev tools reachable in production, and hard-coded content in components

---

## Sources

- R3F pitfalls: https://r3f.docs.pmnd.rs/advanced/pitfalls
- R3F scaling performance: https://r3f.docs.pmnd.rs/advanced/scaling-performance
- R3F Canvas props (the `flat` and `shadows` values): https://r3f.docs.pmnd.rs/api/canvas
- Lenis + GSAP integration: https://github.com/darkroomengineering/lenis
- three.js performance tips: https://www.utsubo.com/blog/threejs-best-practices-100-tips
- SVG extrusion gotchas: https://muffinman.io/blog/three-js-extrude-svg-path/
- Digital papercut layering recipe: https://www.skillshare.com/en/classes/digital-paper-cut-illustration-achieve-a-realistic-look-in-affinity-designer/1581785352, https://bokettori.substack.com/p/paper-cut-effect-with-paper-tales
- Clipper2 TS port: https://github.com/countertype/clipper2-ts
- Next 16 docs (bundled): `01-app/01-getting-started/02-project-structure.md` (colocation, private folders), `02-guides/lazy-loading.md`, `02-guides/package-bundling.md`, `05-config/01-next-config-js/reactCompiler.md`
