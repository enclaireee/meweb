# Art direction: how the paper looks

The material rules. Every layer, prop and UI piece must obey these. `art-pipeline.md` says how to author them; `design-tokens.md` has the exact colours.

## The material
Everything is **paper** (and a little card). Nothing is drawn with gradients, strokes or glows inside a sheet. Light and depth come from **how sheets are stacked**.

- **One sheet = one flat colour.** No gradients on a sheet. The only gradients allowed are on the sky strip (layer 00) and in baked haze/glow overlays, which read as translucent tissue paper.
- **Cut, not drawn.** Shapes are made of straight scissor cuts and gentle arcs. Interior details (windows, leaf veins, lantern patterns) are **holes** through which the sheet behind shows.
- **Edges have thickness.** Every sheet gets a 1.5-unit lighter edge on its upper-left side (moon-facing) and a 1.5-unit darker edge on its lower-right. Subtle, it is what makes it read as card.
- **Shadows fall on the sheet behind**, from one key light (the moon). See below.
- **Overlap is the language.** Depth reads when sheets overlap and cast shadows on each other. Always keep layers overlapping. Never leave a layer floating without something behind it to receive a shadow.

## Cut quality
| Rule | Value |
|---|---|
| Straight facets | Outlines are chains of segments, 20 to 60 units long, with ±0.8 unit vertex jitter. Not perfectly smooth, not wobbly. |
| Corners | Sharp. No rounded corners except on lantern shades and the moon. |
| Curves | Long arcs from 3 to 5 chords. No hand-drawn squiggle. |
| Minimum feature | 3 units. Holes smaller than that vanish on phones and are not cut. |
| Holes | Crisp, with a 1-unit inner shadow on the upper-left inside edge. |
| Repeats | Never copy-paste identical shapes in a row. Vary scale 90 to 110 percent and rotation ±4 degrees. |
| Silhouettes | Read at a glance. If a shape needs a label, redraw it. |

## Light and shadow (single rule)
- **Key light = moon, upper left.** Shadows fall **down and slightly right**: direction vector `(0.5, 1)` normalised. Never change this, at any stop.
- Warm lanterns do not cast sheet shadows. They add **glow**: a soft translucent warm disc in the haze layer above them, tinting nearby sheets lighter and warmer in a small radius.
- Shadow strength grows with how close a sheet is to the viewer, because the gap between sheets grows. Values by layer are in `depth-system.md`.
- Shadows are **baked** into each layer's art (a darker, offset, blurred copy under the sheet), not applied live.

## Colour approach
- **Cool moonlit world, warm points of light.** Roughly 85 percent cool (teals, blues, deep greens), 15 percent warm (lantern amber, dawn rose and gold).
- **Value separates layers, hue unifies.** Far layers are lighter and bluer (atmospheric perspective), near layers are darker. The eight-step night ramp (`--ramp-0` darkest to `--ramp-7` lightest) is assigned by layer. A reader should be able to squint and still see each layer as a separate value band.
- The **action layer (09)** is mid-value so tags and posts read, with a lit rim. The **foreground (11, 12)** is near black and frames the scene like a cut paper border.
- Foliage greens are night-shifted (blue-greens). Never saturated daylight green.
- Warm colours appear only for light sources, window glow, dawn sky, and the traveller's lantern. If something warm is not a light, reconsider it.
- Details in `design-tokens.md`: ramp, warm set, paper UI colours, sky stops per stop.

## Texture
- **Paper grain:** one fixed overlay on the frame opening, a subtle fibre noise at 6 to 8 percent opacity, `mix-blend-mode: soft-light`. It sits above the world and below the frame. It does **not** move with the layers, which keeps the sense of looking through a window at paper. One layer of grain only: not per sheet.
- **Frame texture:** the ring sheets use a slightly rougher grain, 12 percent.
- **No other texture.** No noise on individual sheets. No halftone. No paint effects.

## Haze, blur and glow (the soft things)
All three exist only as **baked** or **single overlay** assets:
- **Haze bands:** translucent tissue-paper sheets (layers 03 and 06) with soft edges, drifting slowly.
- **Baked depth of field:** far layers get a tiny baked blur, near layers a larger one. Focus plane is the action layer (09). Values in `depth-system.md`.
- **Glow:** a pre-rendered soft radial sprite in the haze layer centred on each light. One sprite, reused, scaled.

## Motifs and pattern language
- **Punched lantern pattern:** a kawung-inspired grid of overlapping circles cut as holes, 4 to 6 units per cell. Used on lantern shades, post caps and the frame's four corner ornaments.
- **Leaf veins** cut as thin holes, 3-unit wide.
- **Ripples:** concentric cut arcs on water.
- **Stars:** tiny 3-unit diamond holes in the sky sheet.

## Scale of detail
Detail density follows depth: far layers carry big simple shapes. The action layer (09) carries the most detail, because it is the stage for the tag. Near layers are bold and dark, a few big shapes with a few precise holes. This keeps the eye on layer 09 and the file size down.

## Silhouette and composition rules
1. The **tag post** (layer 09) is always vertical-third left-of-centre of the safe area, lit by its lantern, and nothing in layers 10 to 12 may cover the tag.
2. Foreground layers 11 and 12 occupy the **bottom and top edges** and the **outer left and right** only. The centre stays open.
3. There is always one clear **line of light**: from the lantern, across the water, to the lowest reflection.
4. The **horizon** sits at 38 percent from the top of the artboard (380 units from the top) for stops 0 to 4, rising to 46 percent at the estuary and the lighthouse (the sea opens).
5. Leave the **top-left** brightest (moon) and the **bottom-right** darkest (shadow side).

## Do
- Overlap sheets generously, put shadows on every overlap.
- Cut holes to let light through.
- Vary shapes and spacing.
- Keep the key light direction.
- Keep warm light rare and meaningful.

## Don't
- No outlines or strokes drawn around shapes.
- No gradients inside sheets. No glossy highlights. No lens flare.
- No pure black (`#000`) or pure white. Darkest is `--ramp-0`, lightest the moon colour.
- No photographic textures, no perspective or isometric tricks.
- No more than 5 flat colours in one sheet.
- No text in the art. All text is HTML.
- Do not recreate real religious or national symbols in detail. Keep landmarks generic.

## Quality checklist (per layer)
- Reads as a silhouette when blurred.
- Shadow direction correct.
- Edge lights present on moon-facing edges.
- No stray seams at tile joins.
- Value fits its band in the ramp.
- Min feature 3 units.
- File within the budget in `art-pipeline.md`.
