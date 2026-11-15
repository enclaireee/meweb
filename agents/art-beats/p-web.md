# p-web

Palette `district` column **p-web (amber)**. Projects lane district for the web projects (cards are HTML, not art). Card area: desktop right, portrait bottom.
Key light: the light well, radial from **(560, 0)** (oculus at the top) down the well column x 560; rims use `rim`.
Hero effect (only one): light-well bloom. As the district settles, `well-bloom` goes scale 0.6 -> 1 and opacity 0 -> 1 around (560, 520), and `light-well` opacity 0.6 -> 1, so the vellum column seems to fill with light.
Grand: a deep amber interior district of hanging galleries: tier upon tier of arcaded balconies suspended on chains around a vertical light well, vellum screens, spiral stairs, lantern-lit bridges. World-only: no screens, devices, code or logos.

## District rules (same in p-data, p-hardware)
- Card area (bible section 8): desktop **40% width**, portrait **bottom 55%**. Inside it only C tokens (`mid-2`, `near`, `near-dark`, `gate`), tone-on-tone detail, no glow, shaft, lantern or dust. The cards sit on top; art must still pass D3 there.
- Many small glows allowed (bible section 3 exception). Exit aperture is an arch whose opening shows `foreshadow` (the next district's colour).

## Desktop 1920x1080
- Card area: x 1152-1920, y 0-1080 (the `card-wall`).
- Light well: column x 470-650 from the oculus (560, 0) to a pool at (560, 940).
- Exit aperture: **(860, 720)**: arch 70x110 in `galleries-far`, opening `foreshadow` (teal) with 2 tiny column silhouettes.
- Gates: `gate-l` rest inner x 180-300, `gate-r` rest inner x 1680-1780 (card side, calm), standard.

| d | id | z | content | fills | fx | motion |
|---|---|---|---|---|---|---|
| 0 | `bg` | 0 | opaque far; 4 light tiers (ellipses) around the well top (560, 120); right of x 1152 plain near-dark | far-2, far, glow, accent; near-dark | S4/60 | |
| 1 | `galleries-far` | 0.05 | 5 tiers of far arcaded galleries around the well (x 0-1100), 80 tiny arches 10-24 px, 50 window holes 3-6 px, contains the exit arch | far, far-2; foreshadow | S2/5, R radial, H | |
| 2 | `bridges-far` | 0.1 | 4 thin `bridge`s crossing the well at y 260-620 (arches 8-16 px), 2 `tower`s 40-70 px | far-2, mid | R radial, H | |
| 3 | `lanterns-far` | 0.12 | `scatter` 140 lantern dots r 2-4 over x 0-1100 | lamp, accent-2 | | |
| 4 | `mist-far` | 0.15 | `mist` bands y 380 and y 700, x 0-1100 | accent 0.25 | | drift(30) |
| 5 | `galleries-mid` | 0.3 | 3 hanging galleries suspended on `chain`-like rods (mid 2 px) left of x 1100: each a balcony slab with 6-9 arches (`arch`, frame `stack` 3), balustrade with holes, potted `fern`s, small `lantern`s r 6-10 | mid, far-2, far; lamp | S3/10, R radial, I, H | sway(0.4, 50% 0%) |
| 6 | `light-well` | 0.32 | **hero form.** vellum column x 470-650 as `stack` 4 (narrowing tiers), 8 hanging vellum discs r 20-40 with punched rings down the column | accent, accent-2, glow, lamp-core | S4/12 | hero: opacity 0.6 -> 1 |
| 7 | `well-bloom` | 0.32 | `glow` (560, 520) r 420 + pool glow (560, 940) r 200 | lamp 0.55, core lamp-core | G | hero: scale 0.6 -> 1, opacity 0 -> 1 |
| 8 | `stairs-mid` | 0.38 | spiral `stairs` winding round the well (treads 5-8 px, x 380-740), 2 landings | mid, mid-2, far-2 | S3/8, R radial, I | |
| 9 | `screens` | 0.42 | 5 hanging vellum screens 80-160 px with lattice holes (grid of 6-10 px cells), x 120-1050 | accent 0.85, far | S2/6, R radial, H | sway(0.6, 50% 0%) |
| 10 | `shafts` | 0.45 | 4 `shaft`s from the oculus down the well, angle -12..12 deg, ending before x 1100 | accent 0.18-0.28 | | breathe(0.7-1) |
| 11 | `card-wall` | 0.5 | calm wall x 1100-1920 full height: jagged left edge facing the well, 7 tone-on-tone gallery tiers, 40 dark windows 4-8 px, 2 `stairs` runs, hanging `vine`s | near-dark, near, mid-2 | S3/14, R(0.25), I, H | |
| 12 | `floor-near` | 0.7 | near floor y 960-1080 x 0-1152: pool rim, broken balustrade, ferns, 2 floor lanterns | near, near-dark, mid-2; lamp | S3/14, R radial, I | |
| 13 | `dust` | 0.6 | `scatter` 140 warm motes in the well x 380-760 | accent-2 0.3-0.8 | | highOnly |
| 14 | `gate-l` | 1 | dark hanging gallery fragment + chains | gate, near-dark, near | S3/18, R radial, I | sway(0.4, 50% 0%) |
| 15 | `gate-r` | 1 | dark pillar + drape (calm) | gate, near-dark, near | S3/18, R(0.25), I | |

## Portrait 1080x1920
- Card area: y 864-1920 (`card-wall-p` as the lower band, tone-on-tone galleries).
- Light well x 450-630 from (540, 0) to the pool (540, 820); well bloom centre (540, 420).
- Redraw `-p`: `bg-p`, `galleries-far-p` (y 80-820), `bridges-far-p`, `lanterns-far-p` (above y 820), `galleries-mid-p` (2, at x 40-400 and 680-1040), `light-well-p`, `well-bloom-p`, `stairs-mid-p`, `screens-p`, `shafts-p` (end above 840), `card-wall-p`, `floor-near-p` (y 780-880 rim, then calm), `dust-p`.
- Shared with `place`: `mist-far` (s 0.6, y -80).
- Exit aperture: **(780, 560)** (arch 60x90, teal foreshadow).
- Gates: `gate-l-p` / `gate-r-p`, standard.

## Scale cues
Far arches 10-24 px and windows 3-6 px across a 1080 px well; stair treads 5-8 px; towers 40-70 px.

## Budget
<= 450 KB both compositions.
