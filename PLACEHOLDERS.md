# Image placeholder manifest

Every image slot on the site is a `<Placeholder id="…">` component driven by
the registry in [src/content/placeholders.ts](src/content/placeholders.ts).
To swap in a real asset: drop the file in `public/`, then replace the
`<Placeholder>` with a `next/image` `<Image>` at the same spot (the wrapper
`<ImageReveal>` keeps the animation; aspect ratio is set by the parent).

| # | Section / location | Purpose | Suggested subject | Dimensions (px) | Aspect ratio | Format | Notes |
|---|---|---|---|---|---|---|---|
| 1 | Hero — right column (`hero-portrait`) | Primary portrait anchoring the hero composition | Candid portrait of Fatih, looking off-frame, natural light; survives high-contrast treatment | 1280 × 1600 | 4:5 | JPG / WebP | Supply @2x (2560×3200). Sits on paper texture — avoid busy backgrounds. Max ~350 KB |
| 2 | About — beside narrative (`about-candid`) | Secondary candid shot next to the about paragraphs | Fatih working: lab bench, soldering, or whiteboard; environmental, not posed | 1200 × 900 | 4:3 | JPG / WebP | Parallax-drifts on scroll — keep subject centered with breathing room on all edges. @2x preferred |
| 3 | Selected work — Refocus panel (`project-neuro`) | Hero visual for the BCI neurofeedback project | EEG headset beside the running game, or a Godot screen capture with the live attention readout | 1600 × 1200 | 4:3 | JPG / WebP, or muted MP4 loop | A short (<8 s, muted, looping) screen capture would outperform a still. Max ~4 MB if video |
| 4 | Selected work — KOMAT panel (`project-komat`) | Hero visual for the competition platform | Full-page screenshot or device mockup of the live KOMAT UNPAR site (home or admin dashboard) | 1600 × 1200 | 4:3 | PNG / WebP | Crisp UI export at @2x; no browser chrome unless framed deliberately |
| 5 | Selected work — Sunmeter panel (`project-solar`) | Hero visual for the solar monitoring build | The physical rig: panel, Arduino, OLED showing live efficiency numbers — honest workbench shot | 1600 × 1200 | 4:3 | JPG / WebP | A macro shot of the OLED readout is a strong alternative; warm light suits the palette |
| 6 | Contact / footer strip (`contact-strip`) | Wide atmospheric strip above the footer | Wide crop of campus, lab, or desk setup — low detail, calm | 2400 × 800 | 3:1 | JPG / WebP | Sits near oversized type; needs a low-contrast area. Heavily compressible — max ~250 KB |

**Total: 6 placeholders** (5 stills required; #3 optionally a video loop).
