# Art pipeline: how to author and export the layers

Claude writes the SVG art; the user art-directs through screenshots. Because the art is code, it is built by small scripts that generate SVG from parameters, so shapes can be tuned without redrawing. Do not run these until the user moves from docs to build (`build-order.md`).

## Authoring approach
1. **Sketch in code, not in a tool.** Each layer-stop pair is a small generator (a function that returns an SVG string from a seeded random). Seeds make results reproducible.
2. **Shared helpers** (one module): a facet-cut outline from a list of points with ±0.8 jitter; a hole cutter; a rim-light and shadow adder; a haze tint function; a kawung pattern generator.
3. **Review loop:** render the layer on the composed scene in a browser, take screenshots at 3 viewport sizes, the user comments, Claude edits parameters.
4. **Freeze.** When approved, export final SVGs and record the seed.

## File and folder layout
```
art/                     source generators (not shipped)
  helpers/
  layers/
public/art/
  desktop/
    layer-00-sky.t00.svg … layer-12-foreground.tNN.svg
    water-w1.t00.svg …
  phone/
    p0-sky.t00.svg …
  manifest.json          list of tiles with width, position, layer, profile
```
Names: `layer-<id>-<name>.t<tile>.<ext>`; tile numbers are zero-padded from 00. Raster fallbacks use the same name with `.avif` and `.webp`.

## Tile rules
- Tile width at most **1700 units**; height 1000 (or less for strips that do not fill the height, in which case position with `y` and `height` in the manifest).
- Tile joins must be seamless: ensure no shape's edge falls within 4 units of a join, or let a shape cross the join by repeating it into both tiles.
- Each tile has the **shadow baked** in (shape duplicated, offset, blurred, `--c-shadow` colour, at the layer's opacity) and, if listed in `depth-system.md`, the **blur baked** on the art copy.
- Add **overscan** of 40 units on the right side of each tile so the blur and shadow do not clip at the join.

## SVG rules
- viewBox in art units, `width` and `height` unset in markup (sized by CSS).
- Flat `fill` colours using the token hex values (no CSS vars inside images).
- No `<text>`, no embedded raster, no scripts.
- Blur uses `feGaussianBlur` only at bake time; when exporting the final SVG, blur is replaced by pre-computed approximated paths, or the tile is exported as raster (see below).
- Paths should be simplified: at most 1500 path points per tile for far layers, 4000 for layer 09.
- Use `shape-rendering: geometricPrecision`.

## SVG or raster?
Decision pending a prototype test (`depth-system.md` validation). Rules:
- **Inline SVG or `<img>` SVG** if the tile's raster texture memory and frame time are acceptable. Crisp at any DPR.
- **Pre-rasterised AVIF with WebP fallback** (via `sharp`, already in `package.json`) for blurred/shadowed tiles where SVG filters would run per frame. Raster export at scale 1 and 2 (`@2x`); art units to px: 1 unit = 1 px at scale 1.
- Mixed is fine: sharp layers (09) SVG, soft layers (10 to 12 shadows and blur) raster.

## Budgets
| Item | Budget |
|---|---|
| Single SVG tile | ≤ 120 KB gzipped (layer 09: ≤ 200 KB) |
| Single raster tile | ≤ 90 KB (AVIF, quality ~55) |
| Total art, desktop | ≤ 3.0 MB over the network |
| First-view payload (stop 0 region, critical) | ≤ 700 KB |
| Texture memory, mounted (phone) | ≤ 160 MB |
| First contentful paint | ≤ 1.8 s on a mid-range phone on 4G |

First view loads: layers 00 to 12 tiles covering stop 0 and stop 1 only, then lazy-load the rest in the idle time, nearest next stop first.

## Phone export
Create the 7-layer merge profile from the same generators by merging source layers at export (see `depth-system.md`). Do not scale down desktop art. Use a lower detail level (holes below 4 units dropped, point budgets halved).

## Poster and OG image
Render stop 0 at 1600 × 900 (desktop poster, AVIF) and 900 × 1600 (phone poster), and a 1200 × 630 Open Graph image. Used for the no-JS view and as the first paint placeholder.

## Per-asset checklist
- Seed recorded in `manifest.json`.
- Shadow direction (0.5, 1) verified visually.
- Edge lights present.
- Value fits band, checked in greyscale.
- Tile joins seamless at both rest positions and mid-glide.
- Renders correctly at scale 0.35 (phone portrait).
- Under the byte budget.

## Props library (author once, reuse)
Lantern (round, hex), tag post (hook top), bamboo pole, bamboo gantry, moored boat, taro leaf, banana leaf, reed set, palm, mangrove root arch, stilt house, fishing net, buoy, conical hat rack, lighthouse, solar panel arm, valve wheel, nautilus, scarecrow, heron, gecko, bat, kingfisher, mudskipper, seabird, cat, rooster. Each prop is a function `(seed, scale) → svg group`.

## Authoring order
1. Prototype test with plain shapes (no art).
2. Sky, moon, volcano, haze (the first impression).
3. Layer 09 stop 0 with the traveller and the tag post (the key frame).
4. Remaining depth layers for stop 0 and 1.
5. The other stops one at a time, in world order.
6. Ambient creatures and hidden details last.
