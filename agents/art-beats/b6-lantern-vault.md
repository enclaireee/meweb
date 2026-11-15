# b6-lantern-vault

Palette `lantern`. Section text: Skills. Text: desktop left, portrait bottom.
Key light: radial from the lantern cloud centre **(1300, 560)** desktop / (540, 700) portrait. Rims use `rim-lantern`.
Hero effect (only one): the lanterns ignite in a depth wave, far to near. `lanterns-far`, `lanterns-mid`, `lanterns-near` each go opacity 0 -> 1 in that order (stagger about 0.08 local t each); their glows ride with them. Structure is visible before ignition as dark cool silhouettes.
Grand: a cathedral-sized void with a hanging city upside down from the ceiling, chained bridges across the dark, hundreds of paper lanterns at every depth.

## Desktop 1920x1080
- Calm zone: x 0-864, y 160-940: far vault arches, chains and the dark hanging-city underside in C tokens only. **No lanterns, glows or embers inside the calm zone** (the lantern cloud lives at x 900-1920; strings may cross the zone as chain-colour lines).
- Exit aperture: **(1460, 520)**: a far arch 90x140 in `vault-far` whose opening is `foreshadow` (dawn) with 2 tiny peak silhouettes (`haze` not available here: use mix(foreshadow, vault-far, .3)).
- Gates: `gate-l` rest inner x 180-300 (calm side), `gate-r` rest inner x 1660-1780, standard.

| d | id | z | content | fills | fx | motion |
|---|---|---|---|---|---|---|
| 0 | `void` | 0 | opaque void + 3 faint warm tiers around (1300, 560) (ellipses, opacity 0.12/0.08/0.05 lamp over void); left of x 864 plain void | void, mix(void, lamp, .06/.1/.14) | S3/120 | |
| 1 | `vault-far` | 0.05 | far wall: 4 tiers of 20 receding arches (holes 20-50 px, void behind), ribs converging upward; contains the exit arch | vault-far, vault-far-2 | S2/5, R radial, H | |
| 2 | `lanterns-far` | 0.08 | `scatter` 220 lantern dots r 2-4 x 900-1920 y 120-900 (3-tier dots: lantern-deep ring, lantern-hot core); one shared haze `glow` r 600 at (1300, 560) opacity 0.25 | lantern-deep, lantern-hot; lamp | G | hero wave 1 |
| 3 | `chains-far` | 0.12 | 40 hanging chains 1.5-2 px from the top edge, some ending in tiny cages (6-10 px) | chain | | |
| 4 | `hanging-city` | 0.25 | upside-down city hanging from the ceiling x 300-1500, y 0-420: 16 inverted `tower`s 40-140 px with window holes (60 tiny windows 4-8 px, warm only right of x 900: lantern-hot behind), inverted `stairs`, 3 inverted `bridge`s; `stack` 3 on the mass | vault-mid, vault-far-2, vault-mid-2; lantern-hot | S3/10, R radial, I, H | |
| 5 | `stalactites` | 0.3 | ceiling fringe between the towers, 40-260 px, 6 tiny `crystal` accents (r 6-10) right of x 900 | vault-mid-2, vault-mid | S3/8, R radial, I | |
| 6 | `lanterns-mid` | 0.35 | 60 `lantern`s r 10-24 at x 900-1900 on strings from the ceiling (string = chain 1.5 px), each lantern `stack` 3 (lantern-deep, lantern-body, lantern-hot) with a cut pattern (4-6 slits); small `glow` r 3x each (opacity 0.35) | lantern-deep, lantern-body, lantern-hot; lamp | S3/3, G | hero wave 2; sway(1.2, 50% 0%) |
| 7 | `bridge` | 0.4 | long chained `bridge` crossing x -100..2020 at deck y 640 (sagging catenary), plank slits 4-6 px, rope rails, 2 lantern posts right of x 900, 2 gatehouse `tower`s 90-120 px (left in calm tones) | vault-mid, vault-mid-2, chain | S3/10, R radial, I, H | |
| 8 | `pillars-mid` | 0.45 | 3 colossal pillars: x 120 (calm, w 120, full height), x 980 (w 90), x 1780 (w 110), each with `ruinWall` courses, carved niches, hanging `vine`s; lit edge faces (1300, 560) | vault-mid-2, vault-mid, vault-near | S3/12, R radial (0.25 in calm), I | |
| 9 | `mist` | 0.5 | warm `mist` band y 700-820 x 900-1920 (dust-warm 0.2); cool band x 0-864 (chain 0.06) | dust-warm, chain | | drift(30) |
| 10 | `lanterns-near` | 0.65 | 10 big `lantern`s r 40-70 at x 1000-1880 (none in the calm zone), `stack` 4 with lattice holes; own `glow` r 4x (opacity 0.5, core lamp-core) | lantern-deep, lantern-body, lantern-hot, lamp-core; lamp | S4/8, G | hero wave 3; sway(1.5, 50% 0%) |
| 11 | `strings-near` | 0.7 | near strings and chains from the top edge (x 0-1920; calm side chain colour only), 3 hanging cages 30-50 px | chain, vault-near | R radial | sway(0.8, 50% 0%) |
| 12 | `ledge-near` | 0.75 | near ledge y 960-1080 with broken balustrade, `ruinWall` stones, 2 floor lanterns right of x 1100 | vault-near, gate; lantern-body | S3/14, R radial, I | |
| 13 | `embers` | 0.6 | `scatter` 140 embers 1.5-3 px x 900-1900 | dust-warm 0.4-0.8 | | highOnly; rise |
| 14 | `gate-l` | 1 | near pillar fragment + hanging chains (calm) | gate, vault-near, chain | S3/18, R(0.25), I | |
| 15 | `gate-r` | 1 | near pillar + chains with 2 dark (unlit) lanterns | gate, vault-near, chain | S3/18, R radial, I | sway(0.5, 50% 0%) on chains |

`rise` = idle y translate -40 px over 12 s, looping (composer may treat it like drift on y).

## Portrait 1080x1920
- Calm zone: y 1056-1920: lower vault, `ledge-near-p`, pillar bases; no lanterns or glow below y 1000.
- Lantern cloud centre (540, 700); hanging city y 0-480.
- Redraw `-p`: `void-p`, `vault-far-p`, `lanterns-far-p` (180 dots, y 120-1000), `chains-far-p`, `hanging-city-p`, `stalactites-p`, `lanterns-mid-p` (44, y 200-980), `bridge-p` (deck y 860), `pillars-mid-p` (x 70, x 1010), `mist-p` (warm band y 820-960), `lanterns-near-p` (6, y 300-960), `strings-near-p`, `ledge-near-p`, `embers-p`.
- Exit aperture: **(620, 600)** (exit arch in `vault-far-p`, 80x120).
- Gates: **top/bottom**: `gate-t-p` (ceiling lip with stalactites and chains, rest bottom edge y 160-260), `gate-b-p` (ledge with balustrade, rest top edge y 1640-1740), standard shift.

## Creature
jellyfish drifts in the lantern cloud between the bridge and the city: desktop display 340x630 (frame scale 0.81), bell top at (1180, 190); portrait 300x556, bell top (330, 260). Never over the exit arch.

## Scale cues
Inverted towers 40-140 px with 4-8 px windows hanging above a 2000 px bridge; plank slits 4-6 px; cages 6-10 px; lantern dots 2-4 px against 1000 px pillars.

## Budget
<= 450 KB both compositions. Void at scale 0.5; lantern layers mid band (1.0, q 65) because they are the hero.
