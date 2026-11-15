# b1-approach

Palette `night`. Section text: About. Text: desktop left (over the shade facet), portrait bottom.
Key light: moon upper right, `L = [0.55, -0.83]`.
Hero effect (only one): crease lines surface on the mountain face (`creases` opacity 0 -> 1) as the camera pushes in.
The mountain now fills the frame and must be a dense, terraced, ruin-carved cliff (no figures), not a blank triangle.

## Shared outline (b1 and b2 must tile exactly)
Desktop outline, before jitter: (300,1010) (410,870) (500,770) (590,640) (680,520) (770,400) (860,260) (960,110) (1050,250) (1150,380) (1250,500) (1350,630) (1450,760) (1540,880) (1620,1010).
Jitter once: `cut(outline, rng(1101), 2.5, 36)`. b2 uses the same points, seed and call.
Seam: x 960. Top fold line: y 330, from (815,330) to (1111,330). Pieces: `face-top` = outline above y 330; `face-l` = below y 330 and x <= 960; `face-r` = below y 330 and x >= 960.
Portrait outline = desktop points mapped `x' = 540 + 0.94 (x - 960)`, `y' = 260 + 1.444 (y - 110)` before jitter, seed `rng(1102)`. Seam x 540, fold line y 578.
Window: arched hole 56x80 centred (1040, 600) desktop; portrait 60x86 centred (615, 968).

## Desktop 1920x1080
- Calm zone: x 0-864, y 160-940. Covers the left flank and the shade facet: calm tokens only, tone-on-tone detail.
- Exit aperture: **(960, 560)** (seam centre; b2 opens here).
- Gates: `gate-l` rest inner edge x 180-280; `gate-r` rest inner edge x 1660-1760; standard bleed and shift.

| d | id | z | content | fills | fx | motion |
|---|---|---|---|---|---|---|
| 0 | `sky` | 0 | 3 bands + 90 stars (top corners) | sky-top, sky, sky-haze; star | | |
| 1 | `moon-edge` | 0.05 | big moon cut by the top-right corner, centre (1800, 110) r 230, `stack` 3, 4 craters; `glow` r 560 | moon, moon-shade, mist | S3/12, G | breathe(0.85-1) |
| 2 | `range-far` | 0.1 | low ranges either side of the mountain y 760-860; 30 tiny pines, 2 `tower`s 20 px | far-ridge-1 (right), far-ridge-2 (left) | S2/5, R | |
| 3 | `clouds` | 0.15 | 2 `cloud` banks behind the flanks y 420-560, one each side | sky-haze (left), mix(sky-haze, far-ridge-1, .5) (right) | S2/6, R | drift(30) |
| 4 | `shoulder-l` | 0.25 | secondary peaks left of the outline x 0-420, y 560-1080; 40 pines; small `bridge` (5 arches) linking to the face at y 820 | mid-ridge, pine-mid | S3/8, R(0.25) | |
| 5 | `shoulder-r` | 0.25 | right shoulder x 1500-1920, y 520-1080; 2 `tower`s 70-110 px with window holes, a `stairs` run, 30 pines | mountain, mountain-lit | S3/8, R | |
| 6 | `face-back` | 0.3 | full outline offset (-18, +22) as depth backing; window-light sheet behind the window hole | mountain-shade, window-light | R | |
| 7 | `face-l` | 0.35 | **hero, left half.** `stack` 4 tiers inset 14. Calm tone-on-tone detail: 7 `strata` bands, 3 carved terraces, 18 dark windows 4x6 px, ruined zig-zag `stairs` (treads 5 px), 4 `pine` clusters, 6 hanging `vine`s | mid-ridge, mountain-shade, mix(mountain-shade, mountain, .3), mix(mountain-shade, mountain, .6) | S4/14, R(0.25), I | |
| 8 | `face-r` | 0.35 | **hero, right half.** `stack` 4 inset 14. 8 `strata` bands, 3 terraces, 26 windows 4x6 (3 of them window-light), mist waterfall (3 strands, mist 0.4), `bridge` over a crevasse x 1180-1320 y 720, 2 ruined `tower`s 60-120 px on ledges, window hole | mountain, mix(mountain, mountain-lit, .35), mix(.7), mountain-lit | S4/14, R, I, H | |
| 9 | `face-top` | 0.35 | apex piece above y 330, `stack` 3, moon-lit cap tier on the right slope | mountain, mountain-lit, moon-shade 0.6 | S3/12, R, I | |
| 10 | `creases` | 0.4 | slits 3-4 px: seam x 960 (apex -> base), fold line y 330, 4 diagonals from (960, 330) to the base; each slit has a 1.5 px lighter lip on its moon side | shadow 0.8; lip mix(mountain, rim-cool, .4) | | hero: opacity 0 -> 1 |
| 11 | `window-glow` | 0.4 | `glow` (1040, 600) r 220 | window, window-core, 0.55 | G | breathe(0.8-1) |
| 12 | `stairs-near` | 0.6 | great ruined stairway rising from bottom centre (x 800-1120, y 1080) toward the window ledge (y 680); balustrade with 3 holes per flight; 2 small `lantern`s r 6 on posts | near-dark, near-hill; window-light | S3/12, R, I | |
| 13 | `mist` | 0.55 | mist band across the base y 860-960 (0.25 right of x 864, 0.08 left); 2 `shaft`s from the top right; `scatter` 80 motes on the right half | mist | | drift(40); motes highOnly |
| 14 | `gate-l` | 1 | dark rock outcrop with pine boughs hanging into frame | gate, near-dark, mix(near-dark, rim-cool, .12) | S3/16, R(0.25), I | |
| 15 | `gate-r` | 1 | rock + two pines, needles on the inner edge | gate, near-dark, mix(near-dark, rim-cool, .2) | S3/16, R, I | sway(0.4, 100% 100%) |

## Portrait 1080x1920
- Calm zone: y 1056-1920: the lower face below y 1056 uses calm tokens only (no mountain-lit tiers below y 1000), plus `stairs-near-p` and ground.
- Mountain on the portrait outline (apex (540, 260), base y 1560, base x -80..1160). Redraw `-p`: `face-back-p`, `face-l-p`, `face-r-p`, `face-top-p`, `creases-p`, `stairs-near-p` (zig-zags up the middle to the window, y 1920 -> 1060), `shoulder-l-p` / `shoulder-r-p` (narrow strips at the base corners), `range-far-p`, `clouds-p` (y 300-460), `mist-p`.
- Shared with `place`: `sky` (s 1.8), `moon-edge` (x -840), `window-glow` (to (615, 968), s 1.1).
- Exit aperture: **(540, 910)**.
- Gates: `gate-l-p` (rest inner x 110-190) and `gate-r-p` (rest x 890-970), standard.

## Scale cues
Windows 4x6 px across a 900 px face; stair treads 5 px; towers 60-120 px on ledges; bridge arches 12-20 px.

## Budget
b1 both compositions <= 175 KB (b0 + b1 + owl-moth under 400 KB). Face halves quality 60, scale 1; shoulders and range 0.75.
