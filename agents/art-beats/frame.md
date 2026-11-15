# frame

The paper frame: 4 nested torn-edge sheets around the screen edges, always on screen, above every beat and the projects lane, below the HTML text. Art bakes **alpha masks only** (white, alpha = sheet). The renderer tints them per scene with CSS, so one set of masks serves every scene.
Slug `frame` (art-scene owns `art/frame/**`, `public/art/frame/**`). Who renders it is an open question (lead, `src/app/**`); this brief gives the contract.

## Sheets
Each sheet is a full-canvas mask: opaque from the screen edge to its torn inner edge, transparent in the middle. Sheet 1 is painted first (bottom) and reaches furthest toward the centre (lightest tint); sheet 4 is painted last (top), hugs the screen edge (darkest tint). The stack steps down toward the centre like the gates.

| sheet | paint order | file (desktop / portrait) | inner edge distance from screen edge (design px) | torn edge |
|---|---|---|---|---|
| 1 | 1st (bottom) | `frame-d-1.webp` / `frame-p-1.webp` | 40-50 | `cut(rect, rng(9001), 5, 18)` + bites |
| 2 | 2nd | `frame-d-2.webp` / `frame-p-2.webp` | 32-40 | `cut(rect, rng(9002), 4, 14)` + bites |
| 3 | 3rd | `frame-d-3.webp` / `frame-p-3.webp` | 24-30 | `cut(rect, rng(9003), 3.5, 12)` + bites |
| 4 | 4th (top) | `frame-d-4.webp` / `frame-p-4.webp` | 14-22 | `cut(rect, rng(9004), 3, 10)` + bites |

Total band: 32-54 px (3-5% of the 1080 short side).
- **rect** = the canvas inset by the sheet's mean distance; the sheet = `difference(canvasRect, cut(rect, ...))`.
- **Bites:** torn notches 8-14 px deep, 20-60 px wide, every 180-320 px along each edge (`rng(9100 + sheet)`); bites on neighbouring sheets never line up (offset >= 60 px).
- **Corners:** inner corners torn round (radius 30-60 px, jittered). Sheet 2 has one folded corner bottom right (40 px triangle at alpha 0.85), sheet 3 one top left.
- No straight run over 120 px on any inner edge.
- Desktop canvas 1920x1080; portrait 1080x1920, re-seeded (`rng(9011..9014)`, bites `rng(9110 + sheet)`), same distances.

## Bake
- White fill `#ffffff`, alpha = sheet. No shadow baked (the renderer adds it).
- Scale 0.5 (desktop raster 960x540, portrait 540x960), **lossless WebP**; each mask <= 7 KB, all 8 <= 60 KB. If over, reduce bite count before anything else.
- Write `public/art/frame/manifest.json`: `{ "desktop": ["frame-d-1.webp", "frame-d-2.webp", "frame-d-3.webp", "frame-d-4.webp"], "portrait": [...], "tints": { "<scene>": [sheet1, sheet2, sheet3, sheet4] } }` from the table below.

## Rendering contract (for the renderer)
- One fixed, full-viewport, `pointer-events: none` element per sheet, in paint order; orientation picks `-d-` or `-p-` (same rule as the beats).
- Each sheet: `background-color: <tint>; mask-image: url(...); mask-size: 100% 100%; mask-repeat: no-repeat`.
- Shadow: wrap each masked element in a parent with `filter: drop-shadow(0 2px 4px rgb(0 0 0 / .45))`; a filter on the masked element itself gets masked away.
- Scene change: `transition: background-color 600ms ease` (instant under reduced motion).
- Ceiling: `mask-size: 100% 100%` stretches the masks, so on aspect ratios far from 16:9 / 9:16 band thickness varies by up to about 20%. Upgrade path if it shows: bake 4 edge strips + 4 corners per sheet instead of full-canvas masks.

## Tints per scene
| scene | sheet 1 (inner, lightest) | sheet 2 | sheet 3 | sheet 4 (edge, darkest) |
|---|---|---|---|---|
| b0-outside | #22384f | #16263a | #0b1420 | #05090f |
| b1-approach | #22384f | #16263a | #0b1420 | #05090f |
| b2-first-fold | #6a5a55 | #1f3550 | #0f1a2a | #05090f |
| b3-scale-flip | #7a3d1c | #4a2413 | #26120b | #140904 |
| b4-inner-sun | #7a3d1c | #4a2413 | #26120b | #140904 |
| b5-understory | #2f5637 | #1d3a2b | #0f2019 | #07120d |
| b6-lantern-vault | #24364f | #0f1a2b | #070b14 | #030508 |
| b7-second-fold | #54507f | #332f55 | #1b1a33 | #120f24 |
| b8-seam | #e3d3bb | #c9b8a6 | #6f5f6b | #382e3c |
| b9-window | #4a3634 | #3a2a2a | #241a1c | #1a1214 |
| shell | #34486c | #1e2b45 | #0a1120 | #04070e |
| p-web | #452617 | #2c180e | #180c06 | #0e0703 |
| p-data | #183440 | #10242d | #07131a | #040b0f |
| p-hardware | #3c1d2a | #28121d | #150910 | #0b0509 |

## QA
- Inner edge within 54 px (design) on every side; never reaches the safe area (bible E2) or text.
- Over each scene the innermost tint sits within one tone of that scene's edge colours (no bright ring around dark scenes; b8 is paper on paper by design).
- No straight run over 120 px; bites do not align across sheets.

## Budget
All 8 masks + manifest <= 60 KB.
