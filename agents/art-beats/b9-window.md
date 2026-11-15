# b9-window

Palette `paper` for the room, `night` for the view through the window. Section text: Contact. Text: desktop left, portrait bottom.
Key light: moonlight through the window, moon upper left of the opening, so `L` inside the room = normalise((1130, 260) - centroid); light falls down and to the right, away from the calm zone. Warm fill from the sill lantern (1180, 760). Room rims use `rim-warm`, view rims `rim-cool`.
Hero effect (only one): the window breathes and the night moves. `window-glow` and `shafts` breathe together (0.7-1, 6 s), and the three view layers (`night-outside` z 0.02, `range-outside` z 0.08, `outside-near` z 0.2) slide against the fixed `window-frame` (z 0.35) with pointer and scroll, so the night reads as deep beyond the glass.
Grand: a tall vaulted stone room at the top of the mountain (the window seen in b0), its tracery window opening onto the whole night range. The room is dense and dark; the window is the one bright thing.

## Desktop 1920x1080
- Window opening: x 1050-1470, y 180-780 (pointed arch top from y 180 to 330), wall reveal 40 px deep each side.
- Calm zone: x 0-864, y 160-940: the left wall (wall, wall-dark, wall-mid; C only) with stone courses, 3 niches holding dark pots and stones, a ruined shelf, a carved rib.
- Exit aperture: **(1260, 470)** (window centre). b9 is the last beat; the point is still declared for the contract.
- Gates: `gate-l` rest inner x 180-300 (calm side), `gate-r` rest inner x 1680-1780, standard: heavy paper drapes.

| d | id | z | content | fills | fx | motion |
|---|---|---|---|---|---|---|
| 0 | `night-outside` | 0.02 | night palette sky (3 bands), 70 stars, moon (1130, 260) r 50 `stack` 3 with craters, moon `glow` r 220; only the window area matters but fill the canvas | sky-top, sky, sky-haze, star, moon, moon-shade; mist | S3/8, G | hero: parallax |
| 1 | `range-outside` | 0.08 | 3 ranges y 520-780 across the window (far-ridge-1, far-ridge-2, mid-ridge), 40 tiny `pine`s, a far mountain with one lit window 3x4 px (window-light) and a `mist` band at y 640 | far-ridge-1, far-ridge-2, mid-ridge, pine-mid; window-light; mist 0.25 | S2/5, R | hero: parallax; mist drift(20) |
| 2 | `outside-near` | 0.2 | near pine boughs and a branch crossing the lower right of the window, needles on the edge | near-dark, pine-mid, mix(pine-mid, rim-cool, .2) | S2/6, R | hero: parallax; sway(0.6, 100% 50%) |
| 3 | `window-reveal` | 0.3 | deep reveal: the window's side and top jambs 40 px, `stack` 3, moonlit inner edge on the right jamb | wall-dark, wall, wall-mid | S3/8, R, I | |
| 4 | `wall` | 0.3 | full canvas wall with the window hole: stone courses (`ruinWall`), left wall carved with 3 niches (dark pots, stones), a ruined shelf (`ruinWall` fragment), a hanging `vine`; right wall x 1500-1920 with a pilaster and 2 tiny barred slits | wall, wall-dark, wall-mid, gate | S3/10, R(0.25 left of 864), I, H | |
| 5 | `vault-ribs` | 0.35 | ceiling y 0-180: 4 ribs converging over the window, keystone, hanging `roots` tips | wall-dark, wall, wall-mid | S3/10, R, I | |
| 6 | `window-frame` | 0.35 | stone tracery: 2 mullions, a transom at y 520, pointed arch tracery with 3 quatrefoil holes and 12 small lights; `stack` 3; moon-rim on the inner edges | wall, wall-mid, mix(wall-mid, rim-warm, .3) | S3/10, R, I, H | |
| 7 | `sill` | 0.45 | deep sill y 780-840, x 1010-1510: a paper `lantern` r 18 at (1180, 760), 3 potted ferns (`fern`), 2 stones, a folded paper boat (callback to the sheet, 30 px) | wall-mid, wall, wall-dark; lantern colours window-light/lamp | S3/10, R, I | |
| 8 | `window-glow` | 0.45 | `glow` at the sill lantern (1180, 760) r 180 + soft moon spill on the sill | lamp 0.5, core lamp-core | G | hero: breathe(0.7-1) |
| 9 | `floor` | 0.6 | stone floor y 900-1080, flagstones receding, worn step below the window, moonlight patch (paper 0.1) right of x 900 only | wall-dark, wall, gate | S3/12, R, I | |
| 10 | `shafts` | 0.5 | 4 `shaft`s from the window down-right onto the floor, angles 25-40 deg, ending before the calm zone | rim-paper 0.15-0.25 | | hero: breathe(0.7-1) |
| 11 | `mist` | 0.5 | faint haze in the shafts x 1000-1800 | paper 0.15 | | drift(20) |
| 12 | `motes` | 0.6 | `scatter` 120 motes inside the shafts | rim-paper 0.3-0.8 | | highOnly |
| 13 | `plants-near` | 0.75 | near right: hanging pot with trailing `vine`s and `fern` fronds from the top edge, a hanging paper `lantern` r 26 (unlit tier colours, faint lantern glow r 80) at (1640, 300) | wall-dark, gate, wall; window-light, lamp 0.35 | S3/14, R, I | sway(0.6, 50% 0%) |
| 14 | `gate-l` | 1 | heavy drape, folded pleats, torn hem (calm) | gate, wall-dark, wall | S3/18, R(0.25), I | |
| 15 | `gate-r` | 1 | drape with tie-back and a fold showing its lighter reverse | gate, wall-dark, wall-mid | S3/18, R, I | sway(0.3, 50% 0%) |

## Portrait 1080x1920
- Window opening x 290-790, y 230-950 (arch top y 230-410).
- Calm zone: y 1056-1920: lower wall, `sill-p` sits at y 950-1010 (above the zone), floor and wall below in C tokens only, no moon patch below 1056.
- Redraw `-p`: `range-outside-p`, `outside-near-p`, `window-reveal-p`, `wall-p`, `vault-ribs-p`, `window-frame-p`, `sill-p` (lantern at (420, 930)), `floor-p`, `shafts-p` (end above y 1050), `mist-p`, `motes-p`, `plants-near-p` (x 820-1080, y 0-700).
- Shared with `place`: `night-outside` (s 1.2, moon to (400, 330)), `window-glow` (to (420, 930)).
- Exit aperture: **(540, 590)**.
- Gates: `gate-l-p` / `gate-r-p` drapes, standard.

## Scale cues
A 3x4 px lit window on the far mountain seen through a 600 px window; 40 tiny pines; quatrefoil holes 30-40 px; 30 px paper boat on the sill.

## Budget
<= 450 KB both compositions. View layers far settings; wall near settings (0.75, q 60).
