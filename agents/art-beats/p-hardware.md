# p-hardware

Palette `district` column **p-hardware (ember)**. Projects lane district for the hardware projects (cards are HTML, not art). Card area: desktop right, portrait bottom. Last district: its exit leads out of the lane.
Key light: the three crystal clusters, radial from their centroid **(620, 600)**; rims use `rim`.
Hero effect (only one): crystal pulse sequence. `pulse-1`, `pulse-2`, `pulse-3` (one glow layer per cluster) brighten in turn (opacity 0.3 -> 1 -> 0.3, staggered 1/3 period, period 4.5 s), like a slow signal running through the vault.
Grand: ember-lit vaults hung with stalactites, crystal clusters growing from the rock, chained bridges strung across the dark, cages and counterweights. World-only: no circuits, chips, gears or machines.

## District rules (same as p-web)
- Card area: desktop **40% width**, portrait **bottom 55%**; only C tokens (`mid-2`, `near`, `near-dark`, `gate`), tone-on-tone, no glow/shaft/lantern/dust; must still pass D3.
- Many small glows allowed. Exit aperture is an arch with `foreshadow` (night `#34486c`) inside.

## Desktop 1920x1080
- Card area: x 1152-1920, y 0-1080 (`card-wall`).
- Crystal clusters: c1 (300, 760) h 260, c2 (640, 420) h 180 (on a hanging rock), c3 (900, 820) h 220.
- Exit aperture: **(760, 640)**: arch 70x110 in `vault-far`, opening `foreshadow` (night blue) with 6 star dots.
- Gates: `gate-l` rest inner x 180-300, `gate-r` rest inner x 1680-1780 (card side, calm), standard.

| d | id | z | content | fills | fx | motion |
|---|---|---|---|---|---|---|
| 0 | `bg` | 0 | opaque far-2; 3 warm tiers around (620, 600); right of x 1152 near-dark | far-2, far, glow; near-dark | S3/80 | |
| 1 | `vault-far` | 0.05 | far vaults: 3 tiers of arches (holes 14-36 px), 40 niches 4-8 px with ember dots, the exit arch | far, far-2; glow; foreshadow | S2/5, R radial, H | |
| 2 | `bridges-far` | 0.1 | 3 chained `bridge`s high across x 0-1100 (y 220-420, arches 8-14 px), 6 tiny cages 6-10 px, 2 `tower`s 40-60 px | far-2, mid | R radial, H | |
| 3 | `mist-far` | 0.15 | ember haze bands y 560 and y 760, x 0-1100 | glow 0.22 | | drift(30) |
| 4 | `stalactites` | 0.25 | ceiling fringe y 0-320 (40-300 px), a hanging rock island holding c2 | mid, far-2, mid-2 | S3/10, R radial, I | |
| 5 | `pillars-mid` | 0.3 | 3 rock pillars (x 120, 470, 1060; w 80-130) with `strata`, carved steps, chains wrapped around | mid, far-2, far | S3/12, R radial, I | |
| 6 | `bridge-mid` | 0.35 | big chained `bridge` sagging across x -100..1150 at deck y 600 (plank slits 4-6 px), counterweights and a cage 40 px hanging below | mid, mid-2, far-2 | S3/10, R radial, I, H | sway(0.3, 50% 0%) |
| 7 | `crystals` | 0.4 | **hero form.** 3 `crystal` clusters, each 5-9 prisms `stack` 3 (crystal-deep, crystal, rim) with facet slits; small crystal shards (20) scattered on ledges and the ceiling, left of x 1100 | accent-2, accent, rim | S3/8, R radial, I, H | |
| 8 | `pulse-1` | 0.4 | `glow` on c1 r 300 + small shard glows nearby | lamp 0.5, core accent | G | hero: pulse step 1 |
| 9 | `pulse-2` | 0.4 | `glow` on c2 r 240 | lamp 0.5, core accent | G | hero: pulse step 2 |
| 10 | `pulse-3` | 0.4 | `glow` on c3 r 280 | lamp 0.5, core accent | G | hero: pulse step 3 |
| 11 | `card-wall` | 0.5 | calm right wall x 1100-1920: jagged left edge, 6 tone-on-tone vault tiers, 40 dark niches, a chained cage, 2 `stairs` runs, hanging chains | near-dark, near, mid-2 | S3/14, R(0.25), I, H | |
| 12 | `ledge-near` | 0.7 | near ledge y 960-1080 x 0-1152: rock, crystal stubs (unlit tier colours), chains, broken stones | near, near-dark, mid-2 | S3/14, R radial, I | |
| 13 | `embers` | 0.6 | `scatter` 140 embers 1.5-3 px x 0-1100 | accent 0.3-0.8 | | highOnly; rise |
| 14 | `gate-l` | 1 | dark rock with stalactite tips and a hanging chain | gate, near-dark, near | S3/18, R radial, I | sway(0.4, 50% 0%) on the chain |
| 15 | `gate-r` | 1 | dark pillar with chains (calm) | gate, near-dark, near | S3/18, R(0.25), I | |

`rise` as in b6 (y -40 px over 12 s, looping).

## Portrait 1080x1920
- Card area: y 864-1920 (`card-wall-p` lower band; crystal stubs there in calm tones only).
- Clusters: c1 (240, 700) h 200, c2 (560, 340) h 160, c3 (840, 640) h 200; light centroid (540, 560).
- Redraw `-p`: `bg-p`, `vault-far-p`, `bridges-far-p`, `stalactites-p` (y 0-260), `pillars-mid-p` (x 60, 1020), `bridge-mid-p` (deck y 520), `crystals-p`, `pulse-1-p`, `pulse-2-p`, `pulse-3-p`, `card-wall-p`, `ledge-near-p` (y 780-880, then calm), `embers-p` (above 840).
- Shared with `place`: `mist-far` (s 0.6, y -120).
- Exit aperture: **(560, 600)** (arch 60x90, night foreshadow).
- Gates: `gate-l-p` / `gate-r-p`, standard.

## Scale cues
Cages 6-10 px and plank slits 4-6 px on bridges spanning 1200 px; niches 4-8 px; towers 40-60 px; crystals 180-260 px.

## Budget
<= 450 KB both compositions. Pulse glows at atmosphere settings (0.5, q 45).
