# Concept: Paper River

> A night river, cut from paper, seen through a frame on the wall. You sit still. The world drifts by.

Portfolio of **Muhammad Fatih Zamzami**, Electrical Engineering undergraduate at Universitas Indonesia. This is a fresh design (v4). Nothing is carried over from earlier versions. Read `README.md` for the document map.

## The experience in sixty seconds
1. A dark wall. A paper **shadowbox** hangs fixed on it, its layered paper rings catching a little light. Through the opening: a moonlit volcano far off, mist, jungle hills, a river. A small paper **traveller** sits in a boat with a lantern at the bow. Fireflies drift at several depths.
2. The frame never moves and the camera never moves. You press next (button, arrow key, swipe, or one wheel flick). The **whole world glides sideways**, every layer at its own speed, so the near leaves sweep past while the volcano barely shifts. The traveller poles on the spot, the water slides under him.
3. The world settles at a **stop**. A paper **tag** hangs from a post, swaying: the title of a thing Fatih built, a date, one line, a picture slot. Open it and a full paper **card** slips in with the detail.
4. Eight stops from the river's spring to a lighthouse at the sea. The sky goes from dusk, through deep night, to first light.

## Why this idea
- It matches the brief: "sit and watch a scene in a frame, the scenes move and you don't".
- Paper-cut art is strongest as **flat layers with soft shadows**, which is also the cheapest thing to render on the web. No 3D engine.
- One coherent world, so the site feels like a place and not a slideshow.
- Warm lights in a cold night give a clear light motif: moon, lanterns, fireflies, the lighthouse.

## Principles
1. **One frame, one world.** Frame is fixed. World moves. Never both.
2. **Flat sheets, real depth.** Every sheet is one colour. Depth comes from layering, parallax, haze, shadow and blur, never from fake 3D.
3. **Calm over clever.** Slow glides, soft easing, nothing snaps. The mood is a quiet night.
4. **Light is the story.** The warm light sources lead the eye to what matters.
5. **Readable first.** All text is real HTML. The page works with JavaScript off and with motion reduced.
6. **Light to carry.** Mostly CSS and SVG. Almost no JavaScript beyond state and input.
7. **Craft is the product.** The audience is the craft/design community. Edges, shadows, details and timing must be good enough to be admired.

## Audience
Primary: design and creative-dev community (Awwwards-style bar). Secondary: recruiters and teams who need to find roles, projects and contact fast. Both are served from the same page: the world is the draw, the tags and cards are the content.

## What it is not
- Not 3D. Not a walkable world. Not scroll-hijacked long-form. Not a theatre (that idea was dropped). Not a literal illustration of each project: the places are atmosphere, and the content hangs in them.

## Fixed decisions (summary)
Full log with reasons in `decisions.md`.

| Topic | Decision |
|---|---|
| Frame | Fixed paper shadowbox (layered rings, grain, inner depth shadow) |
| Movement | Sliding panorama, world moves, step-based |
| World | One tropical (Southeast Asian) night river, spring to sea, dusk to first light |
| Stops | 8, see `world.md` |
| Art | Flat layered SVG paper-cut, coded by Claude, art-directed by the user |
| Depth | 13 art layers plus 3 water strips, 3 firefly depths, see `depth-system.md` |
| Character | A small paper traveller in a boat, mostly silent, see `traveller.md` |
| Content | Short hung tag in the world, full paper card on open, see `ui-components.md` |
| Mood | Warm night, one moon, glowing lanterns and fireflies |
| Voice | Warm and wry, short, see `content.md` |
| Contact | Email, LinkedIn, CV download |
| Media | Image slot per project, filled later |
| Tech | Next.js 16 App Router, CSS and SVG, no three.js, see `tech-architecture.md` |
