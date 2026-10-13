# Layers: the manifest

Every layer of the world, back to front. Formulas and numbers come from `depth-system.md`; scenes from `world.md`. Strip lengths use `7·s·P + 2400`, P = 1700.

## Master table
| z | Id | Name | `s` | Length | Ramp | Haze tint | Blur | Shadow (off, blur, α) |
|---|---|---|---|---|---|---|---|---|
| 0 | 00 | sky | 0.02 | 2 638 | sky gradient | n/a | none | none |
| 1 | 01 | moon-clouds | 0.03 | 2 757 | moon, ramp-7 | n/a | none | none |
| 2 | 02 | volcano | 0.05 | 2 995 | ramp-6 | 78% | 1.5 | none |
| 3 | 03 | haze-far | 0.08 | 3 352 | haze | sheet | soft | none |
| 4 | 04 | hills | 0.14 | 4 066 | ramp-5 | 62% | 1.2 | 3,6 / 8 / .20 |
| 5 | 05 | ridge | 0.22 | 5 018 | ramp-4 | 48% | 0.8 | 3,6 / 8 / .22 |
| 6 | 06 | haze-mid | 0.30 | 5 970 | haze | sheet | soft | none |
| 7 | 07 | environment | 0.50 | 8 350 | ramp-3 | 30% | 0.5 | 4,8 / 10 / .28 |
| 8 | 08 | far-bank | 0.70 | 10 730 | ramp-2 | 18% | 0.3 | 4,8 / 10 / .30 |
| — | W1 | water-far | 0.85 | 12 515 | water-1 | n/a | none | receives only |
| 9 | 09 | action | 1.00 | 14 300 | ramp-2 + rim | 0% | 0 | 6,12 / 14 / .35 |
| — | W2 | water-boat | 1.00 | 14 300 | water-2 | n/a | none | receives only |
| — | F2 | fireflies-mid | 1.00 | 14 300 | firefly | n/a | none | none |
| — | T | traveller | fixed | n/a | paper colours | n/a | none | own |
| 10 | 10 | near-1 | 1.25 | 17 275 | ramp-1 | darker 20% | 2 | 10,20 / 22 / .40 |
| — | W3 | water-near | 1.40 | 19 060 | water-3 | n/a | none | receives only |
| 11 | 11 | near-2 | 1.60 | 21 440 | ramp-0 | darker 45% | 5 | 16,32 / 34 / .45 |
| — | F3 | fireflies-near | 1.80 | 23 820 | firefly | n/a | 3 | none |
| 12 | 12 | foreground | 2.00 | 26 200 | ink-night | darker 70% | 9 | 24,48 / 52 / .50 |
| — | F1 | fireflies-far | 0.45 | 7 755 | firefly | n/a | none | none (drawn between 07 and 08) |

Draw order, back to front: 00, 01, 02, 03, 04, 05, 06, 07, F1, 08, W1, 09, W2, F2, **traveller**, 10, W3, 11, F3, 12. Water W2 sits below the boat's waterline; the traveller is drawn above W2 and below 10.

The fixed UI frame (rings, grain, inner shadow) is above everything; HTML tags are in the action plane, see `ui-components.md`.

## Tint shifts across the night (applied by per-stop CSS variables)
A few layers change colour along the journey. Do this by scrolling a colour-graded strip (layer 00) and cross-fading two prebaked variants of the haze sheets (03, 06). Not by live filters.

| Stop | Sky mid colour | Horizon glow | Haze |
|---|---|---|---|
| 0 | `--sky-0` | `--glow-0` warm teal | cool |
| 1 | `--sky-1` | faint | cool |
| 2 | `--sky-2` | none | cold |
| 3 | `--sky-3` | none | cold |
| 4 | `--sky-4` | none | cold, thick |
| 5 | `--sky-5` | blue and rose | cool |
| 6 | `--sky-6` | rose, gold | warm cool |
| 7 | `--sky-7` | gold | warm |

(Exact colours in `design-tokens.md`.)

## Per-layer content
Locations along each strip use the rest-fan formula `x = s·(i·P + 260)` for the landmark of stop `i`. Below, each layer's **landmark for each stop** and what lies between.

### 00 sky
A long gradient strip with tiny diamond-hole stars (about 40, more in the dark middle, none after stop 5). Colour steps listed per stop. Thin dawn-glow band at the bottom of the strip rising towards the end.

### 01 moon-clouds
The moon (a disc with a slightly lighter edge ring and 3 subtle crater cut-outs, 120 units across) at the strip start, sinking from `y=140` to `y=300` by the end. Two thin cloud strips drifting at +4 units per second extra. Moon hidden behind a cloud at stop 5 and onward a little.

### 02 volcano
One clean cone, 700 units tall at the far left, shoulders sloping to a smaller companion peak. Visible stops 0 to 2. A thread of smoke rising from the crater. At the end of the strip (after stop 3) a low far mountain range replaces it. Never reappears.

### 03 haze-far
Wide, horizontal tissue bands at y 300 to 520. Two bands overlapping. Slow drift +2 units per second.

### 04 hills
Per stop silhouettes: 0 mossy rounded hills; 1 terraced hillside with 5 steps; 2 sharp jungle ridge; 3 low rounded hills, mirrored later in the pond; 4 rolling canopy line; 5 low shore line with palms; 6 village rooftops on the far shore; 7 flat sea horizon with a faint headland.

### 05 ridge
Layered nearer ridges. Leave 100 to 180 units of gap at each landmark for the lights of the next layer.

### 06 haze-mid
Brighter, thicker bands that rise from the water line to y 640. Varies by stop: thickest in the gorge (2) and mangroves (4), thinnest in the estuary (5).

### 07 environment
The large-scale scenery per stop, as in `world.md`: spring boulders and ferns; terraces and field hut; gorge jungle and aqueduct; the pond tree; mangrove arches; estuary sandbar and pier; stilt village; rocky point and lighthouse (tall, 520 units).

### F1 fireflies-far
10 to 14 points per tile; opacity pulse 2.5 to 4.5 s, random phase, tiny drift.

### 08 far-bank
Waterline-level strip: reeds, a shrine, palms, rocks, pier stubs. Includes the **warm lights that are far** (farm light, hut window, village windows).

### W1 water-far
A thin strip of dark blue paper with 6 to 8 cut ripple arcs per 1700 units, plus the first reflections (long, thin).

### 09 action
The most detailed layer. Contains for each stop `i` the **post** that carries the tag at `x = (i·P + 260)` plus its lantern and base. Also moored boats, bamboo, gantry, valve, tree trunk, root arch, pier post, dock, lighthouse base (see `world.md`). Also includes the hidden details. Cut with lit rims.

### W2 water-boat
The boat's water. The widest ripples near the boat, lantern reflections under every warm light of layer 09.

### F2 fireflies-mid
5 to 7 unit lights drifting around the boat plane, 8 to 10 in view.

### T traveller
Fixed, drawn above W2. See `traveller.md`.

### 10 near-1
Reeds, grass, taro leaves, driftwood, buoys, nets. Mostly in the bottom 25 percent and on the left and right edges.

### W3 water-near
Large ripple tiles, bottom 12 percent of the frame, moving fast.

### 11 near-2
Large dark leaves, mangrove roots, vines, rocks. Edge framing only. Cut veins and gaps.

### F3 fireflies-near
3 to 5 large soft blobs that cross in front. Blurred halo. Rare.

### 12 foreground
Nearest framing sheet: curling leaf tips at top corners, a reed spray bottom edge, hanging vines. Sweeps past in about 0.3 of a second between stops. Near black. Must never hide the tag or traveller.

## Landmark chart (layer x for each stop, in art units, before strip left pad)
The strip's left pad is 1200 units so that stop 0 begins with content to the left of the boat. Formula: `x = pad + s·(i·P + 260)`.

| Stop | s=0.14 (04) | 0.50 (07) | 0.70 (08) | 1.00 (09) | 1.25 (10) | 1.60 (11) | 2.00 (12) |
|---|---|---|---|---|---|---|---|
| 0 | 1 236 | 1 330 | 1 382 | 1 460 | 1 525 | 1 616 | 1 720 |
| 1 | 1 474 | 2 180 | 2 572 | 3 160 | 3 650 | 4 336 | 5 120 |
| 2 | 1 712 | 3 030 | 3 762 | 4 860 | 5 775 | 7 056 | 8 520 |
| 3 | 1 950 | 3 880 | 4 952 | 6 560 | 7 900 | 9 776 | 11 920 |
| 4 | 2 188 | 4 730 | 6 142 | 8 260 | 10 025 | 12 496 | 15 320 |
| 5 | 2 426 | 5 580 | 7 332 | 9 960 | 12 150 | 15 216 | 18 720 |
| 6 | 2 664 | 6 430 | 8 522 | 11 660 | 14 275 | 17 936 | 22 120 |
| 7 | 2 902 | 7 280 | 9 712 | 13 360 | 16 400 | 20 656 | 25 520 |

(With pad 1200: the last row of s=2.0 is 25 520, within 26 200.) If the layer has its own pad, recalculate.

## Per-stop layer contents (checklist)
For each stop, the artist draws these landmarks. A ✔ means required; ○ optional.

| Stop | 04/05 | 07 | 08 | 09 (post) | 10 | 11 | 12 |
|---|---|---|---|---|---|---|---|
| 0 Spring | ✔ | ✔ spring pool | ✔ shrine | ✔ bamboo pole | ✔ taro | ○ | ○ |
| 1 Terraces | ✔ | ✔ terraces | ✔ palms | ✔ gantry | ✔ buffalo | ○ | ○ |
| 2 Gorge | ✔ | ✔ aqueduct | ✔ waterfall | ✔ valve pier | ✔ | ✔ vines | ✔ |
| 3 Pond | ✔ | ✔ big tree | ✔ hut window | ✔ branch | ✔ reeds | ○ | ○ |
| 4 Mangroves | ✔ | ✔ roots | ✔ canopy | ✔ arch | ✔ | ✔ roots | ✔ |
| 5 Estuary | ✔ | ✔ sandbar | ✔ palms | ✔ solar pier | ✔ | ○ | ○ |
| 6 Village | ✔ | ✔ stilts | ✔ roofs | ✔ dock mast | ✔ nets | ○ | ○ |
| 7 Lighthouse | ✔ | ✔ lighthouse | none | ✔ dock | ✔ rocks | ✔ foam | ○ |

## Naming
Files follow `art-pipeline.md`: `layer-07-environment.t00.svg` etc. The `id` in the table is the file prefix.
