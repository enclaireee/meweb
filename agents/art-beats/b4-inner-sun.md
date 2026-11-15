# b4-inner-sun

Palette `hall`. Section text: Experience (part 2). Text: desktop left, portrait bottom.
Key light: radial from the sun **(1300, 380)** desktop / (540, 520) portrait.
Hero effect (only one): the paper sun's two ray rings counter-rotate with scroll (`sun-rays-outer` rotate -20 deg, `sun-rays-inner` +30 deg over the beat); the core stays still.
Grand: the widest shot. A paper sun hangs in a vast vault; a colossal cliff city in shadow on the left (tone-on-tone, hundreds of tiny windows), a terraced ruined city under the sun on the right, the heron standing in the light pool. No blank walls: the cliff is the densest calm surface in the project.

## Desktop 1920x1080
- Calm zone: x 0-864, y 160-940 (the cliff city in shadow).
- Sun: core r 150, inner rays to r 240, outer rays to r 330.
- Exit aperture: **(1660, 800)**: an arch 70x100 on the far terraces whose opening shows `foreshadow` (understory light) with 3 tiny pine silhouettes.
- Gates: `gate-l` rest inner x 160-280 (calm side), `gate-r` rest inner x 1700-1800, standard.

| d | id | z | content | fills | fx | motion |
|---|---|---|---|---|---|---|
| 0 | `vault-glow` | 0 | bg vault-far with `stack` 4 light tiers (circles) around the sun | vault-far, vault-glow, vellum, sun | S4/80 | |
| 1 | `sun-halo` | 0.03 | 3 concentric vellum rings r 560 / 460 / 380 | vellum 0.35 / 0.45 / 0.55 | | breathe(0.85-1) |
| 2 | `ribs-far` | 0.05 | 3 huge concentric vault ribs spanning the vault behind the sun, each with a row of coffer holes (10x16 px) | vault-far-2, vault-far | S2/6, R radial, H | |
| 3 | `city-far` | 0.1 | terraced city x 1000-1920, y 600-800: 14 `tower`s 30-90 px with window holes, 3 `bridge`s, `stairs`, 40 tiny `pine`s/`tree`s; contains the exit arch (foreshadow inside) | vault-far-2, vault-mid; foreshadow | S2/5, R radial, H | |
| 4 | `mist-far` | 0.15 | `mist` band y 760 across x 900-1920; second band y 640 | vellum 0.3 | | drift(30) |
| 5 | `sun-rays-outer` | 0.2 | ring sheet r 180-330 with 16 long cut rays, each ray with a slit hole; `stack` 2 | sun, vellum | S2/8, R radial | hero: rotate, origin = sun centre |
| 6 | `sun-rays-inner` | 0.2 | ring r 150-240 with 12 short rays | vellum, sun | S2/6 | hero: rotate opposite |
| 7 | `sun-core` | 0.2 | disc r 150 `stack` 4 with a ring of 24 punched holes (8 px) on tier 2; 3 hanging cords from y -40 (rock-dark, 4 px); `glow` r 360 | vellum, mix(vellum, sun, .5), sun, lamp-core; lamp 0.55 | S4/14, G | breathe(0.9-1) on glow |
| 8 | `cliff-city` | 0.3 | colossal cliff x -60..900, full height. `stack` 3 on the silhouette. Calm tone-on-tone: 120 tiny windows 4-8 px (rock-dark), 9 terraces, 6 `stairs` runs, hanging gardens (`vine`, `fern`), 4 `bridge`s reaching out toward the centre (x 700-1000); the sun-facing edge (x > 864) gets full rim-warm | rock-mid, rock, vault-near; rock-dark | S3/14, R radial (0.25 inside calm), I, H | |
| 9 | `terraces` | 0.35 | mid terraces x 900-1920, y 760-940: `strata` slabs, 20 `tree`s and `pine`s 30-80 px, `ruinWall` fragments, 4 `column` stumps | vault-mid, vault-mid-2, vault-near | S3/10, R radial, I | |
| 10 | `light-pool` | 0.4 | vellum ellipse pool (1300, 900) 460x34 with 8 ripple slits; 2 waterfall strands from the terraces | vellum 0.45-0.6 | | breathe(0.8-1) |
| 11 | `shafts` | 0.45 | 5 `shaft`s radiating from the sun down/outward; clipped before x 880 | vellum 0.2-0.3 | | breathe(0.7-1) |
| 12 | `rock-near` | 0.7 | near ledge y 960-1080 with ferns, roots, broken balustrade; left of x 864 calm | rock, rock-dark | S3/14, R radial, I | |
| 13 | `dust` | 0.6 | `scatter` 200 motes around the sun and shafts (x 900-1900) | dust 0.3-0.8 | | highOnly |
| 14 | `gate-l` | 1 | near cliff edge with hanging roots (calm) | gate, rock-dark, rock | S3/18, R(0.25), I | sway(0.4, 50% 0%) on roots |
| 15 | `gate-r` | 1 | near broken column + hanging vines | gate, rock-dark, vault-near | S3/18, R radial, I | |

## Portrait 1080x1920
- Calm zone: y 1056-1920: lower terraces and ledge in shadow (rock tones), cliff bases.
- Sun (540, 520), placed from the desktop sun layers with `place` s 0.9 (`sun-halo`, `sun-rays-outer`, `sun-rays-inner`, `sun-core`).
- Cliff city as two towering walls: left x -60..260, right x 820..1140, up to y 1000 (lit tones allowed above y 1000 on the sun-facing edges).
- Redraw `-p`: `vault-glow-p`, `ribs-far-p`, `city-far-p` (y 820-1000), `mist-far-p`, `cliff-city-p`, `terraces-p` (y 980-1300, calm tokens below 1056), `light-pool-p` (540, 1000), `shafts-p` (end above y 1050), `rock-near-p`, `dust-p`.
- Exit aperture: **(760, 960)** (arch in `city-far-p`, foreshadow inside).
- Gates: **top/bottom**: `gate-t-p` (stalactites and hanging roots, rest bottom edge y 150-250) and `gate-b-p` (dark ledge, rest top edge y 1660-1740), standard shift.

## Creature
heron stands in the light pool, right of the sun, silhouetted against the outer rays: desktop display 528x733 (frame scaled 0.733), feet at (1560, 930); portrait 450x625, feet at (720, 1010). Rim faces the sun (sprite's left side; mirror if needed).

## Scale cues
Cliff windows 4-8 px on a 1080 px cliff; far towers 30-90 px; coffer holes 10x16 px on ribs spanning 1500 px; heron 730 px beside 30 px trees.

## Budget
<= 450 KB both compositions. Sun layers shared by both compositions.
