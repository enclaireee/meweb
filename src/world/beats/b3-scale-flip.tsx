'use client';
// b3: the vast hall. Choreography from ../transitions. Hero: the steepest dolly of any beat, down the hall to the far arch.
// Text: "Experience" set huge across the dark steps, its foot behind the near rock; one role at a time on the calm wall.
// Idle: dust motes drift up through the light shafts.
import type { BeatDef, Comp, LayerDef, Track } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b3-scale-flip/manifest.json';
import { Particles } from '../Ambient';
import { useLang } from '../lang';
import { SectionHeading, Spotlight, slots } from '../SceneText';
import { onLayer, world } from '../transitions';

const SCREENS = 1.9;

// One role at a time on the calm wall (desktop) / dark floor (portrait): see <Spotlight>.
// Roles arrive after the gates part (t 0.16) and the last has left before the dive (t 0.68).
const W = 0.21, at = slots(2, 0.16, W, 0.06);
const text = <Spotlight slug="b3-scale-flip" roles={scenes.b3} at={at} w={W} paper />;

// "Pengalaman" is wider than "Experience": a smaller size keeps it inside its rect.
function Heading({ en, id }: { en: string; id: string }) {
  const { lang } = useLang();
  return <SectionHeading slug="b3-scale-flip" size={lang === 'id' ? id : en} align="end" className="text-[#f3e4c4]" />;
}
const heading = <Heading en="text-[13.5cqw]" id="text-[12cqw]" />;
const headingP = <Heading en="text-[14cqw]" id="text-[12.5cqw]" />;

const extra: Record<string, LayerDef> = { dust: { highOnly: true }, 'dust-p': { highOnly: true } };
const comp = (c: Comp, focus: [number, number]) => world(manifest, c, SCREENS, { focus, push: 0.32, close: c === 'desktop' ? 300 : 190, extra });
const desktop = comp('desktop', [720, 520]);
const portrait = comp('portrait', [540, 640]);

const headT: Track = [{ at: 0.1, y: 60, opacity: 0 }, { at: 0.115, y: 55, opacity: 1 }, { at: 0.2, y: 0, ease: 'out' }, { at: 0.6, y: 0 }, { at: 0.68, y: 50, opacity: 1, ease: 'in' }, { at: 0.685, y: 50, opacity: 0 }];
const motesT: Track = [{ at: 0.1, opacity: 0 }, { at: 0.24, opacity: 1 }, { at: 0.62, opacity: 1 }, { at: 0.72, opacity: 0 }];
const motes = (c: typeof desktop, id: string, rect: { x: number; y: number; w: number; h: number }) => [
  onLayer(c, id, rect, <Particles sprite="mote" kind="rise" n={8} seed={3} size={[0.5, 1]} lite />, { behind: true, track: motesT }),
  { ...onLayer(c, id, rect, <Particles sprite="mote" kind="rise" n={9} seed={9} size={[0.4, 0.8]} />, { behind: true, track: motesT }), highOnly: true },
];

export const b3ScaleFlip: BeatDef = {
  slug: 'b3-scale-flip',
  screens: SCREENS,
  rests: at.map((a) => a + (0.05 + W) / 2), // each role fully in
  manifest,
  // calm zone: the right wall on desktop; on portrait the dark floor at the bottom (art brief)
  desktop: {
    ...desktop,
    split: 'rock-near',
    overlays: [
      ...motes(desktop, 'shafts', { x: 362, y: 166, w: 556, h: 724 }),
      onLayer(desktop, 'rock-near', { x: 720, y: 770, w: 700, h: 200 }, heading, { behind: true, track: headT }),
      { node: text, className: 'right-[6vw] top-[9vh] w-[min(44vw,46rem)]' },
    ],
  },
  portrait: {
    ...portrait,
    split: 'roots-near-p',
    overlays: [
      ...motes(portrait, 'shafts-p', { x: 232, y: 248, w: 606, h: 664 }),
      onLayer(portrait, 'roots-near-p', { x: 170, y: 430, w: 740, h: 170 }, headingP, { behind: true, track: headT }),
      { node: text, className: 'left-[10vw] right-[10vw] bottom-[12svh]' },
    ],
  },
};
