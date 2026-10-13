# Depth system: real depth from flat sheets

The world is flat sheets stacked at different virtual distances. The viewer feels depth because of parallax, overlap, haze, shadow and blur, all driven by a single rule: **the farther a sheet, the slower it moves, the lighter and bluer it is, the softer its shadow.**

## Coordinates
- **Artboard height = 1000 art units.** Every layer is authored at this height.
- **Scale `k`** (CSS px per art unit): `k = max(vh / 1000, vw / 1900)`. So the artboard fills the frame opening in height, and on very wide screens it grows so at least 1900 units of width are visible. Phones (portrait) show about 450 to 600 units of width, so layers are cropped, not squashed.
- **Pitch `P = 1700` units.** One stop moves the speed-1.0 layer by 1700 units.
- **Speed `s`** per layer: a layer's travel per stop is `s · P`. At stop `i` its translation is `-(s · i · P)` units. Speeds are fixed in `layers.md`.
- **Traveller anchor `A = 0.30 · frame width`.** The boat is fixed at 30 percent of the opening's width, vertically centred on the waterline.
- **Hanger offset = 260 units** (scaled by `k`): at rest the tag hangs 260 units ahead of the traveller.
- **Vertical safe band:** the middle 620 units (190 to 810) of the artboard always show on every device. Anything critical (traveller, tag, post) lives in 280 to 760.

## Depth bands and speeds
Back to front. Layer ids 00 to 12 (art), then water strips and fireflies in between, then the fixed traveller.

| Band | Layers | Speed `s` | Reads as |
|---|---|---|---|
| Sky | 00, 01 | 0.02, 0.03 | Infinitely far. Barely moves. |
| Far | 02, 03 | 0.05, 0.08 | Volcano and far mist. |
| Distant | 04, 05, 06 | 0.14, 0.22, 0.30 | Hills, ridge, mid mist. |
| Mid | 07, 08 | 0.50, 0.70 | Environment, far bank. |
| Action | 09 (and traveller) | 1.00 | The plane of the boat and the tag post. |
| Near | 10, 11 | 1.25, 1.60 | Close leaves and rocks. |
| Foreground | 12 | 2.00 | Nearest framing sheet. Sweeps past. |
| Water | W1, W2, W3 | 0.85, 1.00, 1.40 | The ground plane. |
| Fireflies | F1, F2, F3 | 0.45, 1.00, 1.80 | Lights at three depths. |

The **traveller** is fixed on screen and not part of any band; the water slides under it.

## The rest-fan: aligning content to stops
At stop `i` layer `L` is translated by `-(s_L · i · P)`. For content on layer `L` to appear near the traveller when stop `i` is reached, place its feature at layer x:

`x_L(i) = s_L · (i · P + 260)`   (art units, measured from the layer's own left edge plus its pad)

Then at rest its screen x (relative to the traveller anchor `A`) is `260 · s_L`. This is the **rest-fan**: at every stop, the tag post of layer 09 sits 260 units ahead of the boat, features in slower layers cluster closer to the boat's x and features in faster layers fan out further ahead. It looks natural and guarantees each layer's feature for that stop is in view at rest.

Authoring rule: when an artist places the "landmark of stop i" in layer `L`, use that formula. Everything between landmarks is free art that scrolls past during transit.

## Strip length
Each layer is one wide strip. It must cover the whole journey plus the visible width:

`length_L = 7 · s_L · P + 2400` (art units)

The 2400 is generous padding for the visible width (up to 1900) and the pointer shift. Values (P = 1700):

| `s` | length (units) |
|---|---|
| 0.02 | 2 638 |
| 0.03 | 2 757 |
| 0.05 | 2 995 |
| 0.08 | 3 352 |
| 0.14 | 4 066 |
| 0.22 | 5 018 |
| 0.30 | 5 970 |
| 0.45 | 7 755 |
| 0.50 | 8 350 |
| 0.70 | 10 730 |
| 0.85 | 12 515 |
| 1.00 | 14 300 |
| 1.25 | 17 275 |
| 1.40 | 19 060 |
| 1.60 | 21 440 |
| 1.80 | 23 820 |
| 2.00 | 26 200 |

**Tiling:** author strips as consecutive **tiles of at most 1700 units** wide (one per pitch where possible). Only tiles overlapping the viewport (plus one on each side) are mounted. See `tech-architecture.md`.

## Parallax reading
- The ratio between the farthest and nearest moving speeds is 0.03 : 2.0, about 67 to 1. That wide range is what sells depth. Do not compress it.
- Pointer parallax adds a small extra offset, proportional to `s`: see `motion.md`.

## Atmospheric perspective (haze and value)
Each layer is tinted toward the haze colour `--c-haze` by an amount that falls with proximity. Applied **in the art**, not as live filters.

| Layer | Tint toward haze | Ramp step | Notes |
|---|---|---|---|
| 02 | 78% | `--ramp-6` | Volcano, lightest solid |
| 04 | 62% | `--ramp-5` | |
| 05 | 48% | `--ramp-4` | |
| 07 | 30% | `--ramp-3` | |
| 08 | 18% | `--ramp-2` | |
| 09 | 0% | `--ramp-2` with lit rim | Action plane |
| 10 | darken 20% | `--ramp-1` | |
| 11 | darken 45% | `--ramp-0` | |
| 12 | darken 70% | `--c-ink-night` (#04070D) | Near black |

Layers 03 and 06 are the haze sheets themselves, `--c-haze` at 35 to 55 percent opacity.

## Depth shadows (baked)
Key light direction `(0.5, 1)`. A sheet's shadow falls onto the sheet behind it. Offsets in art units, blur radius in art units, black at stated opacity (colour `--c-shadow`).

| Layer | Offset (x, y) | Blur | Opacity |
|---|---|---|---|
| 04 | 3, 6 | 8 | 0.20 |
| 05 | 3, 6 | 8 | 0.22 |
| 07 | 4, 8 | 10 | 0.28 |
| 08 | 4, 8 | 10 | 0.30 |
| 09 | 6, 12 | 14 | 0.35 |
| 10 | 10, 20 | 22 | 0.40 |
| 11 | 16, 32 | 34 | 0.45 |
| 12 | 24, 48 | 52 | 0.50 |

Layers 00 to 03 have no sheet shadow. Water strips cast no shadow but receive them.

## Baked depth of field
Focus plane = layer 09. Layers off the plane are baked slightly soft. Values are Gaussian radius in art units, applied to the layer's art (not the shadow).

| Layer | Blur |
|---|---|
| 02 | 1.5 |
| 04 | 1.2 |
| 05 | 0.8 |
| 07 | 0.5 |
| 08 | 0.3 |
| 09 | 0 |
| 10 | 2 |
| 11 | 5 |
| 12 | 9 |

Do not apply blur live in CSS. Blurring wide animated layers live is the single most expensive thing in this design.

## The river as ground plane
The water is not one picture. Three horizontal strips lay out the ground in perspective:
- **W1 (far water, s = 0.85):** from the far bank down to the boat's line. Narrow vertical band, small ripples.
- **W2 (boat water, s = 1.00):** the boat's own plane; bigger ripples, lantern reflections with long vertical streaks.
- **W3 (near water, s = 1.40):** the strip below the boat, to the bottom edge; largest ripples, moves fastest.

The boat sits in W2's band. Reflections: each light and bright sheet above has a vertical reflection stretched ~1.6x, broken by 4 to 6 horizontal cut gaps, drawn in the water strips at the same x (use the rest-fan formula, and scroll speeds equal to the strip speed so they stay roughly beneath their objects).

Water ripple motion: cut-paper "wave tiles" slide at a slightly different rate than the strip's base speed. See `motion.md`.

## Occlusion and overlap
- Layers 07 and 08 must overlap each other by at least 60 units vertically.
- Layer 09 overlaps the water: posts stand in water, bases are hidden under W2's top edge.
- Layers 10 to 12 may hide up to 25 percent of the frame total, never the tag.
- Haze sheets (03, 06) sit between bands so that where nearer sheets meet farther ones, mist fills the gap, which makes the depth change feel gradual.

## Fireflies at three depths
Small lights. Each is a tiny warm-yellow-green disc with a soft halo sprite.

| Depth | Speed | Size (units) | Count in view | Behaviour |
|---|---|---|---|---|
| F1 far | 0.45 | 3 to 4 | 10 to 14 | Slow, small drift, dim. |
| F2 mid | 1.00 | 5 to 7 | 8 to 10 | Drift around layer 09. |
| F3 near | 1.80 | 9 to 12 | 3 to 5 | Large, soft, blurred. Cross in front. |

Counts scale with the night's arc (fewest at dusk and dawn, most at midnight). Fireflies are CSS-animated elements with a baked halo, not canvas. Phone profile cuts counts to half.

## Motion in depth during a step
During the ~1.2 s step, each layer moves its own distance `Δ = s·P` along the same easing. Because they share time but differ in distance, the far layers appear to ease with the near ones: you feel a single camera glide. Do **not** stagger layer timing: it breaks the feel of a single move. See `motion.md`.

## Phone merge profile
Fewer layers to cut GPU memory and compositing. At width below 640 px, merge in the art export (see `art-pipeline.md`):

| Phone layer | Merges | Speed |
|---|---|---|
| P0 sky | 00 + 01 | 0.02 |
| P1 far | 02 + 03 | 0.06 |
| P2 hills | 04 + 05 + 06 | 0.20 |
| P3 mid | 07 + 08 | 0.60 |
| P4 action | 09 | 1.00 |
| P5 near | 10 + 11 | 1.45 |
| P6 foreground | 12 | 2.00 |

Total 7 art layers plus the 3 water strips. Shadows and blur stay baked. Merged strips use the longer of the two source lengths.

## Budgets that protect the depth
| Budget | Target |
|---|---|
| Mounted layer elements at once | Desktop at most 40 tiles, phone at most 22 |
| Texture memory on phone | Under 160 MB estimated for mounted tiles at DPR 2 |
| Device pixel ratio | Capped at 2 for art |
| Live filters | Zero on moving layers |

## Validation prototype (do this first)
Before authoring all art, test GPU cost: build a mock with 13 coloured, shadowed tiles on desktop and an actual phone. Compare **inline SVG** versus **pre-rasterised AVIF/WebP**. Pick the approach by measured frame time and memory, then record it in `decisions.md`.
