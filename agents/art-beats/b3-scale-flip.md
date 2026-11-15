# b3-scale-flip

Palette `hall`. Section text: Experience (part 1). Text: desktop right, portrait bottom.
Key light: radial from the hall's far end (vanishing point) **VP (720, 520)** desktop / (540, 640) portrait.
Hero effect (only one): deep axial dolly down the hall. The gates here are the two halves of the ragged threshold ring just passed; with the steepest z spread of any beat, near columns and ceiling fly past while the far arcade barely moves.
Grand: a hall far too large for the small mountain. Left wall lit arcades, right wall a colossal wall in shadow carved with a stair city, ribbed ceiling with stalactites and roots, terraced floor descending to a river of light.

## Desktop 1920x1080
- Calm zone: x 1056-1920, y 160-940 (right wall in shadow: calm tokens, tone-on-tone).
- Exit aperture: **(720, 520)** (VP, the brightest far opening, an arch 80x120 in `arcade-far`).
- Gates (threshold halves): `gate-l` rest inner edge x 160-300, `gate-r` rest inner edge x 1640-1760; together they read as a ragged ring with the open centre; bleed and shift standard, plus 30% oversize top and bottom (bleed y -320..1400) so they can scale past the camera.

| d | id | z | content | fills | fx | motion |
|---|---|---|---|---|---|---|
| 0 | `vault-glow` | 0 | bg vault-far with `stack` 4 light tiers (ellipses) around VP | vault-far, vault-glow, vellum, sun | S4/60 | |
| 1 | `arcade-far` | 0.05 | far end wall: 3 tiers of 14 tiny arches (24-40 px holes), exit arch 80x120 at VP, tiny bridges between tiers, `stairs` runs | vault-far, vault-far-2 | S2/5, R radial, H | |
| 2 | `bridge-far` | 0.1 | long thin `bridge` crossing x 200-1300 at deck y 600, 11 arches; gatehouse `tower`s 40-70 px at both ends with window holes; 6 lantern dots 3 px | vault-far-2, lamp | R, H | |
| 3 | `mist-far` | 0.15 | `mist` bands y 650 and 760, x 0-1000 | vellum 0.25 | | drift(30) |
| 4 | `arcade-left` | 0.3 | left wall x 0-700: 5 colossal arches 140-260 px receding toward VP, each arch frame `stack` 3; `vine`s hanging; small `stairs` in the arch openings; 20 window holes 6-10 px | vault-mid, vault-far-2, vault-far | S3/10, R radial, I, H | |
| 5 | `wall-right` | 0.3 | right wall x 1000-1920 in shadow: 5 tiered balconies, 40 tiny dark windows 4-8 px, 3 stair runs, `ruinWall` courses, hanging `roots`; edge facing VP gets rim (outside calm zone only) | rock-mid, rock, vault-near, rock-dark | S3/10, R(0.25), I | |
| 6 | `floor-terraces` | 0.35 | stepped terraces descending to VP (`strata`), 18 small `tree`s 20-50 px, small `stairs`, a light river ribbon (vellum) down the middle toward the viewer; calm side terraces in rock tones | vault-mid, vault-mid-2, vault-near; vellum 0.7 | S3/8, R radial | |
| 7 | `columns` | 0.45 | 3 colossal `column`s: x 140 (h 900, w 90), x 420 (h 760, w 72), x 1180 (h 820, w 80, calm side tones); capitals, `roots` wrapped around shafts | vault-near, vault-mid-2, vault-mid (left); rock, rock-mid (right) | S3/12, R radial, I | |
| 8 | `shafts` | 0.4 | 4 `shaft`s from ceiling oculi (x 380, 560, 760, 900) down to the floor, angle +/-10 deg; none right of x 1000 | vellum 0.2-0.3 | | breathe(0.7-1) |
| 9 | `ceiling` | 0.55 | ribbed ceiling band y 0-220 with ribs converging toward VP, `stalactites` fringe (30-140 px), hanging `roots` | rock-mid, vault-near, rock | S3/12, R radial, I | |
| 10 | `stairs-near` | 0.65 | broad ruined stair descending from near right (x 1100-1700, y 820-1080) toward the floor; broken balustrade | rock, rock-dark | S3/14, R(0.25), I | |
| 11 | `rock-near` | 0.7 | near ground lip y 960-1080 with ferns (`fern`), roots, broken stones | rock, rock-dark | S3/14, R radial, I | |
| 12 | `dust` | 0.6 | `scatter` 160 warm motes x 200-1000 around the shafts | dust 0.3-0.8 | | highOnly |
| 13 | `roots-near` | 0.8 | near hanging `roots` and `vine`s from the top edge y 0-260 (x 300-1500, sparse over the calm side) | gate, rock-dark | R radial, I | sway(0.6, 50% 0%) |
| 14 | `gate-l` | 1 | left half of the threshold ring: ragged rock lip with root tips and broken stones on the inner edge | gate, rock-dark, rock | S3/18, R radial, I | |
| 15 | `gate-r` | 1 | right half of the ring (calm side) | gate, rock-dark, rock | S3/18, R(0.25), I | |

## Portrait 1080x1920
- Calm zone: y 1056-1920: lower terraces, `stairs-near-p`, `rock-near-p` in calm tokens only; no vellum river below y 1056.
- VP (540, 640). Arcades on both side walls stacked in 3 tiers vertically (y 200-1000); ceiling band y 0-260.
- Redraw `-p`: `vault-glow-p`, `arcade-far-p` (tiers around VP), `bridge-far-p` (x 80-1000, deck y 760), `arcade-left-p` (x 0-380), `wall-right-p` (x 700-1080, now lit side tones above y 1000 allowed: vault-mid/vault-near), `floor-terraces-p`, `columns-p` (x 90 and x 990, h 1400), `shafts-p`, `ceiling-p`, `stairs-near-p`, `rock-near-p`, `roots-near-p`, `dust-p`.
- Shared with `place`: `mist-far` (x -200, y 200).
- Exit aperture: **(540, 640)**.
- Gates: `gate-l-p` (rest inner x 100-200) / `gate-r-p` (rest x 880-980), standard shift, oversize bleed y -500..2400.

## Scale cues
Tiny far arches 24-40 px and gatehouse towers 40-70 px framed by 900 px columns; 4-8 px windows on the right wall; 20-50 px trees on the floor terraces.

## Budget
<= 450 KB both compositions. Oversized gates at scale 0.75 quality 50.
