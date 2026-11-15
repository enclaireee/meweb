# Art bible v2: The Hollow Mountain

Owner: `art-director`. Read-only for everyone else; a needed change is reported, not made.
`agents/decisions.md` wins on any conflict ("Build decisions b" overrides the rest).
Per-scene briefs: `agents/art-beats/<slug>.md` (10 beats, `shell`, `p-web`, `p-data`, `p-hardware`, `frame`).
Briefs only state exceptions to this file; everything not stated in a brief comes from here.

## 0. Why v2
The v1 bake reads as empty: about 10 flat one-colour sheets per scene, big blank walls, stock lollipop trees, no depth inside a form. v2 keeps the material (flat cut paper, one fill per sheet) and changes the **density**: 14 to 16 layers, every region carries small detail, hero forms are built from stacked inset sheets, every lit edge has a rim, and atmosphere (shafts, mist, dust) sits between the planes. The world must read **grand**: tiny architecture against colossal forms.

## 1. Style rules
1. One sheet = one flat fill. No gradients inside a sheet. Gradients exist only in `glow`, `shaft`, `mist` (tissue/light, not paper).
2. Depth = overlap + baked shadow + rim light + inner shadow. Every sheet sits on something that receives its shadow.
3. **Stacked-sheet depth** on every hero form: the same silhouette repeated 3 to 5 times, each inset and one tint step closer to the light (`stack`). This is the signature look; a hero form that is a single flat sheet fails QA.
4. Cut, not drawn: no outlines, no strokes as lines, no text, letters, logos, no photo/noise texture. **Paper grain is a CSS overlay, never baked.**
5. Holes show what is behind (windows, arches, canopy gaps, punched patterns). A hole always has something lighter (or a foreshadow colour) behind it.
6. World-only: nature and ruins mixed (arches, stairs, bridges, towers, roots, vines, pines, ferns, crystals, lanterns). Nothing is drawn for a project, role, skill or award. No screens, circuits, gears, books-as-content, tools.
7. **No human figure anywhere.** No traveller, no silhouettes of people, no faces. Creatures (owl-moth, heron, stag, jellyfish, whale) are the only living forms; their only facial feature is one eye hole.
8. Warm light is rare and always has a source shape (sun, lantern, window, seam, door, crystal).
9. Deterministic: fixed seeds; re-baking gives identical bytes.
10. Repeated elements never copy-paste: vary scale 0.85 to 1.15, rotation within +/-4 deg, spacing +/-20%.
11. Minimum feature 3 design px (holes, slits, stair treads, chains). Anything smaller is not cut.
12. No pure black or white: darkest allowed is the palette `gate`/`shadow`, lightest the palette core light.
13. Do not recreate real religious or national symbols. Keep towers, shrines and arches generic.

## 2. Palettes (hex tokens)
Ordered roughly far to near. `C` = calm-safe (relative luminance <= 0.10; only these may fill the text calm zone, section 8). Beats may `mix(a, b, t)` between two tokens of the **same** palette; the result is calm-safe only if both inputs are. `shadow` is the colour of every baked drop/inner shadow in that palette.

Outside (cool, far = lighter/hazier) -> inside (warm, far = brightest, near = darkest) -> Second Fold flips to dawn -> paper.

### night (b0-outside, b1-approach; b9 view through window)
| token | hex | C | use |
|---|---|---|---|
| sky-top | #070d18 | C | upper sky band |
| sky | #0b1420 | C | sky body |
| sky-haze | #16263a | C | horizon band |
| star | #cfe0f0 | | star diamonds (3-5 px) |
| far-ridge-1 | #4a6788 | | farthest range (moon side) |
| far-ridge-2 | #34506e | C | far range (shade side), second range |
| mid-ridge | #22384f | C | mid ranges, bridges |
| pine-mid | #1a3346 | C | mid pines, forest rows |
| mountain-shade | #1e3349 | C | shade facet, stack outer tier |
| mountain | #2c4763 | C | mountain body |
| mountain-lit | #3d5f80 | | moon-lit facet, inner stack tiers |
| near-hill | #132235 | C | near ground |
| near-dark | #0d1828 | C | near masses |
| gate | #08101a | C | gate sheets |
| moon | #dfe9f2 | | moon disc |
| moon-shade | #b9cadb | | craters, moon inner tier |
| mist | #9fb8cf | | mist, shafts, dust |
| rim-cool | #8fb2d4 | | rim light target |
| window | #ffb866 | | window glow |
| window-core | #fff1cf | | glow core |
| window-light | #ffcf8a | | sheet behind window holes |
| shadow | #03060c | | shadows |

### fold (b2-first-fold) = all `night` tokens plus
| token | hex | C | use |
|---|---|---|---|
| flap-back | #1f3550 | C | reverse side of flaps |
| flap-face | #2c4763 | C | = mountain |
| flap-lit | #6a5a55 | | flap edges catching warm light |
| seam | #ffcf8a | | seam light sheet |
| seam-core | #fff1cf | | seam core, glow core |
| interior-far | #f6c56b | | inside, brightest |
| interior-mid | #d98e3a | | inside arches far |
| interior | #b0652a | | inside arches |
| interior-near | #7a3d1c | C | cave lip, roots inside |
| lamp | #ffb866 | | seam glow colour |

### hall (b3-scale-flip, b4-inner-sun)
| token | hex | C | use |
|---|---|---|---|
| vault-glow | #f6c56b | | brightest far wall |
| vault-far | #e3a14e | | far architecture |
| vault-far-2 | #d98e3a | | far ribs, bridges |
| vault-mid | #b0652a | | mid arches, terraces |
| vault-mid-2 | #95522a | | mid shade tiers |
| vault-near | #7a3d1c | C | near pillars, cliff city lit tier |
| rock-mid | #613019 | C | shadow walls |
| rock | #4a2413 | C | near rock, ruins |
| rock-dark | #33180c | C | windows in shadow walls, cords |
| gate | #1f0e07 | C | gates |
| sun | #fff1cf | | paper sun |
| vellum | #ffdf9e | | halo, shafts, light pool |
| rim-warm | #ffd9a0 | | rim light target |
| lamp | #ffb866 | | glows |
| lamp-core | #fffaf0 | | glow core |
| dust | #fff4d6 | | motes |
| foreshadow | #cfd98a | | b4 exit arch interior (understory light) |
| shadow | #1a0b05 | | shadows |

### understory (b5-understory)
| token | hex | C | use |
|---|---|---|---|
| canopy-light | #cfd98a | | brightest gap |
| leaf-far | #9cbb6a | | far canopy |
| leaf-far-2 | #7fa35a | | far trunks, ruins |
| leaf-mid | #5d8a4c | | mid canopy |
| leaf-mid-2 | #4f7a45 | | mid trunks |
| moss | #3a6a3c | | moss on stone |
| leaf-near | #2f5637 | C | near foliage |
| trunk | #1d3a2b | C | trunks, roots |
| trunk-dark | #142a1f | C | near roots |
| stone-lit | #8a8660 | | lit stone tier |
| stone | #5b5a42 | | ruins |
| stone-dark | #3d3d2e | C | ruins in shade |
| gate | #0b1a13 | C | gates |
| dapple | #f3e6a6 | | shafts, dapples |
| rim-green | #e2eaa0 | | rim light target |
| firefly | #eaf59a | | fireflies |
| door-light | #ffcf8a | | fork door opening |
| lamp | #ffb866 | | fork door glow |
| void-hint | #070b14 | C | b5 exit arch interior (lantern vault) |
| lantern-hint | #ffd9a0 | | 3-5 px lantern dots inside the exit arch |
| shadow | #06120c | | shadows |

### lantern (b6-lantern-vault)
| token | hex | C | use |
|---|---|---|---|
| void | #070b14 | C | background |
| vault-far | #0f1a2b | C | far arches |
| vault-far-2 | #13213a | C | far structure |
| vault-mid | #1a2b44 | C | hanging city, bridge |
| vault-mid-2 | #22364f | C | stalactites, pillars |
| vault-near | #0c1422 | C | near structure |
| chain | #2a3c55 | C | strings, chains |
| gate | #05080f | C | gates |
| rim-lantern | #c98a52 | | warm rim on lantern-facing edges |
| lantern-deep | #b8642e | | lantern outer tier |
| lantern-body | #e8964a | | lantern body |
| lantern-hot | #ffd9a0 | | lantern inner tier, holes |
| lamp | #ffb866 | | glows |
| lamp-core | #fff1cf | | glow core |
| dust-warm | #ffcf8a | | embers, warm haze |
| foreshadow | #f4c9b8 | | b6 exit arch interior (dawn) |
| shadow | #020409 | | shadows |

### dawnfold (b7-second-fold)
| token | hex | C | use |
|---|---|---|---|
| dawn-sky-hi | #fbe2d2 | | horizon band behind inner mountain |
| dawn-sky | #f4c9b8 | | sky |
| haze | #e8a9a4 | | upper sky band, far haze |
| cloud | #fff0e2 | | cloud lit tiers |
| far-peak | #c79ab0 | | far peaks |
| far-peak-2 | #a884a8 | | second peaks |
| inner-lit | #a58cbf | | inner mountain lit tiers |
| inner-mountain | #7f6b9c | | inner mountain |
| flap-back | #54507f | C | flap reverse, cavern wall lit tier |
| near | #332f55 | C | cavern wall, near ground |
| near-dark | #24213f | C | near masses |
| gate | #1b1a33 | C | gates |
| dawn-light | #ffe3c4 | | seam, shafts, mist |
| dawn-core | #fffaf0 | | glow core |
| rim-dawn | #ffd2b0 | | rim light target |
| warm-arch | #b0652a | | callback arch (cavern) |
| warm-arch-near | #7a3d1c | C | callback arch shade tier |
| whale-paper | #f3ead8 | | whale facets |
| whale-shade | #e3d3bb | | whale shade facets |
| whale-deep | #c9b8a6 | | whale belly facets |
| shadow | #120f24 | | shadows |

### paper (b8-seam, b9-window; b9 window view uses `night`)
| token | hex | C | use |
|---|---|---|---|
| paper | #f3ead8 | | the one sheet, brightest |
| paper-shade | #e3d3bb | | fold 1 |
| fold-far | #c9b8a6 | | fold 2 |
| fold-far-2 | #b8a596 | | fold 3 |
| fold-mid | #a78f86 | | fold 4 |
| fold-mid-2 | #8d7579 | | fold 5 |
| fold-near | #6f5f6b | | fold 6 |
| fold-deep | #4e4152 | C | fold 7, calm backing |
| fold-ink | #382e3c | C | corner fold, gates (b8) |
| wall-mid | #4a3634 | C | b9 wall lit tier |
| wall | #3a2a2a | C | b9 wall |
| wall-dark | #2a1d1e | C | b9 reveals, floor |
| gate | #241a1c | C | gates |
| window-light | #ffcf8a | | window light sheets |
| lamp | #ffb866 | | glows |
| lamp-core | #fff1cf | | glow core |
| rim-paper | #fff8ea | | rim on paper folds |
| rim-warm | #ffd9a0 | | rim on b9 wall |
| shadow | #1c1216 | | shadows |

### reverse (shell)
| token | hex | C | use |
|---|---|---|---|
| sky | #0a1120 | C | sky |
| sky-haze | #182338 | C | horizon band |
| star | #d6e2f2 | | stars |
| moon | #e6ecf5 | | moon |
| moon-shade | #c0cde0 | | moon inner tier |
| far-1 | #4b5f84 | | farthest range (moon side) |
| far-2 | #33456a | C | far range |
| shell-far | #283a5c | C | shell stack outer tier |
| shell | #34486c | C | shell face |
| shell-lit | #4c6694 | | moon-lit tiers (left side only) |
| shell-shade | #1e2b45 | C | shade facet |
| ledge | #3e5480 | C | ledges, balconies |
| near | #121c2e | C | near ground |
| near-dark | #0b1220 | C | near masses |
| gate | #070c17 | C | gates |
| mist | #a7b6d0 | | mist, shafts |
| rim-cool | #9db8dc | | rim target |
| window | #ffb866 | | window glow |
| window-core | #fff1cf | | glow core |
| window-light | #ffcf8a | | sheet behind window holes |
| shadow | #03060c | | shadows |

### district palettes (p-web, p-data, p-hardware)
Same token names in all three so briefs are interchangeable.
| token | p-web (amber) | p-data (teal) | p-hardware (ember) | C |
|---|---|---|---|---|
| glow | #f2b866 | #a6d8cc | #f2a48c | |
| far | #d08a44 | #6aa59e | #c86c5c | |
| far-2 | #b8733a | #4f8a88 | #a85450 | |
| mid | #8f552e | #3a6e72 | #87424a | |
| mid-2 | #6e3f24 | #2a5560 | #66303e | C |
| near | #452617 | #183440 | #3c1d2a | C |
| near-dark | #2c180e | #10242d | #28121d | C |
| gate | #180c06 | #07131a | #150910 | C |
| accent | #ffdca0 (vellum) | #3f8088 (water) | #ffd2bc (crystal) | |
| accent-2 | #fff1cf (vellum-hot) | #c4eadf (water-hi) | #e89a86 (crystal-deep) | |
| lamp | #ffb866 | #ffb866 | #ffb866 | |
| lamp-core | #fff1cf | #fff1cf | #fff1cf | |
| rim | #ffd2a0 | #c8eee2 | #ffc8a8 | |
| foreshadow | #a6d8cc | #f2a48c | #34486c | |
| shadow | #120804 | #040c10 | #10060b | |

### HTML text (not baked, for contrast checks)
`cream` #f3ead8 text with a dark text-shadow. Calm zones must give it >= 5.8:1 (that is why calm tokens cap at luminance 0.10).

## 3. Light, shadow, rim, glow
### Light vector
Each brief states the key light as `L = [x, y]` (unit vector pointing **toward** the light; y up is negative). Pass `L` as `edge.light`. Shadow offset: `dx = -L.x * off`, `dy = -L.y * off`. **Radial** light (b3 hall end, b4 sun, b6 lanterns, b8 convergence): `L` per sheet = normalised (source - sheet centroid).

### Per-band recipe
| band | depths | cut jitter / seg | shadow off / blur / opacity | rim width / mix | inner shadow blur / opacity | stack inset |
|---|---|---|---|---|---|---|
| bg | 0 | none | none | none | none | 6-10 (light tiers) |
| far | 1-4 | 1.2 / 30 | 4 / 6 / 0.25 | 1.5 / 0.35 | none | 4-6 |
| mid | 5-9 | 2.0 / 34 | 8 / 10 / 0.35 | 2 / 0.45 | 4 / 0.25 | 8-10 |
| hero | (mid, named in brief) | 2.5 / 36 | 12 / 14 / 0.40 | 2.5 / 0.5 | 6 / 0.30 | 10-16 |
| near | 10-13 | 3.5 / 40 | 16 / 18 / 0.45 | 3 / 0.45 | 8 / 0.35 | 12-18 |
| gate | 14-15 | 5.0 / 44 | 22 / 26 / 0.55 | 3 / 0.5 (calm side 0.25) | 10 / 0.40 | 14-20 |

- **Rim** (`edge`): colour = `mix(fill, <palette rim token>, rimMix)`; only on the side facing `L`. Far band may skip rims on sheets under 40 px.
- **Inner shadow** (`inner`): colour = palette `shadow`. Use on hero, near and gate sheets.
- **Stack** (`stack(shape, fills, inset, opts)`): `fills[0]` = outermost (darkest/away from light), each next fill one step toward the light token. Default tint step: `mix(base, light, 0.14 * i)` or the next palette ramp token. Override the stack's default shadow with the band shadow (colour = palette `shadow`, direction from `L`).
- **Glow** (`glow`): radius 3 to 6 times the source size, opacity 0.35 to 0.6, `core` = palette core token. Max 3 glows with r > 200 per composition (b6, shell and districts excepted: many small). A glow sits on its own layer when the brief says it pulses.
- **Shaft** (`shaft`): colour = palette light (mist / vellum / dapple / dawn-light / rim-paper / accent), opacity 0.12 to 0.30, never into the calm zone (clip by ending `len` before it).
- **Mist** (`mist`): opacity 0.15 to 0.30 in the hero region, <= 0.08 if any part touches the calm zone.
- **Dust** (`scatter` of 1.5 to 4 px dots or tiny triangles): palette dust/mist/firefly token, opacity 0.3 to 0.8, hero region only, own layer, `highOnly`.

## 4. Density rules (measurable, art-qa checks these)
- **D1 Layers:** 14 to 16 layers per composition (desktop and portrait counted separately), including bg and gates.
- **D2 Planes:** bg 1; far >= 3; mid >= 4 (one is the hero); atmosphere >= 2 (mist, shafts or dust); near >= 2; gates 2.
- **D3 No empty region:** slide a window of 20% canvas area (desktop 864x480, portrait 480x864) in 96 px steps over the flattened preview. Every window must show >= 3 distinct fills and visible cut edges. A window that is one flat fill fails. Calm zones pass with tone-on-tone detail.
- **D4 Detail per plane:** far >= 25 small elements (<= 60 px: pines, towers, windows, arches, stair runs; stars do not count); mid >= 15 elements (<= 200 px); near >= 8 edge details per near sheet (fronds, root tips, vines, chains, broken stones).
- **D5 Scale cues:** >= 4 pieces of tiny architecture (windows 3-14 px, stair treads 3-8 px, bridges with 6-30 px arches, towers 20-120 px) placed within 300 px of a colossal form (>= 600 px). The tiny thing must be the readable size reference.
- **D6 Stacks:** every hero form and every gate uses `stack` with 3 to 5 tiers.
- **D7 Rims:** every mid, hero, near and gate sheet has a rim on its lit side.
- **D8 Atmosphere:** each composition has >= 1 mist layer and either >= 2 shafts or a glow-lit haze, plus one dust layer.
- **D9 Silhouette:** each layer still reads when the preview is blurred 8 px. Hero is the highest-contrast form in the frame.
- **D10 No figures:** zero human/traveller shapes.

## 5. Layer template and ids
Depth 0 = farthest, 15 = nearest. Briefs give the exact ids per scene; the slots below are the default order.

| depth | slot | band | typical content |
|---|---|---|---|
| 0 | bg | bg | full-canvas opaque sheet + light tiers (+ stars) |
| 1-4 | far | far | light source, far ranges/arches, far clouds, far mist |
| 5-9 | mid | mid / hero | hero (stacked), hero glow, mid architecture, vegetation |
| 10-13 | near + atmosphere | near | shafts, near ground, dust |
| 14 | `gate-l` / `gate-t-p` | gate | aperture sheet |
| 15 | `gate-r` / `gate-b-p` | gate | aperture sheet |

- Ids kebab-case, stable. Portrait-only redraws take the suffix `-p` and replace the desktop layer of the same base id; shared layers are re-placed with `place` (move/scale).
- Background is opaque and covers the whole canvas in both compositions; every other layer is trimmed to its alpha box.
- Bleed: layers with `z >= 0.3` extend 8% past the canvas on the sides they can move toward; gates follow section 6.

## 6. Gates and exit aperture (contract with the composer)
### Gates
- **G1 Ids:** desktop `gate-l` (depth 14) and `gate-r` (depth 15). Portrait either `gate-l-p` / `gate-r-p` or `gate-t-p` / `gate-b-p`; the brief says which.
- **G2 Drawn at rest** (open, framing the scene). Each gate extends outward (bleed) far enough that when the composer slides it inward to the **closed** position its outer edge still covers the screen edge.
- **G3 Closed position:** inner edges overlap >= 80 px across the middle, no gap anywhere. Standard values (briefs may override):

| gate | rest inner edge | bleed to | closed shift |
|---|---|---|---|
| `gate-l` | x 200-340 (organic) | x -800 | dx +700 |
| `gate-r` | x 1580-1720 | x 2720 | dx -700 |
| `gate-l-p` | x 110-200 | x -560 | dx +460 |
| `gate-r-p` | x 880-970 | x 1640 | dx -460 |
| `gate-t-p` | y 160-260 | y -860 | dy +780 |
| `gate-b-p` | y 1640-1740 | y 2780 | dy -780 |

  Top/bottom of `gate-l`/`gate-r` (and left/right of `-t-p`/`-b-p`) bleed 60 px past the canvas.
- **G4 Look:** darkest tokens (`gate`, `near-dark` or equivalents), `stack` 3 tiers along the inner edge, rim on the inner edge facing `L`, inner shadow, gate band shadow. The inner edge carries >= 8 silhouette details (fronds, roots, chains, ruin fragments); no straight run over 120 px. The outer bleed part may be a flat fill (it compresses well).
- **G5 Coverage at rest:** each gate shows <= 18% of the canvas; together <= 30%.
- **G6** A gate on the calm side uses calm tokens only and rim mix 0.25.
- **G7 Motion:** slide on entry (closed -> rest over local t about -0.15 to 0.15); optional rotate +/-3 deg around the outer edge; on exit they scale past the camera with the dolly (z = 1).

### Exit aperture
- **E1** One point per composition (design px), inside a visible opening on a far/mid layer (window, arch, seam, gap). The opening's interior is the brightest local value or the next beat's foreshadow colour.
- **E2** Opening >= 40 px across at rest, inside the safe area (desktop x 240-1680, y 90-990; portrait x 90-990, y 210-1710), never in the calm zone, never covered by a gate at rest.
- **E3** The composer uses it as `groupOrigin` for the exit zoom; next beat starts with its gates closed.

## 7. Motion hints (art declares, composer implements)
Each layer row in a brief has `z` and optional motion:
- **z** (0..1) dolly/parallax depth: 0 = bg, 1 = gates. Suggested: pointer parallax = `z`, scale at exit = `1 + 3z` around the exit point.
- **sway(a, origin)**: idle rotate +/-a deg (default 0.6) around `origin` (sprite-relative, e.g. `50% 0%` for hanging, `50% 100%` for growing), period 7-10 s.
- **breathe(lo-hi)**: idle opacity loop, period 4-6 s (glows, mist).
- **drift(px)**: idle x translate +/-px, period 20-40 s (clouds, mist).
- All idle motion stops under reduced motion. `highOnly` layers drop on low quality.

## 8. Text calm zone
- **Desktop:** about 45% width on one side: left = x 0-864, right = x 1056-1920; y 160-940 unless the brief narrows it. **Portrait:** bottom 45%: y 1056-1920, full width. Districts: 40% width desktop, bottom 55% portrait (see their briefs).
- Inside the zone: only `C` tokens (luminance <= 0.10); adjacent fills differ by <= 0.05 luminance (tone-on-tone); no glows, no shafts, no dust, no warm light; stars at opacity <= 0.5; rims at mix 0.25.
- **Calm is not empty:** the zone still passes D3 with tone-on-tone detail (receding arcades, strata, tiny dark windows, pine rows, roots), at least 3 fills.
- The beat text is a portfolio section (name, About, Education, Experience x2, Projects, Skills, Awards, Leadership, Contact for b0..b9). Art never illustrates it.

## 9. Toolkit map (`art/lib`, signatures in `art/lib/index.ts`)
| helper | use for |
|---|---|
| `sheet` (+ `holes`, `shadow`, `edge`, `inner`) | every paper piece |
| `stack` | hero forms, gates, light tiers in bg, moon/sun discs |
| `glow` | light sources (one per source) |
| `shaft` | light rays from moon/sun/canopy/window/seam |
| `mist` | haze bands |
| `scatter` | dust, stars, fireflies, embers, far lantern dots, pine/fern placement |
| `ridge`, `hills` | ranges, ground lines |
| `strata` | layered rock bands on cliffs, terraces, mountain faces |
| `pine` | conifer silhouettes at every depth (replaces `tree` outdoors) |
| `tree` | broadleaf only inside (b4 terraces); never as the main vegetation |
| `fern`, `vine`, `roots` | edge detail on near sheets and gates, hanging growth |
| `column`, `arch`, `ruinWall` | colonnades, arcades, broken walls |
| `bridge`, `tower`, `stairs` | scale cues and mid architecture |
| `stalactites` | cavern ceilings (b3, b6, p-hardware) |
| `lantern` | b6, districts, b9; small warm points |
| `crystal` | p-hardware, sparse accents in b6 ceiling |
| `cloud` | b0, b1, shell, b7 cloud banks |
| `flock` | far bird/moth flocks as tiny specks (outside beats and b7 only), never a human |
| `cut`, `union`, `difference`, `offset` | shape building |

## 10. Creatures
Rendered as horizontal sprite strips (`public/art/creatures/<name>/sheet.webp` + `manifest.json` with `{ src, frame:{w,h}, frames:[names], anchor:[x,y], bytes }`, same format as now). Placement per beat is in the beat brief (display rect in design px). Every creature: stacked-sheet body (3 tiers), cut-hole pattern, rim on the side facing the beat light, inner shadow, baked soft shadow (palette `shadow`, offset 10, blur 14, opacity 0.35). Strip <= 4096 px wide and <= 4.2 MP; quality 70.

| creature | beat | palette | frame w x h (bake scale) | poses (frame order) | build |
|---|---|---|---|---|---|
| owl-moth | b0 | night | 360x240 (1.0) | wings-up, wings-mid, wings-down, glide | Wingspan 320. Wings `stack` 3 tiers: moon, moon-shade, mist. Two eye-spot ring holes per forewing (concentric rings), vein slits 3 px fanning from the body, feathered trailing edge (scallops 10-14 px). Body mountain-shade with rim-cool. One eye hole. Anchor body centre. <= 40 KB. |
| heron | b4 | hall | 720x1000 (1.0) | stand, bow, wing-lift | Height 960. Body vault-near, `stack` 3 (vault-near, vault-mid-2, vault-mid) on body and wing; wing feathers as rows of chevron slit holes (6-10 px) showing vellum behind; neck S-curve 30-40 px thick; legs two sheets 10-14 px with knee joints; rim-warm toward the sun (from the left of the sprite when placed right of the sun). Eye hole 8 px. Anchor feet. <= 70 KB. |
| stag | b5 | understory | 900x780 (1.0) | head-up, head-turn, head-low | Height 760 incl. antlers. Body trunk with `stack` 3 (trunk-dark, trunk, leaf-near). Antlers are a branching canopy 800 wide: branch sheets trunk, leaf clusters leaf-mid/leaf-near `stack` 2 with leaf-shaped holes (dapples). Moss patches stone-dark on shoulders, rim-green on top edges. Eye hole. Anchor hooves. <= 80 KB. |
| jellyfish | b6 | lantern | 420x780 (1.0) | open, mid, closed, drift | Bell 360 wide: `stack` 3 (lantern-deep, lantern-body, lantern-hot), punched pattern of overlapping-circle holes (6-8 px cells) over the upper bell, scalloped rim. 6 tentacle strings (chain colour) each with 4-6 tiny lanterns (r 6-12). Baked inner glow r 1.2x bell, lamp, opacity 0.35. Anchor bell top centre. <= 60 KB. |
| whale | b7 | dawnfold | 1560x620 (0.8 -> 1248x496 raster) | tail-up, level, tail-down | Length 1500. Origami: 8 to 12 facet sheets in whale-paper / whale-shade / whale-deep, facets meet on fold lines marked by 3 px slit holes; back has a starry cut pattern (small diamond holes) showing the sky; pectoral fin as a separate folded facet; rim-dawn on upper edges. Eye hole 12 px. Anchor body centre. <= 90 KB. |

The old traveller sprite is retired (decisions b). Do not bake or reference it.

## 11. Fork door (projects-lane entry)
Baked once, in `b5-understory`, as layers `fork-door` and `fork-glow` (see that brief). Arched paper flap 96x160 (portrait 90x150), fill = local near colour (`leaf-near`), opening sheet `door-light`, flap folded open ~30 deg showing its `stone-dark` reverse, rim-green, glow lamp r 150 opacity 0.5. The composer places a real `<button>` over its rect.

## 12. Paper frame
Screen-edge frame of 3 to 4 nested torn-edge sheets, always on screen, tinted per beat. Baked as alpha masks; full spec and tint table in `agents/art-beats/frame.md`.

## 13. Budget and caps
- **Bytes:** about 450 KB per beat for both compositions together. `b0 + b1 + owl-moth` under 400 KB. Frame under 60 KB total. Creature caps in section 10.
- **Bake settings (default per band):**

| band | scale | quality |
|---|---|---|
| bg (flat + tiers) | 0.5 (0.75 if it carries stars) | 50 |
| far | 0.75 | 55 |
| mid / hero | 1.0 | 65 |
| atmosphere (glow, shaft, mist, dust) | 0.5 | 45 |
| near | 0.75 | 60 |
| gates | 0.75 | 55 |

- **Caps:** no single sprite raster over 4096 px on a side or 4.2 MP; decoded raster (sum of `w*h*scale^2`) per composition <= 12 MP.
- Reuse sprites between compositions with `place` wherever the shape fits; redraw `-p` only where the layout differs.

## 14. Beat index
| slug | palette | section text | desktop text side | hero effect (only one) | exit aperture leads to |
|---|---|---|---|---|---|
| b0-outside | night | name | left | mist parts, the single window ignites | the window (b1) |
| b1-approach | night | About | left | crease lines surface on the face | the seam (b2) |
| b2-first-fold | fold | Education | left | the face unfolds, seam light floods | the warm core (b3) |
| b3-scale-flip | hall | Experience | right | deep axial dolly down the hall | far bright end (b4) |
| b4-inner-sun | hall | Experience | left | sun ray rings counter-rotate | green arch (b5) |
| b5-understory | understory | Projects (+ fork door) | right | second curtain pair parts | dark arch with lanterns (b6) |
| b6-lantern-vault | lantern | Skills | left | lanterns ignite in a depth wave | dawn arch (b7) |
| b7-second-fold | dawnfold | Awards | right | the inner mountain unfolds to dawn | dawn seam (b8) |
| b8-seam | paper | Leadership | left | pull-back through nested folds | mini window (b9) |
| b9-window | paper + night | Contact | left | window light breathes, night parallax | (end) |
| shell | reverse | projects intro | right | windows light cluster by cluster | web cluster (p-web) |
| p-web | district amber | web projects cards | right card | light-well bloom | teal arch (p-data) |
| p-data | district teal | data/ML cards | left card | water reflection shimmer | ember arch (p-hardware) |
| p-hardware | district ember | hardware cards | right card | crystal pulse sequence | night arch (lane end) |

## 15. QA checklist
1. D1-D10 pass in both compositions (section 4).
2. Every fill is a token of the beat's palette or a same-palette `mix`.
3. Calm zone: only `C` tokens, tone-on-tone, no glow/shaft/dust; cream contrast >= 5.8:1 against every fill in it.
4. Gates: ids, rest edges, bleed and closed shift as in the brief; closed state leaves no gap (check by compositing with the shift applied).
5. Exit aperture point lies inside an open, light opening in both compositions.
6. Hero form uses `stack` 3-5 tiers; rims on the lit side everywhere; shadows follow `L`.
7. No gradients inside sheets, no outlines, no text, no human figures.
8. Background opaque full canvas; portrait is recomposed, not cropped.
9. Bytes and raster caps (section 13).
10. Re-running the bake changes no bytes.
