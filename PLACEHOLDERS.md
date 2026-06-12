# Image placeholder manifest

Every image slot on the site is a `<Placeholder id="…">` component driven by
the registry in [src/content/placeholders.ts](src/content/placeholders.ts).
To swap in a real asset: drop the file in `public/`, then replace the
`<Placeholder>` with a `next/image` `<Image>` at the same spot (the wrapper
`<ImageReveal>` keeps the animation; aspect ratio is set by the parent).

| # | Section / location | Purpose | Suggested subject | Dimensions (px) | Aspect ratio | Format | Notes |
|---|---|---|---|---|---|---|---|
| 1 | Home hero — right column (`hero-portrait`) | Primary portrait anchoring the hero composition | Candid portrait of Fatih, looking off-frame, natural light; survives high-contrast treatment | 1280 × 1600 | 4:5 | JPG / WebP | Supply @2x (2560×3200). Sits on paper texture — avoid busy backgrounds. Max ~350 KB |
| 2 | About — sticky figure beside narrative (`about-candid`) | Environmental shot pinned beside the dossier narrative | Fatih working: lab bench, soldering, or whiteboard; environmental, not posed | 1200 × 900 | 4:3 | JPG / WebP | Sticky + parallax — keep subject centered with breathing room on all edges. @2x preferred |
| 3 | Work — Refocus (`project-neuro`) | Hover preview on /work, hero media on its case page, home shelf panel | EEG headset beside the running game, or a Godot screen capture with the live attention readout | 1600 × 1200 | 4:3 | JPG / WebP, or muted MP4 loop | A short (<8 s, muted, looping) screen capture would outperform a still. Max ~4 MB if video |
| 4 | Work — KOMAT UNPAR (`project-komat`) | Hover preview on /work, hero media on its case page, home shelf panel | Full-page screenshot or device mockup of the live KOMAT UNPAR site (home or admin dashboard) | 1600 × 1200 | 4:3 | PNG / WebP | Crisp UI export at @2x; no browser chrome unless framed deliberately |
| 5 | Work — Sunmeter (`project-solar`) | Hover preview on /work, hero media on its case page, home shelf panel | The physical rig: panel, Arduino, OLED showing live efficiency numbers — honest workbench shot | 1600 × 1200 | 4:3 | JPG / WebP | A macro shot of the OLED readout is a strong alternative; warm light suits the palette |
| 6 | About — atmospheric divider (`about-strip`) | Wide calm strip between the narrative and the record timeline | Wide crop of campus, lab, or desk setup — low detail, atmospheric | 2400 × 800 | 3:1 | JPG / WebP | Full-bleed divider; must read at low contrast in **both themes**. Heavily compressible — max ~250 KB |

Project images (#3–5) are each used in three places at different crops:
the /work hover preview (~320px wide), the case-page hero (full-bleed 2:1
center-crop), and the home shelf (4:3). Supply at the listed size and the
crops take care of themselves.

The Contact page is deliberately image-free (typographic concept); the 404
uses no imagery either.

**Total: 6 placeholders** (5 stills required; #3 optionally a video loop).
