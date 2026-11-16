'use client';
// b8: the seam. Choreography from ../transitions. Hero: the camera pulls back through seven nested
// paper folds (outer folds move most), showing the whole world was one folded sheet.
// Text: four leadership roles, one at a time, each with its numbers stamped in (see <Spotlight>).
import type { BeatDef, Comp, Keyframe, LayerDef } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b8-seam/manifest.json';
import { useLang } from '../lang';
import { SectionHeading, Spotlight, slots } from '../SceneText';
import { onLayer, world } from '../transitions';

const SCREENS = 2.3;

// Four slots between the gates parting (0.13) and the dive (0.74): the last is out by 0.79.
const W = 0.11, at = slots(4, 0.13, W, 0.055);
const text = <Spotlight slug="b8-seam" roles={scenes.b8} at={at} w={W} paper />;
// The Spotlight shows only its active role, so this window just keeps the whole block out of the gate frames.
const shown: Keyframe[] = [{ at: 0.12, opacity: 0 }, { at: 0.13, opacity: 1 }, { at: 0.81, opacity: 1 }, { at: 0.82, opacity: 0 }];

function Head({ p = false }: { p?: boolean }) {
  const { lang } = useLang();
  const size = p ? (lang === 'id' ? 'text-[10.5cqw]' : 'text-[12.5cqw]') : lang === 'id' ? 'text-[11.5cqw]' : 'text-[16cqw]';
  return <SectionHeading slug="b8-seam" size={size} className="text-[#fff4de]" />;
}
const head = <Head />;
const headP = <Head p />;

const extra: Record<string, LayerDef> = { 'paper-dust': { highOnly: true }, 'paper-dust-p': { highOnly: true } };
// Gates close less than the default, so the folds stay visible between them.
const comp = (c: Comp, focus: [number, number], close: number) => world(manifest, c, SCREENS, { focus, push: -0.9, close, extra });
const desktop = comp('desktop', [1270, 500], 400);
const portrait = comp('portrait', [548, 660], 150);
const headT: Keyframe[] = [{ at: 0.13, opacity: 0 }, { at: 0.14, opacity: 1 }, { at: 0.8, opacity: 1 }, { at: 0.81, opacity: 0 }];

export const b8Seam: BeatDef = {
  slug: 'b8-seam',
  screens: SCREENS,
  manifest,
  // focus = the lit window of the miniature mountain; text on the dark left page, clear of the folds.
  // The heading sits on the left page; the near drape (gate-l) passes over its first letters.
  desktop: {
    ...desktop,
    split: 'creases',
    overlays: [
      onLayer(desktop, 'creases', { x: 370, y: 760, w: 520, h: 200 }, head, { behind: true, track: headT }),
      { node: text, className: 'left-[7vw] top-[11vh] w-[min(42vw,40rem)] text-[#fff4de]', track: shown },
    ],
  },
  portrait: {
    ...portrait,
    split: 'creases-p',
    overlays: [
      onLayer(portrait, 'creases-p', { x: 170, y: 430, w: 740, h: 150 }, headP, { behind: true, track: headT }),
      { node: text, className: 'left-[10vw] right-[10vw] bottom-[12svh] text-[#fff4de]', track: shown },
    ],
  },
};
