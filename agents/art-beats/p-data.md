# p-data

Palette `district` column **p-data (teal)**. Projects lane district for the data/ML projects (cards are HTML, not art). Card area: desktop left, portrait bottom.
Key light: the oculus, radial from **(1340, 40)**, plus its reflection on the water; rims use `rim`.
Hero effect (only one): water reflection shimmer. Two reflection layers of the colonnade (`reflection-a`, `reflection-b`, cut into horizontal slices with different slice offsets) cross-fade in a loop (opacity 1 <-> 0.2, opposite phase, period 5 s) and drift x +/-6 px in opposite directions, so the reflection ripples.
Grand: a vast flooded cistern: forest of columns marching into the dark, vaulted ceiling with one oculus, still water mirroring everything, stepping stones and a floating stair. World-only: no charts, data or symbols.

## District rules (same as p-web)
- Card area: desktop **40% width**, portrait **bottom 55%**; only C tokens (`mid-2`, `near`, `near-dark`, `gate`), tone-on-tone, no glow/shaft/lantern/dust; must still pass D3.
- Many small glows allowed. Exit aperture is an arch with `foreshadow` (ember) inside.

## Desktop 1920x1080
- Card area: x 0-768, y 0-1080 (`card-wall`: nearest columns in shadow).
- Water plane y 700-1080 across x 768-1920 (and in calm tones under the card area).
- Exit aperture: **(1500, 600)**: far arch 70x110 at the end of the colonnade, opening `foreshadow` (ember).
- Gates: `gate-l` rest inner x 180-300 (card side, calm), `gate-r` rest inner x 1680-1780, standard.

| d | id | z | content | fills | fx | motion |
|---|---|---|---|---|---|---|
| 0 | `bg` | 0 | opaque far; 3 light tiers around the oculus beam's landing (1340, 760); left of x 768 near-dark | far-2, far, glow; near-dark | S3/60 | |
| 1 | `vault-far` | 0.05 | far end wall: 3 tiers of receding arches (holes 12-30 px), the exit arch, 30 tiny niches 4-8 px | far, far-2; foreshadow | S2/5, R radial, H | |
| 2 | `columns-far` | 0.1 | 4 receding rows of 50 thin `column`s 8-30 px wide toward the far wall, bases in water | far-2, mid | R radial | |
| 3 | `mist-far` | 0.15 | `mist` bands on the water y 690 and y 620, x 768-1920 | accent-2 0.25 | | drift(30) |
| 4 | `oculus` | 0.2 | ceiling oculus ring (1340, 40) r 90 `stack` 3 with 16 radial slits; `glow` r 300 | mid, far, glow; accent-2, lamp-core | S3/8, G | breathe(0.85-1) |
| 5 | `columns-mid` | 0.3 | 6 colossal `column`s x 820-1900 (w 70-120, full height) with capitals, `ruinWall` courses, water stains, hanging `vine`s; lit side faces the oculus | mid, far-2, far | S3/12, R radial, I | |
| 6 | `vault-ribs` | 0.35 | ceiling band y 0-200: groined vaults between the columns, 6 hanging `roots`, small `stalactites` 20-60 px | mid, mid-2, far-2 | S3/10, R radial, I | |
| 7 | `water` | 0.4 | **hero base.** water plane `stack` 4 (darkest near, lighter toward the far wall), 30 ripple slits 2 px, stepping stones (12, 20-60 px) leading to the exit arch | near, mid-2, accent, mix(accent, accent-2, .3) | S4/10, R radial | |
| 8 | `reflection-a` | 0.4 | mirrored silhouettes of the columns, oculus beam and far arches below y 700, sliced into 4-8 px horizontal strips (slice set A) | accent-2 0.5, mid 0.6 | | hero: shimmer phase 0, x +6 |
| 9 | `reflection-b` | 0.4 | same mirror, slice set B (offset half a strip) | accent-2 0.5, mid 0.6 | | hero: shimmer phase 0.5, x -6 |
| 10 | `shafts` | 0.45 | 3 `shaft`s from the oculus down to the water (angle -8..8 deg), ending before x 800 | accent-2 0.18-0.28 | | breathe(0.7-1) |
| 11 | `card-wall` | 0.5 | calm left: 3 near columns in shadow x 0-800 with niches, tone-on-tone `strata`, 30 tiny dark arches, a floating stair (`stairs`, treads 6 px) climbing out of the water; water under it in near/near-dark | near-dark, near, mid-2 | S3/14, R(0.25), I, H | |
| 12 | `steps-near` | 0.7 | near steps descending into the water y 960-1080 x 700-1920, broken balustrade, ferns; calm left part | near, near-dark, mid-2 | S3/14, R radial, I | |
| 13 | `dust` | 0.6 | `scatter` 120 motes in the oculus beam x 1200-1500 | accent-2 0.3-0.8 | | highOnly |
| 14 | `gate-l` | 1 | dark column fragment + hanging roots (calm) | gate, near-dark, near | S3/18, R(0.25), I | |
| 15 | `gate-r` | 1 | near column + chain with a dark cage | gate, near-dark, near | S3/18, R radial, I | sway(0.4, 50% 0%) on the chain |

## Portrait 1080x1920
- Card area: y 864-1920 (calm water and near columns; reflections stop at y 860).
- Oculus (700, 40); water plane y 600-864 then calm; colonnade recedes to the far wall around (560, 480).
- Redraw `-p`: `bg-p`, `vault-far-p`, `columns-far-p`, `oculus-p`, `columns-mid-p` (x 60, 300, 780, 1020), `vault-ribs-p`, `water-p`, `reflection-a-p`, `reflection-b-p` (y 600-860), `shafts-p`, `card-wall-p` (lower band), `steps-near-p`, `dust-p`.
- Shared with `place`: `mist-far` (s 0.6, y -100).
- Exit aperture: **(560, 480)** (far arch 60x90, ember foreshadow).
- Gates: `gate-l-p` / `gate-r-p`, standard.

## Scale cues
50 far columns 8-30 px beside 1080 px columns; niches 4-8 px; stepping stones 20-60 px; stair treads 6 px.

## Budget
<= 450 KB both compositions. Reflection layers at atmosphere settings (0.5, q 45).
