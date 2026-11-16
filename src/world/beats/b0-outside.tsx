'use client';
// b0: the mountain outside, at night. Choreography comes from ../transitions (dolly toward the window,
// dive into it at the end). Hero: the mist drifts apart and the one warm window ignites.
// Text: the name set huge behind the far ridge (the ridge and mist pass over it), a map label by the window.
// Opening (intro, 2.3 s): dark stage, the moon rises in, the sheets settle front to back, the name settles behind the
// ridge, then the label and one soft pulse of the window light. Idle: stars twinkle, the mist drifts, the window flickers.
import type { CSSProperties } from 'react';
import type { BeatDef, Comp, LayerDef, Track } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b0-outside/manifest.json';
import owlMoth from '../../../public/art/creatures/owl-moth/manifest.json';
import { Particles } from '../Ambient';
import { Creature } from '../Creature';
import { useT } from '../lang';
import { onLayer, world } from '../transitions';

const SCREENS = 1.5;
const INTRO_MS = 2300;
const moth = <Creature sheet={owlMoth} ms={700} />;
const s = scenes.b0;

// "Fatih" is the hero word; "Muhammad" and "Zamzami" are small kickers above it and below its right end
// (the -mr cancels the trailing letter-spacing so the last letter lines up with the H).
// Portrait gets bigger kickers (in cqw) because its container renders far narrower on a phone.
const kicker = 'tracking-[0.5em] uppercase opacity-90 [text-shadow:0_1px_6px_rgb(0_0_0/0.7)]';
const nameNode = (k: string, big: string) => (
  <div aria-hidden className="@container flex h-full flex-col justify-end text-[#ece4d2]">
    <div className="flex w-fit flex-col">
      <p className={`pl-[0.4cqw] ${k} ${kicker}`}>{s.first}</p>
      <p className={`font-display ${big} leading-[0.8] tracking-[0.01em] uppercase`}>{s.given}</p>
      <p className={`self-end -mr-[0.5em] ${k} ${kicker}`}>{s.last}</p>
    </div>
  </div>
);
const name = nameNode('text-[2.4cqw] my-[0.6cqw]', 'text-[28cqw]');
const nameP = nameNode('text-[4.6cqw] my-[1.2cqw]', 'text-[31cqw]');
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

// ---- opening sequence: intro progress u = elapsed / INTRO_MS ----
const settle = (a: number, y: number, x = 0, d = 0.2): Track => [
  { at: a, x, y, scale: 1.02, opacity: 0 },
  { at: a + d, x: 0, y: 0, scale: 1, opacity: 1, ease: 'out' },
];
const fade = (a: number, b: number, y = 0): Track => [{ at: a, y, opacity: 0 }, { at: b, y: 0, opacity: 1, ease: 'out' }];
// Front to back, one after another. '-p' ids are the portrait twins.
const SHEETS = ['gate-l', 'gate-r', 'near-hill', 'forest-mid', 'shafts', 'valley', 'mountain', 'mist-far', 'mountain-back', 'range-mid', 'range-far', 'clouds-far'];
const NO_P = new Set(['gate-l', 'gate-r', 'mist-far', 'mountain', 'mountain-back', 'moon', 'window-glow']);
const introFor = (c: Comp): Record<string, LayerDef> => {
  const id = (n: string) => (c === 'portrait' && !NO_P.has(n) ? `${n}-p` : n);
  const out: Record<string, LayerDef> = {};
  SHEETS.forEach((n, i) => {
    const gate = n.startsWith('gate');
    out[id(n)] = { intro: settle(0.18 + i * 0.04, gate ? 0 : 36, gate ? (n === 'gate-l' ? -160 : 160) : 0) };
  });
  out[id('sky')] = { intro: fade(0, 0.22) };
  out[id('moon')] = { intro: [{ at: 0.04, y: 70, opacity: 0 }, { at: 0.4, y: 0, opacity: 1, ease: 'out' }] };
  return out;
};
// The window light is lit from the first frame, then pulses once as the label arrives (scroll and intro).
const glowT: Track = [
  { at: 0, opacity: 0.88, scale: 1 },
  { at: 0.06, opacity: 1, scale: 1.15, ease: 'out' },
  { at: 0.16, opacity: 0.94, scale: 1, ease: 'inOut' },
];
const glowIntro: Track = [
  { at: 0.5, opacity: 0 }, { at: 0.74, opacity: 0.6, ease: 'out' },
  { at: 0.88, opacity: 1, scale: 1.15, ease: 'out' }, { at: 1, opacity: 1, scale: 1, ease: 'inOut' },
];
const comp = (c: Comp, focus: [number, number]) => {
  const i = introFor(c);
  const live: Record<string, Partial<LayerDef>> = {
    'window-glow': { live: { className: 'amb-flicker-c', style: { '--amb-dur': '3.1s' } as CSSProperties }, track: glowT, intro: glowIntro },
    'mist-far': { live: { className: 'amb-drift-c', style: { '--amb-dur': '26s', '--amb-x': '90px' } as CSSProperties }, track: [{ at: 0, x: 0, opacity: 1 }, { at: 0.6, x: -220, opacity: 0.35, ease: 'inOut' }] },
  };
  for (const [k, v] of Object.entries(live)) i[k] = { ...i[k], ...v };
  return world(manifest, c, SCREENS, { focus, first: true, close: c === 'desktop' ? 520 : 300, extra: { ...i, dust: { highOnly: true }, 'dust-p': { highOnly: true } } });
};
const desktop = comp('desktop', [1262, 560]);
const portrait = comp('portrait', [556, 830]);
// Name is there on arrival and sinks away before the dive; the label is lit from the start and leaves with it.
const nameT: Track = [{ at: 0, opacity: 1 }, { at: 0.3, opacity: 1, y: 0 }, { at: 0.44, opacity: 1, y: 60, ease: 'in' }, { at: 0.445, opacity: 0, y: 60 }];
const labelT: Track = [{ at: 0, opacity: 1, y: 0 }, { at: 0.32, opacity: 1, y: 0 }, { at: 0.42, opacity: 1, y: -30, ease: 'in' }, { at: 0.425, opacity: 0, y: -30 }];
const nameIntro: Track = [{ at: 0.64, y: 90, opacity: 0 }, { at: 0.88, y: 0, opacity: 1, ease: 'out' }];
const labelIntro: Track = [{ at: 0.82, y: 14, opacity: 0 }, { at: 1, y: 0, opacity: 1, ease: 'out' }];
const mothIntro: Track = [{ at: 0.5, opacity: 0 }, { at: 0.85, opacity: 1 }];
const starsIntro: Track = [{ at: 0.3, opacity: 0 }, { at: 0.55, opacity: 1 }];
const stars = (c: typeof desktop, sky: string, rect: { x: number; y: number; w: number; h: number }) => ({
  ...onLayer(c, sky, rect, <Particles sprite="star-glint" n={16} kind="twinkle" seed={5} size={[0.7, 1.5]} lite />, { behind: true }),
  intro: starsIntro,
});
const starsFar = (c: typeof desktop, sky: string, rect: { x: number; y: number; w: number; h: number }) => ({
  ...onLayer(c, sky, rect, <Particles sprite="star-glint" n={14} kind="twinkle" seed={11} size={[0.5, 1]} dur={[3.5, 6]} />, { behind: true }),
  highOnly: true,
  intro: starsIntro,
});

export const b0Outside: BeatDef = {
  slug: 'b0-outside',
  screens: SCREENS,
  manifest,
  intro: { ms: INTRO_MS },
  desktop: {
    ...desktop,
    split: 'range-far',
    overlays: [
      stars(desktop, 'sky', { x: 380, y: 10, w: 1240, h: 520 }),
      starsFar(desktop, 'sky', { x: 380, y: 10, w: 1240, h: 520 }),
      { ...onLayer(desktop, 'range-far', { x: 500, y: 40, w: 860, h: 330 }, name, { behind: true, track: nameT }), intro: nameIntro },
      { ...onLayer(desktop, 'window-glow', { x: 1278, y: 470, w: 390, h: 170 }, label, { track: labelT }), intro: labelIntro },
      { node: moth, rect: { x: 1250, y: 180, w: 300, h: 200 }, parallax: 0.2, track: [{ at: 0, x: 0, y: 0 }, { at: 0.9, x: 510, y: 120 }], intro: mothIntro },
    ],
  },
  portrait: {
    ...portrait,
    split: 'range-far-p',
    overlays: [
      stars(portrait, 'sky-p', { x: 80, y: 40, w: 920, h: 700 }),
      starsFar(portrait, 'sky-p', { x: 80, y: 40, w: 920, h: 700 }),
      { ...onLayer(portrait, 'range-far-p', { x: 210, y: 330, w: 680, h: 300 }, nameP, { behind: true, track: nameT }), intro: nameIntro },
      { ...onLayer(portrait, 'window-glow', { x: 600, y: 800, w: 460, h: 90 }, label, { track: labelT }), intro: labelIntro },
      { node: moth, rect: { x: 600, y: 250, w: 260, h: 173 }, parallax: 0.2, track: [{ at: 0, x: 0, y: 0 }, { at: 0.9, x: 380, y: 110 }], intro: mothIntro },
    ],
  },
};
