# World: one river, one night

The whole site is a single place: a river in the tropics, from a spring under a volcano to a lighthouse at the sea. One night passes along it, from dusk to first light. The world is **atmosphere**, not an illustration of the projects. Content hangs in it on tags.

## Geography (upstream to downstream)
Upstream is the left side of the journey, downstream the right. The traveller drifts downstream, so the world slides **right to left** as you advance.

| Stop | Place | Time | Content hung here |
|---|---|---|---|
| 0 | **The Spring** | Dusk | Intro |
| 1 | **The Terraces** | Early night | DemandX |
| 2 | **The Gorge** | Deep night | OT Observability Lab |
| 3 | **The Still Pond** | Midnight | Refocus |
| 4 | **The Mangroves** | Late night | KOMAT UNPAR 2025 |
| 5 | **The Estuary** | Pre-dawn | Solar-powered lighting |
| 6 | **The Stilt Village** | Dawn | Roles, skills, awards |
| 7 | **The Lighthouse** | First light | Contact |

Order logic: the newest and strongest work comes first. Refocus (with awards) sits mid-river where the world is most magical. The solar project sits at pre-dawn, because it is about light arriving. The roles and skills live in the village, the contact in the lighthouse: the last light before the sea.

## The night's arc
- **Dusk (0):** teal sky with a thin warm band at the horizon. Lanterns just lit. Few fireflies. Moon pale and low.
- **Early night (1):** sky darkens. Fireflies appear. Moon rises and brightens.
- **Deep night (2) and midnight (3):** darkest sky. Moon highest and brightest. Most fireflies, strongest lantern glow.
- **Late night (4):** still dark, mist thickens in the mangroves.
- **Pre-dawn (5):** horizon pales to blue with a hint of rose. Moon low and fading. Lanterns look smaller against the sky. Fireflies thin out.
- **Dawn (6):** soft blue sky, rose and gold at the horizon. Village windows glow warm. Fireflies gone.
- **First light (7):** pale sky, gold on the water, the moon a faint disc. The lighthouse lamp is still on, a deliberate last warm point.

Mechanically this is a long, slow sky strip (layer 00) with a horizontal gradient, plus a few tint shifts on the haze layers. See `layers.md`. Exact colours per stop are in `design-tokens.md`.

## Light
- **One key light: the moon**, upper left of the frame. Every shadow falls down and slightly right (direction `(0.5, 1)`), at every stop, always. See `art-direction.md`.
- **Warm sources:** lanterns, village windows, the lighthouse lamp, the traveller's lantern. They glow amber and tint the haze and water around them.
- **Fireflies:** small yellow-green lights at three depths.
- Nothing is lit by two sources at once. Warm glow is additive light on top of the cool moonlit world.

## Recurring motifs
- **Lanterns** (round or hexagonal paper lanterns with punched patterns). Every stop has at least one. They hang from the posts that carry the tags.
- **Punched patterns** on lantern shades and post tops, loosely echoing batik geometry (a repeating circle-and-quatrefoil, similar to kawung). Cut as holes so the lantern light shines through. Never drawn as lines.
- **Fireflies** drifting at three depths.
- **The moon** over the left of the frame.
- **Mist** between layers.
- **Birds and bats** crossing occasionally (see ambient life).

## The stops in detail

Each stop lists the **midground environment** (layer 07), the **far bank** (layer 08), the **action layer** (layer 09, the plane the boat is in, where the tag post stands), and the **near layers** (10 to 12). The far sky and hills (layers 00 to 06) change slowly along the journey and are described under "Far layers" below.

### Stop 0: The Spring (dusk)
- Midground: a rocky spring pool fed by a trickle from the hillside, moss-covered boulders, a few tall ferns. A path of stepping stones leads off into the dark.
- Far bank: reeds and a small bamboo grove, a tiny shrine with a lit lantern.
- Action: the boat's mooring post at the water's edge with a rope coil. The tag post: a tall bamboo pole with a hooked top, a hexagonal lantern with a punched pattern, the tag hanging below.
- Near: broad leaves (taro or banana) along the bottom edge.
- Ambient: a gecko on a boulder that turns its head. Two or three fireflies only. Warm lantern glow on the water.
- Hidden: a very small paper crane tucked behind the shrine.

### Stop 1: The Terraces (early night)
- Midground: rice terraces stepping down a hillside, each step a curved sheet, water in the flooded plots catching moon highlights. A small field hut on stilts.
- Far bank: terraces continue, a line of coconut palms in silhouette, a farm light.
- Action: a bamboo gantry (two posts and a crossbar) in the shallows with crates stacked on it, lanterns hanging. The tag hangs from the crossbar.
- Near: grasses and a half-submerged water buffalo silhouette very dark and still.
- Ambient: fireflies appear in the paddies. A heron stands in a flooded plot.
- Hidden: a scarecrow with a lit pocket lantern.

### Stop 2: The Gorge (deep night)
- Midground: tall dark jungle on both sides, vines, tree ferns, a few lit orchids. The river narrows. A bamboo aqueduct crosses high above the river carrying water from slope to slope.
- Far bank: rock wall with roots, a waterfall as a pale layered sheet.
- Action: a stone bridge pier with a big wooden valve wheel on a bamboo pipe (a quiet nod to flow and monitoring). The tag hangs from the pipe's elbow.
- Near: heavy vines, large leaves with visible veins cut as holes.
- Ambient: bats cross the moon. Fireflies cluster in the vines. Mist rises at the base.
- Hidden: a tiny gauge dial with a needle that twitches when hovered.

### Stop 3: The Still Pond (midnight)
- Midground: the river widens into a mirror pond. A big old tree on the bank with branches that fork like a neuron. Lily pads. Moon reflection on the water.
- Far bank: low hills mirrored in the water, a lone lit window of a distant hut.
- Action: a tall tree trunk planted in the shallows, a strong horizontal branch. The tag hangs from the branch. Concentric ripples spread slowly from a drop.
- Near: arching reeds, lotus buds.
- Ambient: the most fireflies in the journey. They slowly drift into sync and pulse together, then scatter. A kingfisher sits on a reed.
- Hidden: a small paper boat floating in the distance with its own lantern.

### Stop 4: The Mangroves (late night)
- Midground: a maze of arching mangrove roots whose curves repeat in a pleasing, almost mathematical rhythm. Mudflats with tiny crab silhouettes.
- Far bank: more mangrove canopy, a dark channel opening into the distance.
- Action: a root arch spanning the water. The tag hangs from the top of the arch on two strings. A nautilus shell sits on a root.
- Near: root tangles in near-black with cut gaps showing the lit water behind.
- Ambient: mist thicker. Fireflies fewer, larger. A mudskipper hops.
- Hidden: the shell's spiral is a perfect growth spiral. Hovering it makes a firefly settle on it.

### Stop 5: The Estuary (pre-dawn)
- Midground: the banks open out and fall away. Sandbars. A fishing pier extends into the water. The horizon becomes visible as a thin pale line, the first time the sky and water meet.
- Far bank: a low far shore with palm silhouettes.
- Action: a pier post with a small paper solar panel on a hinge-arm and an LED lantern on it, still lit. The tag hangs from the post.
- Near: beach grass, a stranded driftwood log.
- Ambient: the sky is visibly paler on the right. Lanterns look dimmer against it. Seabirds begin to cross. The hinged panel tilts a few degrees toward the horizon and the LED slowly fades as the light grows.
- Hidden: the LED actually dims when this stop's sky is the brightest part of the sky strip.

### Stop 6: The Stilt Village (dawn)
- Midground: a fishing village on stilts over the water. Several small houses, ladders, drying nets, boats moored. Windows glow warm.
- Far bank: the shoreline with more houses, a mosque or temple roofline kept generic and respectful, smoke from a morning kitchen.
- Action: a wooden dock with a post. The tag hangs from a boat's mast. A rack of conical hats hangs on a pole (nod to the roles).
- Near: nets, buoys, a bucket, a cat on a barrel.
- Ambient: windows light one by one as you arrive. A rooster crows silently (no sound): a paper rooster tilts its head. Smoke curls.
- Hidden: six windows are lit in a row: one per role in the roles card.

### Stop 7: The Lighthouse (first light)
- Midground: the open sea, a rocky point with a lighthouse. The river's mouth is behind the traveller.
- Far bank: none. The sea horizon is clear, the sun has not risen but the sky is gold at the edge.
- Action: the lighthouse's base dock, with a tall post and a final big lantern. The tag hangs from it. The lamp at the lighthouse top is still on, its beam a soft warm wedge.
- Near: rocks, sea spray as cut-paper foam, tide pools.
- Ambient: the beam sweeps slowly. Gulls cross. The traveller's lantern is turned down low.
- Hidden: the traveller waves at the lighthouse keeper's lit window.

## Far layers (continuous along the journey)
- **Sky (00):** the dusk-to-dawn gradient strip, with a few stars cut as tiny holes that fade near dawn.
- **Moon (01):** the moon starts upper-left and sinks slightly through the night, ending low and faint. Two thin cloud strips drift in front of it.
- **Volcano (02):** visible clearly at stops 0 to 2, dwindling behind the hills by stop 3, gone by stop 4. It never reappears. Another, smaller peak range replaces it on the far horizon until the estuary.
- **Haze (03, 06):** mist bands, always present, thicker in the gorge and mangroves, thin in the estuary.
- **Hills (04) and ridge (05):** change character per stop to match the environment: terraced slopes, jungle ridges, pond hills, mangrove canopy line, low shore, village roofline.

## Ambient life summary (optional, add after the core is solid)
Gecko (0), heron (1), bats (2), kingfisher (3), mudskipper (4), seabirds (5), cat and rooster (6), gulls (7). Each is a small rig of 2 to 4 pieces, idle only, triggered when the stop is reached.

## Weather
Clear sky, mist only. No rain, no thunder: they would fight the calm mood and cost motion.

## Sound
None. Out of scope.
