# b5-understory

Palette `understory`. Section text: Projects (list of all projects). The fork door to the projects lane lives here. Text: desktop right, portrait bottom.
Key light: canopy gap top-left, `L = normalise((700, 0) - centroid)` (radial from (700, 0)).
Hero effect (only one): a second pair of leaf curtains (`curtain-mid-l`, `curtain-mid-r`) parts after the gates, revealing the stone arch, the stag and the glowing door.
Grand: a forest of colossal trunks with walkways and rope bridges high up, a ruined tower swallowed by vines, a stone arch with a tree through it. Not lollipop trees: trunks are columns with root flares, canopies are layered masses with leaf-shaped holes.

## Desktop 1920x1080
- Calm zone: x 1100-1920, y 160-940 (dense dark undergrowth and near trunks: leaf-near, trunk, trunk-dark, stone-dark).
- Stone arch: x 640-1000, base y 900, apex y 380; opening centre (820, 650), opening 180x300. Inside the opening: `void-hint` sheet with 5 `lantern-hint` dots (foreshadow of b6).
- Fork door: rect **x 446, y 590, w 96, h 160** on the arch plinth's left (composer puts the `<button>` here).
- Exit aperture: **(820, 650)** (arch opening).
- Gates: `gate-l` rest inner x 150-260, `gate-r` rest inner x 1720-1800 (calm side), standard.

| d | id | z | content | fills | fx | motion |
|---|---|---|---|---|---|---|
| 0 | `canopy-light` | 0 | bg with `stack` 3 light tiers around the gap (700, 120) | leaf-far, canopy-light, dapple | S3/90 | |
| 1 | `trunks-far` | 0.05 | 18 distant straight trunks w 14-30 (x 0-1100 lit, x > 1100 darker), 3 walkways and 2 rope `bridge`s between them at y 300-450, tiny spiral `stairs` round 2 trunks | leaf-far, leaf-far-2 (calm side: trunk) | R radial | |
| 2 | `canopy-far` | 0.1 | far canopy masses across the top band y 0-260, 40 leaf-shaped holes | leaf-far-2, leaf-far | S2/6, R radial, H | |
| 3 | `mist-far` | 0.15 | `mist` bands y 600-700 x 0-1100 | dapple 0.25 | | drift(30) |
| 4 | `ruins-far` | 0.2 | ruined `tower` (h 320, w 70) at x 260 swallowed by `vine`s, window holes; ruined aqueduct `bridge` x 0-500 at y 560 | leaf-far-2, stone-lit | S2/6, R radial, H | |
| 5 | `trunks-mid` | 0.3 | 5 huge trunks w 90-160 (x 120, 380, 1040, 1250, 1500) with `roots` flaring at the base, `vine`s, `fern`s at the feet, bark slits; right three in calm tones | leaf-mid-2, trunk (calm side: trunk, trunk-dark) | S3/10, R radial, I | |
| 6 | `stone-arch` | 0.35 | arch with a tree growing through its top, `stairs` wrapped by `roots` up to the plinth, carved niche for the door; arch frame `stack` 3; opening shows the void-hint sheet + lantern dots (drawn first in this layer) | stone-dark, stone, stone-lit; moss; void-hint, lantern-hint | S3/12, R radial, I, H | |
| 7 | `fork-door` | 0.35 | the door (bible section 11): arched flap 96x160 open ~30 deg, opening sheet door-light, reverse stone-dark, rim-green | leaf-near, stone-dark, door-light | R, I | |
| 8 | `fork-glow` | 0.35 | `glow` at the door centre (494, 670) r 150 | lamp 0.5, core door-light | G | breathe(0.6-1), slow pulse |
| 9 | `curtain-mid-l` | 0.45 | hanging foliage mass + `vine`s, rest inner edge x 380 (clear of the door), bleed to x -500 | leaf-mid-2, leaf-mid, leaf-far-2 | S3/12, R radial, I | hero: part, closed dx +520 |
| 10 | `curtain-mid-r` | 0.45 | right curtain (calm side), rest inner edge x 1120, bleed to x 2400 | trunk-dark, trunk, leaf-near | S3/12, R(0.25), I | hero: part, closed dx -420 |
| 11 | `shafts` | 0.5 | 6 `shaft`s from the gap, angle -20..20 deg, ending before x 1100 | dapple 0.18-0.3 | | breathe(0.7-1) |
| 12 | `roots-near` | 0.7 | near ground y 900-1080 with big `roots`, `fern`s, mossy stones | trunk, trunk-dark, leaf-near | S3/14, R radial, I | |
| 13 | `fireflies` | 0.6 | `scatter` 60 fireflies 3-4 px + 120 motes, x 0-1100 | firefly 0.5-0.9, dapple 0.3-0.6 | | highOnly |
| 14 | `gate-l` | 1 | near fern fronds + vine curtain | gate, trunk-dark, leaf-near | S3/16, R radial, I | sway(0.6, 0% 0%) |
| 15 | `gate-r` | 1 | near frond curtain (calm) | gate, trunk-dark, leaf-near | S3/16, R(0.25), I | sway(0.6, 100% 0%) |

## Portrait 1080x1920
- Calm zone: y 1056-1920: dark undergrowth, `roots-near-p`, trunk bases (calm tokens).
- Canopy gap (540, 100). Stone arch x 400-760, base y 1040, apex y 560; opening centre **(580, 800)**.
- Fork door rect: **x 250, y 790, w 90, h 150**.
- Redraw `-p`: `canopy-light-p`, `trunks-far-p`, `canopy-far-p`, `ruins-far-p` (tower x 860), `trunks-mid-p` (trunks scale 1.4, x 80, 960), `stone-arch-p`, `curtain-mid-l-p` / `curtain-mid-r-p` (side frames, closed dx +/-300), `shafts-p`, `roots-near-p`, `fireflies-p`.
- Shared with `place`: `mist-far` (y +300, s 0.7), `fork-door` (to the portrait rect, s 0.94), `fork-glow`.
- Exit aperture: **(580, 800)**.
- Gates: `gate-l-p` / `gate-r-p` (fern curtains), standard.

## Creature
stag between the arch and the calm zone, antler canopy against the light: desktop display 640x555, hooves centre (880, 905) (antlers may overlap the arch top, never the door rect); portrait 520x450, hooves (700, 1040).

## Scale cues
Walkways and rope bridges with 4-6 px planks high on 1000 px trunks; spiral stairs 3-5 px treads; tower windows 6 px; the 96 px door beside a 520 px arch.

## Budget
<= 450 KB both compositions.
