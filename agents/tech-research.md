# Tech research: making the diorama real 3D, and fast

Research from 2026-09-24. Versions were checked on npm that day. The goal is real 3D (not CSS layers) while keeping the site "super optimized".

## Verdict

**WebGL through three.js + React Three Fiber**, with a **server-rendered HTML layer** for all text. The 3D scene loads *after* the page is already readable.

Why WebGL over CSS 3D:
- **Real lighting and shadows.** A lamp light plus shadow maps gives us §2.3 (shadow from depth), §2.7 (one light) and §4.3 (a movable light: every shadow follows) automatically. With CSS we'd have to fake each shadow per sheet.
- **Real paper thickness.** Sheets are SVG outlines extruded ~1–2 mm (`ExtrudeGeometry`), so the lit edge (§2.4) and the edge-on strip when something hinges (§4.5) come from the geometry itself.
- **Grain that catches the light.** One tiled paper normal map and roughness map: fibres light up under a low, raking lamp (§4.3). That's impossible in CSS.
- **A deep camera journey.** Moving the camera through 6–10 stations is just a camera move. Deep CSS `preserve-3d` stacks run into layering and repaint limits.

## Stack (versions as of 2026-09-24)

| Package | Version | Role | Notes |
|---|---|---|---|
| `three` | 0.186.0 | renderer | Use **WebGLRenderer**, not WebGPU (see below) |
| `@react-three/fiber` | 9.8.0 | React renderer | peer `react >=19 <19.4`. We're on 19.2.8, which is fine. v10 is still alpha, avoid it |
| `@react-three/drei` | 10.7.8 | helpers | Import only what we use (PerformanceMonitor, AdaptiveDpr, useTexture, Html if needed) |
| `maath` | 0.10.8 | damping / easing | `damp`/`damp3` for all "slow, never snapping" motion (§8). Tiny |
| `gsap` | 3.15.0 | choreography | Added by user decision. Timelines for the pop-up entrance, lighting roll and camera path, plus ScrollTrigger (free). Lazy-loaded with the scene |
| `lenis` | 1.3.26 | smooth scroll | ~3 kB. Provides the smoothed scroll value that drives the camera |
| `r3f-perf` / `stats-gl` | 7.2.3 / 4.2.3 | profiling | **dev only**, never shipped |
| `@gltf-transform/cli` | 4.5.0 | build tool | Only if we export geometry to GLB (meshopt compression) |

**Deliberately skipped:**
- **Postprocessing (`postprocessing`, `@react-three/postprocessing`)**: every full-screen pass costs fill rate on phones. Vignette, grain and tint all go in materials instead. §4.9 focus blur is "use sparingly", so skip it.
- **WebGPU**: three r171+ ships `WebGPURenderer` with WebGL2 fallback, but it isn't faster for a scene with few draw calls like ours, and only some drei components support it. Revisit if we ever need compute shaders.
- **KTX2 textures**: they save GPU memory on big texture sets, but the Basis transcoder is a wasm download. Our textures are flat colours plus one small tiled grain map, so a small WebP/PNG is cheaper overall.
- **Motion (framer)**: redundant alongside R3F + maath.

## Architecture: readable first, 3D second

1. **HTML shell (Server Components, static).** All text (name, role, projects, experience, contact) is real HTML, styled as paper plates. This is what LCP, SEO, screen readers and no-JS visitors get. It's also the fallback when WebGL is missing, the device is weak, or `prefers-reduced-motion` is on (as a still scene).
2. **Poster frame.** A pre-rendered AVIF of the composed front view (via `next/image`) sits where the canvas will go. LCP is an image, not WebGL.
3. **Canvas loads lazily.** `next/dynamic(() => import('./Scene'), { ssr: false })` from a Client Component (per the Next 16 lazy-loading guide, `ssr:false` isn't allowed in Server Components), mounted after idle. It fades in over the poster once the first frame is ready. three + R3F are roughly ~200 kB gz and never block first paint. Verify with `npx next experimental-analyze` (Next 16.1+, Turbopack).
4. **Content ↔ scene link.** Each station's plate in the HTML shell carries an anchor. The jump-to-depth tag scrolls to it, and the camera follows the scroll. There's a single source of truth: scroll position.

## Scene construction

- **Sheets:** SVG outlines → `Shape` → `ExtrudeGeometry` (depth ~0.002 world units, bevel off). **Edge wobble is baked in at build time with a fixed seed** (a small Node script adds noise along each path), so there's zero runtime cost. Static sheets in the same layer are merged into one geometry: one draw call per layer.
- **Materials:** `MeshStandardMaterial` with a flat `color` per sheet (§2.1 one colour per sheet). All sheets share one tiled grain normal map and roughness map. The morning relight changes material colours with `damp` over ≥1 s (§5, §8). It's the same geometry, just new stock.
- **Light:** one `SpotLight` = the desk lamp, following the pointer (damped). A dim ambient/hemisphere light tinted by state keeps shadows coloured, never grey (§5).
- **Shadows:** `PCFShadowMap` (in r186, `PCFSoftShadowMap` is deprecated and falls back to PCF, which is soft by default; verified in the r186 source), map size 1024 (512 on low tier), and a tight shadow camera frustum around the visible station. Only sheets that matter cast or receive shadows. Update the shadow map only when the light, the worker or the camera moves.
- **Worker:** a hierarchy of flat extruded pieces on pivot groups (split pins). The walk cycle is procedural (`sin` on the hip/knee/arm pivots plus a vertical bob), with no rigging, no GLTF and no animation clips. He moves along the cable path (a `CatmullRomCurve3`), paced relative to the camera.
- **Hung objects and tags:** a damped spring on a single rotation axis (§8). A few lines of code, no physics engine.
- **Stations:** each station is its own `<group>`, loaded as the camera approaches and then kept mounted with `visible` toggled (superseded by `architecture.md` §6.4).

## Runtime budget and optimizations

- **DPR:** `dpr={[1, 1.75]}`, plus drei `PerformanceMonitor` to step down (DPR → shadow map size → idle drift off) when FPS drops.
- **Draw calls:** target <100 on mobile. Check with `renderer.info.render.calls`.
- **Frameloop:** `frameloop="demand"` whenever nothing is moving (tab hidden, canvas off-screen via IntersectionObserver, reduced motion, or the scene settled after the "return to rest" in §4). The idle drift runs at a low amplitude and pauses off-screen.
- **Input:** pointer → lamp + box tilt. Touch drag → tilt. `DeviceOrientationEvent` needs a user-gesture permission on iOS, so it sits behind a small paper "tilt to look" toggle.
- **Next config:** `reactCompiler: true` (needs `babel-plugin-react-compiler`); maybe `experimental.inlineCss` (it's experimental, so measure first). `next/font` self-hosted, one family + italic, subset.
- **Assets:** static, immutable cache headers, all served from our own origin.

## Verify

- Lighthouse on the production build: LCP from the poster, TBT low because the canvas loads after idle.
- A real mid-range Android: aim for a steady 60 fps on the journey, and ≥30 fps with no jank on the low tier.
- `stats-gl` / `r3f-perf` in dev only.

## Sources

- R3F compatibility and versions: https://github.com/pmndrs/react-three-fiber/releases, https://r3f.docs.pmnd.rs/getting-started/installation
- three.js performance tips (shadow map size, DPR cap, on-demand frames, draw-call budget): https://www.utsubo.com/blog/threejs-best-practices-100-tips
- WebGPU state and drei support: https://www.utsubo.com/blog/webgpu-threejs-migration-guide, https://threejs.org/manual/en/webgpurenderer.html
- Lenis + GSAP: https://github.com/darkroomengineering/lenis
- Next 16 docs: `node_modules/next/dist/docs/01-app/02-guides/lazy-loading.md`, `package-bundling.md`, `05-config/01-next-config-js/reactCompiler.md`
