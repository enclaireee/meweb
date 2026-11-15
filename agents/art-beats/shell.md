# shell

Palette `reverse`. Section text: projects intro (lane `/p`). Text: desktop right, portrait bottom.
Key light: moon upper left, `L = [-0.62, -0.78]` (shadows fall down-right). Rims use `rim-cool`.
Hero effect (only one): the windows light up cluster by cluster: `glow-web`, then `glow-data`, then `glow-hw` (opacity 0 -> 1, stagger about 0.1 local t).
Grand: the reverse side of the Hollow Mountain at night: a colossal terraced shell carved with galleries, balconies, stairs and bridges, ten big lit windows in three clusters, under a moon and cloud banks.

## Windows (contract with `src/world/lane-projects`)
`public/art/shell/windows.json` keeps its current shape (array of `{x, y, w, h}` per composition, design px, top-left), 10 slots in this order, plus a `group` field: `"web"` x4, `"data"` x3, `"hardware"` x3. Projects are web 4, data 2, hardware 2, so data and hardware each have one spare slot: bake it lit but with a paper lattice (12 small holes) instead of an open pane, so it reads as part of the cluster, not empty.
Each window: arched hole, window-light sheet behind, 4 px frame (`ledge`), small balcony slab under it, and its own glow on the cluster layer.

| slot | group | desktop x, y, w, h | portrait x, y, w, h |
|---|---|---|---|
| 0 | web | 470, 470, 84, 120 | 336, 560, 84, 120 |
| 1 | web | 590, 470, 84, 120 | 444, 560, 84, 120 |
| 2 | web | 710, 470, 84, 120 | 552, 560, 84, 120 |
| 3 | web | 830, 470, 84, 120 | 660, 560, 84, 120 |
| 4 | data | 260, 690, 84, 120 | 190, 800, 84, 120 |
| 5 | data | 380, 690, 84, 120 | 298, 800, 84, 120 |
| 6 | data (spare) | 500, 690, 84, 120 | 406, 800, 84, 120 |
| 7 | hardware | 700, 690, 84, 120 | 590, 800, 84, 120 |
| 8 | hardware | 820, 690, 84, 120 | 698, 800, 84, 120 |
| 9 | hardware (spare) | 940, 690, 84, 120 | 806, 800, 84, 120 |

## Desktop 1920x1080
- Shell silhouette: apex (820, 70), base x -60..1500 at y 1080; right flank descends to (1500, 1080), so x 1056-1500 is the dark shade slope (calm).
- Calm zone: x 1056-1920, y 160-940: shade slope (shell-shade, shell, near; C only) with tone-on-tone galleries and dark windows 4-8 px, then far-2 range and sky.
- Exit aperture: **(692, 530)** (centre of the web cluster).
- Gates: `gate-l` rest inner x 180-300, `gate-r` rest inner x 1680-1780 (calm side), standard.

| d | id | z | content | fills | fx | motion |
|---|---|---|---|---|---|---|
| 0 | `sky` | 0 | 2 bands + 120 stars (stars right of x 1056 at opacity <= 0.5) | sky, sky-haze; star | | |
| 1 | `moon` | 0.03 | moon (260, 180) r 90 `stack` 3, 5 craters; `glow` r 400 | moon, moon-shade; mist | S3/10, G | breathe(0.85-1) |
| 2 | `range-far` | 0.06 | 2 far ranges y 760-900: far-1 left of the shell, far-2 right; 40 tiny `pine`s, 2 `tower`s 20-30 px | far-1, far-2 | S2/5, R | |
| 3 | `clouds` | 0.1 | 3 `cloud` banks y 240-460, left and centre (one thin bank right in far-2 tone) | mist 0.5, far-1, far-2 | S2/6, R | drift(30) |
| 4 | `shell-back` | 0.2 | shell outline offset (+24, +18) as depth backing; 2 secondary peaks behind the shoulders | shell-far, shell-shade | R | |
| 5 | `shell-face` | 0.3 | **hero form.** shell `stack` 4 inset 14 (moon-lit tiers on the left only); window holes per the table | shell-shade, shell, mix(shell, shell-lit, .4), shell-lit | S4/14, R, I, H | |
| 6 | `strata` | 0.32 | 9 terrace bands across the face, 60 tiny dark windows 4-8 px, 5 zig-zag `stairs` runs (treads 4 px), carved galleries with 14 small arches 16-30 px, hanging `vine`s | shell-shade, shell, ledge | S2/6, R, H | |
| 7 | `balconies` | 0.35 | balcony slab under every window, 3 `bridge`s linking terraces (arches 12-24 px), 2 ruined `tower`s 80-140 px on the left shoulder with window holes | ledge, shell, shell-lit | S3/8, R, I, H | |
| 8 | `glow-web` | 0.35 | window-light sheets behind slots 0-3 + 4 glows r 140 + a soft cluster glow r 320 at (692, 530) | window-light; window 0.5, core window-core | G | hero: cluster 1 |
| 9 | `glow-data` | 0.35 | slots 4-6, glows r 140, cluster glow r 260 at (422, 750) | same | G | hero: cluster 2 |
| 10 | `glow-hw` | 0.35 | slots 7-9, glows r 140, cluster glow r 260 at (862, 750) | same | G | hero: cluster 3 |
| 11 | `mist` | 0.5 | `mist` band y 900-980 x 0-1056 (0.25), 0.06 to the right; 2 moon `shaft`s from upper left ending before x 1000 | mist | | drift(40) |
| 12 | `trees-mid` | 0.55 | forest at the shell's foot y 900-1080: 80 `pine`s in 3 rows, a stair path leading up to the web cluster | pine (near), near, shell-shade | S2/8, R | |
| 13 | `near-ground` | 0.7 | near ground y 980-1080 with rocks, `fern`s, 2 stone lantern posts (unlit tiers, tiny window-light core) left of x 1000; motes `scatter` 80 near the windows are a separate highOnly group in this layer's dust sublayer | near, near-dark; window-light | S3/14, R, I | motes highOnly |
| 14 | `gate-l` | 1 | dark rock + pine boughs | gate, near-dark, near | S3/16, R, I | sway(0.4, 0% 0%) |
| 15 | `gate-r` | 1 | rock spur + 2 pines (calm) | gate, near-dark, near | S3/16, R(0.25), I | |

Note `trees-mid` uses `near` for the pine fill (no separate pine token in `reverse`).

## Portrait 1080x1920
- Shell apex (540, 200), base y 1500, base x -260..1340 (fills the width).
- Calm zone: y 1056-1920: lower shell, trees and ground in C tokens only (no shell-lit below y 1000, no glow below y 1000).
- Redraw `-p`: `sky-p`, `range-far-p`, `clouds-p` (y 120-300), `shell-back-p`, `shell-face-p`, `strata-p`, `balconies-p`, `glow-web-p`, `glow-data-p`, `glow-hw-p`, `mist-p`, `trees-mid-p` (y 1400-1920), `near-ground-p`.
- Shared with `place`: `moon` (to (180, 140), s 0.8).
- Exit aperture: **(540, 620)** (web cluster centre).
- Gates: `gate-l-p` / `gate-r-p`, standard.

## Scale cues
4-8 px windows and 4 px stair treads on a 1000 px shell; towers 80-140 px; bridge arches 12-24 px; 84x120 lit windows read as the big ones.

## Budget
<= 450 KB both compositions. Write `windows.json` from the same constants used to cut the holes.
