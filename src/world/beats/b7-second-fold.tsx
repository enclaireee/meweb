'use client';
// b7: the inner mountain unfolds onto dawn (the colour flip). Choreography from ../transitions. Flaps hinge on their outer edge, as in b2.
import type { BeatDef, Comp, Keyframe, LayerDef } from '@/engine';
import { scenes } from '@/content';
import manifest from '../../../public/art/b7-second-fold/manifest.json';
import whale from '../../../public/art/creatures/whale/manifest.json';
import { Creature } from '../Creature';
import { useT } from '../lang';
import { At, Kicker, seq } from '../SceneText';
import { world } from '../transitions';

// Text: a wall of small brass plates, like a trophy case. Each blank plate engraves itself letter by
// letter as you reach it, then its detail is stamped underneath.
function Awards() {
  const t = useT();
  return (
    <div aria-hidden className="flex flex-col gap-[2.4vh]">
      <div className="beat-text"><Kicker slug="b7-second-fold" /></div>
      <ol className="grid grid-cols-2 gap-[1.4vw] portrait:gap-3">
        {scenes.b7.map((a, i) => {
          const from = 0.24 + 0.11 * i, title = [...t(a.title)], at = seq(title.length, from, from + 0.07);
          return (
            <li key={i} className="plate flex min-h-[8.5rem] flex-col justify-center gap-2 px-[1.6vw] py-[2.2vh] portrait:min-h-[6.5rem] portrait:px-4">
              <span className="text-[0.65rem] tracking-[0.3em] tabular-nums opacity-60">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display text-[clamp(1.35rem,2.2vw,2.5rem)] leading-[1.02] portrait:text-[clamp(1.1rem,5vw,1.6rem)]">
                {title.map((c, j) => <At key={j} a={at[j]!} d={0.012} k="etch">{c}</At>)}
              </span>
              <At a={from + 0.075} d={0.03} k="etch" className="text-[clamp(0.7rem,0.85vw,0.85rem)] leading-snug opacity-80">{t(a.detail)}</At>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
const text = <Awards />;
// In after the flaps start, out before the dive (1 - 0.6 / SCREENS).
const textT: Keyframe[] = [{ at: 0.1, opacity: 0, y: 28 }, { at: 0.22, opacity: 1, y: 0, ease: 'out' }, { at: 0.75, opacity: 1, y: 0 }, { at: 0.82, opacity: 0, y: -20, ease: 'in' }];
// Creature box of width w whose anchor point sits at (ax, ay); height follows the sprite frame.
const box = (ax: number, ay: number, w: number) => {
  const [cx, cy] = whale.anchor as [number, number];
  const k = w / whale.frame.w;
  return { x: ax - cx * k, y: ay - cy * k, w, h: whale.frame.h * k };
};
const SCREENS = 3.5;
const fish = <Creature sheet={whale} ms={5000} />;

const open = (deg: number): LayerDef['track'] => [{ at: 0.22, rotateY: 0 }, { at: 0.6, rotateY: deg, ease: 'inOut' }];
// The crack shows first, then gives way to the flood of dawn as the flaps open.
const crack: LayerDef['track'] = [{ at: 0.1, opacity: 0 }, { at: 0.22, opacity: 1 }, { at: 0.5, opacity: 0, ease: 'in' }];
const extra: Record<string, LayerDef> = {
  'seam-glow': { track: [{ at: 0.12, opacity: 0 }, { at: 0.5, opacity: 1, ease: 'out' }] },
  mist: { track: [{ at: 0, x: 0 }, { at: 1, x: -80 }] },
};
for (const s of ['', '-p']) {
  extra[`inner-flap-l${s}`] = { origin: '0% 50%', track: open(-75) };
  extra[`inner-flap-r${s}`] = { origin: '100% 50%', track: open(75) };
  extra[`seam-light${s}`] = { track: crack };
  extra[`dust${s}`] = { highOnly: true };
}
const comp = (c: Comp, focus: [number, number]) => world(manifest, c, SCREENS, { focus, extra });
// Revealed once the flaps pass about 40 degrees, then glides.
const glide: LayerDef['track'] = [{ at: 0.4, x: -60, opacity: 0 }, { at: 0.56, x: -20, opacity: 1 }, { at: 0.92, x: 70, opacity: 1 }, { at: 1, x: 90, opacity: 0 }];

export const b7SecondFold: BeatDef = {
  slug: 'b7-second-fold',
  screens: SCREENS,
  manifest,
  // calm zone is the cavern wall on the right
  desktop: {
    ...comp('desktop', [760, 520]),
    overlays: [
      { node: fish, rect: box(480, 280, 1000), parallax: 0.2, track: glide },
      { node: text, className: 'left-[55vw] top-[18vh] w-[min(40vw,46rem)]', track: textT },
    ],
  },
  portrait: {
    ...comp('portrait', [540, 560]),
    overlays: [
      { node: fish, rect: box(540, 330, 760), parallax: 0.2, track: glide },
      { node: text, className: 'left-[8vw] right-[8vw] bottom-[7svh]', track: textT },
    ],
  },
};
