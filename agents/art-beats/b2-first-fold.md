# b2-first-fold

Palette `fold`. Section text: Education. Text: desktop left, portrait bottom.
Key light: moon upper right `L = [0.55, -0.83]` for outside sheets; **seam light** radial from (1060, 560) for interior sheets.
Hero effect (only one): the mountain face unfolds like origami doors (`flap-l`, `flap-r` rotateY outward, `flap-top` lifts away) and warm seam light floods out.

## Geometry
Uses the **shared outline from `b1-approach.md`** (same points, same seed `rng(1101)` / portrait `rng(1102)`, same seam and fold line). At rest the closed flaps are pixel-identical to b1 `face-l`, `face-r`, `face-top` (same detail, same seeds), so b1 -> b2 has no visible jump. The warm crack along the seam is drawn in `seam-light`, not on the flaps.
Hinges (transform origin): `flap-l` `0% 50%` of its sprite (outer left edge), `flap-r` `100% 50%`, `flap-top` `50% 0%`. The engine has rotate, rotateY, scale, x, y, opacity only: `flap-top` lifts (y -260, rotate -8 deg) and fades.

## Desktop 1920x1080
- Calm zone: x 0-820, y 160-960 (narrowed: the interior core is right of the seam). Anything visible through the opening at x < 820 uses `interior-near` or calm night tokens.
- Interior light core (brightest) centred (1060, 560), spans about x 880-1300.
- Exit aperture: **(1060, 560)** (the warm core).
- Gates: `gate-l` rest inner x 180-280, `gate-r` rest inner x 1660-1760, standard.

| d | id | z | content | fills | fx | motion |
|---|---|---|---|---|---|---|
| 0 | `sky` | 0 | as b1 (3 bands, corner stars) | sky-top, sky, sky-haze; star | | |
| 1 | `range-far` | 0.1 | as b1 `range-far` (same seed) | far-ridge-1, far-ridge-2 | S2/5, R | |
| 2 | `interior-far` | 0.15 | clipped to the outline: a light tunnel, `stack` 5 concentric tiers around (1060, 560), dark at the outline, bright at the core; tiny arch rows (12-20 px holes) on tier 3 | interior-near, interior, interior-mid, interior-far, seam-core | S5/40, H | |
| 3 | `interior-arches` | 0.2 | 3 receding arcades (arches 60-180 px, each frame `stack` 3), a thin `bridge` at y 700 (x 760-1360, 9 arches), tiny `stairs`, 2 tiny `tower`s 30-50 px | interior, interior-mid, interior-far | S3/8, R (radial) | |
| 4 | `interior-near` | 0.25 | ragged cave lip just inside the outline with hanging `roots` and `vine`s against the light | interior-near, mix(interior-near, interior, .25) | S3/10, R (radial), I | sway(0.5, 50% 0%) |
| 5 | `seam-light` | 0.3 | seam crack along x 960 (w 3 px closed look, plus a 40 px wide seam sheet behind the flaps y 150-1000) + 4 `shaft`s fanning toward the viewer (+/-25 deg) from (1060, 560), right-biased | seam 0.9; shafts seam 0.25 | | |
| 6 | `seam-glow` | 0.3 | `glow` (1060, 560) r 420 | lamp, core seam-core, 0.6 | G | breathe(0.85-1) |
| 7 | `flap-l-back` | 0.35 | reverse of the left flap revealed at the hinge when open: slim trapezoid along the left outline (x 300-520), 4 fold ribs as stacked strips | flap-back, mix(flap-back, flap-lit, .3) | S2/6, R (radial) | composer fades in with the open |
| 8 | `flap-r-back` | 0.35 | mirror along the right outline (x 1400-1620) | flap-back, mix(flap-back, flap-lit, .4) | S2/6, R | same |
| 9 | `flap-l` | 0.4 | = b1 `face-l` | as b1 `face-l` | S4/14, R, I | hero: rotateY 0 -> -72 deg |
| 10 | `flap-r` | 0.4 | = b1 `face-r` (window hole, window-light behind it baked into this layer) | as b1 `face-r` | S4/14, R, I, H | hero: rotateY 0 -> +72 deg |
| 11 | `flap-top` | 0.4 | = b1 `face-top` | as b1 | S3/12, R, I | hero: lift and fade |
| 12 | `ground` | 0.6 | foot of the mountain y 940-1080: 40 `pine`s, ruined stair foot, small `ruinWall` with 2 holes | near-hill, near-dark, pine-mid | S3/12, R, I | |
| 13 | `mist` | 0.55 | base mist (0.25 right of x 820, 0.08 left), `scatter` 100 warm motes near the seam (x 900-1400) | mist; motes seam 0.4-0.8 | | drift(40); motes highOnly |
| 14 | `gate-l` | 1 | as b1 `gate-l` (rock + boughs), re-seeded | gate, near-dark, mix(near-dark, rim-cool, .12) | S3/16, R(0.25), I | |
| 15 | `gate-r` | 1 | rock + pines; inner rim mixes toward flap-lit (warm spill) | gate, near-dark, mix(near-dark, flap-lit, .25) | S3/16, R, I | |

## Portrait 1080x1920
- Calm zone: y 1056-1920. Interior below y 1056 uses only `interior-near`. Tunnel core **(560, 910)**.
- Mountain pieces on the portrait outline (seed `rng(1102)`), redrawn `-p`: `interior-far-p`, `interior-arches-p` (3 tiers stacked vertically y 500-1000), `interior-near-p`, `seam-light-p`, `flap-l-back-p`, `flap-r-back-p`, `flap-l-p`, `flap-r-p`, `flap-top-p` (= b1 portrait pieces), `ground-p` (y 1560-1920), `mist-p`.
- Shared with `place`: `sky` (s 1.8), `range-far` (as b1 portrait), `seam-glow` (to (560, 910)).
- Exit aperture: **(560, 910)**.
- Gates: `gate-l-p` / `gate-r-p`, standard.

## Scale cues
Interior arches 12-20 px seen through the seam; bridge arches 10 px; towers 30-50 px; 900 px flaps around them.

## Budget
<= 420 KB both compositions. Interior layers scale 0.75 (behind glow), flaps scale 1.
