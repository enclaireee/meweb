# b8-seam

Palette `paper`. Section text: Leadership. Text: desktop left, portrait bottom.
Key light: radial from the convergence point **(1260, 520)** desktop / (540, 680) portrait. Rims use `rim-paper`.
Hero effect (only one): pull-back through nested folds. The camera starts inside the innermost fold and retreats: each `fold-k` starts at scale `1 + 0.35 k` around the convergence point and settles to 1 (outer folds move most), revealing that the whole world was one folded sheet.
Grand: seven nested paper apertures, each ring carrying a tiny tone-on-tone echo of an earlier beat, converging on a miniature of the mountain with its lit window.

## Geometry
Folds are full sheets with a torn rounded-rect hole, all centred on the convergence point. `fold-7` is the outermost (nearest, darkest); `fold-1` the innermost (farthest, lightest). Hole half-sizes (desktop, hw x hh): fold-7 380x470, fold-6 330x410, fold-5 285x355, fold-4 240x300, fold-3 195x245, fold-2 150x190, fold-1 105x135. Each ring shows about 45-55 px. Torn edge: `cut(hole, rng(8100 + k), 3, 40)` plus 2-3 small bites. Outer extent: fold-7 covers the full canvas (+8% bleed); fold-1..6 extend to the next outer hole + 60 px (hidden under it).

Echo per ring (tiny silhouettes 6-30 px along the ring, cut as holes or raised tone-on-tone strips; never an illustration of the section text):
| fold | colour | echo of |
|---|---|---|
| fold-7 | fold-deep | b0: pine rows, a far mountain, moon disc (embossed, calm tones) |
| fold-6 | fold-near | b1: strata bands, tiny windows |
| fold-5 | fold-mid-2 | b2: flap folds, seam slits |
| fold-4 | fold-mid | b3: receding arch row |
| fold-3 | fold-far-2 | b4: sun-ray cuts |
| fold-2 | fold-far | b5: trunk and canopy cuts |
| fold-1 | paper-shade | b6: lantern dots (holes showing paper) |

## Desktop 1920x1080
- Calm zone: x 0-864, y 160-940: only `fold-7` (fold-deep with fold-ink tone-on-tone b0 echo: a 300 px embossed mountain silhouette, 3 pine rows, crease lines) and `gate-l`. fold-7's hole starts at x 880.
- Mini mountain inside fold-1's hole: 170x190, apex (1260, 420), base y 610; arched mini window 44x60 centred (1270, 500), window-light behind.
- Exit aperture: **(1270, 500)** (mini window).
- Gates: `gate-l` rest inner x 180-300 (calm side), `gate-r` rest inner x 1680-1780, standard: loose paper sheets (folded corners, torn edges).

| d | id | z | content | fills | fx | motion |
|---|---|---|---|---|---|---|
| 0 | `paper` | 0 | the one sheet: opaque paper, 3 light tiers around (1260, 520), 60 fibre flecks 1-2 px | paper-shade, paper, rim-paper | S3/30 | |
| 1 | `mini-mountain` | 0.03 | mini mountain `stack` 3, 6 strata, 12 windows 2-3 px, arched window hole with window-light behind | fold-mid, fold-near, fold-mid-2; window-light | S3/6, R radial, H | |
| 2 | `mini-glow` | 0.03 | `glow` (1270, 500) r 160 | lamp 0.5, core lamp-core | G | breathe(0.8-1) |
| 3 | `fold-1` | 0.06 | innermost ring + b6 echo | paper-shade | S2/4, R radial, H | hero: scale 1.35 -> 1 |
| 4 | `fold-2` | 0.12 | ring + b5 echo | fold-far | S2/4, R radial, H | hero: scale 1.7 -> 1 |
| 5 | `fold-3` | 0.18 | ring + b4 echo | fold-far-2 | S2/5, R radial, H | hero: scale 2.05 -> 1 |
| 6 | `fold-4` | 0.24 | ring + b3 echo | fold-mid | S3/6, R radial, I, H | hero: scale 2.4 -> 1 |
| 7 | `fold-5` | 0.3 | ring + b2 echo | fold-mid-2 | S3/6, R radial, I, H | hero: scale 2.75 -> 1 |
| 8 | `fold-6` | 0.36 | ring + b1 echo | fold-near | S3/8, R radial, I, H | hero: scale 3.1 -> 1 |
| 9 | `fold-7` | 0.42 | outermost fold, covers the calm zone, b0 echo | fold-deep, fold-ink, mix(fold-deep, fold-ink, .5) | S3/10, R radial (0.25 in calm), I, H | hero: scale 3.45 -> 1 |
| 10 | `creases` | 0.45 | 12 crease slits 2-3 px radiating from the convergence across fold-1..6 (right of x 880 only), each with a 1 px rim-paper lip | shadow 0.7; lip rim-paper | | |
| 11 | `shafts` | 0.5 | 5 `shaft`s from (1260, 520) outward up/right/down, ending before x 900 | rim-paper 0.15-0.25 | | breathe(0.7-1) |
| 12 | `mist` | 0.5 | soft `mist` ring around the hole of fold-4 | paper 0.2 | | drift(15) |
| 13 | `paper-dust` | 0.6 | `scatter` 140 paper flecks (triangles 2-4 px) x 900-1900 | paper, rim-paper 0.3-0.8 | | highOnly |
| 14 | `gate-l` | 1 | loose dark sheet with a dog-eared fold and torn notches (calm) | gate, fold-ink, fold-deep | S3/18, R(0.25), I | |
| 15 | `gate-r` | 1 | loose sheet with the corner folded back showing a fold-near reverse | gate, fold-ink, fold-near | S3/18, R radial, I | sway(0.3, 100% 50%) |

## Portrait 1080x1920
- Calm zone: y 1056-1920: fold-7 only (b0 echo, tone-on-tone); fold-7's hole ends at y 1040.
- Convergence (540, 680). Hole half-sizes: fold-7 420x360, fold-6 370x315, fold-5 320x272, fold-4 270x230, fold-3 220x188, fold-2 170x146, fold-1 120x104. Mini mountain 150x170, apex (540, 600); mini window 44x60 centred (548, 660).
- Redraw `-p`: `paper-p`, `mini-mountain-p`, `fold-1-p` ... `fold-7-p`, `creases-p` (above y 1040), `shafts-p`, `mist-p`, `paper-dust-p`.
- Shared with `place`: `mini-glow` (to (548, 660)).
- Exit aperture: **(548, 660)**.
- Gates: `gate-l-p` / `gate-r-p`, standard.

## Scale cues
2-3 px windows on the 190 px mini mountain; echo silhouettes 6-30 px on 50 px rings inside a 1080 px sheet.

## Budget
<= 450 KB both compositions. Fold rings are mostly flat fills (compress well); fold-7 at near settings (0.75, q 60).
