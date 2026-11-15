# b7-second-fold

Palette `dawnfold`. Section text: Awards. Text: desktop right, portrait bottom.
Key light: dawn from the seam / horizon, radial from **(760, 520)** desktop / (540, 560) portrait. Rims use `rim-dawn`; the cavern wall (calm) gets rim mix 0.25.
Hero effect (only one): the inner mountain unfolds to dawn. `inner-flap-l` rotateY 0 -> -75 deg (hinge `0% 50%`), `inner-flap-r` rotateY 0 -> +75 deg (hinge `100% 50%`), revealing the dawn sky, a cloud sea and the whale. This is the colour flip: cool-warm interior gives way to pink dawn.
Grand: from a dark cavern we see a second, inner mountain fold open like doors onto an endless dawn: ranges of peaks above a cloud sea, a monastery-like ruin on a far peak, the paper whale gliding.

## Geometry
Opening (the inner mountain face seen from inside the cave): x 300-1220, y 120-900, seam x 760. Closed, the two flaps tile it exactly and a 3 px dawn-light crack shows along the seam. Right of x 1040 the `cavern-wall` (nearer) overlaps the opening, so the right flap's far edge is hidden at rest and while it swings.

## Desktop 1920x1080
- Calm zone: x 1056-1920, y 160-940: the `cavern-wall` (near, near-dark, flap-back; C only), carved tone-on-tone.
- Exit aperture: **(760, 520)** (seam; after the unfold, the dawn horizon glow core).
- Gates: `gate-l` rest inner x 180-300, `gate-r` rest inner x 1680-1780 (calm side), standard.

| d | id | z | content | fills | fx | motion |
|---|---|---|---|---|---|---|
| 0 | `dawn-sky` | 0 | 4 bands top to horizon y 560: haze, dawn-sky, dawn-sky-hi, `stack` 3 light tiers around (760, 560) | haze, dawn-sky, dawn-sky-hi, dawn-core | S3/80 | |
| 1 | `clouds-far` | 0.05 | 3 `cloud` banks y 180-420, x 0-1100, lit undersides; `flock` of 30 specks | cloud, dawn-sky-hi, haze | S2/6, R radial | drift(30) |
| 2 | `peaks-far` | 0.1 | 2 ranges of far peaks y 380-620 across x 0-1100 (far-peak back, far-peak-2 front), 20 tiny `pine`s, a cliff monastery ruin on the tallest peak (4 `tower`s 20-50 px, `stairs`, window holes 3-5 px) | far-peak, far-peak-2 | S2/5, R radial, H | |
| 3 | `cloud-sea` | 0.15 | cloud sea y 600-760 in 4 rolling tiers, cut-out curls on each crest | cloud, dawn-sky-hi, dawn-sky, haze | S4/10, R radial | drift(20) |
| 4 | `peaks-mid` | 0.25 | 3 mid peaks rising from the cloud sea x 60-1100 (`strata` bands, ruined temple terraces, 2 `bridge`s between peaks with 10-20 px arches, 30 `pine`s) | inner-mountain, inner-lit, far-peak-2 | S3/10, R radial, I, H | |
| 5 | `mist` | 0.3 | dawn `mist` bands y 560 and y 760 over x 0-1040 | dawn-light 0.25 | | drift(40) |
| 6 | `seam-light` | 0.32 | seam crack sheet x 740-780 y 120-900 + 5 `shaft`s fanning from (760, 520) toward the viewer, angles -30..+20 deg, ending before x 1040 | dawn-light 0.9; shafts dawn-light 0.2-0.3 | | breathe(0.8-1) |
| 7 | `seam-glow` | 0.32 | `glow` (760, 520) r 460 | dawn-light 0.55, core dawn-core | G | breathe(0.85-1) |
| 8 | `inner-flap-l` | 0.4 | **hero.** left flap x 300-760: inside face of the mountain, `stack` 4 inset 14, `strata` folds, 14 carved niches, a zig-zag `stairs` run, 8 hanging `vine`s, 20 tiny dark windows 4-6 px; rim-dawn on the seam edge | near, flap-back, mix(flap-back, inner-mountain, .35), mix(flap-back, inner-mountain, .6) | S4/14, R radial, I, H | hero: rotateY 0 -> -75 deg |
| 9 | `inner-flap-r` | 0.4 | **hero.** right flap x 760-1220, mirror detail (different seed); dawn rim on the seam edge only | near, flap-back, mix(flap-back, inner-mountain, .35), mix(flap-back, inner-mountain, .6) | S4/14, R radial, I, H | hero: rotateY 0 -> +75 deg |
| 10 | `inner-base` | 0.55 | rock lip below the opening y 880-1080, x 0-1100: broken stair descending toward the opening, ferns (`fern`), boulders | near, near-dark, flap-back | S3/12, R radial, I | |
| 11 | `ruin-arch` | 0.6 | callback arch (echo of the b4 hall) standing on the lip at x 60-300, h 520: arch frame `stack` 3, `ruinWall` courses, roots | warm-arch, warm-arch-near, near | S3/12, R radial, I | |
| 12 | `cavern-wall` | 0.65 | near cavern wall x 1040-1920, full height, jagged inner edge facing the opening; calm tone-on-tone: 8 `strata` bands, 3 carved galleries with 30 tiny dark windows, 2 `stairs` runs, hanging `roots` | near-dark, near, flap-back | S3/14, R(0.25), I | |
| 13 | `dust` | 0.6 | `scatter` 140 dawn motes x 300-1040 | dawn-light 0.3-0.8 | | highOnly |
| 14 | `gate-l` | 1 | dark cavern lip with hanging roots | gate, near-dark, near | S3/18, R radial, I | sway(0.4, 50% 0%) on roots |
| 15 | `gate-r` | 1 | cavern column fragment (calm) | gate, near-dark, near | S3/18, R(0.25), I | |

## Portrait 1080x1920
- Calm zone: y 1056-1920: `inner-base-p` and `cavern-wall-p` (now the lower band) in C tokens only.
- Opening x 120-960, y 160-1000, seam x 540. Flaps redrawn for it.
- Redraw `-p`: `dawn-sky-p` (horizon y 620), `clouds-far-p`, `peaks-far-p`, `cloud-sea-p` (y 660-820), `peaks-mid-p`, `seam-light-p`, `inner-flap-l-p`, `inner-flap-r-p`, `inner-base-p` (y 1000-1920), `ruin-arch-p` (x 40-240, base y 1200, calm tones below 1056 = warm-arch-near only), `cavern-wall-p` (left and right side strips x 0-120 / 960-1080 plus the lower band), `dust-p`.
- Shared with `place`: `mist` (s 0.6, y +80), `seam-glow` (to (540, 560)).
- Exit aperture: **(540, 560)**.
- Gates: `gate-l-p` / `gate-r-p`, standard.

## Creature
whale glides above the cloud sea, revealed by the unfold (composer fades it in after the flaps pass 40 deg). Desktop display 1000x397, centre (480, 280) (x -20..980, clear of the calm zone and the exit). Portrait 760x302, centre (540, 330). Rim faces the dawn (below/right).

## Scale cues
Monastery towers 20-50 px with 3-5 px windows on a 240 px peak; bridge arches 10-20 px between peaks; 4-6 px windows on 900 px flaps; a 1000 px whale over all of it.

## Budget
<= 450 KB both compositions. Sky and clouds at bg/far settings; flaps mid band.
