'use client';
// b0: the mountain outside, at night. Choreography comes from ../transitions (dolly toward the window,
// dive into it at the end). Hero: the mist drifts apart and the one warm window ignites.
// Text: the name set huge behind the far ridge (the ridge and mist pass over it), a map label by the window.
import type { BeatDef, Comp, LayerDef } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b0-outside/manifest.json';
import owlMoth from '../../../public/art/creatures/owl-moth/manifest.json';
import { Creature } from '../Creature';
import { useT } from '../lang';
import { onLayer, world } from '../transitions';

const SCREENS = 2;
const moth = <Creature sheet={owlMoth} ms={700} />;
const s = scenes.b0;

const name = (
  <div aria-hidden className="@container flex h-full flex-col justify-end text-[#ece4d2]">
    <p className="pl-[1.2cqw] text-[2.3cqw] tracking-[0.55em] uppercase opacity-80">{s.first}</p>
    <p className="font-display text-[21cqw] leading-[0.78] tracking-[-0.01em] uppercase">{s.last}</p>
  </div>
);
function Label() {
  const t = useT();
  return (
    <div aria-hidden className="@container beat-text flex h-full items-center gap-[3cqw] text-[#f6e7c8]">
      <span className="h-px w-[7cqw] shrink-0 bg-current opacity-70" />
      <span className="size-[2.6cqw] shrink-0 rounded-full border border-current" />
      <span className="text-[5.8cqw] leading-[1.35] tracking-[0.16em] uppercase">{t(s.label)}</span>
    </div>
  );
}
const label = <Label />;

const extra: Record<string, LayerDef> = {
  'window-glow': { track: [{ at: 0.05, opacity: 0.1 }, { at: 0.5, opacity: 1, ease: 'inOut' }] },
  'mist-far': { track: [{ at: 0, x: 0, opacity: 1 }, { at: 0.6, x: -220, opacity: 0.35, ease: 'inOut' }] },
  dust: { highOnly: true },
  'dust-p': { highOnly: true },
};
const comp = (c: Comp, focus: [number, number]) => world(manifest, c, SCREENS, { focus, first: true, extra });
const desktop = comp('desktop', [1262, 560]);
const portrait = comp('portrait', [556, 830]);
// Name is there on arrival and sinks away before the dive; the label lights with the window.
const nameT = [{ at: 0, opacity: 1 }, { at: 0.42, opacity: 1 }, { at: 0.6, opacity: 0, ease: 'in' as const }];
const labelT = [{ at: 0.12, opacity: 0 }, { at: 0.3, opacity: 1, ease: 'out' as const }, { at: 0.48, opacity: 1 }, { at: 0.58, opacity: 0 }];

export const b0Outside: BeatDef = {
  slug: 'b0-outside',
  screens: SCREENS,
  manifest,
  desktop: {
    ...desktop,
    split: 'range-far',
    overlays: [
      onLayer(desktop, 'range-far', { x: 500, y: 70, w: 860, h: 330 }, name, { behind: true, track: nameT }),
      onLayer(desktop, 'window-glow', { x: 1278, y: 470, w: 390, h: 170 }, label, { track: labelT }),
      { node: moth, rect: { x: 1250, y: 180, w: 300, h: 200 }, parallax: 0.2, track: [{ at: 0, x: 0, y: 0 }, { at: 0.9, x: 510, y: 120 }] },
    ],
  },
  portrait: {
    ...portrait,
    split: 'range-far-p',
    overlays: [
      onLayer(portrait, 'range-far-p', { x: 40, y: 420, w: 1000, h: 400 }, name, { behind: true, track: nameT }),
      onLayer(portrait, 'window-glow', { x: 600, y: 800, w: 460, h: 90 }, label, { track: labelT }),
      { node: moth, rect: { x: 600, y: 250, w: 260, h: 173 }, parallax: 0.2, track: [{ at: 0, x: 0, y: 0 }, { at: 0.9, x: 380, y: 110 }] },
    ],
  },
};
