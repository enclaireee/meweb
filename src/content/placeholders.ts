/**
 * Single source of truth for every image slot on the site.
 * <Placeholder id="..."> renders from this registry, and PLACEHOLDERS.md is
 * derived from it — add or change a slot here and both stay honest.
 */
export interface PlaceholderSpec {
  id: string;
  section: string;
  purpose: string;
  subject: string;
  width: number;
  height: number;
  ratio: string;
  format: string;
  notes: string;
}

export const placeholders: Record<string, PlaceholderSpec> = {
  "hero-portrait": {
    id: "hero-portrait",
    section: "Hero",
    purpose: "Primary portrait anchoring the hero composition",
    subject:
      "Portrait of Fatih — candid, looking off-frame, natural light; works in duotone/high contrast",
    width: 1280,
    height: 1600,
    ratio: "4:5",
    format: "JPG (or WebP)",
    notes: "Supply @2x (2560×3200). Busy backgrounds avoided — image sits on paper texture. Max ~350KB.",
  },
  "about-candid": {
    id: "about-candid",
    section: "About",
    purpose: "Secondary candid shot beside the about narrative",
    subject: "Fatih working — lab bench, soldering, or whiteboard session; environmental, not posed",
    width: 1200,
    height: 900,
    ratio: "4:3",
    format: "JPG (or WebP)",
    notes: "Parallax-drifts on scroll; keep subject centered with breathing room on all edges. @2x preferred.",
  },
  "project-neuro": {
    id: "project-neuro",
    section: "Selected work — Refocus",
    purpose: "Hero visual for the BCI neurofeedback project",
    subject:
      "EEG headset on a desk next to the running game, or a screen capture of the Godot space shooter with the live attention readout",
    width: 1600,
    height: 1200,
    ratio: "4:3",
    format: "JPG / WebP; MP4 loop welcome",
    notes: "A short (<8s, muted, looping) screen-capture video would outperform a still here. Max ~4MB for video.",
  },
  "project-komat": {
    id: "project-komat",
    section: "Selected work — KOMAT UNPAR 2025",
    purpose: "Hero visual for the competition platform",
    subject: "Full-page screenshot or device mockup of the live KOMAT UNPAR site (home or dashboard)",
    width: 1600,
    height: 1200,
    ratio: "4:3",
    format: "PNG or WebP",
    notes: "Crisp UI screenshot — export at @2x, no browser chrome unless framed deliberately.",
  },
  "project-solar": {
    id: "project-solar",
    section: "Selected work — Sunmeter",
    purpose: "Hero visual for the solar monitoring build",
    subject: "The physical rig: panel, Arduino, OLED showing live efficiency numbers — honest workbench shot",
    width: 1600,
    height: 1200,
    ratio: "4:3",
    format: "JPG / WebP",
    notes: "Detail/macro shot of the OLED readout is a strong alternative. Warm light suits the palette.",
  },
  "about-strip": {
    id: "about-strip",
    section: "About — atmospheric divider",
    purpose: "Wide calm strip between the narrative and the record timeline",
    subject: "Wide crop: campus, lab, or desk setup — low detail, atmospheric",
    width: 2400,
    height: 800,
    ratio: "3:1",
    format: "JPG / WebP",
    notes: "Full-bleed divider; needs to read at low contrast in both themes. Heavily compressible; max ~250KB.",
  },
};
