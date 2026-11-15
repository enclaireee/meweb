# b0-outside

Palette `night`. Section text: name (portfolio intro). Text: desktop left, portrait bottom.
Key light: moon upper right, `L = [0.55, -0.83]`; shadows fall down-left.
Hero effect (only one): the mist bands drift apart and the single warm window ignites (`window-glow` 0 -> 1).
The world is vast and quiet; the mountain is small in it (about 460 px tall), but it has the most refined stack in the frame.

## Desktop 1920x1080
- Calm zone: x 0-864, y 160-940 (dark sky upper-left, shade-side ranges, pine rows).
- Hero: mountain apex (1240, 340), base y 800, base x 980-1520. Window: arched hole 14x20 centred (1262, 560).
- Moon centre (1520, 220), r 150.
- Horizon of the far range y 600-660; valley lake y 800-850, x 1060-1720.
- Exit aperture: **(1262, 560)** (the window).
- Gates: standard `gate-l` (rest inner edge x 220-340, upper bough reaching x 520 at y 0-90) and `gate-r` (rest inner edge x 1640-1760, bough to x 1450 at y 0-80).

| d | id | z | content | fills | fx | motion |
|---|---|---|---|---|---|---|
| 0 | `sky` | 0 | 3 stepped horizontal bands (y 0-300, 300-640, 640-1080), 180 star diamonds 3-5 px via `scatter`, denser top-right; in calm zone opacity <= 0.5 | sky-top, sky, sky-haze; star | | |
| 1 | `moon` | 0.05 | `stack` disc 4 tiers r 150 (outer halo ring r 220 at opacity 0.3 in mist, then moon-shade, moon, moon), 5 crater holes 10-30 px showing moon-shade; `glow` r 520 mist 0.35 | moon, moon-shade, mist | S4/10, G | breathe(0.85-1) on glow |
| 2 | `clouds-far` | 0.1 | 3 `cloud` banks y 260-420 across the sky, one crossing the lower moon edge; 2-tier stacks; calm-side clouds in sky-haze | mix(sky-haze, far-ridge-1, .5), sky-haze | S2/6, R | drift(30) |
| 3 | `range-far` | 0.12 | `ridge` peaky, mean y 630, amp 170, full width; 3 `tower`s 18-30 px on peaks at x 1180, 1360, 1720 with 3x4 window-light dots; 40 tiny `pine`s 8-16 px on crests | far-ridge-1 (x > 900), far-ridge-2 (x < 900) | S2/5, R | |
| 4 | `range-mid` | 0.2 | `ridge` y 700, amp 200; 80 `pine`s 14-30 px along crest; aqueduct `bridge` x 1050-1650 at deck y 690, 9 arches as holes, piers 60 px | far-ridge-2, mid-ridge, pine-mid | S2/6, R | |
| 5 | `mist-far` | 0.25 | 3 `mist` bands y 690, 720, 760, widths 900-1400 | mist 0.22 (hero side), 0.08 (x < 864) | | drift(40) |
| 6 | `valley` | 0.3 | rolling `hills` y 790; lake sheet x 1060-1720, y 800-850 with 6 broken moon-reflection dashes and one warm dot under the window; 20 ripple slits | mid-ridge, sky-haze (lake), moon 0.4 (dashes), window-light (dot) | R | |
| 7 | `mountain-back` | 0.35 | mountain silhouette offset (-14, +18) as depth backing; small twin peak behind left flank (apex (1080, 520)); window-light sheet 30x40 behind the window hole | mountain-shade, window-light | R | |
| 8 | `mountain` | 0.4 | **hero.** Peaky silhouette, two facets split at a ridge line from apex to (1300, 800): shade facet left, lit facet right. Each facet `stack` 4 tiers inset 12. Window hole; zig-zag stair path (3-4 px treads, 14 switchbacks) from foot to window as a lighter sheet; 3 crease slits 3 px; 12 tiny pines on ledges; tiny `tower` 40 px at the foot x 1050 | shade: mountain-shade, mountain, mix(mountain, mountain-lit, .3); lit: mountain, mix(.4), mix(.7), mountain-lit | S4/12, R, I, H | |
| 9 | `window-glow` | 0.4 | `glow` (1262, 560) r 90 | window, core window-core, 0.6 | G | hero: opacity 0 -> 1; breathe(0.8-1) |
| 10 | `forest-mid` | 0.5 | rolling hill y 860 with 50 `pine`s 40-90 px (rows of 3 depths in 2 tints); `ruinWall` x 1500-1700 with 3 arched holes; small stone `stairs` to the lake | near-hill, pine-mid, mid-ridge | R, H | |
| 11 | `shafts` | 0.55 | 3 `shaft`s from the moon down-left, angle 25-35 deg, ending before x 900 | mist 0.12-0.18 | | breathe(0.7-1) |
| 12 | `near-hill` | 0.7 | near ground y 940-1080; 70 `fern`/grass tufts on the edge; 3 large `pine`s 260-340 px at x 1580-1820 with rim on the right | near-dark, near-hill | S3/14, R, I | sway(0.5, 50% 100%) on the pines |
| 13 | `dust` | 0.6 | `scatter` 120 motes 1.5-3 px, hero region only | mist 0.3-0.7 | | highOnly |
| 14 | `gate-l` | 1 | rock outcrop + pine trunk + overhanging boughs; inner edge carries needles, cones, root tips | gate, near-dark, mix(near-dark, rim-cool, .15) | S3/16, R(0.25), I | |
| 15 | `gate-r` | 1 | leaning great pine + boulder; boughs over the top-right | gate, near-dark, mix(near-dark, rim-cool, .2) | S3/16, R, I | sway(0.4, 100% 100%) |

## Portrait 1080x1920
- Calm zone: y 1056-1920 (dark near forest and ground: near-hill, near-dark, pine-mid rows, tone-on-tone).
- Moon (760, 300) r 130. Mountain apex (540, 640), base y 1000, base x 270-810 (shared `mountain`, `mountain-back`, `window-glow` with `place` s 1.1). Window ends near **(556, 830)**.
- Exit aperture: **(556, 830)**.
- Redraw `-p`: `sky-p`, `clouds-far-p` (2 banks y 380-560), `range-far-p` (y 920, towers at x 220, 860), `range-mid-p` (y 980, bridge x 600-1040), `valley-p` (lake x 300-900, y 1010-1050), `forest-mid-p` (pine rows y 1060-1300, in calm tokens), `shafts-p` (end above y 1000), `near-hill-p` (y 1500-1920 ground, ferns), `dust-p` (y 200-1000).
- Shared with `place`: `moon`, `mist-far` (s 0.7, y +300).
- Gates: `gate-l-p` (pines + rock, rest inner edge x 120-200) and `gate-r-p` (rest x 880-960); standard bleed/shift.

## Creature
owl-moth crosses in front of the moon: desktop display 300x200, path (1250, 180) -> (1760, 300); portrait 260x173, path (600, 250) -> (980, 360).

## Scale cues
Window 14x20 on a 460 px mountain; stair treads 3-4 px; aqueduct arches 20-30 px; towers 18-40 px.

## Budget
b0 both compositions <= 190 KB (b0 + b1 + owl-moth under 400 KB). Keep sky at scale 0.75 (stars), shafts/mist/dust 0.5.
